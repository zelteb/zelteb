// app/api/buy-video/route.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "create-order") {
      const { video_id, buyer_id } = body;

      if (!video_id || !buyer_id) {
        return new Response("Missing video_id or buyer_id", { status: 400 });
      }

      const { data: video, error } = await supabase
        .from("videos")
        .select("id, price, creator_id")
        .eq("id", video_id)
        .single();

      if (error || !video) {
        return new Response("Video not found", { status: 404 });
      }

      // FREE VIDEO
      if (Number(video.price) === 0) {
        const { data: existing } = await supabase
          .from("purchases")
          .select("id")
          .eq("video_id", video_id)
          .eq("buyer_id", buyer_id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("purchases").insert({
            video_id,
            buyer_id,
            creator_id: video.creator_id,
            price: 0,
            platform_fee: 0,
            creator_earnings: 0,
            payment_id: "FREE",
            status: "completed",
          });
        }

        return Response.json({ free: true });
      }

      // PAID VIDEO — payments disabled for now
      return new Response("Payments are currently unavailable. Please check back soon.", { status: 503 });
    }

    return new Response("Invalid action", { status: 400 });

  } catch (err: any) {
    return new Response(
      "Error: " + (err?.message || "Unknown error"),
      { status: 500 }
    );
  }
}