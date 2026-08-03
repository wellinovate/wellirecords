import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { VisionRecordSection } from "@/apps/patient/components/VisionRecordSection";
import {
  getVisionRecord,
  type VisionRecord,
  type VisionVisit,
} from "@/shared/api/visionRecordApi";
import {
  Eye,
  Glasses,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  ImageIcon,
  Shield,
  CheckCircle,
  AlertCircle,
  Minus,
  Download,
  QrCode,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, suffix = "") {
  if (val == null) return "—";
  return `${val > 0 ? "+" : ""}${val}${suffix}`;
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ColorVisionBadge({ value }: { value: VisionVisit["colorVision"] }) {
  const map = {
    normal: { label: "Normal", color: "#22c55e", icon: CheckCircle },
    deficient: { label: "Deficient", color: "#f59e0b", icon: AlertCircle },
    not_tested: { label: "Not Tested", color: "#64748b", icon: Minus },
  };
  const { label, color, icon: Icon } = map[value] ?? map.not_tested;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <Icon size={11} /> {label}
    </span>
  );
}

// ─── Vision Health Summary ────────────────────────────────────────────────────

function VisionHealthSummary({ record }: { record: VisionRecord }) {
  const latest = record.visits[0];
  if (!latest) return null;

  const { right: rRx, left: lRx } = latest.lensPrescription ?? {};

  const conditions = latest.diagnosis
    ? latest.diagnosis.split(/[,·]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      {/* Acuity cards */}
      <div className="grid grid-cols-2 gap-3">
        {(["distance", "near"] as const).map((type) => (
          <div
            key={type}
            className="rounded-2xl p-4"
            style={{
              background: "var(--pat-surface, #fff)",
              border: "1px solid var(--pat-border, #e2e8f0)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-3"
              style={{ color: "var(--pat-muted, #64748b)" }}
            >
              {type === "distance" ? "Distance Vision" : "Near Vision"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["right", "left"] as const).map((eye) => (
                <div key={eye}>
                  <p className="text-[10px] mb-0.5" style={{ color: "var(--pat-muted, #64748b)" }}>
                    {eye === "right" ? "Right" : "Left"}
                  </p>
                  <p
                    className="text-lg font-bold font-mono"
                    style={{ color: "var(--pat-text, #1e293b)" }}
                  >
                    {latest.acuity?.[type]?.[eye] || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Prescription summary */}
      {(rRx || lRx) && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--pat-surface, #fff)",
            border: "1px solid var(--pat-border, #e2e8f0)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: "var(--pat-muted, #64748b)" }}
            >
              <Glasses size={11} /> Current Prescription
            </p>
            <ColorVisionBadge value={latest.colorVision} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left pb-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--pat-muted, #64748b)" }}>Eye</th>
                  <th className="text-center pb-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--pat-muted, #64748b)" }}>SPH</th>
                  <th className="text-center pb-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--pat-muted, #64748b)" }}>CYL</th>
                  <th className="text-center pb-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--pat-muted, #64748b)" }}>AXIS</th>
                  <th className="text-center pb-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--pat-muted, #64748b)" }}>ADD</th>
                </tr>
              </thead>
              <tbody>
                {(["right", "left"] as const).map((eye, i) => {
                  const rx = eye === "right" ? rRx : lRx;
                  return (
                    <tr key={eye} style={{ borderTop: i > 0 ? "1px solid var(--pat-border, #e2e8f0)" : "none" }}>
                      <td className="py-2 text-xs font-semibold" style={{ color: "var(--pat-primary, #0d9488)" }}>
                        {eye === "right" ? "R" : "L"}
                      </td>
                      <td className="py-2 text-center font-mono text-sm" style={{ color: "var(--pat-text, #1e293b)" }}>{fmt(rx?.sphere, "D")}</td>
                      <td className="py-2 text-center font-mono text-sm" style={{ color: "var(--pat-text, #1e293b)" }}>{fmt(rx?.cylinder, "D")}</td>
                      <td className="py-2 text-center font-mono text-sm" style={{ color: "var(--pat-text, #1e293b)" }}>{rx?.axis != null ? `${rx.axis}°` : "—"}</td>
                      <td className="py-2 text-center font-mono text-sm" style={{ color: "var(--pat-text, #1e293b)" }}>{fmt(rx?.add, "D")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--pat-border, #e2e8f0)" }}>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "var(--pat-surface2, #f1f5f9)", color: "var(--pat-muted, #64748b)" }}
              onClick={() => alert("PDF download coming soon")}
            >
              <Download size={12} /> Download PDF
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "var(--pat-surface2, #f1f5f9)", color: "var(--pat-muted, #64748b)" }}
              onClick={() => alert("QR verification coming soon")}
            >
              <QrCode size={12} /> QR Verify
            </button>
          </div>
        </div>
      )}

      {/* Current conditions */}
      {conditions.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--pat-surface, #fff)",
            border: "1px solid var(--pat-border, #e2e8f0)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-2.5"
            style={{ color: "var(--pat-muted, #64748b)" }}
          >
            Current Conditions
          </p>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(13,148,136,0.10)",
                  color: "var(--pat-primary, #0d9488)",
                  border: "1px solid rgba(13,148,136,0.20)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vision Timeline ──────────────────────────────────────────────────────────

function VisionTimeline({
  visits,
  selectedId,
  onSelect,
}: {
  visits: VisionVisit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-2"
      style={{ scrollbarWidth: "none" }}
    >
      {visits.map((v, i) => {
        const isActive = v._id === selectedId;
        const year = new Date(v.date).getFullYear();
        return (
          <button
            key={v._id}
            onClick={() => onSelect(v._id)}
            className="flex-shrink-0 flex flex-col items-center gap-2 transition-all"
          >
            {/* Year label */}
            <span
              className="text-[10px] font-bold"
              style={{ color: isActive ? "var(--pat-primary, #0d9488)" : "var(--pat-muted, #64748b)" }}
            >
              {year}
            </span>
            {/* Dot */}
            <div
              className="relative flex flex-col items-center"
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center transition-all"
                style={
                  isActive
                    ? { background: "var(--pat-primary, #0d9488)", boxShadow: "0 0 0 4px rgba(13,148,136,0.15)" }
                    : { background: "var(--pat-border, #e2e8f0)", border: "2px solid var(--pat-border, #e2e8f0)" }
                }
              >
                {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              {i < visits.length - 1 && (
                <div className="absolute top-2 left-4 w-12 h-px" style={{ background: "var(--pat-border, #e2e8f0)" }} />
              )}
            </div>
            {/* Card */}
            <div
              className="w-32 rounded-xl p-2.5 text-left transition-all"
              style={
                isActive
                  ? {
                      background: "rgba(13,148,136,0.08)",
                      border: "1px solid rgba(13,148,136,0.25)",
                    }
                  : {
                      background: "var(--pat-surface, #fff)",
                      border: "1px solid var(--pat-border, #e2e8f0)",
                    }
              }
            >
              <p className="text-[10px] font-semibold truncate" style={{ color: "var(--pat-text, #1e293b)" }}>
                {v.clinicName}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "var(--pat-muted, #64748b)" }}>
                {formatDateShort(v.date)}
              </p>
              {v.diagnosis && (
                <p className="text-[9px] mt-1 truncate" style={{ color: "var(--pat-primary, #0d9488)" }}>
                  {v.diagnosis.split(",")[0].trim()}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Imaging Gallery ─────────────────────────────────────────────────────────

function ImagingGallery({ visits }: { visits: VisionVisit[] }) {
  const allPhotos = visits.flatMap((v) =>
    (v.photos ?? []).map((p) => ({
      ...p,
      date: v.date,
      clinic: v.clinicName,
    }))
  );

  const [lightbox, setLightbox] = useState<number | null>(null);

  if (allPhotos.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-2"
        style={{ background: "var(--pat-surface, #fff)", border: "1px solid var(--pat-border, #e2e8f0)" }}
      >
        <ImageIcon size={24} style={{ color: "var(--pat-muted, #64748b)" }} />
        <p className="text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
          No imaging records yet
        </p>
      </div>
    );
  }

  return (
    <>
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <div className="flex flex-col items-center gap-3 px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={allPhotos[lightbox].url}
              alt={allPhotos[lightbox].caption || ""}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
            <p className="text-sm text-slate-400">{allPhotos[lightbox].clinic} · {formatDateShort(allPhotos[lightbox].date)}</p>
            <button
              onClick={() => setLightbox(null)}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--pat-surface, #fff)", border: "1px solid var(--pat-border, #e2e8f0)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
          style={{ color: "var(--pat-muted, #64748b)" }}
        >
          <ImageIcon size={11} /> Vision Imaging ({allPhotos.length})
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {allPhotos.map((photo, idx) => (
            <button
              key={photo.publicId}
              onClick={() => setLightbox(idx)}
              className="relative group rounded-xl overflow-hidden aspect-square"
            >
              <img
                src={photo.url}
                alt={photo.caption || ""}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.45)" }}
              >
                <Eye size={18} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color = "#0d9488",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{
        background: "var(--pat-surface, #fff)",
        border: "1px solid var(--pat-border, #e2e8f0)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: "var(--pat-muted, #64748b)" }}>{label}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--pat-text, #1e293b)" }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(13,148,136,0.12)" }}
      >
        <Icon size={14} style={{ color: "var(--pat-primary, #0d9488)" }} />
      </div>
      <h2
        className="text-base font-bold tracking-tight"
        style={{ color: "var(--pat-text, #1e293b)" }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "records", label: "Records", icon: FileText },
  { id: "imaging", label: "Imaging", icon: ImageIcon },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PatientVisionPage() {
  const { user } = useAuth();
  const patientId = user?.sub;

  const [record, setRecord] = useState<VisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    getVisionRecord(patientId)
      .then((r) => {
        setRecord(r);
        if (r?.visits?.length) setSelectedVisitId(r.visits[0]._id);
      })
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  const latest = record?.visits?.[0];
  const lastExam = latest ? formatDateShort(latest.date) : "No visits yet";
  const nextAppt = "—";

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="section-header font-display mb-1 text-[28px]"
          style={{ color: "var(--pat-text, #1e293b)" }}
        >
          My Vision Record
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--pat-muted, #64748b)" }}>
          Your complete lifelong eye health history
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "#0d9488", borderTopColor: "transparent" }}
          />
          <span className="text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
            Loading your vision record...
          </span>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
            <StatCard
              label="Last Examination"
              value={lastExam}
              icon={Calendar}
              color="#0d9488"
            />
            <StatCard
              label="Next Appointment"
              value={nextAppt}
              icon={Clock}
              color="#1e3a8a"
            />
            <StatCard
              label="Total Visits"
              value={String(record?.visits?.length ?? 0)}
              icon={Eye}
              color="#7c3aed"
            />
          </div>

          {/* Consent shield */}
          <div
            className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-3"
            style={{
              background: "rgba(13,148,136,0.06)",
              border: "1px solid rgba(13,148,136,0.15)",
            }}
          >
            <Shield size={16} style={{ color: "#0d9488", flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "var(--pat-muted, #64748b)" }}>
              <span className="font-semibold" style={{ color: "var(--pat-primary, #0d9488)" }}>
                Your data, your control.&nbsp;
              </span>
              Providers can only see your records after you grant access. You can revoke at any time.
            </p>
          </div>

          {/* Tab bar */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: "var(--pat-surface2, #f1f5f9)", width: "fit-content" }}
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={
                  activeTab === id
                    ? {
                        background: "var(--pat-surface, #fff)",
                        color: "var(--pat-primary, #0d9488)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }
                    : { color: "var(--pat-muted, #64748b)" }
                }
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {record && record.visits.length > 0 ? (
                <>
                  {/* Timeline */}
                  <div>
                    <SectionTitle icon={Calendar} title="Vision Timeline" />
                    <VisionTimeline
                      visits={record.visits}
                      selectedId={selectedVisitId}
                      onSelect={setSelectedVisitId}
                    />
                  </div>

                  {/* Health summary */}
                  <div>
                    <SectionTitle icon={Eye} title="Vision Health Summary" />
                    <VisionHealthSummary record={record} />
                  </div>
                </>
              ) : (
                <div
                  className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
                  style={{
                    background: "var(--pat-surface, #fff)",
                    border: "1px solid var(--pat-border, #e2e8f0)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(13,148,136,0.1)" }}
                  >
                    <Eye size={28} style={{ color: "#0d9488" }} />
                  </div>
                  <p
                    className="text-base font-semibold"
                    style={{ color: "var(--pat-text, #1e293b)" }}
                  >
                    No vision visits yet
                  </p>
                  <p
                    className="text-sm max-w-[300px]"
                    style={{ color: "var(--pat-muted, #64748b)" }}
                  >
                    Your vision visits recorded by your eye care providers will appear here after your first consultation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Records */}
          {activeTab === "records" && (
            <div>
              <SectionTitle icon={FileText} title="All Vision Records" />
              {patientId ? (
                <VisionRecordSection patientId={patientId} />
              ) : (
                <p className="text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
                  Loading...
                </p>
              )}
            </div>
          )}

          {/* Tab: Imaging */}
          {activeTab === "imaging" && (
            <div>
              <SectionTitle icon={ImageIcon} title="Vision Imaging" />
              {record ? (
                <ImagingGallery visits={record.visits} />
              ) : (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: "var(--pat-surface, #fff)",
                    border: "1px solid var(--pat-border, #e2e8f0)",
                  }}
                >
                  <p className="text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
                    No records available
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
