import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function UserPage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient(); // ✅ SSR client

  console.log("[UserPage] Looking up username:", params.username);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", params.username)
    .single();

  console.log("[UserPage] profile:", profile);
  console.log("[UserPage] error:", error);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <p className="text-gray-500 text-lg">User not found</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-xs text-red-400 bg-red-50 p-4 rounded max-w-lg w-full overflow-auto">
            {JSON.stringify({ lookedUp: params.username, error }, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-serif">
      
      {/* Cover */}
      <div className="relative w-full h-56 md:h-72 bg-stone-300 overflow-hidden">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 40%, #4a3728 70%, #2c1810 100%)",
            }}
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Avatar */}
        <div className="flex justify-center -mt-16 md:-mt-20 relative z-10">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={144}
                height={144}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-800">
                <span className="text-4xl font-bold text-amber-400 uppercase tracking-widest">
                  {profile.username?.charAt(0) ?? "?"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name + Info */}
        <div className="mt-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>

          {profile.tagline && (
            <p className="mt-1 text-sm md:text-base text-gray-500 italic">
              {profile.tagline}
            </p>
          )}

          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            {profile.member_count != null && (
              <>
                <span>{profile.member_count} paid members</span>
                <span className="text-gray-300">•</span>
              </>
            )}
            {profile.post_count != null && (
              <span>{profile.post_count} Posts</span>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-700 leading-relaxed text-sm md:text-base max-w-lg mx-auto">
              {profile.bio}
            </p>
          )}

          <div className="mt-6 mb-10">
            <button className="px-8 py-3 bg-gray-900 hover:bg-gray-700 transition-colors text-white font-semibold rounded-full text-sm md:text-base shadow-md">
              Become a member
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 flex gap-8 justify-center text-sm font-medium text-gray-500">
          <button className="py-3 border-b-2 border-gray-900 text-gray-900">
            Home
          </button>
          <button className="py-3 border-b-2 border-transparent hover:text-gray-700 transition-colors">
            About
          </button>
        </div>
      </div>
    </div>
  );
}
