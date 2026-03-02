"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Purchase {
  id: string;
  amount: number;
  created_at: string;
  videos: { title: string }[] | null;
  buyer: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  }[] | null;
}

export default function Sales() {
  const [sales, setSales] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = async (uid: string) => {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        id,
        amount,
        created_at,
        videos ( title ),
        buyer:profiles!buyer_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("creator_id", uid)
      .order("created_at", { ascending: false });

    if (!error) {
      setSales((data as Purchase[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      await loadSales(user.id);

      channel = supabase
        .channel("creator-sales")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "purchases",
            filter: `creator_id=eq.${user.id}`,
          },
          () => {
            loadSales(user.id);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const platformFee = totalRevenue * 0.06;
  const creatorEarnings = totalRevenue - platformFee;

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <h1 className="text-3xl font-semibold mb-8">Creator Earnings</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
          <p className="text-2xl font-semibold">
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-sm text-gray-500 mb-2">Your Earnings</p>
          <p className="text-2xl font-semibold text-green-600">
            ₹{creatorEarnings.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <p className="text-sm text-gray-500 mb-2">Platform Fee (6%)</p>
          <p className="text-2xl font-semibold text-red-500">
            ₹{platformFee.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-2xl shadow-sm border divide-y">
        {sales.length === 0 && (
          <div className="p-6 text-gray-500">No sales yet.</div>
        )}

        {sales.map((s) => {
          const videoTitle = s.videos?.[0]?.title || "Untitled";

          const buyerName =
            s.buyer?.[0]?.full_name ||
            s.buyer?.[0]?.username ||
            "Someone";

          return (
            <div
              key={s.id}
              className="p-6 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">{buyerName}</p>
                <p className="text-sm text-gray-500">{videoTitle}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(s.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">₹{s.amount}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}