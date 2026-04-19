import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const igId = searchParams.get("ig_id")

  if (!token || !igId) {
    return NextResponse.json({ error: "Missing token" })
  }

  const userRes = await fetch(
    "https://graph.facebook.com/v19.0/" +
      igId +
      "?fields=followers_count&access_token=" +
      token
  )
  const userData = await userRes.json()

  const mediaRes = await fetch(
    "https://graph.facebook.com/v19.0/" +
      igId +
      "/media?fields=id,like_count,comments_count,video_view_count,timestamp&limit=50&access_token=" +
      token
  )
  const mediaData = await mediaRes.json()

  let totalLikes = 0
  let totalComments = 0
  let totalViews = 0
  let postCount = 0
  let reelCount = 0

  const past90 = new Date()
  past90.setDate(past90.getDate() - 90)

  mediaData.data.forEach((post: any) => {
    if (new Date(post.timestamp) >= past90) {
      totalLikes += post.like_count || 0
      totalComments += post.comments_count || 0
      postCount++

      if (post.video_view_count) {
        totalViews += post.video_view_count
        reelCount++
      }
    }
  })

  return NextResponse.json({
    followers: userData.followers_count,
    avgLikes: Math.round(totalLikes / (postCount || 1)),
    avgViews: Math.round(totalViews / (reelCount || 1)),
    engagementRate: (
      ((totalLikes + totalComments) / userData.followers_count) *
      100
    ).toFixed(2),
  })
}