"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PERSONAS, type PersonaId } from "../personas";
import {
  CHANNEL_META,
  EVENT_RULES,
  VERIFY_EVENT,
  type ClinicalEvent,
} from "../events";
import {
  AI_STUDIO_MODEL,
  aiStudioWsUrl,
  DEFAULT_LOCATION,
  vertexWsUrl,
} from "./constants";
import { LiveClient } from "./liveClient";
import { MicCapture, PcmPlayer } from "./audio";
import { AvatarVideoPlayer, CameraFrameCapture } from "./video";
import type {
  ClientCredentials,
  ConnectionMode,
  ServerConfig,
  SessionStatus,
  TranscriptEntry,
} from "./types";

export interface TimelineEvent extends ClinicalEvent {
  key: string;
  at: number;
  channelName: string;
  tone: string;
}

export interface UseGeminiLiveState {
  status: SessionStatus;
  mode: ConnectionMode | null;
  speaking: boolean;
  transcript: TranscriptEntry[];
  events: TimelineEvent[];
  error: string | null;
  micMuted: boolean;
  camMuted: boolean;
  micLevel: number;
  selfStream: MediaStream | null;
}

export interface StartParams {
  persona: PersonaId;
  avatarName: string;
  voiceName: string;
  credentials: ClientCredentials;
  server: ServerConfig | null;
  preferMode?: ConnectionMode;
}

let idCounter = 0;
const uid = () => `${Date.now()}-${idCounter++}`;

