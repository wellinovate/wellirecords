import { useMemo, useState } from "react";
import {
  CalendarCheck,
  ClipboardPlus,
  Loader2,
  Plus,
  RefreshCw,
  Users,
  Clock3,
  CircleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthProvider";
import { formatDateTime } from "@/shared/utils/time";

import { useAppointments } from "@/modules/appointments/hooks";
import { useQueue } from "@/modules/queue/hooks";

import { WalkInModal } from "@/modules/queue/components/WalkInModal";
import { TriageModal } from "@/modules/queue/components/TriageModal";
import { StatusBadge } from "@/modules/queue/components/StatusBadge";
import { PriorityBadge } from "@/modules/queue/components/PriorityBadge";
import { SourceBadge } from "@/modules/queue/components/SourceBadge";
import { WaitTimeBadge } from "@/modules/queue/components/WaitTimeBadge";

import type { QueueItem } from "@/modules/queue/types";

export  function FrontDeskPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const organizationId =
    user?.sub ||
    user?.organization?._id ||
    user?.profile?.organizationId;

  const currentProviderId =
    user?.sub || user?._id || user?.userId || user?.profile?._id;

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);

  const appointmentParams = useMemo(
    () => ({
      organizationId,
      page: 1,
      limit: 10,
    }),
    [organizationId],
  );

  const queueParams = useMemo(
    () => ({
      organizationId,
      page: 1,
      limit: 12,
    }),
    [organizationId],
  );

  const {
    items: appointments,
    loading: appointmentsLoading,
    checkIn,
    markNoShow,
    refetch: refetchAppointments,
  } = useAppointments(appointmentParams);

  const {
    items: queueItems,
    loading: queueLoading,
    addWalkIn,
    moveToTriage,
    saveTriage,
    startEncounter,
    completeVisit,
    refetch: refetchQueue,
  } = useQueue(queueParams);

  if (!organizationId) {
    return (
      <div className="min-h-screen px-4 py-6 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          Organization not found for this provider account.
        </div>
      </div>
    );
  }

  const loading = appointmentsLoading || queueLoading;

  const waitingCount = queueItems.filter(
    (item) => item.workflowStatus === "waiting",
  ).length;

  const checkedInCount = queueItems.filter(
    (item) => item.workflowStatus === "checked-in",
  ).length;

  const urgentCount = queueItems.filter(
    (item) => item.priority === "urgent" || item.priority === "emergency",
  ).length;

  const handleRefresh = async () => {
    await Promise.all([refetchAppointments(), refetchQueue()]);
  };

  const handleStartEncounter = async (queueId: string) => {
    const res = await startEncounter(queueId, currentProviderId);
    const encounterId = res?.data?.encounter?._id;

    if (encounterId) {
      navigate(`/provider/encounters/${encounterId}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-2 py-5 text-white">
      <div className="mx-auto max-w-[1580px] space-y-5">
        {/* Header */}
        <div className="rounded-2xl border border-[#163761] bg-[#081b35]/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 border-b border-[#163761] px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-50">Front Desk</h1>
              <p className="mt-1 text-sm text-[#9FB3CF]">
                Manage arrivals, appointments, walk-ins, and queue flow from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-[#274d7e] bg-[#0b2447] px-4 py-2 text-sm font-medium text-white hover:bg-[#12315d]"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={() => setWalkInOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                <Plus size={16} />
                Add Walk-in
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Today's Appointments"
              value={appointments.length}
              icon={<CalendarCheck size={18} />}
              hint="Booked visits awaiting action"
            />

            <SummaryCard
              title="Checked In"
              value={checkedInCount}
              icon={<Users size={18} />}
              hint="Patients already arrived"
            />

            <SummaryCard
              title="Waiting"
              value={waitingCount}
              icon={<Clock3 size={18} />}
              hint="Ready for triage or consultation"
            />

            <SummaryCard
              title="Urgent Cases"
              value={urgentCount}
              icon={<CircleAlert size={18} />}
              hint="Urgent or emergency priority"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
          {/* Appointments section */}
          <section className="rounded-2xl border border-[#163761] bg-[#081b35]/40 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between border-b border-[#163761] px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-50">Today's Appointments</h2>
                <p className="text-sm text-[#9FB3CF]">
                  Check in booked patients and manage no-shows
                </p>
              </div>

              <button
                onClick={() => navigate("/provider/appointments")}
                className="rounded-xl border border-[#274d7e] bg-[#0b2447] px-3 py-2 text-sm font-medium text-white hover:bg-[#12315d]"
              >
                View all
              </button>
            </div>

            <div className="p-5">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="animate-spin text-blue-400" size={28} />
                </div>
              ) : appointments.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-sm text-[#9FB3CF]">
                        <th className="px-3 py-2">Patient</th>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Reason</th>
                        <th className="px-3 py-2">Provider</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((item) => (
                        <tr key={item._id} className="bg-[#0b2447]/70">
                          <td className="rounded-l-2xl px-3 py-4">
                            <div className="font-medium text-white">
                              {item.patientId?.fullName || "Unknown Patient"}
                            </div>
                            <div className="text-xs text-[#9FB3CF]">
                              {item.patientId?.wrId || "No WR-ID"}
                            </div>
                          </td>

                          <td className="px-3 py-4 text-sm text-[#D7E6FA]">
                            {formatDateTime(item.scheduledFor)}
                          </td>

                          <td className="px-3 py-4 text-sm text-[#D7E6FA]">
                            {item.reasonForVisit || "—"}
                          </td>

                          <td className="px-3 py-4 text-sm text-[#D7E6FA]">
                            {item.providerId?.fullName || "Unassigned"}
                          </td>

                          <td className="px-3 py-4">
                            <span className="rounded-full border border-[#274d7e] bg-[#102a4d] px-3 py-1 text-xs text-[#D7E6FA]">
                              {item.status}
                            </span>
                          </td>

                          <td className="rounded-r-2xl px-3 py-4">
                            <div className="flex flex-wrap gap-2">
                              {item.status === "booked" ? (
                                <>
                                  <button
                                    onClick={() => checkIn(item._id)}
                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
                                  >
                                    Check In
                                  </button>

                                  <button
                                    onClick={() => markNoShow(item._id)}
                                    className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium hover:bg-rose-500"
                                  >
                                    No Show
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-[#9FB3CF]">
                                  No action available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState text="No appointments found for this organization." />
              )}
            </div>
          </section>

          {/* Queue section */}
          <section className="rounded-2xl border border-[#163761] bg-[#081b35]/40 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between border-b border-[#163761] px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-50">Live Queue</h2>
                <p className="text-sm text-[#9FB3CF]">
                  Handle walk-ins and move patients through flow
                </p>
              </div>

              <button
                onClick={() => navigate("/provider/queue")}
                className="rounded-xl border border-[#274d7e] bg-[#0b2447] px-3 py-2 text-sm font-medium text-white hover:bg-[#12315d]"
              >
                Open queue
              </button>
            </div>

            <div className="space-y-4 p-5">
              {queueLoading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="animate-spin text-blue-400" size={28} />
                </div>
              ) : queueItems.length ? (
                queueItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-[#163761] bg-[#0b2447]/70 p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {item.patientId?.fullName || "Unknown Patient"}
                          </h3>
                          <p className="text-sm text-[#9FB3CF]">
                            {item.patientId?.wrId || "No WR-ID"} • {item.visitType}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={item.workflowStatus} />
                          <PriorityBadge priority={item.priority} />
                          <SourceBadge source={item.source} />
                          <WaitTimeBadge from={item.checkedInAt} />
                        </div>

                        <div className="space-y-1 text-sm text-[#D7E6FA]">
                          <p>
                            <span className="text-[#9FB3CF]">Complaint:</span>{" "}
                            {item.chiefComplaint || "—"}
                          </p>
                          <p>
                            <span className="text-[#9FB3CF]">Provider:</span>{" "}
                            {item.providerId?.fullName || "Unassigned"}
                          </p>
                          <p>
                            <span className="text-[#9FB3CF]">Checked In:</span>{" "}
                            {formatDateTime(item.checkedInAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.workflowStatus === "checked-in" && (
                          <button
                            onClick={() => moveToTriage(item._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-sm font-medium hover:bg-amber-500"
                          >
                            <ClipboardPlus size={16} />
                            Start Triage
                          </button>
                        )}

                        {(item.workflowStatus === "checked-in" ||
                          item.workflowStatus === "triage" ||
                          item.workflowStatus === "waiting") && (
                          <button
                            onClick={() => {
                              setSelectedQueueItem(item);
                              setTriageOpen(true);
                            }}
                            className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-medium hover:bg-cyan-500"
                          >
                            Triage Form
                          </button>
                        )}

                        {item.workflowStatus === "waiting" && (
                          <button
                            onClick={() => handleStartEncounter(item._id)}
                            className="rounded-xl bg-purple-600 px-3 py-2 text-sm font-medium hover:bg-purple-500"
                          >
                            Start Encounter
                          </button>
                        )}

                        {item.workflowStatus === "in-progress" && item.encounterId?._id && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/provider/encounters/${item.encounterId?._id}`)
                              }
                              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500"
                            >
                              Open Encounter
                            </button>

                            <button
                              onClick={() => completeVisit(item._id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
                            >
                              Complete Visit
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No patients currently in queue." />
              )}
            </div>
          </section>
        </div>
      </div>

      <WalkInModal
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSubmit={addWalkIn}
        organizationId={organizationId}
      />

      <TriageModal
        open={triageOpen}
        queueItem={selectedQueueItem}
        onClose={() => {
          setTriageOpen(false);
          setSelectedQueueItem(null);
        }}
        onSubmit={saveTriage}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[#163761] bg-[#0b2447]/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[#9FB3CF]">{title}</span>
        <span className="rounded-lg bg-blue-500/10 p-2 text-blue-300">{icon}</span>
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-xs text-[#9FB3CF]">{hint}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#163761] px-6 py-12 text-center text-[#9FB3CF]">
      {text}
    </div>
  );
}