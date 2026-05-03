"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Payment = {
  id: string;
  created_at: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  campaign_name: string;
  creator_name: string;
  description: string;
};

const PLATFORM_FEE = 0.06;

export default function BrandPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "failed">("all");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      if (!brand) return;

      const { data } = await supabase
        .from("payments")
        .select(`
          id, created_at, amount, status, description,
          campaigns ( name ),
          profiles ( full_name )
        `)
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false });

      if (data) {
        setPayments(
          data.map((p: any) => ({
            id: p.id,
            created_at: p.created_at,
            amount: p.amount,
            status: p.status,
            campaign_name: p.campaigns?.name ?? "—",
            creator_name: p.profiles?.full_name ?? "—",
            description: p.description ?? "",
          }))
        );
      }
      setLoading(false);
    };

    fetchPayments();
  }, []);

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalFees = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount * PLATFORM_FEE, 0);

  const fmt = (n: number) =>
    "₹" + Math.round(n).toLocaleString("en-IN");

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    paid:    { bg: "#eaf2eb", color: "#5a7a5e", label: "Paid" },
    pending: { bg: "#fef3e2", color: "#c17c2e", label: "Pending" },
    failed:  { bg: "#faeaea", color: "#a0404f", label: "Failed" },
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #faf8f4; --cream-dark: #f2ede4; --parchment: #ede8dc;
          --ink: #1a1814; --ink-soft: #3d3a34; --ink-muted: #7a7670; --ink-faint: #c4bfb6;
          --sage: #5a7a5e; --sage-light: #eaf2eb;
          --amber: #c17c2e; --amber-light: #fef3e2;
          --indigo: #3d5a8a; --indigo-light: #eaeffa;
          --rose: #a0404f; --rose-light: #faeaea;
          --border: rgba(26,24,20,0.08); --border-med: rgba(26,24,20,0.14);
          --shadow-sm: 0 1px 4px rgba(26,24,20,0.06);
          --shadow-md: 0 4px 20px rgba(26,24,20,0.08);
          --sans: 'DM Sans', system-ui, sans-serif;
          --serif: 'Lora', Georgia, serif;
        }
        body { font-family: var(--sans); background: var(--cream); color: var(--ink); }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <p style={s.breadcrumb}>
              <Link href="/brand/dashboard" style={s.breadLink}>Dashboard</Link>
              <span style={{ color: "var(--ink-faint)", margin: "0 6px" }}>/</span>
              <span style={{ color: "var(--ink-muted)" }}>Payments</span>
            </p>
            <h1 style={s.h1}>Payments</h1>
          </div>
          <button style={s.exportBtn} onClick={() => alert("Export coming soon")}>
            ↓ Export CSV
          </button>
        </div>
      </header>

      <main style={s.main}>

        {/* ── SUMMARY CARDS ── */}
        <div style={s.statsGrid} className="fade-up">
          {[
            { label: "Total paid out", value: fmt(totalPaid), sub: `incl. ${fmt(totalFees)} platform fees`, accent: "var(--sage)", bg: "var(--sage-light)" },
            { label: "Pending payments", value: fmt(totalPending), sub: `${payments.filter(p => p.status === "pending").length} transactions`, accent: "var(--amber)", bg: "var(--amber-light)" },
            { label: "Total transactions", value: payments.length.toString(), sub: `${payments.filter(p => p.status === "failed").length} failed`, accent: "var(--indigo)", bg: "var(--indigo-light)" },
          ].map(c => (
            <div key={c.label} style={{ ...s.statCard, background: c.bg, borderColor: c.accent + "33" }}>
              <div style={{ ...s.statAccent, background: c.accent }} />
              <p style={s.statLabel}>{c.label}</p>
              <p style={{ ...s.statVal, color: c.accent }}>{c.value}</p>
              <p style={s.statSub}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div style={s.filterRow}>
          {(["all", "paid", "pending", "failed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...s.filterBtn,
                ...(filter === f ? s.filterBtnActive : {}),
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{
                ...s.filterCount,
                background: filter === f ? "rgba(26,24,20,0.1)" : "var(--parchment)",
              }}>
                {f === "all" ? payments.length : payments.filter(p => p.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── TABLE ── */}
        <div style={s.tableWrap}>
          {loading ? (
            <div style={s.emptyState}>
              <div className="spin" style={s.spinner} />
              <p style={{ color: "var(--ink-muted)", marginTop: 12, fontSize: 14 }}>Loading payments…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>💸</div>
              <p style={s.emptyTitle}>No payments {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
              <p style={s.emptySub}>Payments will appear here once campaigns are active.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr style={s.theadRow}>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Campaign</th>
                  <th style={s.th}>Creator</th>
                  <th style={s.th}>Description</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Platform fee</th>
                  <th style={{ ...s.th, textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const st = statusStyle[p.status];
                  return (
                    <tr key={p.id} style={{ ...s.tr, animationDelay: `${i * 0.04}s` }} className="fade-up">
                      <td style={s.td}>
                        <span style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", color: "var(--ink-muted)" }}>
                          {fmtDate(p.created_at)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{p.campaign_name}</span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "var(--indigo-light)", color: "var(--indigo)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}>
                            {p.creator_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{p.creator_name}</span>
                        </div>
                      </td>
                      <td style={{ ...s.td, color: "var(--ink-muted)", fontSize: 13, maxWidth: 200 }}>
                        {p.description || "—"}
                      </td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 600, fontSize: 14, fontFamily: "var(--serif)" }}>
                        {fmt(p.amount)}
                      </td>
                      <td style={{ ...s.td, textAlign: "right", fontSize: 13, color: "var(--ink-muted)" }}>
                        {fmt(p.amount * PLATFORM_FEE)}
                      </td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px",
                          borderRadius: 100, fontSize: 11, fontWeight: 600,
                          background: st.bg, color: st.color,
                          border: `1px solid ${st.color}33`,
                        }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── FEE NOTE ── */}
        <p style={s.feeNote}>
          * A <strong>6% platform fee</strong> is applied to all campaign payments. This is included in the amount shown and is deducted before creator payouts.
        </p>

      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--sans)" },

  header: {
    background: "rgba(250,248,244,0.95)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 50,
  },
  headerInner: {
    maxWidth: 1100, margin: "0 auto", padding: "20px 32px",
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
  },
  breadcrumb: { fontSize: 12, color: "var(--ink-muted)", marginBottom: 4 },
  breadLink: { color: "var(--ink-muted)", textDecoration: "none", fontWeight: 500 },
  h1: { fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--ink)" },

  exportBtn: {
    padding: "9px 18px", background: "var(--cream-dark)",
    border: "1px solid var(--border-med)", borderRadius: 8,
    fontSize: 13, fontWeight: 500, color: "var(--ink-soft)",
    cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.15s",
  },

  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 },
  statCard: {
    padding: "28px 26px", borderRadius: 16, border: "1px solid",
    position: "relative", overflow: "hidden",
  },
  statAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  statLabel: { fontSize: 12, fontWeight: 500, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
  statVal: { fontFamily: "var(--serif)", fontSize: 34, fontWeight: 600, letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 },
  statSub: { fontSize: 12, color: "var(--ink-muted)" },

  filterRow: { display: "flex", gap: 8, marginBottom: 16 },
  filterBtn: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: "var(--cream-dark)", border: "1px solid var(--border)",
    cursor: "pointer", color: "var(--ink-soft)", fontFamily: "var(--sans)",
    transition: "all 0.15s",
  },
  filterBtnActive: {
    background: "var(--ink)", color: "#fff", border: "1px solid var(--ink)",
  },
  filterCount: {
    padding: "1px 7px", borderRadius: 100, fontSize: 11, fontWeight: 600,
  },

  tableWrap: {
    background: "var(--cream)", border: "1px solid var(--border-med)",
    borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)",
  },
  theadRow: { background: "var(--cream-dark)", borderBottom: "1px solid var(--border)" },
  th: { padding: "13px 18px", fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.09em" },
  tr: { borderBottom: "1px solid var(--border)", transition: "background 0.12s" },
  td: { padding: "14px 18px", fontSize: 13, color: "var(--ink-soft)", verticalAlign: "middle" },

  emptyState: {
    padding: "72px 32px", textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  emptyIcon: { fontSize: 36, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "var(--ink-muted)" },

  spinner: {
    width: 28, height: 28, borderRadius: "50%",
    border: "3px solid var(--parchment)", borderTopColor: "var(--ink-muted)",
  },

  feeNote: {
    marginTop: 20, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6,
    padding: "12px 16px", background: "var(--cream-dark)",
    borderRadius: 8, border: "1px solid var(--border)",
  },
};