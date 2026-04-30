"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    key: "instagram",
    label: "Instagram",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    activeBg: "bg-rose-500",
    placeholder: "yourhandle",
    urlPrefix: "https://www.instagram.com/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    activeBg: "bg-red-600",
    placeholder: "yourchannel",
    urlPrefix: "https://www.youtube.com/@",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "x",
    label: "X (Twitter)",
    color: "text-gray-800",
    bg: "bg-gray-100",
    border: "border-gray-300",
    activeBg: "bg-gray-900",
    placeholder: "yourhandle",
    urlPrefix: "https://x.com/",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    placeholder: "your-name",
    urlPrefix: "https://www.linkedin.com/in/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    key: "reddit",
    label: "Reddit",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    activeBg: "bg-orange-500",
    placeholder: "yourhandle",
    urlPrefix: "https://www.reddit.com/user/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.032.222.049.449.049.678 0 2.737-3.129 4.965-6.993 4.965-3.864 0-6.993-2.228-6.993-4.965 0-.213.017-.421.041-.626a1.756 1.756 0 0 1-1.103-1.648c0-.968.786-1.754 1.754-1.754.463 0 .883.18 1.189.471 1.187-.844 2.819-1.397 4.611-1.477l.871-4.081c.045-.21.23-.362.443-.362l2.991.632c.08-.37.408-.651.803-.651z" />
      </svg>
    ),
  },
  {
    key: "medium",
    label: "Medium",
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    activeBg: "bg-gray-700",
    placeholder: "yourhandle",
    urlPrefix: "https://medium.com/@",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationRequest {
  id: string;
  platform: PlatformKey;
  handle: string;
  profile_url: string;
  status: VerificationStatus;
  created_at: string;
  rejection_reason: string | null;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: VerificationStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-600">
        <CheckCircle2 size={12} />
        Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-500">
        <XCircle size={12} />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-600">
      <Clock size={12} />
      Pending
    </span>
  );
}

// ─── Verified platform card ───────────────────────────────────────────────────
function PlatformCard({
  req,
  onDelete,
  deleting,
}: {
  req: VerificationRequest;
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  const platform = PLATFORMS.find((p) => p.key === req.platform);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!platform) return null;

  const profileUrl = req.profile_url.startsWith("http")
    ? req.profile_url
    : `${platform.urlPrefix}${req.handle}`;

  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${
      req.status === "approved"
        ? "bg-green-50/40 border-green-200"
        : req.status === "rejected"
        ? "bg-red-50/40 border-red-200"
        : "bg-white border-gray-200"
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${platform.bg} ${platform.border}`}>
            <span className={platform.color}>{platform.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">{platform.label}</p>
              <StatusBadge status={req.status} />
            </div>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs mt-0.5 hover:underline ${platform.color}`}
            >
              @{req.handle}
              <ExternalLink size={10} />
            </a>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Submitted {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Right: delete */}
        <div className="shrink-0">
          {deleting === req.id ? (
            <Loader2 size={15} className="text-gray-400 animate-spin" />
          ) : confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
              <span className="text-[11px] text-gray-500">Remove?</span>
              <button onClick={() => onDelete(req.id)} className="text-[11px] font-bold text-red-500 hover:text-red-700">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] font-semibold text-gray-400 hover:text-gray-700">No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Remove this verification"
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-300 hover:text-red-400 hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Rejection reason */}
      {req.status === "rejected" && req.rejection_reason && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-red-500 mb-0.5">Reason for rejection</p>
            <p className="text-xs text-red-600 leading-relaxed">{req.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* Rejection without reason */}
      {req.status === "rejected" && !req.rejection_reason && (
        <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertCircle size={13} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-500">Your request was rejected. Please try again with correct account details.</p>
        </div>
      )}

      {/* Pending info */}
      {req.status === "pending" && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <Clock size={13} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-600">Under review — usually takes 1–2 business days.</p>
        </div>
      )}
    </div>
  );
}

