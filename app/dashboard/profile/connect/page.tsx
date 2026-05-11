"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";

// ─── Platform metadata ─────────────────────────────────────────────────────────
const PLATFORM_META: Record<
  string,
  {
    label: string;
    color: string;
    accent: string;
    placeholder: string;
    urlPrefix: string;
    hint: string;
    icon: React.ReactNode;
  }
> = {
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    accent: "#fff0f5",
    placeholder: "yourhandle",
    urlPrefix: "instagram.com/",
    hint: "Enter your Instagram username (without @)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="url(#ig-g)" />
        <defs>
          <radialGradient id="ig-g" cx="30%" cy="107%" r="120%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="15%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="70%" stopColor="#d6249f" />
            <stop offset="100%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect x="10" y="10" width="28" height="28" rx="8" stroke="white" strokeWidth="3" />
        <circle cx="24" cy="24" r="6" stroke="white" strokeWidth="3" />
        <circle cx="31" cy="17" r="1.8" fill="white" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    accent: "#fff5f5",
    placeholder: "@yourchannel",
    urlPrefix: "youtube.com/",
    hint: "Enter your YouTube channel handle (e.g. @channelname)",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#FF0000" />
        <path d="M38.4 17.2a4 4 0 0 0-2.8-2.8C33.2 14 24 14 24 14s-9.2 0-11.6.4a4 4 0 0 0-2.8 2.8C9.2 19.6 9 22 9 24s.2 4.4.6 6.8a4 4 0 0 0 2.8 2.8c2.4.4 11.6.4 11.6.4s9.2 0 11.6-.4a4 4 0 0 0 2.8-2.8c.4-2.4.6-4.8.6-6.8s-.2-4.4-.6-6.8z" fill="white" />
        <polygon points="21,19.5 30,24 21,28.5" fill="#FF0000" />
      </svg>
    ),
  },
  x: {
    label: "X (Twitter)",
    color: "#000000",
    accent: "#f5f5f5",
    placeholder: "yourhandle",
    urlPrefix: "x.com/",
    hint: "Enter your X username (without @)",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#000000" />
        <path d="M34 12h-4.6L24 19.4 18.6 12H10l10.6 14L10 36h4.6L20 28.2 25.4 36H34L23.2 21.8 34 12z" fill="white" />
      </svg>
    ),
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    accent: "#f0f6ff",
    placeholder: "your-name-xyz",
    urlPrefix: "linkedin.com/in/",
    hint: "Enter your LinkedIn profile slug (the part after /in/)",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#0A66C2" />
        <rect x="11" y="19" width="7" height="20" fill="white" />
        <circle cx="14.5" cy="14" r="3.5" fill="white" />
        <path d="M21 19h5.5v2.8c.8-1.6 2.8-3 5.8-3 6.2 0 6.7 4 6.7 9.2V39H33V29c0-2.4 0-5.4-3.2-5.4-3.4 0-3.8 2.6-3.8 5.2V39H21V19z" fill="white" />
      </svg>
    ),
  },
  reddit: {
    label: "Reddit",
    color: "#FF4500",
    accent: "#fff5f0",
    placeholder: "u/yourname",
    urlPrefix: "reddit.com/",
    hint: "Enter your Reddit username (e.g. u/username)",
    icon: (
      <svg viewBox="0 0 48 48" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#FF4500" />
        <circle cx="24" cy="27" r="10" fill="white" />
        <circle cx="19.5" cy="27" r="2" fill="#FF4500" />
        <circle cx="28.5" cy="27" r="2" fill="#FF4500" />
        <path d="M19.5 31.5s2 2 4.5 2 4.5-2 4.5-2" stroke="#FF4500" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="34" cy="18" r="3" fill="white" />
        <path d="M24 17.5c0-2 1.5-3 4-3l1-5 4 1-.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="37" cy="13" r="2" fill="white" />
      </svg>
    ),
  },
};

export default function ConnectPlatformPage() {
  const router = useRouter();
  const params = useParams();
  const platform = (params?.platform as string) || "";

  const meta = PLATFORM_META[platform];

  const [user, setUser]           = useState<any>(null);
  const [handle, setHandle]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [connected, setConnected] = useState(false);
  const [existing, setExisting]   = useState<string | null>(null);
  const [error, setError]         = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      if (!meta) { router.push("/dashboard/profile"); return; }

      // Check if already connected
      const { data } = await supabase
        .from("platform_connections")
        .select("handle")
        .eq("user_id", auth.user.id)
        .eq("platform", platform)
        .maybeSingle();

      if (data) {
        setExisting(data.handle);
        setHandle(data.handle);
        setConnected(true);
      }
      setLoading(false);
    };
    load();
  }, [router, platform, meta]);

  const handleSave = async () => {
    if (!handle.trim()) { setError("Please enter your " + meta.label + " handle."); return; }
    setError("");
    setSaving(true);
    try {
      const { error: upsertError } = await supabase
        .from("platform_connections")
        .upsert(
          { user_id: user.id, platform, handle: handle.trim() },
          { onConflict: "user_id,platform" }
        );
      if (upsertError) throw upsertError;
      setConnected(true);
      setExisting(handle.trim());
    } catch (err: any) {
      setError("Failed to connect: " + err.message);
    }
    setSaving(false);
  };

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect your ${meta.label} account?`)) return;
    setSaving(true);
    try {
      const { error: delError } = await supabase
        .from("platform_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("platform", platform);
      if (delError) throw delError;
      setConnected(false);
      setExisting(null);
      setHandle("");
    } catch (err: any) {
      setError("Failed to disconnect: " + err.message);
    }
    setSaving(false);
  };

  if (loading || !meta) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to profile
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* Header band */}
          <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="mb-4">{meta.icon}</div>
            <h1 className="text-lg font-bold text-gray-900">Connect {meta.label}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Link your {meta.label} account so brands can discover your content.
            </p>
          </div>

          <div className="px-6 py-6 space-y-5">

            {connected && existing ? (
              /* ── Already connected state ── */
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-green-100 bg-green-50">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Connected</p>
                    <p className="text-xs text-green-600 mt-0.5">{existing}</p>
                  </div>
                </div>

                <a
                  href={`https://${meta.urlPrefix}${existing.replace(/^[@u\/]+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink size={13} />
                  View your {meta.label} profile
                </a>

                <div className="pt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1.5">Update handle</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black transition-shadow">
                      <span className="pl-4 pr-1 text-sm text-gray-400 whitespace-nowrap">{meta.urlPrefix}</span>
                      <input
                        value={handle}
                        onChange={(e) => { setHandle(e.target.value); setError(""); }}
                        placeholder={meta.placeholder}
                        className="flex-1 pr-4 py-3 text-sm text-gray-900 outline-none bg-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={15} className="animate-spin" /> : "Update"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  Disconnect {meta.label}
                </button>
              </div>
            ) : (
              /* ── Not connected state ── */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your {meta.label} handle
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black transition-shadow">
                    <span className="pl-4 pr-1 text-sm text-gray-400 whitespace-nowrap">{meta.urlPrefix}</span>
                    <input
                      value={handle}
                      onChange={(e) => { setHandle(e.target.value); setError(""); }}
                      placeholder={meta.placeholder}
                      className="flex-1 pr-4 py-3 text-sm text-gray-900 outline-none bg-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{meta.hint}</p>
                  {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={15} className="animate-spin" /> Connecting…
                    </span>
                  ) : (
                    `Connect ${meta.label}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info note */}
        <p className="text-xs text-gray-400 text-center mt-5 px-4">
          We only store your public handle. We never ask for your password or access your account.
        </p>
      </div>
    </div>
  );
}