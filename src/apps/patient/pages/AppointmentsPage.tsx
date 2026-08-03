import React, { useMemo, useState } from "react";
import {
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  Building2,
  Plus,
  Video,
  X,
  Loader2,
  ChevronRight,
  ArrowRight,
  Ban,
  PhoneCall,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useAppointments } from "@/modules/appointments/hooks";
import { BookAppointmentModal } from "@/modules/appointments/components/BookAppointmentModal";
import { formatDateTime } from "@/shared/utils/time";
import { Link } from "react-router-dom";

// ─── Design tokens ────────────────────────────────────────────────────────────

const PAT = {
  primary: "var(--pat-primary, #0d9488)",
  text: "var(--pat-text, #1e293b)",
  muted: "var(--pat-muted, #64748b)",
  surface: "var(--pat-surface, #fff)",
  surface2: "var(--pat-surface2, #f1f5f9)",
  border: "var(--pat-border, #e2e8f0)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCountdown(scheduledFor: string) {
  const d = new Date(scheduledFor);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", color: "#dc2626" };
  if (diffDays === 0) return { label: "Today", color: "#dc2626" };
  if (diffDays === 1) return { label: "Tomorrow", color: "#ea580c" };
  return { label: `In ${diffDays} days`, color: "#0d9488" };
}

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  string,
  { label: string; badge: string; bar: string; iconColor: string }
> = {
  booked: {
    label: "Booked",
    badge: "bg-[#EAF2FF] text-[#2563EB] border border-[#BFDBFE]",
    bar: "bg-gradient-to-b from-[#60A5FA] to-[#2563EB]",
    iconColor: "#2563EB",
  },
  "checked-in": {
    label: "Checked-in",
    badge: "bg-[#ECFDF3] text-[#1D8348] border border-[#B7E4C7]",
    bar: "bg-gradient-to-b from-[#6FCF97] to-[#27AE60]",
    iconColor: "#1D8348",
  },
  completed: {
    label: "Completed",
    badge: "bg-[#EAFBF8] text-[#0F766E] border border-[#BEE3DB]",
    bar: "bg-gradient-to-b from-[#5EEAD4] to-[#14B8A6]",
    iconColor: "#0F766E",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]",
    bar: "bg-gradient-to-b from-[#FDA4AF] to-[#FB7185]",
    iconColor: "#E11D48",
  },
  "no-show": {
    label: "No Show",
    badge: "bg-[#FFF7ED] text-[#D97706] border border-[#FED7AA]",
    bar: "bg-gradient-to-b from-[#FDBA74] to-[#F59E0B]",
    iconColor: "#D97706",
  },
};

const getStatus = (s?: string) =>
  STATUS_MAP[s ?? ""] ?? {
    label: s || "Unknown",
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    bar: "bg-slate-300",
    iconColor: "#64748b",
  };

// ─── Upcoming Appointment Card ───────────────────────────────────────────────

function UpcomingCard({
  apt,
  onCancel,
}: {
  apt: any;
  onCancel: (id: string) => void;
}) {
  const statusUI = getStatus(apt.status);
  const isVirtual = !apt.providerId;
  const countdown = apt.scheduledFor ? getCountdown(apt.scheduledFor) : null;

  return (
    <div
      className="overflow-hidden rounded-[24px] transition-all hover:-translate-y-0.5"
      style={{
        background: PAT.surface,
        border: `1px solid ${PAT.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex">
        {/* Status bar */}
        <div className={`w-1.5 flex-shrink-0 ${statusUI.bar}`} />

        <div className="flex-1 p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${statusUI.iconColor}14` }}
            >
              {isVirtual ? (
                <Video size={22} style={{ color: statusUI.iconColor }} />
              ) : (
                <Building2 size={22} style={{ color: statusUI.iconColor }} />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold truncate" style={{ color: PAT.text }}>
                  {apt?.organizationId?.organizationName || "Medical Appointment"}
                </h3>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusUI.badge}`}>
                  {statusUI.label}
                </span>
                {countdown && (
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${countdown.color}12`, color: countdown.color }}
                  >
                    {countdown.label}
                  </span>
                )}
              </div>

              {apt.providerId?.fullName && (
                <p className="mt-1 text-sm font-semibold" style={{ color: "#2563eb" }}>
                  {apt.providerId.fullName}
                </p>
              )}

              {apt?.organizationId?.accountId?.email && (
                <p className="mt-0.5 text-xs" style={{ color: PAT.muted }}>
                  {apt.organizationId.accountId.email}
                </p>
              )}

              {apt.reasonForVisit && (
                <p className="mt-1.5 text-sm" style={{ color: PAT.muted }}>
                  {apt.reasonForVisit}
                </p>
              )}

              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: PAT.muted }}>
                <Calendar size={12} /> {formatDateTime(apt.scheduledFor)}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {isVirtual && apt.status === "booked" && (
                  <Link
                    to={`/patient/telemedicine`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: "rgba(37,99,235,0.10)",
                      border: "1px solid rgba(37,99,235,0.20)",
                      color: "#2563eb",
                    }}
                  >
                    <Video size={12} /> Join Telemedicine
                  </Link>
                )}
                {apt.status === "booked" && (
                  <button
                    onClick={() => onCancel(apt._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: "rgba(225,29,72,0.07)",
                      border: "1px solid rgba(225,29,72,0.15)",
                      color: "#e11d48",
                    }}
                  >
                    <X size={12} /> Cancel
                  </button>
                )}
                {apt.status === "booked" && (
                  <Link
                    to="/patient/find-care"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: PAT.surface2,
                      border: `1px solid ${PAT.border}`,
                      color: PAT.muted,
                    }}
                  >
                    <CalendarClock size={12} /> Reschedule
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────────

