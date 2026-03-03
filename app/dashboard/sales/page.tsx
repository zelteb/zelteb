"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select(`
        id,
        price,
        platform_fee,
        creator_earnings,
        created_at,
        video_id,
        buyer_id,
        videos!purchases_video_id_fkey (
          title
        )
      `)
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !purchases) {
      console.error("Purchases fetch error:", error);
      setLoading(false);
      return;
    }

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
    } catch {
      // fallback silently
    }

    const enriched: SaleRow[] = purchases.map((p: any) => ({
      id: p.id,
      price: Number(p.price),
      platform_fee: Number(p.platform_fee),
      creator_earnings: Number(p.creator_earnings),
      created_at: p.created_at,
      video_id: p.video_id,
      buyer_id: p.buyer_id,
      video_title: (p.videos as any)?.title ?? "Untitled",
      buyer_email: buyerMap[p.buyer_id]?.email ?? "—",
      buyer_name: buyerMap[p.buyer_id]?.name ?? "—",
    }));

    const revenue = enriched.reduce((s, p) => s + p.price, 0);
    const earnings = enriched.reduce((s, p) => s + p.creator_earnings, 0);
    const fees = enriched.reduce((s, p) => s + p.platform_fee, 0);

    setTotalRevenue(revenue);
    setTotalEarnings(earnings);
    setTotalFees(fees);

    const productMap: Record<string, ProductStat> = {};
    enriched.forEach((p) => {
      if (!productMap[p.video_title]) {
        productMap[p.video_title] = { title: p.video_title, revenue: 0, sales: 0, earnings: 0 };
      }
      productMap[p.video_title].revenue += p.price;
      productMap[p.video_title].sales += 1;
      productMap[p.video_title].earnings += p.creator_earnings;
    });

    setProductStats(Object.values(productMap).sort((a, b) => b.revenue - a.revenue));
    setSales(enriched);
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm shadow-xl">
          <p className="text-gray-500 mb-1 truncate max-w-[160px]">{label}</p>
          <p className="text-gray-900 font-semibold">{formatINR(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        .tab-active { border-bottom: 2px solid #111; color: #111; }
        .tab-inactive { border-bottom: 2px solid transparent; color: #aaa; }
        .stat-card { background: #f9f9f9; border: 1px solid #e5e5e5; }
        .stat-card:hover { border-color: #d0d0d0; }
        .row-hover:hover { background: #f9f9f9; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.4s 0.3s ease both; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 fade-up">
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-1">Creator Dashboard</p>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Sales
          </h1>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card rounded-2xl p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="stat-card rounded-2xl p-6 fade-up">
              <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                {formatINR(totalRevenue)}
              </p>
              <p className="text-gray-300 text-xs mt-2">{sales.length} transactions</p>
            </div>
            <div className="stat-card rounded-2xl p-6 fade-up-2">
              <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">Your Earnings</p>
              <p className="text-3xl font-bold text-green-600" style={{ fontFamily: "'Syne', sans-serif" }}>
                {formatINR(totalEarnings)}
              </p>
              <p className="text-gray-300 text-xs mt-2">After 7% platform fee</p>
            </div>
            <div className="stat-card rounded-2xl p-6 fade-up-3">
              <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">Platform Fee (7%)</p>
              <p className="text-3xl font-bold text-red-500" style={{ fontFamily: "'Syne', sans-serif" }}>
                {formatINR(totalFees)}
              </p>
              <p className="text-gray-300 text-xs mt-2">
                {totalRevenue > 0 ? ((totalFees / totalRevenue) * 100).toFixed(1) : 0}% of gross
              </p>
            </div>
          </div>
        )}

        {/* Product Chart */}
        {!loading && productStats.length > 0 && (
          <div className="stat-card rounded-2xl p-6 mb-8 fade-up-4" style={{ border: "1px solid #e5e5e5" }}>
            <p className="text-gray-400 text-xs tracking-widest uppercase mb-6">Revenue by Product</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis
                  dataKey="title"
                  tick={{ fill: "#aaa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                />
                <YAxis
                  tick={{ fill: "#aaa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f5" }} />
                <Bar dataKey="revenue" fill="#111" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 divide-y divide-gray-100">
              {productStats.map((p) => (
                <div key={p.title} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.sales} sale{p.sales !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">{formatINR(p.earnings)}</p>
                    <p className="text-xs text-gray-400">{formatINR(p.revenue)} gross</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No sales state */}
        {!loading && sales.length === 0 && (
          <div className="text-center py-20 fade-up">
            <p className="text-gray-300 text-xs tracking-widest uppercase mb-2">No sales yet</p>
            <p className="text-gray-400 text-sm">Your transactions will appear here once you make a sale.</p>
          </div>
        )}

        {/* Tabs + Tables */}
        {!loading && sales.length > 0 && (
          <>
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 text-xs tracking-widest uppercase transition-all ${activeTab === "overview" ? "tab-active" : "tab-inactive"}`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("buyers")}
                className={`pb-3 text-xs tracking-widest uppercase transition-all ${activeTab === "buyers" ? "tab-active" : "tab-inactive"}`}
              >
                Buyers
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e5e5" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Product</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Price</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Fee</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Earnings</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.id} className="row-hover transition-colors" style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td className="p-4 text-gray-900 max-w-[180px] truncate">{s.video_title}</td>
                        <td className="p-4 text-gray-500">{formatINR(s.price)}</td>
                        <td className="p-4 text-red-500">-{formatINR(s.platform_fee)}</td>
                        <td className="p-4 text-green-600 font-medium">{formatINR(s.creator_earnings)}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "buyers" && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e5e5" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Buyer</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Email</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Product</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Paid</th>
                      <th className="p-4 text-left text-gray-400 text-xs tracking-widest uppercase font-normal">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.id} className="row-hover transition-colors" style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                              {s.buyer_name !== "—" ? s.buyer_name[0].toUpperCase() : "?"}
                            </div>
                            <span className="text-gray-900 truncate max-w-[120px]">{s.buyer_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 text-xs">{s.buyer_email}</td>
                        <td className="p-4 text-gray-500 truncate max-w-[160px]">{s.video_title}</td>
                        <td className="p-4 text-green-600 font-medium">{formatINR(s.price)}</td>
                        <td className="p-4 text-gray-400 text-xs">
                          {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}