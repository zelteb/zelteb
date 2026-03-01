"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [period, setPeriod] = useState("Last 30 days");
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const options = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"];

  // ✅ Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.push("/");
        return;
      }

      setUserId(authData.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", authData.user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  // ✅ Realtime profile update
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
          if (payload.new?.username !== undefined) {
            setUsername(payload.new.username);
          }

          if (payload.new?.avatar_url !== undefined) {
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe();

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
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-xl font-bold">
                {username?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Hi, {username || "there"}
            </h1>
            <p className="text-gray-400 text-sm">
              zelteb.com/{username || "username"}
            </p>
          </div>
        </div>

        <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-900 transition">
          Share page
        </button>
      </div>

      {/* Earnings */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Earnings</h2>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="border rounded-full px-4 py-1.5 text-sm font-medium text-gray-700"
            >
              {period}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-10">
                {options.map((o) => (
                  <button
                    key={o}
                    onClick={() => {
                      setPeriod(o);
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-5xl font-black mb-6">₹0</p>

        <div className="flex gap-6 text-sm text-gray-600">
          <div>₹0 Products</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-gray-400" />
        </div>

        <p className="font-bold text-lg mb-2">
          You don't have any earnings yet
        </p>

        <p className="text-gray-400 text-sm">
          Share your page with your audience to get started.
        </p>
      </div>
    </div>
  );
}