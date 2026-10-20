/**
 * Incoming avatar video (Vertex Live Avatar) + outgoing webcam frames.
 *
 * In VIDEO mode the server streams a single fMP4 init segment (ftyp+moov)
 * followed by continuous moof+mdat fragments carrying muxed H.264 video and
 * AAC-LC audio. We feed them into a MediaSource SourceBuffer attached to a
 * <video> element for real-time, lip-synced playback.
 */

const CODEC_CANDIDATES = [
  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', // H.264 baseline + AAC-LC
  'video/mp4; codecs="avc1.4D401F, mp4a.40.2"', // main profile
  'video/mp4; codecs="avc1.64001F, mp4a.40.2"', // high profile
  'video/mp4; codecs="avc1.42E01E"',
  'video/mp4',
];

export function pickSupportedCodec(): string | null {
  if (typeof MediaSource === "undefined") return null;
  for (const c of CODEC_CANDIDATES) {
    try {
      if (MediaSource.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export class AvatarVideoPlayer {
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private queue: Uint8Array[] = [];
  private objectUrl: string | null = null;
  private ready = false;
  private codec: string;

  constructor(
    private readonly video: HTMLVideoElement,
    codec?: string,
  ) {
    this.codec = codec ?? pickSupportedCodec() ?? CODEC_CANDIDATES[0];
  }

  get codecString(): string {
    return this.codec;
  }

  init(): boolean {
    if (typeof MediaSource === "undefined") return false;
    this.mediaSource = new MediaSource();
    this.objectUrl = URL.createObjectURL(this.mediaSource);
    this.video.src = this.objectUrl;
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.mediaSource.addEventListener("sourceopen", () => {
      if (!this.mediaSource) return;
      try {
        this.sourceBuffer = this.mediaSource.addSourceBuffer(this.codec);
        this.sourceBuffer.mode = "sequence";
        this.sourceBuffer.addEventListener("updateend", () => this.pump());
        this.ready = true;
        this.pump();
      } catch (err) {
        console.error("[avatar] addSourceBuffer failed", err);
      }
    });
    return true;
  }

  append(chunk: Uint8Array) {
    this.queue.push(chunk);
    this.pump();
  }

  private pump() {
    const sb = this.sourceBuffer;
    if (!this.ready || !sb || sb.updating) return;
    const next = this.queue.shift();
    if (!next) return;
    try {
      // Trim the buffer behind the current position to bound memory on a
      // long, continuously-streamed session.
      const buffered = sb.buffered;
      if (buffered.length > 0) {
        const start = buffered.start(0);
        const cutoff = this.video.currentTime - 8;
        if (cutoff > start + 1) {
          sb.remove(start, cutoff);
          this.queue.unshift(next);
          return;
        }
      }
      // SourceBuffer requires a BufferSource; copy to a fresh ArrayBuffer.
      const copy = next.slice();
      sb.appendBuffer(copy.buffer as ArrayBuffer);
    } catch (err) {
      // QuotaExceeded or transient — re-queue and let updateend retry.
      console.warn("[avatar] appendBuffer deferred", err);
      this.queue.unshift(next);
    }
  }

  /** On barge-in, jump to the live edge so interruption feels instant. */
  jumpToLiveEdge() {
    const sb = this.sourceBuffer;
    if (!sb) return;
    try {
      const b = sb.buffered;
      if (b.length > 0) {
        const edge = b.end(b.length - 1);
        if (edge - this.video.currentTime > 0.15) {
          this.video.currentTime = Math.max(0, edge - 0.05);
        }
      }
    } catch {
      /* ignore */
    }
  }

  destroy() {
    try {
      if (this.mediaSource && this.mediaSource.readyState === "open") {
        this.mediaSource.endOfStream();
      }
    } catch {
      /* ignore */
    }
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.queue = [];
    this.sourceBuffer = null;
    this.mediaSource = null;
    this.ready = false;
    this.video.removeAttribute("src");
    try {
      this.video.load();
    } catch {
      /* ignore */
    }
  }
}

/** Captures ~1 fps JPEG frames (768x768) from the patient webcam. */
export class CameraFrameCapture {
  private timer: number | null = null;
  private canvas: HTMLCanvasElement;
  private videoEl: HTMLVideoElement;
  private muted = false;

  constructor(
    private readonly stream: MediaStream,
    private readonly onFrame: (base64Jpeg: string) => void,
    private readonly fps = 1,
    private readonly size = 768,
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.videoEl = document.createElement("video");
    this.videoEl.muted = true;
    this.videoEl.playsInline = true;
    this.videoEl.srcObject = this.stream;
  }

  async start() {
    try {
      await this.videoEl.play();
    } catch {
      /* autoplay may require a user gesture; frames just start late */
    }
    const intervalMs = 1000 / this.fps;
    this.timer = window.setInterval(() => this.grab(), intervalMs);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  private grab() {
    if (this.muted) return;
    const vw = this.videoEl.videoWidth;
    const vh = this.videoEl.videoHeight;
    if (!vw || !vh) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    // center-crop to square then draw at target size
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2;
    const sy = (vh - side) / 2;
    ctx.drawImage(this.videoEl, sx, sy, side, side, 0, 0, this.size, this.size);
    const dataUrl = this.canvas.toDataURL("image/jpeg", 0.7);
    const base64 = dataUrl.split(",")[1];
    if (base64) this.onFrame(base64);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.videoEl.srcObject = null;
  }
}
