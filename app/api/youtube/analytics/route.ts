import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token" })
  }

  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true",
    {
      headers: { Authorization: "Bearer " + token },
    }
  )

  const data = await res.json()
  const stats = data.items[0].statistics

  return NextResponse.json({
    subscribers: stats.subscriberCount,
    totalViews: stats.viewCount,
    totalVideos: stats.videoCount,
  })
}