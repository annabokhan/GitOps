import { NextRequest, NextResponse } from "next/server";

/**
 * Stub for the two distinct email lists required by PRD §2: "future
 * shared space" interest vs. general marketing. A real build would
 * write to the actual ESP/CRM list named in `list`; this just logs so
 * the capture flow is fully testable end-to-end.
 */
export async function POST(req: NextRequest) {
  const { email, list } = (await req.json()) as { email: string; list: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  console.log(`[notify] ${list}: ${email}`);
  return NextResponse.json({ ok: true });
}
