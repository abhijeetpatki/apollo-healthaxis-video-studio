import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import {
  DEFAULT_LOCATION,
  GEMINI_MODEL,
  vertexModelPath,
} from "@/lib/gemini/constants";
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

interface Body {
  project?: string;
  location?: string;
  serviceAccountJson?: string;
  accessToken?: string;
}

function parseServiceAccount(raw: string): Record<string, unknown> {
  // Accept raw JSON or base64-encoded JSON.
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const decoded = Buffer.from(trimmed, "base64").toString("utf8");
  return JSON.parse(decoded);
}

/**
 * Mints a short-lived GCP OAuth2 access token for the Vertex Live endpoint.
 * Credentials resolve in this order:
 *   1. accessToken passed in the body (used verbatim — caller already has one)
 *   2. serviceAccountJson passed in the body (Credentials & Mode drawer)
 *   3. GOOGLE_APPLICATION_CREDENTIALS_JSON env (Vercel)
 *   4. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS file)
 */
export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const location =
    body.location ||
    process.env.GOOGLE_CLOUD_LOCATION ||
    DEFAULT_LOCATION;

  try {
    // Fast path: caller already holds a token.
    if (body.accessToken) {
      const project =
        body.project || process.env.GOOGLE_CLOUD_PROJECT || "";
      if (!project) {
        return NextResponse.json(
          { error: "A project id is required alongside an access token." },
          { status: 400 },
        );
      }
      return NextResponse.json({
        token: body.accessToken,
        project,
        location,
        model: vertexModelPath(project, location),
        expiresAt: Date.now() + 55 * 60 * 1000,
      });
    }

    const saRaw =
      body.serviceAccountJson ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
      "";

    let auth: GoogleAuth;
    let project = body.project || process.env.GOOGLE_CLOUD_PROJECT || "";

    if (saRaw) {
      const credentials = parseServiceAccount(saRaw);
      if (!project && typeof credentials.project_id === "string") {
        project = credentials.project_id;
      }
      auth = new GoogleAuth({ credentials, scopes: SCOPE });
    } else {
      // Application Default Credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS).
      auth = new GoogleAuth({ scopes: SCOPE });
      if (!project) project = await auth.getProjectId().catch(() => "");
    }

    if (!project) {
      return NextResponse.json(
        {
          error:
            "No GCP project id available. Provide one in the drawer or set GOOGLE_CLOUD_PROJECT.",
        },
        { status: 400 },
      );
    }

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;
    if (!token) {
      return NextResponse.json(
        { error: "Failed to mint access token from the supplied credentials." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      project,
      location,
      model: vertexModelPath(project, location),
      // GCP access tokens live ~1h; refresh a little early client-side.
      expiresAt: Date.now() + 55 * 60 * 1000,
      modelId: GEMINI_MODEL,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown token-minting error.";
    return NextResponse.json(
      { error: `Vertex token error: ${message}` },
      { status: 500 },
    );
  }
}
