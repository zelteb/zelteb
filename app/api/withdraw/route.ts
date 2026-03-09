export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { creator_id, amount } = await req.json();

  if (!creator_id || !amount) {
    return Response.json({ error: "Missing fields." }, { status: 400 });
  }

  // Block if there's already a pending request
  const { data: existing } = await supabase
    .from("withdrawal_requests")
    .select("id")
    .eq("creator_id", creator_id)
    .eq("status", "pending")
    .single();

  if (existing) {
    return Response.json(
      { error: "You already have a pending withdrawal request." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("withdrawal_requests").insert({
    creator_id,
    amount,
    status: "pending",
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}