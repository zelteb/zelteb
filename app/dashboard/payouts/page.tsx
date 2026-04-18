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

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setMessage("");

    if (!account_holder || !ifsc) {
      setMessageType("error");
      return setMessage("Fill all required fields in Bank Account section");
    }

    const isUpdatingAccountNumber =
      account_number.length > 0 || confirm_account.length > 0;

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
        account_holder,
        ifsc,
        upi_id,
      };

      if (isUpdatingAccountNumber) {
        body.account_number = account_number;
      }

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
    "w-full border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow";

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        <h1 className="text-2xl font-bold">Payout method</h1>

        {/* UPI */}
        <div className="bg-white border rounded-xl p-4">
          <p className="font-semibold mb-2">UPI</p>

          <input
            value={upi_id}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className={inputClass}
          />
        </div>

        {/* Bank */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <p className="font-semibold">Bank Account</p>

          <input
            value={account_holder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="Account holder"
            className={inputClass}
          />

          <input
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            placeholder="IFSC"
            className={inputClass}
          />

          <input
            value={account_number}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={
              hasExistingAccount
                ? `Change (current: ${maskedAccount})`
                : "Account number"
            }
            className={inputClass}
          />

          <input
            value={confirm_account}
            onChange={(e) => setConfirmAccount(e.target.value)}
            placeholder="Confirm account number"
            className={inputClass}
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded text-sm ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}>
            {message}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-xl w-full"
        >
          {loading ? "Saving..." : "Save payout info"}
        </button>
      </div>
    </div>
  );
}