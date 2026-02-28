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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-serif">
      {/* Cover / Banner */}
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
          /* Fallback ornamental gradient when no cover is set */
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 40%, #4a3728 70%, #2c1810 100%)",
            }}
          >
            {/* Subtle arch / cathedral SVG decoration */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              viewBox="0 0 1440 288"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="720" cy="300" rx="600" ry="280" fill="none" stroke="#d4af37" strokeWidth="1.5" />
              <ellipse cx="720" cy="300" rx="500" ry="230" fill="none" stroke="#d4af37" strokeWidth="1" />
              <ellipse cx="720" cy="300" rx="400" ry="180" fill="none" stroke="#d4af37" strokeWidth="0.75" />
              <line x1="0" y1="0" x2="1440" y2="0" stroke="#d4af37" strokeWidth="2" />
              <line x1="0" y1="288" x2="1440" y2="288" stroke="#d4af37" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Profile card centred below the cover */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar — overlaps the cover */}
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
              /* Fallback monogram */
              <div className="w-full h-full flex items-center justify-center bg-stone-800">
                <span className="text-4xl font-bold text-amber-400 uppercase tracking-widest">
                  {profile.username?.charAt(0) ?? "?"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Name & tagline */}
        <div className="mt-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>

          {profile.tagline && (
            <p className="mt-1 text-sm md:text-base text-gray-500 italic">
              {profile.tagline}
            </p>
          )}

          {/* Stats row */}
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

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-gray-700 leading-relaxed text-sm md:text-base max-w-lg mx-auto">
              {profile.bio}
            </p>
          )}

          {/* CTA button */}
          <div className="mt-6 mb-10">
            <button className="px-8 py-3 bg-gray-900 hover:bg-gray-700 transition-colors text-white font-semibold rounded-full text-sm md:text-base shadow-md">
              Become a member
            </button>
          </div>
        </div>

        {/* Tab bar */}
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