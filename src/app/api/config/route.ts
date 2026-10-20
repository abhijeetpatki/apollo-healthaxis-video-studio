import { NextResponse, connection } from "next/server";
import { GEMINI_MODEL } from "@/lib/gemini/constants";
/** Reports which server-side credential modes are configured on this deploy. */
export async function GET() {
  // Opt into runtime (dynamic) execution so env vars are read per-request,
  // not baked in at build time under cacheComponents.
  await connection();
  const vertexConfigured = Boolean(
    (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS) &&
      (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID),
  );
  const aiStudioConfigured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  );
  return NextResponse.json({
    vertexConfigured,
    aiStudioConfigured,
    defaultLocation: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    model: GEMINI_MODEL,
  });
}
