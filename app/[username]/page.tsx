import { supabase } from "@/lib/supabase";
import UserProfileClient from "./UserProfileClient";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").ilike("username", username).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <p className="text-gray-500 text-lg">User not found</p>
      </div>
    );
  }

  const isOwner =
    !!user && user.user_metadata?.username?.toLowerCase() === username.toLowerCase();

  return <UserProfileClient profile={profile} isOwner={isOwner} />;
}