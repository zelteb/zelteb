"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Link2Off,
  Sparkles,
} from "lucide-react";

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    ring: "ring-rose-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    value: "youtube",
    label: "YouTube",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    ring: "ring-red-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: "x",
    label: "X (Twitter)",
    color: "text-gray-800",
    bg: "bg-gray-100",
    border: "border-gray-300",
    ring: "ring-gray-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    value: "reddit",
    label: "Reddit",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    ring: "ring-orange-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.032.222.049.449.049.678 0 2.737-3.129 4.965-6.993 4.965-3.864 0-6.993-2.228-6.993-4.965 0-.213.017-.421.041-.626a1.756 1.756 0 0 1-1.103-1.648c0-.968.786-1.754 1.754-1.754.463 0 .883.18 1.189.471 1.187-.844 2.819-1.397 4.611-1.477l.871-4.081c.045-.21.23-.362.443-.362l2.991.632c.08-.37.408-.651.803-.651z" />
      </svg>
    ),
  },
] as const;

type PlatformValue = (typeof PLATFORMS)[number]["value"];

interface ExistingRequest {
  id: string;
  platform: string;
  handle: string;
  profile_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ExistingRequest["status"] }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-semibold tracking-wide">
        <CheckCircle2 size={10} strokeWidth={2.5} /> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-500 text-[11px] font-semibold tracking-wide">
        <XCircle size={10} strokeWidth={2.5} /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[11px] font-semibold tracking-wide">
      <Clock size={10} strokeWidth={2.5} /> Pending
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VerifySocialPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingRequests, setExistingRequests] = useState<ExistingRequest[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [delinkingId, setDelinkingId] = useState<string | null>(null);
  const [confirmDelinkId, setConfirmDelinkId] = useState<string | null>(null);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformValue | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [error, setError] = useState("");

  const APP_BASE_URL =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://zelteb.com";

  const profilePageUrl = username ? `${APP_BASE_URL}/${username}` : null;

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", auth.user.id)
        .single();

      if (profile?.username) setUsername(profile.username);

      const { data } = await supabase
        .from("verification_requests")
        .select("id, platform, handle, profile_url, status, created_at")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (data) setExistingRequests(data);
      setLoading(false);
    };
    load();
  }, [router]);

  const selectedMeta = PLATFORMS.find((p) => p.value === selectedPlatform);

  const handleCopyLink = async () => {
    if (!profilePageUrl) return;
    await navigator.clipboard.writeText(profilePageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDelink = async (reqId: string) => {
    setDelinkingId(reqId);
    try {
      const { error: delError } = await supabase
        .from("verification_requests")
        .delete()
        .eq("id", reqId)
        .eq("user_id", user.id);

      if (delError) throw delError;
      setExistingRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (err: any) {
      alert("Failed to delink: " + err.message);
    }
    setDelinkingId(null);
    setConfirmDelinkId(null);
  };

  const handleSubmit = async () => {
    setError("");

    if (!username) {
      setError("You need to set a username in Edit Profile before verifying.");
      return;
    }
    if (!selectedPlatform) {
      setError("Please select a platform.");
      return;
    }
    if (!profileUrl.trim()) {
      setError("Please enter your profile URL.");
      return;
    }

    const existing = existingRequests.find(
      (r) => r.platform === selectedPlatform && r.status !== "rejected"
    );
    if (existing) {
      setError(
        `You already have a ${existing.status} request for ${selectedMeta?.label}.`
      );
      return;
    }

    // Derive handle from URL for storage (best-effort)
    const urlParts = profileUrl.trim().replace(/\/$/, "").split("/");
    const derivedHandle = urlParts[urlParts.length - 1].replace(/^@/, "") || profileUrl.trim();

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,
          platform: selectedPlatform,
          handle: derivedHandle,
          profile_url: profileUrl.trim(),
          status: "pending",
        });

      if (insertError) throw insertError;

      const { data } = await supabase
        .from("verification_requests")
        .select("id, platform, handle, profile_url, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setExistingRequests(data);

      setSelectedPlatform(null);
      setProfileUrl("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError("Failed to submit: " + err.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Back button ── */}
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to Profile
        </button>

        <div className="flex gap-6 items-start">

          {/* ── Left sidebar ── */}
          <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-8 gap-1">
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-900 transition-all text-left w-full border border-transparent hover:border-gray-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Edit profile
            </button>
            <button className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-900 shadow-sm text-left w-full">
              <ShieldCheck size={15} className="text-orange-500" />
              Verify social media
            </button>
          </aside>

          {/* ── Right content ── */}
          <div className="flex-1 min-w-0 space-y-3 pb-24 sm:pb-12">

            {/* ── Page title ── */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
                <ShieldCheck size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">Verify Social Media</h1>
                <p className="text-xs text-gray-400">Link your accounts to get a verified badge</p>
              </div>
            </div>

            {/* ── How it works ── */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                How it works
              </p>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    text: (
                      <>
                        Set a username in{" "}
                        <button
                          onClick={() => router.push("/dashboard/profile")}
                          className="font-semibold text-gray-900 underline underline-offset-2 hover:text-orange-500 transition-colors"
                        >
                          Edit Profile
                        </button>{" "}
                        — it's used to generate your profile link below.
                      </>
                    ),
                  },
                  {
                    step: "2",
                    text: "Copy your profile link and paste it into the bio of the social account you want to verify.",
                  },
                  {
                    step: "3",
                    text: "Submit the profile URL below. Our team reviews within 1–2 business days.",
                  },
                  {
                    step: "4",
                    text: "Keep your profile link in your bio — if you remove it, you will no longer be eligible for brand deals.",
                  },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-lg bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black flex items-center justify-center mt-0.5 shrink-0">
                      {step}
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              {/* ── Profile link ── */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Your Profile Link
                </p>
                {profilePageUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 min-w-0">
                      <a
                        href={profilePageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 font-medium truncate hover:text-orange-500 transition-colors flex items-center gap-1.5 min-w-0"
                      >
                        <span className="truncate">{profilePageUrl}</span>
                        <ExternalLink size={11} className="shrink-0 text-gray-400" />
                      </a>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 ${
                        copiedLink
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900 active:scale-[0.97]"
                      }`}
                    >
                      {copiedLink ? <><Check size={13} strokeWidth={2.5} /> Copied</> : <><Copy size={13} /> Copy</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3">
                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">
                      No username set.{" "}
                      <button
                        onClick={() => router.push("/dashboard/profile")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-900"
                      >
                        Set one in Edit Profile
                      </button>{" "}
                      first.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Existing requests ── */}
            {existingRequests.length > 0 && (
              <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">Your Requests</p>
                  <span className="text-[11px] text-gray-400 font-medium bg-gray-100 rounded-full px-2 py-0.5">
                    {existingRequests.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {existingRequests.map((req) => {
                    const meta = PLATFORMS.find((p) => p.value === req.platform);
                    const isDelinking = delinkingId === req.id;
                    const isConfirming = confirmDelinkId === req.id;
                    return (
                      <div key={req.id} className="flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta?.bg ?? "bg-gray-100"} ${meta?.color ?? "text-gray-600"} border ${meta?.border ?? "border-gray-200"}`}>
                            {meta?.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {meta?.label ?? req.platform}
                            </p>
                            {/* ✅ Fix: link goes to req.profile_url (their actual social profile) */}
                            <a
                              href={req.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 truncate max-w-[160px]"
                            >
                              <span className="truncate">{req.profile_url}</span>
                              <ExternalLink size={9} className="shrink-0" />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={req.status} />
                          <p className="text-[10px] text-gray-400 hidden sm:block">
                            {new Date(req.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {req.status === "approved" && (
                            isConfirming ? (
                              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                                <span className="text-[11px] text-gray-500">Remove?</span>
                                <button
                                  onClick={() => handleDelink(req.id)}
                                  disabled={isDelinking}
                                  className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                >
                                  {isDelinking ? <Loader2 size={11} className="animate-spin" /> : "Yes"}
                                </button>
                                <button
                                  onClick={() => setConfirmDelinkId(null)}
                                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-700"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelinkId(req.id)}
                                title="Delink this account"
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Link2Off size={11} />
                                <span className="hidden sm:inline text-[11px]">Delink</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Success banner ── */}
            {submitted && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">Request submitted!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">We'll review and update your status within 1–2 business days.</p>
                </div>
              </div>
            )}

            {/* ── Submission form ── */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">Add New Verification</p>
                {selectedMeta && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${selectedMeta.bg} ${selectedMeta.color} border ${selectedMeta.border}`}>
                    {selectedMeta.icon}
                    {selectedMeta.label}
                  </span>
                )}
              </div>

              {/* Platform selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatform === platform.value;
                    const isDisabled = existingRequests.some(
                      (r) => r.platform === platform.value && r.status !== "rejected"
                    );
                    return (
                      <button
                        key={platform.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedPlatform(platform.value);
                          setProfileUrl("");
                          setError("");
                        }}
                        className={`relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all text-left
                          ${isDisabled
                            ? "opacity-35 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                            : isSelected
                            ? `${platform.bg} ${platform.border} ${platform.color} shadow-sm ring-2 ring-offset-1 ring-current/30`
                            : `bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]`
                          }`}
                      >
                        <span className={isSelected ? platform.color : "text-gray-400 group-hover:text-gray-600"}>
                          {platform.icon}
                        </span>
                        <span>{platform.label}</span>
                        {isDisabled && (
                          <span className="absolute top-1.5 right-2 text-[9px] text-gray-400 bg-gray-100 rounded px-1 py-0.5 leading-tight">
                            added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile URL input — only shown after platform selected */}
              {selectedPlatform && selectedMeta && (
                <div className="border-t border-gray-100 pt-5 space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {selectedMeta.label} Profile URL
                  </label>
                  <div className={`flex items-center border rounded-xl overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-black focus-within:border-transparent ${profileUrl ? "border-gray-300" : "border-gray-200"}`}>
                    <span className="px-3.5 py-3 bg-gray-50 border-r border-gray-200 text-gray-400 text-xs font-medium select-none whitespace-nowrap shrink-0">
                      URL
                    </span>
                    <input
                      type="url"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      placeholder={`https://${selectedMeta.value}.com/yourhandle`}
                      className="flex-1 px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-white"
                    />
                    {profileUrl.trim() && (
                      <a
                        href={profileUrl.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Preview"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 pl-1">
                    Paste the full URL of your {selectedMeta.label} profile page
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedPlatform || !profileUrl.trim()}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold active:scale-[0.97] transition-all disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black shadow-sm"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    "Submit for Verification"
                  )}
                </button>
                <p className="text-xs text-gray-400">Reviewed in 1–2 days</p>
              </div>
            </div>

            {/* ── Info box ── */}
            <div className="flex gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
              <Sparkles size={15} className="text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-700 mb-0.5">Manual review process</p>
                <p className="text-xs text-orange-600 leading-relaxed">
                  Each request is reviewed by our team to confirm the account belongs to you
                  and meets our guidelines. Once approved, a verified badge appears on your
                  profile.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}