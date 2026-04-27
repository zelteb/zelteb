import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role"); // "brand" | "influencer" | null (for login button)

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

      // Came from "Sign up as Brand" button — create/upsert and redirect
      if (role === "brand") {
        await supabase.from("brands").upsert(
          { user_id, email, full_name, avatar_url },
          { onConflict: "user_id" }
        );
        return NextResponse.redirect(new URL("/brand/dashboard", requestUrl.origin));
      }

      // Came from "Sign up as Creator" button — create/upsert and redirect
      if (role === "influencer") {
        await supabase.from("influencers").upsert(
          { user_id, email, full_name, avatar_url },
          { onConflict: "user_id" }
        );
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }

      // Came from "Login" button (no role) — check if returning user
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (brand) {
        return NextResponse.redirect(new URL("/brand/dashboard", requestUrl.origin));
      }

      const { data: influencer } = await supabase
        .from("influencers")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (influencer) {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }

      // New user with no role — send to login to pick a role
      return NextResponse.redirect(new URL("/login?new=true", requestUrl.origin));
    }
  }

  // Fallback
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}