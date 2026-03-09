"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Discover() {
  const [videos, setVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Get current logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user ?? null);
    });
  }, []);

  // Load already-purchased video IDs for current user
  useEffect(() => {
    if (!currentUser) return;
    supabase
      .from("purchases")
      .select("video_id")
      .eq("buyer_id", currentUser.id)
      .eq("status", "completed")
      .then(({ data }) => {
        if (data) setPurchasedIds(new Set(data.map((p: any) => p.video_id)));
      });
  }, [currentUser]);

  const load = async () => {
    let query = supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("title", `%${search}%`);
    if (minPrice !== "") query = query.gte("price", minPrice);
    if (maxPrice !== "") query = query.lte("price", maxPrice);

    const { data: vids } = await query;
    if (!vids) { setVideos([]); return; }

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
      const creator = (profiles || []).find((p) => p.id === v.creator_id);
      const videoRatings = (ratings || []).filter((r) => r.video_id === v.id);
      const avgRating = videoRatings.length > 0
        ? (videoRatings.reduce((sum, r) => sum + r.rating, 0) / videoRatings.length).toFixed(1)
        : null;
      return { ...v, creator, avgRating, ratingCount: videoRatings.length };
    });

    const filtered = minRating !== null
      ? enriched.filter((v) => v.avgRating !== null && Number(v.avgRating) >= minRating)
      : enriched;

    setVideos(filtered);
  };

  useEffect(() => {
    load();
  }, [search, minPrice, maxPrice, minRating]);

  // ============================
  // 🛒 BUY HANDLER
  // ============================
  const handleBuy = async (e: React.MouseEvent, video: any) => {
    e.preventDefault();

    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    if (purchasedIds.has(video.id)) {
      window.location.href = `/watch/${video.id}`;
      return;
    }

    setBuyingId(video.id);

    try {
      const res = await fetch("/api/buy-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-order",
          video_id: video.id,
          buyer_id: currentUser.id,
        }),
      });

      if (!res.ok) {
        alert("Failed to create order. Please try again.");
        setBuyingId(null);
        return;
      }

      const { order } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Zelteb",
        description: video.title,
        order_id: order.id,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/buy-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify-payment",
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              video_id: video.id,
              buyer_id: currentUser.id,
            }),
          });

          if (verifyRes.ok) {
            setPurchasedIds((prev) => new Set([...prev, video.id]));
            window.location.href = `/watch/${video.id}`;
          } else {
            const msg = await verifyRes.text();
            alert("Payment verification failed: " + msg);
          }
        },
        prefill: {
          email: currentUser.email ?? "",
        },
        theme: { color: "#e91e8c" },
        modal: {
          ondismiss: () => setBuyingId(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert("Something went wrong: " + err.message);
      setBuyingId(null);
    }
  };

  const renderStars = (rating: number, size = 14) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i < Math.floor(rating) ? "#1a1a1a" : "none"}
        stroke="#1a1a1a" strokeWidth="1.5" style={{ display: "inline-block" }}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ));
  };

  const ratingOptions = [4, 3, 2, 1];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", background: "#f4f3f0", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        .card { background: white; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; text-decoration: none; color: inherit; display: block; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .filter-section { border-top: 1px solid #e5e5e5; padding: 14px 0; }
        .filter-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 0 4px; font-size: 15px; font-weight: 500; }
        .price-input { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px; gap: 8px; font-size: 14px; }
        .price-input input { border: none; outline: none; width: 100%; font-size: 14px; background: transparent; }
        .price-circle { width: 28px; height: 28px; border: 1px solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; flex-shrink: 0; }
        .rating-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 4px; cursor: pointer; }
        .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #ccc; transition: all 0.15s; flex-shrink: 0; }
        .radio-circle.selected { border-color: #1a1a1a; background: #1a1a1a; box-shadow: inset 0 0 0 3px white; }
        .price-tag { display: inline-flex; align-items: center; background: #e91e8c; color: white; font-weight: 600; font-size: 13px; padding: 5px 14px 5px 10px; clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%); }
        .creator-pill { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: #333; font-size: 12px; font-weight: 500; transition: color 0.15s; }
        .creator-pill:hover { color: #000; text-decoration: underline; }
        .creator-avatar { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #e879f9); display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden; }
        .creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      {/* NAVBAR */}
      <header style={{ background: "white", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
          <Link href="/" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#000", textDecoration: "none" }}>
            Zelteb
          </Link>
          <nav style={{ display: "flex", gap: 40, fontSize: 15, fontWeight: 500 }}>
            <Link href="/" style={{ color: "#666", textDecoration: "none" }}>Home</Link>
            <Link href="/discover" style={{ color: "#000", textDecoration: "none" }}>Discover</Link>
            <Link href="/purchased" style={{ color: "#000", textDecoration: "none" }}>Purchased</Link>
          </nav>
          <Link href="/dashboard" style={{ padding: "10px 24px", borderRadius: 999, background: "#000", color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Search */}
        <input
          placeholder="Search marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 28, background: "white", outline: "none" }}
        />

        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          {/* Filters */}
          <div style={{ width: 240, flexShrink: 0, background: "white", borderRadius: 12, padding: "8px 16px" }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "10px 4px 6px" }}>Filters</p>

            <div className="filter-section">
              <div className="filter-header" onClick={() => setPriceOpen(!priceOpen)}>
                <span>Price</span>
              </div>
              {priceOpen && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="price-input">
                    <div className="price-circle">₹</div>
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                  <div className="price-input">
                    <div className="price-circle">₹</div>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>

            <div className="filter-section">
              <div className="filter-header" onClick={() => setRatingOpen(!ratingOpen)}>
                <span>Rating</span>
              </div>
              {ratingOpen && (
                <div style={{ marginTop: 10 }}>
                  {ratingOptions.map((r) => (
                    <div key={r} className="rating-row" onClick={() => setMinRating(minRating === r ? null : r)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {renderStars(r, 14)}
                        <span style={{ fontSize: 12, color: "#555", marginLeft: 4 }}>and up</span>
                      </div>
                      <div className={`radio-circle ${minRating === r ? "selected" : ""}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            {videos.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                <p style={{ fontSize: 16 }}>No products found</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {videos.map((v) => {
                const alreadyPurchased = purchasedIds.has(v.id);
                const isLoading = buyingId === v.id;
                const isFree = v.is_free || Number(v.price) === 0;
                const isOwner = currentUser?.id === v.creator_id;

                return (
                  <div key={v.id} className="card" onClick={() => {
                    if (isOwner) { window.location.href = `/watch/${v.id}`; return; }
                    if (alreadyPurchased || isFree) { window.location.href = `/watch/${v.id}`; return; }
                    handleBuy({ preventDefault: () => {} } as any, v);
                  }}>
                    {/* Thumbnail */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#1a1a1a" }}>
                      {v.thumbnail_url
                        ? <img src={v.thumbnail_url} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                            {v.product_type === "video" ? "🎬" : "📁"}
                          </div>
                      }
                    </div>

                    <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 0 }}>

                      {/* 1. Title */}
                      <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px", lineHeight: 1.4 }}>
                        {v.title}
                      </p>

                      {/* 2. Creator */}
                      <div style={{ marginBottom: 8, minHeight: 24, display: "flex", alignItems: "center" }}>
                        {v.creator && (
                          <div
                            onClick={(e) => { e.stopPropagation(); window.location.href = `/${v.creator.username}`; }}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                          >
                            <div className="creator-avatar">
                              {v.creator.avatar_url
                                ? <img src={v.creator.avatar_url} alt={v.creator.username} />
                                : (v.creator.full_name || v.creator.username || "?")[0].toUpperCase()
                              }
                            </div>
                            <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>
                              {v.creator.full_name || v.creator.username}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 3. Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, minHeight: 20 }}>
                        {v.avgRating ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{v.avgRating}</span>
                            <span style={{ fontSize: 11, color: "#999" }}>({v.ratingCount})</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: "#bbb" }}>No reviews yet</span>
                        )}
                      </div>

                      {/* 4. Price tag */}
                      <div>
                        <span className="price-tag">
                          {isFree ? "Free" : `₹${v.price || 0}`}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}