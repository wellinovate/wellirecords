import { getPatientDetail, type PatientDetailResponse } from "@/shared/utils/utilityFunction";
import { getPatientRecords } from "@/shared/api/clinicalApi";
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
  { id: "overview", label: "Dashboard Overview", icon: BarChart2 },
  { id: "records", label: "Vision Records & Consultations", icon: Eye },
  { id: "profile", label: "Patient Profile & Identity", icon: UserCheck },
  { id: "timeline", label: "Vision History Timeline", icon: History },
  { id: "imaging", label: "Imaging & AI Assistant", icon: ScanLine },
  { id: "referrals", label: "Specialist Referral", icon: Share2 },
  { id: "messages", label: "Patient Communication", icon: MessageSquare },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, suffix = "") {
  if (val == null) return "—";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}${suffix}`;
}

function formatDateShort(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  subtext,
  color = "text-sky-400",
  bgColor = "bg-sky-500/10",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  bgColor?: string;
  icon?: any;
}) {
  return (
    <div
      className="rounded-2xl p-4 transition-all hover:scale-[1.01]"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${bgColor}`}>
            <Icon size={16} className={color} />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {subtext && <div className="mt-1 text-xs text-slate-400">{subtext}</div>}
    </div>
  );
}

function ProvCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all ${className}`}
      style={{
        background: T.surface,
        borderColor: T.border,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ProviderVisionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState("overview");

  // State: Visits from backend
  const [visits, setVisits] = useState<VisionVisitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("Name");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Add / Edit Modal State
  const [addRecordPatientId, setAddRecordPatientId] = useState<string | null>(
    null,
  );

  // Patient Profile & Consent State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [profilePatient, setProfilePatient] = useState<PatientDetailResponse | null>(null);
  const [profileAllergies, setProfileAllergies] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!selectedPatientId) {
      setProfilePatient(null);
      setProfileAllergies([]);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    Promise.all([
      getPatientDetail(selectedPatientId).catch(() => null),
      getPatientRecords("allergies", selectedPatientId, { limit: 20 }).catch(() => null),
    ]).then(([detail, allergyRes]) => {
      if (cancelled) return;
      setProfilePatient(detail);
      setProfileAllergies((allergyRes as any)?.data?.items ?? []);
    }).finally(() => {
      if (!cancelled) setProfileLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedPatientId]);

  // Communication & Referral modal states
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Fetch list of vision records
  const loadVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPatientVision(1, 50);
      setVisits(res.items || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load provider vision records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  // Filtered List Computation
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      // Search term filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (v.patientName || "").toLowerCase();
        const pId = (v.patientId || "").toLowerCase();
        const diag = (v.diagnosis || "").toLowerCase();
        if (!pName.includes(q) && !pId.includes(q) && !diag.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [visits, searchQuery]);

  // Calculated Dashboard Overview Stats
  const stats = useMemo(() => {
    const total = visits.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = visits.filter(
      (v) => (v.date || "").slice(0, 10) === today,
    ).length;
    const cataractCount = visits.filter((v) =>
      (v.diagnosis || "").toLowerCase().includes("cataract"),
    ).length;
    const glaucomaCount = visits.filter((v) =>
      (v.diagnosis || "").toLowerCase().includes("glaucoma"),
    ).length;
    const refractiveCount = visits.filter(
      (v) =>
        (v.diagnosis || "").toLowerCase().includes("myopia") ||
        (v.diagnosis || "").toLowerCase().includes("astigmatism") ||
        (v.diagnosis || "").toLowerCase().includes("refraction"),
    ).length;
    return {
      total,
      todayCount,
      cataractCount,
      glaucomaCount,
      refractiveCount,
    };
  }, [visits]);

  const toggleFilterChip = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  return (
    <div
      className="min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in"
      style={{ background: T.bg }}
    >
      {/* ── Toast Notification Banner ────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl animate-fade-in-up">
          <CheckCircle size={16} />
          {toastMsg}
        </div>
      )}

      {/* ── TOP HEADER BAR ───────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              WelliVision™ Provider Portal
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
              <Eye size={14} /> Eye Care Specialist Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome, Dr. {user?.fullName || "Practitioner"} · Complete
            Ophthalmology & Optometry EHR Command Center
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (visits.length > 0) {
                setAddRecordPatientId(visits[0].patientId || "pat_001");
              } else {
                setAddRecordPatientId("pat_001");
              }
            }}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-500 transition-all flex items-center gap-1.5 shadow-lg shadow-sky-600/20"
          >
            <Plus size={16} /> Add Vision Record
          </button>
          <button
            onClick={loadVisits}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── METRIC CARDS / CLINICAL OVERVIEW ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Total Vision Records"
          value={stats.total}
          subtext="Across all patients"
          icon={Eye}
          color="text-sky-400"
          bgColor="bg-sky-500/10"
        />
        <StatCard
          label="Today's Consultations"
          value={stats.todayCount}
          subtext="Scheduled & Walk-ins"
          icon={CalendarClock}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          label="Refraction & Glasses"
          value={stats.refractiveCount}
          subtext="Myopia, Hyperopia, Astig."
          icon={Glasses}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          label="Cataract Tracked"
          value={stats.cataractCount}
          subtext="Pre & Post Surgery"
          icon={AlertCircle}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          label="Glaucoma Screened"
          value={stats.glaucomaCount}
          subtext="IOP & Cup/Disc Ratio"
          icon={Activity}
          color="text-rose-400"
          bgColor="bg-rose-500/10"
        />
      </div>

      {/* ── QUICK ACTIONS TOOLBAR ────────────────────────────────────────── */}
      <ProvCard className="p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
          Specialist Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { label: "New Consult", icon: Plus, action: "add-record" },
            { label: "Scan Patient QR", icon: ScanLine, route: "/provider/qr-scanner" },
            { label: "Add Vision Record", icon: Eye, action: "add-record" },
            { label: "Upload Images", icon: UploadCloud, action: "upload" },
            { label: "Issue Prescription", icon: Pill, route: "/provider/prescriptions" },
            { label: "Create Referral", icon: Share2, route: "/provider/referrals" },
            { label: "Book Follow-up", icon: CalendarPlus, route: "/provider/appointments" },
            { label: "Triage Queue", icon: Stethoscope, route: "/provider/triage" },
          ].map(({ label, icon: Icon, action, route }) => (
            <button
              key={label}
              onClick={() => {
                if (action === "add-record" || action === "upload") {
                  const pid = visits[0]?.patientId;
                  if (pid) setAddRecordPatientId(pid);
                  else showToast("No patients on file yet — record a visit from a patient's row first.");
                } else if (route) {
                  navigate(route);
                }
              }}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 text-center group"
            >
              <Icon size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </ProvCard>

      {/* ── WORKSPACE TAB NAVIGATION ────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {WORKSPACE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === id
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: DASHBOARD OVERVIEW & RECENT PATIENTS ──────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Patient Directory Search & Filter Bar */}
          <ProvCard className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search patient directory by ${searchBy}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Search Criteria Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Filter size={13} /> Search By:
                </span>
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                >
                  {SEARCH_BY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                Filters:
              </span>
              {FILTER_CHIPS.map((chip) => {
                const isActive = activeFilters.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    onClick={() => toggleFilterChip(chip.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-sky-500 text-white font-bold"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </ProvCard>

          {/* Patient Vision Visit Feed */}
          <ProvCard className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye size={18} className="text-sky-400" /> Recent Vision Examinations
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                Showing {filteredVisits.length} of {visits.length} records
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-sky-400" />
                Fetching patient vision records...
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No vision examination records found matching your search.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="rounded-2xl p-4 transition-all hover:border-sky-500/30"
                    style={{ background: T.surface2, border: `1px solid ${T.border}`, cursor: visit.patientId ? "pointer" : "default" }}
                    onClick={() => {
                      if (!visit.patientId) return;
                      setSelectedPatientId(visit.patientId);
                      setActiveTab("profile");
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">
                            {visit.patientName || "Anonymous Patient"}
                          </span>
                          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                            {visit.patientId}
                          </span>
                          <span className="text-xs text-slate-400">
                            · {formatDateShort(visit.date)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-semibold">
                          Diagnosis: {visit.diagnosis || "Routine Refraction Check"}
                        </p>
                        {visit.clinicName && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Facility: {visit.clinicName} ({visit.providerName})
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!visit.patientId) return;
                          setAddRecordPatientId(visit.patientId);
                        }}
                        disabled={!visit.patientId}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 flex items-center gap-1 self-start disabled:opacity-40"
                      >
                        <Plus size={13} /> Add Follow-up Visit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ProvCard>
        </div>
      )}

      {/* ── TAB 2: VISION RECORDS & CONSULTATION BUILDER ──────────────────── */}
      {activeTab === "records" && (
        <div className="space-y-6">
          <ProvCard className="p-6">
            <h3 className="text-base font-bold text-white mb-2">
              Vision Consultation Record & EHR Submission
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter comprehensive Visual Acuity, Refraction (SPH/CYL/AXIS/ADD), Slit Lamp, Fundus, OCT, Cataract & Glaucoma findings.
            </p>
            <button
              onClick={() => {
                const pid = visits[0]?.patientId || "pat_001";
                setAddRecordPatientId(pid);
              }}
              className="px-5 py-3 rounded-2xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-500 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={16} /> Open Complete Vision Record Form
            </button>
          </ProvCard>
        </div>
      )}

      {/* ── TAB 3: PATIENT PROFILE & CONSENT CENTER ────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {!selectedPatientId ? (
            <ProvCard className="p-10 text-center">
              <UserCheck size={28} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No patient selected</p>
              <p className="text-xs text-slate-500 mt-1">Click a patient's row in the Vision Records list to view their profile here.</p>
            </ProvCard>
          ) : profileLoading ? (
            <ProvCard className="p-10 text-center">
              <p className="text-sm text-slate-400">Loading patient profile…</p>
            </ProvCard>
          ) : !profilePatient ? (
            <ProvCard className="p-10 text-center">
              <p className="text-sm text-rose-400">Couldn't load this patient's profile.</p>
            </ProvCard>
          ) : (
            <>
              {/* Clinical Identity Card — real data only. Blood group /
                  genotype is deliberately not shown here: per this
                  product's own clinical-accuracy rule, self-reported
                  blood type must never be presented as verified fact,
                  and the patient-detail endpoint doesn't return it. */}
              <ProvCard className="p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <UserCheck size={18} className="text-sky-400" /> Patient Clinical Identity
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                    <p className="font-bold text-white mt-0.5">{profilePatient.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">WelliRecord ID</p>
                    <p className="font-mono font-bold text-sky-400 mt-0.5">{profilePatient.wrId || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gender</p>
                    <p className="font-bold text-white mt-0.5">{profilePatient.gender || "Not on file"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Known Allergies</p>
                    <p className={`font-bold mt-0.5 ${profileAllergies.length > 0 ? "text-rose-400" : "text-slate-400"}`}>
                      {profileAllergies.length > 0 ? profileAllergies.map((a) => a.allergen).join(", ") : "None on record"}
                    </p>
                  </div>
                </div>
              </ProvCard>

              {/* No backend concept exists for a directory of "connected
                  providers/specialists" per patient — honest note
                  instead of a fabricated clinic list. */}
              <ProvCard className="p-6">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Building2 size={18} className="text-teal-400" /> Connected Providers & Specialists
                </h3>
                <p className="text-xs text-slate-500">
                  Not available yet — there's no directory of connected providers or specialist referral network on the backend.
                </p>
              </ProvCard>

              {/* Consent is patient-controlled and self-service only —
                  the backend explicitly rejects any grant/revoke or
                  status request that doesn't come from the patient
                  themselves (403 "Only the patient can..."). A
                  provider genuinely cannot see or act on this from
                  here, so no fake Grant/Revoke buttons. */}
              <ProvCard className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Patient Consent & Access Control</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Consent is managed entirely by the patient. There's no provider-facing way to view or change access grants yet — access to this patient's records already reflects whatever they've currently authorized.
                </p>
              </ProvCard>
            </>
          )}
        </div>
      )}

      {/* ── TAB 4: VISION HISTORY TIMELINE ───────────────────────────────── */}
      {activeTab === "timeline" && (
        <ProvCard className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History size={18} className="text-sky-400" /> Chronological Vision History Timeline
          </h3>
          {(() => {
            const rows = (selectedPatientId ? visits.filter((v) => v.patientId === selectedPatientId) : visits)
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (rows.length === 0) {
              return <p className="text-xs text-slate-500">No vision visits on record yet.</p>;
            }
            return (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {rows.map((v) => (
                  <div key={v._id ?? `${v.patientId}-${v.date}`} className="flex items-start gap-4 relative pl-8">
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-[10px] font-bold text-sky-400 absolute left-0 top-0">
                      {new Date(v.date).getFullYear().toString().slice(2)}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex-1">
                      <span className="text-[10px] font-bold text-sky-400">{formatDateShort(v.date)}</span>
                      <p className="text-xs font-bold text-white mt-0.5">{v.diagnosis || "Vision visit"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{v.clinicName} · {v.providerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </ProvCard>
      )}

      {/* ── TAB 5: IMAGING CENTER & AI VISION ASSISTANT ─────────────────────── */}
      {activeTab === "imaging" && (
        <div className="space-y-6">
          {/* No real AI/ML clinical analysis backend exists — this
              used to show fixed, clinically-specific fake alerts
              (fabricated cup-to-disc ratios, fabricated microaneurysm
              findings) to every patient regardless of their actual
              data. That's dangerous in a way generic fake data isn't:
              a provider could reasonably read it as a real automated
              finding about the specific patient in front of them. */}
          <ProvCard className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-sky-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-sky-400" />
              <h3 className="text-base font-bold text-white">AI Vision Assistant & Decision Support</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">Coming soon</span>
            </div>
            <p className="text-xs text-slate-400">
              Automated progression trend detection (glaucoma, retinopathy, macular degeneration, IOP changes) isn't available yet — no AI analysis backend exists. Review imaging and history directly for now.
            </p>
          </ProvCard>
        </div>
      )}

      {/* ── TAB 6: SPECIALIST REFERRAL ──────────────────────────────────────── */}
      {activeTab === "referrals" && (
        <ProvCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-purple-400" />
              <h3 className="text-base font-bold text-white">Sub-Specialist Referral Center</h3>
            </div>
            <button
              onClick={() => showToast("Referrals — coming soon")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600/50 cursor-not-allowed"
            >
              Create New Referral
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Not available yet — there's no referral model or connected-provider directory on the backend.
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
              onClick={() => showToast("Secure messaging — coming soon")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-600/50 cursor-not-allowed"
            >
              Send Secure Message
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Not available yet — there's no patient messaging backend.
          </p>
        </ProvCard>
      )}

      {/* ── ADD/EDIT VISION RECORD MODAL FORM ─────────────────────────────── */}
      {addRecordPatientId && (
        <VisionRecordForm
          patientId={addRecordPatientId}
          onClose={() => setAddRecordPatientId(null)}
          onSuccess={() => {
            setAddRecordPatientId(null);
            showToast("Vision examination record saved successfully!");
            loadVisits();
          }}
        />
      )}
    </div>
  );
}
