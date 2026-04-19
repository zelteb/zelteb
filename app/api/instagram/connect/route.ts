import { NextResponse } from "next/server"

export async function GET() {
  const url =
    "https://www.facebook.com/v19.0/dialog/oauth" +
    "?client_id=" + process.env.FB_APP_ID +
    "&redirect_uri=" + process.env.REDIRECT_URI +
    "&scope=instagram_basic,instagram_manage_insights,pages_show_list" +
    "&response_type=code"

  return NextResponse.redirect(url)
}