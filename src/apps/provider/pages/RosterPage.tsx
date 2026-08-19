import React, { useEffect, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  getAllRosters,
  createRoster,
  publishRoster,
  addDutyAssignment,
  checkInDutyAssignment,
  checkOutDutyAssignment,
  type Roster,
  type DutyAssignment,
} from "@/shared/api/rostersApi";
import { teamApi, type TeamMember } from "@/shared/api/teamApi";
import { useRoster } from "@/hooks/useRoster";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Users,
  Building2,
  ChevronRight,
  Loader2,
  X,
  Radio,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Search,
} from "lucide-react";

const cardStyle = {
  background: "rgba(7,24,48,0.5)",
  border: "1px solid #163761",
};

const DEPARTMENTS = [
  "General / All Departments",
  "Emergency & Trauma (ER)",
  "Internal Medicine",
  "Surgery & Operating Theatres",
  "Nursing & Inpatient Wards",
  "Pediatrics & Neonatal",
  "Obstetrics & Gynaecology",
  "Laboratory & Diagnostics",
  "Pharmacy & Dispense",
  "Radiology & Imaging",
  "Outpatient Clinic",
  "Intensive Care Unit (ICU)",
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "rgba(148,163,184,.15)", text: "#94a3b8" },
  review: { bg: "rgba(245,158,11,.15)", text: "#f59e0b" },
  published: { bg: "rgba(56,189,248,.15)", text: "#38bdf8" },
  active: { bg: "rgba(16,185,129,.15)", text: "#10b981" },
  completed: { bg: "rgba(148,163,184,.15)", text: "#94a3b8" },
  scheduled: { bg: "rgba(148,163,184,.15)", text: "#94a3b8" },
  "checked-in": { bg: "rgba(16,185,129,.15)", text: "#10b981" },
  late: { bg: "rgba(245,158,11,.15)", text: "#f59e0b" },
  absent: { bg: "rgba(248,113,113,.15)", text: "#f87171" },
  cancelled: { bg: "rgba(148,163,184,.15)", text: "#94a3b8" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: c.bg, color: c.text }}
    >
      {status.replace("-", " ")}
    </span>
  );
}

function SoonBadge({ text = "SOON" }: { text?: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider rounded border"
      style={{
        background: "rgba(245,158,11,0.12)",
        color: "#f59e0b",
        borderColor: "rgba(245,158,11,0.3)",
      }}
    >
      {text}
    </span>
  );
}

function staffIdOf(staffId: DutyAssignment["staffId"]): string {
  return typeof staffId === "string" ? staffId : staffId._id;
}

function currentUserId(user: any): string | undefined {
  return user?.id ?? user?._id ?? user?.sub ?? user?.userId;
}

function staffLabel(staffId: DutyAssignment["staffId"]): string {
  if (typeof staffId === "string") return staffId;
  return (
    staffId.fullName ||
    `${staffId.firstName ?? ""} ${staffId.lastName ?? ""}`.trim() ||
    staffId._id
  );
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "";
  try {
    const s = new Date(start).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (!end) return s;
    const e = new Date(end).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `${s} – ${e}`;
  } catch {
    return `${start} – ${end || ""}`;
  }
}

