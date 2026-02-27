"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Videos() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("videos").select("*").then(({ data }) => {
      setVideos(data || []);
    });
  }, []);

  return (
    <div>
      <h1>Videos</h1>

      {videos.map((v) => (
        <Link key={v.id} href={`/watch/${v.id}`}>
          <div>
            <p>{v.title}</p>
            <p>₹{v.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
