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

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-4">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payout method</h1>

        {/* ── UPI ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="font-bold text-gray-900">UPI</p>
          <p className="text-sm text-gray-500 mt-0.5 mb-4">Instant payouts via UPI ID (e.g. name@upi)</p>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
          <input
            value={upi_id}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 leading-relaxed">
            Make sure the UPI ID is linked to an active bank account. Payouts are typically processed within 1–2 business days.
          </div>
        </div>

        {/* ── Bank Account ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="font-bold text-gray-900">Bank Account</p>
          <p className="text-sm text-gray-500 mt-0.5 mb-4">Direct bank transfer via NEFT / IMPS</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name of account holder
              </label>
              <input
                value={account_holder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Enter full name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC Code</label>
              <input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                placeholder="e.g. SBIN0001234"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
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
          <p className="font-bold text-gray-900 mb-4">Address</p>

          <div className="space-y-4">
            <input
              placeholder="Street address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                placeholder="Postal code"
                value={postal_code}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* ── Message ── */}
        {message && (
          <p className={`text-sm font-medium px-1 ${messageType === "success" ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        {/* ── Save button — full width on mobile ── */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto sm:px-10 bg-black text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-gray-900 active:scale-95 transition-all"
        >
          {loading ? "Saving..." : "Save payout info"}
        </button>

      </div>
    </div>
  );
}