function RosterWorkflowCard() {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4 max-w-4xl"
      style={{ background: "rgba(7,24,48,0.35)", borderColor: "#163761" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <CalendarDays size={16} className="text-sky-400" />
          <span>How Duty Rosters Work</span>
        </h3>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}
        >
          Staff Operations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div
          className="p-3.5 rounded-xl border space-y-1.5 flex flex-col justify-between"
          style={{ background: "rgba(7,24,48,0.5)", borderColor: "#163761" }}
        >
          <div className="space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Building2 size={13} className="text-sky-400" />
              <span>Shift Coverage</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "#7ba3c8" }}>
              Assign doctors, nurses, lab scientists, and hospital staff to daily regular, day-call, or night-call shifts by department and date.
            </p>
          </div>
          <div className="pt-1">
            <span className="text-[10px] font-semibold text-emerald-400">✓ Active in portal</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl border space-y-1.5 flex flex-col justify-between"
          style={{ background: "rgba(7,24,48,0.5)", borderColor: "#163761" }}
        >
          <div className="space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock size={13} className="text-emerald-400" />
              <span>Check-In &amp; Late Tracking</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "#7ba3c8" }}>
              Staff check in and out upon arrival with an automatic 15-minute grace period and late time logging.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-emerald-400">✓ In-App Check-In</span>
            <SoonBadge text="Biometrics SOON" />
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl border space-y-1.5 flex flex-col justify-between"
          style={{ background: "rgba(7,24,48,0.5)", borderColor: "#163761" }}
        >
          <div className="space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Radio size={13} className="text-sky-400" />
              <span>Live In-App Sync</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "#7ba3c8" }}>
              Published rosters, shift assignments, and attendance updates synchronize in real time across active provider sessions via WebSockets.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-emerald-400">✓ WebSocket Live</span>
            <SoonBadge text="Terminals SOON" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateRosterForm({
  onCreated,
  onCancel,
}: {
  onCreated: (r: Roster) => void;
  onCancel: () => void;
}) {
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [title, setTitle] = useState("");
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate title based on Department + Date Range unless user manually overrides
  useEffect(() => {
    if (!isCustomTitle) {
      if (periodStart && periodEnd) {
        const range = formatDateRange(periodStart, periodEnd);
        setTitle(`${department} · ${range}`);
      } else {
        setTitle(`${department} Schedule`);
      }
    }
  }, [department, periodStart, periodEnd, isCustomTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const roster = await createRoster({
        title: title.trim() || `${department} Schedule`,
        department,
        periodStart,
        periodEnd,
      });
      onCreated(roster);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not create roster");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 space-y-4 border max-w-2xl"
      style={cardStyle}
    >
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "#163761" }}>
        <div>
          <div className="text-sm font-bold text-slate-100">Create New Duty Roster</div>
          <div className="text-xs" style={{ color: "#7ba3c8" }}>
            Set a scheduling period and department to organize staff duty assignments
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Department / Clinical Scope
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} style={{ color: "#000" }}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Roster Title
          </label>
          <input
            required
            placeholder="e.g. Emergency & Trauma · Aug 21 – Aug 22, 2026"
            value={title}
            onChange={(e) => {
              setIsCustomTitle(true);
              setTitle(e.target.value);
            }}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Period Start
          </label>
          <input
            required
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Period End
          </label>
          <input
            required
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
      </div>

      {error && (
        <div
          className="text-xs p-3 rounded-xl border"
          style={{ background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.25)", color: "#fca5a5" }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 cursor-pointer"
        >
          <Plus size={14} />
          {submitting ? "Creating Roster..." : "Create Roster"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-all text-slate-300 hover:text-white cursor-pointer"
          style={{ borderColor: "#163761" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddAssignmentForm({
  rosterId,
  defaultLocation = "",
  defaultDate = "",
  onAdded,
  onCancel,
}: {
  rosterId: string;
  defaultLocation?: string;
  defaultDate?: string;
  onAdded: () => void;
  onCancel?: () => void;
}) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [customStaffId, setCustomStaffId] = useState("");
  const [staffRole, setStaffRole] = useState("doctor");
  const [duty, setDuty] = useState("regular");
  const [location, setLocation] = useState(defaultLocation || "Main Clinical Floor");
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTeam(true);
    teamApi
      .listMembers()
      .then((members) => {
        setTeamMembers(members || []);
        if (members && members.length > 0) {
          const first = members[0];
          setSelectedStaffId(first.userId);
          if (first.role === "nurse") setStaffRole("nurse");
          else if (first.role === "lab_tech") setStaffRole("laboratory-technician");
          else if (first.role === "pharmacist") setStaffRole("pharmacist");
          else setStaffRole("doctor");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTeam(false));
  }, []);

  const handleMemberChange = (userId: string) => {
    setSelectedStaffId(userId);
    const member = teamMembers.find((m) => m.userId === userId);
    if (member) {
      if (member.role === "nurse") setStaffRole("nurse");
      else if (member.role === "lab_tech") setStaffRole("laboratory-technician");
      else if (member.role === "pharmacist") setStaffRole("pharmacist");
      else if (member.role === "doctor" || member.role === "clinician") setStaffRole("doctor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const targetStaffId = selectedStaffId || customStaffId;
    if (!targetStaffId) {
      setError("Please select or specify a staff member");
      return;
    }

    setSubmitting(true);
    try {
      await addDutyAssignment(rosterId, {
        staffId: targetStaffId,
        staffRole,
        duty,
        location,
        date,
        startTime,
        endTime,
      });
      onAdded();
      if (onCancel) onCancel();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not add assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4 border max-w-4xl" style={cardStyle}>
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "#163761" }}>
        <div>
          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Plus size={15} className="text-sky-400" />
            <span>Schedule Staff Member</span>
          </div>
          <div className="text-xs" style={{ color: "#7ba3c8" }}>
            Assign a clinician or team member to this roster's duty shift
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Staff Member
          </label>
          {teamMembers.length > 0 ? (
            <select
              value={selectedStaffId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
            >
              {teamMembers.map((m) => (
                <option key={m.userId} value={m.userId} style={{ color: "#000" }}>
                  {m.name || m.email} ({m.role.replace("_", " ")})
                </option>
              ))}
            </select>
          ) : (
            <input
              required
              placeholder="Staff User ID or Profile ID"
              value={customStaffId}
              onChange={(e) => setCustomStaffId(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
            />
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Role
          </label>
          <select
            value={staffRole}
            onChange={(e) => setStaffRole(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          >
            {[
              "doctor",
              "nurse",
              "pharmacist",
              "laboratory-scientist",
              "laboratory-technician",
              "radiographer",
              "optometrist",
              "admin",
              "driver",
              "other",
            ].map((r) => (
              <option key={r} value={r} style={{ color: "#000" }}>
                {r.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Duty Shift Type
          </label>
          <select
            value={duty}
            onChange={(e) => setDuty(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          >
            {[
              "regular",
              "day-call",
              "night-call",
              "weekend",
              "public-holiday",
              "emergency-on-call",
              "standby",
              "leave",
              "off-duty",
            ].map((d) => (
              <option key={d} value={d} style={{ color: "#000" }}>
                {d.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Department / Station Location
          </label>
          <input
            required
            placeholder="e.g. Emergency Ward, Theatre 1, Main Lab"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Shift Date
          </label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            Start Time
          </label>
          <input
            required
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold block" style={{ color: "#dbe6f2" }}>
            End Time
          </label>
          <input
            required
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
            style={{ background: "rgba(7,24,48,0.6)", border: "1px solid #163761", color: "#e2eaf4" }}
          />
        </div>
      </div>

      {error && (
        <div
          className="text-xs p-3 rounded-xl border"
          style={{ background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.25)", color: "#fca5a5" }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 cursor-pointer"
        >
          <Plus size={14} />
          {submitting ? "Adding Assignment..." : "Save Duty Assignment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-all text-slate-300 hover:text-white cursor-pointer"
            style={{ borderColor: "#163761" }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function AssignmentRow({
  assignment,
  currentUserId: staffAuthId,
  onChanged,
}: {
  assignment: DutyAssignment;
  currentUserId?: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const isOwnAssignment =
    staffAuthId && staffIdOf(assignment.staffId) === staffAuthId;

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      await checkInDutyAssignment(assignment.id, { method: "standard" });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    try {
      await checkOutDutyAssignment(assignment.id, {});
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-3 py-3.5 px-3 rounded-xl border border-transparent hover:border-[#163761] hover:bg-[#092244]/40 transition-all border-b last:border-b-0"
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate flex items-center gap-2" style={{ color: "#e2eaf4" }}>
          <span>{staffLabel(assignment.staffId)}</span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border"
            style={{
              background: "rgba(56,189,248,0.08)",
              borderColor: "rgba(56,189,248,0.2)",
              color: "#38bdf8",
            }}
          >
            {assignment.staffRole.replace("-", " ")}
          </span>
        </div>
        <div className="text-xs mt-1 flex items-center flex-wrap gap-2" style={{ color: "#7ba3c8" }}>
          <span className="capitalize font-medium text-slate-300">
            {assignment.duty.replace("-", " ")}
          </span>
          <span>·</span>
          <span>{assignment.location}</span>
          <span>·</span>
          <span>{new Date(assignment.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ({assignment.startTime}–{assignment.endTime})</span>
          {assignment.lateByMinutes ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
              <AlertTriangle size={11} /> {assignment.lateByMinutes}m late
            </span>
          ) : null}
          {assignment.overtimeMinutes ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              +{assignment.overtimeMinutes}m overtime
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={assignment.status} />
        {isOwnAssignment && !assignment.checkedInAt && assignment.status !== "cancelled" && (
          <button
            onClick={handleCheckIn}
            disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
            style={{ background: "rgba(16,185,129,.15)", color: "#10b981" }}
          >
            <Clock size={12} /> Check in
          </button>
        )}
        {isOwnAssignment && assignment.checkedInAt && !assignment.checkedOutAt && (
          <button
            onClick={handleCheckOut}
            disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
            style={{ background: "rgba(56,189,248,.15)", color: "#38bdf8" }}
          >
            <CheckCircle2 size={12} /> Check out
          </button>
        )}
      </div>
    </div>
  );
}

function RosterDetail({
  rosterId,
  onBack,
}: {
  rosterId: string;
  onBack: () => void;
}) {
  const { roster, loading, refetch } = useRoster(rosterId);
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishRoster(rosterId);
      refetch();
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !roster) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-xs" style={{ color: "#7ba3c8" }}>
        <Loader2 size={16} className="animate-spin text-sky-400" /> Loading roster details...
      </div>
    );
  }

  const canEdit = roster.status === "draft" || roster.status === "review";
  const assignments = roster.assignments || [];
  const checkedInCount = assignments.filter((a) => a.status === "checked-in" || a.status === "completed").length;
  const scheduledCount = assignments.filter((a) => a.status === "scheduled").length;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <button
        onClick={onBack}
        className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        style={{ color: "#7ba3c8" }}
      >
        ← Back to all rosters
      </button>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border" style={cardStyle}>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold font-display" style={{ color: "#e2eaf4" }}>
              {roster.title}
            </h2>
            <StatusBadge status={roster.status} />
          </div>
          <div className="text-xs mt-2 flex items-center flex-wrap gap-3" style={{ color: "#7ba3c8" }}>
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <Building2 size={13} /> {roster.department || "General / All Departments"}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <CalendarDays size={13} /> {new Date(roster.periodStart).toLocaleDateString()} – {new Date(roster.periodEnd).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer"
            >
              <Plus size={14} />
              {showAddForm ? "Close Form" : "Schedule Staff"}
            </button>
          )}
          {canEdit && (
            <button
              onClick={handlePublish}
              disabled={publishing || assignments.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 cursor-pointer"
              title={assignments.length === 0 ? "Add at least one duty assignment before publishing" : "Publish Roster"}
            >
              <Send size={13} />
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border" style={{ background: "rgba(7,24,48,0.4)", borderColor: "#163761" }}>
          <div className="text-[11px] font-semibold" style={{ color: "#7ba3c8" }}>Total Scheduled</div>
          <div className="text-lg font-bold text-slate-100 mt-0.5">{assignments.length}</div>
        </div>
        <div className="p-3.5 rounded-xl border" style={{ background: "rgba(7,24,48,0.4)", borderColor: "#163761" }}>
          <div className="text-[11px] font-semibold" style={{ color: "#7ba3c8" }}>On Duty / Checked In</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{checkedInCount}</div>
        </div>
        <div className="p-3.5 rounded-xl border" style={{ background: "rgba(7,24,48,0.4)", borderColor: "#163761" }}>
          <div className="text-[11px] font-semibold" style={{ color: "#7ba3c8" }}>Upcoming Shifts</div>
          <div className="text-lg font-bold text-sky-400 mt-0.5">{scheduledCount}</div>
        </div>
        <div className="p-3.5 rounded-xl border" style={{ background: "rgba(7,24,48,0.4)", borderColor: "#163761" }}>
          <div className="text-[11px] font-semibold" style={{ color: "#7ba3c8" }}>Roster State</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1.5" style={{ color: STATUS_COLORS[roster.status]?.text || "#94a3b8" }}>
            {roster.status}
          </div>
        </div>
      </div>

      {/* Inline Form when open */}
      {canEdit && showAddForm && (
        <AddAssignmentForm
          rosterId={rosterId}
          defaultLocation={roster.department && roster.department !== "General / All Departments" ? roster.department : ""}
          defaultDate={roster.periodStart ? new Date(roster.periodStart).toISOString().split("T")[0] : ""}
          onAdded={refetch}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Duty Assignments List or Clean Actionable Empty State */}
      <div className="rounded-2xl p-5 border" style={cardStyle}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: "#163761" }}>
          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users size={16} className="text-sky-400" />
            <span>Duty Assignments ({assignments.length})</span>
          </div>
          {canEdit && !showAddForm && assignments.length > 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Add Staff
            </button>
          )}
        </div>

        {assignments.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(56,189,248,0.08)" }}
            >
              <Users size={22} className="text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">
                No staff assignments scheduled yet
              </p>
              <p className="text-xs max-w-md leading-relaxed mt-1" style={{ color: "#7ba3c8" }}>
                {canEdit
                  ? "Schedule doctors, nurses, and lab scientists to regular shifts, day-calls, or night-calls for this department."
                  : "This roster was published with no staff assignments recorded."}
              </p>
            </div>
            {canEdit && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-all mt-1 cursor-pointer shadow-lg"
              >
                <Plus size={14} />
                Schedule First Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {assignments.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                currentUserId={currentUserId(user)}
                onChanged={refetch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Operational Policy Note */}
      <div
        className="p-4 rounded-xl border text-xs space-y-1.5"
        style={{ background: "rgba(7,24,48,0.25)", borderColor: "#163761", color: "#7ba3c8" }}
      >
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <ShieldAlert size={13} className="text-sky-400" />
          <span>Roster Publishing &amp; Exception Policy</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          While in <strong>Draft</strong> or <strong>Review</strong>, shift assignments can be scheduled and adjusted freely. Once <strong>Published</strong>, any shift swaps, emergency on-calls, or cancellations are recorded with full audit trail timestamps.
        </p>
      </div>
    </div>
  );
}

export function RosterPage() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadRosters = () => {
    setLoading(true);
    getAllRosters()
      .then((res) => setRosters(res.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRosters();
  }, []);

  if (selectedRosterId) {
    return (
      <div className="animate-fade-in space-y-6 pb-12">
        <RosterDetail
          rosterId={selectedRosterId}
          onBack={() => setSelectedRosterId(null)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Header: Title on Left, Primary Action Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-header font-display" style={{ color: "#e2eaf4" }}>
            Roster &amp; Duty
          </h1>
          <p className="text-sm" style={{ color: "#7ba3c8" }}>
            Assign staff to shifts by day and department, manage on-call coverage, and track attendance
          </p>
        </div>

        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all text-slate-950 bg-sky-400 hover:bg-sky-300 shrink-0 cursor-pointer"
        >
          <Plus size={16} /> New Roster
        </button>
      </div>

      {showCreate && (
        <CreateRosterForm
          onCreated={(r) => {
            setShowCreate(false);
            loadRosters();
            setSelectedRosterId(r.id);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Roster List or Compact Empty State */}
      <div className="space-y-3 max-w-4xl">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-xs" style={{ color: "#7ba3c8" }}>
            <Loader2 size={16} className="animate-spin text-sky-400" /> Loading duty rosters...
          </div>
        )}

        {!loading && rosters.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center flex flex-col items-center gap-3 border"
            style={{ background: "rgba(7,24,48,0.5)", borderColor: "#163761" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(56,189,248,0.08)" }}
            >
              <CalendarDays size={24} className="text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">
                No duty rosters created yet
              </p>
              <p className="text-xs max-w-md leading-relaxed mt-1" style={{ color: "#7ba3c8" }}>
                Rosters organize doctors, nurses, and lab scientists into daily duty shifts (regular, day-call, night-call) with electronic check-in verification and overtime tracking.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-all mt-1 cursor-pointer shadow-lg"
            >
              <Plus size={14} />
              Create First Roster
            </button>
          </div>
        )}

        {!loading &&
          rosters.length > 0 &&
          rosters.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRosterId(r.id)}
              className="w-full flex items-center justify-between p-4.5 rounded-2xl border text-left cursor-pointer transition-all hover:bg-[#0c203b] group"
              style={{ background: "rgba(7,24,48,0.5)", borderColor: "#163761" }}
            >
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {r.title}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                    style={{
                      background: "rgba(56,189,248,0.08)",
                      borderColor: "rgba(56,189,248,0.2)",
                      color: "#38bdf8",
                    }}
                  >
                    <Building2 size={11} />
                    {r.department || "General / All Departments"}
                  </span>
                </div>
                <div className="text-xs mt-1.5 flex items-center gap-2" style={{ color: "#7ba3c8" }}>
                  <CalendarDays size={12} className="text-slate-400" />
                  <span>
                    {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={r.status} />
                <ChevronRight size={16} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
              </div>
            </button>
          ))}
      </div>

      {/* Workflow Explanatory Context Card */}
      <RosterWorkflowCard />
    </div>
  );
}

export default RosterPage;
