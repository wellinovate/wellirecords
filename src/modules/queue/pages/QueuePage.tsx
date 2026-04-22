import { useMemo, useState } from "react";
import { Loader2, Plus, Play, ClipboardPlus, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../hooks";
import { QueueFilters } from "../components/QueueFilters";
import { WalkInModal } from "../components/WalkInModal";
import { TriageModal } from "../components/TriageModal";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { SourceBadge } from "../components/SourceBadge";
import { WaitTimeBadge } from "../components/WaitTimeBadge";
import { formatDateTime } from "@/shared/utils/time";
import type { QueueItem } from "../types";
import { useAuth } from "@/shared/auth/AuthProvider";
import { EncounterRecordForm } from "@/apps/components/EncounterRecordForm";

type Props = {
  organizationId: string;
  currentProviderId?: string;
};

export default function QueuePage({ organizationId, currentProviderId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workflowStatus, setWorkflowStatus] = useState("");
  const [source, setSource] = useState("");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [activeCreateTab, setActiveCreateTab] = useState<string | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<{
    encounterId?: string;
    patientId?: string;
    queueId?: string;
    organizationId?: string;
    providerId?: string;
  } | null>(null);

  const params = useMemo(
    () => ({
      organizationId: user?.sub,
      workflowStatus: workflowStatus || undefined,
      source: source || undefined,
      page: 1,
      limit: 30,
    }),
    [user?.sub, workflowStatus, source],
  );

  const {
    items,
    loading,
    addWalkIn,
    moveToTriage,
    saveTriage,
    startEncounter,
    completeVisit,
  } = useQueue(params);

  const handleStartEncounter = async (item: QueueItem) => {
    const res = await startEncounter(item._id, currentProviderId);
    const encounterId = res?.data?.encounter?._id;

    if (encounterId) {
      setSelectedEncounter({
        encounterId,
        patientId: item.patientId?._id,
        queueId: item._id,
        organizationId: item.organizationId?._id,
        providerId: currentProviderId || item.providerId?._id,
      });
      setActiveCreateTab("Encounters");
    }
  };

  const handleOpenEncounter = (item: QueueItem) => {
    if (!item.encounterId?._id) return;

    setSelectedEncounter({
      encounterId: item.encounterId._id,
      patientId: item.patientId?._id,
      queueId: item._id,
      organizationId: item.organizationId?._id,
      providerId: currentProviderId || item.providerId?._id,
    });
    setActiveCreateTab("Encounters");
  };

  const LIVE_QUEUE_STATUSES = ["checked-in", "triage", "waiting", "in-progress"];

  const liveQueueItems = items.filter((item) =>
    LIVE_QUEUE_STATUSES.includes(item.workflowStatus),
  );

  const handleCloseCreateModal = () => {
    setActiveCreateTab(null);
    setSelectedEncounter(null);
  };

  return (
    <div className="min-h-screen bg-transparent px-2 py-5 text-white">
      <div className="mx-auto max-w-[1480px] rounded-2xl border border-[#163761] bg-[#081b35]/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="border-b border-[#163761] px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-50">Live Queue</h1>
              <p className="text-sm text-[#9FB3CF]">
                Monitor patient flow from check-in to consultation
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <QueueFilters
                workflowStatus={workflowStatus}
                source={source}
                onChange={({ workflowStatus, source }) => {
                  setWorkflowStatus(workflowStatus);
                  setSource(source);
                }}
              />

              <button
                onClick={() => setWalkInOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
              >
                <Plus size={16} />
                Add Walk-in
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={28} />
            </div>
          ) : (
            <div className="space-y-4">
              {liveQueueItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-[#163761] bg-[#0b2447]/70 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
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

                      <div className="grid gap-2 text-sm text-[#D7E6FA] md:grid-cols-2 xl:grid-cols-3">
                        <p>
                          <span className="text-[#9FB3CF]">Complaint:</span>{" "}
                          {item.chiefComplaint || "—"}
                        </p>
                        <p>
                          <span className="text-[#9FB3CF]">Provider:</span>{" "}
                          {item.providerId?.fullName || item.organizationId?.contactPersonName}
                        </p>
                        <p>
                          <span className="text-[#9FB3CF]">Checked In:</span>{" "}
                          {formatDateTime(item.checkedInAt)}
                        </p>
                        <p>
                          <span className="text-[#9FB3CF]">Organization:</span>{" "}
                          {item.organizationId?.organizationName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:w-[320px] xl:justify-end">
                      {item.workflowStatus === "checked-in" && (
                        <button
                          onClick={() => moveToTriage(item._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-sm font-medium hover:bg-amber-500"
                        >
                          <ClipboardPlus size={16} />
                          Start Triage
                        </button>
                      )}

                      {(item.workflowStatus === "triage" ||
                        item.workflowStatus === "checked-in" ||
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

                      {["checked-in", "triage", "waiting"].includes(item.workflowStatus) && (
                        <button
                          onClick={() => handleStartEncounter(item)}
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-3 py-2 text-sm font-medium hover:bg-purple-500"
                        >
                          <Play size={16} />
                          Start Encounter
                        </button>
                      )}

                      {item.workflowStatus === "in-progress" && item.encounterId?._id && (
                        <>
                          <button
                            onClick={() => handleOpenEncounter(item)}
                            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500"
                          >
                            Open Encounter
                          </button>

                          <button
                            onClick={() => completeVisit(item._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
                          >
                            <CheckCircle2 size={16} />
                            Complete Visit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {activeCreateTab === "Encounters" && selectedEncounter && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
    <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#163761] bg-[#081b35] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <button
        onClick={handleCloseCreateModal}
        className="absolute right-4 top-4 z-10 rounded-lg bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
      >
        Close
      </button>

      <div className="p-4 md:p-6">
        <EncounterRecordForm
          encounterId={selectedEncounter.encounterId}
          patientId={selectedEncounter.patientId}
          queueId={selectedEncounter.queueId}
          organizationId={selectedEncounter.organizationId}
          providerId={selectedEncounter.providerId}
          onClose={handleCloseCreateModal}
          onSuccess={async () => {
            handleCloseCreateModal();
          }}
        />
      </div>
    </div>
  </div>
)}

              {!liveQueueItems.length && (
                <div className="rounded-2xl border border-dashed border-[#163761] px-6 py-12 text-center text-[#9FB3CF]">
                  No queue items found
                </div>
              )}
            </div>
          )}
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