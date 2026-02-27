"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 🔹 Load profile
  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push("/");
        return;
      }

      setUser(auth.user);

      // Ensure profile exists
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (!profile) {
        // Create empty profile row
        await supabase.from("profiles").insert({
          id: auth.user.id,
          username: "",
          bio: "",
        });
      } else {
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  // 🔹 Clean preview memory
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      let finalAvatarUrl = avatarUrl;

      // 🔹 Check username uniqueness
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.trim().toLowerCase())
        .neq("id", user.id)
        .maybeSingle();

      if (existing) {
        alert("Username already taken");
        setSaving(false);
        return;
      }

      // 🔹 Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${user.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        finalAvatarUrl = data.publicUrl + `?t=${Date.now()}`;
      }

      // 🔹 Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim().toLowerCase(),
          bio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 text-gray-500">Loading...</div>;
  }

  const currentAvatar = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-[#f9f9f8] p-10">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-3xl">
        <h2 className="text-xl font-bold mb-6">Profile information</h2>

        {/* Avatar */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {username?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
            >
              ✏️
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="your-username"
          />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            placeholder="Tell people about yourself..."
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Email
          </label>
          <input
            value={user?.email || ""}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-500"
          />
        </div>
      </div>

      {/* Save */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-black text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-900 transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {saved && (
          <span className="text-green-600 font-medium">
            ✓ Saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}