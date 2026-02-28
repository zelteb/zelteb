"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
// 🔥 TEMP DEBUG — expose supabase to browser console
if (typeof window !== "undefined") {
  // @ts-ignore
  window.supabase = supabase;
}

export default function Dashboard() {
  const router = useRouter();

  const [period, setPeriod] = useState("Last 30 days");
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const options = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"];

  // ✅ Load user + profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        router.push("/");
        return;
      }

      setUserId(auth.user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", auth.user.id)
        .single();

      if (!error && profile) {
        setUsername(profile.username || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  // ✅ Realtime listener
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);

          if (payload.new?.username !== undefined) {
            setUsername(payload.new.username);
          }

          if (payload.new?.avatar_url !== undefined) {
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-xl font-bold">
                {username?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Hi, {username || "there"}
            </h1>
            <p className="text-gray-400 text-sm">
              Zelteeb.shop/{username || "username"}
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-900 transition">
          Share page
        </button>
      </div>

      {/* Earnings Card */}
      <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Earnings</h2>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm font-medium text-gray-700"
            >
              {period}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-10">
                {options.map((o) => (
                  <button
                    key={o}
                    onClick={() => {
                      setPeriod(o);
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-5xl font-black mb-5">₹0</p>

        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-600">₹0 Products</div>
          <div className="text-sm text-gray-600">₹0 Merch</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-gray-400" />
        </div>

        <p className="font-bold text-lg mb-1">
          You don't have any earnings yet
        </p>

        <p className="text-gray-400 text-sm">
          Share your page with your audience to get started.
        </p>
      </div>
    </div>
  );
}