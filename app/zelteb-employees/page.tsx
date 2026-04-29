"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  Ban,
  Link2Off,
  X,
  MessageSquare,
  Send,
} from "lucide-react";

// ─── Passcode Gate ─────────────────────────────────────────────────────────────
const SECRET_CODE = "aslama";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "zelteb_employee_gate";

interface GateState {
  attempts: number;
  lockedUntil: number;
  dayStart: number;
}

function getTodayStart(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

function loadGateState(): GateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed: GateState = JSON.parse(raw);
    if (parsed.dayStart !== getTodayStart()) {
      return { attempts: 0, lockedUntil: parsed.lockedUntil, dayStart: getTodayStart() };
    }
    return parsed;
  } catch {
    return { attempts: 0, lockedUntil: 0, dayStart: getTodayStart() };
  }
}

function saveGateState(state: GateState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [gateState, setGateState] = useState<GateState>(() => loadGateState());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      setGateState((prev) => {
        if (prev.lockedUntil > 0 && currentNow >= prev.lockedUntil) {
          const updated: GateState = { attempts: 0, lockedUntil: 0, dayStart: getTodayStart() };
          saveGateState(updated);
          return updated;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLocked = gateState.lockedUntil > 0 && now < gateState.lockedUntil;
  const attemptsLeft = MAX_ATTEMPTS - gateState.attempts;
  const timeLeft = gateState.lockedUntil - now;

  const handleSubmit = () => {
    if (isLocked) return;
    if (code === SECRET_CODE) { onSuccess(); return; }

    const newAttempts = gateState.attempts + 1;
    const willLock = newAttempts >= MAX_ATTEMPTS;
    const updated: GateState = {
      attempts: newAttempts,
      lockedUntil: willLock ? Date.now() + LOCKOUT_DURATION_MS : gateState.lockedUntil,
      dayStart: getTodayStart(),
    };
    saveGateState(updated);
    setGateState(updated);
    setCode("");

    setError(
      willLock
        ? "Too many failed attempts. Access blocked for 24 hours."
        : `Incorrect code. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`
    );
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setError(null), 4000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center px-4">
      <div
        className="bg-white border border-gray-200 rounded-2xl px-8 py-10 w-full max-w-sm shadow-sm transition-transform"
        style={shake ? { animation: "shake 0.4s ease" } : {}}
      >
        <div className="flex justify-center mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isLocked ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}>
            {isLocked ? <Ban size={24} className="text-red-500" /> : <Lock size={24} className="text-orange-500" />}
          </div>
        </div>
        <h1 className="text-lg font-bold text-gray-900 text-center mb-1">
          {isLocked ? "Access Blocked" : "Employee Access"}
        </h1>
        {isLocked ? (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">Too many failed attempts. Try again in:</p>
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4">
              <p className="text-3xl font-bold text-red-500 font-mono tabular-nums">{formatCountdown(timeLeft)}</p>
              <p className="text-xs text-red-400 mt-1">remaining</p>
            </div>
            <p className="text-xs text-gray-400">After the lockout expires, you&apos;ll get {MAX_ATTEMPTS} fresh attempts.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 text-center mb-6">Enter your access code to continue</p>
            {gateState.attempts > 0 && (
              <div className="flex justify-center gap-1.5 mb-4">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < gateState.attempts ? "bg-red-400" : "bg-gray-200"}`} />
                ))}
                <span className="text-xs text-gray-400 ml-1">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left</span>
              </div>
            )}
            <div className="relative mb-3">
              <input
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter access code"
                autoFocus
                disabled={isLocked}
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm font-mono tracking-widest outline-none transition-all ${error ? "border-red-300 bg-red-50 text-red-600 placeholder-red-300" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400 focus:bg-white"}`}
              />
              <button type="button" onClick={() => setShowCode((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 text-center mb-3 font-medium">{error}</p>}
            <button onClick={handleSubmit} disabled={isLocked} className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Unlock
            </button>
          </>
        )}
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
const PLATFORM_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  instagram: {
    label: "Instagram", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  },
  youtube: {
    label: "YouTube", color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
  x: {
    label: "X", color: "text-gray-800", bg: "bg-gray-100", border: "border-gray-200",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  linkedin: {
    label: "LinkedIn", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
  },
  reddit: {
    label: "Reddit", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.032.222.049.449.049.678 0 2.737-3.129 4.965-6.993 4.965-3.864 0-6.993-2.228-6.993-4.965 0-.213.017-.421.041-.626a1.756 1.756 0 0 1-1.103-1.648c0-.968.786-1.754 1.754-1.754.463 0 .883.18 1.189.471 1.187-.844 2.819-1.397 4.611-1.477l.871-4.081c.045-.21.23-.362.443-.362l2.991.632c.08-.37.408-.651.803-.651z" /></svg>,
  },
  medium: {
    label: "Medium", color: "text-gray-900", bg: "bg-gray-50", border: "border-gray-200",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" /></svg>,
  },
};

const PLATFORM_BASE: Record<string, string> = {
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/@",
  x: "https://x.com/",
  linkedin: "https://www.linkedin.com/in/",
  reddit: "https://www.reddit.com/user/",
  medium: "https://medium.com/@",
};

function resolveSocialUrl(platform: string, profileUrl: string, handle: string): string {
  if (profileUrl.startsWith("http://") || profileUrl.startsWith("https://")) return profileUrl;
  const base = PLATFORM_BASE[platform];
  if (base) return `${base}${handle}`;
  return profileUrl;
}

type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationRequest {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  profile_url: string;
  status: VerificationStatus;
  created_at: string;
  rejection_reason?: string | null;
  username: string;
  full_name: string;
  avatar_url: string | null;
  influencer_type: string | null;
  email: string | null;
}

type FilterType = "all" | "pending" | "approved" | "rejected";

// ─── Quick-pick rejection reasons ────────────────────────────────────────────
const REJECTION_PRESETS = [
  "Profile link not found in bio",
  "Account doesn't meet follower requirements",
  "Profile appears to be inactive",
  "Account content doesn't align with our guidelines",
  "Unable to verify account ownership",
  "Profile URL doesn't match the submitted handle",
];

// ─── Rejection Modal ──────────────────────────────────────────────────────────
function RejectModal({
  req,
  onConfirm,
  onCancel,
  submitting,
}: {
  req: VerificationRequest;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState("");
  const meta = PLATFORM_META[req.platform] ?? PLATFORM_META["x"];
  const charLimit = 500;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <XCircle size={15} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Reject Verification</p>
              <p className="text-xs text-gray-400">Optionally tell the user why</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* User + platform summary */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
            {req.avatar_url ? (
              <Image src={req.avatar_url} alt={req.username} width={32} height={32} className="object-cover w-full h-full" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-xs font-bold text-amber-400 uppercase">{req.username?.charAt(0) || "?"}</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{req.full_name || req.username}</p>
            <p className="text-xs text-gray-400 truncate">@{req.username}</p>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${meta.bg} ${meta.border} ${meta.color} shrink-0`}>
            {meta.icon}
            @{req.handle}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Quick presets */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <MessageSquare size={11} />
              Quick reasons
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setReason(preset)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
                    reason === preset
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason textarea */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Custom message (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, charLimit))}
              placeholder="Explain why this request was rejected. The user will see this message."
              rows={3}
              className="w-full px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-gray-400">
                {reason
                  ? "This message will be saved with the rejection."
                  : "Leave blank to reject without a reason."}
              </p>
              <p className={`text-[11px] tabular-nums ${reason.length > charLimit * 0.9 ? "text-red-400" : "text-gray-400"}`}>
                {reason.length}/{charLimit}
              </p>
            </div>
          </div>

          {/* Email note */}
          {req.email && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
              <Send size={12} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-600 leading-relaxed">
                A notification will be sent to <span className="font-semibold">{req.email}</span> with this reason.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2.5 justify-end">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? (
              <><Loader2 size={13} className="animate-spin" /> Rejecting…</>
            ) : (
              <><XCircle size={14} /> Reject Request</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
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
  onRejectClick,
  onDelink,
  updating,
  delinking,
  confirmDelinkId,
  setConfirmDelinkId,
}: {
  req: VerificationRequest;
  onAccept: (id: string) => void;
  onRejectClick: (req: VerificationRequest) => void;
  onDelink: (id: string) => void;
  updating: string | null;
  delinking: string | null;
  confirmDelinkId: string | null;
  setConfirmDelinkId: (id: string | null) => void;
}) {
  const meta = PLATFORM_META[req.platform] ?? PLATFORM_META["x"];
  const profileLink = `/${req.username}`;
  const socialUrl = resolveSocialUrl(req.platform, req.profile_url, req.handle);
  const isUpdating = updating === req.id;
  const isDelinking = delinking === req.id;
  const isConfirming = confirmDelinkId === req.id;

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/70 ${req.status === "approved" ? "bg-green-50/30" : req.status === "rejected" ? "bg-red-50/30" : ""}`}>

      {/* Col 1: User */}
      <div className="flex items-center gap-3 w-[240px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
          {req.avatar_url ? (
            <Image src={req.avatar_url} alt={req.username} width={36} height={36} className="object-cover w-full h-full" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <span className="text-sm font-bold text-amber-400 uppercase">{req.username?.charAt(0) || "?"}</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <a href={profileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 group">
            <span className="text-sm font-semibold text-gray-900 truncate group-hover:underline">
              {req.full_name || req.username}
            </span>
            <ExternalLink size={11} className="text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <p className="text-xs text-gray-400 truncate">@{req.username}</p>
          {req.influencer_type && (
            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
              {req.influencer_type}
            </span>
          )}
        </div>
      </div>

      {/* Col 2: Platform */}
      <div className="flex-1 min-w-0">
        <a href={socialUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${meta.bg} ${meta.border} group`}>
          <span className={meta.color}>{meta.icon}</span>
          <span className={`text-xs font-medium ${meta.color} truncate max-w-[140px]`}>@{req.handle}</span>
          <ExternalLink size={10} className={`${meta.color} shrink-0 opacity-0 group-hover:opacity-100 transition-opacity`} />
        </a>
        <p className="text-[10px] text-gray-400 mt-1">
          {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        {/* Show rejection reason inline if rejected */}
        {req.status === "rejected" && req.rejection_reason && (
          <p className="text-[10px] text-red-400 mt-1 max-w-[180px] truncate" title={req.rejection_reason}>
            Reason: {req.rejection_reason}
          </p>
        )}
      </div>

      {/* Col 3: Action / Status */}
      <div className="flex items-center gap-2 shrink-0">
        {isUpdating || isDelinking ? (
          <Loader2 size={18} className="text-gray-400 animate-spin" />
        ) : req.status === "pending" ? (
          <>
            <button
              onClick={() => onAccept(req.id)}
              title="Accept"
              className="w-9 h-9 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 flex items-center justify-center text-green-600 transition-colors active:scale-90"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => onRejectClick(req)}
              title="Reject"
              className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-500 transition-colors active:scale-90"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </>
        ) : req.status === "approved" ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-xs font-semibold text-green-600">Approved</span>
            </div>
            {isConfirming ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                <span className="text-[11px] text-gray-500">Remove?</span>
                <button onClick={() => onDelink(req.id)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors">Yes</button>
                <button onClick={() => setConfirmDelinkId(null)} className="text-[11px] font-semibold text-gray-400 hover:text-gray-700">No</button>
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
            )}
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
  const [unlocked, setUnlocked] = useState(false);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [delinking, setDelinking] = useState<string | null>(null);
  const [confirmDelinkId, setConfirmDelinkId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Rejection modal state
  const [rejectTarget, setRejectTarget] = useState<VerificationRequest | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  useEffect(() => {
    if (!unlocked) return;

    const load = async () => {
      setLoading(true);

      const { data: verifications, error: verErr } = await supabase
        .from("verification_requests")
        .select("id, user_id, platform, handle, profile_url, status, created_at, rejection_reason")
        .order("created_at", { ascending: false });

      if (verErr) { setFetchError(verErr.message); setLoading(false); return; }
      if (!verifications || verifications.length === 0) { setRequests([]); setLoading(false); return; }

      const userIds = [...new Set(verifications.map((v) => v.user_id))];

      // Fetch profiles + emails (auth.users via RPC or profiles table)
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, influencer_type, email")
        .in("id", userIds);

      if (profErr) { setFetchError(profErr.message); setLoading(false); return; }

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
          rejection_reason: row.rejection_reason ?? null,
          username: profile.username ?? "unknown",
          full_name: profile.full_name ?? "",
          avatar_url: profile.avatar_url ?? null,
          influencer_type: profile.influencer_type ?? null,
          email: profile.email ?? null,
        };
      });

      setRequests(mapped);
      setLoading(false);
    };

    load();
  }, [unlocked]);

  const handleAccept = async (id: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("verification_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
    else console.error("Accept error:", error.message);
    setUpdating(null);
  };

  // Opens the modal
  const handleRejectClick = (req: VerificationRequest) => {
    setRejectTarget(req);
  };

  // Called after user fills in reason and clicks Reject
  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setRejectSubmitting(true);

    const updatePayload: Record<string, any> = {
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    };
    if (reason) updatePayload.rejection_reason = reason;

    const { error } = await supabase
      .from("verification_requests")
      .update(updatePayload)
      .eq("id", rejectTarget.id);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === rejectTarget.id
            ? { ...r, status: "rejected", rejection_reason: reason || null }
            : r
        )
      );
    } else {
      console.error("Reject error:", error.message);
    }

    setRejectSubmitting(false);
    setRejectTarget(null);
  };

  const handleDelink = async (id: string) => {
    setDelinking(id);
    const { error } = await supabase
      .from("verification_requests")
      .delete()
      .eq("id", id);
    if (!error) setRequests((prev) => prev.filter((r) => r.id !== id));
    else console.error("Delink error:", error.message);
    setDelinking(null);
    setConfirmDelinkId(null);
  };

  if (!unlocked) return <PasscodeGate onSuccess={() => setUnlocked(true)} />;

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

      {/* Rejection Modal */}
      {rejectTarget && (
        <RejectModal
          req={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          submitting={rejectSubmitting}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Verification Requests</h1>
          </div>
          <p className="text-sm text-gray-400">Review and manage social media verification submissions.</p>
        </div>

        {/* ── Fetch error ── */}
        {fetchError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
            <strong>Error loading data:</strong> {fetchError}
            <br />
            <span className="text-xs text-red-400">Make sure RLS policies allow reading all verification_requests.</span>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={counts.all} icon={<Users size={18} className="text-gray-600" />} color="bg-gray-100" />
          <StatCard label="Pending" value={counts.pending} icon={<Clock size={18} className="text-amber-500" />} color="bg-amber-50" />
          <StatCard label="Approved" value={counts.approved} icon={<CheckCircle2 size={18} className="text-green-500" />} color="bg-green-50" />
          <StatCard label="Rejected" value={counts.rejected} icon={<XCircle size={18} className="text-red-400" />} color="bg-red-50" />
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
                  ? f === "pending" ? "bg-amber-500 text-white border-amber-500"
                  : f === "approved" ? "bg-green-500 text-white border-green-500"
                  : f === "rejected" ? "bg-red-400 text-white border-red-400"
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
                  <option key={p} value={p}>{PLATFORM_META[p]?.label ?? p}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="w-[240px] shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User</span>
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform Handle</span>
            </div>
            <div className="shrink-0 w-[200px] text-right">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action / Status</span>
            </div>
          </div>

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
                onRejectClick={handleRejectClick}
                onDelink={handleDelink}
                updating={updating}
                delinking={delinking}
                confirmDelinkId={confirmDelinkId}
                setConfirmDelinkId={setConfirmDelinkId}
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