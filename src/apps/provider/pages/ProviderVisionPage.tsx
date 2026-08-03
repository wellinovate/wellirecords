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
  Shield,
  MessageSquare,
  Lock,
  History,
  TrendingUp,
  Share2,
  UserCheck,
  FileSpreadsheet,
  Check,
  Zap,
  Phone,
  Droplet,
  Info,
  Clock,
  ExternalLink,
  Award,
  ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  getAllPatientVision,
  type VisionVisitListItem,
} from "@/shared/api/visionRecordApi";
import { VisionRecordForm } from "@/apps/provider/components/VisionRecordForm";

// ─── Design Tokens (Provider Dark Theme) ─────────────────────────────────────

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

// ─── Filter & Search Criteria Config ──────────────────────────────────────────

const SEARCH_BY_OPTIONS = [
  "Name",
  "WelliRecord ID",
  "QR Code",
  "Phone Number",
  "Email",
  "National ID",
];

const FILTER_CHIPS = [
  { id: "new", label: "New Patient" },
  { id: "returning", label: "Returning Patient" },
  { id: "emergency", label: "Emergency" },
  { id: "children", label: "Children" },
  { id: "elderly", label: "Elderly" },
  { id: "diabetic", label: "Diabetic" },
  { id: "glaucoma", label: "Glaucoma Patients" },
];

const WORKSPACE_TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "consultation", label: "Consultation Workspace", icon: Stethoscope },
  { id: "profile", label: "Patient Profile & Consent", icon: UserCheck },
  { id: "timeline", label: "Vision Timeline", icon: History },
  { id: "imaging", label: "Imaging & AI Assistant", icon: ImageIcon },
  { id: "referrals", label: "Referral & Collaboration", icon: SendHorizonal },
  { id: "messages", label: "Patient Communication", icon: MessageSquare },
];

