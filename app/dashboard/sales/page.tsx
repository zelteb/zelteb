"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

interface SaleRow {
  id: string;
  price: number;
  platform_fee: number;
  creator_earnings: number;
  created_at: string;
  video_id: string;
  buyer_id: string;
  video_title: string;
  buyer_email: string;
  buyer_name: string;
}

interface ProductStat {
  title: string;
  revenue: number;
  sales: number;
  earnings: number;
}

const PLATFORM_FEE_RATE = 0.06;

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function SalesPage() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "buyers">("overview");

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select(`id, price, platform_fee, creator_earnings, created_at, video_id, buyer_id, videos!purchases_video_id_fkey (title)`)
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !purchases) { setLoading(false); return; }

    const buyerIds = [...new Set(purchases.map((p: any) => p.buyer_id))];

    let buyerMap: Record<string, { email: string; name: string }> = {};
    try {
      const res = await fetch("/api/get-buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer_ids: buyerIds }),
      });
      if (res.ok) {
        const buyers = await res.json();
        buyers.forEach((b: any) => {
          buyerMap[b.id] = {
            email: b.email ?? "—",
            name: b.raw_user_meta_data?.full_name ?? b.email ?? "Unknown",
          };
        });
      }
    } catch { /* fallback silently */ }

    const enriched: SaleRow[] = purchases.map((p: any) => {
      const price = Number(p.price);
      const fee = price * PLATFORM_FEE_RATE;
      return {
        id: p.id,
        price,
        platform_fee: fee,
        creator_earnings: price - fee,
        created_at: p.created_at,
        video_id: p.video_id,
        buyer_id: p.buyer_id,
        video_title: (p.videos as any)?.title ?? "Untitled",
        buyer_email: buyerMap[p.buyer_id]?.email ?? "—",
        buyer_name: buyerMap[p.buyer_id]?.name ?? "—",
      };
    });

    const revenue = enriched.reduce((s, p) => s + p.price, 0);
    const earnings = enriched.reduce((s, p) => s + p.creator_earnings, 0);
    const fees = enriched.reduce((s, p) => s + p.platform_fee, 0);

    setTotalRevenue(revenue);
    setTotalEarnings(earnings);
    setTotalFees(fees);

    const productMap: Record<string, ProductStat> = {};
    enriched.forEach((p) => {
      if (!productMap[p.video_title])
        productMap[p.video_title] = { title: p.video_title, revenue: 0, sales: 0, earnings: 0 };
      productMap[p.video_title].revenue += p.price;
      productMap[p.video_title].sales += 1;
      productMap[p.video_title].earnings += p.creator_earnings;
    });

    setProductStats(Object.values(productMap).sort((a, b) => b.revenue - a.revenue));
    setSales(enriched);
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: 12, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <p style={{ color: "#aaa", marginBottom: 4, fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
        <p style={{ color: "#111", fontWeight: 600 }}>{formatINR(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up   { animation: fadeUp 0.35s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.35s 0.08s ease both; }
        .fade-up-3 { animation: fadeUp 0.35s 0.16s ease both; }
        .fade-up-4 { animation: fadeUp 0.35s 0.24s ease both; }

        .stat-card { background: #fff; border: 1px solid #ececec; border-radius: 16px; transition: box-shadow 0.2s ease, border-color 0.2s ease; }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); border-color: #d8d8d8; }

        .row-hover { transition: background 0.15s ease; }
        .row-hover:hover { background: #f7f7f7; }

        .tab-btn {
          font-size: 13px; font-weight: 500; letter-spacing: 0.01em;
          padding-bottom: 12px; border-bottom: 2px solid transparent;
          color: #aaa; transition: color 0.2s, border-color 0.2s;
          background: none; border-top: none; border-left: none; border-right: none;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
        }
        .tab-btn.active { color: #111; border-bottom-color: #111; }
        .tab-btn:hover:not(.active) { color: #555; }

        .badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 99px; letter-spacing: 0.02em; }

        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Mobile sale card */
        .sale-card { padding: 14px 16px; border-bottom: 1px solid #f5f5f5; }
        .sale-card:last-child { border-bottom: none; }
        .sale-card-title { font-size: 13px; font-weight: 500; color: #222; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sale-card-row { display: flex; justify-content: space-between; align-items: center; }
        .sale-card-meta { font-size: 12px; color: #bbb; }
        .sale-card-amounts { display: flex; gap: 12px; align-items: center; }
        .sale-card-fee { font-size: 12px; color: #dc2626; }
        .sale-card-earnings { font-size: 14px; font-weight: 600; color: #16a34a; }

        /* Buyer card (mobile) */
        .buyer-card { padding: 14px 16px; border-bottom: 1px solid #f5f5f5; display: flex; align-items: center; gap: 12px; }
        .buyer-card:last-child { border-bottom: none; }
        .buyer-avatar { width: 34px; height: 34px; border-radius: 10px; background: #f0f0f0; border: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #666; flex-shrink: 0; }
        .buyer-card-content { flex: 1; min-width: 0; }
        .buyer-card-name { font-size: 13px; font-weight: 500; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .buyer-card-email { font-size: 11px; color: #aaa; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .buyer-card-product { font-size: 11px; color: #999; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .buyer-card-right { text-align: right; flex-shrink: 0; }
        .buyer-card-price { font-size: 13px; font-weight: 600; color: #16a34a; }
        .buyer-card-date { font-size: 11px; color: #bbb; margin-top: 2px; }

        /* Show/hide by screen size */
        .mobile-only { display: block; }
        .desktop-only { display: none; }
        @media (min-width: 640px) {
          .mobile-only { display: none; }
          .desktop-only { display: block; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-7 sm:mb-10 fade-up">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: "#aaa", textTransform: "uppercase", marginBottom: 6 }}>
              Creator Dashboard
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", lineHeight: 1 }}>
              Sales Overview
            </h1>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">

            {/* On mobile: single row of 3 compact cards */}
            <style>{`
              @media (max-width: 639px) {
                .stat-cards-mobile { display: grid !important; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                .stat-card-mobile-compact { padding: 12px 14px !important; }
                .stat-card-icon { display: none; }
                .stat-card-bignum { font-size: 18px !important; }
                .stat-card-sub { font-size: 11px !important; }
              }
            `}</style>

            <div className="stat-card p-5 sm:p-6 fade-up stat-card-mobile-compact">
              <div className="stat-card-icon" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Revenue</p>
              </div>
              <p className="stat-card-label" style={{ fontSize: 11, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "none" }}>Revenue</p>
              <p className="stat-card-bignum" style={{ fontSize: 26, fontWeight: 700, color: "#111", letterSpacing: "-0.03em" }}>{formatINR(totalRevenue)}</p>
              <p className="stat-card-sub" style={{ fontSize: 12, color: "#bbb", marginTop: 5 }}>{sales.length} transaction{sales.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="stat-card p-5 sm:p-6 fade-up-2 stat-card-mobile-compact">
              <div className="stat-card-icon" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Your Earnings</p>
              </div>
              <p className="stat-card-bignum" style={{ fontSize: 26, fontWeight: 700, color: "#16a34a", letterSpacing: "-0.03em" }}>{formatINR(totalEarnings)}</p>
              <p className="stat-card-sub" style={{ fontSize: 12, color: "#bbb", marginTop: 5 }}>After 6% fee</p>
            </div>

            <div className="stat-card p-5 sm:p-6 fade-up-3 stat-card-mobile-compact">
              <div className="stat-card-icon" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Platform Fee</p>
              </div>
              <p className="stat-card-bignum" style={{ fontSize: 26, fontWeight: 700, color: "#dc2626", letterSpacing: "-0.03em" }}>{formatINR(totalFees)}</p>
              <p className="stat-card-sub" style={{ fontSize: 12, color: "#bbb", marginTop: 5 }}>6% of gross</p>
            </div>
          </div>
        )}

        {/* ── Bar Chart ── */}
        {!loading && productStats.length > 0 && (
          <div className="stat-card p-5 sm:p-6 mb-6 sm:mb-8 fade-up-4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>Revenue by Product</p>
              <span className="badge" style={{ background: "#f5f5f5", color: "#888", border: "1px solid #e8e8e8" }}>
                {productStats.length} product{productStats.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={productStats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="title"
                  tick={{ fill: "#bbb", fontSize: 10, fontFamily: "DM Sans, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + "…" : v}
                />
                <YAxis
                  tick={{ fill: "#bbb", fontSize: 10, fontFamily: "DM Sans, sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  width={34}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f7f7f7", radius: 6 }} />
                <Bar dataKey="revenue" fill="#111" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 16, paddingTop: 4 }}>
              {productStats.map((p, i) => (
                <div
                  key={p.title}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < productStats.length - 1 ? "1px solid #f5f5f5" : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1, marginRight: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#111", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                      <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{p.sales} sale{p.sales !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{formatINR(p.earnings)}</p>
                    <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{formatINR(p.revenue)} gross</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && sales.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }} className="fade-up">
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 8 }}>No sales yet</p>
            <p style={{ fontSize: 13, color: "#aaa" }}>Your transactions will appear here once you make a sale.</p>
          </div>
        )}

        {/* ── Tabs + Tables ── */}
        {!loading && sales.length > 0 && (
          <div className="fade-up-4">
            <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #ececec", marginBottom: 16 }}>
              <button onClick={() => setActiveTab("overview")} className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}>
                Transactions
              </button>
              <button onClick={() => setActiveTab("buyers")} className={`tab-btn ${activeTab === "buyers" ? "active" : ""}`}>
                Buyers
              </button>
            </div>

            <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 16, overflow: "hidden" }}>

              {/* ── TRANSACTIONS ── */}
              {activeTab === "overview" && (
                <>
                  {/* Mobile cards */}
                  <div className="mobile-only">
                    {sales.map((s) => (
                      <div key={s.id} className="sale-card">
                        <div className="sale-card-title">{s.video_title}</div>
                        <div className="sale-card-row">
                          <span className="sale-card-meta">
                            {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <div className="sale-card-amounts">
                            <span className="sale-card-fee">−{formatINR(s.platform_fee)}</span>
                            <span className="sale-card-earnings">{formatINR(s.creator_earnings)}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>
                          Gross: {formatINR(s.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="desktop-only" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 520 }}>
                      <thead>
                        <tr style={{ background: "#fafafa", borderBottom: "1px solid #ececec" }}>
                          {["Product", "Price", "Fee (6%)", "Earnings", "Date"].map((h) => (
                            <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((s, i) => (
                          <tr key={s.id} className="row-hover" style={{ borderBottom: i < sales.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                            <td style={{ padding: "13px 16px", color: "#222", fontWeight: 500, maxWidth: 180 }}>
                              <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.video_title}</span>
                            </td>
                            <td style={{ padding: "13px 16px", color: "#555" }}>{formatINR(s.price)}</td>
                            <td style={{ padding: "13px 16px", color: "#dc2626" }}>−{formatINR(s.platform_fee)}</td>
                            <td style={{ padding: "13px 16px", color: "#16a34a", fontWeight: 600 }}>{formatINR(s.creator_earnings)}</td>
                            <td style={{ padding: "13px 16px", color: "#bbb", fontSize: 12 }}>
                              {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── BUYERS ── */}
              {activeTab === "buyers" && (
                <>
                  {/* Mobile cards */}
                  <div className="mobile-only">
                    {sales.map((s) => (
                      <div key={s.id} className="buyer-card">
                        <div className="buyer-avatar">
                          {s.buyer_name !== "—" ? s.buyer_name[0].toUpperCase() : "?"}
                        </div>
                        <div className="buyer-card-content">
                          <div className="buyer-card-name">{s.buyer_name}</div>
                          <div className="buyer-card-email">{s.buyer_email}</div>
                          <div className="buyer-card-product">{s.video_title}</div>
                        </div>
                        <div className="buyer-card-right">
                          <div className="buyer-card-price">{formatINR(s.price)}</div>
                          <div className="buyer-card-date">
                            {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="desktop-only" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
                      <thead>
                        <tr style={{ background: "#fafafa", borderBottom: "1px solid #ececec" }}>
                          {["Buyer", "Email", "Product", "Paid", "Date"].map((h) => (
                            <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((s, i) => (
                          <tr key={s.id} className="row-hover" style={{ borderBottom: i < sales.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f0f0f0", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#666", flexShrink: 0 }}>
                                  {s.buyer_name !== "—" ? s.buyer_name[0].toUpperCase() : "?"}
                                </div>
                                <span style={{ color: "#222", fontWeight: 500, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                  {s.buyer_name}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "13px 16px", color: "#aaa", fontSize: 12 }}>{s.buyer_email}</td>
                            <td style={{ padding: "13px 16px", color: "#555", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.video_title}</td>
                            <td style={{ padding: "13px 16px", color: "#16a34a", fontWeight: 600 }}>{formatINR(s.price)}</td>
                            <td style={{ padding: "13px 16px", color: "#bbb", fontSize: 12 }}>
                              {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}