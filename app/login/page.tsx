"use client";

export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<"brand" | "influencer" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      // Check which table they belong to and redirect
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", data.user.id)
        .single();
      if (brand) { router.push("/brand/dashboard"); return; }
      const { data: influencer } = await supabase
        .from("influencers")
        .select("id")
        .eq("user_id", data.user.id)
        .single();
      if (influencer) { router.push("/influencer/dashboard"); return; }
    });
  }, []);

  const loginWith = async (role: "brand" | "influencer") => {
    setLoading(role);
    const callbackUrl = `${window.location.origin}/auth/callback?role=${role}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    setLoading(null);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; position: relative; overflow: hidden; padding: 24px; }
        .blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.3; pointer-events: none; }
        .blob-1 { width: 400px; height: 400px; background: #c7d9ff; top: -120px; left: -80px; animation: drift 12s ease-in-out infinite alternate; }
        .blob-2 { width: 300px; height: 300px; background: #ffd6e8; bottom: -80px; right: -60px; animation: drift 9s ease-in-out infinite alternate-reverse; }
        @keyframes drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(25px,18px) scale(1.06); } }
        .top { text-align: center; margin-bottom: 40px; position: relative; z-index: 1; }
        .top h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #111; }
        .top p { font-size: 15px; color: #888; margin-top: 6px; }
        .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 680px; position: relative; z-index: 1; }
        @media (max-width: 600px) { .cards { grid-template-columns: 1fr; } }
        .card { background: #fff; border: 1.5px solid #e7e7e5; border-radius: 20px; padding: 36px 32px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .card:hover { border-color: #111; box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(-3px); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 4px; }
        .card-icon-brand { background: #f0f4ff; }
        .card-icon-inf { background: #fff0fa; }
        .card-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #aaa; }
        .card-title { font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.3px; }
        .card-desc { font-size: 14px; color: #888; line-height: 1.6; flex: 1; }
        .card-btn { margin-top: 12px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 20px; background: #111; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; font-family: inherit; transition: background 0.2s, transform 0.15s; }
        .card-btn:hover { background: #333; }
        .card-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .card-btn-inf { background: #f398e4; color: #000; }
        .card-btn-inf:hover { background: #ef7cdb; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .spinner-dark { border-color: rgba(0,0,0,0.2); border-top-color: #000; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer-note { margin-top: 28px; font-size: 12px; color: #bbb; text-align: center; line-height: 1.6; position: relative; z-index: 1; }
        .footer-note a { color: #999; text-decoration: underline; text-underline-offset: 2px; }
      `}</style>

      <div className="login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="top">
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px", color: "#111" }}>Zelteb</span>
          </Link>
          <p style={{ marginTop: 16, fontSize: 15, color: "#888" }}>Choose how you want to join</p>
        </div>

        <div className="cards">
          {/* BRAND CARD */}
          <div className="card" style={{ animationDelay: "0ms" }}>
            <div className="card-icon card-icon-brand">🏢</div>
            <div>
              <div className="card-label">For businesses</div>
              <div className="card-title">I'm a Brand</div>
            </div>
            <p className="card-desc">
              Find and collaborate with creators. Run campaigns, track performance, and grow your reach.
            </p>
            <button
              className="card-btn"
              onClick={() => loginWith("brand")}
              disabled={loading !== null}
            >
              {loading === "brand" ? (
                <div className="spinner" />
              ) : (
                <GoogleIcon />
              )}
              <span>{loading === "brand" ? "Signing in..." : "Continue as Brand"}</span>
            </button>
          </div>

          {/* INFLUENCER CARD */}
          <div className="card" style={{ animationDelay: "80ms" }}>
            <div className="card-icon card-icon-inf">✨</div>
            <div>
              <div className="card-label">For creators</div>
              <div className="card-title">I'm an Influencer</div>
            </div>
            <p className="card-desc">
              Get discovered by brands, accept collaboration requests, and monetize your audience.
            </p>
            <button
              className="card-btn card-btn-inf"
              onClick={() => loginWith("influencer")}
              disabled={loading !== null}
            >
              {loading === "influencer" ? (
                <div className="spinner spinner-dark" />
              ) : (
                <GoogleIcon dark />
              )}
              <span>{loading === "influencer" ? "Signing in..." : "Continue as Influencer"}</span>
            </button>
          </div>
        </div>

        <p className="footer-note">
          By continuing, you agree to our{" "}
          <a href="/terms">Terms of Service</a> and <a href="/priv">Privacy Policy</a>.
        </p>
      </div>
    </>
  );
}

function GoogleIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}