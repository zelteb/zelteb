"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<"brand" | "influencer" | null>(null);
  const [loading, setLoading] = useState<"brand" | "influencer" | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: brand } = await supabase
          .from("brands")
          .select("id")
          .eq("user_id", data.user.id)
          .single();
        setUserRole(brand ? "brand" : "influencer");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) setUserRole(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const signUpWith = async (role: "brand" | "influencer") => {
    setLoading(role);
    const callbackUrl = `${window.location.origin}/auth/callback?role=${role}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    setLoading(null);
  };

  return (
    <div className="root" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,100;0,9..144,400;0,9..144,700;1,9..144,100;1,9..144,400;1,9..144,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black:   #0a0a0a;
          --white:   #ffffff;
          --off-white: #f5f5f3;
          --gray-50: #fafafa;
          --gray-100: #f0f0ee;
          --gray-200: #e2e2df;
          --gray-300: #c8c8c4;
          --gray-400: #a0a09c;
          --gray-500: #737370;
          --gray-600: #4a4a47;
          --gray-700: #2e2e2b;
          --gray-800: #1a1a18;
          --gray-900: #0f0f0d;

          /* Accent: brand = blue, creator = amber */
          --blue:     #1a56db;
          --blue-bg:  #e8f0fe;
          --blue-mid: #3b82f6;
          --amber:    #d97706;
          --amber-bg: #fef3c7;
          --amber-mid:#f59e0b;

          --border: rgba(0,0,0,0.10);
          --border-dark: rgba(0,0,0,0.18);
          --muted:  #737370;
          --surface: #ffffff;
          --surface2: #f5f5f3;
          --ink: #0a0a0a;
        }

        .root { background: var(--white); min-height: 100vh; color: var(--black); overflow-x: hidden; }

        .brand-serif { font-family: 'Fraunces', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }

        .anim-1 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .anim-2 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .anim-3 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.34s both; }
        .anim-4 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.46s both; }
        .anim-5 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.58s both; }

        /* ── NAV ─────────────────────────────────── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 16px 40px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          font-family: 'Fraunces', serif;
          font-size: 24px; font-weight: 700;
          color: var(--black); text-decoration: none; letter-spacing: -0.5px;
        }
        .nav-logo span { color: var(--gray-400); }
        .nav-links { display: flex; gap: 28px; align-items: center; }
        .nav-link {
          color: var(--muted); font-size: 14px; font-weight: 500;
          text-decoration: none; transition: color 0.15s;
        }
        .nav-link:hover { color: var(--black); }
        .nav-cta {
          padding: 8px 18px;
          background: var(--black); color: var(--white);
          border-radius: 100px; font-size: 13px; font-weight: 700;
          text-decoration: none; transition: all 0.15s; letter-spacing: 0.01em;
        }
        .nav-cta:hover { background: var(--gray-700); }

        /* ── HERO ─────────────────────────────────── */
        .hero {
          position: relative; min-height: 90vh;
          display: flex; align-items: center; overflow: hidden;
          background: var(--white);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }
        .hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          transition: background 0.3s ease;
        }
        .hero-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto; padding: 80px 40px;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 10px;
          background: var(--gray-100);
          border: 1px solid var(--border);
          border-radius: 100px; font-size: 13px; font-weight: 500;
          color: var(--muted); margin-bottom: 32px;
        }
        .hero-tag-dot {
          width: 6px; height: 6px;
          background: var(--black); border-radius: 50%;
          animation: blink 2.4s ease-in-out infinite;
        }
        .hero-h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(56px, 8vw, 108px);
          font-weight: 700; line-height: 0.9;
          letter-spacing: -3px; margin-bottom: 32px; color: var(--black);
        }
        .hero-h1 .italic { font-style: italic; color: var(--gray-400); }
        .hero-sub {
          font-size: clamp(16px, 1.8vw, 18px); color: var(--muted);
          max-width: 500px; line-height: 1.65; margin-bottom: 48px; font-weight: 400;
        }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 72px; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px;
          background: var(--black); color: var(--white);
          border-radius: 12px; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.18s;
          font-family: inherit; text-decoration: none;
        }
        .btn-primary:hover { background: var(--gray-700); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px;
          background: var(--white); color: var(--black);
          border-radius: 12px; font-size: 14px; font-weight: 600;
          border: 1.5px solid var(--border-dark); cursor: pointer;
          transition: all 0.18s; font-family: inherit; text-decoration: none;
        }
        .btn-secondary:hover { background: var(--gray-100); transform: translateY(-1px); }
        .btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        /* floating profile cards */
        .hero-cards { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-card {
          padding: 14px 18px;
          background: var(--white);
          border: 1px solid var(--border-dark);
          border-radius: 14px;
          display: flex; align-items: center; gap: 11px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .hero-card-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0; color: var(--white);
        }
        .hero-card-text { font-size: 13px; font-weight: 600; color: var(--black); }
        .hero-card-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

        /* ── TICKER ───────────────────────────────── */
        .ticker-wrap {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 13px 0; background: var(--gray-100);
        }
        .ticker-inner {
          display: flex; width: max-content;
          animation: ticker 28s linear infinite;
        }
        .ticker-item {
          white-space: nowrap; padding: 0 36px;
          font-size: 12px; font-weight: 600;
          color: var(--muted); letter-spacing: 0.09em;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 14px;
        }
        .ticker-dot {
          width: 3px; height: 3px;
          background: var(--gray-400); border-radius: 50%; flex-shrink: 0;
        }

        /* ── STATS ────────────────────────────────── */
        .stats-section { padding: 96px 40px; max-width: 1200px; margin: 0 auto; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border-dark); border-radius: 20px; overflow: hidden;
        }
        .stat-box { padding: 44px 36px; border-right: 1px solid var(--border); }
        .stat-box:last-child { border-right: none; }
        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: clamp(38px, 4.5vw, 60px);
          font-weight: 700; line-height: 1; letter-spacing: -2px; color: var(--black);
        }
        .stat-num .accent { color: var(--gray-400); }
        .stat-label { font-size: 13px; color: var(--muted); margin-top: 9px; font-weight: 500; }

        /* ── SECTIONS ─────────────────────────────── */
        .section { padding: 112px 40px; max-width: 1200px; margin: 0 auto; }
        .section-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--muted); margin-bottom: 14px;
        }
        .section-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(34px, 5vw, 58px);
          font-weight: 700; line-height: 1.05;
          letter-spacing: -2px; margin-bottom: 14px; color: var(--black);
        }
        .section-h2 em { font-style: italic; color: var(--gray-400); }
        .section-sub {
          font-size: 16px; color: var(--muted);
          max-width: 460px; line-height: 1.65; margin-bottom: 64px; font-weight: 400;
        }

        /* ── DUAL PATH ────────────────────────────── */
        .dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .path-card {
          border: 1px solid var(--border-dark);
          border-radius: 24px; padding: 48px 44px;
          background: var(--white); position: relative; overflow: hidden;
          transition: box-shadow 0.25s;
        }
        .path-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

        /* brand card — subtle blue top border */
        .path-card.brand-path { border-top: 3px solid var(--blue-mid); }
        /* creator card — subtle amber top border */
        .path-card.creator-path { border-top: 3px solid var(--amber-mid); }

        .path-pill {
          display: inline-block; padding: 5px 12px; border-radius: 100px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; margin-bottom: 28px;
        }
        .path-pill.brand {
          background: var(--blue-bg); color: var(--blue); border: 1px solid rgba(59,130,246,0.2);
        }
        .path-pill.creator {
          background: var(--amber-bg); color: var(--amber); border: 1px solid rgba(245,158,11,0.25);
        }

        .path-h3 {
          font-family: 'Fraunces', serif;
          font-size: 30px; font-weight: 700; letter-spacing: -0.8px;
          margin-bottom: 14px; line-height: 1.1; color: var(--black);
        }
        .path-desc {
          font-size: 14px; color: var(--muted);
          line-height: 1.65; margin-bottom: 36px;
        }
        .path-steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px; }
        .path-step { display: flex; align-items: flex-start; gap: 12px; }
        .step-num {
          width: 24px; height: 24px;
          background: var(--gray-100); border: 1px solid var(--border);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: var(--muted);
          flex-shrink: 0; margin-top: 1px;
        }
        .step-text { font-size: 14px; color: var(--gray-600); line-height: 1.55; }
        .step-text strong { color: var(--black); font-weight: 600; }

        /* ── FEATURES ─────────────────────────────── */
        .features-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .feat-card {
          padding: 32px 28px;
          background: var(--gray-50);
          border: 1px solid var(--border);
          border-radius: 18px; transition: all 0.22s;
        }
        .feat-card:hover {
          background: var(--white); border-color: var(--border-dark);
          box-shadow: 0 4px 18px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        .feat-icon {
          width: 40px; height: 40px;
          background: var(--gray-100);
          border-radius: 10px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 18px; font-size: 18px;
        }
        .feat-title { font-size: 15px; font-weight: 700; margin-bottom: 9px; color: var(--black); }
        .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* ── TESTIMONIALS ─────────────────────────── */
        .test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .test-card {
          padding: 32px;
          background: var(--white);
          border: 1px solid var(--border-dark);
          border-radius: 20px; position: relative;
        }
        .test-quote {
          font-family: 'Fraunces', serif;
          font-size: 40px; line-height: 1; color: var(--gray-300); margin-bottom: 14px;
        }
        .test-text {
          font-size: 14px; color: var(--gray-600);
          line-height: 1.65; margin-bottom: 24px; font-weight: 400;
        }
        .test-author { display: flex; align-items: center; gap: 11px; }
        .test-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; flex-shrink: 0; color: var(--white);
        }
        .test-name { font-size: 13px; font-weight: 700; color: var(--black); }
        .test-role { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .stars { display: flex; gap: 3px; margin-bottom: 18px; }

        /* ── CTA BLOCK ────────────────────────────── */
        .cta-section {
          margin: 0 40px 112px;
          border-radius: 28px;
          background: var(--black); color: var(--white);
          padding: 96px 80px; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute;
          top: -120px; left: -120px;
          width: 360px; height: 360px;
          border-radius: 50%; background: rgba(255,255,255,0.03);
          pointer-events: none;
        }
        .cta-section::after {
          content: ''; position: absolute;
          bottom: -80px; right: -80px;
          width: 280px; height: 280px;
          border-radius: 50%; background: rgba(255,255,255,0.02);
          pointer-events: none;
        }
        .cta-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(38px, 6vw, 68px); font-weight: 700;
          letter-spacing: -2.5px; line-height: 0.95;
          margin-bottom: 20px; position: relative; z-index: 1; color: var(--white);
        }
        .cta-sub {
          font-size: 17px; margin-bottom: 48px;
          color: rgba(255,255,255,0.5); font-weight: 400;
          position: relative; z-index: 1;
        }
        .cta-btns {
          display: flex; gap: 12px;
          justify-content: center; flex-wrap: wrap;
          position: relative; z-index: 1;
        }
        .btn-cta-brand {
          padding: 15px 32px; background: var(--white); color: var(--black);
          border-radius: 12px; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.18s; font-family: inherit;
        }
        .btn-cta-brand:hover { background: var(--gray-200); transform: translateY(-1px); }
        .btn-cta-creator {
          padding: 15px 32px;
          background: transparent; color: var(--white);
          border-radius: 12px; font-size: 14px; font-weight: 700;
          border: 1.5px solid rgba(255,255,255,0.25);
          cursor: pointer; transition: all 0.18s; font-family: inherit;
        }
        .btn-cta-creator:hover {
          background: rgba(255,255,255,0.07); transform: translateY(-1px);
        }

        /* ── FOOTER ───────────────────────────────── */
        .footer {
          background: var(--gray-100);
          border-top: 1px solid var(--border);
          padding: 72px 40px 40px;
        }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top {
          display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 56px; margin-bottom: 56px;
        }
        .footer-brand {
          font-family: 'Fraunces', serif;
          font-size: 26px; font-weight: 700; margin-bottom: 12px; color: var(--black);
        }
        .footer-brand span { color: var(--gray-400); }
        .footer-tagline {
          font-size: 13px; color: var(--muted);
          line-height: 1.6; max-width: 230px; margin-bottom: 24px;
        }
        .footer-email-row {
          display: flex;
          background: var(--white);
          border: 1px solid var(--border-dark);
          border-radius: 10px; overflow: hidden;
        }
        .footer-email-input {
          flex: 1; background: transparent; border: none;
          padding: 11px 14px; color: var(--black); font-size: 13px;
          outline: none; font-family: inherit;
        }
        .footer-email-input::placeholder { color: var(--muted); }
        .footer-email-btn {
          padding: 11px 14px; background: var(--black);
          border: none; cursor: pointer; color: var(--white);
          font-size: 15px; transition: background 0.15s;
        }
        .footer-email-btn:hover { background: var(--gray-700); }
        .footer-col-title {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--muted); margin-bottom: 18px;
        }
        .footer-links { display: flex; flex-direction: column; gap: 11px; }
        .footer-link {
          font-size: 13px; color: var(--gray-600);
          text-decoration: none; transition: color 0.15s;
        }
        .footer-link:hover { color: var(--black); }
        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 28px; border-top: 1px solid var(--border);
        }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* divider */
        .divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        /* spinner */
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        .spinner-dark {
          border-color: rgba(0,0,0,0.15);
          border-top-color: var(--black);
        }

        /* ── RESPONSIVE ───────────────────────────── */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-box:nth-child(2) { border-right: none; }
          .stat-box:nth-child(3),
          .stat-box:nth-child(4) { border-top: 1px solid var(--border); }
          .dual-grid, .features-bento, .test-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
          .section, .stats-section { padding: 72px 24px; }
          .hero-inner { padding: 56px 24px; }
          .cta-section { margin: 0 16px 72px; padding: 56px 28px; }
          .footer { padding: 56px 24px 36px; }
          .nav-inner { padding: 14px 24px; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .footer-top { grid-template-columns: 1fr; }
          .hero-btns { flex-direction: column; }
          .btn-primary, .btn-secondary { justify-content: center; }
          .hero-h1 { letter-spacing: -1.5px; }
        }
      `}</style>

      {/* ── NAVBAR ────────────────────────────────── */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Zel<span>teb</span></Link>
          <div className="nav-links">
            <Link href="/discover" className="nav-link">Discover</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="nav-cta">
                Dashboard →
              </Link>
            ) : (
              <Link href="#get-started" className="nav-cta">Get started</Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid" />
        <div
          className="hero-glow"
          style={{
            background: `radial-gradient(ellipse 55% 45% at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,0.03) 0%, transparent 70%)`,
          }}
        />
        <div className="hero-inner">
          <div className="anim-1">
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              India's #1 influencer marketing marketplace
            </div>
          </div>
          <h1 className="hero-h1 anim-2">
            Where brands<br />
            meet <span className="italic">creators</span><br />
            that convert.
          </h1>
          <p className="hero-sub anim-3">
            Zelteb connects growth-hungry brands with authentic influencers. Run paid campaigns, track results, and pay only for real impact.
          </p>
          {user ? (
            <div className="hero-btns anim-4">
              <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="btn-primary">
                Go to dashboard →
              </Link>
            </div>
          ) : (
            <div className="hero-btns anim-4" id="get-started">
              <button
                onClick={() => signUpWith("brand")}
                disabled={loading !== null}
                className="btn-primary"
              >
                {loading === "brand" ? <div className="spinner" /> : <GoogleIcon />}
                <span>{loading === "brand" ? "Signing in…" : "I'm a Brand"}</span>
                {loading !== "brand" && <span>→</span>}
              </button>
              <button
                onClick={() => signUpWith("influencer")}
                disabled={loading !== null}
                className="btn-secondary"
              >
                {loading === "influencer" ? <div className="spinner spinner-dark" /> : <GoogleIcon dark />}
                <span>{loading === "influencer" ? "Signing in…" : "I'm a Creator"}</span>
                {loading !== "influencer" && <span style={{ color: "var(--gray-400)" }}>→</span>}
              </button>
            </div>
          )}
          <div className="hero-cards anim-5">
            {[
              { initials: "RK", name: "Rohit K.", stat: "2.1M followers", bg: "#1a1a18" },
              { initials: "PV", name: "Priya V.", stat: "₹4.2L earned",   bg: "#4a4a47" },
              { initials: "AM", name: "Arjun M.", stat: "Brand: NikeIN",  bg: "#737370" },
            ].map((c) => (
              <div className="hero-card" key={c.name}>
                <div className="hero-card-avatar" style={{ background: c.bg }}>{c.initials}</div>
                <div>
                  <div className="hero-card-text">{c.name}</div>
                  <div className="hero-card-sub">{c.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex" }}>
              {["Instagram","YouTube","X (Twitter)","LinkedIn","Reddit","Medium","Paid Campaigns","Verified Creators","Brand Deals","Real Analytics","INR Payouts","Instant Matching"].map((item) => (
                <div className="ticker-item" key={item}>
                  <div className="ticker-dot" />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────── */}
      <div className="stats-section">
        <div className="stats-grid">
          {[
            { num: "12K", suffix: "+", label: "Verified influencers" },
            { num: "850", suffix: "+", label: "Brands onboarded" },
            { num: "₹2Cr", suffix: "+", label: "Creator earnings paid out" },
            { num: "98",  suffix: "%", label: "Campaign satisfaction" },
          ].map((s) => (
            <div className="stat-box" key={s.label}>
              <div className="stat-num">{s.num}<span className="accent">{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="section">
        <p className="section-label">How it works</p>
        <h2 className="section-h2">Two sides. <em>One platform.</em></h2>
        <p className="section-sub">Whether you're a brand looking to grow or a creator ready to monetize — Zelteb has a clear path for you.</p>

        <div className="dual-grid">
          {/* Brand card */}
          <div className="path-card brand-path">
            <div className="path-pill brand">For Brands</div>
            <h3 className="path-h3">Find influencers who actually move the needle.</h3>
            <p className="path-desc">Stop guessing. Browse verified creators by niche, platform, and audience quality. Launch paid campaigns that get results — not just impressions.</p>
            <div className="path-steps">
              {[
                { n: "01", t: "Post a campaign brief",    d: "Define your goals, budget, target audience, and preferred platforms." },
                { n: "02", t: "Browse matched creators",  d: "Get instant matches from our verified influencer pool. Filter by metrics." },
                { n: "03", t: "Collaborate & track",      d: "Manage content approvals, track live performance, and pay securely." },
              ].map((s) => (
                <div className="path-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => signUpWith("brand")}
              disabled={loading !== null}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading === "brand" ? <div className="spinner" /> : null}
              {loading === "brand" ? "Signing in…" : "Start hiring creators →"}
            </button>
          </div>

          {/* Creator card */}
          <div className="path-card creator-path">
            <div className="path-pill creator">For Creators</div>
            <h3 className="path-h3">Turn your audience into a real income stream.</h3>
            <p className="path-desc">No cold emails. No chasing brands. Zelteb brings paid opportunities to you based on your niche, platforms, and engagement — automatically.</p>
            <div className="path-steps">
              {[
                { n: "01", t: "Verify your socials",      d: "Connect your Instagram, YouTube, X, and other platforms in one click." },
                { n: "02", t: "Get matched to campaigns", d: "Brands find you based on your niche and audience. No bidding wars." },
                { n: "03", t: "Create content & get paid",d: "Submit your content, get approved, and receive INR payouts directly." },
              ].map((s) => (
                <div className="path-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => signUpWith("influencer")}
              disabled={loading !== null}
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading === "influencer" ? <div className="spinner spinner-dark" /> : null}
              {loading === "influencer" ? "Signing in…" : "Join as a creator →"}
            </button>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="section">
        <p className="section-label">Platform features</p>
        <h2 className="section-h2">Built for real <em>results.</em></h2>
        <p className="section-sub">Every tool you need to run successful influencer campaigns — from discovery to payment.</p>
        <div className="features-bento">
          {[
            { icon: "🔍", title: "Smart creator discovery",   desc: "Filter by platform, niche, follower count, engagement rate, and audience demographics to find the perfect fit." },
            { icon: "✅", title: "Verified social profiles",  desc: "Every creator goes through social verification. Know exactly who you're working with before you commit." },
            { icon: "📊", title: "Live campaign analytics",   desc: "Track reach, engagement, clicks, and conversions in real time. No more waiting for screenshots." },
            { icon: "💸", title: "Secure INR payments",       desc: "Escrow-based payments. Brands pay into escrow, creators get paid upon content approval. Zero disputes." },
            { icon: "🤝", title: "Managed collaborations",    desc: "Built-in messaging, content submission, revision requests, and approval workflows — all in one place." },
            { icon: "🌐", title: "Multi-platform support",    desc: "Instagram, YouTube, X, LinkedIn, Reddit, Medium — manage all your channels from a single dashboard." },
          ].map((f) => (
            <div className="feat-card" key={f.title}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── TESTIMONIALS ──────────────────────────── */}
      <section className="section">
        <p className="section-label">What people say</p>
        <h2 className="section-h2">Trusted by brands & <em>creators.</em></h2>
        <div className="test-grid">
          {[
            {
              quote: "Zelteb cut our influencer search time from weeks to hours. The verification system means we never deal with fake engagement anymore.",
              name: "Sneha R.", role: "Marketing Head, FreshCart India", initials: "SR", bg: "#1a1a18",
            },
            {
              quote: "I used to spend months cold-pitching brands. Now campaigns come to me and I've tripled my monthly income from collaborations.",
              name: "Karan M.", role: "Lifestyle Creator, 890K on Instagram", initials: "KM", bg: "#4a4a47",
            },
            {
              quote: "The analytics dashboard alone is worth it. We can see exactly what's working mid-campaign and adjust — not after it's over.",
              name: "Divya S.", role: "Growth Lead, Nua Brand", initials: "DS", bg: "#737370",
            },
          ].map((t) => (
            <div className="test-card" key={t.name}>
              <div className="stars">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="var(--black)">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <div className="test-quote">"</div>
              <p className="test-text">{t.quote}</p>
              <div className="test-author">
                <div className="test-avatar" style={{ background: t.bg }}>{t.initials}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────── */}
      <div className="cta-section">
        <h2 className="cta-h2">Your next brand deal<br />is one click away.</h2>
        <p className="cta-sub">Join 12,000+ creators and 850+ brands already growing on Zelteb.</p>
        {user ? (
          <div className="cta-btns">
            <Link
              href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"}
              style={{ padding: "15px 32px", background: "white", color: "var(--black)", borderRadius: "12px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}
            >
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <div className="cta-btns">
            <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-cta-brand">
              {loading === "brand" ? "Signing in…" : "Hire creators →"}
            </button>
            <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-cta-creator">
              {loading === "influencer" ? "Signing in…" : "Become a creator →"}
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand">Zel<span>teb</span></div>
              <p className="footer-tagline">India's influencer marketing marketplace connecting brands with creators who convert.</p>
              <div className="footer-email-row">
                <input className="footer-email-input" type="email" placeholder="Get platform updates" />
                <button className="footer-email-btn">→</button>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <div className="footer-links">
                <Link href="/discover" className="footer-link">Discover creators</Link>
                <Link href="/campaigns" className="footer-link">Browse campaigns</Link>
                <Link href="/pricing" className="footer-link">Pricing</Link>
                <Link href="/blog" className="footer-link">Blog</Link>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-links">
                <Link href="/about" className="footer-link">About us</Link>
                <Link href="/help" className="footer-link">Contact</Link>
                <Link href="/faq" className="footer-link">FAQ</Link>
                <Link href="/zelteb-employees" className="footer-link">Careers</Link>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <div className="footer-links">
                <Link href="/terms" className="footer-link">Terms of Service</Link>
                <Link href="/priv" className="footer-link">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2025 Zelteb. All rights reserved.</span>
            <span className="footer-copy">Made with ♥ for Indian creators</span>
          </div>
        </div>
      </footer>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebSite",
        name: "Zelteb", url: "https://zelteb.com",
        description: "Zelteb is India's influencer marketing marketplace — connecting brands with verified creators for paid content campaigns.",
        potentialAction: { "@type": "SearchAction", target: "https://zelteb.com/discover?q={search_term_string}", "query-input": "required name=search_term_string" }
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Organization",
        name: "Zelteb", url: "https://zelteb.com",
        description: "Influencer marketing marketplace for Indian brands and creators.",
        contactPoint: { "@type": "ContactPoint", email: "helpzelteb@gmail.com", contactType: "customer support" }
      })}} />
    </div>
  );
}

function GoogleIcon({ dark, light }: { dark?: boolean; light?: boolean }) {
  const opacity = dark ? 0.6 : light ? 0.5 : 1;
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0, opacity }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={dark ? "#333" : "#4285F4"}/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={dark ? "#333" : "#34A853"}/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill={dark ? "#333" : "#FBBC05"}/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={dark ? "#333" : "#EA4335"}/>
    </svg>
  );
}