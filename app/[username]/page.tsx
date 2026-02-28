import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // ✅ unwrap params (Next.js 16 requirement)
  const { username } = await params;

  console.log("URL USERNAME:", username);

  // 🔥 Normal query
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  console.log("MATCHED PROFILE:", profile);
  console.log("MATCH ERROR:", error);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <p className="text-gray-500 text-lg">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-serif">
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
          <div className="absolute inset-0 bg-gray-800" />
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4">
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

        <div className="mt-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>
        </div>
      </div>
    </div>
  );
}