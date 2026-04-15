import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  Loader2,
  Play,
  Plus,
  QrCode,
  Stethoscope,
  Users,
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

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border text-white shadow-[0_2px_10px_rgba(15,23,42,0.06)] ${className}`}
      style={{
        border: "1px solid rgba(132,162,255,0.10)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-100">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[#9FB3CF]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  hint,
  icon,
  loading,
}: {
  title: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[#9FB3CF]">{title}</span>
        <span className="rounded-lg bg-blue-500/10 p-2 text-blue-300">{icon}</span>
      </div>

      {loading ? (
        <div className="flex min-h-[52px] items-center">
          <Loader2 className="animate-spin text-blue-400" size={22} />
          <span className="ml-2 text-sm text-[#9FB3CF]">Loading...</span>
        </div>
      ) : (
        <>
          <div className="text-3xl font-semibold text-white">{value}</div>
          <p className="mt-2 text-xs text-[#9FB3CF]">{hint}</p>
        </>
      )}
    </Card>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#163761] px-6 py-10 text-center">
      <p className="text-base font-medium text-slate-100">{title}</p>
      <p className="mt-2 text-sm text-[#9FB3CF]">{description}</p>
    </div>
  );
}

function BoxLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center">
      <div className="flex items-center gap-3 text-[#9FB3CF]">
        <Loader2 className="animate-spin text-blue-400" size={22} />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-[96px] w-full flex-col items-center justify-center rounded-xl border border-[#163761] bg-[#0b2447]/70 transition hover:bg-[#12315d]"
    >
      <div className="mb-2 rounded-full bg-white/10 p-2.5 shadow-sm">
        <Icon className="h-5 w-5 text-slate-100" />
      </div>
      <span className="text-center text-[12px] font-medium leading-4 text-slate-100">
        {label}
      </span>
    </button>
  );
}

export function ProviderDashboard() {
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
      limit: 8,
    }),
    [organizationId],
  );

  const queueParams = useMemo(
    () => ({
      organizationId,
      page: 1,
      limit: 8,
    }),
    [organizationId],
  );

  const {
    items: appointments,
    loading: appointmentsLoading,
    checkIn,
    markNoShow,
  } = useAppointments(appointmentParams);

  const {
    items: queueItems,
    loading: queueLoading,
    addWalkIn,
    moveToTriage,
    saveTriage,
    startEncounter,
    completeVisit,
  } = useQueue(queueParams);
  console.log("🚀 ~ ProviderDashboard ~ items:", queueItems)

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-transparent p-4 md:p-6">
        <div className="mx-auto max-w-[1440px]">
          <Card className="p-6">
            <p className="text-base font-medium text-slate-100">
              No organization data yet
            </p>
            <p className="mt-2 text-sm text-[#9FB3CF]">
              This provider account is not linked to an organization profile yet.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const todayAppointments = appointments;
  const checkedInCount = queueItems.filter(
    (item) => item.workflowStatus === "checked-in",
  ).length;
  const waitingCount = queueItems.filter(
    (item) => item.workflowStatus === "waiting",
  ).length;
  const inProgressCount = queueItems.filter(
    (item) => item.workflowStatus === "in-progress",
  ).length;

  const attentionItems = [
    ...queueItems
      .filter(
        (item) =>
          item.priority === "urgent" || item.priority === "emergency",
      )
      .slice(0, 2)
      .map(
        (item) =>
          `${item.patientId?.fullName || "Unknown patient"} marked ${item.priority}`,
      ),
    ...queueItems
      .filter((item) => item.workflowStatus === "waiting")
      .slice(0, 2)
      .map(
        (item) =>
          `${item.patientId?.fullName || "Unknown patient"} waiting for consultation`,
      ),
    ...appointments
      .filter((item) => item.status === "booked")
      .slice(0, 2)
      .map(
        (item) =>
          `${item.patientId?.fullName || "Unknown patient"} appointment awaiting check-in`,
      ),
  ].slice(0, 5);

  const handleStartEncounter = async (queueId: string) => {
    const res = await startEncounter(queueId, currentProviderId);
    const encounterId = res?.data?.encounter?._id;

    if (encounterId) {
      navigate(`/provider/encounters/${encounterId}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6">
      <div className="mx-auto max-w-[1440px] space-y-5 rounded-[22px] bg-transparent p-1">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Today's Appointments"
            value={todayAppointments.length}
            hint="Booked visits on your schedule"
            icon={<CalendarClock size={18} />}
            loading={appointmentsLoading}
          />
          <SummaryCard
            title="Checked In"
            value={checkedInCount}
            hint="Patients already arrived"
            icon={<Users size={18} />}
            loading={queueLoading}
          />
          <SummaryCard
            title="Waiting"
            value={waitingCount}
            hint="Patients ready for next action"
            icon={<ClipboardList size={18} />}
            loading={queueLoading}
          />
          <SummaryCard
            title="In Progress"
            value={inProgressCount}
            hint="Active consultations underway"
            icon={<Stethoscope size={18} />}
            loading={queueLoading}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          {/* Needs Attention */}
          <Card className="p-5 md:p-6">
            <SectionHeader
              title="Needs Attention"
              subtitle="Items that may require action now"
            />

            {appointmentsLoading || queueLoading ? (
              <BoxLoader text="Loading alerts..." />
            ) : attentionItems.length ? (
              <div className="space-y-4 pl-1">
                {attentionItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-left text-sm text-slate-100"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No urgent items yet"
                description="There are no urgent queue, wait-state, or appointment issues showing at the moment."
              />
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-5 md:p-6">
            <SectionHeader
              title="Quick Actions"
              subtitle="Jump into the most common daily tasks"
            />

            <div className="grid grid-cols-2 gap-3">
              <QuickAction
                icon={Plus}
                label="Add Walk-in"
                onClick={() => setWalkInOpen(true)}
              />
              <QuickAction
                icon={ClipboardList}
                label="Open Front Desk"
                onClick={() => navigate("/provider/front-desk")}
              />
              <QuickAction
                icon={CalendarClock}
                label="Appointments"
                onClick={() => navigate("/provider/appointments")}
              />
              <QuickAction
                icon={QrCode}
                label="Queue"
                onClick={() => navigate("/provider/queue")}
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* Today's Appointments */}
          <Card className="p-5">
            <SectionHeader
              title="Today's Appointments"
              subtitle="Check in booked patients or mark no-show"
              action={
                <button
                  onClick={() => navigate("/provider/appointments")}
                  className="rounded-xl border border-[#274d7e] bg-[#0b2447] px-3 py-2 text-sm font-medium text-white hover:bg-[#12315d]"
                >
                  View All
                </button>
              }
            />

            {appointmentsLoading ? (
              <BoxLoader text="Loading appointments..." />
            ) : todayAppointments.length ? (
              <div className="overflow-hidden rounded-lg border border-[#163761] bg-[#0b2447]/45">
                <table className="w-full text-left">
                  <thead className="bg-[#10233f] text-xs font-semibold text-[#9FB3CF]">
                    <tr>
                      <th className="px-3 py-3">Patient</th>
                      <th className="px-3 py-3">Scheduled</th>
                      <th className="px-3 py-3">Reason</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppointments.map((item, index) => (
                      <tr
                        key={item._id}
                        className={
                          index !== todayAppointments.length - 1
                            ? "border-b border-[#163761]"
                            : ""
                        }
                      >
                        <td className="px-3 py-3 text-sm text-slate-100">
                          <div className="font-medium">
                            {item.patientId?.fullName || "Unknown Patient"}
                          </div>
                          <div className="text-xs text-[#9FB3CF]">
                            {item.patientId?.wrId || "No WR-ID"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-[#D7E6FA]">
                          {formatDateTime(item.scheduledFor)}
                        </td>
                        <td className="px-3 py-3 text-sm text-[#D7E6FA]">
                          {item.reasonForVisit || "—"}
                        </td>
                        <td className="px-3 py-3 text-sm text-[#D7E6FA]">
                          {item.status}
                        </td>
                        <td className="px-3 py-3">
                          {item.status === "booked" ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => checkIn(item._id)}
                                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Check In
                              </button>
                              <button
                                onClick={() => markNoShow(item._id)}
                                className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                              >
                                No Show
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9FB3CF]">
                              No action available
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No appointments yet"
                description="No booked appointments are available for this organization right now."
              />
            )}
          </Card>

          {/* Live Queue */}
          <Card className="p-5">
            <SectionHeader
              title="Live Queue"
              subtitle="Patients currently moving through care flow"
              action={
                <button
                  onClick={() => navigate("/provider/queue")}
                  className="rounded-xl border border-[#274d7e] bg-[#0b2447] px-3 py-2 text-sm font-medium text-white hover:bg-[#12315d]"
                >
                  Open Queue
                </button>
              }
            />

            {queueLoading ? (
              <BoxLoader text="Loading queue..." />
            ) : queueItems.length ? (
              <div className="space-y-3">
                {queueItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-[#163761] bg-[#0b2447]/65 p-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {item.patientId?.fullName || "Unknown Patient"}
                        </h3>
                        <p className="text-xs text-[#9FB3CF]">
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
                          <span className="text-[#9FB3CF]">Checked In:</span>{" "}
                          {formatDateTime(item.checkedInAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.workflowStatus === "checked-in" && (
                          <button
                            onClick={() => moveToTriage(item._id)}
                            className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                          >
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
                            className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700"
                          >
                            Triage Form
                          </button>
                        )}

                        {item.workflowStatus === "waiting" && (
                          <button
                            onClick={() => handleStartEncounter(item._id)}
                            className="inline-flex items-center gap-2 rounded bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                          >
                            <Play size={14} />
                            Start Encounter
                          </button>
                        )}

                        {item.workflowStatus === "in-progress" &&
                          item.encounterId?._id && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/provider/encounters/${item.encounterId?._id}`,
                                  )
                                }
                                className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Open Encounter
                              </button>

                              <button
                                onClick={() => completeVisit(item._id)}
                                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Complete Visit
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No queue yet"
                description="No patients are currently checked in or waiting in the queue."
              />
            )}
          </Card>
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