import { useEffect, useState } from "react";
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
import { useRoster } from "@/hooks/useRoster";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
} from "lucide-react";

const cardStyle = {
  background: "rgba(56,189,248,.06)",
  border: "1px solid rgba(56,189,248,.1)",
};

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

// staffId comes back as a raw string on create/update, but populated as
// an object ({ _id, fullName, ... }) when fetched via getRoster(). Both
// shapes need to work here without the page crashing on one of them.
function staffIdOf(staffId: DutyAssignment["staffId"]): string {
  return typeof staffId === "string" ? staffId : staffId._id;
}

function staffLabel(staffId: DutyAssignment["staffId"]): string {
  if (typeof staffId === "string") return staffId;
  return staffId.fullName || `${staffId.firstName ?? ""} ${staffId.lastName ?? ""}`.trim() || staffId._id;
}

function CreateRosterForm({ onCreated }: { onCreated: (r: Roster) => void }) {
  const [title, setTitle] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const roster = await createRoster({ title, periodStart, periodEnd });
      onCreated(roster);
      setTitle("");
      setPeriodStart("");
      setPeriodEnd("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not create roster");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-3" style={cardStyle}>
      <div className="text-sm font-semibold" style={{ color: "#e2eaf4" }}>
        New roster
      </div>
      <input
        required
        placeholder="Title, e.g. Week of Aug 18"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border"
        style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
      />
      <div className="flex gap-2">
        <input
          required
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        />
        <input
          required
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        />
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
        style={{ background: "#2F915C", color: "white" }}
      >
        <Plus size={14} />
        {submitting ? "Creating..." : "Create roster"}
      </button>
    </form>
  );
}

