"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Video { title: string; creator_id: string; }
interface Buyer { username: string; full_name: string | null; avatar_url: string | null; }
interface Purchase {
  id: string;
  amount: number;
  creator_earnings: number;
  created_at: string;
  videos: Video | Video[] | null;
  buyer: Buyer | Buyer[] | null;
}
function first<T>(val: T | T[] | null): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

export default function Dashboard() {
  const router = useRouter();

  const [period, setPeriod] = useState("Last 30 days");
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const options = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"];

  // Load profile + purchases
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { router.push("/"); return; }

      const uid = authData.user.id;
      setUserId(uid);

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", uid)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      // Step 1: get all video IDs that belong to this creator
      const { data: myVideos } = await supabase
        .from("videos")
        .select("id")
        .eq("creator_id", uid);

      const videoIds = (myVideos || []).map((v: any) => v.id);

      let purchaseData: any[] = [];
      if (videoIds.length > 0) {
        // Step 2: get purchases for those video IDs
        const { data } = await supabase
          .from("purchases")
          .select(`
            id,
            amount,
            creator_earnings,
            created_at,
            videos ( title, creator_id ),
            buyer:profiles!buyer_id ( username, full_name, avatar_url )
          `)
          .in("video_id", videoIds)
          .order("created_at", { ascending: false });
        purchaseData = data || [];
      }

      const rows = (purchaseData || []) as Purchase[];
      setPurchases(rows);
      setLoading(false);
    };

    loadData();
  }, [router]);

  // Realtime profile update
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`profile-${userId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles",
        filter: `id=eq.${userId}`,
      }, (payload) => {
        if (payload.new?.username !== undefined) setUsername(payload.new.username);
        if (payload.new?.avatar_url !== undefined) setAvatarUrl(payload.new.avatar_url);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Filter purchases by period
  const filteredPurchases = purchases.filter((p) => {
    if (period === "All time") return true;
    const days = period === "Last 7 days" ? 7 : period === "Last 30 days" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(p.created_at) >= cutoff;
  });

  // Use creator_earnings from DB
  const filteredEarnings = filteredPurchases.reduce((sum, p) => sum + (p.creator_earnings ?? 0), 0);
  const filteredTotal = filteredPurchases.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 text-xl font-bold">
                {username?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hi, {username || "there"}</h1>
            <p className="text-gray-400 text-sm">zelteb.com/{username || "username"}</p>
          </div>
        </div>
        <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-900 transition">
          Share page
        </button>
      </div>

      {/* Earnings */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Earnings</h2>
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="border rounded-full px-4 py-1.5 text-sm font-medium text-gray-700"
            >
              {period}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-10">
                {options.map((o) => (
                  <button key={o} onClick={() => { setPeriod(o); setOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-5xl font-black mb-6">₹{filteredEarnings.toFixed(2)}</p>

        <div className="flex gap-6 text-sm text-gray-600">
          <div>₹{filteredTotal.toFixed(2)} Products</div>
        </div>
      </div>

      {/* Transactions table — always shown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Recent Purchases</h2>
        </div>

        {filteredPurchases.length === 0 ? (
          /* Empty state as a table-style placeholder */
          <div className="divide-y divide-gray-50">
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-2.5 bg-gray-100 rounded w-10 ml-auto" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-2.5 bg-gray-100 rounded w-10 ml-auto" />
                </div>
              </div>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-sm font-semibold text-gray-400">No transactions yet</p>
              <p className="text-xs text-gray-300 mt-1">Share your page with your audience to get started.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredPurchases.map((p) => {
              const video = first(p.videos);
              const buyer = first(p.buyer);
              const buyerName = buyer?.full_name || buyer?.username || "Someone";
              const buyerInitial = buyerName[0]?.toUpperCase() ?? "?";
              const productTitle = video?.title || "Unknown product";
              const date = p.created_at
                ? new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : "";
              const earn = p.creator_earnings ?? 0;

              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Buyer avatar */}
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {buyer?.avatar_url ? (
                      <img src={buyer.avatar_url} alt={buyerName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-amber-700 font-bold text-sm">{buyerInitial}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {buyerName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {productTitle} · {date}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">+₹{earn.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">₹{p.amount} paid</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}