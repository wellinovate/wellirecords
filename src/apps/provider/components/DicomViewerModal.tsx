import React, { useEffect, useRef, useState } from "react";
import { App, AppOptions, ViewConfig, ToolConfig } from "dwv";
import { X, ZoomIn, Move, Layers, RotateCcw, Loader2, AlertTriangle } from "lucide-react";

// Renders a single DICOM file inline using dwv (github.com/ivmartel/dwv).
//
// Decoder worker note: dwv needs separate worker scripts to decode
// compressed transfer syntaxes (JPEG2000, JPEG lossless/baseline, RLE).
// Those worker files are committed at
// public/assets/assets/workers/ — see the README.md there for why the
// path is nested like that. Uncompressed DICOM (the common case for
// most diagnostic equipment exports) decodes fine without them; a
// compressed file with those workers unreachable will fail to render
// and this component surfaces that as a load error rather than hanging.
//
// Known limitation: in local dev (`npm run dev`), Vite does not serve
// these workers the same way it does in a production build — this is
// a documented dwv/Vite interaction, not specific to this app. It only
// affects compressed DICOM in local dev; production (Vercel) builds
// are unaffected — verified via `npm run build`.

type Props = {
  url: string;
  filename?: string | null;
  onClose: () => void;
};

type LoadState = "loading" | "loaded" | "error";

export function DicomViewerModal({ url, filename, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTool, setActiveTool] = useState<"WindowLevel" | "ZoomAndPan" | "Scroll">("WindowLevel");

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App();
    appRef.current = app;

    const viewConfig0 = new ViewConfig("dwv-layer-group");
    const options = new AppOptions({ "*": [viewConfig0] });
    options.tools = {
      WindowLevel: new ToolConfig(),
      ZoomAndPan: new ToolConfig(),
      Scroll: new ToolConfig(),
    };

    app.init(options);

    const handleProgress = (event: any) => {
      if (typeof event?.loaded === "number") setProgress(event.loaded);
    };
    const handleLoadEnd = () => {
      setState("loaded");
      app.setTool("WindowLevel");
    };
    const handleError = (event: any) => {
      console.error("DICOM load error:", event);
      setErrorMessage(
        event?.error?.message ||
          "Couldn't decode this file. It may use a compressed format that isn't supported, or isn't a valid DICOM file.",
      );
      setState("error");
    };

    app.addEventListener("loadprogress", handleProgress);
    app.addEventListener("loadend", handleLoadEnd);
    app.addEventListener("error", handleError);

    app.loadURLs([url]);

    return () => {
      app.removeEventListener("loadprogress", handleProgress);
      app.removeEventListener("loadend", handleLoadEnd);
      app.removeEventListener("error", handleError);
      app.abortAllLoads();
      app.reset();
      appRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleToolChange = (tool: "WindowLevel" | "ZoomAndPan" | "Scroll") => {
    setActiveTool(tool);
    appRef.current?.setTool(tool);
  };

  const handleReset = () => {
    appRef.current?.resetZoomPan();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{filename || "DICOM file"}</p>
            <p className="text-[11px] text-slate-500">Viewer is not certified for diagnostic use — for reference alongside the report</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0 ml-3">
            <X size={20} />
          </button>
        </div>

        {state === "loaded" && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
            <button
              onClick={() => handleToolChange("WindowLevel")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{
                background: activeTool === "WindowLevel" ? "rgba(109,40,217,0.25)" : "rgba(255,255,255,0.05)",
                color: activeTool === "WindowLevel" ? "#c4b5fd" : "#94a3b8",
              }}
            >
              <Layers size={12} /> Contrast
            </button>
            <button
              onClick={() => handleToolChange("ZoomAndPan")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{
                background: activeTool === "ZoomAndPan" ? "rgba(109,40,217,0.25)" : "rgba(255,255,255,0.05)",
                color: activeTool === "ZoomAndPan" ? "#c4b5fd" : "#94a3b8",
              }}
            >
              <ZoomIn size={12} /> Zoom / Pan
            </button>
            <button
              onClick={() => handleToolChange("Scroll")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{
                background: activeTool === "Scroll" ? "rgba(109,40,217,0.25)" : "rgba(255,255,255,0.05)",
                color: activeTool === "Scroll" ? "#c4b5fd" : "#94a3b8",
              }}
            >
              <Move size={12} /> Scroll frames
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ml-auto"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
            >
              <RotateCcw size={12} /> Reset view
            </button>
          </div>
        )}

        <div className="relative flex-1 bg-black">
          {state === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-xs">{progress > 0 ? `Loading… ${progress}%` : "Loading…"}</p>
            </div>
          )}

          {state === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
              <AlertTriangle size={28} className="text-amber-400" />
              <p className="text-sm font-semibold text-white">Couldn't display this file</p>
              <p className="text-xs text-slate-400 max-w-sm">{errorMessage}</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-purple-300 hover:underline"
              >
                Download the file instead
              </a>
            </div>
          )}

          <div
            id="dwv-layer-group"
            ref={containerRef}
            className="w-full h-full"
            style={{ visibility: state === "loaded" ? "visible" : "hidden" }}
          />
        </div>
      </div>
    </div>
  );
}
