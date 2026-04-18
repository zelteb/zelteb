"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const MINIMUM_WITHDRAWAL = 1;

export default function Dashboard() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasPayoutMethod, setHasPayoutMethod] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push("/");
        return;
      }

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

        setHasPayoutMethod(hasUpi || hasBank);
      }

      const { data: pending } = await supabase
        .from("withdrawal_requests")
        .select("id")
        .eq("creator_id", uid)
        .eq("status", "pending");

      if (pending && pending.length > 0) setHasPendingRequest(true);

      const { data: paid } = await supabase
        .from("withdrawal_requests")
        .select("amount")
        .eq("creator_id", uid)
        .in("status", ["approved", "paid", "completed"]);

      if (paid) {
        setAlreadyWithdrawn(
          paid.reduce((sum, r) => sum + Number(r.amount), 0)
        );
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const availableBalance = Math.max(0, 0 - alreadyWithdrawn); // no earnings now
  const canWithdraw =
    !hasPendingRequest &&
    availableBalance >= MINIMUM_WITHDRAWAL &&
    hasPayoutMethod;

  const withdraw = async () => {
    setWithdrawing(true);
    setWithdrawError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWithdrawError("Login required.");
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
      } else {
        setWithdrawError("Something went wrong.");
      }
    } catch {
      setWithdrawError("Network error.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" />
            ) : (
              <span>{username?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Hi, {username || "there"} 👋
            </h1>
            <p className="text-gray-400 text-sm">
              zelteb.com/{username || "username"}
            </p>
          </div>
        </div>

        {/* Payout Warning */}
        {!hasPayoutMethod && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm">
            Add payout method →{" "}
            <Link href="/dashboard/payouts" className="underline">
              Setup
            </Link>
          </div>
        )}

        {/* Withdraw Section */}
        <div className="bg-white p-6 rounded-2xl border">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <p className="text-3xl font-bold">₹{availableBalance.toFixed(2)}</p>

          <button
            onClick={() => canWithdraw && setWithdrawModalOpen(true)}
            disabled={!canWithdraw}
            className="mt-4 w-full bg-black text-white py-3 rounded-xl disabled:opacity-40"
          >
            Withdraw
          </button>
        </div>

      </div>

      {/* Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center">
          <div className="bg-white w-full max-w-sm p-6 rounded-t-2xl">
            <h3 className="font-bold mb-2">Confirm Withdraw</h3>

            {withdrawError && (
              <p className="text-red-500 text-sm">{withdrawError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="flex-1 border py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={withdraw}
                className="flex-1 bg-black text-white py-2 rounded-xl"
              >
                {withdrawing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {withdrawSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full">
          Withdrawal requested
        </div>
      )}
    </div>
  );
}