import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Glasses,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  CalendarClock,
  Users,
  Stethoscope,
  AlertTriangle,
  FileText,
  BarChart2,
  Mail,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Minus,
  Building2,
  User,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  SendHorizonal,
  UploadCloud,
  CalendarPlus,
  ScanLine,
  Activity,
  Sliders,
  Columns,
  Maximize2,
  Sparkles,
  Pill,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  getAllPatientVision,
  type VisionVisitListItem,
} from "@/shared/api/visionRecordApi";
import { VisionRecordForm } from "@/apps/provider/components/VisionRecordForm";

// ─── Design tokens (provider dark theme) ─────────────────────────────────────

const T = {
  bg: "#0A1624",
  surface: "#0F1C2E",
  surface2: "#13243A",
  border: "rgba(126,159,255,0.10)",
  accent: "#0EA5E9",
  accentDim: "rgba(14,165,233,0.15)",
  text: "#E6EDF3",
  muted: "#9FB3C8",
  faint: "#4a6a8a",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

// ─── Provider Practice Specialties ───────────────────────────────────────────

const SUPPORTED_PRACTICES = [
  { label: "Ophthalmology Clinics", icon: Stethoscope, color: "#38bdf8" },
  { label: "Optometry Practices", icon: Eye, color: "#22c55e" },
  { label: "Vision Centers", icon: Building2, color: "#a855f7" },
  { label: "Optical Clinics", icon: Glasses, color: "#f59e0b" },
];

// ─── Patient filters ──────────────────────────────────────────────────────────

const FILTER_CHIPS = [
  { id: "new", label: "New Patient" },
  { id: "returning", label: "Returning" },
  { id: "emergency", label: "Emergency" },
  { id: "children", label: "Children" },
  { id: "elderly", label: "Elderly" },
  { id: "diabetic", label: "Diabetic" },
  { id: "glaucoma", label: "Glaucoma" },
];

// ─── Quick actions ────────────────────────────────────────────────────────────

type QuickAction = {
  icon: React.ElementType;
  label: string;
  route?: string;
  action?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { icon: Plus, label: "New Consultation", route: "/provider/encounters/new" },
  { icon: ScanLine, label: "Scan Patient QR", route: "/provider/front-desk" },
  { icon: Search, label: "Search WelliRecord ID", route: "/provider/patients" },
  { icon: Eye, label: "Add Vision Record", action: "add-vision" },
  { icon: UploadCloud, label: "Upload Images", action: "add-vision" },
  { icon: ClipboardList, label: "Issue Prescription", route: "/provider/prescriptions" },
  { icon: SendHorizonal, label: "Create Referral", route: "/provider/referrals" },
  { icon: CalendarPlus, label: "Book Follow-up", route: "/provider/appointments" },
];

// ─── Mock AI Comparison Images ────────────────────────────────────────────────

const MOCK_AI_IMAGES = [
  { id: "1", type: "OCT Scan", date: "Jan 2025", title: "Baseline Macular OCT", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80" },
  { id: "2", type: "OCT Scan", date: "Mar 2026", title: "Current Macular OCT", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80" },
  { id: "3", type: "Fundus Photo", date: "Feb 2026", title: "Optic Disc & Cup Ratio", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80" },
  { id: "4", type: "Corneal Topography", date: "Dec 2025", title: "Corneal Curvature Map", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, suffix = "") {
  if (val == null) return "—";
  return `${val > 0 ? "+" : ""}${val}${suffix}`;
}

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProvCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  color = T.accent,
  loading = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}) {
  return (
    <ProvCard className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium" style={{ color: T.muted }}>{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}1a` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 h-9">
          <Loader2 size={18} className="animate-spin" style={{ color: T.muted }} />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold" style={{ color: T.text }}>{value}</p>
          {hint && <p className="text-[10px] mt-1" style={{ color: T.faint }}>{hint}</p>}
        </>
      )}
    </ProvCard>
  );
}

function ColorVisionChip({ value }: { value: VisionVisitListItem["colorVision"] }) {
  const map = {
    normal: { label: "Normal", color: "#22c55e", icon: CheckCircle },
    deficient: { label: "Deficient", color: "#f59e0b", icon: AlertCircle },
    not_tested: { label: "Not Tested", color: "#64748b", icon: Minus },
  };
  const { label, color, icon: Icon } = map[value] ?? map.not_tested;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <Icon size={9} />
      {label}
    </span>
  );
}

// ─── Vision Record Row ────────────────────────────────────────────────────────

