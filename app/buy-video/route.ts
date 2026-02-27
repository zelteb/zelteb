import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { video, buyer_id } = await req.json();

  if (!buyer_id) {
    return new Response("Not logged in", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // save purchase
  await supabase.from("purchases").insert({
    video_id: video.id,
    buyer_id,
    amount: video.price,
  });

  // creator earning
  await supabase.from("earnings").insert({
    creator_id: video.creator_id,
    video_id: video.id,
    amount: video.price * 0.7,
  });

  return new Response("ok");
}
