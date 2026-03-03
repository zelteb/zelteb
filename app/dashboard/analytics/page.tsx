"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

interface Purchase {
  id: string;
  price: number;
  creator_earnings: number;
  created_at: string;
  video_title: string;
}

type Period = "7" | "30" | "90" | "365";

const COLORS = ["#111", "#555", "#999", "#bbb", "#ddd"];

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
  const [profileViews, setProfileViews] = useState<{ date: string; views: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("purchases")
        .select("id, price, creator_earnings, created_at, videos!purchases_video_id_fkey(title)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: true });

      if (data) {
        setPurchases(data.map((p: any) => ({
          id: p.id,
          price: Number(p.price),
          creator_earnings: Number(p.creator_earnings),
          created_at: p.created_at,
          video_title: p.videos?.title ?? "Untitled",
        })));
      }

      // Fetch profile views if you have a views table, else mock for now
      // const { data: views } = await supabase.from("profile_views").select(...).eq("creator_id", user.id);
      // setProfileViews(views || []);

      setLoading(false);
    };
    load();
  }, []);

  // Filter by period
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));
  const filtered = purchases.filter(p => new Date(p.created_at) >= cutoff);

  // ── Revenue over time (line chart)
  const revenueMap: Record<string, { revenue: number; earnings: number }> = {};
  filtered.forEach(p => {
    const d = new Date(p.created_at);
    // Group by week for 90d/365d, by day otherwise
    let key: string;
    if (period === "365") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else {
      key = d.toISOString().split("T")[0];
    }
    if (!revenueMap[key]) revenueMap[key] = { revenue: 0, earnings: 0 };
    revenueMap[key].revenue += p.price;
    revenueMap[key].earnings += p.creator_earnings;
  });

  // Fill in all days/months in range
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

  // ── Top products (bar chart)
  const productMap: Record<string, { title: string; revenue: number; sales: number }> = {};
  filtered.forEach(p => {
    if (!productMap[p.video_title]) productMap[p.video_title] = { title: p.video_title, revenue: 0, sales: 0 };
    productMap[p.video_title].revenue += p.creator_earnings;
    productMap[p.video_title].sales += 1;
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // ── Revenue share by product (pie)
  const pieData = topProducts.map(p => ({ name: p.title, value: p.revenue }));

  // ── Summary stats
  const totalRevenue = filtered.reduce((s, p) => s + p.price, 0);
  const totalEarnings = filtered.reduce((s, p) => s + p.creator_earnings, 0);
  const totalSales = filtered.length;
  const avgOrder = totalSales > 0 ? totalRevenue / totalSales : 0;

  // ── Sales velocity (sales per day)
  const salesPerDay = totalSales / Number(period);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs shadow-lg">
        <p className="text-gray-500 mb-2 font-medium">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
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

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 au">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Creator Analytics</p>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Analytics
            </h1>
          </div>

          {/* Period toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p.value
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Gross Revenue", value: formatINR(totalRevenue), sub: `${totalSales} sales`, delay: "au1" },
            { label: "Your Earnings", value: formatINR(totalEarnings), sub: "After platform fee", delay: "au2" },
            { label: "Avg Order Value", value: formatINR(avgOrder), sub: "Per transaction", delay: "au3" },
            { label: "Sales / Day", value: salesPerDay.toFixed(1), sub: `Over ${period} days`, delay: "au4" },
          ].map((card) => (
            <div key={card.label} className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm au ${card.delay}`}>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">{card.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue Over Time — Line Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 au au3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Revenue Over Time</p>
              <p className="text-lg font-bold text-gray-900">Gross vs Earnings</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gray-300 inline-block rounded" />Gross</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gray-900 inline-block rounded" />Earnings</span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#bbb", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={period === "7" ? 0 : period === "30" ? 4 : period === "90" ? 9 : 0}
                />
                <YAxis
                  tick={{ fill: "#bbb", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? "0" : `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Gross" stroke="#d0d0d0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="earnings" name="Earnings" stroke="#111" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom row: Bar + Pie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Top Products — Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm au au4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Top Products</p>
            <p className="text-lg font-bold text-gray-900 mb-6">By Earnings</p>
            {topProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "#bbb", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fill: "#555", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                    tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f9f9" }} />
                  <Bar dataKey="revenue" name="Earnings" fill="#111" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue Share — Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm au au5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Revenue Share</p>
            <p className="text-lg font-bold text-gray-900 mb-6">By Product</p>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-700 truncate">{entry.name.length > 16 ? entry.name.slice(0, 16) + "…" : entry.name}</p>
                        <p className="text-xs text-gray-400">{formatINR(entry.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Views placeholder */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm au au5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Profile Traffic</p>
              <p className="text-lg font-bold text-gray-900">Page Views</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">Coming soon</span>
          </div>
          <div className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-100 rounded-xl">
            <svg className="w-6 h-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-xs text-gray-300">Add a <code className="bg-gray-50 px-1 rounded">profile_views</code> table to track visits</p>
          </div>
        </div>

      </div>
    </div>
  );
}