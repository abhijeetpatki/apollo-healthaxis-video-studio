import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
/**
 * Mints a short-lived AI Studio ephemeral token for the audio+vision fallback,
 * so the server-side GEMINI_API_KEY is never shipped to the browser.
 * The returned token is passed to the Live WebSocket as ?access_token=.
 */
export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No GEMINI_API_KEY configured on the server." },
      { status: 400 },
    );
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 2 * 60 * 1000).toISOString(),
      },
    });
    if (!token.name) {
      return NextResponse.json(
        { error: "Ephemeral token response was empty." },
        { status: 500 },
      );
    }
    return NextResponse.json({
      token: token.name,
      expiresAt: now + 30 * 60 * 1000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Ephemeral token error: ${message}` },
      { status: 500 },
    );
  }
}
