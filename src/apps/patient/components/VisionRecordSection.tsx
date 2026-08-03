import { useEffect, useRef, useState } from "react";
import {
  getVisionRecord,
  type VisionRecord,
  type VisionVisit,
} from "@/shared/api/visionRecordApi";
import {
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Building2,
  Glasses,
  Stethoscope,
  ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Minus,
} from "lucide-react";

interface VisionRecordSectionProps {
  patientId: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmt(val: number | null | undefined, suffix = "") {
  return val != null ? `${val > 0 ? "+" : ""}${val}${suffix}` : "—";
}

function ColorVisionChip({ value }: { value: VisionVisit["colorVision"] }) {
  const map = {
    normal: { label: "Color: Normal", icon: CheckCircle, color: "#22c55e" },
    deficient: { label: "Color: Deficient", icon: AlertCircle, color: "#f59e0b" },
    not_tested: { label: "Color: Not Tested", icon: Minus, color: "#64748b" },
  };
  const { label, icon: Icon, color } = map[value] ?? map.not_tested;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}38` }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

// ─── Photo Lightbox ──────────────────────────────────────────────────────────

function PhotoLightbox({
  photos,
  index,
  onClose,
}: {
  photos: VisionVisit["photos"];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((i) => Math.min(photos.length - 1, i + 1));
      if (e.key === "ArrowLeft") setCurrent((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [photos.length, onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <X size={20} className="text-white" />
      </button>

      <div className="flex items-center gap-4 px-4 w-full max-w-3xl">
        <button
          className="p-2 rounded-full flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.1)", opacity: current === 0 ? 0.3 : 1 }}
          onClick={() => setCurrent((i) => Math.max(0, i - 1))}
          disabled={current === 0}
        >
          <ChevronDown size={20} className="text-white rotate-90" />
        </button>

        <div className="flex-1 flex flex-col items-center gap-3">
          <img
            src={photos[current].url}
            alt={photos[current].caption || `Image ${current + 1}`}
            className="max-h-[70vh] max-w-full rounded-xl object-contain"
          />
          {photos[current].caption && (
            <p className="text-sm text-slate-300">{photos[current].caption}</p>
          )}
          <p className="text-xs text-slate-500">{current + 1} / {photos.length}</p>
        </div>

        <button
          className="p-2 rounded-full flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.1)", opacity: current === photos.length - 1 ? 0.3 : 1 }}
          onClick={() => setCurrent((i) => Math.min(photos.length - 1, i + 1))}
          disabled={current === photos.length - 1}
        >
          <ChevronDown size={20} className="text-white -rotate-90" />
        </button>
      </div>
    </div>
  );
}

// ─── Visit Card ───────────────────────────────────────────────────────────────

function VisitCard({
  visit,
  isLatest,
  defaultExpanded,
}: {
  visit: VisionVisit;
  isLatest?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(!!defaultExpanded);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { right: rRx, left: lRx } = visit.lensPrescription ?? {};

  return (
    <>
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={visit.photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div
        className="rounded-2xl overflow-hidden transition-all"
        style={{
          background: isLatest
            ? "linear-gradient(135deg, #0d2a4a 0%, #0c3d5c 100%)"
            : "rgba(13,26,51,0.6)",
          border: isLatest
            ? "1px solid rgba(14,165,233,0.30)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: isLatest ? "0 4px 24px rgba(14,165,233,0.10)" : "none",
        }}
      >
        {/* Header row */}
        <button
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isLatest
                  ? "rgba(14,165,233,0.18)"
                  : "rgba(255,255,255,0.06)",
              }}
            >
              <Glasses size={18} style={{ color: isLatest ? "#38bdf8" : "#7ba3c8" }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-semibold text-sm"
                  style={{ color: "#e2eaf4" }}
                >
                  {visit.clinicName}
                </span>
                {isLatest && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(14,165,233,0.2)", color: "#38bdf8" }}
                  >
                    MOST RECENT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs" style={{ color: "#7ba3c8" }}>
                  <Calendar size={11} />
                  {formatDate(visit.date)}
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "#7ba3c8" }}>
                  <User size={11} />
                  {visit.providerName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ColorVisionChip value={visit.colorVision} />
            {expanded ? (
              <ChevronUp size={16} style={{ color: "#7ba3c8" }} />
            ) : (
              <ChevronDown size={16} style={{ color: "#7ba3c8" }} />
            )}
          </div>
        </button>

        {/* Collapsed preview: acuity + diagnosis snippet */}
        {!expanded && (
          <div className="px-5 pb-4 flex flex-wrap gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#4a6a8a" }}>
                Distance Acuity
              </p>
              <p className="text-sm font-mono" style={{ color: "#9db2d3" }}>
                R {visit.acuity?.distance?.right || "—"} &nbsp;·&nbsp; L {visit.acuity?.distance?.left || "—"}
              </p>
            </div>
            {visit.diagnosis && (
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#4a6a8a" }}>
                  Diagnosis
                </p>
                <p className="text-sm truncate max-w-[260px]" style={{ color: "#9db2d3" }}>
                  {visit.diagnosis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expanded detail */}
        {expanded && (
          <div className="px-5 pb-5 space-y-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {/* Acuity grid */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#4a6a8a" }}>
                  <Eye size={10} /> Visual Acuity — Distance
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  <div>
                    <span className="text-[10px]" style={{ color: "#4a6a8a" }}>Right</span>
                    <p style={{ color: "#e2eaf4" }}>{visit.acuity?.distance?.right || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px]" style={{ color: "#4a6a8a" }}>Left</span>
                    <p style={{ color: "#e2eaf4" }}>{visit.acuity?.distance?.left || "—"}</p>
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#4a6a8a" }}>
                  <Eye size={10} /> Visual Acuity — Near
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  <div>
                    <span className="text-[10px]" style={{ color: "#4a6a8a" }}>Right</span>
                    <p style={{ color: "#e2eaf4" }}>{visit.acuity?.near?.right || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px]" style={{ color: "#4a6a8a" }}>Left</span>
                    <p style={{ color: "#e2eaf4" }}>{visit.acuity?.near?.left || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription */}
            {(rRx || lRx) && (
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#4a6a8a" }}>
                  <Glasses size={10} /> Spectacle Prescription
                </p>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider" style={{ color: "#4a6a8a" }}>Eye</th>
                        <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider" style={{ color: "#4a6a8a" }}>SPH</th>
                        <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider" style={{ color: "#4a6a8a" }}>CYL</th>
                        <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider" style={{ color: "#4a6a8a" }}>AXIS</th>
                        <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider" style={{ color: "#4a6a8a" }}>ADD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["right", "left"] as const).map((eye, i) => {
                        const rx = eye === "right" ? rRx : lRx;
                        return (
                          <tr
                            key={eye}
                            style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                          >
                            <td className="px-3 py-2 text-xs font-medium" style={{ color: "#7ba3c8" }}>
                              {eye === "right" ? "R" : "L"}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: "#e2eaf4" }}>
                              {fmt(rx?.sphere, "D")}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: "#e2eaf4" }}>
                              {fmt(rx?.cylinder, "D")}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: "#e2eaf4" }}>
                              {rx?.axis != null ? `${rx.axis}°` : "—"}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: "#e2eaf4" }}>
                              {fmt(rx?.add, "D")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Diagnosis & Treatment */}
            {(visit.diagnosis || visit.treatment) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visit.diagnosis && (
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: "#4a6a8a" }}>
                      <Stethoscope size={10} /> Diagnosis
                    </p>
                    <p className="text-sm" style={{ color: "#c8daf0" }}>{visit.diagnosis}</p>
                  </div>
                )}
                {visit.treatment && (
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: "#4a6a8a" }}>
                      <CheckCircle size={10} /> Treatment
                    </p>
                    <p className="text-sm" style={{ color: "#c8daf0" }}>{visit.treatment}</p>
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            {visit.photos && visit.photos.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#4a6a8a" }}>
                  <ImageIcon size={10} /> Imaging ({visit.photos.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {visit.photos.map((photo, idx) => (
                    <button
                      key={photo.publicId}
                      onClick={() => setLightboxIndex(idx)}
                      className="relative group rounded-xl overflow-hidden"
                      style={{ width: 72, height: 72 }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || `Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Eye size={16} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Provenance */}
            <p className="text-xs flex items-center gap-1.5" style={{ color: "#3e5a78" }}>
              <Building2 size={11} />
              Entered by {visit.providerName} · {visit.provenance?.clinic || visit.clinicName}
              {visit.provenance?.enteredAt && (
                <> · {new Date(visit.provenance.enteredAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

// Read-only. There is no edit or delete control anywhere in this
// component — every field here was provider-entered (see spec section
// 2), and the patient view has no path to change it.
export function VisionRecordSection({ patientId }: VisionRecordSectionProps) {
  const [record, setRecord] = useState<VisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getVisionRecord(patientId)
      .then(setRecord)
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8" style={{ color: "#7ba3c8" }}>
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#38bdf8", borderTopColor: "transparent" }} />
        <span className="text-sm">Loading vision record...</span>
      </div>
    );
  }

  if (!record || record.visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(14,165,233,0.1)" }}>
          <Eye size={24} style={{ color: "#38bdf8" }} />
        </div>
        <p className="text-sm font-medium" style={{ color: "#7ba3c8" }}>No vision record entries yet</p>
        <p className="text-xs text-center max-w-[260px]" style={{ color: "#3e5a78" }}>
          Your vision visits recorded by providers will appear here.
        </p>
      </div>
    );
  }

  const [latest, ...history] = record.visits;
  const visibleHistory = showAll ? history : history.slice(0, 2);

  return (
    <div className="space-y-3">
      <VisitCard visit={latest} isLatest defaultExpanded />

      {history.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: "#3e5a78" }}>
            Earlier visits
          </p>
          {visibleHistory.map((visit) => (
            <VisitCard key={visit._id} visit={visit} />
          ))}

          {history.length > 2 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: "rgba(14,165,233,0.06)",
                border: "1px dashed rgba(14,165,233,0.20)",
                color: "#38bdf8",
              }}
            >
              {showAll ? "Show less" : `Show ${history.length - 2} more visit${history.length - 2 === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
