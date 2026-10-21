import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, makeToken } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured on this deployment." },
      { status: 400 },
    );
  }
  let passcode = "";
  try {
    const body = (await req.json()) as { passcode?: string };
    passcode = typeof body.passcode === "string" ? body.passcode : "";
  } catch {
    passcode = "";
  }
  if (passcode !== expected) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  return res;
}
