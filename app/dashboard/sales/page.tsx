"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Purchase {
  id: string;
  amount: number;
  created_at: string;
  customer_note?: string;
  file_url?: string;
  videos: { title: string }[] | null;
  buyer: { username: string; full_name: string | null }[] | null;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New States for capturing Buyer Information
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSales = async (uid: string) => {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        id, amount, created_at, customer_note, file_url,
        videos ( title ),
        buyer:profiles!buyer_id ( username, full_name )
      `)
      .eq("creator_id", uid)
      .order("created_at", { ascending: false });

    if (!error) setSales((data as any) || []);
    setLoading(false);
  };

  // Logic to handle the Buyer's Upload
  const handleBuyerSubmit = async () => {
    if (!file) return alert("Please select a file to upload first.");
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("You must be logged in to submit.");

    // 1. Upload file to Storage
    const fileName = `buyer-uploads/${user.id}-${Date.now()}-${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("videos") // Ensure this bucket exists and is public/accessible
      .upload(fileName, file);

    if (storageError) {
      alert(storageError.message);
      setUploading(false);
      return;
    }

    // 2. Get Public URL
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);

    // 3. Save to Purchases Table
    const { error: dbError } = await supabase.from("purchases").insert({
      buyer_id: user.id,
      amount: 0, // Set this based on your pricing logic
      customer_note: note,
      file_url: urlData.publicUrl,
      creator_id: "REPLACE_WITH_CREATOR_ID" // This needs to be the ID of the seller
    });

    if (dbError) alert(dbError.message);
    else alert("Information submitted successfully!");

    setUploading(false);
    setFile(null);
    setNote("");
    loadSales(user.id);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadSales(user.id);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="p-10">Loading Sales Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Sales & Submissions</h1>

        {/* SECTION 1: CUSTOMER INPUT FORM (The "Missing" part) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-10">
          <h2 className="text-lg font-semibold mb-4">Submit Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note to Creator</label>
              <textarea 
                className="w-full border rounded-lg p-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter details about your order..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
            >
              <p className="text-gray-500">{file ? `Selected: ${file.name}` : "Click to upload your file"}</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button 
              onClick={handleBuyerSubmit}
              disabled={uploading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {uploading ? "Uploading..." : "Submit Order Information"}
            </button>
          </div>
        </div>

        {/* SECTION 2: SALES LIST */}
        <div className="bg-white rounded-2xl shadow-sm border divide-y overflow-hidden">
          <div className="p-4 bg-gray-50 font-medium text-gray-500 text-sm">Recent Sales</div>
          {sales.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No sales data found.</div>
          ) : (
            sales.map((s) => (
              <div key={s.id} className="p-6 flex justify-between items-start hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold text-gray-900">{s.buyer?.[0]?.full_name || "Guest Buyer"}</p>
                  <p className="text-sm text-blue-600">{s.videos?.[0]?.title}</p>
                  {s.customer_note && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{s.customer_note}"</p>
                  )}
                  {s.file_url && (
                    <a href={s.file_url} target="_blank" className="text-xs text-blue-500 underline mt-2 block">
                      View Customer Attachment
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{s.amount}</p>
                  <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}