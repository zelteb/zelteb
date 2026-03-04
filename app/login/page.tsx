"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push(redirectTo);
    });
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    setLoading(false);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; position: relative; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.3; pointer-events: none; }
        .blob-1 { width: 400px; height: 400px; background: #c7d9ff; top: -120px; left: -80px; animation: drift 12s ease-in-out infinite alternate; }
        .blob-2 { width: 300px; height: 300px; background: #ffd6e8; bottom: -80px; right: -60px; animation: drift 9s ease-in-out infinite alternate-reverse; }
        .blob-3 { width: 200px; height: 200px; background: #d4f5e2; top: 60%; left: 10%; animation: drift 15s ease-in-out infinite alternate; }
        @keyframes drift { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(25px, 18px) scale(1.06); } }
        .card { width: 100%; max-width: 420px; background: #fff; border: 1px solid #e7e7e5; border-radius: 16px; padding: 40px 36px; position: relative; z-index: 1; box-shadow: 0 2px 24px rgba(0,0,0,0.06); animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #888; text-decoration: none; margin-bottom: 32px; transition: color 0.2s; }
        .back-link:hover { color: #333; }
        .back-link svg { transition: transform 0.2s; }
        .back-link:hover svg { transform: translateX(-3px); }
        .heading { font-size: 26px; font-weight: 700; color: #111; letter-spacing: -0.4px; margin-bottom: 6px; }
        .subheading { font-size: 14px; color: #888; margin-bottom: 32px; font-weight: 400; }
        .divider { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .divider-line { flex: 1; height: 1px; background: #ebebea; }
        .divider-text { font-size: 11px; color: #bbb; letter-spacing: 0.6px; text-transform: uppercase; }
        .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 20px; background: #fff; border: 1.5px solid #e0e0de; border-radius: 10px; font-size: 14px; font-weight: 500; color: #111; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
        .google-btn:hover { border-color: #bbb; box-shadow: 0 3px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .google-btn:active { transform: translateY(0); box-shadow: none; }
        .google-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .spinner { width: 18px; height: 18px; border: 2px solid #ddd; border-top-color: #555; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer-note { margin-top: 28px; font-size: 12px; color: #bbb; text-align: center; line-height: 1.6; }
        .footer-note a { color: #999; text-decoration: underline; text-underline-offset: 2px; }
        .footer-note a:hover { color: #555; }
      `}</style>

      <div className="login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="card">
          <Link href="/" className="back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <h1 className="heading">Welcome back</h1>
          <p className="subheading">Sign in to continue to your account.</p>
          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">Continue with</span>
            <span className="divider-line" />
          </div>
          <button onClick={loginGoogle} disabled={loading} className="google-btn">
            {loading ? (
              <div className="spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{loading ? "Signing in..." : "Continue with Google"}</span>
          </button>
          <p className="footer-note">
            By continuing, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
}

// Suspense wrapper required because useSearchParams() causes prerender error without it
export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}