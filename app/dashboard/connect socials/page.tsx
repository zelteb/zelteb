"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/sync-instagram")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Followers: {data.followers}</h2>
      <h2>Avg Likes: {data.avgLikes.toFixed(1)}</h2>
      <h2>Avg Views: {data.avgViews.toFixed(1)}</h2>
      <h2>Engagement: {data.engagementRate.toFixed(2)}%</h2>
    </div>
  );
}