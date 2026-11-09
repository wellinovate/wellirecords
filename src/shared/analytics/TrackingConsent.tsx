import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GTM_ID,
  OPEN_CONSENT_EVENT,
  isPublicPath,
  readConsent,
  saveConsent,
  type Consent,
} from "./trackingPolicy";

declare global {
  interface Window {
    dataLayer?: unknown[];
    ttq?: {
      page: () => void;
      grantConsent: () => void;
      revokeConsent: () => void;
    };
  }
}

/**
 * Loads the TikTok Pixel (public/tiktok-pixel.js) and Google Tag Manager on public pages only, and only after the
 * visitor accepts. Before that, neither TikTok nor Google is contacted.
 * Neither script can be unloaded, so if the visitor declines later or moves to a sign-in or signed-in page after
 * accepting, the page is reloaded without them. That keeps a tag in the container from running on private pages.
 */
export default function TrackingConsent() {
  const { pathname } = useLocation();
  const publicPage = isPublicPath(pathname);
  const [choice, setChoice] = useState<Consent | null>(() => readConsent());
  const [reopened, setReopened] = useState(false);
  const [tiktokReady, setTiktokReady] = useState(false);
  const started = useRef(false);
  const lastPage = useRef<string | null>(null);
  const allowed = publicPage && choice === "granted";

  // Load both scripts once, after the visitor accepts on a public page.
  useEffect(() => {
    if (!allowed || started.current) return;
    started.current = true;
    lastPage.current = pathname; // each script sends its own first page view

    // Google Tag Manager: the standard start event, then the container.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const g = document.createElement("script");
    g.async = true;
    g.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(g);

    // TikTok Pixel.
    const t = document.createElement("script");
    t.src = "/tiktok-pixel.js";
    t.async = true;
    t.onload = () => setTiktokReady(true);
    document.body.appendChild(t);
  }, [allowed, pathname]);

  // Once loaded, a visitor who declines or leaves the public pages gets a clean page.
  useEffect(() => {
    if (started.current && !allowed) window.location.reload();
  }, [allowed]);

  // Tell TikTok the visitor accepted, and report page changes inside the app (the scripts only see the first load).
  useEffect(() => {
    if (!allowed || !started.current) return;
    if (tiktokReady && window.ttq) window.ttq.grantConsent();
    if (lastPage.current === pathname) return;
    lastPage.current = pathname;
    window.dataLayer?.push({
      event: "virtual_page_view",
      page_path: pathname,
      page_title: document.title,
    });
    window.ttq?.page();
  }, [allowed, tiktokReady, pathname]);

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
        We use Google Tag Manager and the TikTok Pixel on our public pages to measure visits and whether our ads
        work. They do not run on sign-in or signed-in pages. Nothing is sent to Google or TikTok unless you accept.{" "}
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
