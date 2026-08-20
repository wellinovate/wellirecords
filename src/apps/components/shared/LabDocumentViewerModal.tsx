import { useState } from "react";
import { X, Printer, Share2, Download, Loader2, AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
};

// Replaces the old behaviour where "View Document" was a plain
// <a target="_blank"> straight to the Cloudinary URL — whatever the
// browser's native handling did with it, no view/print/share affordances
// inside the app itself. This renders the document inline (an <iframe>
// handles both PDF and image attachments — browsers render PDFs natively
// inside an iframe without needing a PDF.js dependency) and adds real
// print/share/download actions.
export function LabDocumentViewerModal({ open, url, title, onClose }: Props) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!open) return null;

  const handlePrint = () => {
    // Printing an iframe's own content (rather than window.print() on
    // the host page) is what makes this print the document itself, not
    // the surrounding app chrome. Opening in a hidden-ish new window
    // and calling print() on it is the most reliable cross-browser way
    // to do this for a cross-origin PDF — a same-page iframe's
    // contentWindow.print() is blocked by most browsers for
    // cross-origin content, which this always is (Cloudinary's domain,
    // not wellirecord.com).
    const printWindow = window.open(url, "_blank");
    if (!printWindow) return;
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Lab result document",
          url,
        });
        return;
      } catch {
        // User cancelled the native share sheet, or the platform
        // rejected it — fall through to the clipboard fallback below
        // rather than leaving the button looking like it did nothing.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    } catch {
      alert("Couldn't copy the link automatically — you can copy it from the address bar after opening it.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "rgba(30,58,138,0.1)" }}
        >
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold" style={{ color: "#1a2e1e" }}>
              {title || "Lab result document"}
            </h2>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button
              onClick={handlePrint}
              disabled={loadFailed}
              title="Print"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "rgba(30,58,138,0.15)", color: "#1e3a8a" }}
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleShare}
              title="Share"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm"
              style={{ borderColor: "rgba(30,58,138,0.15)", color: "#1e3a8a" }}
            >
              <Share2 size={16} />
            </button>
            <a
              href={url}
              download
              title="Download"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm"
              style={{ borderColor: "rgba(30,58,138,0.15)", color: "#1e3a8a" }}
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-gray-50">
          {!loaded && !loadFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ color: "#5a7a63" }}>
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs">Loading document…</span>
            </div>
          )}

          {loadFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <AlertTriangle size={24} className="text-amber-500" />
              <p className="text-sm font-semibold" style={{ color: "#1a2e1e" }}>
                Couldn't load this document
              </p>
              <p className="max-w-sm text-xs" style={{ color: "#5a7a63" }}>
                The file couldn't be displayed here. It may still be reachable directly.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Try opening it in a new tab
              </a>
            </div>
          )}

          <iframe
            src={url}
            title={title || "Lab result document"}
            className="h-full w-full border-0"
            style={{ visibility: loaded ? "visible" : "hidden" }}
            onLoad={() => setLoaded(true)}
            onError={() => setLoadFailed(true)}
          />
        </div>
      </div>
    </div>
  );
}
