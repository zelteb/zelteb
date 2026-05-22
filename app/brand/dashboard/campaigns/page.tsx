"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | "active" | "pending" | "ended";

interface Campaign {
  id: number;
  name: string;
  budget: string;
  status: TabKey;
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All Campaigns", icon: null },
  {
    key: "active",
    label: "Active",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
  },
  {
    key: "pending",
    label: "Pending Budget",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path
          d="M12 6v6l4 2"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "ended",
    label: "Ended",
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
      </svg>
    ),
  },
];

const CATEGORIES = [
  { em: "✈️", label: "Travel" },
  { em: "🍜", label: "Food" },
  { em: "🎬", label: "Entertainment" },
  { em: "👗", label: "Fashion" },
  { em: "💄", label: "Beauty" },
  { em: "💪", label: "Fitness" },
  { em: "🎮", label: "Gaming" },
  { em: "💻", label: "Tech" },
  { em: "📚", label: "Education / Skills" },
  { em: "📊", label: "Finance" },
  { em: "✨", label: "Other" },
];

const PLATFORMS = [
  { label: "Instagram" },
  { label: "TikTok" },
  { label: "YouTube" },
  { label: "Twitter / X" },
  { label: "Facebook" },
];

const FOLLOWER_OPTIONS = [
  "No minimum",
  "1,000+",
  "5,000+",
  "10,000+",
  "50,000+",
  "100,000+",
];

// ─── New Campaign Modal ───────────────────────────────────────────────────────

interface ModalFormData {
  name: string;
  description: string;
  type: string;
  category: string;
  thumbnail: File | null;
  platforms: string[];
  totalBudget: string;
  perCreator: string;
  startDate: string;
  endDate: string;
  requirements: string;
  minFollowers: string;
  applicationDeadline: string;
}

function NewCampaignModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const [form, setForm] = useState<ModalFormData>({
    name: "",
    description: "",
    type: "UGC",
    category: "Travel",
    thumbnail: null,
    platforms: ["Instagram"],
    totalBudget: "",
    perCreator: "",
    startDate: "",
    endDate: "",
    requirements: "",
    minFollowers: "No minimum",
    applicationDeadline: "",
  });

  const set = (key: keyof ModalFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const togglePlatform = (label: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(label)
        ? prev.platforms.filter((p) => p !== label)
        : [...prev.platforms, label],
    }));
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else {
      // TODO: submit form to your API
      console.log("Campaign form submitted:", form);
      onClose();
    }
  };

  const stepTitles = [
    "New content rewards campaign",
    "Platforms & budget",
    "Requirements & review",
  ];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">
              {stepTitles[step - 1]}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Step progress bar */}
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? "bg-orange-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 mb-4">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 max-h-[65vh] overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Campaign name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Summer Collection Launch"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Tell creators what this campaign is about..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>

              {/* Type + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Type <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                  >
                    <option>UGC</option>
                    <option>Clipping</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Category <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category pills (visual display of selection) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Or pick a category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.label}
                      onClick={() => set("category", c.label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        form.category === c.label
                          ? "bg-orange-50 border-orange-400 text-orange-700"
                          : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      <span>{c.em}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Campaign thumbnail <span className="text-orange-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-7 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-xs text-gray-400">
                    {form.thumbnail ? form.thumbnail.name : "Upload or drag & drop — PNG or JPEG only"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => set("thumbnail", e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {/* Platforms */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Platforms <span className="text-orange-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => togglePlatform(p.label)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        form.platforms.includes(p.label)
                          ? "bg-orange-50 border-orange-400 text-orange-700"
                          : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Total budget <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.totalBudget}
                    onChange={(e) => set("totalBudget", e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Per-creator payout <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.perCreator}
                    onChange={(e) => set("perCreator", e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Start date <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    End date <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              {/* Requirements */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Requirements for creators
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                  placeholder="e.g. Must tag @yourbrand, mention promo code, 30s minimum..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>

              {/* Min followers */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Minimum follower count
                </label>
                <select
                  value={form.minFollowers}
                  onChange={(e) => set("minFollowers", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                >
                  {FOLLOWER_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Application deadline */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Application deadline
                </label>
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) => set("applicationDeadline", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Review notice */}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed border border-gray-100">
                <p className="font-semibold text-gray-700 mb-1">Review before publishing</p>
                Your campaign will go live once approved. Creators can apply and
                you'll review their submissions from your dashboard.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
            className="text-sm font-medium text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:text-gray-800 transition-colors"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
          >
            {step === TOTAL_STEPS ? "Publish campaign" : "Next"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlusCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-800">No campaigns found</p>
      <p className="text-xs text-gray-400 text-center max-w-[240px] leading-relaxed">
        Create your first campaign to start reaching your audience.
      </p>
      <button
        onClick={onNew}
        className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        <PlusCircleIcon />
        New Campaign
      </button>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusStyles: Record<TabKey, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    ended: "bg-gray-100 text-gray-500",
    all: "",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-lg flex-shrink-0">
        📣
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {campaign.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Budget: {campaign.budget} · {campaign.date}
        </p>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[campaign.status]}`}
      >
        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyCampaigns() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [showModal, setShowModal] = useState(false);

  // Replace with real data / API call
  const campaigns: Campaign[] = [];

  const countFor = (key: TabKey) =>
    key === "all"
      ? campaigns.length
      : campaigns.filter((c) => c.status === key).length;

  const visibleCampaigns =
    activeTab === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === activeTab);

  return (
    <>
      {showModal && (
        <NewCampaignModal onClose={() => setShowModal(false)} />
      )}

      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-8 py-9">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              My Campaigns
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm shadow-orange-200 transition-all"
            >
              <PlusCircleIcon />
              New Campaign
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200">
            {TABS.map(({ key, label, icon }) => {
              const isActive = activeTab === key;
              const count = countFor(key);
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    relative flex items-center gap-1.5 px-0 mr-6 pb-3 pt-1 text-sm font-medium border-b-2 -mb-px transition-colors
                    ${
                      isActive
                        ? "border-gray-900 text-gray-900 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }
                  `}
                >
                  {icon && <span className="flex items-center">{icon}</span>}
                  {label}
                  <span
                    className={`
                      text-xs font-semibold px-1.5 py-0.5 rounded-full font-mono
                      ${isActive ? "bg-yellow-100 text-orange-500" : "bg-gray-100 text-gray-500"}
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Folder button */}
            <div className="ml-auto flex items-center gap-1.5 text-gray-500 hover:text-gray-800 cursor-pointer pb-3 transition-colors">
              <FolderIcon />
              <span className="bg-gray-900 text-white text-[11px] font-bold px-1.5 py-0.5 rounded font-mono">
                1
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mt-1">
            {visibleCampaigns.length === 0 ? (
              <EmptyState onNew={() => setShowModal(true)} />
            ) : (
              <div className="flex flex-col gap-3 pt-5">
                {visibleCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}