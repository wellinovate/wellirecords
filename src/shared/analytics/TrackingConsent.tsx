import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  OPEN_CONSENT_EVENT,
  isPublicPath,
  readConsent,
  saveConsent,
  type Consent,
} from "./trackingPolicy";

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      grantConsent: () => void;
      revokeConsent: () => void;
    };
  }
}

/**
 * Loads the TikTok Pixel (public/tiktok-pixel.js) on public pages only, and tells it what the visitor chose.
 * The script is not requested until the visitor accepts, so TikTok is not contacted before that.
 * Signed-in and sign-in pages never load it; if it was loaded earlier in the visit, consent is withdrawn there.
 */
export default function TrackingConsent() {
  const { pathname } = useLocation();
  const publicPage = isPublicPath(pathname);
  const [choice, setChoice] = useState<Consent | null>(() => readConsent());
  const [reopened, setReopened] = useState(false);
  const [ready, setReady] = useState(false);
  const started = useRef(false);
  const lastPage = useRef<string | null>(null);

  // Load the pixel only after the visitor accepts, on a public page. Before that, TikTok is not contacted at all.
  useEffect(() => {
    if (!publicPage || choice !== "granted" || started.current) return;
    started.current = true;
    lastPage.current = pathname; // the script sends its own first page view
    const s = document.createElement("script");
    s.src = "/tiktok-pixel.js";
    s.async = true;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
  }, [publicPage, choice, pathname]);

  // Apply the choice. Only an accepted visitor on a public page is tracked.
  useEffect(() => {
    if (!ready || !window.ttq) return;
    if (publicPage && choice === "granted") {
      window.ttq.grantConsent();
      if (lastPage.current !== pathname) window.ttq.page();
      lastPage.current = pathname;
    } else {
      window.ttq.revokeConsent();
      if (!publicPage) lastPage.current = null;
    }
  }, [ready, publicPage, choice, pathname]);

  // The footer's "Cookie choices" link reopens the banner.
  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  if (!publicPage || (choice !== null && !reopened)) return null;

  const decide = (value: Consent) => {
    saveConsent(value);
    setChoice(value);
    setReopened(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:rounded-xl sm:border"
    >
      <p className="text-sm leading-6 text-slate-700">
        We use the TikTok Pixel on our public pages to measure whether our TikTok ads work. It does not run on
        sign-in or signed-in pages. Nothing is sent to TikTok unless you accept.{" "}
        <Link to="/privacy#advertising" className="text-[#1e3a8a] underline">
          Read the privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b3277]"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
