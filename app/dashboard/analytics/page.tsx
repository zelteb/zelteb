"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Purchase {
  id: string;
  price: number;
  creator_earnings: number;
  created_at: string;
  video_title: string;
  video_id: string;
}

interface VideoView {
  video_id: string;
  created_at: string;
}

type Period = "7" | "30" | "90" | "365";

const COLORS = ["#111", "#555", "#999", "#bbb", "#ddd"];

const PLATFORM_FEE = 0.06;

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function getDayLabel(date: Date, period: Period) {
  if (period === "7") return date.toLocaleDateString("en-IN", { weekday: "short" });
  if (period === "30") return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (period === "90") return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [videoViews, setVideoViews] = useState<VideoView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("id, price, creator_earnings, created_at, video_id, videos(title)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: true });

      console.log("user id:", user.id);
      console.log("purchases raw:", purchaseData);
      console.log("purchases error:", purchaseError);

      if (purchaseData) {
        setPurchases(purchaseData.map((p: any) => {
          const price = Number(p.price);
          return {
            id: p.id,
            price,
            creator_earnings: price * (1 - PLATFORM_FEE),
            created_at: p.created_at,
            video_title: p.videos?.title ?? "Untitled",
            video_id: p.video_id,
          };
        }));
      }

      const { data: myVideos } = await supabase
        .from("videos")
        .select("id")
        .eq("creator_id", user.id);

      const videoIds = (myVideos || []).map((v: any) => v.id);
      console.log("video ids:", videoIds);

      if (videoIds.length > 0) {
        const { data: viewsData, error: viewsError } = await supabase
          .from("video_views")
          .select("video_id, created_at")
          .in("video_id", videoIds);

        console.log("views raw:", viewsData);
        console.log("views error:", viewsError);

        if (viewsData) setVideoViews(viewsData);
      } else {
        console.log("views raw: skipped — no video ids found");
      }

      setLoading(false);
    };
    load();
  }, []);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));
  const filtered = purchases.filter(p => new Date(p.created_at) >= cutoff);
  const filteredViews = videoViews.filter(v => new Date(v.created_at) >= cutoff);

  const totalViews = filteredViews.length;
  const totalSales = filtered.length;
  const conversionRate = totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : "0.0";

  const revenueMap: Record<string, { revenue: number; earnings: number }> = {};
  filtered.forEach(p => {
    const d = new Date(p.created_at);
    const key = period === "365"
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      : d.toISOString().split("T")[0];
    if (!revenueMap[key]) revenueMap[key] = { revenue: 0, earnings: 0 };
    revenueMap[key].revenue += p.price;
    revenueMap[key].earnings += p.creator_earnings;
  });

  const revenueData: { label: string; revenue: number; earnings: number }[] = [];
  if (period === "365") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueData.push({
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        revenue: revenueMap[key]?.revenue ?? 0,
        earnings: revenueMap[key]?.earnings ?? 0,
      });
    }
  } else {
    for (let i = Number(period) - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      revenueData.push({
        label: getDayLabel(d, period),
        revenue: revenueMap[key]?.revenue ?? 0,
        earnings: revenueMap[key]?.earnings ?? 0,
      });
    }
  }

  const productMap: Record<string, { title: string; revenue: number; sales: number; views: number }> = {};

  filteredViews.forEach(v => {
    if (!productMap[v.video_id]) productMap[v.video_id] = { title: v.video_id, revenue: 0, sales: 0, views: 0 };
    productMap[v.video_id].views += 1;
  });

  filtered.forEach(p => {
    if (!productMap[p.video_id]) productMap[p.video_id] = { title: p.video_title, revenue: 0, sales: 0, views: 0 };
    productMap[p.video_id].revenue += p.creator_earnings;
    productMap[p.video_id].sales += 1;
    productMap[p.video_id].title = p.video_title;
  });

  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const pieData = topProducts.map(p => ({ name: p.title, value: p.revenue }));

  const totalRevenue = filtered.reduce((s, p) => s + p.price, 0);
  const totalEarnings = filtered.reduce((s, p) => s + p.creator_earnings, 0);
  const avgOrder = totalSales > 0 ? totalRevenue / totalSales : 0;
  const salesPerDay = totalSales / Number(period);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <p style={{ color: "#9ca3af", marginBottom: 6, fontWeight: 500 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}: {typeof entry.value === "number" && entry.value > 100 ? formatINR(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const periods: { label: string; value: Period }[] = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
    { label: "1Y", value: "365" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .au { animation: fadeUp 0.35s ease both; }
        .au1 { animation-delay: 0.05s; }
        .au2 { animation-delay: 0.1s; }
        .au3 { animation-delay: 0.15s; }
        .au4 { animation-delay: 0.2s; }
        .au5 { animation-delay: 0.25s; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 au">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Creator Analytics</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Analytics</h1>
          </div>
          {/* Period selector — scrollable on tiny screens */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1 self-start sm:self-auto">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p.value ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat Cards — 2-col on mobile, 5-col on desktop ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {[
            { label: "Gross Revenue", value: formatINR(totalRevenue), sub: `${totalSales} sales`, delay: "au1" },
            { label: "Your Earnings", value: formatINR(totalEarnings), sub: "After 6% fee", delay: "au2" },
            { label: "Avg Order", value: formatINR(avgOrder), sub: "Per transaction", delay: "au3" },
            { label: "Sales / Day", value: salesPerDay.toFixed(1), sub: `Over ${period} days`, delay: "au4" },
            { label: "Conversion", value: `${conversionRate}%`, sub: `${totalViews} views → ${totalSales}`, delay: "au5", highlight: true },
          ].map((card, i) => (
            <div
              key={card.label}
              className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm au ${card.delay} ${card.highlight ? "border-gray-900" : "border-gray-100"} ${
                // make the last card span full width on 2-col grid when count is odd
                i === 4 ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 leading-tight">{card.label}</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Revenue Over Time ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm mb-5 sm:mb-6 au au3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Revenue Over Time</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">Gross vs Earnings</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-gray-300 inline-block rounded" />Gross
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-gray-900 inline-block rounded" />Earnings
              </span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#bbb", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval={period === "7" ? 0 : period === "30" ? 4 : period === "90" ? 9 : 0}
                />
                <YAxis
                  tick={{ fill: "#bbb", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? "0" : `₹${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Gross" stroke="#d0d0d0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="earnings" name="Earnings" stroke="#111" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Bottom row: Bar + Pie — stack on mobile ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">

          {/* Bar chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm au au4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Top Products</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">By Earnings</p>
            {topProducts.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "#bbb", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fill: "#555", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tickFormatter={(v: string) => v.length > 11 ? v.slice(0, 11) + "…" : v}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f9f9" }} />
                  <Bar dataKey="revenue" name="Earnings" fill="#111" radius={[0, 6, 6, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm au au5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Revenue Share</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">By Product</p>
            {pieData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 min-w-0">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-700 truncate">{entry.name.length > 14 ? entry.name.slice(0, 14) + "…" : entry.name}</p>
                        <p className="text-xs text-gray-400">{formatINR(entry.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Conversion Table — horizontal scroll on mobile ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden au au5">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Conversion Breakdown</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">Per Product</p>
          </div>
          {topProducts.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-300 text-sm">No data for this period</div>
          ) : (
            /* Wrap in a scroll container so table never breaks layout on narrow phones */
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full text-sm" style={{ minWidth: 480 }}>
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-widest font-normal">Product</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs text-gray-400 uppercase tracking-widest font-normal">Views</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs text-gray-400 uppercase tracking-widest font-normal">Sales</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs text-gray-400 uppercase tracking-widest font-normal">Conv.</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs text-gray-400 uppercase tracking-widest font-normal">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((p) => {
                    const conv = p.views > 0 ? ((p.sales / p.views) * 100).toFixed(1) : "—";
                    const convNum = p.views > 0 ? (p.sales / p.views) * 100 : 0;
                    return (
                      <tr key={p.title} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3.5 text-gray-900 font-medium" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</td>
                        <td className="px-4 sm:px-6 py-3.5 text-right text-gray-500">{p.views}</td>
                        <td className="px-4 sm:px-6 py-3.5 text-right text-gray-500">{p.sales}</td>
                        <td className="px-4 sm:px-6 py-3.5 text-right">
                          <span className={`font-semibold ${convNum >= 5 ? "text-green-600" : convNum >= 2 ? "text-amber-500" : "text-gray-400"}`}>
                            {conv}{conv !== "—" ? "%" : ""}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-right font-semibold text-gray-900">{formatINR(p.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}