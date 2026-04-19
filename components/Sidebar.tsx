"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/");
        return;
      }

      setUser(data.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
      }
    };

    load();
  }, [router]);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const sidebarItems = [
    { name: "Home", icon: "🏠", link: "/dashboard" },
    { name: "Payouts", icon: "🏦", link: "/dashboard/payouts" },
    { name: "Profile", icon: "👤", link: "/dashboard/profile" },
    ...(username
      ? [{ name: "View My Page", icon: "🌐", link: `/${username}` }]
      : []),
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" className="text-xl font-black tracking-tighter">
          Zelteb
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="text-white text-2xl focus:outline-none"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, slide-in on mobile */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-black text-white flex flex-col z-50
          w-full md:w-64
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Sidebar header */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            Zelteb
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white text-2xl focus:outline-none"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link
                key={item.name}
                href={item.link}
                className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium border-b border-white/5 transition-colors ${
                  isActive
                    ? "text-[#f398e4] bg-white/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Spacer so content doesn't go under mobile top bar */}
      <div className="md:hidden h-14" />
    </>
  );
}