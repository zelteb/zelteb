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

  useEffect(() => {
    load();
  }, []);

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
        account_holder,
        ifsc,
        street,
        city,
        postal_code,
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

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] p-12 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8] p-12">
      <h1 className="text-3xl font-bold">Payout method</h1>

      {/* Two-column layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

        {/* LEFT — UPI */}
        <div className="bg-white border rounded-xl p-6 flex flex-col">
          <div className="font-bold text-base">UPI</div>
          <p className="text-sm text-gray-500 mt-1">
            Instant payouts via UPI ID (e.g. name@upi)
          </p>

          <div className="mt-6">
            <label className="text-sm font-medium">UPI ID</label>
            <input
              value={upi_id}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-2 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            Make sure the UPI ID is linked to an active bank account. Payouts
            are typically processed within 1–2 business days.
          </div>
        </div>

        {/* RIGHT — Bank Account */}
        <div className="bg-white border rounded-xl p-6 flex flex-col">
          <div className="font-bold text-base">Bank Account</div>
          <p className="text-sm text-gray-500 mt-1">
            Direct bank transfer via NEFT / IMPS
          </p>

          <div className="mt-6">
            <label className="text-sm font-medium">Full name of account holder</label>
            <input
              value={account_holder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="mt-2 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">IFSC</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="mt-2 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">
                Account #{" "}
                {hasExistingAccount && (
                  <span className="text-gray-400 font-normal text-xs">
                    ({maskedAccount})
                  </span>
                )}
              </label>
              <input
                value={account_number}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={hasExistingAccount ? "Enter to change" : ""}
                className="mt-2 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirm account #</label>
              <input
                value={confirm_account}
                onChange={(e) => setConfirmAccount(e.target.value)}
                placeholder={hasExistingAccount ? "Enter to change" : ""}
                className="mt-2 w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {hasExistingAccount && !account_number && (
            <p className="mt-2 text-xs text-gray-400">
              Leave account fields blank to keep your existing account number.
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="mt-6 bg-white border rounded-xl p-6 max-w-5xl">
        <h2 className="font-bold mb-4">Address</h2>

        <input
          placeholder="Street address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            placeholder="Postal code"
            value={postal_code}
            onChange={(e) => setPostalCode(e.target.value)}
            className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 font-medium text-sm ${
            messageType === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 bg-black text-white px-8 py-3 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
      >
        {loading ? "Saving..." : "Save payout info"}
      </button>
    </div>
  );
}