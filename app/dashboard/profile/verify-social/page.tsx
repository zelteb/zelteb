"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, UserCircle, ShieldCheck, ArrowLeft } from "lucide-react";

// ─── Sidebar nav items (mirrors profile page for consistent sidebar) ──────────
const NAV_ITEMS = [
  { key: "edit-profile",     label: "Edit profile",        icon: UserCircle,  route: "/dashboard/profile" },
  { key: "account-security", label: "Verify social media", icon: ShieldCheck, route: "/dashboard/profile/verify-social" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractHandle(value: string, platform: string): string {
  if (!value) return "";
  const patterns: Record<string, RegExp> = {
    instagram: /(?:instagram\.com\/)?@?([A-Za-z0-9_.]+)\/?$/,
    youtube:   /(?:youtube\.com\/(?:@|c\/|user\/|channel\/))?@?([A-Za-z0-9_.-]+)\/?$/,
    x:         /(?:(?:twitter|x)\.com\/)?@?([A-Za-z0-9_]+)\/?$/,
    linkedin:  /(?:linkedin\.com\/in\/)?([A-Za-z0-9_-]+)\/?$/,
    reddit:    /(?:reddit\.com\/user\/)?([A-Za-z0-9_-]+)\/?$/,
  };
  const match = value.match(patterns[platform]);
  return match ? match[1] : value;
}

function buildUrl(handle: string, platform: string): string | null {
  const h = handle.trim();
  if (!h) return null;
  const clean = extractHandle(h, platform);
  if (!clean) return null;
  const bases: Record<string, string> = {
    instagram: "https://instagram.com/",
    youtube:   "https://youtube.com/@",
    x:         "https://x.com/",
    linkedin:  "https://linkedin.com/in/",
    reddit:    "https://reddit.com/user/",
  };
  return bases[platform] + clean;
}

// ─── Social input component ───────────────────────────────────────────────────
function SocialInput({
  icon, prefix, value, onChange, placeholder, bgColor, textColor,
}: {
  icon: React.ReactNode; prefix: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  bgColor: string; textColor: string;
}) {
  return (
    <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-black transition-shadow">
      <div className={`flex items-center gap-1.5 px-3 ${bgColor} border-r border-gray-300 shrink-0`}>
        <span className={textColor}>{icon}</span>
        <span className={`text-xs font-medium ${textColor} hidden sm:inline`}>{prefix}</span>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="flex-1 px-3 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-white min-w-0"
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VerifySocial() {
  const router = useRouter();

  const [user, setUser]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube]     = useState("");
  const [twitter, setTwitter]     = useState("");
  const [linkedin, setLinkedin]   = useState("");
  const [reddit, setReddit]       = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", auth.user.id).single();

      if (profile) {
        setInstagram(extractHandle(profile.instagram_url || "", "instagram"));
        setYoutube(extractHandle(profile.youtube_url || "", "youtube"));
        setTwitter(extractHandle(profile.x_url || "", "x"));
        setLinkedin(extractHandle(profile.linkedin_url || "", "linkedin"));
        setReddit(extractHandle(profile.reddit_url || "", "reddit"));
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const saveSocial = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        instagram_url: buildUrl(instagram, "instagram"),
        youtube_url:   buildUrl(youtube, "youtube"),
        x_url:         buildUrl(twitter, "x"),
        linkedin_url:  buildUrl(linkedin, "linkedin"),
        reddit_url:    buildUrl(reddit, "reddit"),
        updated_at:    new Date().toISOString(),
      }).eq("id", user.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
    setSaving(false);
  };

  const handleNavClick = (route: string) => {
    router.push(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex gap-6 items-start">

          {/* ── Left sidebar nav ── */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border border-gray-200 rounded-2xl p-2 sticky top-8">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === "account-security";
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-gray-900" : "text-gray-400"} />
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* ── Mobile top nav ── */}
          <div className="md:hidden w-full mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === "account-security";
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={13} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* ── Right content panel ── */}
          <div className="flex-1 min-w-0 space-y-4 pb-24 sm:pb-12">

            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
              <div>
                <p className="text-sm font-bold text-gray-900">Social Links</p>
                <p className="text-xs text-gray-400 mt-1">Only verified handles will be shown on your profile page.</p>
              </div>

              <SocialInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                prefix="instagram.com/"
                value={instagram}
                onChange={setInstagram}
                placeholder="handle"
                bgColor="bg-rose-50"
                textColor="text-rose-500"
              />

              <SocialInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>}
                prefix="linkedin.com/in/"
                value={linkedin}
                onChange={setLinkedin}
                placeholder="username"
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />

              <SocialInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.032.222.049.449.049.678 0 2.737-3.129 4.965-6.993 4.965-3.864 0-6.993-2.228-6.993-4.965 0-.213.017-.421.041-.626a1.756 1.756 0 0 1-1.103-1.648c0-.968.786-1.754 1.754-1.754.463 0 .883.18 1.189.471 1.187-.844 2.819-1.397 4.611-1.477l.871-4.081c.045-.21.23-.362.443-.362l2.991.632c.08-.37.408-.651.803-.651z"/></svg>}
                prefix="reddit.com/user/"
                value={reddit}
                onChange={setReddit}
                placeholder="username"
                bgColor="bg-orange-50"
                textColor="text-orange-600"
              />

              <SocialInput
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
                prefix="youtube.com/@"
                value={youtube}
                onChange={setYoutube}
                placeholder="channel"
                bgColor="bg-red-50"
                textColor="text-red-600"
              />

              <SocialInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                prefix="x.com/"
                value={twitter}
                onChange={setTwitter}
                placeholder="handle"
                bgColor="bg-gray-100"
                textColor="text-gray-800"
              />
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
                Saved successfully
              </div>
            )}

            <button
              onClick={saveSocial}
              disabled={saving}
              className="w-full sm:w-auto sm:px-10 bg-black text-white py-3.5 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save social links"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}