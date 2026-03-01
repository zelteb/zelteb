"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  Camera, ImagePlus, Loader2, Share2, X, Link as LinkIcon,
  Twitter, Facebook, Mail, Check, Pencil,
} from "lucide-react";

interface Profile {
  username: string;
  full_name?: string | null;
  cover_url?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  post_count?: number | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  x_url?: string | null;
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

function UploadHint({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono tracking-wide text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap select-none">
      {label}
    </span>
  );
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// ── Cover Photo ───────────────────────────────────────────────────────────────
function CoverPhoto({
  profile, isOwner, pending, inputRef, onChange,
}: {
  profile: Profile;
  isOwner: boolean;
  pending: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full h-56 md:h-72 bg-stone-300"
      onMouseEnter={() => isOwner && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 overflow-hidden">
        {profile.cover_url ? (
          <Image src={profile.cover_url} alt="Cover photo" fill className="object-cover" priority unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}
      </div>

      {isOwner && (
        <>
          <div
            className="absolute inset-0 transition-colors duration-200 pointer-events-none"
            style={{ backgroundColor: hovered ? "rgba(0,0,0,0.3)" : "transparent" }}
          />
          <div
            className="absolute bottom-3 right-3 z-10 flex items-center gap-2 transition-opacity duration-200"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <UploadHint label="16 : 5  ·  1600 × 500 px" />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              {pending ? "Uploading…" : "Change cover"}
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        </>
      )}
    </div>
  );
}

// ── Avatar Photo ──────────────────────────────────────────────────────────────
function AvatarPhoto({
  profile, isOwner, pending, inputRef, onChange,
}: {
  profile: Profile;
  isOwner: boolean;
  pending: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => isOwner && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden">
        {profile.avatar_url ? (
          <Image src={profile.avatar_url} alt={profile.username} width={144} height={144} className="object-cover w-full h-full" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-800">
            <span className="text-4xl font-bold text-amber-400 uppercase tracking-widest">
              {profile.username?.charAt(0) ?? "?"}
            </span>
          </div>
        )}
      </div>

      {isOwner && (
        <>
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center transition-colors duration-200"
            style={{ backgroundColor: hovered ? "rgba(0,0,0,0.42)" : "transparent" }}
          >
            <button
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              title="Upload profile photo"
              className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md disabled:opacity-60 cursor-pointer transition-opacity duration-200"
              style={{ opacity: hovered ? 1 : 0 }}
            >
              {pending ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            </button>
          </div>
          <div
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-200 whitespace-nowrap"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <UploadHint label="1 : 1  ·  400 × 400 px" />
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        </>
      )}
    </div>
  );
}

// ── Social Links Modal ────────────────────────────────────────────────────────
function SocialLinksModal({
  profile, onClose, onSave,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (links: { youtube_url: string; instagram_url: string; x_url: string }) => Promise<void>;
}) {
  const [youtube, setYoutube] = useState(profile.youtube_url ?? "");
  const [instagram, setInstagram] = useState(profile.instagram_url ?? "");
  const [x, setX] = useState(profile.x_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ youtube_url: youtube, instagram_url: instagram, x_url: x });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { label: "YouTube",     icon: <YoutubeIcon size={16} />,   color: "text-red-500",  value: youtube,   setValue: setYoutube,   placeholder: "https://youtube.com/@yourchannel" },
    { label: "Instagram",   icon: <InstagramIcon size={16} />, color: "text-pink-500", value: instagram, setValue: setInstagram, placeholder: "https://instagram.com/yourusername" },
    { label: "X / Twitter", icon: <XIcon size={16} />,         color: "text-gray-800", value: x,         setValue: setX,         placeholder: "https://x.com/yourusername" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Social Links</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          {fields.map(({ label, icon, color, value, setValue, placeholder }) => (
            <div key={label}>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                <span className={color}>{icon}</span>
                {label}
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
                <LinkIcon size={12} className="text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-300"
                />
                {value && (
                  <button onClick={() => setValue("")} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 text-sm bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? "Saving…" : "Save links"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Social Icons Row ──────────────────────────────────────────────────────────
function SocialIconsRow({
  profile, isOwner, onEditClick,
}: {
  profile: Profile;
  isOwner: boolean;
  onEditClick: () => void;
}) {
  const hasAnyLink = !!(profile.youtube_url || profile.instagram_url || profile.x_url);

  if (!isOwner && !hasAnyLink) return null;

  const icons = [
    { key: "youtube",   url: profile.youtube_url,   icon: <YoutubeIcon size={19} />,   label: "YouTube",   activeClass: "text-red-500  hover:bg-red-50  hover:border-red-100"  },
    { key: "instagram", url: profile.instagram_url, icon: <InstagramIcon size={19} />, label: "Instagram", activeClass: "text-pink-500 hover:bg-pink-50 hover:border-pink-100" },
    { key: "x",         url: profile.x_url,         icon: <XIcon size={19} />,         label: "X",         activeClass: "text-gray-800 hover:bg-gray-100 hover:border-gray-200" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      {icons.map(({ key, url, icon, label, activeClass }) => {
        if (url) {
          return (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={`Visit ${label}`}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-150 ${activeClass}`}>
              {icon}
            </a>
          );
        }
        if (isOwner) {
          return (
            <button key={key} onClick={onEditClick} title={`Add ${label} link`}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-dashed border-gray-200 bg-white text-gray-300 hover:border-amber-400 hover:text-amber-400 transition-all duration-150">
              {icon}
            </button>
          );
        }
        return null;
      })}
      {isOwner && hasAnyLink && (
        <button onClick={onEditClick} title="Edit social links"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-100 bg-white text-gray-400 shadow-sm hover:text-gray-700 hover:bg-gray-50 transition-all duration-150">
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shareLinks = [
    {
      label: "Twitter / X", icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check out ${profile.full_name ?? profile.username}!`,
      color: "hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200",
    },
    {
      label: "Facebook", icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    },
    {
      label: "Email", icon: Mail,
      href: `mailto:?subject=Check out ${profile.full_name ?? profile.username}&body=${encodeURIComponent(profileUrl)}`,
      color: "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Share this profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3 px-5 py-4 bg-stone-50 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-stone-800">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.username} width={40} height={40} className="object-cover w-full h-full" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm font-bold text-amber-400 uppercase">{profile.username?.charAt(0) ?? "?"}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{profile.full_name ?? profile.username}</p>
            <p className="text-xs text-gray-500">@{profile.username}</p>
          </div>
        </div>
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Page link</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate font-mono">
              {profileUrl}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                copied ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
              }`}
            >
              {copied ? <Check size={13} /> : <LinkIcon size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Share on</p>
          <div className="flex flex-col gap-2">
            {shareLinks.map(({ label, icon: Icon, href, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-700 transition-all ${color}`}>
                <Icon size={15} />{label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab({ profile }: { profile: Profile }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {profile.bio && (
        <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">{profile.bio}</p>
      )}
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
        <p className="text-gray-400 text-sm">No products yet.</p>
      </div>
    </div>
  );
}

// ── About Tab ─────────────────────────────────────────────────────────────────
function AboutTab({
  profile, isOwner, onSave,
}: {
  profile: Profile;
  isOwner: boolean;
  onSave: (bio: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setBio(profile.bio ?? "");
  }, [profile.bio, editing]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(bio);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">About</h3>
          {isOwner && !editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <Pencil size={13} /> Edit
            </button>
          )}
          {isOwner && editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setBio(profile.bio ?? ""); setEditing(false); }}
                className="text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-60">
                {saving && <Loader2 size={12} className="animate-spin" />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Bio</p>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              placeholder="Write something about yourself…"
              className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-300"
            />
          ) : bio ? (
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{bio}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {isOwner ? "No bio yet. Click Edit to add one." : "No bio added yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserProfileClient({
  profile: initialProfile,
  isOwner,
}: {
  profile: Profile;
  isOwner: boolean;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [coverPending, setCoverPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "about">("products");
  const [showShare, setShowShare] = useState(false);
  const [showSocialEdit, setShowSocialEdit] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Real-time sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`profile:${profile.username}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles",
        filter: `username=eq.${profile.username}`,
      }, (payload) => {
        const updated = payload.new as Profile;
        setProfile((p) => ({
          ...p,
          avatar_url:    updated.avatar_url    ?? p.avatar_url,
          cover_url:     updated.cover_url     ?? p.cover_url,
          full_name:     updated.full_name     ?? p.full_name,
          bio:           updated.bio           ?? p.bio,
          youtube_url:   updated.youtube_url   !== undefined ? updated.youtube_url   : p.youtube_url,
          instagram_url: updated.instagram_url !== undefined ? updated.instagram_url : p.instagram_url,
          x_url:         updated.x_url         !== undefined ? updated.x_url         : p.x_url,
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile.username]);

  // ── Cover upload ───────────────────────────────────────────────────────────
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isOwner) return;
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
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

  // ── Avatar upload ──────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isOwner) return;
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
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

  // ── About save ─────────────────────────────────────────────────────────────
  async function handleAboutSave(bio: string) {
    await supabase.from("profiles").update({ bio }).eq("username", profile.username);
    setProfile((p) => ({ ...p, bio }));
  }

  // ── Social links save ──────────────────────────────────────────────────────
  async function handleSocialSave(links: { youtube_url: string; instagram_url: string; x_url: string }) {
    const payload = {
      youtube_url:   links.youtube_url   || null,
      instagram_url: links.instagram_url || null,
      x_url:         links.x_url         || null,
    };
    await supabase.from("profiles").update(payload).eq("username", profile.username);
    setProfile((p) => ({ ...p, ...payload }));
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0]">

      {showShare && <ShareModal profile={profile} onClose={() => setShowShare(false)} />}
      {showSocialEdit && isOwner && (
        <SocialLinksModal
          profile={profile}
          onClose={() => setShowSocialEdit(false)}
          onSave={handleSocialSave}
        />
      )}

      {/* Cover */}
      <CoverPhoto
        profile={profile}
        isOwner={isOwner}
        pending={coverPending}
        inputRef={coverInputRef}
        onChange={handleCoverChange}
      />

      {/* Profile header */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-end justify-between -mt-16 md:-mt-20 relative z-10">
          <div className="w-10" />

          <AvatarPhoto
            profile={profile}
            isOwner={isOwner}
            pending={avatarPending}
            inputRef={avatarInputRef}
            onChange={handleAvatarChange}
          />

          <div className="mb-1">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-2 rounded-full shadow-md border border-gray-200 transition-colors"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
            ⚠️ {error}
          </p>
        )}

        {/* Name + social icons */}
        <div className="mt-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>
          <SocialIconsRow
            profile={profile}
            isOwner={isOwner}
            onEditClick={() => setShowSocialEdit(true)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-200">
          {(["products", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "text-amber-700" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "products" ? (
        <ProductsTab profile={profile} />
      ) : (
        <AboutTab profile={profile} isOwner={isOwner} onSave={handleAboutSave} />
      )}
    </div>
  );
}