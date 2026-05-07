"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Loader2,
  ImagePlus,
  Building2,
  ShieldCheck,
} from "lucide-react";

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "edit-profile",     label: "Edit profile",        icon: Building2,   route: null },
  { key: "account-security", label: "Verify social media", icon: ShieldCheck, route: "/dashboard/brand/verify-social" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

// ─── Business types ───────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  { value: "d2c",            label: "🛍️  D2C Brands" },
  { value: "ecommerce",      label: "🛒  E-commerce Brands" },
  { value: "local",          label: "📍  Local Businesses" },
  { value: "startup",        label: "🚀  Startups" },
  { value: "edtech",         label: "🎓  EdTech Companies" },
  { value: "personal",       label: "👤  Personal Brands" },
  { value: "events",         label: "🎪  Event Companies" },
  { value: "hospitality",    label: "🏨  Hospitality Brands" },
  { value: "travel",         label: "✈️  Travel Agencies" },
  { value: "saas",           label: "💻  SaaS Companies" },
  { value: "fintech",        label: "💳  Fintech Companies" },
  { value: "health",         label: "💪  Health & Fitness Brands" },
  { value: "food",           label: "🍔  Food & Beverage Brands" },
  { value: "realestate",     label: "🏠  Real Estate Brands" },
  { value: "automobile",     label: "🚗  Automobile Brands" },
  { value: "gaming",         label: "🎮  Gaming Companies" },
  { value: "media",          label: "🎬  Media & Entertainment Brands" },
  { value: "ngo",            label: "🤝  NGOs / Non-profits" },
  { value: "luxury",         label: "💎  Luxury Brands" },
  { value: "affiliate",      label: "🔗  Affiliate / Marketplace Brands" },
] as const;

type BusinessType = (typeof BUSINESS_TYPES)[number]["value"] | "";

// ─── Shared input style ───────────────────────────────────────────────────────
const inputClass =
  "w-full border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow";

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BrandProfile() {
  const router = useRouter();
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [activeNav, setActiveNav] = useState<NavKey>("edit-profile");

  const [user, setUser]                     = useState<any>(null);
  const [brandName, setBrandName]           = useState("");
  const [businessType, setBusinessType]     = useState<BusinessType>("");
  const [bio, setBio]                       = useState("");
  const [avatarUrl, setAvatarUrl]           = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl]             = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [brandNameError, setBrandNameError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", auth.user.id).single();

      if (!profile) {
        await supabase.from("profiles").insert({ id: auth.user.id, account_type: "brand" });
      } else {
        setBrandName(profile.brand_name || "");
        setBio(profile.bio || "");
        setBusinessType((profile.business_type as BusinessType) || "");
        setAvatarUrl(profile.avatar_url || null);
        setCoverUrl(profile.cover_url || null);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAvatarPreview(URL.createObjectURL(file));
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
      alert("Logo upload failed: " + err.message);
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
    if (!brandName.trim()) { setBrandNameError("Brand name is required"); return; }
    if (!businessType) { alert("Please select your business type"); return; }
    setBrandNameError("");
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        brand_name:    brandName.trim(),
        bio,
        business_type: businessType,
        account_type:  "brand",
        updated_at:    new Date().toISOString(),
      }).eq("id", user.id);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
    setSaving(false);
  };

  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    if (item.route) router.push(item.route);
    else setActiveNav(item.key);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex gap-6 items-start">

          {/* ── Left sidebar nav ── */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border border-gray-200 rounded-2xl p-2 sticky top-8">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = !item.route && activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-gray-900" : "text-gray-400"} />
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* ── Mobile top nav ── */}
          <div className="md:hidden w-full mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = !item.route && activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={13} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* ── Right content panel ── */}
          <div className="flex-1 min-w-0 space-y-4 pb-24 sm:pb-12">

            {/* Cover Photo */}
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
                <button onClick={() => coverInputRef.current?.click()} className="text-xs font-medium text-gray-600 hover:text-black underline">Change</button>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </div>

            {/* Brand Logo */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-sm font-bold text-gray-900 mb-1">Brand Logo</p>
              <p className="text-xs text-gray-400 mb-4">This will appear on your public profile and campaign listings.</p>
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                    {displayAvatar ? (
                      <Image src={displayAvatar} alt="Logo" width={80} height={80} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <Building2 size={28} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/40 flex items-center justify-center">
                    {avatarUploading
                      ? <Loader2 size={18} className="text-white animate-spin" />
                      : <Camera size={18} className="text-white opacity-0 group-hover:opacity-100" />}
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Company logo</p>
                  <p className="text-xs text-gray-400 mt-0.5">Square image, 400 × 400 px · PNG or SVG preferred</p>
                  <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs font-medium text-gray-600 underline">Upload logo</button>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Brand Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
              <p className="text-sm font-bold text-gray-900">Brand Details</p>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Brand Name</label>
                <input
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    if (e.target.value.trim()) setBrandNameError("");
                  }}
                  placeholder="Eg: Zelteb Technologies Pvt. Ltd."
                  className={`${inputClass} ${brandNameError ? "border-red-400 focus:ring-red-200" : ""}`}
                />
                {brandNameError && <p className="text-red-500 text-xs mt-1.5">{brandNameError}</p>}
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of business are you?
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setBusinessType(
                          businessType === type.value ? "" : type.value
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                        businessType === type.value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {businessType && (
                  <p className="text-xs text-gray-400 mt-2">Click again to deselect</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Brand Description
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell influencers what your brand is about..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:ring-2 focus:ring-black outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
                Brand profile saved successfully
              </div>
            )}

            <button
              onClick={save}
              disabled={saving}
              className="w-full sm:w-auto sm:px-10 bg-black text-white py-3.5 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save brand profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}