function AddAssignmentForm({ rosterId, onAdded }: { rosterId: string; onAdded: () => void }) {
  const [staffId, setStaffId] = useState("");
  const [staffRole, setStaffRole] = useState("nurse");
  const [duty, setDuty] = useState("regular");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await addDutyAssignment(rosterId, { staffId, staffRole, duty, location, date, startTime, endTime });
      onAdded();
      setStaffId("");
      setLocation("");
      setDate("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not add assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-2" style={cardStyle}>
      <div className="text-sm font-semibold mb-1" style={{ color: "#e2eaf4" }}>
        Add duty assignment
      </div>
      <input
        required
        placeholder="Staff ID (UserProfile _id)"
        value={staffId}
        onChange={(e) => setStaffId(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border"
        style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
      />
      <div className="flex gap-2">
        <select
          value={staffRole}
          onChange={(e) => setStaffRole(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        >
          {["doctor", "nurse", "pharmacist", "laboratory-scientist", "laboratory-technician", "radiographer", "optometrist", "admin", "driver", "other"].map(
            (r) => (
              <option key={r} value={r} style={{ color: "#000" }}>
                {r.replace("-", " ")}
              </option>
            ),
          )}
        </select>
        <select
          value={duty}
          onChange={(e) => setDuty(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        >
          {["regular", "day-call", "night-call", "weekend", "public-holiday", "emergency-on-call", "standby", "leave", "off-duty"].map((d) => (
            <option key={d} value={d} style={{ color: "#000" }}>
              {d.replace("-", " ")}
            </option>
          ))}
        </select>
      </div>
      <input
        required
        placeholder="Location, e.g. Ward A"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border"
        style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
      />
      <div className="flex gap-2">
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        />
        <input
          required
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        />
        <input
          required
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
          style={{ borderColor: "rgba(120,150,255,0.15)", color: "#e2eaf4" }}
        />
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
        style={{ background: "#2F915C", color: "white" }}
      >
        <Plus size={14} />
        {submitting ? "Adding..." : "Add assignment"}
      </button>
    </form>
  );
}

function AssignmentRow({
  assignment,
  currentUserId,
  onChanged,
}: {
  assignment: DutyAssignment;
  currentUserId?: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const isOwnAssignment = currentUserId && staffIdOf(assignment.staffId) === currentUserId;

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
    <div className="flex items-center justify-between gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "rgba(120,150,255,0.08)" }}>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: "#e2eaf4" }}>
          {staffLabel(assignment.staffId)}
          <span className="ml-2 text-[10px] font-normal uppercase tracking-wider" style={{ color: "#7ba3c8" }}>
            {assignment.staffRole.replace("-", " ")}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#7ba3c8" }}>
          {assignment.duty.replace("-", " ")} · {assignment.location} · {assignment.startTime}–{assignment.endTime}
          {assignment.lateByMinutes ? (
            <span className="ml-2 inline-flex items-center gap-1" style={{ color: "#f59e0b" }}>
              <AlertTriangle size={11} /> {assignment.lateByMinutes}m late
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
            style={{ background: "rgba(16,185,129,.15)", color: "#10b981" }}
          >
            <Clock size={12} /> Check in
          </button>
        )}
        {isOwnAssignment && assignment.checkedInAt && !assignment.checkedOutAt && (
          <button
            onClick={handleCheckOut}
            disabled={busy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
            style={{ background: "rgba(56,189,248,.15)", color: "#38bdf8" }}
          >
            <CheckCircle2 size={12} /> Check out
          </button>
        )}
      </div>
    </div>
  );
}

function RosterDetail({ rosterId, onBack }: { rosterId: string; onBack: () => void }) {
  const { roster, loading, refetch } = useRoster(rosterId);
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);

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
    return <div className="text-sm" style={{ color: "#7ba3c8" }}>Loading roster...</div>;
  }

  const canEdit = roster.status === "draft" || roster.status === "review";

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-semibold cursor-pointer" style={{ color: "#7ba3c8" }}>
        ← Back to rosters
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold" style={{ color: "#e2eaf4" }}>
              {roster.title}
            </h2>
            <StatusBadge status={roster.status} />
          </div>
          <div className="text-xs mt-1" style={{ color: "#7ba3c8" }}>
            {new Date(roster.periodStart).toLocaleDateString()} – {new Date(roster.periodEnd).toLocaleDateString()}
          </div>
        </div>
        {canEdit && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
            style={{ background: "#2F915C", color: "white" }}
          >
            <Send size={14} />
            {publishing ? "Publishing..." : "Publish roster"}
          </button>
        )}
      </div>

      {canEdit && <AddAssignmentForm rosterId={rosterId} onAdded={refetch} />}

      <div className="rounded-xl p-4" style={cardStyle}>
        <div className="text-sm font-semibold mb-2" style={{ color: "#e2eaf4" }}>
          Duty assignments
        </div>
        {roster.assignments.length === 0 ? (
          <div className="text-xs" style={{ color: "#7ba3c8" }}>
            No assignments yet.
          </div>
        ) : (
          roster.assignments.map((a) => (
            <AssignmentRow
              key={a.id}
              assignment={a}
              currentUserId={(user as any)?.sub || (user as any)?.userId || (user as any)?.id || (user as any)?._id}
              onChanged={refetch}
            />
          ))
        )}
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
      <div className="p-4 md:p-6">
        <RosterDetail rosterId={selectedRosterId} onBack={() => setSelectedRosterId(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={20} style={{ color: "#38bdf8" }} />
          <h1 className="text-lg font-bold" style={{ color: "#e2eaf4" }}>
            Roster & duty
          </h1>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
          style={{ background: "rgba(56,189,248,.15)", color: "#38bdf8" }}
        >
          <Plus size={14} />
          New roster
        </button>
      </div>

      {showCreate && (
        <CreateRosterForm
          onCreated={(r) => {
            setShowCreate(false);
            loadRosters();
            setSelectedRosterId(r.id);
          }}
        />
      )}

      <div className="rounded-xl p-4" style={cardStyle}>
        {loading ? (
          <div className="text-sm" style={{ color: "#7ba3c8" }}>Loading rosters...</div>
        ) : rosters.length === 0 ? (
          <div className="text-sm" style={{ color: "#7ba3c8" }}>
            No rosters yet. Create one to start scheduling duty assignments.
          </div>
        ) : (
          rosters.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRosterId(r.id)}
              className="w-full flex items-center justify-between py-3 border-b last:border-b-0 text-left cursor-pointer"
              style={{ borderColor: "rgba(120,150,255,0.08)" }}
            >
              <div>
                <div className="text-sm font-semibold" style={{ color: "#e2eaf4" }}>
                  {r.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#7ba3c8" }}>
                  {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default RosterPage;
