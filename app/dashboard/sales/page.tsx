"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Purchase {
  id: string;
  price: number;
  platform_fee: number;
  creator_earnings: number;
  created_at: string;
}

export default function SalesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalFees, setTotalFees] = useState(0);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setPurchases(data);

      const revenue = data.reduce((sum, p) => sum + p.price, 0);
      const earnings = data.reduce((sum, p) => sum + p.creator_earnings, 0);
      const fees = data.reduce((sum, p) => sum + p.platform_fee, 0);

      setTotalRevenue(revenue);
      setTotalEarnings(earnings);
      setTotalFees(fees);
    }
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-2xl shadow bg-white">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-2xl font-bold">
            {formatINR(totalRevenue)}
          </h2>
        </div>

        <div className="p-6 rounded-2xl shadow bg-white">
          <p className="text-gray-500">Your Earnings</p>
          <h2 className="text-2xl font-bold text-green-600">
            {formatINR(totalEarnings)}
          </h2>
        </div>

        <div className="p-6 rounded-2xl shadow bg-white">
          <p className="text-gray-500">Platform Fee (7%)</p>
          <h2 className="text-2xl font-bold text-red-500">
            {formatINR(totalFees)}
          </h2>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Price</th>
              <th className="p-4">Fee</th>
              <th className="p-4">Earnings</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No transactions yet
                </td>
              </tr>
            )}

            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-t">
                <td className="p-4">
                  {formatINR(purchase.price)}
                </td>
                <td className="p-4 text-red-500">
                  {formatINR(purchase.platform_fee)}
                </td>
                <td className="p-4 text-green-600">
                  {formatINR(purchase.creator_earnings)}
                </td>
                <td className="p-4">
                  {new Date(purchase.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}