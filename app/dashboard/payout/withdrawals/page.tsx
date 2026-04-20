'use client';

import React, { useState } from 'react';

interface WithdrawalForm {
  amount: string;
  method: string;
  accountNumber: string;
  ifsc?: string; // For bank transfer
  upiId?: string; // For UPI
}

const WithdrawalPage: React.FC = () => {
  const [formData, setFormData] = useState<WithdrawalForm>({
    amount: '',
    method: 'bank',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      if (parseFloat(formData.amount) < 100) {
        setMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100' });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Withdrawal of ₹${formData.amount} requested successfully!` 
        });
        // Reset form after success
        setFormData({
          amount: '',
          method: 'bank',
          accountNumber: '',
          ifsc: '',
          upiId: '',
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Withdraw Money</h1>
          <p className="text-blue-100 mt-1">Fast & Secure</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-3xl font-semibold text-gray-900">₹12,450.75</p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="100"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: ₹100 | Maximum: ₹50,000 per day</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Method
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI ID</option>
            </select>
          </div>

          {/* Conditional Fields */}
          {formData.method === 'bank' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="123456789012"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc"
                  value={formData.ifsc}
                  onChange={handleChange}
                  placeholder="SBIN0001234"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="yourname@upi"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl text-lg hover:brightness-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing Withdrawal...' : 'Withdraw Now'}
          </button>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-xl text-center text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <p className="text-center text-xs text-gray-500">
            Processing time: 5-30 minutes • Secure & Encrypted
          </p>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalPage;