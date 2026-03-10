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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user ?? null);
    });
  }, []);

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

  const handleBuy = async (e: React.MouseEvent, video: any) => {
    e.preventDefault();

    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    if (purchasedIds.has(video.id)) {
      window.location.href = `/watch/${video.slug}`;
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

      const data = await res.json();

      if (data.free) {
        setPurchasedIds((prev) => new Set([...prev, video.id]));
        window.location.href = `/watch/${video.slug}`;
        setBuyingId(null);
        return;
      }

      const { order } = data;

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
            window.location.href = `/watch/${video.slug}`;
          } else {
            const msg = await verifyRes.text();
            alert("Payment verification failed: " + msg);
          }
        },
        prefill: { email: currentUser.email ?? "" },
        theme: { color: "#e91e8c" },
        modal: { ondismiss: () => setBuyingId(null) },
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

  const FilterPanel = () => (
    <div style={{ background: "white", borderRadius: 12, padding: "8px 16px" }}>
      <p style={{ fontWeight: 600, fontSize: 15, margin: "10px 4px 6px" }}>Filters</p>
      <div className="filter-section">
        <div className="filter-header" onClick={() => setPriceOpen(!priceOpen)}>
          <span>Price</span>
          <span style={{ fontSize: 12, color: "#999" }}>{priceOpen ? "▲" : "▼"}</span>
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
          <span style={{ fontSize: 12, color: "#999" }}>{ratingOpen ? "▲" : "▼"}</span>
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
  );

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
        .creator-avatar { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #e879f9); display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden; }
        .creator-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Desktop sidebar */
        .desktop-filters { display: block; width: 240px; flex-shrink: 0; }
        /* Mobile filter button */
        .mobile-filter-btn { display: none; }
        /* Mobile filter drawer overlay */
        .filter-overlay { display: none; }

        @media (max-width: 768px) {
          .discover-navbar-inner { padding: 14px 16px !important; }
          .discover-nav-links { display: none !important; }
          .discover-logo { font-size: 22px !important; }
          .discover-dashboard-btn { padding: 8px 16px !important; font-size: 13px !important; }
          .discover-content { padding: 16px 16px 0 !important; }
          .discover-layout { flex-direction: column !important; gap: 12px !important; }
          .desktop-filters { display: none !important; }
          .mobile-filter-btn {
            display: flex !important;
            align-items: center;
            gap: 6px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 12px;
          }
          .filter-overlay {
            display: flex !important;
            position: fixed;
            inset: 0;
            z-index: 100;
            background: rgba(0,0,0,0.4);
            align-items: flex-end;
          }
          .filter-drawer {
            background: white;
            width: 100%;
            border-radius: 20px 20px 0 0;
            padding: 20px 16px 32px;
            max-height: 80vh;
            overflow-y: auto;
          }
          .filter-drawer-handle {
            width: 40px; height: 4px; background: #ddd; border-radius: 99px;
            margin: 0 auto 16px;
          }
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }

        @media (max-width: 380px) {
          .cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={{ background: "white", borderBottom: "1px solid #f0f0f0" }}>
        <div className="discover-navbar-inner" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
          <Link href="/" className="discover-logo" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#000", textDecoration: "none" }}>
            Zelteb
          </Link>
          <nav className="discover-nav-links" style={{ display: "flex", gap: 40, fontSize: 15, fontWeight: 500 }}>
            <Link href="/" style={{ color: "#666", textDecoration: "none" }}>Home</Link>
            <Link href="/discover" style={{ color: "#000", textDecoration: "none" }}>Discover</Link>
            <Link href="/purchased" style={{ color: "#000", textDecoration: "none" }}>Purchased</Link>
          </nav>
          <Link href="/dashboard" className="discover-dashboard-btn" style={{ padding: "10px 24px", borderRadius: 999, background: "#000", color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </header>

      <div className="discover-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Search */}
        <input
          placeholder="Search marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 16, background: "white", outline: "none" }}
        />

        {/* Mobile filter button */}
        <button className="mobile-filter-btn" onClick={() => setFilterDrawerOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {(minPrice !== "" || maxPrice !== "" || minRating !== null) && (
            <span style={{ background: "#e91e8c", color: "white", borderRadius: "99px", fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>
              {[minPrice !== "", maxPrice !== "", minRating !== null].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Mobile filter drawer */}
        {filterDrawerOpen && (
          <div className="filter-overlay" onClick={() => setFilterDrawerOpen(false)}>
            <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="filter-drawer-handle" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Filters</span>
                <button onClick={() => setFilterDrawerOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>✕</button>
              </div>
              <FilterPanel />
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ width: "100%", marginTop: 16, padding: "12px", background: "#000", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                Show results
              </button>
            </div>
          </div>
        )}

        <div className="discover-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          {/* Desktop Filters */}
          <div className="desktop-filters">
            <FilterPanel />
          </div>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            {videos.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                <p style={{ fontSize: 16 }}>No products found</p>
              </div>
            )}

            <div className="cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {videos.map((v) => {
                const alreadyPurchased = purchasedIds.has(v.id);
                const isLoading = buyingId === v.id;
                const isFree = v.is_free || Number(v.price) === 0;
                const isOwner = currentUser?.id === v.creator_id;

                return (
                  <div
  key={v.id}
  className="card"
  onClick={() => {
    window.location.href = `/product/${v.slug}`;
  }}
>
  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#1a1a1a" }}>
    {v.thumbnail_url && v.thumbnail_url.trim() !== ""
      ? <img 
          src={v.thumbnail_url} 
          alt={v.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
          {v.product_type === "video" ? "🎬" : "📁"}
        </div>
    }
  </div>
                    <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px", lineHeight: 1.4 }}>
                        {v.title}
                      </p>

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