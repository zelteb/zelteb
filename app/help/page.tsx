"use client";

import { useState } from "react";

export default function Help() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const res = await fetch("https://formspree.io/f/mzdajwpl", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Contact Support
        </h1>

        {success && (
          <p className="text-green-600 text-center mb-4">
            Message sent successfully!
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            required
            placeholder="Your Name"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="email"
            name="email"
            required
            placeholder="Your Email"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <textarea
            name="message"
            required
            placeholder="Your Message"
            rows={4}
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white rounded-lg p-3 hover:opacity-90 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}