"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Withdrawal {
  id: string;
  creator_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, []);

  const markPaid = async (id: string) => {
    const confirmPay = confirm("Mark this withdrawal as paid?");
    if (!confirmPay) return;

    const { error } = await supabase
      .from("withdrawal_requests")
      .update({ status: "completed" })
      .eq("id", id);

    if (!error) loadRequests();
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Withdrawal Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">₹{r.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Creator: {r.creator_id}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                {r.status === "pending" ? (
                  <button
                    onClick={() => markPaid(r.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">Paid</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}