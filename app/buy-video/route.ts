import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { video, buyer_id } = await req.json();
    console.log("Incoming:", video, buyer_id);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("purchases")
      .insert({
        video_id: video.id,
        buyer_id,
        amount: video.price,
      })
      .select();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify(error), { status: 500 });
    }

    console.log("Inserted:", data);
    return new Response("ok");
  } catch (err) {
    console.error("Server crash:", err);
    return new Response("server error", { status: 500 });
  }
}