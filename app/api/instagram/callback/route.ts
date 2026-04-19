import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  const tokenRes = await fetch(
    "https://graph.facebook.com/v19.0/oauth/access_token" +
    "?client_id=" + process.env.FB_APP_ID +
    "&client_secret=" + process.env.FB_APP_SECRET +
    "&redirect_uri=" + process.env.REDIRECT_URI +
    "&code=" + code
  )

  const tokenData = await tokenRes.json()
  const access_token = tokenData.access_token

  const pageRes = await fetch(
    "https://graph.facebook.com/v19.0/me/accounts?access_token=" + access_token
  )
  const pageData = await pageRes.json()
  const pageId = pageData.data[0].id

  const igRes = await fetch(
    "https://graph.facebook.com/v19.0/" +
      pageId +
      "?fields=instagram_business_account&access_token=" +
      access_token
  )
  const igData = await igRes.json()

  const ig_id = igData.instagram_business_account.id

  return NextResponse.json({ ig_id, access_token })
}