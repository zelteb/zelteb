"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [platformTotal, setPlatformTotal] = useState(0);
  const [creatorTotal, setCreatorTotal] = useState(0);

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
        .from("purchases")
        .select("amount, created_at, videos(*)")
        .eq("videos.creator_id", user.id);

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      const rows = data || [];
      setSales(rows);

      let revenue = 0;
      rows.forEach((s) => (revenue += s.amount));

      const platform = revenue * 0.06;
      const creator = revenue - platform;

      setTotalRevenue(revenue);
      setPlatformTotal(platform);
      setCreatorTotal(creator);
      setLoading(false);
    };

    load();
  }, []);

  const productCounts: Record<string, { count: number; amount: number }> = {};
  sales.forEach((s) => {
    const title = s.videos?.title || "Unknown";
    if (!productCounts[title]) productCounts[title] = { count: 0, amount: 0 };
    productCounts[title].count += 1;
    productCounts[title].amount += s.amount;
  });

  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .page-wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 56px 24px 80px;
        }

        .page-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #1a1612;
          line-height: 1.1;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 13px;
          color: #9c9589;
          letter-spacing: 0.04em;
          font-weight: 500;
        }

        .header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
        }

        .tx-pill {
          background: #1a1612;
          color: #f5f4f0;
          border-radius: 100px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Stat cards */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: #fff;
          border-radius: 20px;
          padding: 26px 28px;
          border: 1.5px solid #ece9e3;
          transition: box-shadow 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        .stat-card.full { grid-column: 1 / -1; }

        .stat-card.hero {
          background: #1a1612;
          border-color: #1a1612;
        }

        .stat-card.withdrawable {
          background: linear-gradient(135deg, #f0fce8 0%, #e4f5d4 100%);
          border-color: #c6e8a0;
        }

        .stat-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a89f92;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .stat-card.hero .stat-label { color: #6b6456; }
        .stat-card.withdrawable .stat-label { color: #5a8c2a; }

        .stat-value {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 34px;
          font-weight: 800;
          color: #1a1612;
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .stat-card.hero .stat-value { color: #f5f4f0; }
        .stat-card.withdrawable .stat-value { color: #3a6e10; }

        .stat-sub {
          font-size: 11px;
          color: #6aab2e;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 10px;
        }

        /* Section */
        .section-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1612;
          margin-bottom: 14px;
          margin-top: 44px;
          letter-spacing: -0.2px;
        }

        /* Row cards */
        .row-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1.5px solid #ece9e3;
          margin-bottom: 8px;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .row-card:hover {
          border-color: #d8d2c8;
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        }

        .row-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1612;
          margin-bottom: 5px;
        }

        .row-sub {
          font-size: 12px;
          color: #a89f92;
          font-weight: 500;
        }

        .pill {
          display: inline-block;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          background: #f0ece4;
          color: #7a7060;
          border: 1px solid #e0d8cc;
        }

        .pill.earn {
          background: #ecfade;
          color: #3d7a14;
          border-color: #b8e490;
        }

        .pill-row {
          display: flex;
          gap: 6px;
          align-items: center;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .amount-right {
          text-align: right;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .amount-main {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #3d7a14;
          letter-spacing: -0.2px;
        }

        .amount-sub {
          font-size: 11px;
          color: #b0a898;
          margin-top: 3px;
        }

        .date-tag {
          font-size: 11px;
          color: #b0a898;
          margin-top: 6px;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 64px 20px;
          color: #c4bdb3;
          font-size: 14px;
          font-weight: 500;
          background: #fff;
          border: 2px dashed #e4dfd7;
          border-radius: 20px;
        }

        .loading-state {
          text-align: center;
          padding: 64px 20px;
          color: #b0a898;
          font-size: 14px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .fade-up:nth-child(1) { animation-delay: 0.04s; }
        .fade-up:nth-child(2) { animation-delay: 0.08s; }
        .fade-up:nth-child(3) { animation-delay: 0.12s; }
        .fade-up:nth-child(4) { animation-delay: 0.16s; }
        .fade-up:nth-child(5) { animation-delay: 0.20s; }
      `}</style>

      <div className="page-wrap">

        {/* Header */}
        <div className="header-row">
          <div>
            <h1 className="page-title">Sales</h1>
            <p className="page-subtitle">Your earnings overview</p>
          </div>
          <div className="tx-pill">{sales.length} transactions</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">Loading your sales…</div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="stats-grid">
            <div className="stat-card full hero fade-up">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">₹{totalRevenue.toFixed(2)}</div>
            </div>

            <div className="stat-card fade-up">
              <div className="stat-label">Your Earnings</div>
              <div className="stat-value">₹{creatorTotal.toFixed(2)}</div>
            </div>

            <div className="stat-card fade-up">
              <div className="stat-label">Platform Fees (6%)</div>
              <div className="stat-value" style={{ color: "#c4bdb3" }}>₹{platformTotal.toFixed(2)}</div>
            </div>

            <div className="stat-card full withdrawable fade-up">
              <div className="stat-label">Withdrawable Balance</div>
              <div className="stat-value">₹{creatorTotal.toFixed(2)}</div>
              <div className="stat-sub">Available to withdraw</div>
            </div>
          </div>
        )}

        {/* Product Breakdown */}
        {!loading && Object.keys(productCounts).length > 0 && (
          <>
            <div className="section-label">By Product</div>
            {Object.entries(productCounts).map(([title, { count, amount }], i) => (
              <div className="row-card fade-up" key={i}>
                <div>
                  <div className="row-title">{title}</div>
                  <div className="row-sub">{count} sale{count !== 1 ? "s" : ""}</div>
                </div>
                <div className="amount-right">
                  <div className="amount-main">₹{amount.toFixed(2)}</div>
                  <div className="amount-sub">you keep ₹{(amount * 0.94).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Transactions */}
        {!loading && (
          <>
            <div className="section-label">Transactions</div>

            {sales.length === 0 ? (
              <div className="empty-state">
                No sales yet. Share to start earning.
              </div>
            ) : (
              sales.map((s, i) => {
                const platformCut = s.amount * 0.06;
                const creatorEarn = s.amount - platformCut;
                const date = s.created_at
                  ? new Date(s.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : null;

                return (
                  <div className="row-card fade-up" key={i}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>
                        {s.videos?.title || "Unknown video"}
                      </div>
                      <div className="pill-row">
                        <span className="pill">₹{s.amount} paid</span>
                        <span className="pill">₹{platformCut.toFixed(2)} fee</span>
                      </div>
                      {date && <div className="date-tag">{date}</div>}
                    </div>
                    <div className="amount-right">
                      <span className="pill earn">+₹{creatorEarn.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

      </div>
    </div>
  );
}