"use client"

import { useState } from "react"

export default function SocialPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const connect = (platform: string) => {
    setLoading(platform)
    window.location.href = `/api/${platform}/connect`
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        Connect Your Social Accounts
      </h1>

      <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        
        {/* Instagram */}
        <button
          onClick={() => connect("instagram")}
          style={btn("#E1306C")}
        >
          {loading === "instagram" ? "Connecting..." : "Connect Instagram"}
        </button>

        {/* YouTube */}
        <button
          onClick={() => connect("youtube")}
          style={btn("#FF0000")}
        >
          {loading === "youtube" ? "Connecting..." : "Connect YouTube"}
        </button>

        {/* X (Twitter) */}
        <button
          onClick={() => connect("x")}
          style={btn("#000000")}
        >
          Connect X
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => connect("linkedin")}
          style={btn("#0077B5")}
        >
          Connect LinkedIn
        </button>

        {/* Reddit */}
        <button
          onClick={() => connect("reddit")}
          style={btn("#FF4500")}
        >
          Connect Reddit
        </button>
      </div>
    </div>
  )
}

function btn(color: string) {
  return {
    padding: "12px 20px",
    background: color,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    minWidth: 180,
  }
}