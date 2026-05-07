"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  UserCircle,
  Send,
  SlidersHorizontal,
  X,
} from "lucide-react";

// ─── Category filters ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "all",           label: "All" },
  { value: "travel",        label: "✈️  Travel" },
  { value: "food",          label: "🍜  Food" },
  { value: "entertainment", label: "🎬  Entertainment" },
  { value: "fashion",       label: "👗  Fashion" },
  { value: "beauty",        label: "💄  Beauty" },
  { value: "fitness",       label: "💪  Fitness" },
  { value: "gaming",        label: "🎮  Gaming" },
  { value: "tech",          label: "💻  Tech" },
  { value: "education",     label: "📚  Education / Skills" },
  { value: "finance",       label: "📈  Finance" },
  { value: "other",         label: "🌟  Other" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Creator {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  influencer_type: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryLabel(value: string | null): string {
  if (!value) return "Creator";
  const found = CATEGORIES.find((c) => c.value === value);
  return found && found.value !== "all" ? found.label : "Creator";
}

function getInitial(creator: Creator): string {
  return (
    creator.username?.charAt(0) ||
    creator.full_name?.charAt(0) ||
    "?"
  ).toUpperCase();
}

// ─── Creator Card ─────────────────────────────────────────────────────────────
function CreatorCard({
  creator,
  onConnect,
}: {
  creator: Creator;
  onConnect: (creator: Creator) => void;
}) {
  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      {/* Avatar + badge */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 border border-gray-200">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creator.username || "Creator"}
                width={56}
                height={56}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xl font-bold text-amber-400">
                  {getInitial(creator)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {creator.full_name || creator.username || "Creator"}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            @{creator.username || "—"}
          </p>
          {creator.influencer_type && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-lg">
              {getCategoryLabel(creator.influencer_type)}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {creator.bio ? (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {creator.bio}
        </p>
      ) : (
        <p className="text-xs text-gray-300 italic">No bio yet</p>
      )}

      {/* Connect button */}
      <button
        onClick={() => onConnect(creator)}
        className="mt-auto w-full flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all duration-150"
      >
        <Send size={13} />
        Connect
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <UserCircle size={28} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-700">No creators found</p>
      <p className="text-xs text-gray-400 mt-1">
        {query
          ? `No results for "${query}"`
          : "No creators in this category yet"}
      </p>
    </div>
  );
}

// ─── Connect Modal ────────────────────────────────────────────────────────────
function ConnectModal({
  creator,
  onClose,
}: {
  creator: Creator;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    // TODO: wire up to your requests/messages table
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setSending(false);
    setTimeout(onClose, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold text-gray-900">
              Connect with{" "}
              {creator.full_name || creator.username || "this creator"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              @{creator.username}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={14} className="text-gray-600" />
          </button>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl text-center">
            Request sent! 🎉
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and your campaign idea..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Send size={13} /> Send Request
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FindCreators() {
  const router = useRouter();

  const [creators, setCreators]           = useState<Creator[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [connectTarget, setConnectTarget] = useState<Creator | null>(null);

  // Auth check + fetch all creators
  useEffect(() => {
    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio, influencer_type")
        .neq("id", auth.user.id)          // exclude self
        .not("username", "is", null);      // only profiles with usernames

      setCreators((data as Creator[]) || []);
      setLoading(false);
    };
    init();
  }, [router]);

  // Client-side filter
  const filtered = useMemo(() => {
    let list = creators;

    if (activeCategory !== "all") {
      list = list.filter((c) => c.influencer_type === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.username?.toLowerCase().includes(q) ||
          c.full_name?.toLowerCase().includes(q) ||
          c.bio?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [creators, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Page header ── */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Brand Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Find Creators
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and connect with influencers that match your brand.
          </p>
        </div>

        {/* ── Search bar ── */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or bio..."
            className="w-full sm:max-w-sm border border-gray-200 bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-[calc(100%-2rem)] sm:left-[calc(24rem-2.5rem)] top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-gray-400 hover:text-gray-700" />
            </button>
          )}
        </div>

        {/* ── Category filter bar ── */}
        <div className="relative mb-7">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  activeCategory === cat.value
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* fade on right edge */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#f9f9f8] to-transparent" />
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} creator{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              filtered.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onConnect={setConnectTarget}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Connect modal ── */}
      {connectTarget && (
        <ConnectModal
          creator={connectTarget}
          onClose={() => setConnectTarget(null)}
        />
      )}
    </div>
  );
}