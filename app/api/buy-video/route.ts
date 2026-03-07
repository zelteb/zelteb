export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ================================
    // 🟢 STEP 1 — CREATE ORDER
    // ================================
    if (body.action === "create-order") {
      const { video_id, buyer_id } = body;

      console.log("🟡 Creating order for video:", video_id, "buyer:", buyer_id);
      console.log("🟡 Razorpay key_id present:", !!process.env.RAZORPAY_KEY_ID);
      console.log("🟡 Razorpay key_secret present:", !!process.env.RAZORPAY_KEY_SECRET);

      if (!video_id || !buyer_id) {
        console.error("❌ Missing video_id or buyer_id");
        return new Response("Missing video_id or buyer_id", { status: 400 });
      }

      const { data: video, error } = await supabase
        .from("videos")
        .select("id, price")
        .eq("id", video_id)
        .single();

      console.log("🟡 Video found:", video, "| Supabase error:", error);

      if (error || !video) {
        console.error("❌ Video not found");
        return new Response("Video not found", { status: 404 });
      }

      const amount = Number(video.price) * 100;
      console.log("🟡 Razorpay order amount (paise):", amount);

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `vzb_${Date.now()}`,
      });

      console.log("✅ Order created:", order);

      return Response.json({ order });
    }

    // ================================
    // 🟢 STEP 2 — VERIFY PAYMENT
    // ================================
    if (body.action === "verify-payment") {
      const {
        payment_id,
        order_id,
        signature,
        video_id,
        buyer_id,
      } = body;

      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(order_id + "|" + payment_id)
        .digest("hex");

      if (generated_signature !== signature) {
        return new Response("Invalid payment signature", { status: 400 });
      }

      // 🔒 Prevent duplicate purchase
      const { data: existing } = await supabase
        .from("purchases")
        .select("id")
        .eq("video_id", video_id)
        .eq("buyer_id", buyer_id)
        .maybeSingle();

      if (existing) {
        return new Response("Already purchased", { status: 400 });
      }

      // 📦 Get video details
      const { data: video } = await supabase
        .from("videos")
        .select("id, price, creator_id")
        .eq("id", video_id)
        .single();

      const price = Number(video!.price);
      const platform_fee = Number((price * 0.07).toFixed(2));
      const creator_earnings = Number((price - platform_fee).toFixed(2));

      // 💾 Save purchase
      await supabase.from("purchases").insert({
        video_id,
        buyer_id,
        creator_id: video!.creator_id,
        price,
        platform_fee,
        creator_earnings,
        payment_id,
        status: "completed",
      });

      return new Response("Payment verified & saved");
    }

    return new Response("Invalid action", { status: 400 });

  } catch (err: any) {
    console.error("❌ FULL ERROR:", JSON.stringify(err, null, 2));
    return new Response(
      "Error: " + (err?.error?.description || err?.message || JSON.stringify(err)),
      { status: 500 }
    );
  }
}