// ─── Add new platform form ────────────────────────────────────────────────────
function AddPlatformForm({
  existingPlatforms,
  onSubmit,
  submitting,
}: {
  existingPlatforms: PlatformKey[];
  onSubmit: (platform: PlatformKey, handle: string) => Promise<void>;
  submitting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("instagram");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

  const available = PLATFORMS.filter((p) => !existingPlatforms.includes(p.key));
  const platform = PLATFORMS.find((p) => p.key === selectedPlatform)!;

  const handleSubmit = async () => {
    const clean = handle.trim().replace(/^@/, "");
    if (!clean) { setError("Please enter your handle"); return; }
    setError("");
    await onSubmit(selectedPlatform, clean);
    setHandle("");
    setOpen(false);
  };

  if (available.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-4 text-center">
        <ShieldCheck size={20} className="text-gray-300 mx-auto mb-1.5" />
        <p className="text-xs text-gray-400">All supported platforms submitted</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-gray-300 px-5 py-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50/50 transition-all group"
      >
        <Plus size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        Add another platform
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Add platform</p>
        <button onClick={() => { setOpen(false); setHandle(""); setError(""); }} className="text-gray-400 hover:text-gray-700 transition-colors text-xs">Cancel</button>
      </div>

      {/* Platform selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Select platform</label>
        <div className="flex flex-wrap gap-2">
          {available.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPlatform(p.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedPlatform === p.key
                  ? `${p.activeBg} text-white border-transparent`
                  : `${p.bg} ${p.color} ${p.border} hover:opacity-80`
              }`}
            >
              <span className={selectedPlatform === p.key ? "text-white" : p.color}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Handle input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Your {platform.label} handle
        </label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
          <span className="px-3 py-3 bg-gray-50 border-r border-gray-200 text-xs text-gray-400 shrink-0">@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={platform.placeholder}
            className="flex-1 px-3 py-3 text-sm text-gray-900 outline-none bg-white placeholder-gray-300"
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Will link to: {platform.urlPrefix}{handle.replace(/^@/, "") || platform.placeholder}
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
        Submit for verification
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VerifySocialPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      const { data, error } = await supabase
        .from("verification_requests")
        .select("id, platform, handle, profile_url, status, created_at, rejection_reason")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(data as VerificationRequest[]);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSubmit = async (platform: PlatformKey, handle: string) => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const platformMeta = PLATFORMS.find((p) => p.key === platform)!;
    const profileUrl = `${platformMeta.urlPrefix}${handle}`;

    const { data, error } = await supabase
      .from("verification_requests")
      .insert({
        user_id: user.id,
        platform,
        handle,
        profile_url: profileUrl,
        status: "pending",
      })
      .select("id, platform, handle, profile_url, status, created_at, rejection_reason")
      .single();

    if (error) {
      setSubmitError(error.message);
    } else if (data) {
      setRequests((prev) => [data as VerificationRequest, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);

    const { error } = await supabase
      .from("verification_requests")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id); // safety: only delete own rows

    if (!error) {
      // Verify deletion from DB before updating UI
      const { data: check } = await supabase
        .from("verification_requests")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!check) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        setSubmitError("Could not remove this request. Please try again.");
      }
    } else {
      setSubmitError(error.message);
    }
    setDeleting(null);
  };

  const existingPlatforms = requests.map((r) => r.platform);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Verify Social Media</h1>
          </div>
          <p className="text-sm text-gray-400">
            Link your social accounts for a verified badge on your profile. Our team reviews each request manually.
          </p>
        </div>

        {/* ── Summary chips ── */}
        {requests.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {approvedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-600">
                <CheckCircle2 size={12} /> {approvedCount} Approved
              </span>
            )}
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-600">
                <Clock size={12} /> {pendingCount} Pending
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-500">
                <XCircle size={12} /> {rejectedCount} Rejected
              </span>
            )}
          </div>
        )}

        {/* ── Error / success banners ── */}
        {submitError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={15} className="shrink-0" />
            {submitError}
            <button onClick={() => setSubmitError(null)} className="ml-auto text-red-400 hover:text-red-600 text-xs underline">Dismiss</button>
          </div>
        )}
        {submitSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700 font-medium">
            ✓ Request submitted — our team will review it shortly.
          </div>
        )}

        {/* ── Existing requests ── */}
        {requests.length > 0 && (
          <div className="space-y-3 mb-4">
            {requests.map((req) => (
              <PlatformCard
                key={req.id}
                req={req}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ))}
          </div>
        )}

        {/* ── Add platform form ── */}
        <AddPlatformForm
          existingPlatforms={existingPlatforms}
          onSubmit={handleSubmit}
          submitting={submitting}
        />

        {/* ── How it works ── */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">How verification works</p>
          <div className="space-y-2.5">
            {[
              { step: "1", text: "Submit your social handle below" },
              { step: "2", text: "Our team manually reviews within 1–2 business days" },
              { step: "3", text: "Once approved, a verified badge appears on your profile" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{step}</div>
                <p className="text-xs text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}