const AI_INSIGHT_ALERT_ITEMS = [
  { type: "Glaucoma Risk", desc: "Cup-to-disc ratio increased to 0.55 OD. Consider IOP baseline check.", severity: "high" },
  { type: "Diabetic Retinopathy", desc: "Microaneurysms detected in macular region OS. Endocrine consult recommended.", severity: "high" },
  { type: "Prescription Shift", desc: "Significant SPH change (-0.75D) since 2024. Screen for hyperglycemia.", severity: "medium" },
  { type: "Missed Follow-up", desc: "Patient missed 3-month Glaucoma IOP screening.", severity: "medium" },
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProviderVisionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const providerName = user?.fullName || "Doctor";
  const firstName = providerName.split(" ").slice(-1)[0];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [visits, setVisits] = useState<VisionVisitListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [searchBy, setSearchBy] = useState("Name");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Patient Profile & Consent State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [consentGranted, setConsentGranted] = useState(true);
  const [consentScope, setConsentScope] = useState("Full Eye History");

  // Communication & Referral modal states
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [addRecordPatientId, setAddRecordPatientId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

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
    const q = searchQuery.toLowerCase().trim();
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
  }, [visits, searchQuery]);

  const todayStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="animate-fade-in px-4 pb-12 space-y-7">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-xl border border-sky-500/30 animate-fade-in">
          <CheckCircle size={16} className="text-teal-400" />
          {toastMsg}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: T.muted }}>
            {getGreeting()}, Dr. {firstName} · {todayStr}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Eye size={24} className="text-sky-400" /> WelliVision Provider Workspace
          </h1>
          <p className="text-xs mt-1" style={{ color: T.faint }}>
            Ophthalmologists · Optometrists · Vision Centers · Optical Clinics
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => loadVision(page, true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: T.accentDim, border: `1px solid rgba(14,165,233,0.25)`, color: T.accent }}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Today Overview KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <KpiCard label="Appts Today" value="18" hint="Scheduled" icon={Calendar} color="#38bdf8" />
        <KpiCard label="Waiting Patients" value="5" hint="In Queue" icon={Users} color="#f59e0b" />
        <KpiCard label="Completed Consults" value="9" hint="Today" icon={CheckCircle} color="#22c55e" />
        <KpiCard label="Emergency Cases" value="2" hint="Urgent" icon={AlertTriangle} color="#ef4444" />
        <KpiCard label="New Vision Records" value={total || "6"} hint="Total" icon={Eye} color={T.accent} loading={loading} />
        <KpiCard label="Pending Referrals" value="3" hint="Action needed" icon={BarChart2} color="#a855f7" />
        <KpiCard label="Unread Messages" value="7" hint="From patients" icon={Mail} color="#ec4899" />
      </div>

      {/* ── Quick Actions Grid ─────────────────────────────────────────────── */}
      <ProvCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: T.muted }}>
            <Sparkles size={13} style={{ color: T.accent }} /> Provider Quick Actions
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { icon: Plus, label: "+ New Consultation", route: "/provider/encounters/new" },
            { icon: ScanLine, label: "Scan Patient QR", route: "/provider/front-desk" },
            { icon: Search, label: "Search WelliRecord ID", route: "/provider/patients" },
            { icon: Eye, label: "Add Vision Record", action: "add-record" },
            { icon: UploadCloud, label: "Upload Images", action: "upload" },
            { icon: ClipboardList, label: "Issue Prescription", route: "/provider/prescriptions" },
            { icon: SendHorizonal, label: "Create Referral", route: "/provider/referrals" },
            { icon: CalendarPlus, label: "Book Follow-up", route: "/provider/appointments" },
          ].map(({ icon: Icon, label, route, action }) => (
            <button
              key={label}
              onClick={() => {
                if (action === "add-record" || action === "upload") {
                  const pid = visits[0]?.patientId || "sample-patient-id";
                  setAddRecordPatientId(pid);
                } else if (route) {
                  navigate(route);
                }
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all hover:-translate-y-0.5 text-center group"
              style={{ background: T.surface2, border: `1px solid ${T.border}` }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: T.accentDim }}>
                <Icon size={15} style={{ color: T.accent }} />
              </div>
              <span className="text-[10px] font-semibold" style={{ color: T.text }}>{label}</span>
            </button>
          ))}
        </div>
      </ProvCard>

      {/* ── Search & Filter Criteria ───────────────────────────────────────── */}
      <ProvCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search type select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: T.muted }}>Search using:</span>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs font-medium outline-none bg-slate-900 text-slate-200 border border-slate-700"
            >
              {SEARCH_BY_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Search input */}
          <div className="flex-1 flex items-center gap-2 px-3 rounded-xl" style={{ background: T.surface2, border: `1px solid ${T.border}` }}>
            <Search size={14} style={{ color: T.muted }} />
            <input
              placeholder={`Search by ${searchBy}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent py-2 text-xs outline-none text-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={13} style={{ color: T.muted }} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
          {FILTER_CHIPS.map(({ id, label }) => {
            const active = activeFilters.has(id);
            return (
              <button
                key={id}
                onClick={() => toggleFilter(id)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  active
                    ? { background: T.accentDim, border: `1px solid rgba(14,165,233,0.5)`, color: T.accent }
                    : { background: T.surface2, border: `1px solid ${T.border}`, color: T.muted }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </ProvCard>

      {/* ── Main Navigation Workspace Tabs ─────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {WORKSPACE_TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              style={
                active
                  ? { background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", color: "white", boxShadow: "0 4px 14px rgba(14,165,233,0.25)" }
                  : { background: T.surface, border: `1px solid ${T.border}`, color: T.muted }
              }
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DASHBOARD OVERVIEW & VISIT RECORDS ───────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300">
              Vision Visits & Patient Consultations ({filteredVisits.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-16 justify-center">
              <Loader2 size={20} className="animate-spin" style={{ color: T.accent }} />
              <span className="text-sm" style={{ color: T.muted }}>Loading vision records…</span>
            </div>
          ) : filteredVisits.length === 0 ? (
            <ProvCard className="p-12 text-center">
              <Eye size={28} style={{ color: T.faint, margin: "0 auto 12px" }} />
              <p className="text-base font-medium" style={{ color: T.muted }}>No vision records found</p>
              <p className="text-sm mt-1" style={{ color: T.faint }}>
                Vision visits recorded for patients in your clinic will appear here.
              </p>
            </ProvCard>
          ) : (
            <div className="space-y-3">
              {filteredVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-2xl p-4 transition-all hover:border-sky-500/30"
                  style={{ background: T.surface2, border: `1px solid ${T.border}` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{visit.clinicName}</p>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Authorized Provider
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-slate-400">
                        {formatDateShort(visit.date)} · Provider: {visit.providerName}
                      </p>
                      {visit.diagnosis && (
                        <p className="text-xs mt-1.5 text-sky-400">
                          Diagnosis: {visit.diagnosis}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const pid = visit.patientId || "sample-id";
                        setAddRecordPatientId(pid);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 flex items-center gap-1 self-start"
                    >
                      <Plus size={13} /> Add Follow-up Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CONSULTATION WORKSPACE ──────────────────────────────────── */}
      {activeTab === "consultation" && (
        <ProvCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Clinical Consultation Workspace</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured clinical documentation for Ophthalmologists & Optometrists
              </p>
            </div>
            <button
              onClick={() => {
                const pid = visits[0]?.patientId || "sample-patient-id";
                setAddRecordPatientId(pid);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 flex items-center gap-1.5"
            >
              <Plus size={14} /> Open 4-Step Record Wizard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800 space-y-2">
              <p className="text-xs font-bold uppercase text-sky-400">1. Refraction & Acuity</p>
              <p className="text-xs text-slate-300">Distance & Near OD/OS, SPH, CYL, AXIS, ADD, Color Vision (Ishihara), Contrast Sensitivity.</p>
            </div>
            <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800 space-y-2">
              <p className="text-xs font-bold uppercase text-sky-400">2. Examination & IOP</p>
              <p className="text-xs text-slate-300">Glaucoma IOP (mmHg), Slit Lamp (Cornea, Lens, Lids), Fundus & Retina cup-to-disc ratio.</p>
            </div>
            <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800 space-y-2">
              <p className="text-xs font-bold uppercase text-sky-400">3. Diseases & Drops Rx</p>
              <p className="text-xs text-slate-300">ICD Eye Disease coding, Cataract/Glaucoma tracking, Eye Drop dosage & Compliance schedule.</p>
            </div>
          </div>
        </ProvCard>
      )}

      {/* ── TAB 3: PATIENT PROFILE & CONSENT CENTER ────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Clinical Identity Card */}
          <ProvCard className="p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-sky-400" /> Patient Clinical Identity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                <p className="font-bold text-white mt-0.5">Chibuike Joshua Nwogha</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">WelliRecord ID</p>
                <p className="font-mono font-bold text-sky-400 mt-0.5">WR-NGA-2026-8891</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group / Genotype</p>
                <p className="font-bold text-white mt-0.5">O+ / AA</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Known Allergies</p>
                <p className="font-bold text-rose-400 mt-0.5">Penicillin, Latex</p>
              </div>
            </div>
          </ProvCard>

          {/* Connected Providers & Systemic Link */}
          <ProvCard className="p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Building2 size={18} className="text-teal-400" /> Authorized Connected Providers & Specialists
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Systemic links (Endocrinology, Neurology) associated with diabetic retinopathy & hypertensive optic neuropathy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                { name: "Silver Cross Eye Clinic", role: "Primary Eye Clinic", status: "Active" },
                { name: "Vision Plus Optical", role: "Optical Provider", status: "Active" },
                { name: "University Teaching Hospital", role: "Endocrinology & Retina Specialist", status: "Connected" },
              ].map((p) => (
                <div key={p.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.role}</p>
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-2">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </ProvCard>

          {/* Patient Consent Center */}
          <ProvCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Patient Consent & Access Control</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${consentGranted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'}`}>
                {consentGranted ? "Access Granted" : "Access Revoked"}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Providers cannot access vision records until the patient grants permission. Access options controlled by patient:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {["Full Eye History", "Current Consultation Only", "Last 12 Months", "Emergency Access", "Imaging Only", "Prescription Only"].map((scope) => (
                <button
                  key={scope}
                  onClick={() => setConsentScope(scope)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${consentScope === scope ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-400'}`}
                >
                  {scope}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setConsentGranted(true);
                  showToast("Consent granted by patient");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Grant Access
              </button>
              <button
                onClick={() => {
                  setConsentGranted(false);
                  showToast("Consent access revoked");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/30 hover:bg-rose-600/50 text-rose-300"
              >
                Revoke Access
              </button>
            </div>
          </ProvCard>
        </div>
      )}

      {/* ── TAB 4: VISION TIMELINE ─────────────────────────────────────────── */}
      {activeTab === "timeline" && (
        <ProvCard className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History size={18} className="text-sky-400" /> Chronological Vision History Timeline
          </h3>
          <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {[
              { year: "2026", title: "LASIK Consultation & Corneal Topography", clinic: "Vision Plus Eye Center" },
              { year: "2025", title: "Retina Macular OCT Scan", clinic: "University Teaching Hospital" },
              { year: "2024", title: "Cataract Screening & Baseline IOP", clinic: "Silver Cross Eye Clinic" },
              { year: "2023", title: "New Progressive Glasses Prescription", clinic: "Optical Care Center" },
              { year: "2022", title: "Routine Eye Examination", clinic: "General Vision Clinic" },
            ].map((t) => (
              <div key={t.year} className="flex items-start gap-4 relative pl-8">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-[10px] font-bold text-sky-400 absolute left-0 top-0">
                  {t.year.slice(2)}
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex-1">
                  <span className="text-[10px] font-bold text-sky-400">{t.year}</span>
                  <p className="text-xs font-bold text-white mt-0.5">{t.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.clinic}</p>
                </div>
              </div>
            ))}
          </div>
        </ProvCard>
      )}

      {/* ── TAB 5: IMAGING CENTER & AI VISION ASSISTANT ─────────────────────── */}
      {activeTab === "imaging" && (
        <div className="space-y-6">
          {/* AI Decision Support Banner */}
          <ProvCard className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-sky-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-sky-400" />
              <h3 className="text-base font-bold text-white">AI Vision Assistant & Decision Support</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Automated progression trend detection (Glaucoma, Retinopathy, Macular degeneration, IOP changes).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {AI_INSIGHT_ALERT_ITEMS.map((item) => (
                <div key={item.type} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    {item.type}
                  </span>
                  <p className="text-xs text-slate-200 mt-1.5">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-3">
              * The AI Assistant serves as decision support and does not replace clinical judgment.
            </p>
          </ProvCard>
        </div>
      )}

      {/* ── TAB 6: REFERRAL & PROVIDER COLLABORATION ───────────────────────── */}
      {activeTab === "referrals" && (
        <ProvCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SendHorizonal size={18} className="text-purple-400" />
              <h3 className="text-base font-bold text-white">Sub-Specialist Referral Center</h3>
            </div>
            <button
              onClick={() => showToast("Referral package prepared with clinical notes & OCT scans")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500"
            >
              Create New Referral
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Refer patients to Retina, Glaucoma, Pediatric, Neuro-ophthalmology, Cornea specialists or Optometrists with clinical summaries and test results.
          </p>
        </ProvCard>
      )}

      {/* ── TAB 7: PATIENT COMMUNICATION ───────────────────────────────────── */}
      {activeTab === "messages" && (
        <ProvCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-pink-400" />
              <h3 className="text-base font-bold text-white">Patient Communication & Reminders</h3>
            </div>
            <button
              onClick={() => showToast("Prescription notification sent to patient")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-500"
            >
              Send Secure Message
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Send secure messages, answer patient questions, notify when prescriptions are ready, and confirm follow-up visits.
          </p>
        </ProvCard>
      )}

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
