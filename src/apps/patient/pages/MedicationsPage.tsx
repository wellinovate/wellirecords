import { getUsersRecords } from "@/shared/utils/utilityFunction";
import { AlertTriangle, Pill, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface MedicationRecord {
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
  return [formatDose(med)]
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
    <div className="animate-fade-in max-w-7xl">
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
        <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
  {visibleRecords.map((med) => {
  const statusKey = getDisplayStatus(med.medicationStatus);
  const st = STATUS_CFG[statusKey];

  return (
    <div
      key={med.id}
      className="rounded-2xl border border-slate-200 bg-white p-5"
      style={{
        borderLeft: "4px solid #0d9488",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
            <Pill size={16} className="text-teal-600" />
          </div>

          <div>
            <div className="text-base font-black text-slate-800">
              {med.medicationName}
            </div>

            <div className="text-sm text-slate-600">
              {formatSubtitle(med)}
            </div>

            {/* Important clinical chips */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {med?.dose && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Dose {med.dose}
                </span>
              )}

              {med?.frequency && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  Frequency: {med.frequency}
                </span>
              )}

              {med?.route && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Route: {med.route}
                </span>
              )}

              {med?.duration && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Duration: {med.duration}
                </span>
              )}
            </div>
          </div>
        </div>

        <span
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize"
          style={{ background: st.bg, color: st.color }}
        >
          {st.label}
        </span>
      </div>

      <div>
          {med.duration && <>
          <span className="text-slate-400">Duration: </span>
            <span style={{ color: "#475569" }}>
              {med?.duration}
            </span>
          </> 
          
          }
          </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          {med.genericName && (
            <span className="text-slate-400">Generic: </span>
          )}
          <span className="text-slate-600">{med.genericName}</span>
        </div>
        

        <div>
          {med.brandName && <span className="text-slate-400">Brand: </span>}
          <span className="text-slate-600">{med.brandName}</span>
        </div>

        

        <div>
          <span className="text-slate-400">Prescribed By: </span>
          <span className="text-slate-600">
            {med?.prescribedByName ?? med?.prescribedByContactPersonName}
          </span>
        </div>

        <div>
          <span className="text-slate-400">Prescribed At: </span>
          <span className="text-slate-600">{formatDate(med.prescribedAt)}</span>
        </div>

        <div>
          <span className="text-slate-400">Form: </span>
          <span className="text-slate-600">{med.form || "—"}</span>
        </div>

        <div>
          <span className="text-slate-400">Adherence: </span>
          <span className="capitalize text-slate-600">
            {med.adherence || "—"}
          </span>
        </div>

        {(med.startDate || med.endDate) && (
          <>
            <div>
              <span className="text-slate-400">Started: </span>
              <span className="text-slate-600">{formatDate(med.startDate)}</span>
            </div>

            <div>
              <span className="text-slate-400">Ended: </span>
              <span className="text-slate-600">{formatDate(med.endDate)}</span>
            </div>
          </>
        )}
      </div>

      {(med.indication || med.notes) && (
        <div className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {med.indication && (
            <div>
              <span className="text-slate-400">Indication: </span>
              {med.indication}
            </div>
          )}
          {med.notes && (
            <div className={med.indication ? "mt-1" : ""}>
              <span className="text-slate-400">Notes: </span>
              {med.notes}
            </div>
          )}
        </div>
      )}

      {statusKey === "active" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <RefreshCw size={11} />
            Active medication
          </div>

          <button
            className="rounded-xl px-3 py-1.5 text-xs font-bold"
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