"use client";

import { useEffect, useState } from "react";

export default function Payouts() {
  const [account_holder, setAccountHolder] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [confirm_account, setConfirmAccount] = useState("");
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [maskedAccount, setMaskedAccount] = useState("");

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
      return setMessage("Fill all required fields");
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

      <div className="mt-8 bg-white border rounded-xl p-6 max-w-4xl">
        <div className="font-bold">Bank Account</div>

        <div className="mt-6">
          <label className="text-sm font-medium">
            Full name of account holder
          </label>
          <input
            value={account_holder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="mt-2 w-full border rounded-lg p-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="text-sm font-medium">IFSC</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="mt-2 w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Account #{" "}
              {hasExistingAccount && (
                <span className="text-gray-400 font-normal text-xs">
                  (current: {maskedAccount})
                </span>
              )}
            </label>
            <input
              value={account_number}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={hasExistingAccount ? "Enter to change" : ""}
              className="mt-2 w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Confirm account #</label>
            <input
              value={confirm_account}
              onChange={(e) => setConfirmAccount(e.target.value)}
              placeholder={hasExistingAccount ? "Enter to change" : ""}
              className="mt-2 w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {hasExistingAccount && !account_number && (
          <p className="mt-3 text-xs text-gray-400">
            Leave account number fields blank to keep your existing account number.
          </p>
        )}
      </div>

      <div className="mt-8 bg-white border rounded-xl p-6 max-w-4xl">
        <h2 className="font-bold mb-4">Address</h2>

        <input
          placeholder="Street address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded-lg p-3"
          />
          <input
            placeholder="Postal code"
            value={postal_code}
            onChange={(e) => setPostalCode(e.target.value)}
            className="border rounded-lg p-3"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 font-medium ${
            messageType === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-8 bg-black text-white px-8 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save payout info"}
      </button>
    </div>
  );
}