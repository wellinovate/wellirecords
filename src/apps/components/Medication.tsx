import React from 'react';
import { MedicationRecord } from '../patient/pages/MedicationsPage';
import { Pill, RefreshCw } from 'lucide-react';

function getDisplayStatus(status?: string | null) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "active") return "active";
  if (normalized === "completed") return "completed";
  if (normalized === "paused") return "paused";

  return "paused";
}
function formatDose(med: MedicationRecord) {
  if (!med.dosage?.value) return "Dose not specified";
  return `${med.dosage.value}${med.dosage.unit ? ` ${med.dosage.unit}` : ""}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG");
}

function formatSubtitle(med: MedicationRecord) {
  return [formatDose(med), med.frequency, med.route]
    .filter(Boolean)
    .join(" · ");
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


const Medication = ({visibleRecords}:any) => {
  console.log("🚀 ~ Medication ~ visibleRecords:", visibleRecords)
  return (
    <div className="space-y-3 grid grid-cols-2 gap-3 w-full">
          {visibleRecords.map((med: any) => {
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
                        {med.medicationName || med?.title}
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
                      {med.subtitle || "—"}
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
  );
}

export default Medication;
