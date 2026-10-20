"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PERSONAS, PERSONA_ORDER, type PersonaId } from "@/lib/personas";
import { CHANNEL_META, type ClinicalEvent } from "@/lib/events";
import { useGeminiLive, type TimelineEvent } from "@/lib/gemini/useGeminiLive";
import type {
  ClientCredentials,
  ConnectionMode,
  ServerConfig,
  TranscriptEntry,
} from "@/lib/gemini/types";
import { SCRIPTS } from "./scripted";
import { CredentialsDrawer } from "./CredentialsDrawer";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Play,
  Sparkle,
  Gear,
  Heart,
  Leaf,
  Dot,
} from "@/components/icons";

type Mode = "idle" | "preview" | "live";
const TONE_CLASS: Record<string, string> = {
  navy: "bg-navy-50 text-navy",
  accent: "bg-[#fdf2e2] text-accent-700",
  cyan: "bg-cyan-50 text-cyan",
  ok: "bg-ok/12 text-ok",
};

export function StudioHero() {
  const [persona, setPersona] = useState<PersonaId>("counsellor");
  const [mode, setMode] = useState<Mode>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [credentials, setCredentials] = useState<ClientCredentials>({
    vertexLocation: "us-central1",
  });
  const [preferMode, setPreferMode] = useState<ConnectionMode | "auto">("auto");
  const [server, setServer] = useState<ServerConfig | null>(null);
  const [showCaptions, setShowCaptions] = useState(true);

  // scripted preview state
  const [pvTranscript, setPvTranscript] = useState<TranscriptEntry[]>([]);
  const [pvEvents, setPvEvents] = useState<TimelineEvent[]>([]);
  const [pvSpeaking, setPvSpeaking] = useState(false);
  const pvTimers = useRef<number[]>([]);

  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const live = useGeminiLive(avatarVideoRef);

  const p = PERSONAS[persona];

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d: ServerConfig) => setServer(d))
      .catch(() => setServer(null));
  }, []);

  // attach self-view stream
  useEffect(() => {
    if (selfVideoRef.current && live.selfStream) {
      selfVideoRef.current.srcObject = live.selfStream;
      void selfVideoRef.current.play().catch(() => {});
    }
  }, [live.selfStream]);

  const clearPreview = useCallback(() => {
    pvTimers.current.forEach((t) => window.clearTimeout(t));
    pvTimers.current = [];
  }, []);

  const startPreview = useCallback(
    (which: PersonaId) => {
      clearPreview();
      setMode("preview");
      setPvTranscript([]);
      setPvEvents([]);
      setPvSpeaking(false);
      const lines = SCRIPTS[which];
      let t = 600;
      lines.forEach((line, i) => {
        const dur = 1400 + line.text.length * 32;
        pvTimers.current.push(
          window.setTimeout(() => {
            setPvSpeaking(line.role === "specialist");
            setPvTranscript((prev) => [
              ...prev,
              {
                id: `pv-${i}`,
                role: line.role,
                text: line.text,
                final: true,
                at: Date.now(),
              },
            ]);
            if (line.event) {
              const ev: ClinicalEvent = line.event;
              const meta = CHANNEL_META[ev.channel];
              setPvEvents((prev) => [
                ...prev,
                {
                  ...ev,
                  key: `pv-ev-${i}`,
                  at: Date.now(),
                  channelName: meta.name,
                  tone: meta.tone,
                },
              ]);
            }
          }, t),
        );
        t += dur;
        pvTimers.current.push(
          window.setTimeout(() => setPvSpeaking(false), t - 250),
        );
      });
      pvTimers.current.push(window.setTimeout(() => setMode("idle"), t + 400));
    },
    [clearPreview],
  );

  const startLive = useCallback(async () => {
    clearPreview();
    setMode("live");
    await live.start({
      persona,
      avatarName: p.avatarName,
      voiceName: p.voiceName,
      credentials,
      server,
      preferMode: preferMode === "auto" ? undefined : preferMode,
    });
  }, [clearPreview, credentials, live, p.avatarName, p.voiceName, persona, preferMode, server]);

  const endSession = useCallback(() => {
    live.stop();
    clearPreview();
    setMode("idle");
  }, [clearPreview, live]);

  const switchPersona = useCallback(
    (id: PersonaId) => {
      if (mode === "live") endSession();
      else clearPreview();
      setMode("idle");
      setPersona(id);
    },
    [clearPreview, endSession, mode],
  );

  const isLive = mode === "live";
  const isPreview = mode === "preview";
  const transcript = isLive ? live.transcript : pvTranscript;
  const captionEntries = transcript.slice(-2);
  const events = isLive ? live.events : pvEvents;
  const speaking = isLive ? live.speaking : pvSpeaking;
  const videoLive = isLive && live.mode === "vertex-video" && live.status === "live";
  const PersonaIcon = persona === "counsellor" ? Heart : Leaf;

  return (
    <section id="studio" className="ambient-canvas scroll-mt-16">
      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] pb-12 pt-7 sm:pt-10">
        {/* hero copy — full width */}
        <div className="w-full">
          <span className="pill bg-white text-navy shadow-[var(--shadow-card)]">
            <Dot size={7} className="text-ok ax-live-dot" />
            Powered by Gemini 3.8 Live Avatar
          </span>
          <h1 className="mt-3.5 text-[34px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-[50px]">
            Hello! Meet your{" "}
            <span className="text-navy">AI Video Specialist</span>
          </h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted sm:text-[17px]">
            Real two-way video consultations with Apollo HealthAxis specialists —
            they see what you show, speak face-to-face in real time, and act
            through your hospital systems.
          </p>
        </div>

        {/* specialist selector */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {PERSONA_ORDER.map((id) => {
            const sp = PERSONAS[id];
            const active = id === persona;
            const Icon = id === "counsellor" ? Heart : Leaf;
            return (
              <button
                key={id}
                onClick={() => switchPersona(id)}
                className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-navy bg-white shadow-[var(--shadow-card)]"
                    : "border-line bg-white/60 hover:border-navy/40"
                }`}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{
                    background: `linear-gradient(145deg, ${sp.portrait.from}, ${sp.portrait.to})`,
                  }}
                >
                  <Icon size={20} />
                </span>
                <span className="pr-1">
                  <span className="block text-[14px] font-bold text-ink">
                    {sp.shortRole}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {sp.name} · {sp.gender === "male" ? "Male" : "Female"} avatar
                  </span>
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink-2 transition hover:border-navy/40"
          >
            <Gear size={16} /> Credentials &amp; Mode
          </button>
        </div>

        {/* studio — full-width video */}
        <div className="mt-5">
          {/* viewport */}
          <div className="relative overflow-hidden rounded-3xl border border-line bg-[#0b1620] shadow-[var(--shadow-float)]">
            <div className="relative aspect-[16/11] w-full sm:aspect-[16/9]">
              {/* real avatar video */}
              <video
                ref={avatarVideoRef}
                playsInline
                autoPlay
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoLive ? "opacity-100" : "opacity-0"}`}
              />

              {/* idle / preview / audio portrait */}
              {!videoLive && (
                <PortraitStage persona={persona} speaking={speaking} status={isLive ? live.status : mode} />
              )}

              {/* top status bar */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                  <PersonaIcon size={14} />
                  {p.name}
                </span>
                <StatusChip isLive={isLive} isPreview={isPreview} status={live.status} mode={live.mode} />
              </div>

              {/* caption overlay — YouTube CC style */}
              {showCaptions && captionEntries.length > 0 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 sm:bottom-5">
                  <div className="flex max-w-2xl flex-col items-center gap-1">
                    {captionEntries.map((e, i) => (
                      <p
                        key={e.id}
                        className={`rounded-md bg-black/70 px-3 py-1.5 text-center text-[13.5px] font-medium leading-snug text-white backdrop-blur-sm sm:text-[15px] ${
                          i < captionEntries.length - 1 ? "opacity-55" : "opacity-100"
                        }`}
                      >
                        <span
                          className={`mr-1.5 font-bold ${e.role === "patient" ? "text-teal" : "text-accent"}`}
                        >
                          {e.role === "patient"
                            ? "You"
                            : p.name.replace(/^(Dr\.|Dt\.)\s*/, "")}
                        </span>
                        {e.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* self view PiP */}
              {isLive && live.selfStream && (
                <div className="absolute bottom-4 right-4 h-28 w-20 overflow-hidden rounded-xl border-2 border-white/70 bg-black shadow-lg sm:h-32 sm:w-24">
                  <video
                    ref={selfVideoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`h-full w-full object-cover ${live.camMuted ? "opacity-0" : "opacity-100"}`}
                  />
                  {live.camMuted && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70">
                      <VideoOff size={20} />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    You
                  </span>
                </div>
              )}

              {/* error overlay */}
              {isLive && live.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-6 text-center backdrop-blur-sm">
                  <div className="max-w-sm">
                    <p className="text-[14px] font-semibold text-white">
                      Couldn&apos;t start the video session
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-white/80">
                      {live.error}
                    </p>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="mt-4 rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-ink"
                    >
                      Open Credentials &amp; Mode
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* control bar */}
            <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0b1620] px-4 py-3.5">
              {isLive ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <CtrlButton
                      active={!live.micMuted}
                      onClick={live.toggleMic}
                      on={<Mic size={18} />}
                      off={<MicOff size={18} />}
                      muted={live.micMuted}
                    />
                    <CtrlButton
                      active={!live.camMuted}
                      onClick={live.toggleCam}
                      on={<Video size={18} />}
                      off={<VideoOff size={18} />}
                      muted={live.camMuted}
                    />
                    <CcToggle on={showCaptions} onClick={() => setShowCaptions((v) => !v)} />
                  </div>
                  <MicMeter level={live.micLevel} muted={live.micMuted} />
                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 rounded-full bg-alert px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
                  >
                    <PhoneOff size={17} /> End
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startLive}
                    className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-navy-700"
                  >
                    <Video size={17} /> Start consultation
                  </button>
                  <button
                    onClick={() => startPreview(persona)}
                    disabled={isPreview}
                    className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <Play size={15} /> {isPreview ? "Playing preview…" : "Scripted preview"}
                  </button>
                  <div className="ml-auto">
                    <CcToggle on={showCaptions} onClick={() => setShowCaptions((v) => !v)} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* below video: clinical events + full transcript history */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <EventTimeline events={events} />
            <Transcript entries={transcript} personaName={p.name} speaking={speaking} />
          </div>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
          <span className="pill bg-white text-navy shadow-[var(--shadow-card)]">Synthetic data</span>
          Demonstration only — not medical advice. Camera &amp; microphone are
          used solely for the live session and are not recorded by this demo.
        </p>
      </div>

      <CredentialsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        credentials={credentials}
        onChange={setCredentials}
        preferMode={preferMode}
        onPreferMode={setPreferMode}
        server={server}
      />
    </section>
  );
}

/* ----------------------------- sub-components ---------------------------- */

function PortraitStage({
  persona,
  speaking,
  status,
}: {
  persona: PersonaId;
  speaking: boolean;
  status: string;
}) {
  const p = PERSONAS[persona];
  const initials = p.name
    .replace(/^(Dr\.|Dt\.)\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .join("");
  const connecting =
    status === "connecting" ||
    status === "minting-token" ||
    status === "requesting-media";
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(120% 90% at 50% 0%, ${p.portrait.from}26 0%, #0b1620 60%)`,
      }}
    >
      <div className="relative flex items-center justify-center">
        <div
          className={`absolute h-44 w-44 rounded-full ${speaking ? "ax-breathe" : "opacity-40"}`}
          style={{ background: `radial-gradient(circle, ${p.portrait.from}66, transparent 70%)` }}
        />
        <div
          className="relative flex h-32 w-32 items-center justify-center rounded-full text-[42px] font-extrabold text-white shadow-2xl"
          style={{
            background: `linear-gradient(145deg, ${p.portrait.from}, ${p.portrait.to})`,
          }}
        >
          {initials}
        </div>
      </div>
      <p className="mt-6 text-[15px] font-semibold text-white">{p.name}</p>
      <p className="text-[12.5px] text-white/60">{p.role}</p>

      {speaking ? (
        <div className="mt-4 flex items-end gap-1" aria-label="speaking">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-white/80"
              style={{
                height: 8 + (i % 2 === 0 ? 14 : 22),
                animation: `ax-eq 0.7s ease-in-out ${i * 0.09}s infinite alternate`,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[12px] text-white/50">
          {connecting ? "Connecting…" : "Ready when you are"}
        </p>
      )}
      <style jsx>{`
        @keyframes ax-eq {
          from {
            transform: scaleY(0.4);
          }
          to {
            transform: scaleY(1.3);
          }
        }
      `}</style>
    </div>
  );
}

function StatusChip({
  isLive,
  isPreview,
  status,
  mode,
}: {
  isLive: boolean;
  isPreview: boolean;
  status: string;
  mode: ConnectionMode | null;
}) {
  let label = "Ready";
  let dot = "text-white/50";
  if (isPreview) {
    label = "Scripted preview";
    dot = "text-accent";
  } else if (isLive) {
    if (status === "live") {
      label = mode === "vertex-video" ? "Live · Video avatar" : "Live · Voice + vision";
      dot = "text-ok ax-live-dot";
    } else if (status === "error") {
      label = "Error";
      dot = "text-alert";
    } else {
      label = "Connecting…";
      dot = "text-warn";
    }
  }
  return (
    <span className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11.5px] font-semibold text-white backdrop-blur">
      <Dot size={7} className={dot} />
      {label}
    </span>
  );
}

function CtrlButton({
  active,
  onClick,
  on,
  off,
  muted,
}: {
  active: boolean;
  onClick: () => void;
  on: React.ReactNode;
  off: React.ReactNode;
  muted: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
        muted
          ? "bg-alert/90 text-white"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
      aria-pressed={!active}
    >
      {muted ? off : on}
    </button>
  );
}

function CcToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title={on ? "Hide captions" : "Show captions"}
      className={`flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-bold transition ${
        on ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
      }`}
    >
      <span className="rounded border border-current px-1 text-[10px] leading-tight">
        CC
      </span>
    </button>
  );
}

function MicMeter({ level, muted }: { level: number; muted: boolean }) {
  const pct = muted ? 0 : Math.min(100, Math.round(level * 240));
  return (
    <div className="hidden flex-1 items-center gap-2 px-2 sm:flex">
      <Mic size={14} className="text-white/50" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-ok transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Transcript({
  entries,
  personaName,
  speaking,
}: {
  entries: TranscriptEntry[];
  personaName: string;
  speaking: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries, speaking]);
  return (
    <div className="flex min-h-[220px] flex-1 flex-col rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-[13.5px] font-bold text-ink">Live transcript</h3>
        <span className="pill bg-navy-50 text-navy">Real-time</span>
      </div>
      <div ref={scrollRef} className="ax-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {entries.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">
            The conversation will appear here as it happens.
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className={`ax-slide-in flex flex-col ${e.role === "patient" ? "items-end" : "items-start"}`}
          >
            <span className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted">
              {e.role === "patient" ? "You" : personaName}
            </span>
            <span
              className={`max-w-[90%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${
                e.role === "patient"
                  ? "bg-navy text-white"
                  : "bg-bg-soft text-ink-2"
              } ${e.final ? "" : "opacity-80"}`}
            >
              {e.text}
            </span>
          </div>
        ))}
        {speaking && (
          <div className="flex items-center gap-1.5 pl-1 text-muted">
            <span className="h-2 w-2 animate-bounce rounded-full bg-navy [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-navy [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-navy" />
          </div>
        )}
      </div>
    </div>
  );
}

function EventTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-[13.5px] font-bold text-ink">Clinical events</h3>
        <Sparkle size={16} className="text-accent" />
      </div>
      <div className="ax-scroll max-h-[180px] space-y-2 overflow-y-auto px-4 py-3">
        {events.length === 0 && (
          <p className="py-4 text-center text-[12.5px] text-muted">
            Tool-calls to HIS, EHR, Care Hub &amp; WhatsApp will fire here.
          </p>
        )}
        {events.map((ev) => (
          <div key={ev.key} className="ax-slide-in flex items-center gap-3">
            <span className={`pill ${TONE_CLASS[ev.tone] ?? TONE_CLASS.navy}`}>
              {ev.channelName}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">
                {ev.label}
              </p>
              <p className="truncate text-[11.5px] text-muted">{ev.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
