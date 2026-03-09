"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window { Razorpay: any; }
}

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [video, setVideo] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [avgRating, setAvgRating] = useState<string | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

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
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);

      const { data: vid } = await supabase
        .from("videos")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!vid) { setLoading(false); return; }
      setVideo(vid);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", vid.creator_id)
        .single();
      setCreator(profile);

      const { data: ratings } = await supabase
        .from("ratings")
        .select("rating")
        .eq("video_id", vid.id);

      if (ratings && ratings.length > 0) {
        const avg = (ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length).toFixed(1);
        setAvgRating(avg);
        setRatingCount(ratings.length);
      }

      setLoading(false);
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (!currentUser || !video) return;
    supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", currentUser.id)
      .eq("video_id", video.id)
      .eq("status", "completed")
      .then(({ data }) => {
        setAlreadyPurchased(!!(data && data.length > 0));
      });
  }, [currentUser, video]);

  const isFree = video?.is_free || Number(video?.price) === 0;
  const isOwner = currentUser?.id === video?.creator_id;

  const handleBuy = async () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    if (alreadyPurchased || isOwner) {
      window.location.href = `/watch/${video.slug}`;
      return;
    }

    setBuying(true);
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
        setBuying(false);
        return;
      }

      const data = await res.json();

      if (data.free) {
        window.location.href = `/watch/${video.slug}`;
        setBuying(false);
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
            window.location.href = `/watch/${video.slug}`;
          } else {
            const msg = await verifyRes.text();
            alert("Payment verification failed: " + msg);
          }
        },
        prefill: { email: currentUser.email ?? "" },
        theme: { color: "#e91e8c" },
        modal: { ondismiss: () => setBuying(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert("Something went wrong: " + err.message);
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <p style={{ color: "#999", fontSize: 15 }}>Loading...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <p style={{ color: "#999", fontSize: 15 }}>Product not found.</p>
      </div>
    );
  }

  const btnLabel = isOwner
    ? "Watch (Your Product)"
    : alreadyPurchased
    ? "Watch Now"
    : isFree
    ? "Get for Free"
    : buying
    ? "Processing..."
    : `Buy Now — ₹${video.price}`;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", background: "#f4f3f0", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        .buy-btn { width: 100%; padding: 14px; border-radius: 10px; background: #e91e8c; color: white; font-size: 16px; font-weight: 700; border: none; cursor: pointer; transition: opacity 0.15s; }
        .buy-btn:hover { opacity: 0.88; }
        .buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .creator-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #e879f9); display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: 700; overflow: hidden; flex-shrink: 0; }
        .creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .price-tag { display: inline-flex; align-items: center; background: #e91e8c; color: white; font-weight: 700; font-size: 15px; padding: 6px 18px 6px 12px; clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%); }
        @media (max-width: 768px) {
          .product-layout { flex-direction: column !important; }
          .product-sidebar { width: 100% !important; position: static !important; }
          .nav-links { display: none !important; }
          .navbar-inner { padding: 14px 16px !important; }
          .page-padding { padding: 20px 16px 40px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={{ background: "white", borderBottom: "1px solid #f0f0f0" }}>
        <div className="navbar-inner" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
          <Link href="/" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#000", textDecoration: "none" }}>
            Zelteb
          </Link>
          <nav className="nav-links" style={{ display: "flex", gap: 40, fontSize: 15, fontWeight: 500 }}>
            <Link href="/" style={{ color: "#666", textDecoration: "none" }}>Home</Link>
            <Link href="/discover" style={{ color: "#000", textDecoration: "none" }}>Discover</Link>
            <Link href="/purchased" style={{ color: "#000", textDecoration: "none" }}>Purchased</Link>
          </nav>
          <Link href="/dashboard" style={{ padding: "10px 24px", borderRadius: 999, background: "#000", color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </header>

      <div className="page-padding" style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Back */}
        <Link href="/discover" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#666", textDecoration: "none", marginBottom: 24, fontWeight: 500 }}>
          ← Back to Discover
        </Link>

        <div className="product-layout" style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>

          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 14, overflow: "hidden", background: "#1a1a1a", marginBottom: 28 }}>
              {video.thumbnail_url
                ? <img src={video.thumbnail_url} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
                    {video.product_type === "video" ? "🎬" : "📁"}
                  </div>
              }
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.3, color: "#111" }}>
              {video.title}
            </h1>

            {creator && (
              <div
                onClick={() => window.location.href = `/${creator.username}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16 }}
              >
                <div className="creator-avatar">
                  {creator.avatar_url
                    ? <img src={creator.avatar_url} alt={creator.username} />
                    : (creator.full_name || creator.username || "?")[0].toUpperCase()
                  }
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{creator.full_name || creator.username}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>@{creator.username}</p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
              {avgRating ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{avgRating}</span>
                  <span style={{ fontSize: 13, color: "#999" }}>({ratingCount} reviews)</span>
                </>
              ) : (
                <span style={{ fontSize: 13, color: "#bbb" }}>No reviews yet</span>
              )}
            </div>

            {video.description && (
              <div style={{ background: "white", borderRadius: 12, padding: "20px 24px" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: "#111" }}>About this product</h2>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Buy Card */}
          <div className="product-sidebar" style={{ width: 320, background: "white", borderRadius: 16, padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", position: "sticky", top: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="price-tag">
                {isFree ? "Free" : `₹${video.price}`}
              </span>
            </div>

            <button className="buy-btn" onClick={handleBuy} disabled={buying}>
              {btnLabel}
            </button>

            {!currentUser && (
              <p style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 10 }}>
                You need to <Link href="/login" style={{ color: "#e91e8c", fontWeight: 600 }}>log in</Link> to purchase
              </p>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "20px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
                <span>📦</span> {video.product_type === "video" ? "Video course" : "Digital file"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
                <span>♾️</span> Lifetime access
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
                <span>📱</span> Access on any device
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}