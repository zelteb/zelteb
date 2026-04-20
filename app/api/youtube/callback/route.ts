import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    }),
  })

  const tokenData = await tokenRes.json()
  const access_token = tokenData.access_token

  // Get channel
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: { Authorization: "Bearer " + access_token },
    }
  )

  const channelData = await channelRes.json()
  const channel = channelData.items[0]

  return NextResponse.json({
    channel_id: channel.id,
    title: channel.snippet.title,
    subscribers: channel.statistics.subscriberCount,
    access_token,
  })
}