"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Watch({ params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = use(params);

  const [video, setVideo] = useState<any>(null);
  const [creator, setCreator] = useState<{ username: string; full_name?: string | null; avatar_url?: string | null } | null>(null);
  const [owned, setOwned] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [hoverStar, setHoverStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [review, setReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [allRatings, setAllRatings] = useState<any[]>([]);

  const loadRatings = async () => {
    const { data } = await supabase.from("ratings").select("rating").eq("video_id", videoId);
    if (data) setAllRatings(data);
  };

  useEffect(() => {
    const load = async () => {
      const { data: v } = await supabase.from("videos").select("*").eq("id", videoId).single();
      if (!v) return;
      setVideo(v);
      if (v.thumbnail_url) setThumbnailUrl(v.thumbnail_url);
      await loadRatings();

      // Fetch creator profile using creator_id → links to their /{username} page
      if (v.creator_id) {
        const { data: creatorProfile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", v.creator_id)
          .single();
        if (creatorProfile) setCreator(creatorProfile);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: p } = await supabase.from("purchases").select("id").eq("video_id", videoId).eq("buyer_id", user.id).single();
      if (p) {
        setOwned(true);
        const { data: signed } = await supabase.storage.from("videos").createSignedUrl(v.video_path, 60 * 60);
        setDownloadUrl(signed?.signedUrl || null);

        const { data: existingR } = await supabase.from("ratings").select("*").eq("video_id", videoId).eq("buyer_id", user.id).maybeSingle();
        if (existingR) {
          setExistingRating(existingR);
          setSelectedStar(existingR.rating);
          setReview(existingR.review || "");
          setRatingSubmitted(true);
        }
      }
    };
    load();
  }, [videoId]);

  const totalRatings = allRatings.length;
  const avgRating = totalRatings > 0 ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : null;
  const countFor = (star: number) => allRatings.filter(r => r.rating === star).length;
  const pctFor = (star: number) => totalRatings > 0 ? Math.round((countFor(star) / totalRatings) * 100) : 0;

  const buy = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Please login"); setLoading(false); return; }
    if (owned) { setLoading(false); return; }

    if (video.is_free) {
      const { error } = await supabase.from("purchases").insert({ buyer_id: user.id, video_id: video.id, amount: 0 });
      if (error) { alert(error.message); setLoading(false); return; }
    } else {
      await fetch("/api/buy-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video, buyer_id: user.id }),
      });
    }

    setOwned(true);
    const { data: signed } = await supabase.storage.from("videos").createSignedUrl(video.video_path, 60 * 60);
    setDownloadUrl(signed?.signedUrl || null);
    setLoading(false);
  };

  const submitRating = async () => {
    if (!selectedStar) return alert("Please select a star rating");
    if (!userId) return;
    setRatingLoading(true);

    if (existingRating) {
      const { error } = await supabase.from("ratings").update({ rating: selectedStar, review }).eq("id", existingRating.id);
      if (error) { alert(error.message); setRatingLoading(false); return; }
    } else {
      const { error } = await supabase.from("ratings").insert({ video_id: videoId, buyer_id: userId, rating: selectedStar, review });
      if (error) { alert(error.message); setRatingLoading(false); return; }
    }

    setRatingSubmitted(true);
    setRatingLoading(false);
    await loadRatings();
  };

  if (!video) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", color: "#a1a1aa" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e4e4e7", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <p>Loading...</p>
      </div>
    </div>
  );

  const displayStar = hoverStar || selectedStar;
  const creatorDisplayName = creator?.full_name || creator?.username || "Creator";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        .watch-wrap { font-family: 'DM Sans', sans-serif; background: #fff; min-height: 100vh; color: #18181b; }

        .watch-nav { background: white; border-bottom: 1px solid #e4e4e7; padding: 0 40px; height: 54px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .watch-nav-logo { font-size: 1.2rem; color: #18181b; text-decoration: none; font-weight: 800; }
        .watch-nav-back { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #71717a; text-decoration: none; transition: color 0.15s; }
        .watch-nav-back:hover { color: #18181b; }

        .watch-hero { width: 100%; max-height: 480px; overflow: hidden; background: #18181b; }
        .watch-hero img { width: 100%; height: 480px; object-fit: cover; display: block; }
        .watch-hero-placeholder { width: 100%; height: 380px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #18181b, #3f3f46); font-size: 5rem; }

        .watch-main { max-width: 1000px; margin: 0 auto; padding: 0 24px 60px; display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }
        .watch-left { padding-top: 28px; }

        .watch-meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .watch-price-tag { display: inline-flex; align-items: center; background: #e91e8c; color: white; font-weight: 700; font-size: 14px; padding: 5px 16px 5px 12px; clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%); flex-shrink: 0; }
        .watch-price-tag.free-tag { background: #16a34a; }

        /* Creator pill — clickable link to profile */
        .watch-creator-pill { display: flex; align-items: center; gap: 7px; background: #f4f4f6; border-radius: 999px; padding: 5px 12px 5px 5px; text-decoration: none; transition: background 0.15s; }
        .watch-creator-pill:hover { background: #e8e8e8; }
        .watch-creator-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #e879f9); display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden; }
        .watch-creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .watch-creator-name { font-size: 13px; font-weight: 600; color: #18181b; }

        .watch-inline-stars { display: flex; align-items: center; gap: 5px; }
        .watch-inline-stars .stars { display: flex; gap: 2px; }
        .watch-inline-stars .count { font-size: 13px; color: #71717a; }

        .watch-title { font-size: 1.75rem; font-weight: 800; color: #18181b; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 20px; }
        .watch-divider-line { height: 1px; background: #f0f0f2; margin: 24px 0; }
        .watch-description { font-size: 0.9rem; color: #3f3f46; line-height: 1.8; }
        .watch-description p { margin-bottom: 10px; }
        .watch-description strong { font-weight: 700; color: #18181b; }
        .watch-description blockquote { border-left: 3px solid #e879f9; padding-left: 14px; color: #71717a; font-style: italic; margin: 12px 0; }
        .watch-description a { color: #e879f9; }
        .watch-description ul, .watch-description ol { padding-left: 20px; margin: 8px 0; }
        .watch-description img { max-width: 100%; border-radius: 8px; }

        .ratings-box { margin-top: 36px; border-top: 1px solid #f0f0f2; padding-top: 28px; }
        .ratings-box-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .ratings-box-title { font-size: 1rem; font-weight: 700; color: #18181b; }
        .ratings-avg { display: flex; align-items: center; gap: 5px; font-size: 0.9rem; font-weight: 700; color: #18181b; }
        .ratings-avg-count { font-size: 0.8rem; font-weight: 400; color: #71717a; }
        .ratings-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
        .ratings-label { font-size: 0.8rem; color: #52525b; width: 48px; flex-shrink: 0; text-align: right; }
        .ratings-bar-track { flex: 1; height: 9px; background: #f0f0f2; border-radius: 99px; overflow: hidden; }
        .ratings-bar-fill { height: 100%; border-radius: 99px; background: #e879f9; transition: width 0.4s ease; }
        .ratings-pct { font-size: 0.78rem; color: #71717a; width: 32px; flex-shrink: 0; text-align: right; }
        .ratings-empty { font-size: 0.875rem; color: #a1a1aa; padding: 12px 0; }

        .rating-section { margin-top: 32px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 16px; padding: 24px; }
        .rating-section h3 { font-size: 1rem; font-weight: 700; color: #18181b; margin-bottom: 4px; }
        .rating-section > p { font-size: 0.83rem; color: #71717a; margin-bottom: 18px; }
        .stars-row { display: flex; gap: 4px; margin-bottom: 16px; }
        .star-btn { background: none; border: none; cursor: pointer; padding: 0; font-size: 1.8rem; line-height: 1; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.2); }
        .rating-textarea { width: 100%; border: 1px solid #e4e4e7; border-radius: 10px; padding: 11px 13px; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; color: #18181b; resize: none; height: 90px; outline: none; background: white; transition: border-color 0.15s; margin-bottom: 12px; }
        .rating-textarea:focus { border-color: #e879f9; }
        .rating-textarea::placeholder { color: #a1a1aa; }
        .rating-submit-btn { background: #18181b; color: white; border: none; border-radius: 9px; padding: 10px 22px; font-size: 0.875rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .rating-submit-btn:hover:not(:disabled) { background: #27272a; }
        .rating-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rating-edit-btn { background: none; border: 1px solid #e4e4e7; border-radius: 9px; padding: 10px 22px; font-size: 0.875rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; color: #71717a; margin-left: 8px; transition: border-color 0.15s, color 0.15s; }
        .rating-edit-btn:hover { border-color: #18181b; color: #18181b; }
        .rating-success { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 10px 14px; font-size: 0.83rem; color: #16a34a; font-weight: 500; margin-bottom: 14px; }
        .submitted-stars { display: flex; gap: 3px; margin-bottom: 8px; font-size: 1.3rem; }
        .submitted-review { font-size: 0.85rem; color: #52525b; line-height: 1.6; font-style: italic; margin-bottom: 12px; }

        .watch-card { background: white; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.06); position: sticky; top: 74px; margin-top: 28px; }
        .watch-card-body { padding: 20px; }
        .watch-card-title { font-size: 1rem; font-weight: 700; color: #18181b; line-height: 1.3; margin-bottom: 4px; }
        .watch-card-type { font-size: 0.72rem; color: #a1a1aa; font-weight: 400; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.06em; }

        /* Creator row inside the buy card */
        .watch-card-creator { display: flex; align-items: center; gap: 9px; padding: 10px 11px; background: #f7f7f7; border-radius: 10px; margin-bottom: 14px; text-decoration: none; transition: background 0.15s; }
        .watch-card-creator:hover { background: #efefef; }
        .watch-card-creator-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #e879f9); display: flex; align-items: center; justify-content: center; font-size: 13px; color: white; font-weight: 700; flex-shrink: 0; overflow: hidden; }
        .watch-card-creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .watch-card-creator-info { flex: 1; min-width: 0; }
        .watch-card-creator-name { font-size: 13px; font-weight: 600; color: #18181b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .watch-card-creator-sub { font-size: 11px; color: #a1a1aa; }

        .watch-card-divider { height: 1px; background: #f0f0f2; margin: 14px 0; }
        .watch-card-price { font-size: 1.5rem; font-weight: 800; color: #18181b; margin-bottom: 14px; }
        .watch-card-price .free { font-size: 1rem; font-weight: 600; color: #16a34a; background: #f0fdf4; padding: 5px 12px; border-radius: 20px; display: inline-block; }
        .watch-buy-btn { width: 100%; padding: 13px; background: #e91e8c; color: white; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s, transform 0.1s; margin-bottom: 10px; }
        .watch-buy-btn:hover:not(:disabled) { background: #c2185b; transform: translateY(-1px); }
        .watch-buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .watch-buy-btn.free-btn { background: #16a34a; }
        .watch-buy-btn.free-btn:hover:not(:disabled) { background: #15803d; }
        .watch-download-btn { width: 100%; padding: 13px; background: #7c3aed; color: white; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; text-decoration: none; display: block; text-align: center; margin-bottom: 10px; transition: background 0.15s; }
        .watch-download-btn:hover { background: #6d28d9; }
        .watch-owned-badge { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #16a34a; font-weight: 500; background: #f0fdf4; padding: 7px 12px; border-radius: 8px; margin-bottom: 12px; }
        .watch-secure { display: flex; align-items: center; gap: 5px; font-size: 0.73rem; color: #a1a1aa; justify-content: center; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="watch-wrap">
        <nav className="watch-nav">
          <a href="/" className="watch-nav-logo">Zelteb</a>
          <a href="/discover" className="watch-nav-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </a>
        </nav>

        {/* HERO */}
        <div className="watch-hero">
          {thumbnailUrl
            ? <img src={thumbnailUrl} alt={video.title} />
            : <div className="watch-hero-placeholder">{video.product_type === "video" ? "🎬" : "📁"}</div>
          }
        </div>

        <div className="watch-main">
          {/* LEFT */}
          <div className="watch-left">
            <div className="watch-meta-row">
              {/* Price tag */}
              <span className={`watch-price-tag ${video.is_free ? "free-tag" : ""}`}>
                {video.is_free ? "Free" : `₹${video.price}`}
              </span>

              {/* Creator pill → clicks through to /{username} */}
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

              {/* Avg rating */}
              {avgRating && (
                <span className="watch-inline-stars">
                  <span className="stars">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(Number(avgRating)) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                    ))}
                  </span>
                  <span className="count">{avgRating} ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</span>
                </span>
              )}
            </div>

            <h1 className="watch-title">{video.title}</h1>

            {video.description && (
              <>
                <div className="watch-divider-line" />
                <div className="watch-description" dangerouslySetInnerHTML={{ __html: video.description }} />
              </>
            )}

            {/* RATINGS BREAKDOWN */}
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

            {/* RATE THIS PRODUCT — owners only */}
            {owned && (
              <div className="rating-section">
                <h3>Rate this product</h3>
                <p>Your feedback helps other buyers make better decisions.</p>
                {ratingSubmitted && (
                  <div className="rating-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Rating submitted — thank you!
                  </div>
                )}
                {ratingSubmitted ? (
                  <>
                    <div className="submitted-stars">{[1,2,3,4,5].map(s => <span key={s}>{s <= selectedStar ? "⭐" : "☆"}</span>)}</div>
                    {review && <p className="submitted-review">"{review}"</p>}
                    <button className="rating-edit-btn" onClick={() => setRatingSubmitted(false)}>Edit rating</button>
                  </>
                ) : (
                  <>
                    <div className="stars-row">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} className="star-btn" onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)} onClick={() => setSelectedStar(s)}>
                          {s <= displayStar ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                    <textarea className="rating-textarea" placeholder="Share your experience (optional)..." value={review} onChange={(e) => setReview(e.target.value)} />
                    <button className="rating-submit-btn" onClick={submitRating} disabled={ratingLoading || selectedStar === 0}>
                      {ratingLoading ? "Submitting..." : existingRating ? "Update rating" : "Submit rating"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: BUY CARD */}
          <div className="watch-card">
            <div className="watch-card-body">
              <div className="watch-card-title">{video.title}</div>
              <div className="watch-card-type">{video.product_type === "video" ? "Video" : "Digital Product"}</div>

              {/* Creator link inside buy card */}
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
                    <div className="watch-card-creator-sub">View profile →</div>
                  </div>
                </a>
              )}

              <div className="watch-card-divider" />

              {owned && (
                <div className="watch-owned-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  You own this product
                </div>
              )}

              <div className="watch-card-price">
                {video.is_free ? <span className="free">Free</span> : `₹${video.price}`}
              </div>

              {owned ? (
                downloadUrl ? (
                  <a href={downloadUrl} className="watch-download-btn">
                    {video.product_type === "video" ? "▶ Watch / Download" : "⬇ Download"}
                  </a>
                ) : (
                  <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#a1a1aa", padding: "12px 0" }}>Preparing download...</div>
                )
              ) : (
                <button className={`watch-buy-btn ${video.is_free ? "free-btn" : ""}`} onClick={buy} disabled={loading}>
                  {loading ? "Processing..." : video.is_free ? "Get for Free" : "Buy Now"}
                </button>
              )}

              <div className="watch-secure">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}