import { DashboardAlerts } from "@/apps/components/DashboardAlerts";
import { RecentEncountersCard } from "@/apps/components/RecentEncountersCard";
import { SummaryRecordsGrid } from "@/apps/components/SummaryRecordsGrid";
import { RecordModal } from "@/apps/patient/components/FirstRecordWizard";
import {
  buildProfileCompletionAlerts,
  computeProfileCompletion,
} from "@/apps/patient/utils/profileCompletion";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  fetchProfile,
  getUsersEncounters,
  getUsersRecord,
} from "@/shared/utils/utilityFunction";
import { useAppointments } from "@/modules/appointments/hooks";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CalendarClock,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderHeart,
  Heart,
  HeartPulse,
  MapPin,
  MessageSquare,
  Pill,
  QrCode,
  Shield,
  Stethoscope,
  UploadCloud,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── Types (unchanged) ────────────────────────────────────────────────────────

type RecordCategory = {
  category: string;
  recordCount: number;
  lastUpdatedAt: string | null;
  summaryMetric: Record<string, any>;
};
export type RecordsResponse = Record<string, RecordCategory>;

type ApiEncounter = {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  encounterTitle?: string | null;
  encounterType?: string | null;
  status?: string | null;
  organizationName?: string | null;
  organizationPersonName?: string | null;
  chiefComplaint?: string | null;
  reasonForVisit?: string | null;
  notes?: string | null;
  visibilityToPatient?: boolean;
};

type UiEncounter = {
  id: string;
  date: string;
  title: string;
  encounterType: "outpatient" | "lab" | "emergency" | "cardiology";
  status: "completed" | "ongoing" | "attention";
  facility: string;
  provider?: string;
  summary: string;
};

const mapEncounterStatus = (
  status?: string | null,
  endedAt?: string | null,
): UiEncounter["status"] => {
  const n = (status || "").toLowerCase();
  if (n === "completed" || n === "closed" || n === "done" || !!endedAt)
    return "completed";
  if (n === "in-progress" || n === "ongoing" || n === "active" || n === "open")
    return "ongoing";
  if (n === "cancelled" || n === "failed" || n === "requires-followup")
    return "attention";
  return "ongoing";
};

const mapEncounterType = (type?: string | null): UiEncounter["encounterType"] => {
  const n = (type || "").toLowerCase();
  if (n === "lab") return "lab";
  if (n === "emergency") return "emergency";
  if (n === "cardiology") return "cardiology";
  return "outpatient";
};

export const mapApiEncounterToUi = (item: ApiEncounter): UiEncounter => {
  const date = item.startedAt || item.createdAt || item.updatedAt || new Date().toISOString();
  return {
    id: item.id,
    date,
    title: item.encounterTitle?.trim() || "Medical Visit",
    encounterType: mapEncounterType(item.encounterType),
    status: mapEncounterStatus(item.status, item.endedAt),
    facility: item.organizationName?.trim() || "Unknown facility",
    provider: item.organizationPersonName?.trim() || undefined,
    summary:
      item.chiefComplaint?.trim() ||
      item.reasonForVisit?.trim() ||
      item.notes?.trim() ||
      "No summary available",
  };
};

