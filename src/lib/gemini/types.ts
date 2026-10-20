import type { PersonaId } from "../personas";

/** Which backend the studio is talking to. */
export type ConnectionMode =
  | "vertex-video" // Vertex AI gemini-3.8-live with Live Avatar VIDEO output
  | "aistudio-audio"; // AI Studio gemini-3.8-live, audio + vision fallback

export type SessionStatus =
  | "idle"
  | "requesting-media"
  | "minting-token"
  | "connecting"
  | "live"
  | "reconnecting"
  | "ended"
  | "error";

export interface TranscriptEntry {
  id: string;
  role: "patient" | "specialist";
  text: string;
  final: boolean;
  at: number;
}

/** Credentials gathered from the Credentials & Mode drawer (client side). */
export interface ClientCredentials {
  /** Paste-in GCP project id for the Vertex path. */
  vertexProject?: string;
  /** Paste-in Service Account JSON (string) for the Vertex path. */
  serviceAccountJson?: string;
  /** Already-minted OAuth2 access token (optional shortcut). */
  vertexAccessToken?: string;
  /** Location, defaults to us-central1. */
  vertexLocation?: string;
  /** AI Studio API key for the audio+vision fallback. */
  geminiApiKey?: string;
}

/** What /api/config reports about server-side env configuration. */
export interface ServerConfig {
  vertexConfigured: boolean;
  aiStudioConfigured: boolean;
  defaultLocation: string;
  model: string;
}

export interface TokenResponse {
  token: string;
  project: string;
  location: string;
  model: string;
  /** epoch ms */
  expiresAt: number;
}

export interface SessionCallbacks {
  onStatus: (status: SessionStatus, detail?: string) => void;
  onMode: (mode: ConnectionMode) => void;
  onTranscript: (entry: TranscriptEntry) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onInterrupted: () => void;
  onError: (message: string) => void;
  /** Base64 fmp4 chunk (Vertex VIDEO mode only). */
  onVideoChunk: (chunk: Uint8Array) => void;
  /** 24kHz PCM audio (AI Studio fallback only). */
  onAudioChunk: (pcm: Int16Array) => void;
}

export interface StartOptions {
  persona: PersonaId;
  avatarName: string;
  voiceName: string;
  systemInstruction: string;
  greeting: string;
  micStream: MediaStream;
  camStream: MediaStream | null;
  credentials: ClientCredentials;
  server: ServerConfig;
  /** Force a mode; otherwise auto-select best available. */
  preferMode?: ConnectionMode;
}
