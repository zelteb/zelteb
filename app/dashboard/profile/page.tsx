"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, ImagePlus } from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", auth.user.id).single();

      if (!profile) {
        await supabase.from("profiles").insert({ id: auth.user.id });
      } else {
        setUsername(profile.username || "");
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
        setCoverUrl(profile.cover_url || null);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim()) { setUsernameError(""); return; }
      const clean = username.trim().toLowerCase();
      const { data } = await supabase
        .from("profiles").select("id").eq("username", clean)
        .neq("id", user?.id).maybeSingle();
      setUsernameError(data ? "This username is already taken" : "");
    };
    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout);
  }, [username, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      setAvatarUrl(url);
      setAvatarPreview(null);
    } catch (err: any) {
      alert("Avatar upload failed: " + err.message);
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCoverUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/cover.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("covers").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ cover_url: url }).eq("id", user.id);
      setCoverUrl(url);
    } catch (err: any) {
      alert("Cover upload failed: " + err.message);
    } finally {
      setCoverUploading(false);
    }
  };

  const save = async () => {
    if (!username.trim()) { setUsernameError("Username is required"); return; }
    if (usernameError) return;
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.from("profiles").update({
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        bio,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      if (error) {
        if (error.code === "23505" || error.message.includes("profiles_username_key")) {
          setUsernameError("This username is already taken");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  const inputClass =
    "w-full border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow";

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      {/* Extra bottom padding so save button clears mobile nav bars */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-4 pb-24 sm:pb-12">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>

        {/* ── Cover Photo ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div
            className="relative w-full bg-gray-200 group cursor-pointer"
            style={{ height: "clamp(120px, 25vw, 176px)" }}
            onClick={() => coverInputRef.current?.click()}
          >
            {coverUrl ? (
              <Image src={coverUrl} alt="Cover" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <ImagePlus size={26} className="text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 active:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2">
              {coverUploading ? (
                <Loader2 size={22} className="text-white animate-spin" />
              ) : (
                <>
                  <ImagePlus size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    1600 × 500 px recommended
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
            <p className="text-xs text-gray-400">Cover Photo · 16:5 ratio</p>
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="text-xs font-medium text-gray-600 hover:text-black underline underline-offset-2 disabled:opacity-50 py-1 px-1"
            >
              {coverUploading ? "Uploading…" : "Change"}
            </button>
          </div>

          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {/* ── Profile Photo ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Profile Photo</p>

          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              {/* Slightly larger avatar tap area on mobile */}
              <div className="w-20 h-20 sm:w-20 sm:h-20 rounded-2xl bg-gray-200 overflow-hidden border border-gray-200">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar} alt="Avatar"
                    width={80} height={80}
                    className="object-cover w-full h-full" unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-2xl font-bold text-amber-400 uppercase">
                      {username?.charAt(0) || fullName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/40 active:bg-black/50 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {avatarUploading
                  ? <Loader2 size={18} className="text-white animate-spin" />
                  : <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                }
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">
                {avatarUploading ? "Uploading..." : "Profile picture"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Square image, at least 400 × 400 px</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="mt-2 text-xs font-medium text-gray-600 hover:text-black underline underline-offset-2 disabled:opacity-50 py-1"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {avatarUploading ? "Please wait…" : "Change photo"}
              </button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* ── Form fields ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
          <p className="text-sm font-bold text-gray-900">Account Details</p>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Eg: Basil Biju"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This is the name shown on your public profile page.
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`w-full border rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                usernameError ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-black"
              }`}
            />
            {usernameError && (
              <p className="text-red-500 text-xs mt-1.5">{usernameError}</p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              Your public URL: zelteb.com/{username || "username"}
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience about yourself..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* ── Save feedback ── */}
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved successfully
          </div>
        )}

        {/* ── Save button ── */}
        <button
          onClick={save}
          disabled={saving || !!usernameError}
          className="w-full sm:w-auto sm:px-10 bg-black text-white py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-gray-900 active:scale-95 transition-all"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>

      </div>
    </div>
  );
}