export type EncounterItem = UiEncounter;
export type DashboardAlertItem = {
  id: string;
  type: "warning" | "info" | "critical";
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const PAT = {
  primary: "var(--pat-primary, #0d9488)",
  text: "var(--pat-text, #1e293b)",
  muted: "var(--pat-muted, #64748b)",
  surface: "var(--pat-surface, #fff)",
  surface2: "var(--pat-surface2, #f1f5f9)",
  border: "var(--pat-border, #e2e8f0)",
};

// ─── Quick actions config ─────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: CalendarClock, label: "Book Appointment", route: "/patient/find-care", color: "#2563eb" },
  { icon: UploadCloud,   label: "Upload Record",    route: "/patient/vault",     color: "#0d9488" },
  { icon: Pill,          label: "Medications",      route: "/patient/medications", color: "#7c3aed" },
  { icon: QrCode,        label: "Emergency Card",   route: "/patient/emergency-card", color: "#dc2626" },
  { icon: MapPin,        label: "Find Care",        route: "/patient/find-care", color: "#ea580c" },
  { icon: MessageSquare, label: "Messages",         route: "/patient/messages",  color: "#0891b2" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function HealthStatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  loading?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
      style={{
        background: PAT.surface,
        border: `1px solid ${PAT.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs truncate" style={{ color: PAT.muted }}>{label}</p>
        {loading ? (
          <div className="h-5 w-8 mt-1 rounded animate-pulse" style={{ background: PAT.surface2 }} />
        ) : (
          <p className="text-xl font-bold mt-0.5" style={{ color: PAT.text }}>{value}</p>
        )}
      </div>
    </div>
  );
}

function QuickActionBtn({
  icon: Icon,
  label,
  route,
  color,
}: {
  icon: React.ElementType;
  label: string;
  route: string;
  color: string;
}) {
  return (
    <Link
      to={route}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all group hover:-translate-y-0.5"
      style={{
        background: PAT.surface,
        border: `1px solid ${PAT.border}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: `${color}14` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: PAT.muted }}>
        {label}
      </span>
    </Link>
  );
}

