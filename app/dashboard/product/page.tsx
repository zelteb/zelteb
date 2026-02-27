"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Products() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setVideos(data || []);

      setLoading(false);
    };

    load();
  }, []);

  const deleteProduct = async (id: string) => {
    const ok = confirm("Delete this product permanently?");
    if (!ok) return;

    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      console.log("DELETE ERROR:", error.message);
      alert(error.message);
      return;
    }

    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111", margin: 0 }}>Products</h1>

          <Link href="/creator/upload">
            <button
              style={{
                background: "#5b5bd6",
                padding: "10px 20px",
                borderRadius: 10,
                color: "white",
                fontWeight: 600,
                border: "none",
                fontSize: 15,
                cursor: "pointer",
                position: "relative",
              }}
            >
              Create New
              <span style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#f87171",
                display: "block",
              }} />
            </button>
          </Link>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", marginBottom: 40 }} />

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: "center", color: "#888", marginTop: 80 }}>Loading...</p>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            gap: 12,
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111", margin: 0 }}>
              Create your first product
            </h2>
            <p style={{ color: "#888", fontSize: 15, margin: 0, textAlign: "center", maxWidth: 400 }}>
              Create your first product and start selling it to your customers.
            </p>
            <Link href="/creator/upload">
              <button
                style={{
                  marginTop: 12,
                  background: "#5b5bd6",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px 48px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create Product
              </button>
            </Link>
          </div>
        )}

        {/* Product List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {videos.map((v) => (
            <div
              key={v.id}
              style={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Product Info */}
              <Link href={`/watch/${v.id}`} style={{ textDecoration: "none", flex: 1, cursor: "pointer" }}>
                <p style={{ fontWeight: 600, fontSize: 16, color: "#111", margin: 0 }}>{v.title}</p>
                <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>₹{v.price}</p>
              </Link>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {/* Edit Button */}
                <Link href={`/creator/edit/${v.id}`}>
                  <button
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      borderRadius: 8,
                      padding: "8px 16px",
                      border: "1px solid #bfdbfe",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => deleteProduct(v.id)}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    borderRadius: 8,
                    padding: "8px 16px",
                    border: "1px solid #fecaca",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}