"use client";

import { useState } from "react";
import type { ClientCredentials, ConnectionMode, ServerConfig } from "@/lib/gemini/types";
import { Gear, Check } from "@/components/icons";

interface Props {
  open: boolean;
  onClose: () => void;
  credentials: ClientCredentials;
  onChange: (c: ClientCredentials) => void;
  preferMode: ConnectionMode | "auto";
  onPreferMode: (m: ConnectionMode | "auto") => void;
  server: ServerConfig | null;
}

export function CredentialsDrawer({
  open,
  onClose,
  credentials,
  onChange,
  preferMode,
  onPreferMode,
  server,
}: Props) {
  const [showSa, setShowSa] = useState(false);
  const set = (patch: Partial<ClientCredentials>) =>
    onChange({ ...credentials, ...patch });

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-[var(--shadow-float)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            <Gear size={18} className="text-navy" />
            <h3 className="text-[16px] font-bold text-ink">Credentials &amp; Mode</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-[13px] font-semibold text-muted hover:bg-bg-soft"
          >
            Close
          </button>
        </div>

        <div className="ax-scroll flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* server status */}
          <div className="rounded-xl border border-line bg-bg-soft p-4 text-[13px]">
            <p className="font-semibold text-ink">Server configuration</p>
            <ul className="mt-2 space-y-1.5">
              <StatusRow ok={!!server?.vertexConfigured} label="Vertex AI (video avatar) env" />
              <StatusRow ok={!!server?.aiStudioConfigured} label="AI Studio key (voice + vision) env" />
            </ul>
            <p className="mt-2 text-[11.5px] leading-snug text-muted">
              Model: <code className="text-ink-2">{server?.model ?? "gemini-3.8-live"}</code>{" "}
              · Region: <code className="text-ink-2">{server?.defaultLocation ?? "us-central1"}</code>
            </p>
          </div>

          {/* mode */}
          <Field label="Preferred mode">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["auto", "Auto"],
                  ["vertex-video", "Video"],
                  ["aistudio-audio", "Voice"],
                ] as const
              ).map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => onPreferMode(val)}
                  className={`rounded-lg border px-2 py-2 text-[12.5px] font-semibold transition ${
                    preferMode === val
                      ? "border-navy bg-navy text-white"
                      : "border-line bg-white text-ink-2 hover:border-navy/50"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </Field>

          {/* vertex */}
          <div className="space-y-3 rounded-xl border border-line p-4">
            <p className="text-[13px] font-bold text-navy">
              Vertex AI — two-way video avatar
            </p>
            <Field label="GCP Project ID">
              <input
                value={credentials.vertexProject ?? ""}
                onChange={(e) => set({ vertexProject: e.target.value })}
                placeholder="my-gcp-project"
                className="ax-input"
              />
            </Field>
            <Field label="Location">
              <input
                value={credentials.vertexLocation ?? ""}
                onChange={(e) => set({ vertexLocation: e.target.value })}
                placeholder="us-central1"
                className="ax-input"
              />
            </Field>
            <Field
              label="Service Account JSON"
              hint="Posted to this app's /api/vertex-token only to mint a short-lived token. Never stored."
            >
              {showSa ? (
                <textarea
                  value={credentials.serviceAccountJson ?? ""}
                  onChange={(e) => set({ serviceAccountJson: e.target.value })}
                  placeholder='{ "type": "service_account", ... }'
                  rows={5}
                  className="ax-input font-mono text-[11.5px]"
                />
              ) : (
                <button
                  onClick={() => setShowSa(true)}
                  className="w-full rounded-lg border border-dashed border-line-2 px-3 py-2 text-[12.5px] font-medium text-muted hover:border-navy/50"
                >
                  {credentials.serviceAccountJson ? "JSON added — click to edit" : "Paste service account JSON"}
                </button>
              )}
            </Field>
            <Field label="…or paste an OAuth access token">
              <input
                value={credentials.vertexAccessToken ?? ""}
                onChange={(e) => set({ vertexAccessToken: e.target.value })}
                placeholder="ya29.…"
                className="ax-input"
              />
            </Field>
          </div>

          {/* ai studio */}
          <div className="space-y-3 rounded-xl border border-line p-4">
            <p className="text-[13px] font-bold text-accent-700">
              AI Studio — voice + vision fallback
            </p>
            <Field
              label="Gemini API Key"
              hint="Used directly from the browser for the fallback path. Optional if a server key is configured."
            >
              <input
                value={credentials.geminiApiKey ?? ""}
                onChange={(e) => set({ geminiApiKey: e.target.value })}
                placeholder="AIza…"
                type="password"
                className="ax-input"
              />
            </Field>
          </div>

          <p className="text-[11.5px] leading-relaxed text-muted">
            Credentials entered here live only in this browser tab for this
            session. For production, set{" "}
            <code className="text-ink-2">GOOGLE_CLOUD_PROJECT</code>,{" "}
            <code className="text-ink-2">GOOGLE_APPLICATION_CREDENTIALS_JSON</code>{" "}
            and <code className="text-ink-2">GEMINI_API_KEY</code> as Vercel
            environment variables.
          </p>
        </div>

        <div className="border-t border-line px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-[10px] bg-navy py-3 text-[14px] font-semibold text-white hover:bg-navy-700"
          >
            Save &amp; close
          </button>
        </div>
      </aside>

      <style jsx global>{`
        .ax-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid var(--color-line);
          background: #fff;
          padding: 9px 12px;
          font-size: 13.5px;
          color: var(--color-ink);
          outline: none;
        }
        .ax-input:focus {
          border-color: var(--color-navy);
          box-shadow: 0 0 0 3px #1d68821f;
        }
      `}</style>
    </div>
  );
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[12.5px]">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${ok ? "bg-ok/15 text-ok" : "bg-line text-muted"}`}
      >
        {ok ? <Check size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-muted" />}
      </span>
      <span className={ok ? "text-ink-2" : "text-muted"}>{label}</span>
    </li>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-ink-2">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-muted">{hint}</span>}
    </label>
  );
}
