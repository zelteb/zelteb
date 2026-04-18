import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ FIX

    const userId = cookieStore.get("sb-user")?.value;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return Response.json({ data });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}