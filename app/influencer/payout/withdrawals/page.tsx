"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "completed" | "rejected";
  created_at: string;
  processed_at: string | null;
  note: string | null;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    pulse: true,
  },
  approved: {
    label: "Approved",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    pulse: false,
  },
  paid: {
    label: "Paid",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
    pulse: false,
  },
  completed: {
    label: "Completed",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
    pulse: false,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-400",
    pulse: false,
  },
};

export default function WithdrawalsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasPayoutMethod, setHasPayoutMethod] = useState(false);
  const [payoutMethodType, setPayoutMethodType] = useState<"upi" | "bank" | null>(null);
  const [payoutDisplay, setPayoutDisplay] = useState<string | null>(null);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const MINIMUM_WITHDRAWAL = 1;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { router.push("/"); return; }

      const uid = authData.user.id;

      // Load payout account info
      const { data: payoutData } = await supabase
        .from("payout_accounts")
        .select("upi_id, account_number_encrypted, ifsc, account_holder")
        .eq("user_id", uid)
        .single();

      if (payoutData) {
        const hasUpi = !!payoutData.upi_id?.trim();
        const hasBank =
          !!payoutData.account_number_encrypted &&
          !!payoutData.ifsc?.trim() &&
          !!payoutData.account_holder?.trim();

        if (hasUpi) {
          setHasPayoutMethod(true);
          setPayoutMethodType("upi");
          setPayoutDisplay(payoutData.upi_id);
        } else if (hasBank) {
          setHasPayoutMethod(true);
          setPayoutMethodType("bank");
          // Show masked account number — last 4 digits
          const masked = `••••${payoutData.ifsc?.slice(-4) || ""}`;
          setPayoutDisplay(`${payoutData.account_holder} · ${masked}`);
        } else {
          setHasPayoutMethod(false);
          setPayoutMethodType(null);
        }
      }

      // Total earnings from purchases
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("creator_earnings")
        .eq("creator_id", uid);

      if (purchaseData) {
        setTotalEarnings(purchaseData.reduce((sum, p) => sum + Number(p.creator_earnings), 0));
      }

      // All withdrawal requests
      const { data: allRequests } = await supabase
        .from("withdrawal_requests")
        .select("id, amount, status, created_at, processed_at, note")
        .eq("creator_id", uid)
        .order("created_at", { ascending: false });

      if (allRequests) {
        setWithdrawals(allRequests as WithdrawalRequest[]);

        const hasPending = allRequests.some((r) => r.status === "pending");
        setHasPendingRequest(hasPending);

        const withdrawn = allRequests
          .filter((r) => ["approved", "paid", "completed"].includes(r.status))
          .reduce((sum, r) => sum + Number(r.amount), 0);
        setAlreadyWithdrawn(withdrawn);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const availableBalance = Math.max(0, totalEarnings - alreadyWithdrawn);
  const canWithdraw =
    !hasPendingRequest && availableBalance >= MINIMUM_WITHDRAWAL && hasPayoutMethod;

  const withdraw = async () => {
    setWithdrawing(true);
    setWithdrawError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWithdrawError("Login required."); setWithdrawing(false); return; }

    const { data: payoutCheck } = await supabase
      .from("payout_accounts")
      .select("upi_id, account_number_encrypted, ifsc, account_holder")
      .eq("user_id", user.id)
      .single();

    const hasUpi = !!payoutCheck?.upi_id?.trim();
    const hasBank =
      !!payoutCheck?.account_number_encrypted &&
      !!payoutCheck?.ifsc?.trim() &&
      !!payoutCheck?.account_holder?.trim();

    if (!hasUpi && !hasBank) {
      setWithdrawError("Please add a UPI ID or bank account in Payout Settings before withdrawing.");
      setWithdrawing(false);
      return;
    }

    const { data: existing } = await supabase
      .from("withdrawal_requests")
      .select("id")
      .eq("creator_id", user.id)
      .eq("status", "pending")
      .single();

    if (existing) {
      setWithdrawError("You already have a pending withdrawal request.");
      setWithdrawing(false);
      return;
    }

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_id: user.id, amount: availableBalance }),
      });

      if (res.ok) {
        setWithdrawSuccess(true);
        setWithdrawModalOpen(false);
        setHasPendingRequest(true);
        // Optimistically add to list
        const newRequest: WithdrawalRequest = {
          id: crypto.randomUUID(),
          amount: availableBalance,
          status: "pending",
          created_at: new Date().toISOString(),
          processed_at: null,
          note: null,
        };
        setWithdrawals((prev) => [newRequest, ...prev]);
        setAlreadyWithdrawn((prev) => prev + availableBalance);
      } else {
        const body = await res.json().catch(() => ({}));
        setWithdrawError(body?.error ?? "Something went wrong.");
      }
    } catch {
      setWithdrawError("Network error. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading withdrawals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-4 sm:space-y-6 pb-24 sm:pb-10">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition flex-shrink-0"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Withdrawals</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Track your payout requests</p>
          </div>
        </div>

        {/* ── Balance card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total earned</p>
              <p className="text-xl font-black text-gray-900">₹{totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Withdrawn</p>
              <p className="text-xl font-black text-gray-700">₹{alreadyWithdrawn.toFixed(2)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-black rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Available</p>
              <p className="text-xl font-black text-white">₹{availableBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Payout method info */}
          {hasPayoutMethod && payoutDisplay && (
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
              {payoutMethodType === "upi" ? (
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
              <span>
                Payouts go to{" "}
                <span className="font-semibold text-gray-700">{payoutDisplay}</span>
              </span>
              <Link href="/dashboard/payouts" className="ml-auto text-gray-400 hover:text-gray-600 underline text-xs">
                Change
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => canWithdraw && setWithdrawModalOpen(true)}
              disabled={!canWithdraw}
              className={`flex-1 sm:flex-none sm:px-8 py-3 sm:py-2.5 rounded-xl sm:rounded-full text-sm font-semibold transition-all
                ${canWithdraw
                  ? "bg-black text-white hover:bg-gray-800 active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              Request withdrawal
            </button>

            {hasPendingRequest && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                Processing
              </span>
            )}
          </div>

          {/* Block reason */}
          {!canWithdraw && !hasPendingRequest && (
            <p className="text-xs text-gray-400 mt-2">
              {!hasPayoutMethod ? (
                <Link href="/dashboard/payouts" className="text-amber-600 underline font-medium">
                  Add payout method to withdraw →
                </Link>
              ) : availableBalance < MINIMUM_WITHDRAWAL ? (
                `Minimum ₹${MINIMUM_WITHDRAWAL} required to withdraw`
              ) : null}
            </p>
          )}
        </div>

        {/* ── Withdrawal history ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Withdrawal History</h2>
            {withdrawals.length > 0 && (
              <span className="text-xs text-gray-400 font-medium">
                {withdrawals.length} request{withdrawals.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {withdrawals.length === 0 ? (
            <div>
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-3 bg-gray-100 rounded w-14" />
                    <div className="h-2.5 bg-gray-100 rounded w-16 ml-auto" />
                  </div>
                </div>
              ))}
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-gray-400">No withdrawals yet</p>
                <p className="text-xs text-gray-300 mt-1">Your payout requests will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {withdrawals.map((w) => {
                const cfg = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.pending;
                const dateStr = new Date(w.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                });
                const processedStr = w.processed_at
                  ? new Date(w.processed_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : null;

                return (
                  <div key={w.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* Icon circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      {w.status === "pending" && (
                        <svg className={`w-4 h-4 ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {(w.status === "paid" || w.status === "completed") && (
                        <svg className={`w-4 h-4 ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {w.status === "approved" && (
                        <svg className={`w-4 h-4 ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {w.status === "rejected" && (
                        <svg className={`w-4 h-4 ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          ₹{Number(w.amount).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full inline-block ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-snug mt-0.5">
                        Requested {dateStr}
                        {processedStr && ` · Processed ${processedStr}`}
                      </p>
                      {w.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">{w.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info footer ── */}
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">
            Withdrawals are processed within <span className="font-medium text-gray-700">3–5 business days</span>. 
            Only one request can be active at a time. 
            For questions, visit{" "}
            <Link href="/help" className="underline text-gray-600 hover:text-gray-800">Help</Link>.
          </p>
        </div>

      </div>

      {/* ── Withdraw Modal ── */}
      {withdrawModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setWithdrawModalOpen(false);
              setWithdrawError(null);
            }
          }}
        >
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl p-6 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

            <h3 className="text-lg font-bold mb-1 text-gray-900">Confirm Withdrawal</h3>
            <p className="text-sm text-gray-500 mb-1">
              Requesting{" "}
              <span className="font-semibold text-gray-800">₹{availableBalance.toFixed(2)}</span>{" "}
              to your{" "}
              <span className="font-semibold text-gray-800">
                {payoutMethodType === "upi" ? "UPI" : "bank account"}
              </span>.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Processed within 3–5 business days.
            </p>

            {withdrawError && (
              <div className="flex items-start gap-2 text-xs text-red-600 mb-4 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {withdrawError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setWithdrawModalOpen(false); setWithdrawError(null); }}
                disabled={withdrawing}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Cancel
              </button>
              <button
                onClick={withdraw}
                disabled={withdrawing}
                className="flex-1 bg-black text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {withdrawing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </>
                ) : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast ── */}
      {withdrawSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 max-w-[calc(100vw-32px)]">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="whitespace-nowrap">Withdrawal request submitted!</span>
          <button
            onClick={() => setWithdrawSuccess(false)}
            className="ml-1 text-gray-400 hover:text-white flex-shrink-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >✕</button>
        </div>
      )}
    </div>
  );
}