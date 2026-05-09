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

  // Replace with real data / API call
  const campaigns: Campaign[] = [];

  const countFor = (key: TabKey) =>
    key === "all" ? campaigns.length : campaigns.filter((c) => c.status === key).length;

  const visibleCampaigns =
    activeTab === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === activeTab);

  const handleNew = () => {
    // TODO: open new campaign modal / navigate
    console.log("New campaign");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-9">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Campaigns
          </h1>
          <button
            onClick={handleNew}
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
            <EmptyState onNew={handleNew} />
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
  );
}