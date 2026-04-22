"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Users,
  Filter,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── Passcode Gate ─────────────────────────────────────────────────────────────
const SECRET_CODE = "aslama";

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (code === SECRET_CODE) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      setCode("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center px-4">
      <div
        className={`bg-white border border-gray-200 rounded-2xl px-8 py-10 w-full max-w-sm shadow-sm transition-transform ${
          shake ? "animate-shake" : ""
        }`}
        style={shake ? { animation: "shake 0.4s ease" } : {}}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <Lock size={24} className="text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold text-gray-900 text-center mb-1">
          Employee Access
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your access code to continue
        </p>

        {/* Input */}
        <div className="relative mb-3">
          <input
            type={showCode ? "text" : "password"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter access code"
            autoFocus
            className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm font-mono tracking-widest outline-none transition-all ${
              error
                ? "border-red-300 bg-red-50 text-red-600 placeholder-red-300"
                : "border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400 focus:bg-white"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center mb-3 font-medium">
            Incorrect code. Try again.
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all"
        >
          Unlock
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORM_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  instagram: {
    label: "Instagram",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  x: {
    label: "X",
    color: "text-gray-800",
    bg: "bg-gray-100",
    border: "border-gray-200",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  linkedin: {
    label: "LinkedIn",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  reddit: {
    label: "Reddit",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.032.222.049.449.049.678 0 2.737-3.129 4.965-6.993 4.965-3.864 0-6.993-2.228-6.993-4.965 0-.213.017-.421.041-.626a1.756 1.756 0 0 1-1.103-1.648c0-.968.786-1.754 1.754-1.754.463 0 .883.18 1.189.471 1.187-.844 2.819-1.397 4.611-1.477l.871-4.081c.045-.21.23-.362.443-.362l2.991.632c.08-.37.408-.651.803-.651z" />
      </svg>
    ),
  },
};

type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationRequest {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  profile_url: string;
  status: VerificationStatus;
  created_at: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  influencer_type: string | null;
}

type FilterType = "all" | "pending" | "approved" | "rejected";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────
function RequestRow({
  req,
  onAccept,
  onReject,
  updating,
}: {
  req: VerificationRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  updating: string | null;
}) {
  const meta = PLATFORM_META[req.platform] ?? PLATFORM_META["x"];
  const profileLink = `/u/${req.username}`;
  const isUpdating = updating === req.id;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/70 ${
        req.status === "approved"
          ? "bg-green-50/30"
          : req.status === "rejected"
          ? "bg-red-50/30"
          : ""
      }`}
    >
      {/* ── Col 1: User profile ── */}
      <div className="flex items-center gap-3 w-[260px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
          {req.avatar_url ? (
            <Image
              src={req.avatar_url}
              alt={req.username}
              width={36}
              height={36}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <span className="text-sm font-bold text-amber-400 uppercase">
                {req.username?.charAt(0) || "?"}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <a
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 group"
          >
            <span className="text-sm font-semibold text-gray-900 truncate group-hover:underline">
              {req.full_name || req.username}
            </span>
            <ExternalLink
              size={11}
              className="text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>
          <p className="text-xs text-gray-400 truncate">@{req.username}</p>
          {req.influencer_type && (
            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
              {req.influencer_type}
            </span>
          )}
        </div>
      </div>

      {/* ── Col 2: Platform handle ── */}
      <div className="flex-1 min-w-0">
        <a
          href={req.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${meta.bg} ${meta.border} group`}
        >
          <span className={meta.color}>{meta.icon}</span>
          <span className={`text-xs font-medium ${meta.color} truncate max-w-[160px]`}>
            @{req.handle}
          </span>
          <ExternalLink
            size={10}
            className={`${meta.color} shrink-0 opacity-0 group-hover:opacity-100 transition-opacity`}
          />
        </a>
        <p className="text-[10px] text-gray-400 mt-1">
          {new Date(req.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ── Col 3: Accept / Deny + status ── */}
      <div className="flex items-center gap-2 shrink-0">
        {isUpdating ? (
          <Loader2 size={18} className="text-gray-400 animate-spin" />
        ) : req.status === "pending" ? (
          <>
            <button
              onClick={() => onAccept(req.id)}
              title="Accept"
              className="w-9 h-9 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 flex items-center justify-center text-green-600 transition-colors active:scale-90"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5 6.5-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => onReject(req.id)}
              title="Reject"
              className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-500 transition-colors active:scale-90"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 2l10 10M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </>
        ) : req.status === "approved" ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs font-semibold text-green-600">Approved</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
            <XCircle size={14} className="text-red-400" />
            <span className="text-xs font-semibold text-red-500">Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ZeltebEmployeesPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load data only after passcode is entered
  useEffect(() => {
    if (!unlocked) return;

    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }

      const { data: verifications, error: verErr } = await supabase
        .from("verification_requests")
        .select("id, user_id, platform, handle, profile_url, status, created_at")
        .order("created_at", { ascending: false });

      if (verErr) {
        setFetchError(verErr.message);
        setLoading(false);
        return;
      }

      if (!verifications || verifications.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(verifications.map((v) => v.user_id))];

      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, influencer_type")
        .in("id", userIds);

      if (profErr) {
        setFetchError(profErr.message);
        setLoading(false);
        return;
      }

      const profileMap: Record<string, any> = {};
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });

      const mapped: VerificationRequest[] = verifications.map((row) => {
        const profile = profileMap[row.user_id] ?? {};
        return {
          id: row.id,
          user_id: row.user_id,
          platform: row.platform,
          handle: row.handle,
          profile_url: row.profile_url,
          status: row.status as VerificationStatus,
          created_at: row.created_at,
          username: profile.username ?? "unknown",
          full_name: profile.full_name ?? "",
          avatar_url: profile.avatar_url ?? null,
          influencer_type: profile.influencer_type ?? null,
        };
      });

      setRequests(mapped);
      setLoading(false);
    };

    load();
  }, [unlocked, router]);

  const handleAccept = async (id: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("verification_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
    } else {
      console.error("Accept error:", error.message);
    }
    setUpdating(null);
  };

  const handleReject = async (id: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("verification_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
    } else {
      console.error("Reject error:", error.message);
    }
    setUpdating(null);
  };

  // ── Show passcode gate first ──
  if (!unlocked) {
    return <PasscodeGate onSuccess={() => setUnlocked(true)} />;
  }

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filtered = requests.filter((r) => {
    const statusMatch = filter === "all" || r.status === filter;
    const platformMatch = platformFilter === "all" || r.platform === platformFilter;
    return statusMatch && platformMatch;
  });

  const platforms = Array.from(new Set(requests.map((r) => r.platform)));

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

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Verification Requests</h1>
          </div>
          <p className="text-sm text-gray-400">
            Review and manage social media verification submissions.
          </p>
        </div>

        {/* ── Fetch error ── */}
        {fetchError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
            <strong>Error loading data:</strong> {fetchError}
            <br />
            <span className="text-xs text-red-400">
              Make sure RLS policies allow admins to read all verification_requests.
            </span>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total"
            value={counts.all}
            icon={<Users size={18} className="text-gray-600" />}
            color="bg-gray-100"
          />
          <StatCard
            label="Pending"
            value={counts.pending}
            icon={<Clock size={18} className="text-amber-500" />}
            color="bg-amber-50"
          />
          <StatCard
            label="Approved"
            value={counts.approved}
            icon={<CheckCircle2 size={18} className="text-green-500" />}
            color="bg-green-50"
          />
          <StatCard
            label="Rejected"
            value={counts.rejected}
            icon={<XCircle size={18} className="text-red-400" />}
            color="bg-red-50"
          />
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 mr-1">
            <Filter size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Filter:</span>
          </div>

          {(["all", "pending", "approved", "rejected"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize ${
                filter === f
                  ? f === "pending"
                    ? "bg-amber-500 text-white border-amber-500"
                    : f === "approved"
                    ? "bg-green-500 text-white border-green-500"
                    : f === "rejected"
                    ? "bg-red-400 text-white border-red-400"
                    : "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f} {f !== "all" && `(${counts[f as keyof typeof counts]})`}
            </button>
          ))}

          {platforms.length > 1 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-gray-300">|</span>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_META[p]?.label ?? p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="w-[260px] shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                User
              </span>
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Platform Handle
              </span>
            </div>
            <div className="shrink-0 w-[140px] text-right">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Action / Status
              </span>
            </div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No requests found</p>
            </div>
          ) : (
            filtered.map((req) => (
              <RequestRow
                key={req.id}
                req={req}
                onAccept={handleAccept}
                onReject={handleReject}
                updating={updating}
              />
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            Showing {filtered.length} of {requests.length} requests
          </p>
        )}
      </div>
    </div>
  );
}