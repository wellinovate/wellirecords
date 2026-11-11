import { FaGooglePlay } from "react-icons/fa";

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.wellirecord.app";

type Props = {
  /** "dark" for light backgrounds, "light" for the navy banner. */
  tone?: "dark" | "light";
  className?: string;
};

/** Link to the Android app on Google Play. Opens in a new tab. */
export default function PlayStoreButton({ tone = "dark", className = "" }: Props) {
  const colours =
    tone === "light"
      ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
      : "border border-slate-300 bg-white text-[#071B3F] hover:bg-slate-50";
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download the WelliRecord Android app on Google Play"
      className={`inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3 text-left transition-all whitespace-nowrap ${colours} ${className}`}
    >
      <FaGooglePlay className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Get it on</span>
        <span className="text-base font-bold">Google Play</span>
      </span>
    </a>
  );
}
