import { getPatientRecords } from "./clinicalApi";
import { HealthRecord } from "@/shared/types/types";

function fmtDate(d: string | null | undefined) {
  return d || new Date().toISOString();
}

type ModuleKey =
  | "allergies"
  | "medications"
  | "vitals"
  | "lab-results"
  | "procedures"
  | "immunizations"
  | "diagnoses";

const MODULES: ModuleKey[] = [
  "allergies",
  "medications",
  "vitals",
  "lab-results",
  "procedures",
  "immunizations",
  "diagnoses",
];

// Maps each clinical module's real API response into the common
// HealthRecord shape the vault timeline renders. Any module that
// fails or has no items just contributes nothing — no fabricated
// fallback content.
function mapModuleItems(module: ModuleKey, items: any[]): HealthRecord[] {
  switch (module) {
    case "allergies":
      return items.map((a: any) => ({
        id: a.id,
        title: a.allergen,
        date: fmtDate(a.createdAt),
        type: "Allergy",
        provider: a.source === "provider" ? "Provider-entered" : "Self-reported",
        summary: a.reaction || "No reaction details on file",
        status: a.verificationStatus === "provider-verified" ? "Verified" : "Pending",
        tags: ["allergy"],
      }));

    case "medications":
      return items.map((m: any) => ({
        id: m.id,
        title: `${m.medicationName}${m.dosage?.value ? ` ${m.dosage.value}${m.dosage.unit || ""}` : ""}`,
        date: fmtDate(m.startDate || m.createdAt),
        type: "Prescription",
        provider: m.source === "provider" || m.source === "pharmacy" ? "Provider-entered" : "Self-reported",
        summary: [m.frequency, m.indication].filter(Boolean).join(" · ") || "No details on file",
        status: m.source === "provider" || m.source === "pharmacy" ? "Verified" : "Pending",
        tags: ["meds"],
      }));

    case "vitals":
      return items.map((v: any) => {
        const parts = [
          v.bloodPressure?.systolic != null ? `BP ${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}` : null,
          v.heartRate != null ? `HR ${v.heartRate}bpm` : null,
          v.bloodGlucose?.value != null ? `Glucose ${v.bloodGlucose.value}${v.bloodGlucose.unit || ""}` : null,
        ].filter(Boolean);
        return {
          id: v.id,
          title: "Vitals recorded",
          date: fmtDate(v.measuredAt),
          type: "Clinical Note",
          provider: v.source === "provider" ? "Provider-entered" : "Self-reported",
          summary: parts.join(" · ") || "No readings on file",
          status: v.source === "provider" ? "Verified" : "Pending",
          tags: ["vitals"],
        };
      });

    case "lab-results":
      return items.map((l: any) => ({
        id: l.id,
        title: l.testName,
        date: fmtDate(l.resultedAt || l.collectedAt || l.createdAt),
        type: "Lab Result",
        provider: "Lab",
        summary: l.resultValue
          ? `${l.resultValue}${l.unit ? ` ${l.unit}` : ""}${l.interpretation ? ` (${l.interpretation})` : ""}`
          : "Result pending",
        status: l.verificationStatus === "lab-verified" || l.verificationStatus === "provider-reviewed" ? "Verified" : "Pending",
        tags: ["labs"],
      }));

    case "procedures":
      return items.map((p: any) => ({
        id: p.id,
        title: p.procedureName,
        date: fmtDate(p.performedAt || p.createdAt),
        type: "Imaging",
        provider: p.facilityName || "Provider-entered",
        summary: [p.bodySite, p.indication].filter(Boolean).join(" · ") || "No details on file",
        status: p.outcome ? "Verified" : "Pending",
        tags: ["procedures"],
      }));

    case "immunizations":
      return items.map((i: any) => ({
        id: i.id,
        title: i.vaccineName,
        date: fmtDate(i.administeredAt || i.createdAt),
        type: "Vaccination",
        provider: i.manufacturer || "Provider-entered",
        summary: i.doseNumber ? `Dose ${i.doseNumber}${i.series ? ` of series ${i.series}` : ""}` : "No details on file",
        status: i.immunizationStatus === "completed" ? "Verified" : "Pending",
        tags: ["vaccination"],
      }));

    case "diagnoses":
      return items.map((d: any) => ({
        id: d.id,
        title: d.diagnosisName,
        date: fmtDate(d.diagnosedAt || d.createdAt),
        type: "Chronic Condition",
        provider: "Provider-entered",
        summary: d.icd10Code ? `[${d.icd10Code}]` : d.clinicalStatus || "No details on file",
        status: d.diagnosisType === "confirmed" || d.diagnosisType === "chronic" ? "Verified" : "Pending",
        tags: ["diagnosis"],
      }));

    default:
      return [];
  }
}

// Unchanged behavior for existing callers: waits on every module before
// resolving. Kept for TeleconsultRoomPage, which only needs the final list.
export async function getMyHealthRecords(patientId: string): Promise<HealthRecord[]> {
  if (!patientId) return [];

  const results = await Promise.all(
    MODULES.map((module) =>
      getPatientRecords(module, patientId, { limit: 50 })
        .then((res) => mapModuleItems(module, res?.data?.items ?? []))
        .catch(() => [] as HealthRecord[]),
    ),
  );

  return results
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// The vault timeline fires 7 independent authenticated requests (one per
// clinical module). Waiting on Promise.all for all 7 means the page shows
// nothing until the slowest one finishes — on a cold backend that can be
// the full request timeout. This variant reports each module's records as
// soon as that module settles, so the UI can render progressively instead
// of blocking on the worst case. Returns a promise that resolves once every
// module has settled, in case a caller wants to know when loading is fully
// done.
export function fetchMyHealthRecordsProgressively(
  patientId: string,
  onModuleSettled: (records: HealthRecord[], module: ModuleKey) => void,
): Promise<void> {
  if (!patientId) return Promise.resolve();

  const tasks = MODULES.map((module) =>
    getPatientRecords(module, patientId, { limit: 50 })
      .then((res) => mapModuleItems(module, res?.data?.items ?? []))
      .catch(() => [] as HealthRecord[])
      .then((records) => {
        onModuleSettled(records, module);
      }),
  );

  return Promise.all(tasks).then(() => undefined);
}
