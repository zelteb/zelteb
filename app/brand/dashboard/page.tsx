"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function BrandSidebar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/"); return; }
      setUser(data.user);
    });
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard",      icon: "🏠", link: "/brand/dashboard" },
    { name: "Find Creators",  icon: "🔍", link: "/brand/dashboard/creators" },
    { name: "My Campaigns",   icon: "📣", link: "/brand/dashboard/campaigns" },
    { name: "Payments",       icon: "💳", link: "/brand/payments" },
    { name: "Profile",        icon: "⚙️", link: "/brand/profile" },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" className="text-xl font-black tracking-tighter">Zelteb</Link>
        <button onClick={() => setIsOpen(true)} className="text-white text-2xl focus:outline-none" aria-label="Open menu">☰</button>
      </div>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-screen bg-black text-white flex flex-col z-50 w-full md:w-64 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="text-2xl font-black tracking-tighter">Zelteb</Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white text-2xl focus:outline-none" aria-label="Close menu">✕</button>
        </div>

        {/* Brand badge */}
        <div className="px-6 py-3 border-b border-white/10">
          <span className="inline-block bg-[#f5ff4e] text-black text-xs font-bold px-3 py-1 rounded-full">🏢 Brand Account</span>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="flex items-center gap-3 px-6 py-3.5 text-sm font-medium border-b border-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <button onClick={logout} className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-sm">
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden h-14" />
    </>
  );
}

export default function BrandDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BrandSidebar />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Brand Dashboard</p>
            <h1 className="text-3xl font-black tracking-tighter">Welcome back 👋</h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Active Campaigns",    value: "0" },
              { label: "Creators Contacted",  value: "0" },
              { label: "Pending Requests",    value: "0" },
              { label: "Total Spend",         value: "₹0" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Find Creators</h3>
              <p className="text-gray-500 mb-6">Browse and connect with influencers that match your brand.</p>
              <Link href="/brand/dashboard/creators" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
                Browse Creators
              </Link>
            </div>
            <div className="bg-[#f5ff4e] border border-[#eeff00] rounded-2xl p-8">
              <div className="text-3xl mb-4">📣</div>
              <h3 className="text-xl font-bold mb-2">Create a Campaign</h3>
              <p className="text-gray-700 mb-6">Launch your first campaign and start getting creator applications.</p>
              <Link href="/brand/dashboard/campaigns" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
                New Campaign
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}