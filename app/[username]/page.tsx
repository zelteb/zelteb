import { createClient } from "@supabase/supabase-js";
import UserProfileClient from "./UserProfileClient";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 0;

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [{ data: profile, error }, { data: { user } }] = await Promise.all([
    supabaseServer
      .from("profiles")
      .select("username, full_name, avatar_url, cover_url, bio, post_count, youtube_url, instagram_url, x_url")
      .ilike("username", username)
      .maybeSingle(),
    supabaseServer.auth.getUser(),
  ]);

  // Prints in your Next.js terminal
  console.log("=== PROFILE DATA ===", JSON.stringify(profile, null, 2));
  console.log("=== DB ERROR ===", error);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <p className="text-gray-500 text-lg">User not found</p>
      </div>
    );
  }

  const isOwner =
    !!user && user.user_metadata?.username?.toLowerCase() === username.toLowerCase();

  // Also pass raw profile as a debug div so we can see it in browser
  return (
    <>
      <details className="fixed bottom-4 left-4 z-[9999] bg-black text-green-400 text-xs p-3 rounded-xl max-w-sm max-h-64 overflow-auto font-mono shadow-2xl">
        <summary className="cursor-pointer font-bold mb-1">🐛 Profile Debug</summary>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </details>
      <UserProfileClient profile={profile} isOwner={isOwner} />
    </>
  );
}