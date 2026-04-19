export default function SocialPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Connect Social Accounts</h1>

      <div style={{ marginTop: 20 }}>
        <a href="/api/instagram/connect">
          <button
            style={{
              padding: "12px 20px",
              background: "#E1306C",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Connect Instagram
          </button>
        </a>
      </div>
    </div>
  )
}