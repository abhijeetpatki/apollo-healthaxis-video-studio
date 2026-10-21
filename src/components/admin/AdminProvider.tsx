"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AdminContextValue {
  isAdmin: boolean;
  /** Whether the deployment enforces an admin gate at all. */
  required: boolean;
  checking: boolean;
  signIn: (passcode: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [required, setRequired] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin-session")
      .then((r) => r.json())
      .then((d: { admin?: boolean; required?: boolean }) => {
        if (!active) return;
        setIsAdmin(Boolean(d.admin));
        setRequired(d.required !== false);
      })
      .catch(() => {})
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (passcode: string) => {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      setIsAdmin(true);
      return null;
    }
    return data.error || "Sign-in failed.";
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/admin-logout", { method: "POST" }).catch(() => {});
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAdmin, required, checking, signIn, signOut }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
