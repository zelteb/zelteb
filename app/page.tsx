"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"brand" | "influencer" | null>(null);
  const [loading, setLoading] = useState<"brand" | "influencer" | null>(null);
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
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --serif: 'Lora', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;

          /* Warm neutral palette */
          --cream:       #faf8f4;
          --cream-dark:  #f2ede4;
          --parchment:   #ede8dc;
          --ink:         #1a1814;
          --ink-soft:    #3d3a34;
          --ink-muted:   #7a7670;
          --ink-faint:   #c4bfb6;

          /* Accent colours — light & airy */
          --sage:        #5a7a5e;
          --sage-light:  #eaf2eb;
          --sage-mid:    #7fa882;
          --amber:       #c17c2e;
          --amber-light: #fef3e2;
          --amber-mid:   #e09d50;
          --indigo:      #3d5a8a;
          --indigo-light:#eaeffa;
          --indigo-mid:  #6384b5;
          --rose:        #a0404f;
          --rose-light:  #faeaea;
          --rose-mid:    #c76070;

          --border:      rgba(26,24,20,0.08);
          --border-med:  rgba(26,24,20,0.14);
          --border-dark: rgba(26,24,20,0.2);

          --shadow-sm:   0 1px 4px rgba(26,24,20,0.06);
          --shadow-md:   0 4px 20px rgba(26,24,20,0.08);
          --shadow-lg:   0 12px 48px rgba(26,24,20,0.1);
        }

        .root {
          background: var(--cream);
          min-height: 100vh;
          color: var(--ink);
          font-family: var(--sans);
          overflow-x: hidden;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(0.92); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }

        .a1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .a2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .a3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .a4 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
        .a5 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.54s both; }

        /* ── NAV ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(250,248,244,0.92);
          backdrop-filter: blur(16px) saturate(1.4);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 1160px; margin: 0 auto;
          padding: 0 40px; height: 62px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          font-family: var(--serif); font-size: 21px; font-weight: 700;
          color: var(--ink); text-decoration: none; letter-spacing: -0.3px;
        }
        .nav-logo span { color: var(--sage); }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-link {
          color: var(--ink-muted); font-size: 14px; font-weight: 400;
          text-decoration: none; transition: color 0.15s; letter-spacing: 0.01em;
        }
        .nav-link:hover { color: var(--ink); }
        .nav-cta {
          padding: 8px 20px;
          background: var(--ink); color: var(--cream);
          border-radius: 8px; font-size: 13px; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
          letter-spacing: 0.01em;
        }
        .nav-cta:hover { background: var(--ink-soft); }

        /* ── HERO ── */
        .hero {
          position: relative; min-height: 88vh;
          display: flex; align-items: center;
          overflow: hidden;
          background: var(--cream);
        }

        /* Soft dappled background */
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 80% 30%, rgba(90,122,94,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(193,124,46,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 60% 70%, rgba(61,90,138,0.05) 0%, transparent 60%);
        }

        /* Subtle dot grid */
        .hero-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(26,24,20,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, black 0%, transparent 100%);
        }

        .hero-inner {
          position: relative; z-index: 2;
          max-width: 1160px; margin: 0 auto;
          padding: 80px 40px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }

        .hero-left {}

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 12px 5px 8px;
          background: var(--amber-light);
          border: 1px solid rgba(193,124,46,0.2);
          border-radius: 100px; margin-bottom: 28px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--amber); flex-shrink: 0;
          animation: pulse 2.2s ease-in-out infinite;
        }
        .hero-badge-text {
          font-size: 12px; font-weight: 500; color: var(--amber);
          letter-spacing: 0.03em;
        }

        .hero-h1 {
          font-family: var(--serif);
          font-size: clamp(44px, 6vw, 76px);
          font-weight: 600; line-height: 1.08;
          letter-spacing: -1.5px; color: var(--ink);
          margin-bottom: 24px;
        }
        .hero-h1 em {
          font-style: italic; color: var(--sage);
        }
        .hero-h1 .underline-word {
          position: relative; display: inline-block;
        }
        .hero-h1 .underline-word::after {
          content: '';
          position: absolute; left: 0; bottom: -4px;
          width: 100%; height: 2px;
          background: var(--amber);
          border-radius: 2px;
        }

        .hero-sub {
          font-size: 16px; color: var(--ink-muted);
          line-height: 1.75; margin-bottom: 44px;
          max-width: 440px; font-weight: 400;
        }

        .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 56px; }

        .btn-ink {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px;
          background: var(--ink); color: var(--cream);
          border-radius: 10px; font-size: 14px; font-weight: 500;
          border: none; cursor: pointer; transition: all 0.18s;
          font-family: var(--sans); text-decoration: none;
          letter-spacing: 0.01em;
        }
        .btn-ink:hover { background: var(--ink-soft); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .btn-ink:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px;
          background: transparent; color: var(--ink);
          border-radius: 10px; font-size: 14px; font-weight: 500;
          border: 1.5px solid var(--border-med); cursor: pointer;
          transition: all 0.18s; font-family: var(--sans); text-decoration: none;
        }
        .btn-outline:hover { background: var(--cream-dark); border-color: var(--border-dark); transform: translateY(-1px); }
        .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* Hero trust pills */
        .hero-trust { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .trust-pill {
          display: flex; align-items: center; gap: 7px;
          padding: 6px 12px;
          background: var(--cream-dark);
          border: 1px solid var(--border);
          border-radius: 8px; font-size: 12px; color: var(--ink-soft);
          font-weight: 400;
        }
        .trust-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* Hero right — floating cards */
        .hero-right {
          position: relative; height: 480px;
        }
        .hcard {
          position: absolute;
          background: var(--cream); border: 1px solid var(--border-med);
          border-radius: 16px; padding: 20px 24px;
          box-shadow: var(--shadow-lg);
          animation: float 5s ease-in-out infinite;
        }
        .hcard:nth-child(1) { top: 0; left: 0; width: 220px; animation-delay: 0s; }
        .hcard:nth-child(2) { top: 100px; right: 0; width: 210px; animation-delay: 1.2s; }
        .hcard:nth-child(3) { bottom: 40px; left: 40px; width: 230px; animation-delay: 2.4s; }
        .hcard:nth-child(4) { top: 220px; left: 180px; width: 160px; animation-delay: 0.6s; }

        .hcard-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-faint); margin-bottom: 6px; }
        .hcard-val { font-family: var(--serif); font-size: 22px; font-weight: 600; color: var(--ink); letter-spacing: -0.5px; }
        .hcard-val.green { color: var(--sage); }
        .hcard-val.amber { color: var(--amber); }
        .hcard-val.indigo { color: var(--indigo); }
        .hcard-sub { font-size: 11px; color: var(--ink-muted); margin-top: 4px; }

        .hcard-user { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .hcard-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: var(--cream); flex-shrink: 0;
        }
        .hcard-name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .hcard-detail { font-size: 11px; color: var(--ink-muted); }

        /* sparkline */
        .sparkline { display: flex; align-items: flex-end; gap: 3px; height: 32px; margin-top: 10px; }
        .spark-bar { border-radius: 2px; flex: 1; background: var(--sage-light); transition: all 0.3s; }

        /* ── TICKER ── */
        .ticker-wrap {
          overflow: hidden;
          background: var(--cream-dark);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 11px 0;
        }
        .ticker-track { display: flex; width: max-content; animation: ticker 32s linear infinite; }
        .ticker-item {
          white-space: nowrap; padding: 0 28px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink-muted);
          display: flex; align-items: center; gap: 12px;
        }
        .ticker-sep { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-faint); flex-shrink: 0; }

        /* ── STATS ── */
        .stats-wrap { max-width: 1160px; margin: 0 auto; padding: 80px 40px; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border-med); border-radius: 20px; overflow: hidden;
          background: var(--cream);
        }
        .stat-cell {
          padding: 44px 36px; border-right: 1px solid var(--border);
          position: relative;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-cell-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 0;
        }
        .stat-num {
          font-family: var(--serif);
          font-size: clamp(34px, 4vw, 52px);
          font-weight: 600; line-height: 1; letter-spacing: -2px;
          color: var(--ink); margin-bottom: 8px;
        }
        .stat-num sup { font-size: 0.45em; letter-spacing: 0; vertical-align: super; }
        .stat-label { font-size: 13px; color: var(--ink-muted); font-weight: 400; line-height: 1.4; }

        /* ── SECTION ── */
        .section { max-width: 1160px; margin: 0 auto; padding: 96px 40px; }

        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--ink-muted);
          margin-bottom: 18px;
        }
        .section-eyebrow::before {
          content: '';
          display: inline-block; width: 16px; height: 1px;
          background: var(--ink-faint);
        }

        .section-h2 {
          font-family: var(--serif);
          font-size: clamp(30px, 4vw, 50px);
          font-weight: 600; line-height: 1.1;
          letter-spacing: -1px; color: var(--ink); margin-bottom: 16px;
        }
        .section-h2 em { font-style: italic; color: var(--sage); }

        .section-sub {
          font-size: 15px; color: var(--ink-muted);
          line-height: 1.7; max-width: 440px; margin-bottom: 60px; font-weight: 400;
        }

        /* ── DUAL PATH ── */
        .dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .path-card {
          border: 1px solid var(--border-med); border-radius: 20px;
          padding: 48px 44px; background: var(--cream);
          transition: box-shadow 0.25s; position: relative; overflow: hidden;
        }
        .path-card:hover { box-shadow: var(--shadow-lg); }

        .path-card.brand-card { background: var(--sage-light); border-color: rgba(90,122,94,0.2); }
        .path-card.creator-card { background: var(--amber-light); border-color: rgba(193,124,46,0.2); }

        .path-tag {
          display: inline-block; padding: 4px 12px; border-radius: 100px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 24px;
        }
        .brand-card .path-tag { background: var(--cream); color: var(--sage); border: 1px solid rgba(90,122,94,0.25); }
        .creator-card .path-tag { background: var(--cream); color: var(--amber); border: 1px solid rgba(193,124,46,0.25); }

        .path-h3 {
          font-family: var(--serif);
          font-size: 24px; font-weight: 600;
          line-height: 1.25; margin-bottom: 12px; color: var(--ink);
          letter-spacing: -0.3px;
        }
        .path-desc { font-size: 14px; color: var(--ink-muted); line-height: 1.7; margin-bottom: 36px; }

        .path-steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
        .path-step { display: flex; align-items: flex-start; gap: 14px; }
        .step-n {
          font-family: var(--serif); font-size: 13px; color: var(--ink-faint);
          font-weight: 400; flex-shrink: 0; min-width: 20px; padding-top: 1px;
          font-style: italic;
        }
        .step-body { font-size: 14px; color: var(--ink-soft); line-height: 1.55; }
        .step-body strong { color: var(--ink); font-weight: 600; }

        .btn-sage {
          display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px;
          background: var(--sage); color: var(--cream);
          border-radius: 10px; font-size: 14px; font-weight: 500;
          border: none; cursor: pointer; transition: all 0.18s; font-family: var(--sans);
          width: 100%; justify-content: center; letter-spacing: 0.01em;
        }
        .btn-sage:hover { background: var(--sage-mid); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(90,122,94,0.3); }
        .btn-sage:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-amber {
          display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px;
          background: var(--amber); color: var(--cream);
          border-radius: 10px; font-size: 14px; font-weight: 500;
          border: none; cursor: pointer; transition: all 0.18s; font-family: var(--sans);
          width: 100%; justify-content: center; letter-spacing: 0.01em;
        }
        .btn-amber:hover { background: var(--amber-mid); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(193,124,46,0.3); }
        .btn-amber:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        /* ── FEATURES ── */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .feat {
          padding: 32px 28px; background: var(--cream);
          border: 1px solid var(--border); border-radius: 16px;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .feat:hover { border-color: var(--border-dark); box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .feat-stripe {
          position: absolute; top: 0; left: 0; right: 0; height: 1.5px; border-radius: 0;
        }
        .feat-emoji { font-size: 22px; margin-bottom: 16px; display: block; }
        .feat-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 8px; letter-spacing: -0.1px; }
        .feat-desc { font-size: 13px; color: var(--ink-muted); line-height: 1.65; }

        /* ── TESTIMONIALS ── */
        .test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .test-card {
          padding: 32px; background: var(--cream);
          border: 1px solid var(--border); border-radius: 18px;
          transition: all 0.2s;
        }
        .test-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .stars { display: flex; gap: 3px; margin-bottom: 18px; }
        .test-text {
          font-family: var(--serif); font-size: 15px; color: var(--ink-soft);
          line-height: 1.7; margin-bottom: 24px; font-style: italic;
        }
        .test-author { display: flex; align-items: center; gap: 11px; padding-top: 18px; border-top: 1px solid var(--border); }
        .test-av {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: var(--cream); flex-shrink: 0;
        }
        .test-name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .test-role { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }

        /* ── PLATFORM STRIP ── */
        .platform-strip {
          background: var(--cream-dark);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 56px 40px;
        }
        .platform-inner { max-width: 1160px; margin: 0 auto; }
        .platform-title {
          font-family: var(--serif); font-size: 16px; font-weight: 500;
          color: var(--ink-muted); text-align: center; margin-bottom: 36px;
          font-style: italic;
        }
        .platform-icons { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .platform-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; background: var(--cream);
          border: 1px solid var(--border-med); border-radius: 10px;
          font-size: 13px; color: var(--ink-soft); font-weight: 500;
        }
        .platform-icon { width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; }

        /* ── CTA ── */
        .cta-wrap { padding: 0 40px 96px; max-width: 1160px; margin: 0 auto; }
        .cta-inner {
          background: var(--ink);
          border-radius: 24px; padding: 80px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-inner::before {
          content: ''; position: absolute;
          top: -120px; right: -80px;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(90,122,94,0.12); pointer-events: none;
        }
        .cta-inner::after {
          content: ''; position: absolute;
          bottom: -80px; left: -60px;
          width: 300px; height: 300px; border-radius: 50%;
          background: rgba(193,124,46,0.1); pointer-events: none;
        }
        .cta-tag {
          display: inline-block; padding: 4px 12px; border-radius: 100px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 24px;
        }
        .cta-h2 {
          font-family: var(--serif);
          font-size: clamp(30px, 5vw, 54px);
          font-weight: 600; line-height: 1.1;
          letter-spacing: -1.5px; color: #ffffff;
          margin-bottom: 18px; position: relative; z-index: 1;
        }
        .cta-h2 em { font-style: italic; color: var(--sage-mid); }
        .cta-sub { font-size: 15px; color: rgba(255,255,255,0.5); margin-bottom: 44px; font-weight: 400; position: relative; z-index: 1; }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
        .btn-cta-light {
          padding: 14px 32px; background: var(--cream); color: var(--ink);
          border-radius: 10px; font-size: 14px; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.18s; font-family: var(--sans);
        }
        .btn-cta-light:hover { background: var(--parchment); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.25); }
        .btn-cta-ghost {
          padding: 14px 32px; background: transparent; color: rgba(255,255,255,0.75);
          border-radius: 10px; font-size: 14px; font-weight: 500;
          border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
          transition: all 0.18s; font-family: var(--sans);
        }
        .btn-cta-ghost:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.4); transform: translateY(-1px); }

        /* ── FOOTER ── */
        .footer { background: var(--ink); padding: 72px 40px 40px; }
        .footer-inner { max-width: 1160px; margin: 0 auto; }
        .footer-top {
          display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 56px; margin-bottom: 60px;
          padding-bottom: 60px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .footer-logo { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--cream); margin-bottom: 10px; }
        .footer-logo span { color: var(--sage-mid); }
        .footer-tagline { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.65; max-width: 220px; margin-bottom: 28px; }
        .footer-email-row {
          display: flex; overflow: hidden;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .footer-email-input {
          flex: 1; background: transparent; border: none;
          padding: 11px 14px; color: #fff; font-size: 13px; outline: none;
          font-family: var(--sans);
        }
        .footer-email-input::placeholder { color: rgba(255,255,255,0.25); }
        .footer-email-btn {
          padding: 11px 16px; background: var(--sage); border: none;
          cursor: pointer; color: var(--cream); font-size: 14px; font-weight: 600;
          transition: opacity 0.15s;
        }
        .footer-email-btn:hover { opacity: 0.8; }
        .footer-col-title {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: rgba(255,255,255,0.25); margin-bottom: 20px;
        }
        .footer-links { display: flex; flex-direction: column; gap: 12px; }
        .footer-link {
          font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;
          transition: color 0.15s; font-weight: 400;
        }
        .footer-link:hover { color: rgba(255,255,255,0.85); }
        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: rgba(255,255,255,0.2);
        }
        .footer-heart { color: var(--rose-mid); }

        /* ── DIVIDER ── */
        .divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        /* ── SPINNER ── */
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        .spinner-dark {
          border-color: rgba(26,24,20,0.15);
          border-top-color: var(--ink);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .nav-links { display: none; }
          .hero-inner { grid-template-columns: 1fr; gap: 48px; min-height: auto; }
          .hero-right { height: 320px; }
          .hcard:nth-child(1) { top: 0; left: 0; width: 180px; }
          .hcard:nth-child(2) { top: 60px; right: 0; width: 170px; }
          .hcard:nth-child(3) { bottom: 0; left: 20px; width: 190px; }
          .hcard:nth-child(4) { top: 140px; left: 150px; width: 140px; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .stat-cell:nth-child(2) { border-right: none; }
          .stat-cell:nth-child(3), .stat-cell:nth-child(4) { border-top: 1px solid var(--border); }
          .dual-grid, .features-grid, .test-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
          .section, .stats-wrap { padding: 64px 24px; }
          .hero-inner { padding: 56px 24px; }
          .cta-wrap { padding: 0 16px 64px; }
          .cta-inner { padding: 56px 28px; }
          .footer { padding: 56px 24px 32px; }
          .nav-inner { padding: 0 24px; }
          .platform-strip { padding: 40px 24px; }
        }
        @media (max-width: 560px) {
          .footer-top { grid-template-columns: 1fr; }
          .hero-btns { flex-direction: column; }
          .btn-ink, .btn-outline { justify-content: center; }
          .hero-h1 { letter-spacing: -0.5px; }
          .cta-h2 { letter-spacing: -0.5px; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Zelteb<span>.</span></Link>
          <div className="nav-links">
            <Link href="/discover" className="nav-link">Discover</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>
          {user
            ? <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="nav-cta">Dashboard →</Link>
            : <Link href="#get-started" className="nav-cta">Get started</Link>
          }
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hero-dots" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="a1">
              <div className="hero-badge">
                <div className="hero-badge-dot" />
                <span className="hero-badge-text">India's #1 influencer marketplace</span>
              </div>
            </div>
            <h1 className="hero-h1 a2">
              Where brands meet<br />
              <em>creators</em> that<br />
              <span className="underline-word">convert.</span>
            </h1>
            <p className="hero-sub a3">
              Zelteb connects growth-hungry brands with authentic influencers. Run paid campaigns, track results, and pay only for real impact.
            </p>
            {user ? (
              <div className="hero-btns a4">
                <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="btn-ink">Go to dashboard →</Link>
              </div>
            ) : (
              <div className="hero-btns a4" id="get-started">
                <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-ink">
                  {loading === "brand" ? <div className="spinner" /> : <GoogleIcon />}
                  <span>{loading === "brand" ? "Signing in…" : "I'm a Brand"}</span>
                  {loading !== "brand" && <span style={{ opacity: 0.5 }}>→</span>}
                </button>
                <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-outline">
                  {loading === "influencer" ? <div className="spinner spinner-dark" /> : <GoogleIcon dark />}
                  <span>{loading === "influencer" ? "Signing in…" : "I'm a Creator"}</span>
                  {loading !== "influencer" && <span style={{ opacity: 0.4 }}>→</span>}
                </button>
              </div>
            )}
            <div className="hero-trust a5">
              {[
                { dot: "var(--sage)", text: "12K+ verified creators" },
                { dot: "var(--amber)", text: "₹2Cr+ paid out" },
                { dot: "var(--indigo)", text: "850+ brands" },
              ].map(t => (
                <div className="trust-pill" key={t.text}>
                  <div className="trust-pill-dot" style={{ background: t.dot }} />
                  {t.text}
                </div>
              ))}
            </div>
          </div>

          {/* Floating dashboard cards */}
          <div className="hero-right a3">
            <div className="hcard">
              <div className="hcard-label">Campaign reach</div>
              <div className="hcard-val green">4.7M</div>
              <div className="hcard-sub">↑ 22% this month</div>
              <div className="sparkline">
                {[35, 50, 42, 60, 55, 75, 68, 90, 80, 100].map((h, i) => (
                  <div key={i} className="spark-bar" style={{ height: `${h}%`, background: i > 6 ? "var(--sage)" : "var(--sage-light)" }} />
                ))}
              </div>
            </div>
            <div className="hcard">
              <div className="hcard-user">
                <div className="hcard-avatar" style={{ background: "linear-gradient(135deg,var(--indigo),var(--indigo-mid))" }}>PV</div>
                <div>
                  <div className="hcard-name">Priya V.</div>
                  <div className="hcard-detail">890K • Lifestyle</div>
                </div>
              </div>
              <div className="hcard-label">Earnings this month</div>
              <div className="hcard-val amber">₹1.8L</div>
            </div>
            <div className="hcard">
              <div className="hcard-label">Active campaigns</div>
              <div className="hcard-val indigo">23</div>
              <div className="hcard-sub">Across 6 platforms</div>
            </div>
            <div className="hcard" style={{ padding: "16px 18px" }}>
              <div className="hcard-label">Satisfaction</div>
              <div className="hcard-val" style={{ fontSize: 20 }}>98%</div>
              <div className="hcard-sub" style={{ display: "flex", gap: 2, marginTop: 6 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, color: "var(--amber)" }}>★</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex" }}>
              {["Instagram","YouTube","X (Twitter)","LinkedIn","Reddit","Medium","Paid Campaigns","Verified Creators","Brand Deals","Real Analytics","INR Payouts","Instant Matching"].map(item => (
                <div className="ticker-item" key={item}>
                  <div className="ticker-sep" />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-wrap">
        <div className="stats-grid">
          {[
            { val: "12K", sfx: "+", label: "Verified influencers", accent: "var(--sage)" },
            { val: "850", sfx: "+", label: "Brands onboarded", accent: "var(--indigo)" },
            { val: "₹2Cr", sfx: "+", label: "Creator earnings paid out", accent: "var(--amber)" },
            { val: "98",  sfx: "%", label: "Campaign satisfaction", accent: "var(--rose)" },
          ].map(s => (
            <div className="stat-cell" key={s.label}>
              <div className="stat-cell-accent" style={{ background: s.accent }} />
              <div className="stat-num">{s.val}<sup style={{ color: s.accent }}>{s.sfx}</sup></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <p className="section-eyebrow">How it works</p>
        <h2 className="section-h2">Two sides.<br /><em>One platform.</em></h2>
        <p className="section-sub">Whether you're a brand looking to grow or a creator ready to monetize — Zelteb has a clear path for you.</p>
        <div className="dual-grid">
          <div className="path-card brand-card">
            <div className="path-tag">For Brands</div>
            <h3 className="path-h3">Find influencers who actually move the needle.</h3>
            <p className="path-desc">Stop guessing. Browse verified creators by niche, platform, and audience quality. Launch paid campaigns that get results — not just impressions.</p>
            <div className="path-steps">
              {[
                { n: "i", t: "Post a campaign brief", d: "Define your goals, budget, target audience, and preferred platforms." },
                { n: "ii", t: "Browse matched creators", d: "Get instant matches from our verified influencer pool. Filter by metrics." },
                { n: "iii", t: "Collaborate & track", d: "Manage content approvals, track live performance, and pay securely." },
              ].map(s => (
                <div className="path-step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-sage">
              {loading === "brand" && <div className="spinner" />}
              {loading === "brand" ? "Signing in…" : "Start hiring creators →"}
            </button>
          </div>
          <div className="path-card creator-card">
            <div className="path-tag">For Creators</div>
            <h3 className="path-h3">Turn your audience into a real income stream.</h3>
            <p className="path-desc">No cold emails. No chasing brands. Zelteb brings paid opportunities to you based on your niche, platforms, and engagement.</p>
            <div className="path-steps">
              {[
                { n: "i", t: "Verify your socials", d: "Connect your Instagram, YouTube, X, and other platforms in one click." },
                { n: "ii", t: "Get matched to campaigns", d: "Brands find you based on your niche and audience. No bidding wars." },
                { n: "iii", t: "Create content & get paid", d: "Submit your content, get approved, and receive INR payouts directly." },
              ].map(s => (
                <div className="path-step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-amber">
              {loading === "influencer" && <div className="spinner" />}
              {loading === "influencer" ? "Signing in…" : "Join as a creator →"}
            </button>
          </div>
        </div>
      </section>

      {/* ── PLATFORM SUPPORT STRIP ── */}
      <div className="platform-strip">
        <div className="platform-inner">
          <p className="platform-title">Works across every platform you're already on</p>
          <div className="platform-icons">
            {[
              { name: "Instagram", bg: "#e1306c", emoji: "📸" },
              { name: "YouTube",   bg: "#ff0000", emoji: "▶️" },
              { name: "X (Twitter)", bg: "#1da1f2", emoji: "✖" },
              { name: "LinkedIn",  bg: "#0077b5", emoji: "💼" },
              { name: "Reddit",    bg: "#ff4500", emoji: "🤝" },
              { name: "Medium",    bg: "#00ab6c", emoji: "✍️" },
            ].map(p => (
              <div className="platform-pill" key={p.name}>
                <div className="platform-icon" style={{ background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  <span style={{ filter: "brightness(10)", fontSize: 10 }}>{p.emoji}</span>
                </div>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* ── FEATURES ── */}
      <section className="section">
        <p className="section-eyebrow">Platform features</p>
        <h2 className="section-h2">Built for <em>real results.</em></h2>
        <p className="section-sub">Every tool you need to run successful influencer campaigns — from discovery to payment.</p>
        <div className="features-grid">
          {[
            { emoji: "🔍", title: "Smart creator discovery", desc: "Filter by platform, niche, follower count, engagement rate, and audience demographics.", accent: "var(--sage)" },
            { emoji: "✅", title: "Verified social profiles", desc: "Every creator is verified. Know exactly who you're working with before you commit.", accent: "var(--indigo)" },
            { emoji: "📊", title: "Live campaign analytics", desc: "Track reach, engagement, clicks, and conversions in real time. No more waiting for screenshots.", accent: "var(--amber)" },
            { emoji: "💸", title: "Secure INR payments", desc: "Escrow-based payments. Brands pay in, creators receive upon content approval. Zero disputes.", accent: "var(--sage)" },
            { emoji: "🤝", title: "Managed collaborations", desc: "Built-in messaging, content submission, revision requests, and approval workflows in one place.", accent: "var(--rose)" },
            { emoji: "🌐", title: "Multi-platform support", desc: "Instagram, YouTube, X, LinkedIn, Reddit, Medium — manage all channels from a single dashboard.", accent: "var(--indigo)" },
          ].map(f => (
            <div className="feat" key={f.title}>
              <div className="feat-stripe" style={{ background: f.accent }} />
              <span className="feat-emoji">{f.emoji}</span>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── TESTIMONIALS ── */}
      <section className="section">
        <p className="section-eyebrow">What people say</p>
        <h2 className="section-h2">Trusted by brands<br />& <em>creators.</em></h2>
        <div className="test-grid" style={{ marginTop: 60 }}>
          {[
            { text: "Zelteb cut our influencer search time from weeks to hours. The verification system means we never deal with fake engagement anymore.", name: "Sneha R.", role: "Marketing Head, FreshCart India", av: "SR", bg: "var(--sage)" },
            { text: "I used to spend months cold-pitching brands. Now campaigns come to me and I've tripled my monthly income from collaborations.", name: "Karan M.", role: "Lifestyle Creator, 890K on Instagram", av: "KM", bg: "var(--indigo)" },
            { text: "The analytics dashboard alone is worth it. We can see exactly what's working mid-campaign and adjust — not after it's over.", name: "Divya S.", role: "Growth Lead, Nua Brand", av: "DS", bg: "var(--amber)" },
          ].map(t => (
            <div className="test-card" key={t.name}>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="var(--amber)">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <p className="test-text">"{t.text}"</p>
              <div className="test-author">
                <div className="test-av" style={{ background: t.bg }}>{t.av}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <div className="cta-wrap">
        <div className="cta-inner">
          <div className="cta-tag">Ready to grow</div>
          <h2 className="cta-h2">Your next brand deal<br />is <em>one click away.</em></h2>
          <p className="cta-sub">Join 12,000+ creators and 850+ brands already growing on Zelteb.</p>
          {user ? (
            <div className="cta-btns">
              <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} style={{ padding: "14px 32px", background: "var(--cream)", color: "var(--ink)", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Go to dashboard →
              </Link>
            </div>
          ) : (
            <div className="cta-btns">
              <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-cta-light">
                {loading === "brand" ? "Signing in…" : "Hire creators →"}
              </button>
              <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-cta-ghost">
                {loading === "influencer" ? "Signing in…" : "Become a creator →"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">Zelteb<span>.</span></div>
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
                <Link href="/zelteb-employees" className="footer-link">Zelteb Employees</Link>
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
            <span>© 2025 Zelteb. All rights reserved.</span>
            <span>Made with <span className="footer-heart">♥</span> for Indian creators</span>
          </div>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebSite",
        name: "Zelteb", url: "https://zelteb.com",
        description: "Zelteb is India's influencer marketing marketplace.",
        potentialAction: { "@type": "SearchAction", target: "https://zelteb.com/discover?q={search_term_string}", "query-input": "required name=search_term_string" }
      })}} />
    </div>
  );
}

function GoogleIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={dark ? "#3d5a8a" : "#4285F4"}/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={dark ? "#5a7a5e" : "#34A853"}/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill={dark ? "#c17c2e" : "#FBBC05"}/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={dark ? "#a0404f" : "#EA4335"}/>
    </svg>
  );
}