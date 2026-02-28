// app/[username]/page.tsx

import { supabase } from "@/lib/supabase";

export default async function UserPage({ params }: { params: { username: string } }) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", params.username)
    .single();

  if (!profile) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
    </div>
  );
}