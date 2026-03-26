import { getUsersRecords } from "@/shared/utils/utilityFunction";
import { AlertTriangle, Pill, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface MedicationRecord {
  id: string;
  medicationName: string;
  genericName?: string | null;
  brandName?: string | null;
  dosage?: {
    value?: number | string;
    unit?: string;
  } | null;
  frequency?: string | null;
  route?: string | null;
  form?: string | null;
  indication?: string | null;
  medicationStatus?: "active" | "completed" | "paused" | string;
  adherence?: string | null;
  prescribedBy?: string | null;
  prescribedByName?: string | null;
  prescribedByEmail?: string | null;
  prescribedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Active" },
  completed: {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    label: "Completed",
  },
  paused: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Paused" },
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG");
}

function formatDose(med: MedicationRecord) {
  if (!med.dosage?.value) return "Dose not specified";
  return `${med.dosage.value}${med.dosage.unit ? ` ${med.dosage.unit}` : ""}`;
}

function formatSubtitle(med: MedicationRecord) {
  return [formatDose(med), med.frequency, med.route]
    .filter(Boolean)
    .join(" · ");
}

function getDisplayStatus(status?: string | null) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "active") return "active";
  if (normalized === "completed") return "completed";
  if (normalized === "paused") return "paused";

  return "paused";
}

export function MedicationsPage() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [record, setRecord] = useState<MedicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const result = await getUsersRecords("medications", 1, 10);
      setRecord(result.items || []);
    } catch (err: any) {
      console.log("🚀 ~ loadRecords ~ err.message:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const active = useMemo(
    () =>
      record.filter(
        (m) => (m.medicationStatus || "").toLowerCase() === "active"
      ),
    [record]
  );

  const history = useMemo(
    () =>
      record.filter(
        (m) => (m.medicationStatus || "").toLowerCase() !== "active"
      ),
    [record]
  );

  const visibleRecords = tab === "active" ? active : history;

  const interactionNotice = record.find((m) => m.notes)?.notes;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#1e293b" }}>
          My Medications
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Active prescriptions, refills, and medication history.
        </p>
      </div>

      {!!interactionNotice && (
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <AlertTriangle
            size={15}
            className="flex-shrink-0 mt-0.5"
            style={{ color: "#f59e0b" }}
          />
          <div style={{ color: "#78350f" }}>
            <strong>Medication note:</strong> {interactionNotice}
          </div>
        </div>
      )}

      <div
        className="flex gap-1 p-1 rounded-xl mb-5 w-fit border"
        style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
      >
        {[
          { key: "active", label: `Active (${active.length})` },
          { key: "history", label: `History (${history.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "active" | "history")}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold"
            style={{
              background: tab === t.key ? "#0d9488" : "transparent",
              color: tab === t.key ? "#fff" : "#64748b",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border animate-pulse"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl"
                    style={{ background: "rgba(13,148,136,0.08)" }}
                  />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-56 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-5 w-16 rounded-full bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 rounded bg-slate-100" />
              </div>

              <div className="flex items-center justify-between">
                <div className="h-3 w-32 rounded bg-slate-100" />
                <div className="h-8 w-24 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleRecords.length === 0 ? (
        <div
          className="rounded-2xl border p-6 text-sm"
          style={{ background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
        >
          No medication records found.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRecords.map((med) => {
            const statusKey = getDisplayStatus(med.medicationStatus);
            const st = STATUS_CFG[statusKey];

            return (
              <div
                key={med.id}
                className="rounded-2xl p-5 border"
                style={{ background: "#fff", borderColor: "#e2e8f0" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(13,148,136,0.08)" }}
                    >
                      <Pill size={16} style={{ color: "#0d9488" }} />
                    </div>

                    <div>
                      <div
                        className="font-black text-base"
                        style={{ color: "#1e293b" }}
                      >
                        {med.medicationName}
                      </div>

                      <div className="text-sm" style={{ color: "#475569" }}>
                        {formatSubtitle(med)}
                      </div>
                    </div>
                  </div>

                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span style={{ color: "#94a3b8" }}>Generic: </span>
                    <span style={{ color: "#475569" }}>
                      {med.genericName || "—"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8" }}>Brand: </span>
                    <span style={{ color: "#475569" }}>
                      {med.brandName || "—"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8" }}>Prescribed By: </span>
                    <span style={{ color: "#475569" }}>
                      {/* {formatDate(med.prescribedAt)} */}
                      {med?.prescribedByName ?? med?.prescribedByEmail}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#94a3b8" }}>Prescribed At: </span>
                    <span style={{ color: "#475569" }}>
                      {formatDate(med.prescribedAt)}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8" }}>Route: </span>
                    <span style={{ color: "#475569" }}>
                      {med.route || "—"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8" }}>Form: </span>
                    <span style={{ color: "#475569" }}>
                      {med.form || "—"}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "#94a3b8" }}>Adherence: </span>
                    <span style={{ color: "#475569", textTransform: "capitalize" }}>
                      {med.adherence || "—"}
                    </span>
                  </div>

                  {(med.startDate || med.endDate) && (
                    <>
                      <div>
                        <span style={{ color: "#94a3b8" }}>Started: </span>
                        <span style={{ color: "#475569" }}>
                          {formatDate(med.startDate)}
                        </span>
                      </div>

                      <div>
                        <span style={{ color: "#94a3b8" }}>Ended: </span>
                        <span style={{ color: "#475569" }}>
                          {formatDate(med.endDate)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {(med.indication || med.notes) && (
                  <div
                    className="rounded-xl px-3 py-2 text-xs mb-3"
                    style={{ background: "#f8fafc", color: "#475569" }}
                  >
                    {med.indication && (
                      <div>
                        <span style={{ color: "#94a3b8" }}>Indication: </span>
                        {med.indication}
                      </div>
                    )}
                    {med.notes && (
                      <div className={med.indication ? "mt-1" : ""}>
                        <span style={{ color: "#94a3b8" }}>Notes: </span>
                        {med.notes}
                      </div>
                    )}
                  </div>
                )}

                {statusKey === "active" && (
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "#64748b" }}
                    >
                      <RefreshCw size={11} />
                      Active medication
                    </div>

                    <button
                      className="text-xs font-bold px-3 py-1.5 rounded-xl"
                      style={{
                        background: "rgba(13,148,136,0.1)",
                        color: "#0d9488",
                      }}
                    >
                      Request Refill
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}