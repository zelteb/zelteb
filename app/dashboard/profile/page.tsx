"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [usernameError, setUsernameError] = useState("");

  // Load profile
  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push("/");
        return;
      }

      setUser(auth.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: auth.user.id,
        });
      } else {
        setUsername(profile.username || "");
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  // Live username check
  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim()) {
        setUsernameError("");
        return;
      }

      const clean = username.trim().toLowerCase();

      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", user?.id)
        .maybeSingle();

      if (data) {
        setUsernameError("the username is taken");
      } else {
        setUsernameError("");
      }
    };

    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout);
  }, [username, user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!username.trim()) {
      setUsernameError("username is required");
      return;
    }

    if (usernameError) return;

    setSaving(true);
    setSaved(false);

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${user.id}.${ext}`;

        await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        finalAvatarUrl = data.publicUrl + `?t=${Date.now()}`;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim(),
          bio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        if (error.code === "23505" || error.message.includes("profiles_username_key")) {
          setUsernameError("the username is taken");
          setSaving(false);
          return;
        }
        throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }

    setSaving(false);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f9f9f8] p-10">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-3xl">

        {/* Full Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Basil Biju"
          />
          <p className="text-gray-400 text-xs mt-1">
            This is the name shown on your public profile page.
          </p>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none ${
              usernameError
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "focus:ring-2 focus:ring-gray-200"
            }`}
            placeholder="your-username"
          />
          {usernameError && (
            <p className="text-red-500 text-sm mt-2">{usernameError}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            Your public URL: yoursite.com/{username || "username"}
          </p>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 h-32 resize-none"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <button
          onClick={save}
          disabled={saving || !!usernameError}
          className="bg-black text-white px-8 py-3 rounded-xl disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {saved && (
          <p className="text-green-600 mt-4">✓ Saved successfully</p>
        )}
      </div>
    </div>
  );
}