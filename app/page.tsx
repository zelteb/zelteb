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
    <div className="root">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

          --black:   #0a0a0a;
          --white:   #ffffff;
          --violet:    #7c3aed;
          --violet-bg: #ede9fe;
          --violet-mid:#8b5cf6;
          --violet-light: #ddd6fe;
          --rose:      #e11d48;
          --rose-bg:   #ffe4e6;
          --rose-mid:  #f43f5e;
          --cyan:      #0891b2;
          --cyan-bg:   #cffafe;
          --cyan-mid:  #06b6d4;
          --emerald:   #059669;
          --emerald-bg:#d1fae5;
          --emerald-mid:#10b981;
          --amber:     #d97706;
          --amber-bg:  #fef3c7;
          --amber-mid: #f59e0b;
          --orange:    #ea580c;
          --orange-bg: #ffedd5;
          --orange-mid:#f97316;
          --blue:      #1d4ed8;
          --blue-bg:   #dbeafe;
          --blue-mid:  #3b82f6;

          --border: rgba(124,58,237,0.12);
          --border-dark: rgba(124,58,237,0.22);
          --muted:  #6b7280;
        }

        .root { background: var(--white); min-height: 100vh; color: var(--black); overflow-x: hidden; font-family: var(--font); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .anim-1 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .anim-2 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .anim-3 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.34s both; }
        .anim-4 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.46s both; }
        .anim-5 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.58s both; }

        /* NAV */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.94);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 16px 40px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          font-size: 22px; font-weight: 800;
          color: #000000; text-decoration: none; letter-spacing: -0.5px;
        }
        .nav-links { display: flex; gap: 28px; align-items: center; }
        .nav-link {
          color: var(--muted); font-size: 14px; font-weight: 500;
          text-decoration: none; transition: color 0.15s;
        }
        .nav-link:hover { color: var(--violet); }
        .nav-cta {
          padding: 9px 20px;
          background: var(--violet); color: var(--white);
          border-radius: 100px; font-size: 13px; font-weight: 700;
          text-decoration: none; transition: all 0.15s;
          box-shadow: 0 2px 12px rgba(124,58,237,0.3);
        }
        .nav-cta:hover { background: #6d28d9; box-shadow: 0 4px 18px rgba(124,58,237,0.4); }

        /* HERO */
        .hero {
          position: relative; min-height: 90vh;
          display: flex; align-items: center; overflow: hidden;
          background: linear-gradient(135deg, #fdf4ff 0%, #f0f7ff 40%, #f0fdf4 100%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }
        .hero-blob1 {
          position: absolute; top: -120px; right: -80px;
          width: 520px; height: 520px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-blob2 {
          position: absolute; bottom: -80px; left: 10%;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-blob3 {
          position: absolute; top: 30%; right: 30%;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto; padding: 80px 40px;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 10px;
          background: var(--violet-bg);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 100px; font-size: 13px; font-weight: 600;
          color: var(--violet); margin-bottom: 32px;
        }
        .hero-tag-dot {
          width: 7px; height: 7px;
          background: var(--rose-mid); border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }
        .hero-h1 {
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 800; line-height: 1.0;
          letter-spacing: -2.5px; margin-bottom: 32px; color: var(--black);
        }
        .hero-h1 .grad {
          background: linear-gradient(135deg, var(--violet) 0%, var(--rose-mid) 50%, var(--orange-mid) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; font-style: italic;
        }
        .hero-sub {
          font-size: clamp(15px, 1.8vw, 17px); color: var(--muted);
          max-width: 500px; line-height: 1.7; margin-bottom: 48px; font-weight: 400;
        }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 72px; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 15px 28px;
          background: linear-gradient(135deg, var(--violet) 0%, var(--rose-mid) 100%);
          color: var(--white);
          border-radius: 12px; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.2s;
          font-family: var(--font); text-decoration: none;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.45); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 15px 28px;
          background: var(--white); color: var(--black);
          border-radius: 12px; font-size: 14px; font-weight: 600;
          border: 1.5px solid var(--border-dark); cursor: pointer;
          transition: all 0.18s; font-family: var(--font); text-decoration: none;
        }
        .btn-secondary:hover { background: var(--violet-bg); border-color: var(--violet-mid); color: var(--violet); transform: translateY(-1px); }
        .btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .hero-cards { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-card {
          padding: 14px 18px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex; align-items: center; gap: 11px;
          box-shadow: 0 2px 12px rgba(124,58,237,0.08);
          animation: float 4s ease-in-out infinite;
        }
        .hero-card:nth-child(2) { animation-delay: 0.8s; }
        .hero-card:nth-child(3) { animation-delay: 1.6s; }
        .hero-card-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0; color: var(--white);
        }
        .hero-card-text { font-size: 13px; font-weight: 700; color: var(--black); }
        .hero-card-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

        /* TICKER */
        .ticker-wrap {
          overflow: hidden;
          border-top: 1px solid rgba(124,58,237,0.15);
          border-bottom: 1px solid rgba(124,58,237,0.15);
          padding: 13px 0;
          background: linear-gradient(90deg, var(--violet-bg) 0%, #e0f2fe 50%, var(--emerald-bg) 100%);
        }
        .ticker-inner { display: flex; width: max-content; animation: ticker 28s linear infinite; }
        .ticker-item {
          white-space: nowrap; padding: 0 32px;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          display: flex; align-items: center; gap: 14px;
        }
        .ticker-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* STATS */
        .stats-section { padding: 96px 40px; max-width: 1200px; margin: 0 auto; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border-dark); border-radius: 24px;
          overflow: hidden; background: var(--white);
        }
        .stat-box {
          padding: 44px 36px; border-right: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .stat-box::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        }
        .stat-box:nth-child(1)::before { background: linear-gradient(90deg, var(--violet), var(--violet-mid)); }
        .stat-box:nth-child(2)::before { background: linear-gradient(90deg, var(--cyan), var(--cyan-mid)); }
        .stat-box:nth-child(3)::before { background: linear-gradient(90deg, var(--emerald), var(--emerald-mid)); }
        .stat-box:nth-child(4)::before { background: linear-gradient(90deg, var(--orange), var(--orange-mid)); }
        .stat-box:last-child { border-right: none; }
        .stat-num {
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 800; line-height: 1; letter-spacing: -2px; color: var(--black);
        }
        .stat-num .s1 { color: var(--violet); }
        .stat-num .s2 { color: var(--cyan); }
        .stat-num .s3 { color: var(--emerald); }
        .stat-num .s4 { color: var(--orange); }
        .stat-label { font-size: 13px; color: var(--muted); margin-top: 9px; font-weight: 500; }

        /* SECTIONS */
        .section { padding: 112px 40px; max-width: 1200px; margin: 0 auto; }
        .section-label {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--violet); margin-bottom: 14px;
          background: var(--violet-bg); padding: 4px 12px; border-radius: 100px;
          border: 1px solid rgba(124,58,237,0.2);
        }
        .section-h2 {
          font-size: clamp(30px, 4.5vw, 52px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -1.5px; margin-bottom: 14px; color: var(--black);
        }
        .section-h2 em {
          font-style: italic;
          background: linear-gradient(135deg, var(--violet), var(--cyan-mid));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-sub {
          font-size: 16px; color: var(--muted);
          max-width: 460px; line-height: 1.65; margin-bottom: 64px; font-weight: 400;
        }

        /* DUAL PATH */
        .dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .path-card {
          border: 1px solid var(--border-dark);
          border-radius: 28px; padding: 48px 44px;
          background: var(--white); position: relative; overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .path-card:hover { box-shadow: 0 8px 40px rgba(124,58,237,0.12); transform: translateY(-2px); }
        .path-card.brand-path {
          background: linear-gradient(145deg, #fdf4ff 0%, #f5f3ff 100%);
          border-top: 3px solid var(--violet-mid);
        }
        .path-card.creator-path {
          background: linear-gradient(145deg, #fffbeb 0%, #fff7ed 100%);
          border-top: 3px solid var(--orange-mid);
        }
        .path-card::after {
          content: ''; position: absolute;
          bottom: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          pointer-events: none;
        }
        .path-card.brand-path::after { background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%); }
        .path-card.creator-path::after { background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%); }

        .path-pill {
          display: inline-block; padding: 5px 14px; border-radius: 100px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; margin-bottom: 28px;
        }
        .path-pill.brand { background: var(--violet-bg); color: var(--violet); border: 1px solid rgba(124,58,237,0.25); }
        .path-pill.creator { background: var(--orange-bg); color: var(--orange); border: 1px solid rgba(249,115,22,0.25); }

        .path-h3 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 14px; line-height: 1.2; color: var(--black); }
        .path-desc { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 36px; }
        .path-steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px; }
        .path-step { display: flex; align-items: flex-start; gap: 12px; }
        .step-num {
          width: 26px; height: 26px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
        }
        .brand-path .step-num { background: var(--violet-bg); color: var(--violet); border: 1px solid rgba(124,58,237,0.2); }
        .creator-path .step-num { background: var(--orange-bg); color: var(--orange); border: 1px solid rgba(249,115,22,0.2); }
        .step-text { font-size: 14px; color: #4b5563; line-height: 1.55; }
        .step-text strong { color: var(--black); font-weight: 600; }

        .btn-brand {
          display: inline-flex; align-items: center; gap: 9px; padding: 14px 28px;
          background: linear-gradient(135deg, var(--violet) 0%, #a855f7 100%);
          color: var(--white); border-radius: 12px; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.2s; font-family: var(--font);
          box-shadow: 0 3px 16px rgba(124,58,237,0.3); width: 100%; justify-content: center;
        }
        .btn-brand:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(124,58,237,0.4); }
        .btn-brand:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .btn-creator {
          display: inline-flex; align-items: center; gap: 9px; padding: 14px 28px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--amber) 100%);
          color: var(--white); border-radius: 12px; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.2s; font-family: var(--font);
          box-shadow: 0 3px 16px rgba(234,88,12,0.3); width: 100%; justify-content: center;
        }
        .btn-creator:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(234,88,12,0.4); }
        .btn-creator:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        /* FEATURES */
        .features-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .feat-card {
          padding: 32px 28px; background: var(--white);
          border: 1px solid var(--border); border-radius: 20px; transition: all 0.22s;
          position: relative; overflow: hidden;
        }
        .feat-card:hover { border-color: var(--border-dark); box-shadow: 0 6px 24px rgba(124,58,237,0.1); transform: translateY(-3px); }
        .feat-card:nth-child(1) { background: linear-gradient(145deg, #fdf4ff, #ffffff); }
        .feat-card:nth-child(2) { background: linear-gradient(145deg, #ecfdf5, #ffffff); }
        .feat-card:nth-child(3) { background: linear-gradient(145deg, #eff6ff, #ffffff); }
        .feat-card:nth-child(4) { background: linear-gradient(145deg, #fff7ed, #ffffff); }
        .feat-card:nth-child(5) { background: linear-gradient(145deg, #fdf2f8, #ffffff); }
        .feat-card:nth-child(6) { background: linear-gradient(145deg, #ecfeff, #ffffff); }
        .feat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 20px; }
        .feat-card:nth-child(1) .feat-icon { background: var(--violet-bg); }
        .feat-card:nth-child(2) .feat-icon { background: var(--emerald-bg); }
        .feat-card:nth-child(3) .feat-icon { background: var(--blue-bg); }
        .feat-card:nth-child(4) .feat-icon { background: var(--amber-bg); }
        .feat-card:nth-child(5) .feat-icon { background: var(--rose-bg); }
        .feat-card:nth-child(6) .feat-icon { background: var(--cyan-bg); }
        .feat-title { font-size: 15px; font-weight: 700; margin-bottom: 9px; color: var(--black); }
        .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* TESTIMONIALS */
        .test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .test-card {
          padding: 32px; background: var(--white);
          border: 1px solid var(--border); border-radius: 24px;
          position: relative; transition: all 0.22s;
        }
        .test-card:hover { box-shadow: 0 6px 28px rgba(124,58,237,0.1); transform: translateY(-2px); }
        .test-card:nth-child(1) { border-top: 3px solid var(--violet-mid); }
        .test-card:nth-child(2) { border-top: 3px solid var(--cyan-mid); }
        .test-card:nth-child(3) { border-top: 3px solid var(--emerald-mid); }
        .test-quote { font-size: 52px; font-weight: 800; line-height: 1; margin-bottom: 14px; }
        .test-card:nth-child(1) .test-quote { color: var(--violet-light); }
        .test-card:nth-child(2) .test-quote { color: var(--cyan-bg); }
        .test-card:nth-child(3) .test-quote { color: var(--emerald-bg); }
        .test-text { font-size: 14px; color: #4b5563; line-height: 1.65; margin-bottom: 24px; }
        .test-author { display: flex; align-items: center; gap: 11px; }
        .test-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; color: var(--white); }
        .test-name { font-size: 13px; font-weight: 700; color: var(--black); }
        .test-role { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .stars { display: flex; gap: 3px; margin-bottom: 16px; }

        /* CTA */
        .cta-section {
          margin: 0 40px 112px; border-radius: 32px;
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 35%, #be185d 70%, #ea580c 100%);
          color: var(--white); padding: 96px 80px; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-section::before { content: ''; position: absolute; top: -100px; left: -100px; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.05); pointer-events: none; }
        .cta-section::after { content: ''; position: absolute; bottom: -80px; right: -80px; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.04); pointer-events: none; }
        .cta-section-circle { position: absolute; top: 50%; right: 12%; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.04); transform: translateY(-50%); pointer-events: none; }
        .cta-h2 { font-size: clamp(34px, 5.5vw, 60px); font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-bottom: 20px; position: relative; z-index: 1; color: var(--white); }
        .cta-sub { font-size: 17px; margin-bottom: 48px; color: rgba(255,255,255,0.65); font-weight: 400; position: relative; z-index: 1; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
        .btn-cta-brand { padding: 16px 34px; background: var(--white); color: var(--violet); border-radius: 14px; font-size: 14px; font-weight: 800; border: none; cursor: pointer; transition: all 0.18s; font-family: var(--font); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
        .btn-cta-brand:hover { background: var(--violet-bg); transform: translateY(-2px); }
        .btn-cta-creator { padding: 16px 34px; background: transparent; color: var(--white); border-radius: 14px; font-size: 14px; font-weight: 800; border: 2px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.18s; font-family: var(--font); }
        .btn-cta-creator:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); border-color: rgba(255,255,255,0.6); }

        /* FOOTER */
        .footer { background: #0f0a1e; border-top: 1px solid rgba(124,58,237,0.2); padding: 72px 40px 40px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 56px; margin-bottom: 56px; }
        .footer-brand { font-size: 24px; font-weight: 900; margin-bottom: 12px; color: #ffffff; letter-spacing: -0.5px; }
        .footer-tagline { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; max-width: 230px; margin-bottom: 24px; }
        .footer-email-row { display: flex; background: rgba(255,255,255,0.06); border: 1px solid rgba(124,58,237,0.3); border-radius: 10px; overflow: hidden; }
        .footer-email-input { flex: 1; background: transparent; border: none; padding: 11px 14px; color: #ffffff; font-size: 13px; outline: none; font-family: var(--font); }
        .footer-email-input::placeholder { color: rgba(255,255,255,0.3); }
        .footer-email-btn { padding: 11px 16px; background: linear-gradient(135deg, var(--violet), var(--rose-mid)); border: none; cursor: pointer; color: var(--white); font-size: 15px; font-weight: 700; transition: opacity 0.15s; }
        .footer-email-btn:hover { opacity: 0.85; }
        .footer-col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 18px; }
        .footer-links { display: flex; flex-direction: column; gap: 11px; }
        .footer-link { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.15s; }
        .footer-link:hover { color: var(--violet-mid); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.07); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }
        .footer-heart { color: var(--rose-mid); }

        .divider { border: none; border-top: 1px solid rgba(124,58,237,0.1); margin: 0; }
        .spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .spinner-dark { border-color: rgba(0,0,0,0.15); border-top-color: var(--violet); }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-box:nth-child(2) { border-right: none; }
          .stat-box:nth-child(3), .stat-box:nth-child(4) { border-top: 1px solid var(--border); }
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
          .hero-h1 { letter-spacing: -1px; }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Zelteb</Link>
          <div className="nav-links">
            <Link href="/discover" className="nav-link">Discover</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="nav-cta">Dashboard →</Link>
            ) : (
              <Link href="#get-started" className="nav-cta">Get started</Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-grid" />
        <div className="hero-blob1" />
        <div className="hero-blob2" />
        <div className="hero-blob3" />
        <div className="hero-inner">
          <div className="anim-1">
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              India's #1 influencer marketing marketplace
            </div>
          </div>
          <h1 className="hero-h1 anim-2">
            Where brands<br />
            meet <span className="grad">creators</span><br />
            that convert.
          </h1>
          <p className="hero-sub anim-3">
            Zelteb connects growth-hungry brands with authentic influencers. Run paid campaigns, track results, and pay only for real impact.
          </p>
          {user ? (
            <div className="hero-btns anim-4">
              <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="btn-primary">Go to dashboard →</Link>
            </div>
          ) : (
            <div className="hero-btns anim-4" id="get-started">
              <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-primary">
                {loading === "brand" ? <div className="spinner" /> : <GoogleIcon />}
                <span>{loading === "brand" ? "Signing in…" : "I'm a Brand"}</span>
                {loading !== "brand" && <span>→</span>}
              </button>
              <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-secondary">
                {loading === "influencer" ? <div className="spinner spinner-dark" /> : <GoogleIcon dark />}
                <span>{loading === "influencer" ? "Signing in…" : "I'm a Creator"}</span>
                {loading !== "influencer" && <span style={{ color: "var(--violet-mid)" }}>→</span>}
              </button>
            </div>
          )}
          <div className="hero-cards anim-5">
            {[
              { initials: "RK", name: "Rohit K.", stat: "2.1M followers", bg: "linear-gradient(135deg,#7c3aed,#a855f7)" },
              { initials: "PV", name: "Priya V.", stat: "₹4.2L earned",   bg: "linear-gradient(135deg,#0891b2,#06b6d4)" },
              { initials: "AM", name: "Arjun M.", stat: "Brand: NikeIN",  bg: "linear-gradient(135deg,#ea580c,#f97316)" },
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

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex" }}>
              {[
                { label: "Instagram",         color: "#7c3aed", dot: "#a855f7" },
                { label: "YouTube",           color: "#be185d", dot: "#f43f5e" },
                { label: "X (Twitter)",       color: "#0891b2", dot: "#06b6d4" },
                { label: "LinkedIn",          color: "#1d4ed8", dot: "#3b82f6" },
                { label: "Reddit",            color: "#ea580c", dot: "#f97316" },
                { label: "Medium",            color: "#059669", dot: "#10b981" },
                { label: "Paid Campaigns",    color: "#7c3aed", dot: "#8b5cf6" },
                { label: "Verified Creators", color: "#be185d", dot: "#f43f5e" },
                { label: "Brand Deals",       color: "#0891b2", dot: "#06b6d4" },
                { label: "Real Analytics",    color: "#d97706", dot: "#f59e0b" },
                { label: "INR Payouts",       color: "#059669", dot: "#10b981" },
                { label: "Instant Matching",  color: "#ea580c", dot: "#f97316" },
              ].map((item) => (
                <div className="ticker-item" key={item.label} style={{ color: item.color }}>
                  <div className="ticker-dot" style={{ background: item.dot }} />
                  {item.label}
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
            { num: "12K", suffix: "+", label: "Verified influencers", cls: "s1" },
            { num: "850", suffix: "+", label: "Brands onboarded",      cls: "s2" },
            { num: "₹2Cr", suffix: "+", label: "Creator earnings paid out", cls: "s3" },
            { num: "98",  suffix: "%", label: "Campaign satisfaction", cls: "s4" },
          ].map((s) => (
            <div className="stat-box" key={s.label}>
              <div className="stat-num">{s.num}<span className={s.cls}>{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <section className="section">
        <p className="section-label">✦ How it works</p>
        <h2 className="section-h2">Two sides. <em>One platform.</em></h2>
        <p className="section-sub">Whether you're a brand looking to grow or a creator ready to monetize — Zelteb has a clear path for you.</p>
        <div className="dual-grid">
          <div className="path-card brand-path">
            <div className="path-pill brand">For Brands</div>
            <h3 className="path-h3">Find influencers who actually move the needle.</h3>
            <p className="path-desc">Stop guessing. Browse verified creators by niche, platform, and audience quality. Launch paid campaigns that get results — not just impressions.</p>
            <div className="path-steps">
              {[
                { n: "01", t: "Post a campaign brief",   d: "Define your goals, budget, target audience, and preferred platforms." },
                { n: "02", t: "Browse matched creators", d: "Get instant matches from our verified influencer pool. Filter by metrics." },
                { n: "03", t: "Collaborate & track",     d: "Manage content approvals, track live performance, and pay securely." },
              ].map((s) => (
                <div className="path-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => signUpWith("brand")} disabled={loading !== null} className="btn-brand">
              {loading === "brand" ? <div className="spinner" /> : null}
              {loading === "brand" ? "Signing in…" : "Start hiring creators →"}
            </button>
          </div>
          <div className="path-card creator-path">
            <div className="path-pill creator">For Creators</div>
            <h3 className="path-h3">Turn your audience into a real income stream.</h3>
            <p className="path-desc">No cold emails. No chasing brands. Zelteb brings paid opportunities to you based on your niche, platforms, and engagement — automatically.</p>
            <div className="path-steps">
              {[
                { n: "01", t: "Verify your socials",       d: "Connect your Instagram, YouTube, X, and other platforms in one click." },
                { n: "02", t: "Get matched to campaigns",  d: "Brands find you based on your niche and audience. No bidding wars." },
                { n: "03", t: "Create content & get paid", d: "Submit your content, get approved, and receive INR payouts directly." },
              ].map((s) => (
                <div className="path-step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text"><strong>{s.t} — </strong>{s.d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => signUpWith("influencer")} disabled={loading !== null} className="btn-creator">
              {loading === "influencer" ? <div className="spinner" /> : null}
              {loading === "influencer" ? "Signing in…" : "Join as a creator →"}
            </button>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* FEATURES */}
      <section className="section">
        <p className="section-label">✦ Platform features</p>
        <h2 className="section-h2">Built for real <em>results.</em></h2>
        <p className="section-sub">Every tool you need to run successful influencer campaigns — from discovery to payment.</p>
        <div className="features-bento">
          {[
            { icon: "🔍", title: "Smart creator discovery",  desc: "Filter by platform, niche, follower count, engagement rate, and audience demographics to find the perfect fit." },
            { icon: "✅", title: "Verified social profiles", desc: "Every creator goes through social verification. Know exactly who you're working with before you commit." },
            { icon: "📊", title: "Live campaign analytics",  desc: "Track reach, engagement, clicks, and conversions in real time. No more waiting for screenshots." },
            { icon: "💸", title: "Secure INR payments",      desc: "Escrow-based payments. Brands pay into escrow, creators get paid upon content approval. Zero disputes." },
            { icon: "🤝", title: "Managed collaborations",   desc: "Built-in messaging, content submission, revision requests, and approval workflows — all in one place." },
            { icon: "🌐", title: "Multi-platform support",   desc: "Instagram, YouTube, X, LinkedIn, Reddit, Medium — manage all your channels from a single dashboard." },
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
        <p className="section-label">✦ What people say</p>
        <h2 className="section-h2">Trusted by brands & <em>creators.</em></h2>
        <div className="test-grid">
          {[
            { quote: "Zelteb cut our influencer search time from weeks to hours. The verification system means we never deal with fake engagement anymore.", name: "Sneha R.", role: "Marketing Head, FreshCart India", initials: "SR", bg: "linear-gradient(135deg,#7c3aed,#a855f7)" },
            { quote: "I used to spend months cold-pitching brands. Now campaigns come to me and I've tripled my monthly income from collaborations.",         name: "Karan M.", role: "Lifestyle Creator, 890K on Instagram", initials: "KM", bg: "linear-gradient(135deg,#0891b2,#06b6d4)" },
            { quote: "The analytics dashboard alone is worth it. We can see exactly what's working mid-campaign and adjust — not after it's over.",           name: "Divya S.", role: "Growth Lead, Nua Brand",              initials: "DS", bg: "linear-gradient(135deg,#059669,#10b981)" },
          ].map((t) => (
            <div className="test-card" key={t.name}>
              <div className="stars">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
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

      {/* FINAL CTA */}
      <div className="cta-section">
        <div className="cta-section-circle" />
        <h2 className="cta-h2">Your next brand deal<br />is one click away.</h2>
        <p className="cta-sub">Join 12,000+ creators and 850+ brands already growing on Zelteb.</p>
        {user ? (
          <div className="cta-btns">
            <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} style={{ padding: "16px 34px", background: "white", color: "var(--violet)", borderRadius: "14px", fontSize: "14px", fontWeight: 800, textDecoration: "none" }}>
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand">Zelteb</div>
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
            <span className="footer-copy">Made with <span className="footer-heart">♥</span> for Indian creators</span>
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
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={dark ? "#7c3aed" : "#4285F4"}/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={dark ? "#059669" : "#34A853"}/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill={dark ? "#d97706" : "#FBBC05"}/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={dark ? "#ea580c" : "#EA4335"}/>
    </svg>
  );
}