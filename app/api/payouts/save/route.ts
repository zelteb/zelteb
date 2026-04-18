import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies(); // ✅ FIX

    const userId = cookieStore.get("sb-user")?.value;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("payouts")
      .upsert({
        user_id: userId,
        account_holder: body.account_holder,
        ifsc: body.ifsc,
        upi_id: body.upi_id || null,
        account_number_encrypted: body.account_number || null,
      });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}