function HistoryCard({ apt }: { apt: any }) {
  const statusUI = getStatus(apt.status);
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-4 transition-all"
      style={{
        background: PAT.surface,
        border: `1px solid ${PAT.border}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${statusUI.iconColor}12` }}
      >
        <Building2 size={16} style={{ color: statusUI.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: PAT.text }}>
          {apt?.organizationId?.organizationName || "Medical Visit"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: PAT.muted }}>
          {formatDateTime(apt.scheduledFor)} · {apt.reasonForVisit || "No reason added"}
        </p>
      </div>
      <span className={`flex-shrink-0 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusUI.badge}`}>
        {statusUI.label}
      </span>
    </div>
  );
}

// ─── Stats Header ─────────────────────────────────────────────────────────────

function StatsChip({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{
        background: PAT.surface,
        border: `1px solid ${PAT.border}`,
      }}
    >
      <Icon size={14} style={{ color }} />
      <span className="text-sm font-semibold" style={{ color: PAT.text }}>{count}</span>
      <span className="text-xs" style={{ color: PAT.muted }}>{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AppointmentsPage() {
  const { user } = useAuth();
  const [showBook, setShowBook] = useState(false);

  const patientId = user?.sub || user?._id || user?.patientId || user?.profile?._id;
  const defaultOrganizationId =
    user?.selectedOrganizationId || user?.lastOrganizationId || "";

  const params = useMemo(
    () => ({ patientId, page: 1, limit: 50 }),
    [patientId],
  );

  const { items, loading, createAppointment, cancelAppointment } =
    useAppointments(params);

  const upcoming = items.filter(
    (a) => a.status === "booked" || a.status === "checked-in",
  );
  const history = items.filter(
    (a) =>
      a.status === "completed" ||
      a.status === "cancelled" ||
      a.status === "no-show",
  );

  return (
    <div className="max-w-3xl animate-fade-in pb-10">
      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display section-header" style={{ color: PAT.text }}>
            Appointments
          </h1>
          <p className="text-sm mt-1" style={{ color: PAT.muted }}>
            Book and manage your healthcare appointments
          </p>
        </div>
        <button
          onClick={() => setShowBook(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            boxShadow: "0 4px 14px rgba(37,99,235,0.30)",
          }}
        >
          <Plus size={15} /> Book Appointment
        </button>
      </div>

      {/* ── Stats chips ── */}
      <div className="flex flex-wrap gap-2 mb-7">
        <StatsChip icon={CalendarClock} label="Upcoming" count={upcoming.length} color="#2563eb" />
        <StatsChip icon={CheckCircle}   label="Completed" count={history.filter(a => a.status === "completed").length} color="#0d9488" />
        <StatsChip icon={Ban}           label="Cancelled" count={history.filter(a => a.status === "cancelled").length} color="#e11d48" />
      </div>

      {/* ── Upcoming ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: PAT.muted }}>
            <ChevronRight size={13} style={{ color: "#2563eb" }} /> Upcoming ({upcoming.length})
          </h2>
          <Link
            to="/patient/find-care"
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: "#2563eb" }}
          >
            Find a provider <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl p-10" style={{ background: PAT.surface2 }}>
            <Loader2 className="animate-spin" size={22} style={{ color: "#0d9488" }} />
            <span className="ml-3 text-sm" style={{ color: PAT.muted }}>Loading...</span>
          </div>
        ) : upcoming.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: PAT.surface, border: `2px dashed ${PAT.border}` }}
          >
            <CalendarClock size={28} className="mx-auto mb-3" style={{ color: PAT.muted }} />
            <p className="text-sm font-semibold" style={{ color: PAT.text }}>
              No upcoming appointments
            </p>
            <p className="mt-1 text-xs" style={{ color: PAT.muted }}>
              Book an appointment to get started.
            </p>
            <button
              onClick={() => setShowBook(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mx-auto"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)" }}
            >
              <Plus size={14} /> Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((apt) => (
              <UpcomingCard key={apt._id} apt={apt} onCancel={cancelAppointment} />
            ))}
          </div>
        )}
      </section>

      {/* ── History ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: PAT.muted }}>
          <ChevronRight size={13} style={{ color: PAT.muted }} /> History ({history.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl p-10" style={{ background: PAT.surface2 }}>
            <Loader2 className="animate-spin" size={22} style={{ color: "#0d9488" }} />
            <span className="ml-3 text-sm" style={{ color: PAT.muted }}>Loading...</span>
          </div>
        ) : history.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: PAT.surface, border: `2px dashed ${PAT.border}` }}
          >
            <Clock size={28} className="mx-auto mb-3" style={{ color: PAT.muted }} />
            <p className="text-sm font-semibold" style={{ color: PAT.text }}>
              No appointment history yet
            </p>
            <p className="mt-1 text-xs" style={{ color: PAT.muted }}>
              Completed or cancelled appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((apt) => (
              <HistoryCard key={apt._id} apt={apt} />
            ))}
          </div>
        )}
      </section>

      {/* ── Book Modal ── */}
      <BookAppointmentModal
        open={showBook}
        onClose={() => setShowBook(false)}
        onSubmit={createAppointment}
        patientId={patientId}
        organizationId={defaultOrganizationId}
      />
    </div>
  );
}