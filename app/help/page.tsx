"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How do I upload a video?",
    a: "Go to Creator → Upload from the sidebar. Fill in the title, description, price, and upload your video file.",
  },
  {
    q: "When will I receive my withdrawal?",
    a: "Withdrawals are processed within 3–5 business days to your registered bank account after approval.",
  },
  {
    q: "What is the minimum withdrawal amount?",
    a: "The minimum withdrawal amount is ₹1.",
  },
  {
    q: "How is my earnings calculated?",
    a: "You receive a percentage of each sale made on your videos. Platform fees are deducted automatically.",
  },
  {
    q: "Can I edit my profile or username?",
    a: "Yes, go to Dashboard → Profile to update your display name, avatar, and other details.",
  },
];

export default function Help() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const res = await fetch("https://formspree.io/f/mkovadnr", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      setSuccess(true);
      e.target.reset();
    } else {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .help-wrap { padding: 24px 16px !important; }
          .help-title { font-size: 20px !important; }
          .help-card { padding: 16px !important; }
        }
      `}</style>

      <div className="help-wrap max-w-4xl mx-auto py-10 px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="help-title text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-sm text-gray-400 mt-1">Find answers or reach out to us directly.</p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-4 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-500">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="help-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Contact Support</h2>
          <p className="text-sm text-gray-400 mb-5">Can't find your answer? Send us a message.</p>

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl text-sm mb-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Your Name"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Your Email"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <textarea
              name="message"
              required
              placeholder="Your Message"
              rows={4}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
            />
            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending...
                  </>
                ) : "Send Message"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </>
  );
}