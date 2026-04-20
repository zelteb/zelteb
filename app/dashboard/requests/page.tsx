"use client"

import { useState } from "react"

export default function SocialPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const connect = (platform: string) => {
    setLoading(platform)

    // use full URL (avoids issues in prod like zelteb.com)
    window.location.href = `${window.location.origin}/api/${platform}/connect`
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
          disabled={loading !== null}
          style={btn("#E1306C")}
        >
          {loading === "instagram" ? "Connecting..." : "Connect Instagram"}
        </button>

        {/* YouTube */}
        <button
          onClick={() => connect("youtube")}
          disabled={loading !== null}
          style={btn("#FF0000")}
        >
          {loading === "youtube" ? "Connecting..." : "Connect YouTube"}
        </button>

        {/* X */}
        <button
          onClick={() => connect("x")}
          disabled
          style={btn("#000000", true)}
        >
          Coming Soon (X)
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => connect("linkedin")}
          disabled
          style={btn("#0077B5", true)}
        >
          Coming Soon (LinkedIn)
        </button>

        {/* Reddit */}
        <button
          onClick={() => connect("reddit")}
          disabled
          style={btn("#FF4500", true)}
        >
          Coming Soon (Reddit)
        </button>
      </div>
    </div>
  )
}

function btn(color: string, disabled = false) {
  return {
    padding: "12px 20px",
    background: disabled ? "#ccc" : color,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 15,
    minWidth: 180,
    opacity: disabled ? 0.6 : 1,
  }
}