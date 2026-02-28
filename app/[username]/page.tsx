import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default async function UserPage({
  params,
}: {
  params: { username: string };
}) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", params.username)
    .single();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl font-bold">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      
      {/* 🔥 Cover Section */}
      <div className="relative h-64 w-full">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt="cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-black to-gray-700" />
        )}
      </div>

      {/* 🔥 Profile Section */}
      <div className="relative max-w-3xl mx-auto px-6">
        
        {/* Profile Image */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-300">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="avatar"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : null}
          </div>
        </div>

        {/* User Info */}
        <div className="pt-20 text-center pb-12">
          <h1 className="text-4xl font-bold">
            {profile.full_name || profile.username}
          </h1>

          <p className="text-gray-500 mt-2">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-4 text-gray-700 max-w-xl mx-auto">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}