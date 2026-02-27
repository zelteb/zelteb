"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Purchased() {
  const [items, setItems] = useState<any[]>([]);
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

      // step 1 → get purchases
      const { data: purchases, error: pError } = await supabase
        .from("purchases")
        .select("video_id")
        .eq("buyer_id", user.id);

      if (pError) {
        console.log(pError);
        setLoading(false);
        return;
      }

      if (!purchases || purchases.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const ids = purchases.map((p) => p.video_id);

      // step 2 → get videos
      const { data: videos, error: vError } = await supabase
        .from("videos")
        .select("*")
        .in("id", ids);

      if (vError) {
        console.log(vError);
        setLoading(false);
        return;
      }

      setItems(videos || []);
      setLoading(false);
    };

    load();
  }, []);

  const download = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(path, 60 * 60);

    if (error) {
      alert(error.message);
      return;
    }

    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Purchased</h1>

      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p>No purchases yet</p>}

      {items.map((v) => (
        <div
          key={v.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
          }}
        >
          <p style={{ fontWeight: "bold" }}>{v.title}</p>

          {v.is_free ? (
            <p style={{ color: "green", fontWeight: "bold" }}>FREE</p>
          ) : (
            <p>₹{v.price}</p>
          )}

          <button onClick={() => download(v.video_path)}>
            {v.product_type === "video"
              ? "Watch / Download"
              : "Download"}
          </button>
        </div>
      ))}
    </div>
  );
}
