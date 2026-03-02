import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { video, buyer_id } = await req.json();

    if (!buyer_id || !video?.id || !video?.price) {
      return new Response("Invalid request", { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const platformFee = video.price * 0.06;
    const creatorEarn = video.price - platformFee;

    // Insert purchase
    const { error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        video_id: video.id,
        buyer_id,
        amount: video.price,
      });

    if (purchaseError) {
      console.error(purchaseError);
      return new Response("Purchase failed", { status: 500 });
    }

    // Insert creator earning
    await supabase.from("earnings").insert({
      creator_id: video.creator_id,
      video_id: video.id,
      amount: creatorEarn,
    });

    return new Response("ok");
  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
}