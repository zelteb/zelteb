"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Video {
  id: string;
  title: string;
  price: number;
  is_free: boolean;
  thumbnail_url?: string | null;
  product_type: string;
  created_at: string;
  sales: number;
  revenue: number;
}

export default function Products() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch creator's products
      const { data: vids, error } = await supabase
        .from("videos")
        .select("id, title, price, is_free, thumbnail_url, product_type, created_at")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !vids) { setLoading(false); return; }

      // Fetch all purchases for this creator's products
      const videoIds = vids.map((v) => v.id);
      const { data: purchases } = videoIds.length > 0
        ? await supabase.from("purchases").select("video_id, amount").in("video_id", videoIds)
        : { data: [] };

      // Compute sales count and revenue per video
      const enriched = vids.map((v) => {
        const vidPurchases = (purchases || []).filter((p) => p.video_id === v.id);
        return {
          ...v,
          sales: vidPurchases.length,
          revenue: vidPurchases.reduce((sum, p) => sum + (p.amount || 0), 0),
        };
      });

      setVideos(enriched);
      setLoading(false);
    };

    load();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const totalSales = videos.reduce((s, v) => s + v.sales, 0);
  const totalRevenue = videos.reduce((s, v) => s + v.revenue, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .prod-table { width: 100%; border-collapse: collapse; }
        .prod-table th { text-align: left; font-size: 13px; font-weight: 600; color: #888; padding: 10px 16px; border-bottom: 1px solid #e5e5e5; white-space: nowrap; }
        .prod-table th.right { text-align: right; }
        .prod-table td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; font-size: 14px; color: #111; }
        .prod-table td.right { text-align: right; }
        .prod-table tr:last-child td { border-bottom: none; }
        .prod-table tbody tr:hover { background: #fafafa; }
        .prod-table .totals-row td { font-weight: 700; background: #f9f9f9; border-top: 2px solid #e5e5e5; font-size: 14px; color: #111; }
        .edit-btn { display: inline-flex; align-items: center; gap: 5px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 7px; padding: 6px 13px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: background 0.15s; white-space: nowrap; }
        .edit-btn:hover { background: #dbeafe; }
        .del-btn { display: inline-flex; align-items: center; gap: 5px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 7px; padding: 6px 13px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .del-btn:hover { background: #fecaca; }
        .thumb { width: 48px; height: 36px; border-radius: 6px; object-fit: cover; background: #1a1a1a; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-placeholder { width: 48px; height: 36px; border-radius: 6px; background: #e5e5e5; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .product-name { font-weight: 600; font-size: 14px; color: #111; margin: 0 0 2px; }
        .product-link { font-size: 12px; color: #888; text-decoration: none; }
        .product-link:hover { text-decoration: underline; color: #555; }
        .sales-link { color: #111; text-decoration: underline; text-decoration-color: #ccc; font-size: 14px; }
        .badge-free { display: inline-block; background: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 20px; border: 1px solid #bbf7d0; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", margin: 0 }}>Products</h1>
          <Link href="/creator/upload">
            <button style={{ background: "#5b5bd6", padding: "10px 20px", borderRadius: 10, color: "white", fontWeight: 600, border: "none", fontSize: 14, cursor: "pointer", position: "relative" }}>
              + Create New
              <span style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, borderRadius: "50%", background: "#f87171", display: "block" }} />
            </button>
          </Link>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", marginBottom: 28 }} />

        {/* Loading */}
        {loading && <p style={{ textAlign: "center", color: "#888", marginTop: 80 }}>Loading...</p>}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, gap: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111", margin: 0 }}>Create your first product</h2>
            <p style={{ color: "#888", fontSize: 15, margin: 0, textAlign: "center", maxWidth: 400 }}>
              Create your first product and start selling it to your customers.
            </p>
            <Link href="/creator/upload">
              <button style={{ marginTop: 12, background: "#5b5bd6", color: "white", border: "none", borderRadius: 10, padding: "14px 48px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Create Product
              </button>
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && videos.length > 0 && (
          <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 14, overflow: "hidden" }}>
            <table className="prod-table">
              <thead>
                <tr>
                  <th style={{ width: "100%" }}>Name</th>
                  <th className="right">Sales</th>
                  <th className="right">Revenue</th>
                  <th className="right">Price</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id}>
                    {/* Name + thumbnail */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {v.thumbnail_url ? (
                          <div className="thumb"><img src={v.thumbnail_url} alt={v.title} /></div>
                        ) : (
                          <div className="thumb-placeholder">{v.product_type === "video" ? "🎬" : "📁"}</div>
                        )}
                        <div>
                          <p className="product-name">{v.title}</p>
                          <Link href={`/watch/${v.id}`} className="product-link">
                            View product →
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Sales */}
                    <td className="right">
                      <span className="sales-link">{v.sales}</span>
                    </td>

                    {/* Revenue */}
                    <td className="right" style={{ fontWeight: 600 }}>
                      ₹{v.revenue.toLocaleString()}
                    </td>

                    {/* Price */}
                    <td className="right">
                      {v.is_free
                        ? <span className="badge-free">Free</span>
                        : <span style={{ fontWeight: 500 }}>₹{v.price}</span>
                      }
                    </td>

                    {/* Actions */}
                    <td className="right">
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link href={`/creator/edit/${v.id}`} className="edit-btn">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <button className="del-btn" onClick={() => deleteProduct(v.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="totals-row">
                  <td style={{ fontWeight: 700 }}>Totals</td>
                  <td className="right">{totalSales}</td>
                  <td className="right">₹{totalRevenue.toLocaleString()}</td>
                  <td className="right" />
                  <td className="right" />
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}