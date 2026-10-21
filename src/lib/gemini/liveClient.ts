/**
 * Raw BidiGenerateContent WebSocket client for Gemini 3.8 Live.
 *
 * Two transports share one wire protocol:
 *   - Vertex AI (VIDEO / Live Avatar):
 *       wss://{loc}-aiplatform.googleapis.com/ws/
 *         google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent
 *       model: projects/{p}/locations/{loc}/publishers/google/models/gemini-3.8-live
 *       auth:  ?access_token=<gcp oauth token>
 *   - AI Studio (AUDIO + vision fallback):
 *       wss://generativelanguage.googleapis.com/ws/
 *         google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent
 *       model: models/gemini-3.8-live
 *       auth:  ?key=<api key>  (or ?access_token=<ephemeral>)
 *
 * We hand-roll the frames rather than using the SDK so the exact documented
 * setup payload (avatarConfig, responseModalities VIDEO, transcriptions) is
 * fully under our control and the fMP4 chunks reach the MediaSource untouched.
 */
import { bytesFromBase64 } from "./audio";

type Json = Record<string, unknown>;

function asObj(v: unknown): Json | null {
  return v && typeof v === "object" ? (v as Json) : null;
}
function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export interface LiveClientConfig {
  transport: "vertex" | "aistudio";
  /** full ws url including auth query param */
  url: string;
  /** model path / name for the setup message */
  model: string;
  responseModality: "VIDEO" | "AUDIO";
  voiceName: string;
  avatarName?: string;
  /** base64 reference portrait → customizedAvatar (needs allowlisting). */
  customImageData?: string;
  customImageMime?: string;
  systemInstruction: string;
  kickoff: string;
}

export interface LiveClientHandlers {
  onOpen: () => void;
  onSetupComplete: () => void;
  onVideoChunk: (bytes: Uint8Array) => void;
  onAudioChunk: (pcm: Int16Array) => void;
  onInputTranscript: (text: string) => void;
  onOutputTranscript: (text: string) => void;
  onTurnComplete: () => void;
  onInterrupted: () => void;
  onActivity: () => void;
  onClose: (code: number, reason: string) => void;
  onError: (message: string) => void;
}

export class LiveClient {
  private ws: WebSocket | null = null;
  private closedByUs = false;

  constructor(
    private readonly cfg: LiveClientConfig,
    private readonly h: LiveClientHandlers,
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(this.cfg.url);
    } catch (err) {
      this.h.onError(`WebSocket init failed: ${String(err)}`);
      return;
    }
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => {
      this.h.onOpen();
      this.sendSetup();
    };
    this.ws.onmessage = (ev) => this.handleMessage(ev.data);
    this.ws.onerror = () => {
      this.h.onError("WebSocket error. Check credentials, project entitlement and region.");
    };
    this.ws.onclose = (ev) => {
      if (!this.closedByUs) this.h.onClose(ev.code, ev.reason || "");
    };
  }

  private sendSetup() {
    const generationConfig: Json = {
      responseModalities: [this.cfg.responseModality],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: this.cfg.voiceName },
        },
      },
    };
    const setup: Json = {
      model: this.cfg.model,
      generationConfig,
      systemInstruction: { parts: [{ text: this.cfg.systemInstruction }] },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    };
    if (this.cfg.responseModality === "VIDEO") {
      if (this.cfg.customImageData) {
        setup.avatarConfig = {
          customizedAvatar: {
            imageMimeType: this.cfg.customImageMime || "png",
            imageData: this.cfg.customImageData,
          },
        };
      } else if (this.cfg.avatarName) {
        setup.avatarConfig = { avatarName: this.cfg.avatarName };
      }
    }
    this.send({ setup });
  }

  /** Streams a kickoff user turn so the specialist opens the conversation. */
  sendKickoff() {
    this.send({
      clientContent: {
        turns: [{ role: "user", parts: [{ text: this.cfg.kickoff }] }],
        turnComplete: true,
      },
    });
  }

  sendAudio(base64Pcm16k: string) {
    // Vertex realtimeInput uses dedicated `audio`/`video` fields; `mediaChunks`
    // is audio-only / legacy and rejects image frames with close code 1007.
    this.send({
      realtimeInput: {
        audio: { mimeType: "audio/pcm;rate=16000", data: base64Pcm16k },
      },
    });
  }

  sendVideoFrame(base64Jpeg: string) {
    this.send({
      realtimeInput: {
        video: { mimeType: "image/jpeg", data: base64Jpeg },
      },
    });
  }

  sendText(text: string) {
    this.send({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      },
    });
  }

  private send(obj: Json) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  private async handleMessage(data: unknown) {
    let text: string;
    if (typeof data === "string") {
      text = data;
    } else if (data instanceof ArrayBuffer) {
      text = new TextDecoder().decode(data);
    } else if (data instanceof Blob) {
      text = await data.text();
    } else {
      return;
    }
    let msg: Json | null;
    try {
      msg = asObj(JSON.parse(text));
    } catch {
      return;
    }
    if (!msg) return;
    this.route(msg);
  }

  private route(msg: Json) {
    if ("setupComplete" in msg) {
      this.h.onSetupComplete();
      return;
    }
    const sc = asObj(msg.serverContent);
    if (sc) {
      this.handleServerContent(sc);
      return;
    }
    // toolCall / goAway / sessionResumptionUpdate are acknowledged implicitly.
  }

  private handleServerContent(sc: Json) {
    if (sc.interrupted === true) this.h.onInterrupted();

    // transcription fields vary across surfaces; accept all known spellings
    const inT =
      asObj(sc.inputTranscription) ?? asObj(sc.inputAudioTranscription);
    if (inT) {
      const t = asStr(inT.text);
      if (t) this.h.onInputTranscript(t);
    }
    const outT =
      asObj(sc.outputTranscription) ?? asObj(sc.outputAudioTranscription);
    if (outT) {
      const t = asStr(outT.text);
      if (t) this.h.onOutputTranscript(t);
    }

    const modelTurn = asObj(sc.modelTurn);
    if (modelTurn) {
      this.h.onActivity();
      for (const raw of asArr(modelTurn.parts)) {
        const part = asObj(raw);
        if (!part) continue;
        const inline = asObj(part.inlineData);
        if (inline) {
          const mime = asStr(inline.mimeType) ?? "";
          const b64 = asStr(inline.data);
          if (!b64) continue;
          const bytes = bytesFromBase64(b64);
          if (mime.startsWith("video/")) {
            this.h.onVideoChunk(bytes);
          } else if (mime.startsWith("audio/")) {
            const samples = Math.floor(bytes.byteLength / 2);
            this.h.onAudioChunk(
              new Int16Array(bytes.buffer, bytes.byteOffset, samples),
            );
          }
        }
        const txt = asStr(part.text);
        if (txt) this.h.onOutputTranscript(txt);
      }
    }

    if (sc.turnComplete === true || sc.generationComplete === true) {
      this.h.onTurnComplete();
    }
  }

  close() {
    this.closedByUs = true;
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  }

  get isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