export function useGeminiLive(avatarVideoRef: React.RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [mode, setMode] = useState<ConnectionMode | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camMuted, setCamMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [selfStream, setSelfStream] = useState<MediaStream | null>(null);

  const clientRef = useRef<LiveClient | null>(null);
  const micRef = useRef<MicCapture | null>(null);
  const camRef = useRef<CameraFrameCapture | null>(null);
  const playerRef = useRef<AvatarVideoPlayer | null>(null);
  const pcmRef = useRef<PcmPlayer | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const firedEvents = useRef<Set<string>>(new Set());
  const curPatient = useRef<string | null>(null);
  const curSpecialist = useRef<string | null>(null);
  const specialistBuffer = useRef<string>("");
  const personaRef = useRef<PersonaId>("counsellor");

  const pushEvent = useCallback((ev: ClinicalEvent) => {
    if (firedEvents.current.has(ev.id)) return;
    firedEvents.current.add(ev.id);
    const meta = CHANNEL_META[ev.channel];
    setEvents((prev) => [
      ...prev,
      { ...ev, key: uid(), at: Date.now(), channelName: meta.name, tone: meta.tone },
    ]);
  }, []);

  const evalEventRules = useCallback(
    (text: string) => {
      const persona = personaRef.current;
      for (const rule of EVENT_RULES) {
        if (rule.personas && !rule.personas.includes(persona)) continue;
        if (firedEvents.current.has(rule.event.id)) continue;
        if (rule.match.test(text)) pushEvent(rule.event);
      }
    },
    [pushEvent],
  );

  const appendTranscript = useCallback(
    (role: "patient" | "specialist", chunk: string) => {
      const ref = role === "patient" ? curPatient : curSpecialist;
      setTranscript((prev) => {
        const next = [...prev];
        const existingIdx = ref.current
          ? next.findIndex((e) => e.id === ref.current)
          : -1;
        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            text: next[existingIdx].text + chunk,
          };
        } else {
          const id = uid();
          ref.current = id;
          next.push({ id, role, text: chunk, final: false, at: Date.now() });
        }
        return next;
      });
      if (role === "specialist") {
        specialistBuffer.current += chunk;
        evalEventRules(specialistBuffer.current);
      }
    },
    [evalEventRules],
  );

  const finalizeTurn = useCallback(() => {
    setTranscript((prev) =>
      prev.map((e) =>
        e.id === curPatient.current || e.id === curSpecialist.current
          ? { ...e, final: true }
          : e,
      ),
    );
    curPatient.current = null;
    curSpecialist.current = null;
    specialistBuffer.current = "";
    setSpeaking(false);
  }, []);

  const teardown = useCallback(() => {
    micRef.current?.stop();
    camRef.current?.stop();
    playerRef.current?.destroy();
    pcmRef.current?.stop();
    clientRef.current?.close();
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    camRef.current = null;
    playerRef.current = null;
    pcmRef.current = null;
    clientRef.current = null;
    mediaRef.current = null;
    setSelfStream(null);
  }, []);

  const stop = useCallback(() => {
    teardown();
    setStatus("ended");
    setSpeaking(false);
    setMicLevel(0);
  }, [teardown]);

  const resolveMode = useCallback(
    (p: StartParams): ConnectionMode | { error: string } => {
      const vertexReady =
        Boolean(p.credentials.vertexAccessToken) ||
        Boolean(p.credentials.serviceAccountJson && p.credentials.vertexProject) ||
        Boolean(p.server?.vertexConfigured);
      const aiReady =
        Boolean(p.credentials.geminiApiKey) ||
        Boolean(p.server?.aiStudioConfigured);

      if (p.preferMode === "vertex-video" && vertexReady) return "vertex-video";
      if (p.preferMode === "aistudio-audio" && aiReady) return "aistudio-audio";
      if (vertexReady) return "vertex-video";
      if (aiReady) return "aistudio-audio";
      return {
        error:
          "No credentials configured. Open ‘Credentials & Mode’ and add a GCP project + service account (for video) or a Gemini API key (for voice + vision).",
      };
    },
    [],
  );

  const start = useCallback(
    async (p: StartParams) => {
      setError(null);
      firedEvents.current = new Set();
      setEvents([]);
      setTranscript([]);
      curPatient.current = null;
      curSpecialist.current = null;
      specialistBuffer.current = "";
      personaRef.current = p.persona;

      const resolved = resolveMode(p);
      if (typeof resolved !== "string") {
        setStatus("error");
        setError(resolved.error);
        return;
      }
      const chosen = resolved;
      setMode(chosen);

      // 1. media
      setStatus("requesting-media");
      let media: MediaStream;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        });
      } catch {
        setStatus("error");
        setError("Camera & microphone access is required for a consultation.");
        return;
      }
      mediaRef.current = media;
      setSelfStream(media);

      const audioStream = new MediaStream(media.getAudioTracks());
      const videoStream = new MediaStream(media.getVideoTracks());

      // 2. token
      setStatus("minting-token");
      let url = "";
      let modelPath = "";
      try {
        if (chosen === "vertex-video") {
          const res = await fetch("/api/vertex-token", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              project: p.credentials.vertexProject,
              serviceAccountJson: p.credentials.serviceAccountJson,
              accessToken: p.credentials.vertexAccessToken,
              location: p.credentials.vertexLocation || DEFAULT_LOCATION,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "token error");
          url = vertexWsUrl(data.location, data.token);
          modelPath = data.model;
        } else {
          let key = p.credentials.geminiApiKey;
          let accessToken: string | undefined;
          if (!key) {
            const res = await fetch("/api/token", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "token error");
            accessToken = data.token;
          }
          url = aiStudioWsUrl({ key, accessToken });
          modelPath = AI_STUDIO_MODEL;
        }
      } catch (err) {
        teardown();
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to authorize session.");
        return;
      }

      // 3. players
      if (chosen === "vertex-video" && avatarVideoRef.current) {
        const player = new AvatarVideoPlayer(avatarVideoRef.current);
        player.init();
        playerRef.current = player;
      } else {
        pcmRef.current = new PcmPlayer(24000);
      }

      // 4. live client
      const persona = PERSONAS[p.persona];
      setStatus("connecting");
      const client = new LiveClient(
        {
          transport: chosen === "vertex-video" ? "vertex" : "aistudio",
          url,
          model: modelPath,
          responseModality: chosen === "vertex-video" ? "VIDEO" : "AUDIO",
          voiceName: p.voiceName,
          avatarName: chosen === "vertex-video" ? p.avatarName : undefined,
          systemInstruction: persona.systemInstruction,
          kickoff:
            "The consultation is starting and the patient's camera and microphone are now live. Greet the patient warmly by introducing yourself, then begin.",
        },
        {
          onOpen: () => setStatus("connecting"),
          onSetupComplete: () => {
            setStatus("live");
            pushEvent(VERIFY_EVENT);
            client.sendKickoff();
            // start streaming patient media
            const mic = new MicCapture(
              audioStream,
              (b64) => client.sendAudio(b64),
              (level) => setMicLevel(level),
            );
            mic.start();
            micRef.current = mic;
            const cam = new CameraFrameCapture(videoStream, (jpeg) =>
              client.sendVideoFrame(jpeg),
            );
            void cam.start();
            camRef.current = cam;
          },
          onVideoChunk: (bytes) => playerRef.current?.append(bytes),
          onAudioChunk: (pcm) => pcmRef.current?.enqueue(pcm),
          onInputTranscript: (t) => appendTranscript("patient", t),
          onOutputTranscript: (t) => appendTranscript("specialist", t),
          onActivity: () => setSpeaking(true),
          onTurnComplete: () => finalizeTurn(),
          onInterrupted: () => {
            pcmRef.current?.flush();
            playerRef.current?.jumpToLiveEdge();
            setSpeaking(false);
          },
          onClose: (code, reason) => {
            if (code !== 1000) {
              setStatus("error");
              setError(
                `Session closed (${code})${reason ? `: ${reason}` : ""}. ` +
                  "Verify Live Avatar entitlement, region and credentials.",
              );
            } else {
              setStatus("ended");
            }
          },
          onError: (message) => {
            setStatus("error");
            setError(message);
          },
        },
      );
      clientRef.current = client;
      client.connect();
    },
    [appendTranscript, avatarVideoRef, finalizeTurn, pushEvent, resolveMode, teardown],
  );

  const toggleMic = useCallback(() => {
    setMicMuted((m) => {
      const next = !m;
      micRef.current?.setMuted(next);
      mediaRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  }, []);

  const toggleCam = useCallback(() => {
    setCamMuted((c) => {
      const next = !c;
      camRef.current?.setMuted(next);
      mediaRef.current?.getVideoTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  }, []);

  const sendText = useCallback((text: string) => {
    clientRef.current?.sendText(text);
    const id = uid();
    curPatient.current = id;
    setTranscript((prev) => [
      ...prev,
      { id, role: "patient", text, final: true, at: Date.now() },
    ]);
    curPatient.current = null;
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  const state: UseGeminiLiveState = {
    status,
    mode,
    speaking,
    transcript,
    events,
    error,
    micMuted,
    camMuted,
    micLevel,
    selfStream,
  };

  return { ...state, start, stop, toggleMic, toggleCam, sendText };
}
