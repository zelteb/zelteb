import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // your instagram callback logic here
  return NextResponse.json({ ok: true });
}