"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";

interface Profile {
  username: string;
  full_name?: string | null;
  cover_url?: string | null;
  avatar_url?: string | null;
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Bust cache so new image shows immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}

function UploadHint({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono tracking-wide text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap select-none">
      {label}
    </span>
  );
}

export default function UserProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [coverPending, setCoverPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Cover ──────────────────────────────────────────────────────────────────

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-picked

    setError(null);
    setCoverPending(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadImage(file, "covers", `${profile.username}/cover.${ext}`);
      await supabase.from("profiles").update({ cover_url: url }).eq("username", profile.username);
      setProfile((p) => ({ ...p, cover_url: url }));
    } catch (err: any) {
      setError(err?.message ?? "Cover upload failed");
    } finally {
      setCoverPending(false);
    }
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-picked

    setError(null);
    setAvatarPending(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadImage(file, "avatars", `${profile.username}/avatar.${ext}`);
      await supabase.from("profiles").update({ avatar_url: url }).eq("username", profile.username);
      setProfile((p) => ({ ...p, avatar_url: url }));
    } catch (err: any) {
      setError(err?.message ?? "Avatar upload failed");
    } finally {
      setAvatarPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-serif">

      {/* ── Cover photo ─────────────────────────────────────────────────── */}
      {/* NOTE: NO overflow-hidden here — moved it to inner div so button clicks aren't clipped */}
      <div className="relative w-full h-56 md:h-72 bg-stone-300 group">

        {/* Image layer (overflow-hidden only on this inner div) */}
        <div className="absolute inset-0 overflow-hidden">
          {profile.cover_url ? (
            <Image
              src={profile.cover_url}
              alt="Cover photo"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}
        </div>

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 pointer-events-none" />

        {/* Upload button + ratio hint — z-10 ensures it's above everything */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <UploadHint label="16 : 5  ·  1600 × 500 px" />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={coverPending}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md transition-colors disabled:opacity-60 cursor-pointer"
          >
            {coverPending ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            {coverPending ? "Uploading…" : "Change cover"}
          </button>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* ── Profile section ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-center -mt-16 md:-mt-20 relative z-10">

          {/* Avatar + upload */}
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-800">
                  <span className="text-4xl font-bold text-amber-400 uppercase tracking-widest">
                    {profile.username?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Camera overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-2xl flex items-center justify-center">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md disabled:opacity-60 cursor-pointer"
                title="Upload profile photo"
              >
                {avatarPending
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Camera size={18} />
                }
              </button>
            </div>

            {/* Ratio hint */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <UploadHint label="1 : 1  ·  400 × 400 px" />
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-4 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>
        </div>
      </div>
    </div>
  );
}