"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window { Razorpay: any; }
}

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [video, setVideo] = useState<any>(null);
  const [creator, setCreator] = useState<{ username: string; full_name?: string | null; avatar_url?: string | null } | null>(null);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const loadRatings = async (vid: string) => {
    const { data } = await supabase.from("ratings").select("rating").eq("video_id", vid);
    if (data) setAllRatings(data);
  };

  const fixDescriptionLinks = (html: string): string => {
    return html.replace(/href="([^"]+)"/g, (match, url) => {
      const fixedUrl =
        /^https?:\/\//i.test(url) || url.startsWith("mailto:") || url.startsWith("#")
          ? url
          : `https://${url}`;
      return `href="${fixedUrl}" target="_blank" rel="noopener noreferrer"`;
    });
  };

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setPageLoading(true);
      const [{ data: v }, { data: { user } }] = await Promise.all([
        supabase.from("videos").select("*").eq("slug", slug).single(),
        supabase.auth.getUser(),
      ]);

      if (!v) { setPageLoading(false); return; }
      setVideo(v);

      await supabase.from("video_views").insert({
        video_id: v.id,
        viewer_id: user?.id ?? null,
      });

      const [, creatorResult] = await Promise.all([
        loadRatings(v.id),
        v.creator_id
          ? supabase.from("profiles").select("username, full_name, avatar_url").eq("id", v.creator_id).single()
          : Promise.resolve({ data: null }),
      ]);
      if (creatorResult?.data) setCreator(creatorResult.data);

      if (!user) { setPageLoading(false); return; }
      setUserId(user.id);

      const isFree = v.is_free || Number(v.price) === 0;

      if (isFree) {
        setOwned(true);
        const { data: signed } = await supabase.storage.from("videos").createSignedUrl(v.video_path, 60 * 60);
        setDownloadUrl(signed?.signedUrl || null);
        setPageLoading(false);
        return;
      }

      if (user.id === v.creator_id) {
        setOwned(true);
        const { data: signed } = await supabase.storage.from("videos").createSignedUrl(v.video_path, 60 * 60);
        setDownloadUrl(signed?.signedUrl || null);
        setPageLoading(false);
        return;
      }

      const { data: p } = await supabase
        .from("purchases")
        .select("id")
        .eq("video_id", v.id)
        .eq("buyer_id", user.id)
        .single();

      if (p) {
        setOwned(true);
        const { data: signed } = await supabase.storage.from("videos").createSignedUrl(v.video_path, 60 * 60);
        setDownloadUrl(signed?.signedUrl || null);
      }

      setPageLoading(false);
    };
    load();
  }, [slug]);

  const totalRatings = allRatings.length;
  const avgRating = totalRatings > 0
    ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : null;
  const countFor = (star: number) => allRatings.filter(r => r.rating === star).length;
  const pctFor = (star: number) => totalRatings > 0 ? Math.round((countFor(star) / totalRatings) * 100) : 0;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: video?.title || "Check this out", url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const download = async (path: string, title: string) => {
    const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 60 * 60);
    if (error) { alert(error.message); return; }
    if (data?.signedUrl) {
      try {
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = title || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch {
        window.open(data.signedUrl, "_blank");
      }
    }
  };

  const buy = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=/product/${slug}`);
      setLoading(false);
      return;
    }
    if (owned) {
      router.push(`/watch/${slug}`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/buy-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-order", video_id: video.id, buyer_id: user.id }),
      });

      if (!res.ok) { alert("Failed to create order. Please try again."); setLoading(false); return; }

      const data = await res.json();

      if (data.free) {
        setOwned(true);
        const { data: signed } = await supabase.storage.from("videos").createSignedUrl(video.video_path, 60 * 60);
        setDownloadUrl(signed?.signedUrl || null);
        setLoading(false);
        return;
      }

      const order = data.order;
      const openCheckout = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
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
                buyer_id: user.id,
              }),
            });
            if (verifyRes.ok) {
              setOwned(true);
              const { data: signed } = await supabase.storage.from("videos").createSignedUrl(video.video_path, 60 * 60);
              setDownloadUrl(signed?.signedUrl || null);
            } else {
              const msg = await verifyRes.text();
              alert("Payment verification failed: " + msg);
            }
            setLoading(false);
          },
          prefill: { email: user.email ?? "" },
          theme: { color: "#e91e8c" },
          modal: { ondismiss: () => setLoading(false) },
        });
        rzp.open();
      };

      if (window.Razorpay) {
        openCheckout();
      } else {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = openCheckout;
        document.body.appendChild(script);
      }
    } catch (err: any) {
      alert("Something went wrong: " + err.message);
      setLoading(false);
    }
  };

  if (pageLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", color: "#a1a1aa" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e4e4e7", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <p>Loading...</p>
      </div>
    </div>
  );

  if (!video) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ color: "#a1a1aa" }}>Product not found.</p>
    </div>
  );

  const creatorDisplayName = creator?.full_name || creator?.username || "Creator";
  const isFree = video.is_free || Number(video.price) === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        .watch-wrap { font-family: 'DM Sans', sans-serif; background: #fff; min-height: 100vh; color: #18181b; }

        /* ── NAV ── */
        .watch-nav {
          background: white;
          border-bottom: 1px solid #e4e4e7;
          padding: 0 16px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        @media (min-width: 640px) { .watch-nav { padding: 0 40px; height: 54px; } }
        .watch-nav-logo { font-size: 1.15rem; color: #18181b; text-decoration: none; font-weight: 800; }
        .watch-nav-share {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px; border: 1px solid #e4e4e7;
          background: white; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; color: #18181b;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .watch-nav-share:hover { background: #f4f4f6; border-color: #d4d4d8; }

        /* ── HERO ── */
        .watch-hero {
          width: 100%;
          overflow: hidden;
          background: #18181b;
          /* Fluid height: 56vw on mobile (natural 16:9), capped at 460px on desktop */
          height: clamp(200px, 56vw, 460px);
        }
        .watch-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .watch-hero-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #18181b, #3f3f46);
          font-size: clamp(3rem, 10vw, 5rem);
        }

        /* ── MAIN GRID ── */
        .watch-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 16px 48px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        @media (min-width: 768px) {
          .watch-main {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 40px;
            padding: 0 24px 60px;
            align-items: start;
          }
        }

        /* ── LEFT COLUMN ── */
        .watch-left { padding-top: 20px; }
        @media (min-width: 768px) { .watch-left { padding-top: 28px; } }

        .watch-meta-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px; flex-wrap: wrap;
        }
        .watch-price-tag {
          display: inline-flex; align-items: center;
          background: #e91e8c; color: white; font-weight: 700; font-size: 13px;
          padding: 5px 16px 5px 12px;
          clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%);
          flex-shrink: 0;
        }
        .watch-price-tag.free-tag { background: #16a34a; }

        .watch-creator-pill {
          display: flex; align-items: center; gap: 7px;
          background: #f4f4f6; border-radius: 999px;
          padding: 5px 12px 5px 5px;
          text-decoration: none; transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .watch-creator-pill:hover { background: #e8e8e8; }
        .watch-creator-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #e879f9);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden;
        }
        .watch-creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .watch-creator-name { font-size: 13px; font-weight: 600; color: #18181b; }

        .watch-inline-stars { display: flex; align-items: center; gap: 5px; }
        .watch-inline-stars .stars { display: flex; gap: 2px; }
        .watch-inline-stars .count { font-size: 12px; color: #71717a; }

        .watch-title {
          font-size: clamp(1.2rem, 5vw, 1.75rem);
          font-weight: 800; color: #18181b;
          line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 18px;
        }
        .watch-divider-line { height: 1px; background: #f0f0f2; margin: 20px 0; }

        .watch-description { font-size: 0.9rem; color: #3f3f46; line-height: 1.8; }
        .watch-description p { margin-bottom: 10px; }
        .watch-description strong { font-weight: 700; color: #18181b; }
        .watch-description blockquote { border-left: 3px solid #e879f9; padding-left: 14px; color: #71717a; font-style: italic; margin: 12px 0; }
        .watch-description a { color: #e879f9; text-decoration: underline; cursor: pointer; }
        .watch-description a:hover { color: #c2185b; }
        .watch-description ul, .watch-description ol { padding-left: 20px; margin: 8px 0; }
        .watch-description img { max-width: 100%; border-radius: 8px; }
        .watch-description h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        .watch-description h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 6px; }
        .watch-description h3 { font-size: 1rem; font-weight: 600; margin-bottom: 5px; }
        .watch-description pre { background: #18181b; color: #e4e4e7; border-radius: 8px; padding: 12px 14px; font-family: monospace; font-size: 0.85rem; margin: 8px 0; overflow-x: auto; }

        /* ── RATINGS ── */
        .ratings-box { margin-top: 32px; border-top: 1px solid #f0f0f2; padding-top: 24px; }
        .ratings-box-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .ratings-box-title { font-size: 1rem; font-weight: 700; color: #18181b; }
        .ratings-avg { display: flex; align-items: center; gap: 5px; font-size: 0.9rem; font-weight: 700; color: #18181b; }
        .ratings-avg-count { font-size: 0.8rem; font-weight: 400; color: #71717a; }
        .ratings-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
        .ratings-label { font-size: 0.78rem; color: #52525b; width: 46px; flex-shrink: 0; text-align: right; }
        .ratings-bar-track { flex: 1; height: 8px; background: #f0f0f2; border-radius: 99px; overflow: hidden; }
        .ratings-bar-fill { height: 100%; border-radius: 99px; background: #e879f9; transition: width 0.4s ease; }
        .ratings-pct { font-size: 0.75rem; color: #71717a; width: 30px; flex-shrink: 0; text-align: right; }
        .ratings-empty { font-size: 0.875rem; color: #a1a1aa; padding: 10px 0; }

        /* ── BUY CARD ── */
        /*
          On mobile: card renders BELOW the title/meta row but ABOVE description.
          We use order to achieve this without duplicating JSX.
          watch-left is order:2, watch-card is order:1 on mobile.
        */
        .watch-left { order: 2; }
        .watch-card { order: 1; }

        @media (min-width: 768px) {
          .watch-left { order: unset; }
          .watch-card { order: unset; }
        }

        .watch-card {
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 0;
          overflow: hidden;
          /* On mobile: flush card under the title block */
          border-left: none; border-right: none;
          box-shadow: none;
          margin-top: 0;
        }
        @media (min-width: 768px) {
          .watch-card {
            border-radius: 16px;
            border: 1px solid #e4e4e7;
            box-shadow: 0 2px 20px rgba(0,0,0,0.06);
            position: sticky;
            top: 74px;
            margin-top: 28px;
          }
        }

        .watch-card-body { padding: 16px; }
        @media (min-width: 768px) { .watch-card-body { padding: 20px; } }

        /* On mobile, hide the card title/type/creator — already shown in the left col */
        .watch-card-desktop-only { display: none; }
        @media (min-width: 768px) { .watch-card-desktop-only { display: block; } }

        .watch-card-title { font-size: 1rem; font-weight: 700; color: #18181b; line-height: 1.3; margin-bottom: 4px; }
        .watch-card-type { font-size: 0.72rem; color: #a1a1aa; font-weight: 400; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
        .watch-card-creator {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 11px; background: #f7f7f7; border-radius: 10px;
          margin-bottom: 14px; text-decoration: none; transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .watch-card-creator:hover { background: #efefef; }
        .watch-card-creator-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #e879f9);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden;
        }
        .watch-card-creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .watch-card-creator-info { flex: 1; min-width: 0; }
        .watch-card-creator-name { font-size: 13px; font-weight: 600; color: #18181b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .watch-card-creator-sub { font-size: 11px; color: #a1a1aa; }
        .watch-card-divider { height: 1px; background: #f0f0f2; margin: 12px 0; }

        /* Mobile: show price inline next to button */
        .watch-card-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .watch-card-price-row { display: block; margin-bottom: 14px; }
        }
        .watch-card-price { font-size: 1.5rem; font-weight: 800; color: #18181b; }
        @media (max-width: 767px) { .watch-card-price { font-size: 1.25rem; } }
        .watch-card-price .free { font-size: 1rem; font-weight: 600; color: #16a34a; background: #f0fdf4; padding: 5px 12px; border-radius: 20px; display: inline-block; }

        /* On mobile: price + button side by side */
        .watch-card-actions-mobile {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (min-width: 768px) { .watch-card-actions-mobile { display: block; } }

        .watch-buy-btn {
          flex: 1;
          padding: 13px;
          background: #e91e8c; color: white; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          margin-bottom: 0;
          -webkit-tap-highlight-color: transparent;
        }
        @media (min-width: 768px) { .watch-buy-btn { width: 100%; margin-bottom: 10px; } }
        .watch-buy-btn:hover:not(:disabled) { background: #c2185b; transform: translateY(-1px); }
        .watch-buy-btn:active:not(:disabled) { transform: scale(0.98); }
        .watch-buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .watch-buy-btn.free-btn { background: #16a34a; }
        .watch-buy-btn.free-btn:hover:not(:disabled) { background: #15803d; }

        .watch-download-btn {
          flex: 1;
          padding: 13px; background: #7c3aed; color: white; border: none;
          border-radius: 10px; font-size: 0.95rem; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: block; text-align: center; margin-bottom: 0;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        @media (min-width: 768px) { .watch-download-btn { width: 100%; margin-bottom: 10px; } }
        .watch-download-btn:hover { background: #6d28d9; }

        .watch-share-card-btn {
          width: 100%; padding: 11px;
          background: white; color: #18181b; border: 1px solid #e4e4e7;
          border-radius: 10px; font-size: 0.875rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          margin-top: 10px;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .watch-share-card-btn:hover { background: #f4f4f6; }

        .watch-owned-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.78rem; color: #16a34a; font-weight: 500;
          background: #f0fdf4; padding: 7px 12px; border-radius: 8px;
          margin-bottom: 10px;
        }
        .watch-secure {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.73rem; color: #a1a1aa; justify-content: center;
          margin-top: 10px;
        }

        /* ── FOOTER ── */
        .compact-footer {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; padding: 14px 16px;
          border-top: 1px solid #f0f0f0;
          font-family: 'DM Sans', sans-serif;
          flex-wrap: wrap;
        }
        .compact-footer-sell {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #2563eb;
          text-decoration: none; letter-spacing: -0.01em; transition: opacity 0.15s;
        }
        .compact-footer-sell:hover { opacity: 0.75; }
        .compact-footer-dot { color: #d1d5db; font-size: 12px; }
        .compact-footer-powered { font-size: 13px; color: #9ca3af; font-weight: 500; }
        .compact-footer-powered a { color: #111; font-weight: 800; text-decoration: none; font-size: 14px; letter-spacing: -0.02em; transition: opacity 0.15s; }
        .compact-footer-powered a:hover { opacity: 0.7; }

        /* ── TOAST ── */
        .share-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translateX(-50%);
          background: #18181b; color: white;
          padding: 11px 22px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          z-index: 9999; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.22);
          animation: toast-in 0.22s ease;
          white-space: nowrap;
          max-width: calc(100vw - 32px);
        }
        @keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="watch-wrap">

        {/* ── NAVBAR ── */}
        <nav className="watch-nav">
          <a href="/" className="watch-nav-logo">Zelteb</a>
          <button className="watch-nav-share" onClick={handleShare}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </nav>

        {/* ── HERO ── */}
        <div className="watch-hero">
          {video.thumbnail_url
            ? <img src={video.thumbnail_url} alt={video.title} />
            : <div className="watch-hero-placeholder">{video.product_type === "video" ? "🎬" : "📁"}</div>
          }
        </div>

        {/* ── MAIN ── */}
        <div className="watch-main">

          {/* LEFT — title/meta/description */}
          <div className="watch-left">
            <div className="watch-meta-row">
              <span className={`watch-price-tag ${isFree ? "free-tag" : ""}`}>
                {isFree ? "Free" : `₹${video.price}`}
              </span>
              {creator && (
                <a href={`/${creator.username}`} className="watch-creator-pill">
                  <span className="watch-creator-avatar">
                    {creator.avatar_url
                      ? <img src={creator.avatar_url} alt={creatorDisplayName} />
                      : creatorDisplayName.charAt(0).toUpperCase()
                    }
                  </span>
                  <span className="watch-creator-name">{creatorDisplayName}</span>
                </a>
              )}
              {avgRating && (
                <span className="watch-inline-stars">
                  <span className="stars">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= Math.round(Number(avgRating)) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                    ))}
                  </span>
                  <span className="count">{avgRating} ({totalRatings})</span>
                </span>
              )}
            </div>

            <h1 className="watch-title">{video.title}</h1>

            {video.description && (
              <>
                <div className="watch-divider-line" />
                <div
                  className="watch-description"
                  dangerouslySetInnerHTML={{ __html: fixDescriptionLinks(video.description) }}
                />
              </>
            )}

            {/* RATINGS */}
            <div className="ratings-box">
              <div className="ratings-box-header">
                <span className="ratings-box-title">Ratings</span>
                {avgRating && (
                  <span className="ratings-avg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    {avgRating}
                    <span className="ratings-avg-count">({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</span>
                  </span>
                )}
              </div>
              {totalRatings === 0 ? (
                <p className="ratings-empty">No ratings yet. Be the first to rate!</p>
              ) : (
                [5, 4, 3, 2, 1].map(star => (
                  <div className="ratings-row" key={star}>
                    <span className="ratings-label">{star} {star === 1 ? "star" : "stars"}</span>
                    <div className="ratings-bar-track">
                      <div className="ratings-bar-fill" style={{ width: `${pctFor(star)}%` }} />
                    </div>
                    <span className="ratings-pct">{pctFor(star)}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── BUY CARD ── */}
          <div className="watch-card">
            <div className="watch-card-body">

              {/* Desktop-only: title, type, creator in the card */}
              <div className="watch-card-desktop-only">
                <div className="watch-card-title">{video.title}</div>
                <div className="watch-card-type">{video.product_type === "video" ? "Video" : "Digital Product"}</div>
                {creator && (
                  <a href={`/${creator.username}`} className="watch-card-creator">
                    <div className="watch-card-creator-avatar">
                      {creator.avatar_url
                        ? <img src={creator.avatar_url} alt={creatorDisplayName} />
                        : creatorDisplayName.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="watch-card-creator-info">
                      <div className="watch-card-creator-name">{creatorDisplayName}</div>
                      <div className="watch-card-creator-sub">View profile</div>
                    </div>
                  </a>
                )}
                <div className="watch-card-divider" />
              </div>

              {owned && (
                <div className="watch-owned-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  You own this product
                </div>
              )}

              {/* Price + CTA — side by side on mobile */}
              <div className="watch-card-actions-mobile">
                <div className="watch-card-price">
                  {isFree ? <span className="free">Free</span> : `₹${video.price}`}
                </div>

                {owned ? (
                  downloadUrl ? (
                    <button className="watch-download-btn" onClick={() => download(video.video_path, video.title)}>
                      {video.product_type === "video" ? "▶ Watch / Download" : "⬇ Download"}
                    </button>
                  ) : (
                    <div style={{ flex: 1, textAlign: "center", fontSize: "0.85rem", color: "#a1a1aa", padding: "12px 0" }}>
                      Preparing download...
                    </div>
                  )
                ) : (
                  <button
                    className={`watch-buy-btn ${isFree ? "free-btn" : ""}`}
                    onClick={buy}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : isFree ? "Get for Free" : "Buy Now"}
                  </button>
                )}
              </div>

              <button className="watch-share-card-btn" onClick={handleShare}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share this product
              </button>

              <div className="watch-secure">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure checkout
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="compact-footer">
          <a
            href={userId ? "https://www.zelteb.com/dashboard/product" : "/login"}
            className="compact-footer-sell"
            target={userId ? "_blank" : "_self"}
            rel="noopener noreferrer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Sell your own product
          </a>
          <span className="compact-footer-dot">·</span>
          <span className="compact-footer-powered">
            Powered by{" "}
            <a href="https://zelteb.com" target="_blank" rel="noopener noreferrer">Zelteb</a>
          </span>
        </div>
      </div>

      {showToast && (
        <div className="share-toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Link copied to clipboard!
        </div>
      )}
    </>
  );
}