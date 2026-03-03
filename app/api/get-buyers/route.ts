import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { buyer_ids } = await req.json();

    if (!buyer_ids || !Array.isArray(buyer_ids) || buyer_ids.length === 0) {
      return Response.json([]);
    }

    // Must use service role to read auth.users
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error || !data) {
      return new Response(error?.message ?? "Failed", { status: 500 });
    }

    // Filter only the buyers we need
    const buyers = data.users
      .filter((u) => buyer_ids.includes(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email,
        raw_user_meta_data: u.user_metadata,
      }));

    return Response.json(buyers);
  } catch (err: any) {
    return new Response(err?.message ?? "Server error", { status: 500 });
  }
}