"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
} from "lucide-react";

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "yourhandle",
    urlPrefix: "https://instagram.com/",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    activeBg: "bg-rose-500",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    value: "youtube",
    label: "YouTube",
    placeholder: "yourchannel",
    urlPrefix: "https://youtube.com/@",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    activeBg: "bg-red-500",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: "x",
    label: "X (Twitter)",
    placeholder: "yourhandle",
    urlPrefix: "https://x.com/",
    color: "text-gray-800",
    bg: "bg-gray-100",
    border: "border-gray-300",
    activeBg: "bg-gray-900",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    placeholder: "yourprofile",
    urlPrefix: "https://linkedin.com/in/",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    value: "reddit",
    label: "Reddit",
    placeholder: "yourhandle",
    urlPrefix: "https://reddit.com/user/",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    activeBg: "bg-orange-500",
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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-xs font-semibold">
        <CheckCircle2 size={11} /> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-500 text-xs font-semibold">
        <XCircle size={11} /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold">
      <Clock size={11} /> Pending
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
  const [handle, setHandle] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [error, setError] = useState("");

  // Base URL for the app — adjust domain as needed
  const APP_BASE_URL =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://yourapp.com";

  const profilePageUrl = username ? `${APP_BASE_URL}/u/${username}` : null;

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      // Fetch profile to get username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", auth.user.id)
        .single();

      if (profile?.username) setUsername(profile.username);

      // Fetch existing requests for this user
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
    if (!handle.trim()) {
      setError("Please enter your handle or username.");
      return;
    }

    // Check if a pending/approved request already exists for this platform
    const existing = existingRequests.find(
      (r) => r.platform === selectedPlatform && r.status !== "rejected"
    );
    if (existing) {
      setError(
        `You already have a ${existing.status} request for ${selectedMeta?.label}.`
      );
      return;
    }

    const cleanHandle = handle.trim().replace(/^@/, "");
    const profileUrl =
      useCustomUrl && customUrl.trim()
        ? customUrl.trim()
        : `${selectedMeta!.urlPrefix}${cleanHandle}`;

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,
          platform: selectedPlatform,
          handle: cleanHandle,
          profile_url: profileUrl,
          status: "pending",
        });

      if (insertError) throw insertError;

      // Refresh existing requests
      const { data } = await supabase
        .from("verification_requests")
        .select("id, platform, handle, profile_url, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setExistingRequests(data);

      // Reset form
      setSelectedPlatform(null);
      setHandle("");
      setCustomUrl("");
      setUseCustomUrl(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError("Failed to submit: " + err.message);
    }
    setSubmitting(false);
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

        {/* ── Back button ── */}
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Profile
        </button>

        <div className="flex gap-6 items-start">

          {/* ── Left sidebar ── */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border border-gray-200 rounded-2xl p-2 sticky top-8">
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left w-full"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Edit profile
            </button>
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-900 transition-colors text-left w-full"
            >
              <ShieldCheck size={17} className="text-gray-900" />
              Verify social media
            </button>
          </aside>

          {/* ── Right content ── */}
          <div className="flex-1 min-w-0 space-y-4 pb-24 sm:pb-12">

            {/* ── Header with instructions ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} className="text-orange-500" />
                <h1 className="text-base font-bold text-gray-900">Verify Social Media</h1>
              </div>

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                How to get verified
              </p>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Make sure you have set a username in{" "}
                    <button
                      onClick={() => router.push("/dashboard/profile")}
                      className="text-gray-900 font-semibold underline underline-offset-2 hover:text-orange-500 transition-colors"
                    >
                      Edit Profile
                    </button>
                    . Your username is required to generate your profile link.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Copy your profile page link below and paste it into the bio of the social
                    media account you want to verify.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Submit your handle below. Our team will review and approve your request
                    within 1–2 business days.
                  </div>
                </li>
              </ol>

              {/* ── Profile link box ── */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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
                        <ExternalLink size={12} className="shrink-0 text-gray-400" />
                      </a>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 ${
                        copiedLink
                          ? "bg-green-50 border-green-200 text-green-600"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900 active:scale-95"
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">
                      No username set yet.{" "}
                      <button
                        onClick={() => router.push("/dashboard/profile")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-900"
                      >
                        Set one in Edit Profile
                      </button>{" "}
                      to generate your link.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Existing requests ── */}
            {existingRequests.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">Your Requests</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {existingRequests.map((req) => {
                    const meta = PLATFORMS.find((p) => p.value === req.platform);
                    const isDelinking = delinkingId === req.id;
                    const isConfirming = confirmDelinkId === req.id;
                    return (
                      <div key={req.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta?.bg ?? "bg-gray-100"} ${meta?.color ?? "text-gray-600"}`}>
                            {meta?.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {meta?.label ?? req.platform}
                            </p>
                            <a
                              href={req.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            >
                              @{req.handle}
                              <ExternalLink size={10} />
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

                          {/* Delink button — only for approved */}
                          {req.status === "approved" && (
                            isConfirming ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Remove?</span>
                                <button
                                  onClick={() => handleDelink(req.id)}
                                  disabled={isDelinking}
                                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                >
                                  {isDelinking ? <Loader2 size={12} className="animate-spin" /> : "Yes"}
                                </button>
                                <button
                                  onClick={() => setConfirmDelinkId(null)}
                                  className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelinkId(req.id)}
                                title="Delink this account"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 border border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Link2Off size={12} />
                                <span className="hidden sm:inline">Delink</span>
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
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Request submitted!</p>
                  <p className="text-xs text-green-600">We'll review your profile and update the status soon.</p>
                </div>
              </div>
            )}

            {/* ── Submission form ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
              <p className="text-sm font-bold text-gray-900">Add New Verification</p>

              {/* Platform selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2.5">
                  Select Platform
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
                          setHandle("");
                          setCustomUrl("");
                          setUseCustomUrl(false);
                          setError("");
                        }}
                        className={`relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all text-left
                          ${isDisabled
                            ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                            : isSelected
                            ? `${platform.bg} ${platform.border} ${platform.color} ring-2 ring-offset-1 ring-current`
                            : `bg-white border-gray-200 text-gray-700 hover:${platform.bg} hover:${platform.border} hover:${platform.color}`
                          }`}
                      >
                        <span className={isSelected ? platform.color : "text-gray-400"}>
                          {platform.icon}
                        </span>
                        <span>{platform.label}</span>
                        {isDisabled && (
                          <span className="absolute top-1.5 right-2 text-[9px] text-gray-400 font-normal">
                            submitted
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handle input */}
              {selectedPlatform && selectedMeta && (
                <div className="space-y-4 border-t border-gray-100 pt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {selectedMeta.label} Handle
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black transition-shadow">
                      <span className="px-3 py-3 bg-gray-50 border-r border-gray-300 text-gray-400 text-sm select-none">
                        @
                      </span>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder={selectedMeta.placeholder}
                        className="flex-1 px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-white"
                      />
                    </div>
                    {handle && !useCustomUrl && (
                      <a
                        href={`${selectedMeta.urlPrefix}${handle.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 mt-2 text-xs ${selectedMeta.color} hover:underline`}
                      >
                        {selectedMeta.urlPrefix}{handle.replace(/^@/, "")}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {/* Custom URL toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setUseCustomUrl((v) => !v)}
                      className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                    >
                      {useCustomUrl ? "Use auto-generated URL instead" : "Enter a custom profile URL instead"}
                    </button>
                    {useCustomUrl && (
                      <div className="mt-2">
                        <input
                          type="url"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder={`${selectedMeta.urlPrefix}${selectedMeta.placeholder}`}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedPlatform || !handle.trim()}
                  className="px-8 py-3 bg-black text-white rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Verification"
                  )}
                </button>
                <p className="text-xs text-gray-400">Usually reviewed within 1–2 days</p>
              </div>
            </div>

            {/* ── Info box ── */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex gap-3">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 mb-0.5">How verification works</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Our team manually reviews each request to confirm that the profile belongs
                  to you and meets our community guidelines. Once approved, a verified badge
                  will appear on your profile.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}