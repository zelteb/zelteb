"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { Camera, ImagePlus } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  username: string;
  full_name?: string;
  cover_url?: string;
  avatar_url?: string;
}

// ─── Upload helpers ───────────────────────────────────────────────────────────

async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UploadHint({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono tracking-wide text-white/70 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserPage({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isPending, startTransition] = useTransition();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Cover upload ──────────────────────────────────────────────────────────

  function handleCoverClick() {
    coverInputRef.current?.click();
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const url = await uploadImage(
        file,
        "covers",
        `${profile.username}/cover.${file.name.split(".").pop()}`
      );

      await supabase
        .from("profiles")
        .update({ cover_url: url })
        .eq("username", profile.username);

      setProfile((p) => ({ ...p, cover_url: url }));
    });
  }

  // ── Avatar upload ─────────────────────────────────────────────────────────

  function handleAvatarClick() {
    avatarInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const url = await uploadImage(
        file,
        "avatars",
        `${profile.username}/avatar.${file.name.split(".").pop()}`
      );

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("username", profile.username);

      setProfile((p) => ({ ...p, avatar_url: url }));
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-serif">

      {/* ── Cover photo ──────────────────────────────────────────────────── */}
      <div className="relative w-full h-56 md:h-72 bg-stone-300 overflow-hidden group">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

        {/* Upload button + hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <UploadHint label="16 : 5  •  1600 × 500 px" />
          <button
            onClick={handleCoverClick}
            disabled={isPending}
            title="Upload cover photo"
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
          >
            <ImagePlus size={14} />
            {isPending ? "Uploading…" : "Change cover"}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* ── Profile section ───────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-center -mt-16 md:-mt-20 relative z-10">

          {/* Avatar wrapper */}
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-800">
                  <span className="text-4xl font-bold text-amber-400 uppercase tracking-widest">
                    {profile.username?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-2xl flex items-center justify-center">
                <button
                  onClick={handleAvatarClick}
                  disabled={isPending}
                  title="Upload profile photo"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md disabled:opacity-50"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>

            {/* Size hint below avatar */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <UploadHint label="1 : 1  •  400 × 400 px" />
            </div>

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>
        </div>
      </div>
    </div>
  );
}