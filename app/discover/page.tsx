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

  useEffect(() => {
    load();
  }, [search, minPrice, maxPrice, minRating]);

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
    <div style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", background: "#f4f3f0", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        .tab-btn { background: none; border: 1px solid transparent; cursor: pointer; padding: 8px 20px; border-radius: 999px; font-size: 14px; font-weight: 500; color: #555; transition: all 0.15s; }
        .tab-btn.active { border-color: #1a1a1a; color: #1a1a1a; background: white; }
        .tab-btn:hover:not(.active) { color: #1a1a1a; }
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
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0, fontWeight: 600 }}>Curated for you</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Curated", "Trending", "Hot & New"] as const).map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <input
          placeholder="Search marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 28, background: "white", outline: "none" }}
        />

        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <div style={{ width: 240, flexShrink: 0, background: "white", borderRadius: 12, padding: "8px 16px" }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "10px 4px 6px" }}>Filters</p>

            <div className="filter-section">
              <div className="filter-header" onClick={() => setPriceOpen(!priceOpen)}>
                <span>Price</span>
              </div>
              {priceOpen && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="price-input">
                    <div className="price-circle">$</div>
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                  <div className="price-input">
                    <div className="price-circle">$</div>
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

          <div style={{ flex: 1 }}>
            {videos.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                <p style={{ fontSize: 16 }}>No products found</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {videos.map((v) => (
                <Link key={v.id} href={`/watch/${v.id}`} className="card">
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#1a1a1a" }}>
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>

                  <div style={{ padding: "12px 14px 14px" }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px", lineHeight: 1.4 }}>
                      {v.title}
                    </p>

                    {v.rating && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{v.rating}</span>
                      </div>
                    )}

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