"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Purchased() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: purchases, error: pError } = await supabase
        .from("purchases")
        .select("video_id")
        .eq("buyer_id", user.id);

      if (pError || !purchases || purchases.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const ids = purchases.map((p) => p.video_id);

      const { data: videos, error: vError } = await supabase
        .from("videos")
        .select("*")
        .in("id", ids);

      if (vError) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Fetch creator profiles
      const creatorIds = [...new Set((videos || []).map((v) => v.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", creatorIds);

      // Fetch ratings
      const videoIds = (videos || []).map((v) => v.id);
      const { data: ratings } = await supabase
        .from("ratings")
        .select("video_id, rating")
        .in("video_id", videoIds);

      const enriched = (videos || []).map((v) => {
        const creator = (profiles || []).find((p) => p.id === v.creator_id);
        const videoRatings = (ratings || []).filter((r) => r.video_id === v.id);
        const avgRating =
          videoRatings.length > 0
            ? (
                videoRatings.reduce((sum, r) => sum + r.rating, 0) /
                videoRatings.length
              ).toFixed(1)
            : null;
        return { ...v, creator, avgRating, ratingCount: videoRatings.length };
      });

      setItems(enriched);
      setLoading(false);
    };

    load();
  }, []);

  const download = async (path: string, title: string) => {
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(path, 60 * 60);

    if (error) {
      alert(error.message);
      return;
    }

    if (data?.signedUrl) {
      try {
        // Fetch as blob to force native "Save As" dialog (bypasses cross-origin block)
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = title || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Free memory
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch {
        // Fallback: open in new tab if blob fetch fails
        window.open(data.signedUrl, "_blank");
      }
    }
  };

  const filtered = items.filter((v) =>
    v.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#f4f3f0",
        minHeight: "100vh",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .card { background: white; border-radius: 12px; overflow: hidden; transition: transform 0.18s, box-shadow 0.18s; color: inherit; display: block; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .price-tag { display: inline-flex; align-items: center; background: #e91e8c; color: white; font-weight: 600; font-size: 13px; padding: 5px 14px 5px 10px; clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%); }
        .price-tag.free { background: #16a34a; }
        .creator-avatar { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #e879f9); display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden; }
        .creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.15s, transform 0.1s; }
        .action-btn:hover { transform: scale(1.03); }
        .watch-btn { background: #1a1a1a; color: white; }
        .watch-btn:hover { background: #333; }
        .download-btn { background: #f4f3f0; color: #1a1a1a; border: 1px solid #ddd; }
        .download-btn:hover { background: #e8e7e4; }
      `}</style>

      {/* NAVBAR */}
      <header style={{ background: "white", borderBottom: "1px solid #f0f0f0" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#000",
              textDecoration: "none",
            }}
          >
            Zelteb
          </Link>
          <nav style={{ display: "flex", gap: 40, fontSize: 15, fontWeight: 500 }}>
            <Link href="/" style={{ color: "#666", textDecoration: "none" }}>
              Home
            </Link>
            <Link href="/discover" style={{ color: "#666", textDecoration: "none" }}>
              Discover
            </Link>
            <Link href="/purchased" style={{ color: "#000", textDecoration: "none" }}>
              Purchased
            </Link>
          </nav>
          <Link
            href="/dashboard"
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "#000",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Search */}
        <input
          placeholder="Search your purchases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
            marginBottom: 28,
            background: "white",
            outline: "none",
          }}
        />

        {/* States */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <p style={{ fontSize: 16 }}>Loading...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <p style={{ fontSize: 16 }}>
              {items.length === 0 ? "No purchases yet" : "No results found"}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((v) => (
              <div key={v.id} className="card">
                {/* Thumbnail */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    overflow: "hidden",
                    background: "#1a1a1a",
                  }}
                >
                  {v.thumbnail_url ? (
                    <img
                      src={v.thumbnail_url}
                      alt={v.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                      }}
                    >
                      {v.product_type === "video" ? "🎬" : "📁"}
                    </div>
                  )}
                </div>

                <div style={{ padding: "12px 14px 14px" }}>
                  {/* Title */}
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      margin: "0 0 8px",
                      lineHeight: 1.4,
                    }}
                  >
                    {v.title}
                  </p>

                  {/* Creator */}
                  {v.creator && (
                    <div
                      onClick={() =>
                        (window.location.href = `/${v.creator.username}`)
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 7,
                        cursor: "pointer",
                      }}
                    >
                      <div className="creator-avatar">
                        {v.creator.avatar_url ? (
                          <img
                            src={v.creator.avatar_url}
                            alt={v.creator.username}
                          />
                        ) : (
                          (
                            v.creator.full_name ||
                            v.creator.username ||
                            "?"
                          )[0].toUpperCase()
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>
                        {v.creator.full_name || v.creator.username}
                      </span>
                    </div>
                  )}

                  {/* Rating */}
                  {v.avgRating && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 8,
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="#f59e0b"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      >
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>
                        {v.avgRating}
                      </span>
                      <span style={{ fontSize: 11, color: "#999" }}>
                        ({v.ratingCount})
                      </span>
                    </div>
                  )}

                  {/* Price tag */}
                  <div style={{ marginBottom: 10 }}>
                    <span className={`price-tag${v.is_free ? " free" : ""}`}>
                      {v.is_free ? "Free" : `₹${v.price || 0}`}
                    </span>
                  </div>

                  {/* Actions — unchanged logic */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {v.product_type === "video" && (
                      <button
                        className="action-btn watch-btn"
                        onClick={() =>
                          (window.location.href = `/watch/${v.id}`)
                        }
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                        Watch
                      </button>
                    )}
                    <button
                      className="action-btn download-btn"
                      onClick={() => download(v.video_path, v.title)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}