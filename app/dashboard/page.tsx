  "use client";

  import { useState, useEffect } from "react";
  import Link from "next/link";
  import { supabase } from "@/lib/supabase";
  import { useRouter } from "next/navigation";

  interface Purchase {
    id: string;
    amount: number;
    creator_earnings: number;
    created_at: string;
    video_title: string;
    buyer_name: string;
    buyer_email: string;
    buyer_avatar: string | null;
  }

  const MINIMUM_WITHDRAWAL = 1;

  export default function Dashboard() {
    const router = useRouter();

    const [period, setPeriod] = useState("Last 30 days");
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [hasPayoutMethod, setHasPayoutMethod] = useState(false);
    const [payoutMethodType, setPayoutMethodType] = useState<"upi" | "bank" | null>(null);

    const options = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"];

    useEffect(() => {
      const loadData = async () => {
        setLoading(true);

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) { router.push("/"); return; }

        const uid = authData.user.id;
        setUserId(uid);

        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", uid)
          .single();

        if (profile) {
          setUsername(profile.username || "");
          setAvatarUrl(profile.avatar_url || null);
        }

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
          if (hasUpi) { setHasPayoutMethod(true); setPayoutMethodType("upi"); }
          else if (hasBank) { setHasPayoutMethod(true); setPayoutMethodType("bank"); }
          else { setHasPayoutMethod(false); setPayoutMethodType(null); }
        }

        const { data: pendingRequests } = await supabase
          .from("withdrawal_requests")
          .select("id, amount, status")
          .eq("creator_id", uid)
          .eq("status", "pending");

        if (pendingRequests && pendingRequests.length > 0) setHasPendingRequest(true);

        const { data: paidRequests } = await supabase
          .from("withdrawal_requests")
          .select("amount")
          .eq("creator_id", uid)
          .in("status", ["approved", "paid", "completed"]);

        if (paidRequests) {
          setAlreadyWithdrawn(paidRequests.reduce((sum, r) => sum + Number(r.amount), 0));
        }

        const { data: purchaseData, error } = await supabase
          .from("purchases")
          .select(`id, price, creator_earnings, created_at, buyer_id, videos!purchases_video_id_fkey (title)`)
          .eq("creator_id", uid)
          .order("created_at", { ascending: false });

        if (error || !purchaseData) { setLoading(false); return; }

        const buyerIds = [...new Set(purchaseData.map((p: any) => p.buyer_id))];
        let buyerMap: Record<string, { email: string; name: string; avatar: string | null }> = {};

        try {
          const res = await fetch("/api/get-buyers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyer_ids: buyerIds }),
          });
          if (res.ok) {
            const buyers = await res.json();
            buyers.forEach((b: any) => {
              buyerMap[b.id] = {
                email: b.email ?? "—",
                name: b.raw_user_meta_data?.full_name ?? b.email ?? "Unknown",
                avatar: b.raw_user_meta_data?.avatar_url ?? null,
              };
            });
          }
        } catch { }

        setPurchases(purchaseData.map((p: any) => ({
          id: p.id,
          amount: Number(p.price),
          creator_earnings: Number(p.creator_earnings),
          created_at: p.created_at,
          video_title: (p.videos as any)?.title ?? "Untitled",
          buyer_name: buyerMap[p.buyer_id]?.name ?? "—",
          buyer_email: buyerMap[p.buyer_id]?.email ?? "—",
          buyer_avatar: buyerMap[p.buyer_id]?.avatar ?? null,
        })));

        setLoading(false);
      };

      loadData();
    }, [router]);

    useEffect(() => {
      if (!userId) return;
      const channel = supabase
        .channel(`profile-${userId}`)
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "profiles",
          filter: `id=eq.${userId}`,
        }, (payload) => {
          if (payload.new?.username !== undefined) setUsername(payload.new.username);
          if (payload.new?.avatar_url !== undefined) setAvatarUrl(payload.new.avatar_url);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!open) return;
      const handle = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".period-dropdown")) setOpen(false);
      };
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    const filteredPurchases = purchases.filter((p) => {
      if (period === "All time") return true;
      const days = period === "Last 7 days" ? 7 : period === "Last 30 days" ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return new Date(p.created_at) >= cutoff;
    });

    const totalEarnings = purchases.reduce((sum, p) => sum + p.creator_earnings, 0);
    const availableBalance = Math.max(0, totalEarnings - alreadyWithdrawn);
    const filteredEarnings = filteredPurchases.reduce((sum, p) => sum + p.creator_earnings, 0);
    const canWithdraw = !hasPendingRequest && availableBalance >= MINIMUM_WITHDRAWAL && hasPayoutMethod;

    const withdrawBlockReason = hasPendingRequest
      ? "You have a pending withdrawal request"
      : !hasPayoutMethod
      ? "Add a payout method first"
      : `Minimum ₹${MINIMUM_WITHDRAWAL} required`;

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

      if (existing) { setWithdrawError("You already have a pending withdrawal request."); setWithdrawing(false); return; }

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
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f9f9f8]">
        {/* Extra bottom padding so content clears mobile nav bars */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-4 sm:space-y-6 pb-24 sm:pb-10">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-gray-600 text-base sm:text-lg font-bold">{username?.[0]?.toUpperCase() || "?"}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                Hi, {username || "there"} 👋
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm truncate">
                zelteb.com/{username || "username"}
              </p>
            </div>

            <Link
              href="/help"
              className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Help</span>
            </Link>
          </div>

          {/* ── No payout method banner ── */}
          {!hasPayoutMethod && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Payout method required</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Add your UPI ID or bank account to enable withdrawals.{" "}
                  <Link href="/dashboard/payouts" className="underline font-medium hover:text-amber-800">
                    Set up now →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ── Earnings card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Earnings</h2>

              {/* Period picker — right-anchored dropdown, won't overflow on mobile */}
              <div className="relative period-dropdown">
                <button
                  onClick={() => setOpen(!open)}
                  className="border border-gray-200 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                  {/* On very small screens show a short label */}
                  <span className="hidden xs:inline sm:hidden">
                    {period === "Last 7 days" ? "7d"
                      : period === "Last 30 days" ? "30d"
                      : period === "Last 90 days" ? "90d"
                      : "All"}
                  </span>
                  <span className="hidden sm:inline">{period}</span>
                  <span className="xs:hidden">{
                    period === "Last 7 days" ? "7d"
                    : period === "Last 30 days" ? "30d"
                    : period === "Last 90 days" ? "90d"
                    : "All"
                  }</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                    {options.map((o) => (
                      <button
                        key={o}
                        onClick={() => { setPeriod(o); setOpen(false); }}
                        className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          period === o
                            ? "bg-gray-50 text-gray-900 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Big earnings number */}
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
              ₹{filteredEarnings.toFixed(2)}
            </p>

            {/* Available balance + withdraw CTA in a row on mobile */}
            <div className="mt-3 mb-0 flex flex-col sm:block gap-3">
              <p className="text-sm text-gray-400">
                Available to withdraw:{" "}
                <span className="font-semibold text-gray-700">₹{availableBalance.toFixed(2)}</span>
              </p>

              <div className="flex items-center gap-3 mt-4 sm:mt-5">
                <button
                  onClick={() => canWithdraw && setWithdrawModalOpen(true)}
                  disabled={!canWithdraw}
                  className={`flex-1 sm:flex-none sm:px-6 py-3 sm:py-2 rounded-xl sm:rounded-full text-sm font-semibold transition-all
                    ${canWithdraw
                      ? "bg-black text-white hover:bg-gray-800 active:scale-95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Withdraw
                </button>

                {/* Pending badge — shows inline next to button */}
                {hasPendingRequest && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                    Pending
                  </span>
                )}
              </div>

              {!canWithdraw && !hasPendingRequest && (
                <p className="text-xs text-gray-400 mt-2">
                  {!hasPayoutMethod
                    ? <Link href="/dashboard/payouts" className="text-amber-600 underline font-medium">Add payout method to withdraw →</Link>
                    : withdrawBlockReason
                  }
                </p>
              )}
            </div>
          </div>

          {/* ── Transactions ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Recent Earnings</h2>
              {filteredPurchases.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">
                  {filteredPurchases.length} transaction{filteredPurchases.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {filteredPurchases.length === 0 ? (
              <div>
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-3 bg-gray-100 rounded w-14" />
                      <div className="h-2.5 bg-gray-100 rounded w-10 ml-auto" />
                    </div>
                  </div>
                ))}
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-gray-400">No transactions yet</p>
                  <p className="text-xs text-gray-300 mt-1">Share your page to get started.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredPurchases.map((p) => {
                  const buyerInitial = p.buyer_name !== "—" ? p.buyer_name[0].toUpperCase() : "?";
                  const dateShort = new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  });
                  const dateFull = new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  });

                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition-colors">
                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {p.buyer_avatar
                          ? <img src={p.buyer_avatar} alt={p.buyer_name} className="w-full h-full object-cover" />
                          : <span className="text-amber-700 font-bold text-xs sm:text-sm">{buyerInitial}</span>
                        }
                      </div>

                      {/* Name + product */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{p.buyer_name}</p>
                        <p className="text-xs text-gray-400 truncate leading-snug">{p.video_title}</p>
                      </div>

                      {/* Amount + date — stacked on right */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                        <p className="text-sm font-bold text-green-600 leading-snug">+₹{p.creator_earnings.toFixed(2)}</p>
                        {/* Short date on mobile, full on desktop */}
                        <p className="text-xs text-gray-400 leading-snug sm:hidden">{dateShort}</p>
                        <p className="text-xs text-gray-400 leading-snug hidden sm:block">{dateFull}</p>
                        <p className="text-xs text-gray-300 leading-snug">₹{p.amount} paid</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Withdraw Modal — bottom sheet on mobile, centered on desktop ── */}
        {withdrawModalOpen && (
          <div
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget) { setWithdrawModalOpen(false); setWithdrawError(null); } }}
          >
            <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl p-6 shadow-xl">
              {/* Drag handle — mobile only visual cue */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

              <h3 className="text-lg font-bold mb-1 text-gray-900">Withdraw Earnings</h3>
              <p className="text-sm text-gray-500 mb-1">
                Requesting withdrawal of{" "}
                <span className="font-semibold text-gray-800">₹{availableBalance.toFixed(2)}</span>.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Processed within 3–5 business days to your registered payout account.
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