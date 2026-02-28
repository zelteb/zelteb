"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
    };
    load();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const sidebarItems = [
    { name: "Home", icon: "🏠", link: "/dashboard" },
    { name: "Products", icon: "📦", link: "/dashboard/product" },
    { name: "Sales", icon: "💰", link: "/dashboard/sales" },
    { name: "Analytics", icon: "📊", link: "/dashboard/analytics" },
    { name: "Payouts", icon: "🏦", link: "/dashboard/payouts" },
    { name: "Profile", icon: "👤", link: "/dashboard/profile" },
  ];

  return (
    <aside className="w-64 bg-black text-white flex flex-col fixed top-0 left-0 h-screen z-50">
      <div className="p-6">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          Zeltebb
        </Link>
      </div>

      <nav className="flex-1 mt-4">
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
  );
}