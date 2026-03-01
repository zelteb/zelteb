"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  Camera, ImagePlus, Loader2, Share2, X, Link as LinkIcon,
  Twitter, Facebook, Mail, Check, Pencil, Plus, Trash2, ExternalLink,
} from "lucide-react";

interface ProfileLink {
  label: string;
  url: string;
}

interface Profile {
  username: string;
  full_name?: string | null;
  cover_url?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  about_links?: ProfileLink[] | null;
  post_count?: number | null;
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

function ensureHttp(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function UploadHint({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono tracking-wide text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap select-none">
      {label}
    </span>
  );
}

// ── Share Modal ──────────────────────────────────────────────────────────────
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
      label: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check out ${profile.full_name ?? profile.username}!`,
      color: "hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    },
    {
      label: "Email",
      icon: Mail,
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

// ── Become a Member Banner ───────────────────────────────────────────────────
function BecomeMemberSection({ profile }: { profile: Profile }) {
  return (
    <div className="max-w-2xl mx-auto px-4 mt-6">
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-white font-bold text-base">Support {profile.full_name ?? profile.username}</h3>
            <p className="text-stone-400 text-sm mt-0.5">Become a member to get exclusive access and support their work.</p>
          </div>
          <button className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-md">
            Become a member
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({ profile }: { profile: Profile }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {profile.bio && (
        <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">{profile.bio}</p>
      )}
      <div className="grid gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-600 font-bold text-sm">{profile.post_count ?? 0}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Posts</p>
            <p className="text-xs text-gray-500">Total posts published</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">Posts will appear here.</p>
        </div>
      </div>
    </div>
  );
}

// ── About Tab ─────────────────────────────────────────────────────────────────
function AboutTab({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (bio: string, links: ProfileLink[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [links, setLinks] = useState<ProfileLink[]>(profile.about_links ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setBio(profile.bio ?? "");
      setLinks(profile.about_links ?? []);
    }
  }, [profile.bio, profile.about_links, editing]);

  function addLink() {
    setLinks((l) => [...l, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setLinks((l) => l.filter((_, idx) => idx !== i));
  }

  function updateLink(i: number, field: "label" | "url", value: string) {
    setLinks((l) => l.map((lnk, idx) => (idx === i ? { ...lnk, [field]: value } : lnk)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(bio, links.filter((l) => l.url.trim()));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setBio(profile.bio ?? "");
    setLinks(profile.about_links ?? []);
    setEditing(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">About</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={13} />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Bio */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Bio</p>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Write something about yourself…"
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-300"
              />
            ) : bio ? (
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{bio}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No bio yet. Click Edit to add one.</p>
            )}
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Links</p>

            {editing ? (
              <div className="space-y-2">
                {links.map((lnk, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={lnk.label}
                      onChange={(e) => updateLink(i, "label", e.target.value)}
                      placeholder="Label  e.g. Instagram"
                      className="w-1/3 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-300"
                    />
                    <input
                      value={lnk.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="instagram.com/username"
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-300"
                    />
                    <button
                      onClick={() => removeLink(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLink}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 mt-1 font-medium"
                >
                  <Plus size={13} />
                  Add link
                </button>
              </div>
            ) : links.length > 0 ? (
              <div className="flex flex-col gap-2">
                {links.map((lnk, i) => (
                  <a
                    key={i}
                    href={ensureHttp(lnk.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 hover:underline w-fit"
                  >
                    <ExternalLink size={13} />
                    {lnk.label || lnk.url}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No links yet. Click Edit to add some.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function UserProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [coverPending, setCoverPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "about">("home");
  const [showShare, setShowShare] = useState(false);

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
          avatar_url: updated.avatar_url ?? p.avatar_url,
          cover_url: updated.cover_url ?? p.cover_url,
          full_name: updated.full_name ?? p.full_name,
          bio: updated.bio ?? p.bio,
          about_links: updated.about_links ?? p.about_links,
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile.username]);

  // ── Cover upload ───────────────────────────────────────────────────────────
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  // ── About save ────────────────────────────────────────────────────────────
  async function handleAboutSave(bio: string, links: ProfileLink[]) {
    await supabase
      .from("profiles")
      .update({ bio, about_links: links })
      .eq("username", profile.username);
    setProfile((p) => ({ ...p, bio, about_links: links }));
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0]">

      {showShare && <ShareModal profile={profile} onClose={() => setShowShare(false)} />}

      {/* ── Cover photo ───────────────────────────────────────────────────── */}
      <div className="relative w-full h-56 md:h-72 bg-stone-300 group">
        <div className="absolute inset-0 overflow-hidden">
          {profile.cover_url ? (
            <Image src={profile.cover_url} alt="Cover photo" fill className="object-cover" priority unoptimized />
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 pointer-events-none" />
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
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* ── Profile section ───────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-end justify-between -mt-16 md:-mt-20 relative z-10">
          <div className="w-10" />

          {/* Avatar */}
          <div className="relative group">
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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-2xl flex items-center justify-center">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md disabled:opacity-60 cursor-pointer"
                title="Upload profile photo"
              >
                {avatarPending ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>
            </div>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <UploadHint label="1 : 1  ·  400 × 400 px" />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Share button */}
          <div className="mb-1">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-2 rounded-full shadow-md border border-gray-200 transition-colors"
            >
              <Share2 size={13} />
              Share
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>
          {profile.post_count != null && (
            <p className="text-sm text-gray-500 mt-1">{profile.post_count} Posts</p>
          )}
        </div>
      </div>

      {/* ── Become a member ───────────────────────────────────────────────── */}
      <BecomeMemberSection profile={profile} />

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-200">
          {(["home", "about"] as const).map((tab) => (
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

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      {activeTab === "home" ? (
        <HomeTab profile={profile} />
      ) : (
        <AboutTab profile={profile} onSave={handleAboutSave} />
      )}
    </div>
  );
}