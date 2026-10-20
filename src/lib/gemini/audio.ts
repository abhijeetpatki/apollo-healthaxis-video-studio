/**
 * Audio plumbing for the Live session.
 *
 *  - MicCapture: captures the patient microphone, downsamples to 16 kHz
 *    mono 16-bit PCM and emits base64 chunks for realtimeInput.mediaChunks.
 *  - PcmPlayer: schedules 24 kHz PCM frames returned by the AI Studio audio
 *    fallback (the Vertex VIDEO path plays audio inside the <video> element).
 */

export function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunk, bytes.length)),
    );
  }
  return btoa(binary);
}

export function bytesFromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function downsample(
  input: Float32Array,
  inRate: number,
  outRate: number,
): Float32Array {
  if (outRate >= inRate) return input;
  const ratio = inRate / outRate;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  let offset = 0;
  for (let i = 0; i < outLength; i++) {
    const next = Math.floor((i + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let j = Math.floor(i * ratio); j < next && j < input.length; j++) {
      sum += input[j];
      count++;
    }
    out[i] = count > 0 ? sum / count : 0;
    offset = next;
  }
  void offset;
  return out;
}

const TARGET_RATE = 16000;

export class MicCapture {
  private ctx: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private muted = false;

  constructor(
    private readonly stream: MediaStream,
    private readonly onChunk: (base64: string) => void,
    private readonly onLevel?: (level: number) => void,
  ) {}

  start() {
    const Ctx: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctx();
    this.source = this.ctx.createMediaStreamSource(this.stream);
    // ScriptProcessor is deprecated but universally supported; fine for a demo
    // and avoids shipping a separate AudioWorklet module.
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (this.muted || !this.ctx) return;
      const input = e.inputBuffer.getChannelData(0);
      if (this.onLevel) {
        let peak = 0;
        for (let i = 0; i < input.length; i++) peak = Math.max(peak, Math.abs(input[i]));
        this.onLevel(peak);
      }
      const ds = downsample(input, this.ctx.sampleRate, TARGET_RATE);
      const pcm = floatTo16BitPCM(ds);
      this.onChunk(base64FromBytes(new Uint8Array(pcm.buffer)));
    };
    this.source.connect(this.processor);
    // Connect to a muted gain so the processor runs without echoing to output.
    const sink = this.ctx.createGain();
    sink.gain.value = 0;
    this.processor.connect(sink);
    sink.connect(this.ctx.destination);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  stop() {
    try {
      this.processor?.disconnect();
      this.source?.disconnect();
      void this.ctx?.close();
    } catch {
      /* noop */
    }
    this.processor = null;
    this.source = null;
    this.ctx = null;
  }
}

/** Schedules sequential 24 kHz PCM frames for gap-free playback. */
export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private playhead = 0;
  private gain: GainNode | null = null;

  constructor(private readonly sampleRate = 24000) {}

  private ensure() {
    if (this.ctx) return;
    const Ctx: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctx({ sampleRate: this.sampleRate });
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);
    this.playhead = this.ctx.currentTime;
  }

  enqueue(pcm: Int16Array): number {
    this.ensure();
    if (!this.ctx || !this.gain) return 0;
    const f32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 0x8000;
    const buffer = this.ctx.createBuffer(1, f32.length, this.sampleRate);
    buffer.copyToChannel(f32, 0);
    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(this.gain);
    const startAt = Math.max(this.playhead, this.ctx.currentTime);
    node.start(startAt);
    this.playhead = startAt + buffer.duration;
    return this.playhead - this.ctx.currentTime;
  }

  /** Barge-in: drop everything already scheduled. */
  flush() {
    if (!this.ctx) return;
    this.playhead = this.ctx.currentTime;
  }

  stop() {
    try {
      void this.ctx?.close();
    } catch {
      /* noop */
    }
    this.ctx = null;
    this.gain = null;
  }
}
