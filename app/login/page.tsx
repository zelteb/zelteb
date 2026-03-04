"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push("/dashboard");
    });
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google" });
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
          position: relative;
          overflow: hidden;
        }

        /* Decorative background blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #c7d9ff 0%, #a5c0ff 100%);
          top: -120px; left: -100px;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .blob-2 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #ffd6e8 0%, #ffb3d1 100%);
          bottom: -80px; right: -60px;
          animation: drift 9s ease-in-out infinite alternate-reverse;
        }
        .blob-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, #d4f5e2 0%, #a8e6c3 100%);
          top: 55%; left: 15%;
          animation: drift 15s ease-in-out infinite alternate;
        }

        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }

        /* Left panel */
        .left-panel {
          display: none;
          flex: 1;
          background: #111110;
          position: relative;
          overflow: hidden;
          padding: 56px;
          flex-direction: column;
          justify-content: space-between;
        }
        @media (min-width: 900px) { .left-panel { display: flex; } }

        .left-panel-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .left-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .left-quote {
          font-family: 'Instrument Serif', serif;
          font-size: 38px;
          line-height: 1.2;
          color: #fff;
          font-style: italic;
          max-width: 340px;
        }
        .left-quote span {
          color: #a0a09a;
          font-style: normal;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          display: block;
          margin-top: 18px;
          letter-spacing: 0.5px;
        }

        .left-dots {
          display: flex; gap: 6px;
        }
        .left-dots i {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ffffff30;
          display: block;
        }
        .left-dots i.active { background: #fff; }

        /* Right / form panel */
        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          position: relative;
          z-index: 1;
        }

        .card {
          width: 100%;
          max-width: 420px;
          animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #888;
          text-decoration: none;
          margin-bottom: 40px;
          transition: color 0.2s;
        }
        .back-link:hover { color: #333; }
        .back-link svg { transition: transform 0.2s; }
        .back-link:hover svg { transform: translateX(-3px); }

        .heading {
          font-family: 'Instrument Serif', serif;
          font-size: 40px;
          font-weight: 400;
          color: #111110;
          line-height: 1.1;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .heading em {
          font-style: italic;
          color: #555;
        }

        .subheading {
          font-size: 14px;
          color: #888;
          margin-bottom: 40px;
          font-weight: 300;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .divider-line { flex: 1; height: 1px; background: #e5e5e3; }
        .divider-text { font-size: 12px; color: #bbb; letter-spacing: 0.5px; }

        /* Google button */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          background: #fff;
          border: 1.5px solid #e5e5e3;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #111110;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .google-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f8f8f8, #fff);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .google-btn:hover {
          border-color: #ccc;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .google-btn:hover::before { opacity: 1; }
        .google-btn:active { transform: translateY(0); box-shadow: none; }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .google-btn span { position: relative; z-index: 1; }

        .google-icon { position: relative; z-index: 1; flex-shrink: 0; }

        /* Loading spinner */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #ddd;
          border-top-color: #555;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer note */
        .footer-note {
          margin-top: 32px;
          font-size: 12px;
          color: #bbb;
          text-align: center;
          line-height: 1.6;
        }
        .footer-note a { color: #888; text-decoration: underline; }
      `}</style>

      <div className="login-root">
        {/* Background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Left decorative panel */}
        <div className="left-panel">
          <div className="left-panel-noise" />
          <div className="left-logo">✦ Studio</div>
          <div>
            <p className="left-quote">
              "The best interfaces get out of the way."
              <span>— Sign in to continue your work</span>
            </p>
          </div>
          <div className="left-dots">
            <i className="active" /><i /><i />
          </div>
        </div>

        {/* Right form panel */}
        <div className="right-panel">
          <div className="card">
            <Link href="/" className="back-link">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </Link>

            <h1 className="heading">
              Welcome<br /><em>back.</em>
            </h1>
            <p className="subheading">Sign in to pick up where you left off.</p>

            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">CONTINUE WITH</span>
              <span className="divider-line" />
            </div>

            <button
              onClick={loginGoogle}
              disabled={loading}
              className="google-btn"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>{loading ? "Signing in…" : "Continue with Google"}</span>
            </button>

            <p className="footer-note">
              By continuing, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}