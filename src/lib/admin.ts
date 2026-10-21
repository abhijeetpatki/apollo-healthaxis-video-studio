import crypto from "crypto";

/**
 * Minimal, stateless admin gate.
 *
 * A signed cookie proves the visitor entered the ADMIN_PASSCODE. The server's
 * own Vertex / AI Studio credentials (which draw on the owner's billing) are
 * only usable by a signed-in admin. Guests must bring their own credentials.
 *
 * If ADMIN_PASSCODE is unset (e.g. local dev) the gate is disabled.
 */

export const ADMIN_COOKIE = "ax_admin";
const PAYLOAD = "apollo-admin-v1";

function secret(): string {
  return process.env.ADMIN_PASSCODE || "";
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSCODE);
}

export function makeToken(): string {
  return crypto.createHmac("sha256", secret()).update(PAYLOAD).digest("hex");
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token || !secret()) return false;
  const expected = makeToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
