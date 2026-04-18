"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function Page() {
  const [videos, setVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load Razorpay safely
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user ?? null);
    });
  }, []);

  // Purchased
  useEffect(() => {
    if (!currentUser) return;

    supabase
      .from("purchases")
      .select("video_id")
      .eq("buyer_id", currentUser.id)
      .eq("status", "completed")
      .then(({ data, error }) => {
        if (error) return console.error(error);
        if (data) setPurchasedIds(new Set(data.map((p: any) => p.video_id)));
      });
  }, [currentUser]);

  // Load videos
  const load = async () => {
    let query = supabase.from("videos").select("*").order("created_at", { ascending: false });

    if (search) query = query.ilike("title", `%${search}%`);
    if (minPrice !== "") query = query.gte("price", minPrice);
    if (maxPrice !== "") query = query.lte("price", maxPrice);

    const { data: vids, error } = await query;

    if (error) {
      console.error(error);
      setVideos([]);
      return;
    }

    if (!vids) return;

    const creatorIds = [...new Set(vids.map((v) => v.creator_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", creatorIds);

    const videoIds = vids.map((v) => v.id);

    const { data: ratings } = await supabase
      .from("ratings")
      .select("video_id, rating")
      .in("video_id", videoIds);

    const enriched = vids.map((v) => {
      const creator = profiles?.find((p) => p.id === v.creator_id);

      const videoRatings = ratings?.filter((r) => r.video_id === v.id) || [];

      const avgRating =
        videoRatings.length > 0
          ? (videoRatings.reduce((s, r) => s + r.rating, 0) / videoRatings.length).toFixed(1)
          : null;

      return { ...v, creator, avgRating, ratingCount: videoRatings.length };
    });

    const filtered =
      minRating !== null
        ? enriched.filter((v) => v.avgRating && Number(v.avgRating) >= minRating)
        : enriched;

    setVideos(filtered);
  };

  useEffect(() => {
    load();
  }, [search, minPrice, maxPrice, minRating]);

  const handleBuy = async (video: any) => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    if (purchasedIds.has(video.id)) {
      window.location.href = `/watch/${video.slug}`;
      return;
    }

    if (!window.Razorpay) {
      alert("Payment system not loaded. Refresh.");
      return;
    }

    setBuyingId(video.id);

    try {
      const res = await fetch("/api/buy-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-order", video_id: video.id }),
      });

      const data = await res.json();

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        handler: () => window.location.reload(),
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Payment failed");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {videos.map((v) => (
          <div key={v.id} style={{ border: "1px solid #ddd", padding: 10 }}>
            <p>{v.title}</p>
            <p>₹{v.price}</p>

            <button onClick={() => handleBuy(v)}>
              {purchasedIds.has(v.id) ? "Watch" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}