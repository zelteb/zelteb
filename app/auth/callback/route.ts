import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role"); // "brand" | "influencer"

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      const { id: user_id, email, user_metadata } = session.user;
      const full_name = user_metadata?.full_name ?? null;
      const avatar_url = user_metadata?.avatar_url ?? null;

      if (role === "brand") {
        // Upsert so repeat logins don't error
        await supabase.from("brands").upsert(
          { user_id, email, full_name, avatar_url },
          { onConflict: "user_id" }
        );
        return NextResponse.redirect(new URL("/brand/dashboard", requestUrl.origin));
      }

      if (role === "influencer") {
        await supabase.from("influencers").upsert(
          { user_id, email, full_name, avatar_url },
          { onConflict: "user_id" }
        );
        return NextResponse.redirect(new URL("/influencer/dashboard", requestUrl.origin));
      }
    }
  }

  // Fallback
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}