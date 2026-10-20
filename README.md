# Apollo HealthAxis — AI Video Consultation Studio

Production-ready **Next.js (App Router + TypeScript + Tailwind v4)** studio for
**two-way AI video consultations** powered by **Gemini 3.8 Live Avatar**.

Two specialist video rooms:

| Specialist | Role | Avatar | Voice |
| --- | --- | --- | --- |
| **Dr. Aarav Mehta** | Psychological Counsellor & CBT Specialist | `Ben` (male) | `Puck` |
| **Dt. Ananya Sharma** | Clinical Dietician & Metabolic Nutritionist | `Kira` (female) | `Aoede` |

## How the video avatar works

In **Vertex AI** `gemini-3.8-live` with Live Avatar, the model returns
`responseModalities: ["VIDEO"]` — a continuous **fragmented MP4** stream
(H.264 video + AAC-LC audio muxed together, 24 FPS) over the bidirectional
`BidiGenerateContent` WebSocket. The browser feeds those chunks into a
`MediaSource` `SourceBuffer` attached to a `<video>` element for real-time,
lip-synced playback. On barge-in (`interrupted: true`) playback jumps to the
live buffered edge so interruption feels instant.

The patient side streams **16 kHz PCM mic audio** and **~1 FPS 768×768 JPEG
webcam frames** via `realtimeInput.mediaChunks`, so the specialist genuinely
sees the patient, a meal, a food label, or a glucometer reading.

### Two auth paths (both supported, with graceful fallback)

1. **Vertex AI (video avatar)** — `/api/vertex-token` mints a short-lived GCP
   OAuth2 access token (`cloud-platform` scope) from a service account, and the
   browser connects directly to
   `wss://{location}-aiplatform.googleapis.com/ws/.../BidiGenerateContent`.
2. **AI Studio (voice + vision fallback)** — `/api/token` mints an ephemeral
   token from `GEMINI_API_KEY`; the studio runs audio + vision with an animated
   clinical portrait when video isn't entitled, so the demo never crashes.

Credentials can be set as **Vercel env vars** *or* pasted at runtime in the
in-app **Credentials & Mode** drawer for instant testing.

## Environment variables

See [`.env.example`](./.env.example):

- `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `GOOGLE_CLOUD_PROJECT`,
  `GOOGLE_CLOUD_LOCATION` — Vertex AI video avatar.
- `GEMINI_API_KEY` — AI Studio voice + vision fallback.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in credentials
npm run dev
```

## Deploy

```bash
npm run build
vercel --prod --yes
```

Then add the environment variables in the Vercel dashboard (Project → Settings
→ Environment Variables).

> **Demonstration only.** Avatars, voices and patient data are synthetic. This
> is not a medical device and does not provide medical advice. Red-flag inputs
> escalate to a human clinician via the Care Coordination Hub.
