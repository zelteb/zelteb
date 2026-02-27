"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Watch({ params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = use(params);

  const [video, setVideo] = useState<any>(null);
  const [owned, setOwned] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Rating state
  const [hoverStar, setHoverStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [review, setReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

  // Ratings breakdown
  const [allRatings, setAllRatings] = useState<any[]>([]);

  const loadRatings = async () => {
    const { data } = await supabase
      .from("ratings")
      .select("rating")
      .eq("video_id", videoId);
    if (data) setAllRatings(data);
  };

  useEffect(() => {
    const load = async () => {
      const { data: v } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (!v) return;
      setVideo(v);

      if (v.thumbnail_url) setThumbnailUrl(v.thumbnail_url);

      // Load ratings breakdown for everyone
      await loadRatings();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: p } = await supabase
        .from("purchases")
        .select("id")
        .eq("video_id", videoId)
        .eq("buyer_id", user.id)
        .single();

      if (p) {
        setOwned(true);
        const { data: signed } = await supabase.storage
          .from("videos")
          .createSignedUrl(v.video_path, 60 * 60);
        setDownloadUrl(signed?.signedUrl || null);

        const { data: existingR } = await supabase
          .from("ratings")
          .select("*")
          .eq("video_id", videoId)
          .eq("buyer_id", user.id)
          .maybeSingle();

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

  // Compute breakdown
  const totalRatings = allRatings.length;
  const avgRating = totalRatings > 0
    ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : null;
  const countFor = (star: number) => allRatings.filter(r => r.rating === star).length;
  const pctFor = (star: number) => totalRatings > 0 ? Math.round((countFor(star) / totalRatings) * 100) : 0;

  const buy = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Please login"); setLoading(false); return; }
    if (owned) { setLoading(false); return; }

    if (video.is_free) {
      const { error } = await supabase.from("purchases").insert({
        buyer_id: user.id,
        video_id: video.id,
        amount: 0,
      });
      if (error) { alert(error.message); setLoading(false); return; }
    } else {
      await fetch("/buy-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video, buyer_id: user.id }),
      });
    }

    setOwned(true);
    const { data: signed } = await supabase.storage
      .from("videos")
      .createSignedUrl(video.video_path, 60 * 60);
    setDownloadUrl(signed?.signedUrl || null);
    setLoading(false);
  };

  const submitRating = async () => {
    if (!selectedStar) return alert("Please select a star rating");
    if (!userId) return;
    setRatingLoading(true);

    if (existingRating) {
      const { error } = await supabase
        .from("ratings")
        .update({ rating: selectedStar, review })
        .eq("id", existingRating.id);
      if (error) { alert(error.message); setRatingLoading(false); return; }
    } else {
      const { error } = await supabase.from("ratings").insert({
        video_id: videoId,
        buyer_id: userId,
        rating: selectedStar,
        review,
      });
      if (error) { alert(error.message); setRatingLoading(false); return; }
    }

    setRatingSubmitted(true);
    setRatingLoading(false);
    await loadRatings(); // refresh breakdown after submitting
  };

  if (!video) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#a1a1aa" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e4e4e7", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: "0.9rem" }}>Loading...</p>
      </div>
    </div>
  );

  const displayStar = hoverStar || selectedStar;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .watch-wrap { font-family: 'DM Sans', sans-serif; background: #f9f9f8; min-height: 100vh; color: #18181b; }

        .watch-nav { background: white; border-bottom: 1px solid #e4e4e7; padding: 0 40px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .watch-nav-logo { font-family: 'DM Sans', sans-serif; font-size: 1.3rem; color: #18181b; text-decoration: none; font-weight: 700; }
        .watch-nav-back { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #71717a; text-decoration: none; transition: color 0.15s; }
        .watch-nav-back:hover { color: #18181b; }

        .watch-body { max-width: 960px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start; }
        @media (max-width: 720px) { .watch-body { grid-template-columns: 1fr; } }

        .watch-thumb { width: 100%; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, #18181b 0%, #3f3f46 100%); margin-bottom: 28px; position: relative; }
        .watch-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .watch-thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #52525b; font-size: 3rem; }
        .watch-type-badge { position: absolute; top: 14px; left: 14px; background: rgba(0,0,0,0.55); backdrop-filter: blur(8px); color: white; font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase; }

        .watch-title { font-family: 'DM Sans', sans-serif; font-size: 2rem; font-weight: 700; color: #18181b; line-height: 1.25; letter-spacing: -0.02em; margin-bottom: 16px; }

        .watch-description { font-size: 0.9rem; color: #52525b; line-height: 1.75; font-weight: 400; }
        .watch-description p { margin-bottom: 10px; }
        .watch-description strong { font-weight: 600; color: #18181b; }
        .watch-description em { font-style: italic; }
        .watch-description u { text-decoration: underline; }
        .watch-description blockquote { border-left: 3px solid #7c3aed; padding-left: 14px; color: #71717a; font-style: italic; margin: 12px 0; }
        .watch-description a { color: #7c3aed; text-decoration: underline; }
        .watch-description ul { padding-left: 20px; margin: 8px 0; }
        .watch-description ol { padding-left: 20px; margin: 8px 0; }
        .watch-description img { max-width: 100%; border-radius: 8px; }

        /* RATINGS BREAKDOWN BOX */
        .ratings-box { margin-top: 36px; background: white; border: 1px solid #e4e4e7; border-radius: 20px; padding: 24px 28px; }
        .ratings-box-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ratings-box-title { font-size: 1.05rem; font-weight: 700; color: #18181b; }
        .ratings-avg { display: flex; align-items: center; gap: 6px; font-size: 0.95rem; font-weight: 700; color: #18181b; }
        .ratings-avg-star { color: #f59e0b; font-size: 1rem; }
        .ratings-avg-count { font-size: 0.8rem; font-weight: 400; color: #71717a; }
        .ratings-empty { font-size: 0.875rem; color: #a1a1aa; text-align: center; padding: 12px 0; }

        .ratings-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .ratings-row:last-child { margin-bottom: 0; }
        .ratings-label { font-size: 0.82rem; color: #52525b; width: 46px; flex-shrink: 0; text-align: right; }
        .ratings-bar-track { flex: 1; height: 10px; background: #f0f0f2; border-radius: 99px; overflow: hidden; }
        .ratings-bar-fill { height: 100%; border-radius: 99px; background: #e879f9; transition: width 0.4s ease; }
        .ratings-pct { font-size: 0.8rem; color: #71717a; width: 32px; flex-shrink: 0; text-align: right; }

        /* RATE THIS PRODUCT */
        .rating-section { margin-top: 28px; background: white; border: 1px solid #e4e4e7; border-radius: 20px; padding: 28px; }
        .rating-section h3 { font-size: 1.05rem; font-weight: 700; color: #18181b; margin-bottom: 6px; }
        .rating-section > p { font-size: 0.85rem; color: #71717a; margin-bottom: 20px; }

        .stars-row { display: flex; gap: 6px; margin-bottom: 20px; }
        .star-btn { background: none; border: none; cursor: pointer; padding: 0; font-size: 2rem; line-height: 1; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.2); }

        .rating-textarea { width: 100%; border: 1px solid #e4e4e7; border-radius: 12px; padding: 12px 14px; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; color: #18181b; resize: none; height: 100px; outline: none; background: #fafafa; transition: border-color 0.15s; margin-bottom: 14px; }
        .rating-textarea:focus { border-color: #7c3aed; }
        .rating-textarea::placeholder { color: #a1a1aa; }

        .rating-submit-btn { background: #18181b; color: white; border: none; border-radius: 10px; padding: 11px 24px; font-size: 0.875rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .rating-submit-btn:hover:not(:disabled) { background: #27272a; }
        .rating-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rating-edit-btn { background: none; border: 1px solid #e4e4e7; border-radius: 10px; padding: 11px 24px; font-size: 0.875rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; color: #71717a; margin-left: 10px; transition: border-color 0.15s, color 0.15s; }
        .rating-edit-btn:hover { border-color: #18181b; color: #18181b; }

        .rating-success { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; font-size: 0.875rem; color: #16a34a; font-weight: 500; margin-bottom: 16px; }
        .submitted-stars { display: flex; gap: 4px; margin-bottom: 10px; font-size: 1.4rem; }
        .submitted-review { font-size: 0.875rem; color: #52525b; line-height: 1.6; font-style: italic; margin-bottom: 14px; }

        /* RIGHT CARD */
        .watch-card { background: white; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.06); position: sticky; top: 24px; }
        .watch-card-thumb { width: 100%; height: 160px; background: linear-gradient(135deg, #18181b 0%, #3f3f46 100%); overflow: hidden; }
        .watch-card-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .watch-card-body { padding: 20px; }
        .watch-card-title { font-family: 'DM Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #18181b; line-height: 1.3; margin-bottom: 4px; }
        .watch-card-type { font-size: 0.75rem; color: #a1a1aa; font-weight: 400; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
        .watch-divider { height: 1px; background: #f0f0f2; margin: 16px 0; }
        .watch-price { font-size: 1.6rem; font-weight: 700; color: #18181b; margin-bottom: 14px; }
        .watch-price .free { font-size: 1.1rem; font-weight: 600; color: #16a34a; background: #f0fdf4; padding: 6px 14px; border-radius: 20px; display: inline-block; }
        .watch-buy-btn { width: 100%; padding: 14px; background: #18181b; color: white; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s, transform 0.1s; letter-spacing: 0.01em; margin-bottom: 10px; }
        .watch-buy-btn:hover:not(:disabled) { background: #27272a; transform: translateY(-1px); }
        .watch-buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .watch-buy-btn.free { background: #16a34a; }
        .watch-buy-btn.free:hover:not(:disabled) { background: #15803d; }
        .watch-download-btn { width: 100%; padding: 14px; background: #7c3aed; color: white; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s, transform 0.1s; text-decoration: none; display: block; text-align: center; margin-bottom: 10px; }
        .watch-download-btn:hover { background: #6d28d9; transform: translateY(-1px); }
        .watch-guarantee { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #a1a1aa; text-align: center; justify-content: center; }
        .watch-owned-badge { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #16a34a; font-weight: 500; background: #f0fdf4; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="watch-wrap">
        <nav className="watch-nav">
          <a href="/" className="watch-nav-logo">Zelteb</a>
          <a href="/dashboard" className="watch-nav-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </a>
        </nav>

        <div className="watch-body">

          {/* LEFT */}
          <div className="watch-left">
            <div className="watch-thumb">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={video.title} />
              ) : (
                <div className="watch-thumb-placeholder">
                  {video.product_type === "video" ? "🎬" : "📁"}
                </div>
              )}
              <span className="watch-type-badge">
                {video.product_type === "video" ? "🎬 Video" : "📁 Digital"}
              </span>
            </div>

            <h1 className="watch-title">{video.title}</h1>

            {video.description && (
              <div
                className="watch-description"
                dangerouslySetInnerHTML={{ __html: video.description }}
              />
            )}

            {/* ⭐ RATINGS BREAKDOWN — visible to everyone */}
            <div className="ratings-box">
              <div className="ratings-box-header">
                <span className="ratings-box-title">Ratings</span>
                {avgRating ? (
                  <span className="ratings-avg">
                    <span className="ratings-avg-star">★</span>
                    {avgRating}
                    <span className="ratings-avg-count">({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</span>
                  </span>
                ) : null}
              </div>

              {totalRatings === 0 ? (
                <p className="ratings-empty">No ratings yet. Be the first to rate!</p>
              ) : (
                [5, 4, 3, 2, 1].map(star => (
                  <div className="ratings-row" key={star}>
                    <span className="ratings-label">{star} {star === 1 ? "star" : "stars"}</span>
                    <div className="ratings-bar-track">
                      <div
                        className="ratings-bar-fill"
                        style={{ width: `${pctFor(star)}%` }}
                      />
                    </div>
                    <span className="ratings-pct">{pctFor(star)}%</span>
                  </div>
                ))
              )}
            </div>

            {/* ⭐ RATE THIS PRODUCT — only for owners */}
            {owned && (
              <div className="rating-section">
                <h3>Rate this product</h3>
                <p>Your feedback helps other buyers make better decisions.</p>

                {ratingSubmitted && (
                  <div className="rating-success">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Rating submitted — thank you!
                  </div>
                )}

                {ratingSubmitted ? (
                  <>
                    <div className="submitted-stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s}>{s <= selectedStar ? "⭐" : "☆"}</span>
                      ))}
                    </div>
                    {review && <p className="submitted-review">"{review}"</p>}
                    <button className="rating-edit-btn" onClick={() => setRatingSubmitted(false)}>
                      Edit rating
                    </button>
                  </>
                ) : (
                  <>
                    <div className="stars-row">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          className="star-btn"
                          onMouseEnter={() => setHoverStar(s)}
                          onMouseLeave={() => setHoverStar(0)}
                          onClick={() => setSelectedStar(s)}
                        >
                          {s <= displayStar ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="rating-textarea"
                      placeholder="Share your experience (optional)..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />

                    <button
                      className="rating-submit-btn"
                      onClick={submitRating}
                      disabled={ratingLoading || selectedStar === 0}
                    >
                      {ratingLoading ? "Submitting..." : existingRating ? "Update rating" : "Submit rating"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: BUY CARD */}
          <div className="watch-card">
            {thumbnailUrl && (
              <div className="watch-card-thumb">
                <img src={thumbnailUrl} alt={video.title} />
              </div>
            )}

            <div className="watch-card-body">
              <div className="watch-card-title">{video.title}</div>
              <div className="watch-card-type">
                {video.product_type === "video" ? "Video" : "Digital Product"}
              </div>

              <div className="watch-divider" />

              {owned && (
                <div className="watch-owned-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  You own this product
                </div>
              )}

              <div className="watch-price">
                {video.is_free
                  ? <span className="free">Free</span>
                  : `₹${video.price}`
                }
              </div>

              {owned ? (
                downloadUrl ? (
                  <a href={downloadUrl} className="watch-download-btn">
                    {video.product_type === "video" ? "▶ Watch / Download" : "⬇ Download"}
                  </a>
                ) : (
                  <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#a1a1aa", padding: "12px 0" }}>
                    Preparing download...
                  </div>
                )
              ) : (
                <button
                  className={`watch-buy-btn ${video.is_free ? "free" : ""}`}
                  onClick={buy}
                  disabled={loading}
                >
                  {loading ? "Processing..." : video.is_free ? "Get for Free" : `Buy for ₹${video.price}`}
                </button>
              )}

              <div className="watch-guarantee">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Secure checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}