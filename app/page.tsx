"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
          <Link href="/" className="text-3xl font-black tracking-tighter">
            Zelteb
          </Link>

          <nav className="hidden md:flex gap-10 text-[15px] font-medium text-gray-600">
            <Link href="discover" className="hover:text-black">Discover</Link>
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
            <Link href="/purchased" className="hover:text-black">purchased</Link>
          </nav>

          {user ? (
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="text-center pt-32 pb-24 px-6">
        <h1 className="text-[64px] md:text-[96px] font-bold leading-[0.85] tracking-tighter">
          Go from 0 to 1
        </h1>
        <p className="mt-10 max-w-2xl mx-auto text-xl md:text-2xl text-gray-500 leading-relaxed">
          Anyone can earn their first rupees online. Sell your digital product and get paid
        </p>

        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          {user ? (
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-black text-white rounded-2xl text-lg font-bold"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-10 py-5 bg-black text-white rounded-2xl text-lg font-bold"
            >
              Start selling
            </Link>
          )}

          <div className="flex items-center border-2 border-gray-100 rounded-2xl px-5 py-4 w-full max-w-[380px] bg-gray-50/50">
            <input
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-gray-400"
              placeholder="Search marketplace..."
            />
            <span className="text-xl">🔍</span>
          </div>
        </div>
      </section>

      {/* BIG STATEMENT */}
      <section className="py-32 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Zelteb is an <span className="text-indigo-600">all-in-one</span> platform that
            helps creators grow without{" "}
            <span className="line-through text-red-500 decoration-4">
              messy checkouts, multiple tools, or wasted setup time
            </span>.
          </h2>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight max-w-md">
              Subscribe to get tips and tactics to grow the way you want.
            </h2>

            <div className="mt-10 flex max-w-lg bg-white rounded-md overflow-hidden p-1">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 text-black outline-none text-lg"
              />
              <button className="px-6 py-3 bg-[#f398e4] hover:bg-[#ef7cdb] text-black transition-colors flex items-center justify-center rounded-sm">
                <span className="text-2xl">→</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-20 gap-y-6 pt-2">
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="#" className="hover:text-gray-400">Discover</Link>
              <Link href="#" className="hover:text-gray-400">Blog</Link>
              <Link href="#" className="hover:text-gray-400">Pricing</Link>
              <Link href="#" className="hover:text-gray-400">Features</Link>
              <Link href="#" className="hover:text-gray-400">About</Link>
            </div>

            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="help" className="hover:text-gray-400">Help</Link>
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="/priv" className="hover:text-gray-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
