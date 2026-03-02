"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Discover() {
  const [videos, setVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"Curated" | "Trending" | "Hot & New">("Curated");
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);

  const load = async () => {
    let query = supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("title", `%${search}%`);
    if (minPrice !== "") query = query.gte("price", minPrice);
    if (maxPrice !== "") query = query.lte("price", maxPrice);
    if (minRating !== null) query = query.gte("rating", minRating);

    const { data } = await query;
    setVideos(data || []);
  };

  useEffect(() => { load(); }, [search, minPrice, maxPrice, minRating]);

  const renderStars = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={i < Math.floor(rating) ? "#1a1a1a" : "none"}
        stroke="#1a1a1a"
        strokeWidth="1.5"
        style={{ display: "inline-block" }}
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ));
  };

  const ratingOptions = [4, 3, 2, 1];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f4f3f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .tab-btn { background: none; border: 1px solid transparent; cursor: pointer; padding: 8px 20px; border-radius: 999px; font-family: inherit; font-size: 14px; font-weight: 500; color: #555; transition: all 0.15s; }
        .tab-btn.active { border-color: #1a1a1a; color: #1a1a1a; background: white; }
        .tab-btn:hover:not(.active) { color: #1a1a1a; }
        .card { background: white; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; text-decoration: none; color: inherit; display: block; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .filter-section { border-top: 1px solid #e5e5e5; padding: 14px 0; }
        .filter-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 0 4px; font-size: 15px; font-weight: 500; }
        .price-input { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px; gap: 8px; font-family: inherit; font-size: 14px; }
        .price-input input { border: none; outline: none; width: 100%; font-family: inherit; font-size: 14px; background: transparent; }
        .price-circle { width: 28px; height: 28px; border: 1px solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; flex-shrink: 0; }
        .rating-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 4px; cursor: pointer; }
        .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #ccc; transition: all 0.15s; flex-shrink: 0; }
        .radio-circle.selected { border-color: #1a1a1a; background: #1a1a1a; box-shadow: inset 0 0 0 3px white; }
        .price-tag { display: inline-flex; align-items: center; background: #e91e8c; color: white; font-weight: 600; font-size: 13px; padding: 5px 14px 5px 10px; clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%); }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, margin: 0 }}>Curated for you</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Curated", "Trending", "Hot & New"] as const).map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          placeholder="Search marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14, marginBottom: 28, background: "white", outline: "none" }}
        />

        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          {/* Sidebar Filters */}
          <div style={{ width: 240, flexShrink: 0, background: "white", borderRadius: 12, padding: "8px 16px" }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "10px 4px 6px" }}>Filters</p>

            {/* Price Filter */}
            <div className="filter-section">
              <div className="filter-header" onClick={() => setPriceOpen(!priceOpen)}>
                <span>Price</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: priceOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {priceOpen && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Minimum price</p>
                    <div className="price-input">
                      <div className="price-circle">$</div>
                      <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Maximum price</p>
                    <div className="price-input">
                      <div className="price-circle">$</div>
                      <input type="number" placeholder="∞" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="filter-section">
              <div className="filter-header" onClick={() => setRatingOpen(!ratingOpen)}>
                <span>Rating</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: ratingOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
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

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {videos.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                <p style={{ fontSize: 16 }}>No products found</p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {videos.map((v) => (
                <Link key={v.id} href={`/watch/${v.id}`} className="card">
                  {/* Thumbnail */}
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#1a1a1a" }}>
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.3"><polygon points="5,3 19,12 5,21" /></svg>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "12px 14px 14px" }}>
                    {/* Author avatar + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      {v.author_avatar ? (
                        <img src={v.author_avatar} alt={v.author_name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 600 }}>
                          {v.author_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span style={{ fontSize: 12, color: "#555", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 2 }}>
                        {v.author_name || "Creator"}
                      </span>
                    </div>

                    {/* Title */}
                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {v.title}
                    </p>

                    {/* Rating */}
                    {v.rating && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1.5">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{v.rating}</span>
                        {v.review_count && <span style={{ fontSize: 12, color: "#888" }}>({v.review_count})</span>}
                      </div>
                    )}

                    {/* Price tag */}
                    <div>
                      <span className="price-tag">
                        ${v.price || 0}+
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}