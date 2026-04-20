"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Loader2,
  ImagePlus,
  UserCircle,
  ShieldCheck,
  ShoppingBag,
  Bell,
} from "lucide-react";

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "edit-profile",    label: "Edit profile",     icon: UserCircle  },
  { key: "account-security",label: "Account security", icon: ShieldCheck },
  { key: "orders",          label: "Orders",            icon: ShoppingBag },
  { key: "notifications",   label: "Notifications",     icon: Bell        },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

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

// ─── Shared input style ───────────────────────────────────────────────────────
const inputClass =
  "w-full border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow";

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

// ─── Placeholder panels ───────────────────────────────────────────────────────
function AccountSecurityPanel() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900">Account Security</h2>
      <p className="text-sm text-gray-500">Password and two-factor authentication settings will appear here.</p>
    </div>
  );
}

function OrdersPanel() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900">Orders</h2>
      <p className="text-sm text-gray-500">Your purchase history will appear here.</p>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900">Notifications</h2>
      <p className="text-sm text-gray-500">Manage your email and push notification preferences here.</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const router = useRouter();
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [activeNav, setActiveNav] = useState<NavKey>("edit-profile");

  const [user, setUser]                   = useState<any>(null);
  const [username, setUsername]           = useState("");
  const [fullName, setFullName]           = useState("");
  const [bio, setBio]                     = useState("");
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl]           = useState<string | null>(null);
  const [coverUploading, setCoverUploading]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [usernameError, setUsernameError] = useState("");

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

      if (!profile) {
        await supabase.from("profiles").insert({ id: auth.user.id });
      } else {
        setUsername(profile.username || "");
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
        setCoverUrl(profile.cover_url || null);
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

  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim()) { setUsernameError(""); return; }
      const clean = username.trim().toLowerCase();
      const { data } = await supabase
        .from("profiles").select("id").eq("username", clean)
        .neq("id", user?.id).maybeSingle();
      setUsernameError(data ? "This username is already taken" : "");
    };
    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout);
  }, [username, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      setAvatarUrl(url);
      setAvatarPreview(null);
    } catch (err: any) {
      alert("Avatar upload failed: " + err.message);
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCoverUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/cover.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("covers").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ cover_url: url }).eq("id", user.id);
      setCoverUrl(url);
    } catch (err: any) {
      alert("Cover upload failed: " + err.message);
    } finally {
      setCoverUploading(false);
    }
  };

  const save = async () => {
    if (!username.trim()) { setUsernameError("Username is required"); return; }
    if (usernameError) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        username:      username.trim().toLowerCase(),
        full_name:     fullName.trim(),
        bio,
        instagram_url: buildUrl(instagram, "instagram"),
        youtube_url:   buildUrl(youtube, "youtube"),
        x_url:         buildUrl(twitter, "x"),
        linkedin_url:  buildUrl(linkedin, "linkedin"),
        reddit_url:    buildUrl(reddit, "reddit"),
        updated_at:    new Date().toISOString(),
      }).eq("id", user.id);

      if (error) {
        if (error.code === "23505" || error.message.includes("profiles_username_key")) {
          setUsernameError("This username is already taken");
          setSaving(false);
          return;
        }
        throw error;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex gap-6 items-start">

          {/* ── Left sidebar nav ── */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border border-gray-200 rounded-2xl p-2 sticky top-8">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                  activeNav === key
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={17} className={activeNav === key ? "text-gray-900" : "text-gray-400"} />
                {label}
              </button>
            ))}
          </aside>

          {/* ── Mobile top nav ── */}
          <div className="md:hidden w-full mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                  activeNav === key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Right content panel ── */}
          <div className="flex-1 min-w-0 space-y-4 pb-24 sm:pb-12">

            {activeNav === "edit-profile" && (
              <>
                {/* Cover Photo */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div
                    className="relative w-full bg-gray-200 group cursor-pointer"
                    style={{ height: "clamp(120px, 25vw, 176px)" }}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverUrl ? (
                      <Image src={coverUrl} alt="Cover" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                        <ImagePlus size={26} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 active:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2">
                      {coverUploading ? (
                        <Loader2 size={22} className="text-white animate-spin" />
                      ) : (
                        <>
                          <ImagePlus size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            1600 × 500 px recommended
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
                    <p className="text-xs text-gray-400">Cover Photo · 16:5 ratio</p>
                    <button onClick={() => coverInputRef.current?.click()} className="text-xs font-medium text-gray-600 hover:text-black underline">Change</button>
                  </div>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </div>

                {/* Profile Photo */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-sm font-bold text-gray-900 mb-4">Profile Photo</p>
                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden border border-gray-200">
                        {displayAvatar ? (
                          <Image src={displayAvatar} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <span className="text-2xl font-bold text-amber-400 uppercase">
                              {username?.charAt(0) || fullName?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/40 flex items-center justify-center">
                        {avatarUploading
                          ? <Loader2 size={18} className="text-white animate-spin" />
                          : <Camera size={18} className="text-white opacity-0 group-hover:opacity-100" />}
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Profile picture</p>
                      <p className="text-xs text-gray-400 mt-0.5">Square image, 400x400 px</p>
                      <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs font-medium text-gray-600 underline">Change photo</button>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Account Details */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
                  <p className="text-sm font-bold text-gray-900">Account Details</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Eg: Basil Biju" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} className={`${inputClass} ${usernameError ? "border-red-400 focus:ring-red-200" : ""}`} />
                    {usernameError && <p className="text-red-500 text-xs mt-1.5">{usernameError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:ring-2 focus:ring-black outline-none" />
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
                  <p className="text-sm font-bold text-gray-900">Social Links</p>

                  <SocialInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>} prefix="instagram.com/" value={instagram} onChange={setInstagram} placeholder="handle" bgColor="bg-rose-50" textColor="text-rose-500" />

                  <SocialInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>} prefix="linkedin.com/in/" value={linkedin} onChange={setLinkedin} placeholder="username" bgColor="bg-blue-50" textColor="text-blue-600" />

                  <SocialInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.032.222.049.449.049.678 0 2.737-3.129 4.965-6.993 4.965-3.864 0-6.993-2.228-6.993-4.965 0-.213.017-.421.041-.626a1.756 1.756 0 0 1-1.103-1.648c0-.968.786-1.754 1.754-1.754.463 0 .883.18 1.189.471 1.187-.844 2.819-1.397 4.611-1.477l.871-4.081c.045-.21.23-.362.443-.362l2.991.632c.08-.37.408-.651.803-.651z"/></svg>} prefix="reddit.com/user/" value={reddit} onChange={setReddit} placeholder="username" bgColor="bg-orange-50" textColor="text-orange-600" />

                  <SocialInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>} prefix="youtube.com/@" value={youtube} onChange={setYoutube} placeholder="channel" bgColor="bg-red-50" textColor="text-red-600" />

                  <SocialInput icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>} prefix="x.com/" value={twitter} onChange={setTwitter} placeholder="handle" bgColor="bg-gray-100" textColor="text-gray-800" />
                </div>

                {saved && (
                  <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
                    Saved successfully
                  </div>
                )}

                <button
                  onClick={save}
                  disabled={saving || !!usernameError}
                  className="w-full sm:w-auto sm:px-10 bg-black text-white py-3.5 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </>
            )}

            {activeNav === "account-security" && <AccountSecurityPanel />}
            {activeNav === "orders"           && <OrdersPanel />}
            {activeNav === "notifications"    && <NotificationsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}