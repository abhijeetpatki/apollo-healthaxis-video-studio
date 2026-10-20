/** Shared constants for the Gemini 3.8 Live integration. */

export const GEMINI_MODEL = "gemini-3.8-live";

export const DEFAULT_LOCATION = "us-central1";

/** Vertex AI bidirectional Live endpoint (v1beta1). */
export function vertexWsUrl(location: string, accessToken: string): string {
  const host = `${location}-aiplatform.googleapis.com`;
  const path =
    "google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent";
  return `wss://${host}/ws/${path}?access_token=${encodeURIComponent(accessToken)}`;
}

export function vertexModelPath(project: string, location: string): string {
  return `projects/${project}/locations/${location}/publishers/google/models/${GEMINI_MODEL}`;
}

/** AI Studio (Generative Language) bidirectional Live endpoint. */
export function aiStudioWsUrl(auth: {
  key?: string;
  accessToken?: string;
}): string {
  const host = "generativelanguage.googleapis.com";
  const path =
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
  const q = auth.accessToken
    ? `access_token=${encodeURIComponent(auth.accessToken)}`
    : `key=${encodeURIComponent(auth.key ?? "")}`;
  return `wss://${host}/ws/${path}?${q}`;
}

export const AI_STUDIO_MODEL = `models/${GEMINI_MODEL}`;