function VisionRecordRow({
  visit,
  onAddRecord,
}: {
  visit: VisionVisitListItem;
  onAddRecord: (patientId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { right: rRx, left: lRx } = visit.lensPrescription ?? {};

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: T.surface2,
        border: `1px solid ${T.border}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: T.accentDim }}
        >
          <User size={16} style={{ color: T.accent }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: T.text }}>
              {visit.clinicName}
            </span>
            <ColorVisionChip value={visit.colorVision} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs flex items-center gap-1" style={{ color: T.muted }}>
              <Calendar size={10} /> {formatDateShort(visit.date)}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: T.muted }}>
              <Stethoscope size={10} /> {visit.providerName}
            </span>
            {visit.patientId && (
              <span className="text-xs" style={{ color: T.faint }}>
                Patient ID: {visit.patientId.slice(0, 8)}…
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {visit.patientId && (
            <button
              onClick={() => onAddRecord(visit.patientId)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all"
              style={{
                background: T.accentDim,
                border: `1px solid rgba(14,165,233,0.25)`,
                color: T.accent,
              }}
            >
              <Plus size={12} /> Add Visit
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: T.muted }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Collapsed acuity preview */}
      {!expanded && (
        <div className="px-4 pb-3 flex flex-wrap gap-4" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: T.faint }}>Distance Acuity</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: T.muted }}>
              R {visit.acuity?.distance?.right || "—"} · L {visit.acuity?.distance?.left || "—"}
            </p>
          </div>
          {visit.diagnosis && (
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: T.faint }}>Diagnosis</p>
              <p className="text-xs truncate max-w-[240px] mt-0.5" style={{ color: T.muted }}>
                {visit.diagnosis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-4" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <div className="grid grid-cols-2 gap-3">
            {(["distance", "near"] as const).map((type) => (
              <div
                key={type}
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: T.faint }}>
                  {type === "distance" ? "Distance" : "Near"} Acuity
                </p>
                <div className="grid grid-cols-2 gap-1 text-sm font-mono">
                  <div>
                    <span className="text-[9px]" style={{ color: T.faint }}>Right</span>
                    <p style={{ color: T.text }}>{visit.acuity?.[type]?.right || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[9px]" style={{ color: T.faint }}>Left</span>
                    <p style={{ color: T.text }}>{visit.acuity?.[type]?.left || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(rRx || lRx) && (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                    {["Eye", "SPH", "CYL", "AXIS", "ADD"].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider text-center first:text-left" style={{ color: T.faint }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(["right", "left"] as const).map((eye, i) => {
                    const rx = eye === "right" ? rRx : lRx;
                    return (
                      <tr key={eye} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                        <td className="px-3 py-2 text-xs font-medium" style={{ color: T.muted }}>
                          {eye === "right" ? "R" : "L"}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: T.text }}>{fmt(rx?.sphere, "D")}</td>
                        <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: T.text }}>{fmt(rx?.cylinder, "D")}</td>
                        <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: T.text }}>{rx?.axis != null ? `${rx.axis}°` : "—"}</td>
                        <td className="px-3 py-2 text-center font-mono text-sm" style={{ color: T.text }}>{fmt(rx?.add, "D")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {visit.diagnosis && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.faint }}>Diagnosis</p>
                <p className="text-xs" style={{ color: T.muted }}>{visit.diagnosis}</p>
              </div>
            )}
            {visit.treatment && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.faint }}>Treatment</p>
                <p className="text-xs" style={{ color: T.muted }}>{visit.treatment}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Record Modal ─────────────────────────────────────────────────────────

function AddRecordModal({
  patientId,
  onClose,
  onSuccess,
}: {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: T.accentDim }}
            >
              <Eye size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: T.text }}>
                New Vision Consultation
              </h2>
              <p className="text-xs" style={{ color: T.muted }}>
                Patient ID: {patientId.slice(0, 8)}…
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: T.muted }}
          >
            <X size={16} />
          </button>
        </div>

        <VisionRecordForm
          patientId={patientId}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ProviderVisionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const providerName = user?.fullName || "Doctor";
  const firstName = providerName.split(" ").slice(-1)[0];

  const [visits, setVisits] = useState<VisionVisitListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // AI Compare mode state
  const [showAiCompare, setShowAiCompare] = useState(false);
  const [compareImg1, setCompareImg1] = useState(MOCK_AI_IMAGES[0]);
  const [compareImg2, setCompareImg2] = useState(MOCK_AI_IMAGES[1]);

  // Search & filter
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [addRecordPatientId, setAddRecordPatientId] = useState<string | null>(null);

  const loadVision = useCallback(
    async (targetPage: number, silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError("");
        const result = await getAllPatientVision(targetPage, 12);
        setVisits(result.items || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotal(result.pagination?.total || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to load vision records");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadVision(page);
  }, [page, loadVision]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredVisits = useMemo(() => {
    const q = search.toLowerCase().trim();
    return visits.filter((v) => {
      if (q) {
        const matches =
          v.clinicName?.toLowerCase().includes(q) ||
          v.providerName?.toLowerCase().includes(q) ||
          v.diagnosis?.toLowerCase().includes(q) ||
          v.patientId?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [visits, search]);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="animate-fade-in px-4 pb-12 space-y-8">
      {/* ── Header & Greeting ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: T.muted }}>
            {getGreeting()}, Dr. {firstName} · {today}
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.text }}>
            WelliVision Provider Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: T.faint }}>
            Comprehensive eye care workspace for Ophthalmologists, Optometrists, and Vision Centers
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <button
            onClick={() => setShowAiCompare((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: showAiCompare ? "rgba(234,88,12,0.2)" : T.surface2,
              border: `1px solid ${showAiCompare ? "rgba(234,88,12,0.4)" : T.border}`,
              color: showAiCompare ? "#fb923c" : T.text,
            }}
          >
            <Sparkles size={14} /> AI Image Compare
          </button>
          <button
            onClick={() => loadVision(page, true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: T.accentDim,
              border: `1px solid rgba(14,165,233,0.25)`,
              color: T.accent,
            }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Supported Provider Practice Specialties ────────────────────────── */}
      <div className="flex flex-wrap gap-2.5">
        {SUPPORTED_PRACTICES.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <p.icon size={14} style={{ color: p.color }} />
            <span style={{ color: T.text }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* ── Overview Today KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <KpiCard label="Appointments Today" value="18" hint="Scheduled" icon={Calendar} color="#38bdf8" />
        <KpiCard label="Waiting Patients" value="5" hint="In Queue" icon={Users} color="#f59e0b" />
        <KpiCard label="Completed Consults" value="9" hint="Today" icon={CheckCircle} color="#22c55e" />
        <KpiCard label="Emergency Cases" value="2" hint="Urgent" icon={AlertTriangle} color="#ef4444" />
        <KpiCard label="New Vision Records" value={total || "6"} hint="Total" icon={Eye} color={T.accent} loading={loading} />
        <KpiCard label="Pending Referrals" value="3" hint="Action needed" icon={BarChart2} color="#a855f7" />
        <KpiCard label="Unread Messages" value="7" hint="From patients" icon={Mail} color="#ec4899" />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <ProvCard className="p-5">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: T.muted }}>
          <ChevronRight size={14} style={{ color: T.accent }} /> Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {QUICK_ACTIONS.map(({ icon: Icon, label, route, action }) => (
            <button
              key={label}
              onClick={() => {
                if (action === "add-vision") {
                  const firstPatientId = visits[0]?.patientId ?? "";
                  if (firstPatientId) {
                    setAddRecordPatientId(firstPatientId);
                  } else {
                    navigate("/provider/patients");
                  }
                } else if (route) {
                  navigate(route);
                }
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${T.border}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: T.accentDim }}
              >
                <Icon size={16} style={{ color: T.accent }} />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: T.muted }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </ProvCard>

      {/* ── AI Image Comparison Tool (Interactive Provider Tool) ──────────── */}
      {showAiCompare && (
        <ProvCard className="p-6 bg-slate-900 border-orange-500/30 text-white space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-orange-400" />
              <h3 className="text-base font-bold text-orange-200">
                AI Eye Imaging & Progression Comparison Tool
              </h3>
            </div>
            <button onClick={() => setShowAiCompare(false)} className="text-xs text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Compare OCT scans, Fundus photos, and Corneal Topography over time to analyze disease progression (Glaucoma, Retinopathy, Macular Degeneration).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Image 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Baseline Image</span>
                <span>{compareImg1.date}</span>
              </div>
              <select
                value={compareImg1.id}
                onChange={(e) => {
                  const found = MOCK_AI_IMAGES.find((x) => x.id === e.target.value);
                  if (found) setCompareImg1(found);
                }}
                className="w-full bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-700 outline-none text-slate-200"
              >
                {MOCK_AI_IMAGES.map((img) => (
                  <option key={img.id} value={img.id}>{img.type} — {img.date} ({img.title})</option>
                ))}
              </select>
              <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                <img src={compareImg1.url} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-teal-300 font-mono">
                  {compareImg1.type}
                </span>
              </div>
            </div>

            {/* Image 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Follow-up Image</span>
                <span>{compareImg2.date}</span>
              </div>
              <select
                value={compareImg2.id}
                onChange={(e) => {
                  const found = MOCK_AI_IMAGES.find((x) => x.id === e.target.value);
                  if (found) setCompareImg2(found);
                }}
                className="w-full bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-700 outline-none text-slate-200"
              >
                {MOCK_AI_IMAGES.map((img) => (
                  <option key={img.id} value={img.id}>{img.type} — {img.date} ({img.title})</option>
                ))}
              </select>
              <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                <img src={compareImg2.url} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-orange-300 font-mono">
                  {compareImg2.type}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-950/40 border border-orange-500/20 text-xs text-orange-200 flex items-start gap-2.5">
            <Sparkles size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-orange-300">AI Structural Analysis: </span>
              Retinal macular thickness shows minimal variance (&lt;3%). Optic disc cup-to-disc ratio remains stable at 0.35. No active microaneurysms detected between {compareImg1.date} and {compareImg2.date}.
            </div>
          </div>
        </ProvCard>
      )}

      {/* ── Search & Filters ──────────────────────────────────────────────── */}
      <ProvCard className="p-4">
        <div className="flex gap-3">
          <div
            className="flex-1 flex items-center gap-2 px-3 rounded-xl"
            style={{ background: T.surface2, border: `1px solid ${T.border}` }}
          >
            <Search size={15} style={{ color: T.muted, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by clinic, provider, diagnosis, patient ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              style={{ color: T.text }}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} style={{ color: T.muted }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeFilters.size > 0 ? T.accentDim : T.surface2,
              border: `1px solid ${activeFilters.size > 0 ? "rgba(14,165,233,0.35)" : T.border}`,
              color: activeFilters.size > 0 ? T.accent : T.muted,
            }}
          >
            <Filter size={14} />
            {activeFilters.size > 0 && <span className="text-xs">{activeFilters.size}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
            {FILTER_CHIPS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => toggleFilter(id)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  activeFilters.has(id)
                    ? { background: T.accentDim, border: `1px solid rgba(14,165,233,0.4)`, color: T.accent }
                    : { background: T.surface2, border: `1px solid ${T.border}`, color: T.muted }
                }
              >
                {label}
              </button>
            ))}
            {activeFilters.size > 0 && (
              <button
                onClick={() => setActiveFilters(new Set())}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ color: T.faint }}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </ProvCard>

      {/* ── Records List ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: T.muted }}>
            Vision Records
            {!loading && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: T.accentDim, color: T.accent }}
              >
                {filteredVisits.length}
              </span>
            )}
          </h2>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-16 justify-center">
            <Loader2 size={20} className="animate-spin" style={{ color: T.accent }} />
            <span className="text-sm" style={{ color: T.muted }}>Loading vision records…</span>
          </div>
        )}

        {!loading && error && (
          <ProvCard className="p-8 text-center">
            <AlertTriangle size={20} style={{ color: T.danger, margin: "0 auto 8px" }} />
            <p className="text-sm" style={{ color: T.danger }}>{error}</p>
            <button
              onClick={() => loadVision(page)}
              className="mt-3 px-4 py-2 rounded-xl text-sm"
              style={{ background: T.accentDim, color: T.accent }}
            >
              Try again
            </button>
          </ProvCard>
        )}

        {!loading && !error && filteredVisits.length === 0 && (
          <ProvCard className="p-12 text-center">
            <Eye size={28} style={{ color: T.faint, margin: "0 auto 12px" }} />
            <p className="text-base font-medium" style={{ color: T.muted }}>
              {search ? "No records match your search" : "No vision records yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: T.faint }}>
              {search
                ? "Try a different search term or clear filters"
                : "Vision visits entered for patients in your organisation will appear here"}
            </p>
          </ProvCard>
        )}

        {!loading && !error && filteredVisits.length > 0 && (
          <div className="space-y-3">
            {filteredVisits.map((visit) => (
              <VisionRecordRow
                key={visit.id}
                visit={visit}
                onAddRecord={(pid) => setAddRecordPatientId(pid)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.muted }}
            >
              Previous
            </button>
            <span className="text-sm" style={{ color: T.muted }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.muted }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── Add Record Modal ──────────────────────────────────────────────── */}
      {addRecordPatientId && (
        <AddRecordModal
          patientId={addRecordPatientId}
          onClose={() => setAddRecordPatientId(null)}
          onSuccess={() => {
            setAddRecordPatientId(null);
            loadVision(page, true);
          }}
        />
      )}
    </div>
  );
}