function UpcomingAppointmentCard({
  apt,
}: {
  apt: any;
}) {
  const scheduledDate = apt.scheduledFor ? new Date(apt.scheduledFor) : null;
  const now = new Date();
  const diffMs = scheduledDate ? scheduledDate.getTime() - now.getTime() : 0;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const countdown =
    diffDays === 0 ? "Today" :
    diffDays === 1 ? "Tomorrow" :
    diffDays > 1 ? `In ${diffDays} days` : "Overdue";

  const countdownColor =
    diffDays === 0 ? "#dc2626" :
    diffDays === 1 ? "#ea580c" :
    "#0d9488";

  return (
    <div
      className="rounded-2xl overflow-hidden flex"
      style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
    >
      <div className="w-1 flex-shrink-0" style={{ background: "#2563eb" }} />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold truncate" style={{ color: PAT.text }}>
                {apt?.organizationId?.organizationName || "Medical Appointment"}
              </p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${countdownColor}14`, color: countdownColor }}
              >
                {countdown}
              </span>
            </div>
            {apt.providerId?.fullName && (
              <p className="text-xs mt-0.5 font-medium" style={{ color: "#2563eb" }}>
                {apt.providerId.fullName}
              </p>
            )}
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: PAT.muted }}>
              <Calendar size={11} />
              {scheduledDate
                ? scheduledDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "—"}
            </p>
            {apt.reasonForVisit && (
              <p className="text-xs mt-1 truncate" style={{ color: PAT.muted }}>
                {apt.reasonForVisit}
              </p>
            )}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(37,99,235,0.10)" }}
          >
            <Stethoscope size={16} style={{ color: "#2563eb" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisionSummaryCard({ onHide }: { onHide: () => void }) {
  return (
    <div
      className="relative flex items-center justify-between rounded-2xl p-5 transition-all hover:-translate-y-0.5 group"
      style={{
        background: "linear-gradient(135deg, #0c2340 0%, #0d3358 100%)",
        border: "1px solid rgba(14,165,233,0.20)",
        boxShadow: "0 4px 20px rgba(14,165,233,0.08)",
      }}
    >
      <Link to="/patient/vision" className="flex items-center gap-4 flex-1 min-w-0 pr-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(14,165,233,0.18)" }}
        >
          <Eye size={22} style={{ color: "#38bdf8" }} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-white truncate">My Vision Record</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Optional
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "#7ba3c8" }}>
            View your complete eye health history
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          to="/patient/vision"
          className="flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-1"
          style={{ color: "#38bdf8" }}
        >
          View <ArrowRight size={14} />
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onHide();
          }}
          title="Disable Vision Record on Dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
        >
          <EyeOff size={13} />
          <span className="hidden sm:inline">Disable on dashboard</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PatientOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<RecordsResponse>({});
  const [recentEncounters, setRecentEncounters] = useState<UiEncounter[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [genotype, setGenotype] = useState<string | null>(null);
  const [confirmedNone, setConfirmedNone] = useState<{
    allergies?: boolean;
    medications?: boolean;
    diagnoses?: boolean;
  } | null>(null);

  const [showVisionOnDashboard, setShowVisionOnDashboard] = useState<boolean>(() => {
    const saved = localStorage.getItem("wr_show_vision_on_dashboard");
    return saved !== "0"; // default to enabled/shown
  });

  const handleToggleVisionDashboard = (enabled: boolean) => {
    setShowVisionOnDashboard(enabled);
    localStorage.setItem("wr_show_vision_on_dashboard", enabled ? "1" : "0");
  };

  const patientId = user?.sub;

  // Appointment data for the dashboard widget
  const apptParams = useMemo(() => {
    if (!patientId) return undefined;
    return { patientId, page: 1, limit: 10 };
  }, [patientId]);

  const { items: allAppts, loading: apptLoading } = useAppointments(apptParams, {
    enabled: Boolean(patientId),
  });

  const upcomingAppts = useMemo(
    () => allAppts.filter((a) => a.status === "booked" || a.status === "checked-in").slice(0, 2),
    [allAppts],
  );

  const displayName =
    user?.fullName ||
    user?.data?.account?.fullName ||
    user?.data?.account?.firstName ||
    "there";

  const firstName = displayName.split(" ")[0];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsersRecord(1, 10);
      const encounterResult = await getUsersEncounters();

      fetchProfile()
        .then((profile) => {
          setEmergencyContacts(Array.isArray(profile?.emergencyContacts) ? profile.emergencyContacts : []);
          setBloodGroup(profile?.bloodGroup ?? null);
          setGenotype(profile?.genotype ?? null);
          setConfirmedNone(profile?.confirmedNone ?? null);
        })
        .catch(() => setEmergencyContacts([]));

      const rawItems = Array.isArray(encounterResult?.items) ? encounterResult.items : [];
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const formattedEncounters = rawItems
        .filter((item: any) => item?.visibilityToPatient !== false)
        .filter((item: any) => {
          const d = new Date(item?.startedAt || item?.createdAt || item?.updatedAt);
          return !Number.isNaN(d.getTime()) && d >= twoWeeksAgo;
        })
        .sort((a: any, b: any) => {
          const da = new Date(a?.startedAt || a?.createdAt || a?.updatedAt).getTime();
          const db = new Date(b?.startedAt || b?.createdAt || b?.updatedAt).getTime();
          return db - da;
        })
        .map(mapApiEncounterToUi);

      setRecentEncounters(formattedEncounters);
      const data: RecordsResponse = result?.data ?? result ?? {};
      setRecords(data);
    } catch (err: any) {
      setRecentEncounters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const recordList = useMemo(() => Object.values(records || {}), [records]);
  const hasSummaryRecords = recordList.length > 0;

  const completionAlerts = useMemo(() => {
    const result = computeProfileCompletion(records, emergencyContacts, bloodGroup, genotype, confirmedNone);
    return buildProfileCompletionAlerts(result);
  }, [records, emergencyContacts, bloodGroup, genotype, confirmedNone]);

  const handleAlertNavigate = (ctaLink: string) => {
    if (ctaLink.startsWith("record:")) {
      setActiveRecordType(ctaLink.slice("record:".length));
      return;
    }
    navigate(ctaLink);
  };

  const handleRecordModalClose = () => {
    setActiveRecordType(null);
    fetchDashboardData();
  };

  const totalRecords = recordList.reduce((acc, r) => acc + (r.recordCount || 0), 0);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="animate-fade-in space-y-7 pb-8">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #0a1f3a 0%, #0d3358 55%, #0f4c75 100%)",
          border: "1px solid rgba(14,165,233,0.15)",
          boxShadow: "0 8px 32px rgba(14,165,233,0.10)",
        }}
      >
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#7ba3c8" }}>
            {greeting} 👋
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hello, {firstName}
          </h1>
          <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "#7ba3c8" }}>
            <Shield size={13} style={{ color: "#38bdf8" }} />
            Your records are private and securely stored.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={() => navigate("/patient/vault")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(14,165,233,0.18)",
              border: "1px solid rgba(14,165,233,0.30)",
              color: "#38bdf8",
            }}
          >
            <UploadCloud size={15} /> Upload Record
          </button>
          <button
            onClick={() => navigate("/patient/vault")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #0d3d22 0%, #1a6b42 100%)",
              boxShadow: "0 4px 14px rgba(13,148,136,0.30)",
            }}
          >
            <FolderHeart size={15} /> Health Record
          </button>
        </div>
      </div>

      {/* ── Health Snapshot ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HealthStatCard
          icon={FileText}
          label="Total Records"
          value={totalRecords}
          color="#0d9488"
          loading={loading}
        />
        <HealthStatCard
          icon={CalendarClock}
          label="Upcoming Appts"
          value={upcomingAppts.length}
          color="#2563eb"
          loading={apptLoading}
        />
        <HealthStatCard
          icon={Activity}
          label="Recent Encounters"
          value={recentEncounters.length}
          color="#7c3aed"
          loading={loading}
        />
        <HealthStatCard
          icon={HeartPulse}
          label="Profile Complete"
          value={completionAlerts.length === 0 ? "✓" : `${Math.max(0, 5 - completionAlerts.length)}/5`}
          color="#ea580c"
          loading={loading}
        />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: PAT.muted }}>
          <ChevronRight size={13} style={{ color: PAT.primary }} /> Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {QUICK_ACTIONS.map((a) => (
            <QuickActionBtn key={a.label} {...a} />
          ))}
        </div>
      </div>

      {/* ── Upcoming Appointments widget ──────────────────────────── */}
      {(upcomingAppts.length > 0 || apptLoading) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: PAT.muted }}>
              <ChevronRight size={13} style={{ color: PAT.primary }} /> Upcoming Appointments
            </h2>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: PAT.primary }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {apptLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: PAT.surface2 }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppts.map((apt) => (
                <UpcomingAppointmentCard key={apt._id} apt={apt} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Vision Card (Optional on Dashboard) ──────────────────── */}
      {showVisionOnDashboard ? (
        <VisionSummaryCard onHide={() => handleToggleVisionDashboard(false)} />
      ) : (
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-3 text-xs"
          style={{
            background: PAT.surface,
            border: `1px dashed ${PAT.border}`,
            color: PAT.muted,
          }}
        >
          <span className="flex items-center gap-2">
            <EyeOff size={14} style={{ color: PAT.muted }} /> Vision Record is disabled on dashboard (always available on sidebar).
          </span>
          <button
            onClick={() => handleToggleVisionDashboard(true)}
            className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors"
          >
            <Eye size={13} /> Enable on Dashboard
          </button>
        </div>
      )}

      {/* ── Alerts + Encounters ───────────────────────────────────── */}
      <div className="flex lg:flex-row flex-col gap-4">
        <DashboardAlerts alerts={completionAlerts} onNavigate={handleAlertNavigate} />
        <RecentEncountersCard
          encounters={recentEncounters}
          onViewAll={() => navigate("/patient/encounters")}
          isLoading={loading}
          onViewDetails={(id) => navigate(`/patient/encounters/${id}`)}
          onShare={(id) => console.log("share encounter", id)}
          onContinueCare={(id) => console.log("continue care", id)}
        />
      </div>

      {/* ── Records Summary ───────────────────────────────────────── */}
      <SummaryRecordsGrid
        loading={loading}
        records={recordList}
        onViewCategory={(category) => navigate(`/patient/records/${category}`)}
      />

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!loading && !hasSummaryRecords && (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: PAT.surface,
            border: `2px dashed ${PAT.border}`,
          }}
        >
          <BookOpen size={28} className="mx-auto mb-3" style={{ color: PAT.muted }} />
          <h3 className="text-base font-semibold mb-2" style={{ color: PAT.text }}>
            No health record summary yet
          </h3>
          <p className="text-sm mb-4" style={{ color: PAT.muted }}>
            Upload your first health record to start building your dashboard.
          </p>
          <button onClick={() => navigate("/patient/vault")} className="btn btn-patient">
            Upload Record
          </button>
        </div>
      )}

      {activeRecordType && (
        <RecordModal type={activeRecordType} onClose={handleRecordModalClose} />
      )}
    </div>
  );
}
