import { NextResponse } from "next/server"

const TOKEN = process.env.INSTAGRAM_TOKEN
const IG_ID = process.env.INSTAGRAM_ID

export async function GET() {
  try {
    // Followers
    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/${IG_ID}?fields=followers_count&access_token=${TOKEN}`
    )
    const userData = await userRes.json()

    // Media
    const mediaRes = await fetch(
      `https://graph.facebook.com/v19.0/${IG_ID}/media?fields=id,like_count,comments_count,video_view_count,timestamp&limit=50&access_token=${TOKEN}`
    )
    const mediaData = await mediaRes.json()

    const now = new Date()
    const past90 = new Date()
    past90.setDate(now.getDate() - 90)

    let totalLikes = 0
    let totalComments = 0
    let totalViews = 0
    let postCount = 0
    let reelCount = 0

    mediaData.data.forEach((post: any) => {
      const postDate = new Date(post.timestamp)

      if (postDate >= past90) {
        totalLikes += post.like_count || 0
        totalComments += post.comments_count || 0
        postCount++

        if (post.video_view_count) {
          totalViews += post.video_view_count
          reelCount++
        }
      }
    })

    const avgLikes = postCount ? totalLikes / postCount : 0
    const avgViews = reelCount ? totalViews / reelCount : 0

    const engagementRate =
      userData.followers_count > 0
        ? ((totalLikes + totalComments) / userData.followers_count) * 100
        : 0

    return NextResponse.json({
      followers: userData.followers_count,
      avgLikes: Math.round(avgLikes),
      avgViews: Math.round(avgViews),
      engagementRate: engagementRate.toFixed(2),
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed" })
  }
}