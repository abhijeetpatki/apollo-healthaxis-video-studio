"use client";

import { useState } from "react";
import { useAdmin } from "./AdminProvider";
import { Check, Shield } from "@/components/icons";

export function AdminButton() {
  const { isAdmin, checking, signIn, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (checking) {
    return <span className="hidden h-9 w-16 animate-pulse rounded-lg bg-line sm:block" />;
  }

  if (isAdmin) {
    return (
      <button
        onClick={() => signOut()}
        className="hidden items-center gap-1.5 rounded-[10px] border border-ok/30 bg-ok/10 px-3 py-2 text-[13px] font-semibold text-ok transition hover:bg-ok/15 sm:inline-flex"
        title="Signed in as admin — click to sign out"
      >
        <Check size={15} /> Admin
      </button>
    );
  }

  const submit = async () => {
    setBusy(true);
    setErr(null);
    const e = await signIn(pass);
    setBusy(false);
    if (e) {
      setErr(e);
    } else {
      setOpen(false);
      setPass("");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-[10px] px-3.5 py-2 text-[14px] font-semibold text-ink-2 transition-colors hover:text-navy"
      >
        Sign in
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-float)]">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy">
                <Shield size={18} />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-ink">Admin sign-in</h3>
                <p className="text-[12px] text-muted">
                  Required to start a live consultation.
                </p>
              </div>
            </div>
            <input
              autoFocus
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && pass && submit()}
              placeholder="Enter admin passcode"
              className="mt-4 w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"
            />
            {err && <p className="mt-2 text-[12.5px] text-alert">{err}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-[10px] border border-line py-2.5 text-[13.5px] font-semibold text-ink-2 hover:bg-bg-soft"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy || !pass}
                className="flex-1 rounded-[10px] bg-navy py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-700 disabled:opacity-50"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
