"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

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
  const [avatarUploading, setAvatarUploading] = useState(false);

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
        await supabase.from("profiles").insert({ id: auth.user.id });
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

      setUsernameError(data ? "the username is taken" : "");
    };

    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout);
  }, [username, user]);

  // ── Avatar: pick file → instant preview, then upload immediately ──────────

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-picked

    // Show local preview instantly
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarFile(file);

    // Upload right away
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      // Save to DB immediately so UserProfileClient reflects the change
      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);

      setAvatarUrl(url);
      setAvatarPreview(null); // use the real URL now
    } catch (err: any) {
      alert("Avatar upload failed: " + err.message);
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Save the rest of the form ─────────────────────────────────────────────

  const save = async () => {
    if (!username.trim()) {
      setUsernameError("username is required");
      return;
    }
    if (usernameError) return;

    setSaving(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim(),
          bio,
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

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-[#f9f9f8] p-10">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-3xl">

        {/* ── Avatar upload ──────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-5">
          <div className="relative group shrink-0">
            {/* Avatar preview */}
            <div className="w-20 h-20 rounded-2xl bg-stone-800 overflow-hidden border border-gray-200 shadow-sm">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Profile photo"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-400 uppercase">
                    {username?.charAt(0) || fullName?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group cursor-pointer disabled:cursor-not-allowed"
              title="Change profile photo"
            >
              {avatarUploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>

          {/* Text + hint */}
          <div>
            <p className="font-semibold text-sm text-gray-800">Profile photo</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Recommended: square image, at least 400 × 400 px
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="mt-2 text-xs font-medium text-gray-600 hover:text-black underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              {avatarUploading ? "Uploading…" : "Change photo"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Full Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Full Name</label>
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
          <label className="block text-sm font-semibold mb-2">Username</label>
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