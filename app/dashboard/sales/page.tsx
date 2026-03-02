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

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Get creator videos
    const { data: myVideos } = await supabase
      .from("videos")
      .select("id")
      .eq("creator_id", user.id);

    const videoIds = (myVideos || []).map((v: any) => v.id);

    if (!videoIds.length) {
      setSales([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("purchases")
      .select(`
        id,
        amount,
        created_at,
        videos ( title ),
        buyer:profiles!buyer_id ( username, full_name, avatar_url )
      `)
      .in("video_id", videoIds)
      .order("created_at", { ascending: false });

    if (!error) {
      setSales((data || []) as Purchase[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();

    // Realtime listener
    const channel = supabase
      .channel("sales-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "purchases",
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const platformFee = totalRevenue * 0.06;
  const creatorEarnings = totalRevenue - platformFee;

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Sales</h1>

      <div style={{ marginBottom: 30 }}>
        <p><strong>Total Revenue:</strong> ₹{totalRevenue.toFixed(2)}</p>
        <p><strong>Your Earnings:</strong> ₹{creatorEarnings.toFixed(2)}</p>
        <p><strong>Platform Fee (6%):</strong> ₹{platformFee.toFixed(2)}</p>
      </div>

      {sales.length === 0 && <p>No sales yet.</p>}

      {sales.map((s) => {
        const videoTitle = s.videos?.[0]?.title || "Unknown";
        const buyerName =
          s.buyer?.[0]?.full_name ||
          s.buyer?.[0]?.username ||
          "Someone";

        return (
          <div
            key={s.id}
            style={{
              padding: 15,
              border: "1px solid #ddd",
              marginBottom: 15,
              borderRadius: 8,
            }}
          >
            <div><strong>{buyerName}</strong></div>
            <div>{videoTitle}</div>
            <div>Paid: ₹{s.amount}</div>
            <div>
              {new Date(s.created_at).toLocaleDateString("en-IN")}
            </div>
          </div>
        );
      })}
    </div>
  );
}