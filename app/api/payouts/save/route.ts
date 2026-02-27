// app/api/payouts/save/route.ts

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // ✅ Get user from session (not from body)
    const supabaseAuth = await createServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { account_holder, ifsc, account_number, type, street, city, postal_code } = body;

    if (!account_holder || !ifsc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Use service role for upsert
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build upsert payload
    const payload: Record<string, any> = {
      user_id: user.id,
      account_holder,
      ifsc,
      account_type: type,
      street,
      city,
      postal_code,
    };

    // ✅ Only update account number if a new one was provided
    if (account_number) {
      payload.account_number_encrypted = account_number;
    }

    const { error } = await supabase
      .from("payout_accounts")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}