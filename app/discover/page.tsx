"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Discover() {
  const [videos, setVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const load = async (text = "") => {
    let query = supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (text) {
      query = query.ilike("title", `%${text}%`);
    }

    const { data } = await query;
    setVideos(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Discover</h1>

      {/* search */}
      <input
        placeholder="Search marketplace..."
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          setSearch(value);
          load(value);
        }}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
        }}
      />

      {/* list */}
      {videos.length === 0 && <p>No products found</p>}

      {videos.map((v) => (
        <Link key={v.id} href={`/watch/${v.id}`}>
          <div
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 10,
              cursor: "pointer",
            }}
          >
            <p style={{ fontWeight: "bold" }}>{v.title}</p>
            <p>₹{v.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
