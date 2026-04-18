"use client";

import { useEffect, useState } from "react";

export default function Payouts() {
  const [account_holder, setAccountHolder] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [confirm_account, setConfirmAccount] = useState("");
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [maskedAccount, setMaskedAccount] = useState("");
  const [upi_id, setUpiId] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postal_code, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const load = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/payouts/get");
      const json = await res.json();
      if (json?.data) {
        const d = json.data;
        setAccountHolder(d.account_holder || "");
        setIfsc(d.ifsc || "");
        setStreet(d.street || "");
        setCity(d.city || "");
        setPostalCode(d.postal_code || "");
        setUpiId(d.upi_id || "");
        if (d.account_number_encrypted) {
          setHasExistingAccount(true);
          setMaskedAccount("••••••" + String(d.account_number_encrypted).slice(-4));
        } else {
          setHasExistingAccount(false);
          setMaskedAccount("");
        }
        setAccountNumber("");
        setConfirmAccount("");
      }
    } catch (e) {
      console.error("Failed to load payout data", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setMessage("");

    if (!account_holder || !ifsc) {
      setMessageType("error");
      return setMessage("Fill all required fields in Bank Account section");
    }

    const isUpdatingAccountNumber = account_number.length > 0 || confirm_account.length > 0;

    if (isUpdatingAccountNumber) {
      if (!account_number || !confirm_account) {
        setMessageType("error");
        return setMessage("Fill both account number fields to update");
      }
      if (account_number !== confirm_account) {
        setMessageType("error");
        return setMessage("Account numbers do not match");
      }
    } else if (!hasExistingAccount) {
      setMessageType("error");
      return setMessage("Please enter your account number");
    }

    try {
      setLoading(true);
      const body: Record<string, string> = {
        account_holder, ifsc, street, city, postal_code, upi_id,
      };
      if (isUpdatingAccountNumber) body.account_number = account_number;

      const res = await fetch("/api/payouts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessageType("error");
        setMessage(data?.error || "Failed to save");
      } else {
        setMessageType("success");
        setMessage("Saved successfully");
        await load();
      }
    } catch {
      setMessageType("error");
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow -webkit-appearance-none";

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      {/* Extra bottom padding so the save button isn't hidden by mobile nav bars */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-4 pb-24 sm:pb-12">

        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payout method</h1>
          <p className="text-sm text-gray-400 mt-1">Where you want to receive your earnings</p>
        </div>

        {/* ── UPI ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            {/* UPI icon badge */}
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-content-center flex-shrink-0 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <p className="font-bold text-gray-900">UPI</p>
          </div>
          <p className="text-sm text-gray-400 mb-4 ml-9">Instant payouts via UPI ID (e.g. name@upi)</p>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
          <input
            value={upi_id}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
            className={inputClass}
          />

          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 leading-relaxed">
            Make sure the UPI ID is linked to an active bank account. Payouts are typically processed within 1–2 business days.
          </div>
        </div>

        {/* ── Bank Account ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
            </div>
            <p className="font-bold text-gray-900">Bank Account</p>
          </div>
          <p className="text-sm text-gray-400 mb-4 ml-9">Direct bank transfer via NEFT / IMPS</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account holder name <span className="text-red-400">*</span>
              </label>
              <input
                value={account_holder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Enter full name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                autoCapitalize="characters"
                autoCorrect="off"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Number
                {hasExistingAccount && (
                  <span className="ml-2 text-gray-400 font-normal text-xs">
                    (current: {maskedAccount})
                  </span>
                )}
              </label>
              <input
                value={account_number}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={hasExistingAccount ? "Enter to change" : "Enter account number"}
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Account Number
              </label>
              <input
                value={confirm_account}
                onChange={(e) => setConfirmAccount(e.target.value)}
                placeholder={hasExistingAccount ? "Enter to change" : "Re-enter account number"}
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            {hasExistingAccount && !account_number && (
              <p className="text-xs text-gray-400">
                Leave account fields blank to keep your existing account number.
              </p>
            )}
          </div>
        </div>

        {/* ── Address ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <p className="font-bold text-gray-900">Address</p>
          </div>

          <div className="space-y-4">
            <input
              placeholder="Street address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Postal code"
                value={postal_code}
                onChange={(e) => setPostalCode(e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ── Message ── */}
        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            messageType === "success"
              ? "bg-green-50 border border-green-100 text-green-700"
              : "bg-red-50 border border-red-100 text-red-600"
          }`}>
            {messageType === "success" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {message}
          </div>
        )}

        {/* ── Save button ── */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto sm:px-10 bg-black text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-gray-900 active:scale-95 transition-all"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {loading ? "Saving..." : "Save payout info"}
        </button>

      </div>
    </div>
  );
}