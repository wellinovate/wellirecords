// Where the TikTok Pixel may run, and the visitor's saved choice. No React, so it can be tested on its own.
//
// The site also holds signed-in health records. The pixel is allowed on the public marketing and legal pages
// listed here and nowhere else. Anything not listed (sign-in, sign-up, /patient, /provider, share links,
// record links, invites, password reset) is blocked by default, so a new private route is safe without a change here.

export const CONSENT_KEY = "wr.tiktok.consent.v1";
export const OPEN_CONSENT_EVENT = "wr:open-tracking-consent";

export type Consent = "granted" | "denied";

const PUBLIC_EXACT = new Set([
  "/",
  "/home",
  "/how-it-works",
  "/partners",
  "/security",
  "/privacy",
  "/terms",
  "/about",
  "/support",
]);

export function isPublicPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (PUBLIC_EXACT.has(p)) return true;
  return /^\/blog\/[^/]+$/.test(p);
}

export function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked: the choice applies to this visit only */
  }
}
