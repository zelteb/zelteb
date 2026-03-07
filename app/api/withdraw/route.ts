export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { creator_id, amount } = await req.json();

  await supabase.from("withdrawal_requests").insert({
    creator_id,
    amount,
    status: "pending",
  });

  return Response.json({ success: true });
}