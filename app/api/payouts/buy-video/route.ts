import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { video_id, buyer_id } = await req.json();

    if (!video_id || !buyer_id) {
      return new Response("Missing video_id or buyer_id", { status: 400 });
    }

    // ✅ Check env vars are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return new Response("Missing NEXT_PUBLIC_SUPABASE_URL", { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Missing SUPABASE_SERVICE_ROLE_KEY", { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1️⃣ Get video securely (never trust frontend price)
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, price, creator_id")
      .eq("id", video_id)
      .single();

    if (videoError) {
      return new Response("Video fetch error: " + videoError.message, { status: 500 });
    }
    if (!video) {
      return new Response("Video not found", { status: 404 });
    }

    // 2️⃣ Prevent duplicate purchase
    const { data: existing, error: dupError } = await supabase
      .from("purchases")
      .select("id")
      .eq("video_id", video_id)
      .eq("buyer_id", buyer_id)
      .maybeSingle();

    if (dupError) {
      return new Response("Duplicate check error: " + dupError.message, { status: 500 });
    }
    if (existing) {
      return new Response("Already purchased", { status: 400 });
    }

    // 3️⃣ Calculate commission (7%)
    const price = Number(video.price);
    const platform_fee = Number((price * 0.07).toFixed(2));
    const creator_earnings = Number((price - platform_fee).toFixed(2));

    // 4️⃣ Insert purchase
    const { error: insertError } = await supabase
      .from("purchases")
      .insert({
        video_id: video.id,
        buyer_id,
        creator_id: video.creator_id,
        price,
        platform_fee,
        creator_earnings,
        status: "completed",
      });

    if (insertError) {
      return new Response("Insert error: " + insertError.message, { status: 500 });
    }

    return new Response("ok");
  } catch (err: any) {
    return new Response("Caught error: " + (err?.message || "unknown"), { status: 500 });
  }
}