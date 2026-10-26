// Pure helpers for the reviewer second step. No imports, so they run under plain `node --test`.
//
// The step-up token is a JWT the server issues after a correct authenticator or recovery code. It is sent on every
// reviewer request as `x-step-up-token`. The server is the only judge of whether it is valid; the expiry read here
// is just so the page can ask for a code again before a request fails.

export const STEP_UP_KEY = "wr.pv.stepup";
export const STEP_UP_HEADER = "x-step-up-token";

/** Codes the server sends when the second step is missing or not proved this session. */
export const STEP_UP_CODES = ["mfa_required", "mfa_enrol_required"] as const;
export type StepUpCode = (typeof STEP_UP_CODES)[number];

export const isStepUpCode = (code: unknown): code is StepUpCode =>
  typeof code === "string" && (STEP_UP_CODES as readonly string[]).includes(code);

/** Reads `exp` (seconds since 1970) from a JWT without checking its signature. Returns null if it can't. */
export function tokenExpiry(token: string | null | undefined): number | null {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const json = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
    const exp = JSON.parse(json)?.exp;
    return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
}

/** True when the token has an expiry that is more than `skewSeconds` away. A token with no readable expiry is not fresh. */
export function isFresh(token: string | null | undefined, nowMs: number = Date.now(), skewSeconds = 30): boolean {
  const exp = tokenExpiry(token);
  return exp !== null && exp * 1000 - nowMs > skewSeconds * 1000;
}

/** Minimal storage shape so tests can pass a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Wraps a store so every call is safe: private windows and blocked storage throw, and the page must still work. */
export function stepUpStore(store: KeyValueStore | null | undefined) {
  return {
    get(nowMs: number = Date.now()): string | null {
      try {
        const t = store?.getItem(STEP_UP_KEY) ?? null;
        if (t && isFresh(t, nowMs)) return t;
        if (t) store?.removeItem(STEP_UP_KEY);
      } catch { /* storage unavailable */ }
      return null;
    },
    set(token: string): void {
      try { store?.setItem(STEP_UP_KEY, token); } catch { /* storage unavailable */ }
    },
    clear(): void {
      try { store?.removeItem(STEP_UP_KEY); } catch { /* storage unavailable */ }
    },
  };
}

/** Groups a secret into blocks of four for typing into an authenticator app by hand. */
export const groupSecret = (secret: string): string => secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

/** Keeps only digits and caps the length, for the six-digit box. */
export const digitsOnly = (v: string, max = 6): string => v.replace(/\D/g, "").slice(0, max);
