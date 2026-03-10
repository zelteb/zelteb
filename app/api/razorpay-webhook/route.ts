import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes;

      const video_id = notes?.video_id;
      const buyer_id = notes?.buyer_id;

      if (!video_id || !buyer_id) {
        return new Response("Missing notes", { status: 400 });
      }

      // Check already purchased
      const { data: existing } = await supabase
        .from("purchases")
        .select("id")
        .eq("video_id", video_id)
        .eq("buyer_id", buyer_id)
        .maybeSingle();

      if (existing) {
        return new Response("Already purchased", { status: 200 });
      }

      const { data: video } = await supabase
        .from("videos")
        .select("id, price, creator_id")
        .eq("id", video_id)
        .single();

      if (!video) {
        return new Response("Video not found", { status: 404 });
      }

      const price = Number(video.price);
      const platform_fee = Number((price * 0.07).toFixed(2));
      const creator_earnings = Number((price - platform_fee).toFixed(2));

      const { error } = await supabase.from("purchases").insert({
        video_id,
        buyer_id,
        creator_id: video.creator_id,
        price,
        platform_fee,
        creator_earnings,
        payment_id: payment.id,
        status: "completed",
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return new Response("DB error: " + error.message, { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response("Error: " + err.message, { status: 500 });
  }
}