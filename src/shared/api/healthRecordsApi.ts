import { getPatientRecords } from "./clinicalApi";
import { HealthRecord } from "@/shared/types/types";

function fmtDate(d: string | null | undefined) {
  return d || new Date().toISOString();
}

// Maps each clinical module's real API response into the common
// HealthRecord shape the vault timeline renders. Any module that
// fails or has no items just contributes nothing — no fabricated
// fallback content.
export async function getMyHealthRecords(patientId: string): Promise<HealthRecord[]> {
  if (!patientId) return [];

  const [allergies, medications, vitals, labResults, procedures, immunizations, diagnoses] =
    await Promise.all([
      getPatientRecords("allergies", patientId, { limit: 50 }).catch(() => null),
      getPatientRecords("medications", patientId, { limit: 50 }).catch(() => null),
      getPatientRecords("vitals", patientId, { limit: 50 }).catch(() => null),
      getPatientRecords("lab-results", patientId, { limit: 50 }).catch(() => null),
      getPatientRecords("procedures", patientId, { limit: 50 }).catch(() => null),
      getPatientRecords("immunizations", patientId, { limit: 50 }).catch(() => null),
      getPatientRecords("diagnoses", patientId, { limit: 50 }).catch(() => null),
    ]);

  const records: HealthRecord[] = [];

  (allergies?.data?.items ?? []).forEach((a: any) => {
    records.push({
      id: a.id,
      title: a.allergen,
      date: fmtDate(a.createdAt),
      type: "Allergy",
      provider: a.source === "provider" ? "Provider-entered" : "Self-reported",
      summary: a.reaction || "No reaction details on file",
      status: a.verificationStatus === "provider-verified" ? "Verified" : "Pending",
      tags: ["allergy"],
    });
  });

  (medications?.data?.items ?? []).forEach((m: any) => {
    records.push({
      id: m.id,
      title: `${m.medicationName}${m.dosage?.value ? ` ${m.dosage.value}${m.dosage.unit || ""}` : ""}`,
      date: fmtDate(m.startDate || m.createdAt),
      type: "Prescription",
      provider: m.source === "provider" || m.source === "pharmacy" ? "Provider-entered" : "Self-reported",
      summary: [m.frequency, m.indication].filter(Boolean).join(" · ") || "No details on file",
      status: m.source === "provider" || m.source === "pharmacy" ? "Verified" : "Pending",
      tags: ["meds"],
    });
  });

  (vitals?.data?.items ?? []).forEach((v: any) => {
    const parts = [
      v.bloodPressure?.systolic != null ? `BP ${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}` : null,
      v.heartRate != null ? `HR ${v.heartRate}bpm` : null,
      v.bloodGlucose?.value != null ? `Glucose ${v.bloodGlucose.value}${v.bloodGlucose.unit || ""}` : null,
    ].filter(Boolean);
    records.push({
      id: v.id,
      title: "Vitals recorded",
      date: fmtDate(v.measuredAt),
      type: "Clinical Note",
      provider: v.source === "provider" ? "Provider-entered" : "Self-reported",
      summary: parts.join(" · ") || "No readings on file",
      status: v.source === "provider" ? "Verified" : "Pending",
      tags: ["vitals"],
    });
  });

  (labResults?.data?.items ?? []).forEach((l: any) => {
    records.push({
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
    });
  });

  (procedures?.data?.items ?? []).forEach((p: any) => {
    records.push({
      id: p.id,
      title: p.procedureName,
      date: fmtDate(p.performedAt || p.createdAt),
      type: "Imaging",
      provider: p.facilityName || "Provider-entered",
      summary: [p.bodySite, p.indication].filter(Boolean).join(" · ") || "No details on file",
      status: p.outcome ? "Verified" : "Pending",
      tags: ["procedures"],
    });
  });

  (immunizations?.data?.items ?? []).forEach((i: any) => {
    records.push({
      id: i.id,
      title: i.vaccineName,
      date: fmtDate(i.administeredAt || i.createdAt),
      type: "Vaccination",
      provider: i.manufacturer || "Provider-entered",
      summary: i.doseNumber ? `Dose ${i.doseNumber}${i.series ? ` of series ${i.series}` : ""}` : "No details on file",
      status: i.immunizationStatus === "completed" ? "Verified" : "Pending",
      tags: ["vaccination"],
    });
  });

  (diagnoses?.data?.items ?? []).forEach((d: any) => {
    records.push({
      id: d.id,
      title: d.diagnosisName,
      date: fmtDate(d.diagnosedAt || d.createdAt),
      type: "Chronic Condition",
      provider: "Provider-entered",
      summary: d.icd10Code ? `[${d.icd10Code}]` : d.clinicalStatus || "No details on file",
      status: d.diagnosisType === "confirmed" || d.diagnosisType === "chronic" ? "Verified" : "Pending",
      tags: ["diagnosis"],
    });
  });

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
