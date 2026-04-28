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
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,100;0,9..144,400;0,9..144,700;1,9..144,100;1,9..144,400;1,9..144,700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --lime: #d4ff1e;
          --lime-dim: #b8e000;
          --ink: #0a0a0a;
          --surface: #111111;
          --surface2: #1a1a1a;
          --border: rgba(255,255,255,0.08);
          --muted: rgba(255,255,255,0.45);
        }

        .brand-serif { font-family: 'Fraunces', serif; }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212,255,30,0.3); }
          50% { box-shadow: 0 0 40px rgba(212,255,30,0.6); }
        }

        .anim-1 { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .anim-2 { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
        .anim-3 { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        .anim-4 { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
        .anim-5 { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both; }

        /* Navbar */
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: white; text-decoration: none; letter-spacing: -0.5px; }
        .nav-logo span { color: var(--lime); }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-link { color: var(--muted); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; letter-spacing: 0.01em; }
        .nav-link:hover { color: white; }
        .nav-cta { padding: 9px 20px; background: var(--lime); color: var(--ink); border-radius: 100px; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.2s; letter-spacing: 0.02em; }
        .nav-cta:hover { background: white; transform: translateY(-1px); }

        /* Hero */
        .hero { position: relative; min-height: 92vh; display: flex; align-items: center; overflow: hidden; }
        .hero-glow { position: absolute; inset: 0; pointer-events: none; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 64px 64px; pointer-events: none; }
        .hero-inner { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 80px 40px; }
        .hero-tag { display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px 7px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: 100px; font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 36px; }
        .hero-tag-dot { width: 6px; height: 6px; background: var(--lime); border-radius: 50%; animation: pulse-glow 2s infinite; }
        .hero-h1 { font-family: 'Fraunces', serif; font-size: clamp(56px, 8vw, 110px); font-weight: 700; line-height: 0.9; letter-spacing: -3px; margin-bottom: 36px; }
        .hero-h1 .italic { font-style: italic; color: var(--lime); }
        .hero-sub { font-size: clamp(16px, 2vw, 19px); color: var(--muted); max-width: 520px; line-height: 1.65; margin-bottom: 52px; font-weight: 400; }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 80px; }
        .btn-primary { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: var(--lime); color: var(--ink); border-radius: 14px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; text-decoration: none; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,255,30,0.3); background: white; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: transparent; color: white; border-radius: 14px; font-size: 15px; font-weight: 600; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; font-family: inherit; text-decoration: none; }
        .btn-secondary:hover { background: var(--surface2); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Floating cards */
        .hero-cards { display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-card { padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; display: flex; align-items: center; gap: 12px; }
        .hero-card-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .hero-card-text { font-size: 13px; font-weight: 600; }
        .hero-card-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

        /* Ticker */
        .ticker-wrap { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 14px 0; background: var(--surface); }
        .ticker-inner { display: flex; gap: 0; width: max-content; animation: ticker 25s linear infinite; }
        .ticker-item { white-space: nowrap; padding: 0 40px; font-size: 13px; font-weight: 600; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 16px; }
        .ticker-dot { width: 4px; height: 4px; background: var(--lime); border-radius: 50%; flex-shrink: 0; }

        /* Stats */
        .stats-section { padding: 100px 40px; max-width: 1200px; margin: 0 auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; }
        .stat-box { padding: 48px 40px; border-right: 1px solid var(--border); }
        .stat-box:last-child { border-right: none; }
        .stat-num { font-family: 'Fraunces', serif; font-size: clamp(40px, 5vw, 64px); font-weight: 700; line-height: 1; letter-spacing: -2px; }
        .stat-num .accent { color: var(--lime); }
        .stat-label { font-size: 13px; color: var(--muted); margin-top: 10px; font-weight: 500; }

        /* How section */
        .section { padding: 120px 40px; max-width: 1200px; margin: 0 auto; }
        .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--lime); margin-bottom: 16px; }
        .section-h2 { font-family: 'Fraunces', serif; font-size: clamp(36px, 5vw, 60px); font-weight: 700; line-height: 1.05; letter-spacing: -2px; margin-bottom: 16px; }
        .section-h2 em { font-style: italic; color: var(--muted); }
        .section-sub { font-size: 17px; color: var(--muted); max-width: 480px; line-height: 1.6; margin-bottom: 72px; }

        /* Dual path */
        .dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .path-card { border: 1px solid var(--border); border-radius: 28px; padding: 52px 48px; background: var(--surface); position: relative; overflow: hidden; transition: border-color 0.3s; }
        .path-card:hover { border-color: rgba(212,255,30,0.3); }
        .path-card::before { content: ''; position: absolute; top: -80px; right: -80px; width: 200px; height: 200px; border-radius: 50%; background: var(--lime); opacity: 0.04; pointer-events: none; }
        .path-pill { display: inline-block; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 32px; }
        .path-pill.brand { background: rgba(212,255,30,0.12); color: var(--lime); border: 1px solid rgba(212,255,30,0.2); }
        .path-pill.creator { background: rgba(255,255,255,0.06); color: white; border: 1px solid var(--border); }
        .path-h3 { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 700; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.1; }
        .path-desc { font-size: 15px; color: var(--muted); line-height: 1.65; margin-bottom: 40px; }
        .path-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 44px; }
        .path-step { display: flex; align-items: flex-start; gap: 14px; }
        .step-num { width: 26px; height: 26px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--muted); flex-shrink: 0; margin-top: 1px; }
        .step-text { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5; }
        .step-text strong { color: white; font-weight: 600; }

        /* Features */
        .features-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .feat-card { padding: 36px 32px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; transition: all 0.25s; }
        .feat-card:hover { border-color: rgba(212,255,30,0.25); transform: translateY(-3px); }
        .feat-icon { width: 44px; height: 44px; background: rgba(212,255,30,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 20px; }
        .feat-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
        .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* Testimonials */
        .test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .test-card { padding: 36px; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; position: relative; }
        .test-quote { font-family: 'Fraunces', serif; font-size: 42px; line-height: 1; color: var(--lime); margin-bottom: 16px; }
        .test-text { font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin-bottom: 28px; font-weight: 400; }
        .test-author { display: flex; align-items: center; gap: 12px; }
        .test-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
        .test-name { font-size: 14px; font-weight: 700; }
        .test-role { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .stars { display: flex; gap: 3px; margin-bottom: 20px; }

        /* CTA */
        .cta-section { margin: 0 40px 120px; border-radius: 32px; background: var(--lime); color: var(--ink); padding: 100px 80px; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: -100px; left: -100px; width: 400px; height: 400px; background: rgba(0,0,0,0.06); border-radius: 50%; pointer-events: none; }
        .cta-section::after { content: ''; position: absolute; bottom: -80px; right: -80px; width: 300px; height: 300px; background: rgba(0,0,0,0.04); border-radius: 50%; pointer-events: none; }
        .cta-h2 { font-family: 'Fraunces', serif; font-size: clamp(40px, 6vw, 72px); font-weight: 700; letter-spacing: -3px; line-height: 0.95; margin-bottom: 24px; position: relative; z-index: 1; }
        .cta-sub { font-size: 18px; margin-bottom: 52px; opacity: 0.65; font-weight: 400; position: relative; z-index: 1; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
        .btn-cta-brand { padding: 16px 36px; background: var(--ink); color: white; border-radius: 14px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-cta-brand:hover { background: #1a1a1a; transform: translateY(-2px); }
        .btn-cta-creator { padding: 16px 36px; background: white; color: var(--ink); border-radius: 14px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-cta-creator:hover { background: #f0f0f0; transform: translateY(-2px); }

        /* Footer */
        .footer { background: var(--surface); border-top: 1px solid var(--border); padding: 80px 40px 40px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 64px; }
        .footer-brand { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; margin-bottom: 14px; }
        .footer-brand span { color: var(--lime); }
        .footer-tagline { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 240px; margin-bottom: 28px; }
        .footer-email-row { display: flex; gap: 0; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .footer-email-input { flex: 1; background: transparent; border: none; padding: 12px 16px; color: white; font-size: 13px; outline: none; font-family: inherit; }
        .footer-email-input::placeholder { color: var(--muted); }
        .footer-email-btn { padding: 12px 16px; background: var(--lime); border: none; cursor: pointer; color: var(--ink); font-size: 16px; transition: background 0.2s; }
        .footer-email-btn:hover { background: white; }
        .footer-col-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 20px; }
        .footer-links { display: flex; flex-direction: column; gap: 12px; }
        .footer-link { font-size: 14px; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: white; }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 32px; border-top: 1px solid var(--border); }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* Spinner */
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .spinner-light { border-color: rgba(255,255,255,0.2); border-top-color: white; }

        /* Divider */
        .divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        /* Mobile */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .hero-h1 { letter-spacing: -2px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-box:nth-child(2) { border-right: none; }
          .stat-box:nth-child(3), .stat-box:nth-child(4) { border-top: 1px solid var(--border); }
          .dual-grid, .features-bento, .test-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 40px; }
          .section, .stats-section { padding: 80px 24px; }
          .hero-inner { padding: 60px 24px; }
          .cta-section { margin: 0 16px 80px; padding: 60px 32px; }
          .footer { padding: 60px 24px 40px; }
          .nav-inner { padding: 16px 24px; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .footer-top { grid-template-columns: 1fr; }
          .hero-btns { flex-direction: column; }
          .btn-primary, .btn-secondary { justify-content: center; }
        }
      `}</style>

      {/* NAVBAR */}
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

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid" />
        <div
          className="hero-glow"
          style={{
            background: `radial-gradient(ellipse 60% 50% at ${mousePos.x}% ${mousePos.y}%, rgba(212,255,30,0.07) 0%, transparent 70%)`,
            transition: "background 0.3s ease",
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
                <span>{loading === "brand" ? "Signing in..." : "I'm a Brand"}</span>
                {loading !== "brand" && <span>→</span>}
              </button>
              <button
                onClick={() => signUpWith("influencer")}
                disabled={loading !== null}
                className="btn-secondary"
              >
                {loading === "influencer" ? <div className="spinner spinner-light" /> : <GoogleIcon light />}
                <span>{loading === "influencer" ? "Signing in..." : "I'm a Creator"}</span>
                {loading !== "influencer" && <span style={{ color: "rgba(255,255,255,0.5)" }}>→</span>}
              </button>
            </div>
          )}
          <div className="hero-cards anim-5">
            {[
              { initials: "RK", name: "Rohit K.", stat: "2.1M followers", color: "linear-gradient(135deg,#f093fb,#f5576c)" },
              { initials: "PV", name: "Priya V.", stat: "₹4.2L earned", color: "linear-gradient(135deg,#4facfe,#00f2fe)" },
              { initials: "AM", name: "Arjun M.", stat: "Brand: NikeIN", color: "linear-gradient(135deg,#43e97b,#38f9d7)" },
            ].map((c) => (
              <div className="hero-card" key={c.name}>
                <div className="hero-card-avatar" style={{ background: c.color }}>{c.initials}</div>
                <div>
                  <div className="hero-card-text">{c.name}</div>
                  <div className="hero-card-sub">{c.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex" }}>
              {["Instagram", "YouTube", "X (Twitter)", "LinkedIn", "Reddit", "Medium", "Paid Campaigns", "Verified Creators", "Brand Deals", "Real Analytics", "INR Payouts", "Instant Matching"].map((item) => (
                <div className="ticker-item" key={item}>
                  <div className="ticker-dot" />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-section">
        <div className="stats-grid">
          {[
            { num: "12K", suffix: "+", label: "Verified influencers" },
            { num: "850", suffix: "+", label: "Brands onboarded" },
            { num: "₹2Cr", suffix: "+", label: "Creator earnings paid out" },
            { num: "98", suffix: "%", label: "Campaign satisfaction" },
          ].map((s) => (
            <div className="stat-box" key={s.label}>
              <div className="stat-num">{s.num}<span className="accent">{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* HOW IT WORKS — DUAL PATH */}
      <section className="section">
        <p className="section-label">How it works</p>
        <h2 className="section-h2">Two sides. <em>One platform.</em></h2>
        <p className="section-sub">Whether you're a brand looking to grow or a creator ready to monetize — Zelteb has a clear path for you.</p>
        <div className="dual-grid">
          {/* Brand */}
          <div className="path-card">
            <div className="path-pill brand">For Brands</div>
            <h3 className="path-h3">Find influencers who actually move the needle.</h3>
            <p className="path-desc">Stop guessing. Browse verified creators by niche, platform, and audience quality. Launch paid campaigns that get results — not just impressions.</p>
            <div className="path-steps">
              {[
                { n: "01", t: "Post a campaign brief", d: "Define your goals, budget, target audience, and preferred platforms." },
                { n: "02", t: "Browse matched creators", d: "Get instant matches from our verified influencer pool. Filter by metrics." },
                { n: "03", t: "Collaborate & track", d: "Manage content approvals, track live performance, and pay securely." },
              ].map((s) => (
                <div className="path-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              {loading === "brand" ? <div className="spinner" /> : null}
              {loading === "brand" ? "Signing in..." : "Start hiring creators →"}
            </button>
          </div>

          {/* Creator */}
          <div className="path-card">
            <div className="path-pill creator">For Creators</div>
            <h3 className="path-h3">Turn your audience into a real income stream.</h3>
            <p className="path-desc">No cold emails. No chasing brands. Zelteb brings paid opportunities to you based on your niche, platforms, and engagement — automatically.</p>
            <div className="path-steps">
              {[
                { n: "01", t: "Verify your socials", d: "Connect your Instagram, YouTube, X, and other platforms in one click." },
                { n: "02", t: "Get matched to campaigns", d: "Brands find you based on your niche and audience. No bidding wars." },
                { n: "03", t: "Create content & get paid", d: "Submit your content, get approved, and receive INR payouts directly." },
              ].map((s) => (
                <div className="path-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              {loading === "influencer" ? <div className="spinner spinner-light" /> : null}
              {loading === "influencer" ? "Signing in..." : "Join as a creator →"}
            </button>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* FEATURES */}
      <section className="section">
        <p className="section-label">Platform features</p>
        <h2 className="section-h2">Built for real <em>results.</em></h2>
        <p className="section-sub">Every tool you need to run successful influencer campaigns — from discovery to payment.</p>
        <div className="features-bento">
          {[
            { icon: "🔍", title: "Smart creator discovery", desc: "Filter by platform, niche, follower count, engagement rate, and audience demographics to find the perfect fit." },
            { icon: "✅", title: "Verified social profiles", desc: "Every creator goes through social verification. Know exactly who you're working with before you commit." },
            { icon: "📊", title: "Live campaign analytics", desc: "Track reach, engagement, clicks, and conversions in real time. No more waiting for screenshots." },
            { icon: "💸", title: "Secure INR payments", desc: "Escrow-based payments. Brands pay into escrow, creators get paid upon content approval. Zero disputes." },
            { icon: "🤝", title: "Managed collaborations", desc: "Built-in messaging, content submission, revision requests, and approval workflows — all in one place." },
            { icon: "🌐", title: "Multi-platform support", desc: "Instagram, YouTube, X, LinkedIn, Reddit, Medium — manage all your channels from a single dashboard." },
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

      {/* TESTIMONIALS */}
      <section className="section">
        <p className="section-label">What people say</p>
        <h2 className="section-h2">Trusted by brands & <em>creators.</em></h2>
        <div className="test-grid">
          {[
            {
              quote: "Zelteb cut our influencer search time from weeks to hours. The verification system means we never deal with fake engagement anymore.",
              name: "Sneha R.", role: "Marketing Head, FreshCart India", initials: "SR",
              color: "linear-gradient(135deg,#f093fb,#f5576c)"
            },
            {
              quote: "I used to spend months cold-pitching brands. Now campaigns come to me and I've tripled my monthly income from collaborations.",
              name: "Karan M.", role: "Lifestyle Creator, 890K on Instagram", initials: "KM",
              color: "linear-gradient(135deg,#4facfe,#00f2fe)"
            },
            {
              quote: "The analytics dashboard alone is worth it. We can see exactly what's working mid-campaign and adjust — not after it's over.",
              name: "Divya S.", role: "Growth Lead, Nua Brand", initials: "DS",
              color: "linear-gradient(135deg,#43e97b,#38f9d7)"
            },
          ].map((t) => (
            <div className="test-card" key={t.name}>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="var(--lime)">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <div className="test-quote">"</div>
              <p className="test-text">{t.quote}</p>
              <div className="test-author">
                <div className="test-avatar" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="cta-section">
        <h2 className="cta-h2">Your next brand deal<br />is one click away.</h2>
        <p className="cta-sub">Join 12,000+ creators and 850+ brands already growing on Zelteb.</p>
        {user ? (
          <div className="cta-btns">
            <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} style={{ padding: "16px 36px", background: "var(--ink)", color: "white", borderRadius: "14px", fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <div className="cta-btns">
            <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-cta-brand">
              {loading === "brand" ? "Signing in..." : "Hire creators →"}
            </button>
            <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-cta-creator">
              {loading === "influencer" ? "Signing in..." : "Become a creator →"}
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Zelteb", url: "https://zelteb.com", description: "Zelteb is India's influencer marketing marketplace — connecting brands with verified creators for paid content campaigns.", potentialAction: { "@type": "SearchAction", target: "https://zelteb.com/discover?q={search_term_string}", "query-input": "required name=search_term_string" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Zelteb", url: "https://zelteb.com", description: "Influencer marketing marketplace for Indian brands and creators. Find verified influencers, run paid campaigns, track real results.", contactPoint: { "@type": "ContactPoint", email: "helpzelteb@gmail.com", contactType: "customer support" } }) }} />
    </div>
  );
}

function GoogleIcon({ light }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={light ? "rgba(255,255,255,0.7)" : "#4285F4"}/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={light ? "rgba(255,255,255,0.7)" : "#34A853"}/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill={light ? "rgba(255,255,255,0.7)" : "#FBBC05"}/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={light ? "rgba(255,255,255,0.7)" : "#EA4335"}/>
    </svg>
  );
}