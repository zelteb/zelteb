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

  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabaseServer
      .from("profiles")
      .select("id, username, full_name, avatar_url, cover_url, bio, post_count, youtube_url, instagram_url, x_url")
      .ilike("username", username)
      .maybeSingle(),
    supabaseServer.auth.getUser(),
  ]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <p className="text-gray-500 text-lg">User not found</p>
      </div>
    );
  }

  // Fetch this creator's products using their profile id
  const { data: products } = await supabaseServer
    .from("videos")
    .select("id, title, price, is_free, thumbnail_url, product_type, created_at")
    .eq("creator_id", profile.id)
    .order("created_at", { ascending: false });

  const isOwner =
    !!user && user.user_metadata?.username?.toLowerCase() === username.toLowerCase();

  return (
    <UserProfileClient
      profile={profile}
      isOwner={isOwner}
      products={products || []}
    />
  );
}