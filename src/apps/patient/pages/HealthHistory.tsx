import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Building2,
  UserRound,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  ClipboardList,
  Activity,
  Pill,
  FlaskConical,
  AlertTriangle,
  AlertCircle,
  HeartPulse,
  Syringe,
} from "lucide-react";
import {
  getEncounterDetails,
  getUsersEncounters,
} from "@/shared/utils/utilityFunction";
import { HealthHistoryLoader } from "@/apps/components/Loader/HealthHistoryLoader";
import { formatDate, InfoRow, RecordShell } from "@/apps/components/HealthCategoryHistoryPage";

type EncounterItem = {
  id: string;
  date: string;
  time: string;
  title: string;
  encounterType: EncounterType;
  status: EncounterStatus;
  facility: string;
  provider: string;
  reason: string;
  summary: string;
  vitals?: string[];
  diagnoses?: string[];
  medications?: string[];
  labs?: string[];
  notes?: string;
};
type EncounterStatus =
  | "scheduled"
  | "completed"
  | "ongoing"
  | "cancelled"
  | "follow-up";

type EncounterType =
  | "outpatient"
  | "emergency"
  | "telemedicine"
  | "admission"
  | "follow-up";

type EncounterListItem = {
  id: string;
  encounterName: string | null;
  encounterCode: string | null;
  encounterType: EncounterType;
  status: EncounterStatus;
  startedAt: string | null;
  endedAt: string | null;
  scheduledAt: string | null;
  organizationName: string | null;
  organizationFullName: string | null;
  chiefComplaint: string | null;
  reasonForVisit: string | null;
  notes: string | null;
};

const DUMMY_HISTORY: EncounterItem[] = [
  {
    id: "enc-001",
    date: "2026-03-16",
    time: "09:30 AM",
    title: "Outpatient Visit",
    encounterType: "outpatient",
    status: "completed",
    facility: "Lagos General Hospital",
    provider: "Dr. Fatima Aliyu",
    reason: "Persistent headache and elevated blood pressure",
    summary:
      "Patient evaluated for headache and hypertension. Blood pressure elevated. Medication adjustment advised.",
    vitals: ["BP: 150/95 mmHg", "HR: 84 bpm", "Temp: 36.8°C", "Weight: 74 kg"],
    diagnoses: ["Hypertension", "Tension headache"],
    medications: ["Amlodipine 5mg once daily", "Paracetamol 500mg as needed"],
    labs: ["Renal function test ordered"],
    notes:
      "Advised lifestyle modification, reduced salt intake, and follow-up in two weeks.",
  },
  {
    id: "enc-002",
    date: "2026-02-28",
    time: "02:10 PM",
    title: "Lab Review Follow-up",
    encounterType: "follow-up",
    status: "follow-up",
    facility: "WellSpring Clinic",
    provider: "Dr. Daniel Okeke",
    reason: "Review of previous test results",
    summary:
      "Lab results reviewed. Kidney function within normal range. Continue current treatment plan.",
    vitals: ["BP: 142/90 mmHg", "HR: 79 bpm"],
    diagnoses: ["Hypertension under monitoring"],
    medications: ["Continue Amlodipine 5mg once daily"],
    labs: ["Renal function: Normal", "Fasting blood sugar: Normal"],
    notes: "No urgent concerns. Continue home monitoring.",
  },
  {
    id: "enc-003",
    date: "2026-01-20",
    time: "07:45 PM",
    title: "Emergency Visit",
    encounterType: "emergency",
    status: "completed",
    facility: "CityCare Emergency Center",
    provider: "Dr. A. Musa",
    reason: "Severe dizziness and weakness",
    summary:
      "Patient presented with dizziness and weakness. Stabilized, evaluated, and discharged after observation.",
    vitals: ["BP: 160/100 mmHg", "HR: 96 bpm", "O2 Sat: 98%"],
    diagnoses: ["Hypertensive episode"],
    medications: ["Immediate antihypertensive given in facility"],
    labs: ["ECG performed", "Blood glucose checked"],
    notes:
      "Patient discharged same day after symptom improvement. Recommended urgent primary care review.",
  },
  {
    id: "enc-004",
    date: "2025-12-11",
    time: "11:00 AM",
    title: "Telemedicine Consultation",
    encounterType: "telemedicine",
    status: "completed",
    facility: "WelliRecord Virtual Care",
    provider: "Dr. Grace Nnadi",
    reason: "Medication side effects discussion",
    summary:
      "Reviewed mild ankle swelling likely related to medication. Risk assessed and monitoring advised.",
    vitals: ["Home BP: 138/88 mmHg"],
    diagnoses: ["Medication side effect monitoring"],
    medications: ["Continue medication with symptom monitoring"],
    notes:
      "Patient advised to report worsening swelling or shortness of breath immediately.",
  },
  {
    id: "enc-005",
    date: "2025-10-03",
    time: "08:20 AM",
    title: "Hospital Admission",
    encounterType: "admission",
    status: "cancelled",
    facility: "Prime Specialist Hospital",
    provider: "Dr. Chinedu Obi",
    reason: "Planned admission for extended observation",
    summary:
      "Admission was planned but cancelled after reassessment showed improved clinical stability.",
    diagnoses: ["Observation no longer required"],
    notes: "Patient remained stable and was managed as outpatient instead.",
  },
];

const statusStyles: Record<EncounterStatus, string> = {
  scheduled: "bg-[#E8F7EF] text-[#1F9D62]",
  completed: "bg-[#E8F7EF] text-[#1F9D62]",
  ongoing: "bg-[#EEF4FF] text-[#3662E3]",
  cancelled: "bg-[#FDECEC] text-[#D14343]",
  "follow-up": "bg-[#FFF4E8] text-[#D97706]",
};

const typeStyles: Record<EncounterType, string> = {
  outpatient: "bg-[#EFF6FF] text-[#2563EB]",
  emergency: "bg-[#FEF2F2] text-[#DC2626]",
  telemedicine: "bg-[#F5F3FF] text-[#7C3AED]",
  admission: "bg-[#ECFDF3] text-[#059669]",
  "follow-up": "bg-[#FFF7ED] text-[#EA580C]",
};

function formatEncounterDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DetailSection({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E6EBF2] bg-[#DAE5F7] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1F2A37]">
        <span className="text-[#5B708B]">{icon}</span>
        {title}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-sm text-[#516173]"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatVitals(vitals: any[] = []) {
  return vitals.flatMap((v) => {
    const rows: string[] = [];

    if (v?.bloodPressure?.systolic && v?.bloodPressure?.diastolic) {
      rows.push(
        `Blood Pressure: ${v.bloodPressure.systolic}/${v.bloodPressure.diastolic} mmHg`,
      );
    }

    if (v?.bloodGlucose?.value) {
      rows.push(
        `Blood Glucose: ${v.bloodGlucose.value} ${v.bloodGlucose.unit || ""}${
          v.bloodGlucose.fasting ? " (Fasting)" : ""
        }`,
      );
    }

    if (v?.temperature?.value) {
      rows.push(
        `Temperature: ${v.temperature.value}${v.temperature.unit || ""}`,
      );
    }

    if (v?.weight?.value) {
      rows.push(`Weight: ${v.weight.value} ${v.weight.unit || ""}`);
    }

    if (v?.height?.value) {
      rows.push(`Height: ${v.height.value} ${v.height.unit || ""}`);
    }

    return rows;
  });
}

function EncounterDetailContents({ detail }: { detail: any }) {
  const records = detail?.records || {};

  return (
    <div className="space-y-6">
      {/* Clinical Notes */}
      {detail?.encounter?.notes && (
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-4">
          <div className="mb-2 text-sm font-semibold text-[#1F2A37]">
            Clinical Notes
          </div>
          <p className="whitespace-pre-line text-sm leading-6 text-[#516173]">
            {detail.encounter.notes}
          </p>
        </div>
      )}

      {/* Records Grid */}
      <div className="grid gap-4">
        {/* Vitals */}
        {records.vitals?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <Activity size={20} />
              Vitals
            </div>
            <div className="space-y-3">
              {records.vitals.map((item: any) => renderRecordCard(item, "vitals"))}
            </div>
          </div>
        )}

        {/* Diagnoses */}
        {records.diagnoses?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <ClipboardList size={20} />
              Diagnoses
            </div>
            <div className="space-y-3">
              {records.diagnoses.map((item: any) => renderRecordCard(item, "diagnoses"))}
            </div>
          </div>
        )}

        {/* Medications */}
        {records.medications?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <Pill size={20} />
              Medications
            </div>
            <div className="space-y-3">
              {records.medications.map((item: any) => renderRecordCard(item, "medications"))}
            </div>
          </div>
        )}

        {/* Procedures */}
        {records.procedures?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <Stethoscope size={20} />   {/* Better icon than FlaskConical */}
              Procedures
            </div>
            <div className="space-y-3">
              {records.procedures.map((item: any) => renderRecordCard(item, "procedures"))}
            </div>
          </div>
        )}

        {/* Allergies */}
        {records.allergies?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <AlertTriangle size={20} />
              Allergies
            </div>
            <div className="space-y-3">
              {records.allergies.map((item: any) => renderRecordCard(item, "allergies"))}
            </div>
          </div>
        )}

        {/* Labs */}
        {records.labResults?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <FlaskConical size={20} />
              Lab Results
            </div>
            <div className="space-y-3">
              {records.labResults.map((item: any) => renderRecordCard(item, "lab"))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const renderRecordCard = (item: any, recordType: string) => {
  switch (recordType) {
    case "vitals":
      const vitalsSummary = [
        item.bloodPressure
          ? `BP ${item.bloodPressure.systolic}/${item.bloodPressure.diastolic}`
          : null,
        item.heartRate ? `HR ${item.heartRate} bpm` : null,
        item.temperature?.value
          ? `Temp ${item.temperature.value}°${item.temperature.unit || "C"}`
          : null,
      ]
        .filter(Boolean)
        .join(" • ");

      return (
        <RecordShell
          key={item.id}
          icon={<HeartPulse size={18} />}
          title="Vital Signs"
          subtitle={vitalsSummary || "Patient vital signs"}
          status="Recorded"
          metaLeft={
            <>
              <InfoRow label="Measured" value={formatDate(item.measuredAt)} />
              <InfoRow label="Respiratory Rate" value={item.respiratoryRate} />
            </>
          }
          metaRight={
            <>
              <InfoRow
                label="Oxygen Saturation"
                value={item.oxygenSaturation ? `${item.oxygenSaturation}%` : ""}
              />
              <InfoRow
                label="Blood Glucose"
                value={
                  item.bloodGlucose?.value
                    ? `${item.bloodGlucose.value} ${item.bloodGlucose.unit || ""}`
                    : ""
                }
              />
            </>
          }
          footerLeft={
            item.notes ? `Notes: ${item.notes}` : "Vitals history entry"
          }
          actionLabel="View Vital"
        >
          <div className="flex flex-wrap gap-2 text-sm text-[#475467]">
            {item.weight?.value && (
              <span>Weight: {item.weight.value} {item.weight.unit}</span>
            )}
            {item.height?.value && (
              <span>Height: {item.height.value} {item.height.unit}</span>
            )}
          </div>
        </RecordShell>
      );

    case "medications":
      const subtitle = [
        item.dosage?.value
          ? `${item.dosage.value}${item.dosage.unit ? ` ${item.dosage.unit}` : ""}`
          : null,
        item.frequency,
        item.route,
      ]
        .filter(Boolean)
        .join(" • ");

      return (
        <RecordShell
          key={item.id}
          icon={<Pill size={18} />}
          title={item.medicationName}
          subtitle={subtitle || "Medication entry"}
          status={item.medicationStatus || "Active"}
          metaLeft={
            <>
              <InfoRow
                label="Prescribed by"
                value={item.prescribedByName || item.prescriberName || "Unknown"}
              />
              <InfoRow label="Started" value={formatDate(item.prescribedAt)} />
            </>
          }
          metaRight={
            <>
              <InfoRow label="Generic" value={item.genericName} />
              <InfoRow label="Brand" value={item.brandName} />
            </>
          }
          footerLeft={
            item.indication
              ? `Indication: ${item.indication}`
              : item.notes || "Medication history entry"
          }
          actionLabel="Request Refill"
        >
          {item.notes && <p className="text-sm text-[#667085]">{item.notes}</p>}
        </RecordShell>
      );

    case "allergies":
      return (
        <RecordShell
          key={item.id}
          icon={<AlertCircle size={18} />}
          title={item.allergen}
          subtitle={
            [item.allergyType, item.reaction].filter(Boolean).join(" • ") ||
            "Allergy record"
          }
          status={item.clinicalStatus || "Active"}
          metaLeft={
            <>
              <InfoRow label="Severity" value={item.severity} />
              <InfoRow label="Verification" value={item.verificationStatus} />
            </>
          }
          metaRight={
            <>
              <InfoRow label="Type" value={item.allergyType} />
              <InfoRow label="Reaction" value={item.reaction} />
            </>
          }
          footerLeft={item.notes || "Allergy history entry"}
          actionLabel="View Allergy"
        />
      );

    case "diagnoses":
      return (
        <RecordShell
          key={item.id}
          icon={<Stethoscope size={18} />}
          title={item.diagnosisName}
          subtitle={
            [item.diagnosisType, item.icd10Code].filter(Boolean).join(" • ") ||
            "Diagnosis entry"
          }
          status={item.clinicalStatus || "Recorded"}
          metaLeft={
            <>
              <InfoRow label="Diagnosed" value={formatDate(item.diagnosedAt)} />
              <InfoRow label="ICD-10" value={item.icd10Code} />
            </>
          }
          metaRight={
            <>
              <InfoRow label="Type" value={item.diagnosisType} />
              <InfoRow label="Status" value={item.clinicalStatus} />
            </>
          }
          footerLeft={item.notes || "Diagnosis history entry"}
          actionLabel="View Diagnosis"
        />
      );

    case "procedures":
      return (
        <RecordShell
          key={item.id}
          icon={<Stethoscope size={18} />}
          title={item.procedureName || "Unknown Procedure"}
          subtitle={
            [item.procedureType, item.outcome]
              .filter(Boolean)
              .join(" • ") || "Surgical Procedure"
          }
          status={item.clinicalStatus || item.outcome || "Completed"}
          metaLeft={
            <>
              <InfoRow 
                label="Performed" 
                value={item.performedAt ? formatDate(item.performedAt) : "—"} 
              />
              <InfoRow 
                label="Indication" 
                value={item.indication || "—"} 
              />
            </>
          }
          metaRight={
            <>
              <InfoRow 
                label="Performed By" 
                value={item.performedBy || "—"} 
              />
              <InfoRow 
                label="Facility" 
                value={item.facilityName || "—"} 
              />
            </>
          }
          footerLeft={item.notes || "No additional notes"}
          actionLabel="View Details"
        />
      );

    case "lab":
      return (
        <RecordShell
          key={item.id}
          icon={<FlaskConical size={18} />}
          title={item.testName}
          subtitle={
            [item.resultValue, item.unit].filter(Boolean).join(" ") ||
            "Lab result"
          }
          status={item.interpretation || "Completed"}
          metaLeft={
            <>
              <InfoRow label="Resulted" value={formatDate(item.resultedAt)} />
              <InfoRow label="Category" value={item.category} />
            </>
          }
          metaRight={
            <>
              <InfoRow label="Specimen" value={item.specimen} />
              <InfoRow label="Interpretation" value={item.interpretation} />
            </>
          }
          footerLeft={item.notes || "Lab history entry"}
          actionLabel="View Result"
        />
      );

    default:
      return (
        <RecordShell
          key={item.id}
          icon={<Activity size={18} />}
          title="Record"
          subtitle="Health entry"
          status="Saved"
          footerLeft="Record entry"
          actionLabel="View Record"
        />
      );
  }
};

// ==================== ENCOUNTER DETAIL CONTENT ====================
function EncounterDetailContent({ detail }: { detail: any }) {
  const records = detail?.records || {};

  return (
    <div className="space-y-6">
      {/* Clinical Notes */}
      {detail?.encounter?.notes && (
        <div className="rounded-2xl border border-[#E6EBF2] bg-white p-4">
          <div className="mb-2 text-sm font-semibold text-[#1F2A37]">
            Clinical Notes
          </div>
          <p className="whitespace-pre-line text-sm leading-6 text-[#516173]">
            {detail.encounter.notes}
          </p>
        </div>
      )}

      {/* Records Sections */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
        {records.vitals?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <Activity size={20} />
              Vitals
            </div>
            <div className="space-y-3">
              {records.vitals.map((item: any) => renderRecordCard(item, "vitals"))}
            </div>
          </div>
        )}

        {records.diagnoses?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <ClipboardList size={20} />
              Diagnoses
            </div>
            <div className="space-y-3">
              {records.diagnoses.map((item: any) => renderRecordCard(item, "diagnoses"))}
            </div>
          </div>
        )}

        {records.medications?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <Pill size={20} />
              Medications
            </div>
            <div className="space-y-3">
              {records.medications.map((item: any) => renderRecordCard(item, "medications"))}
            </div>
          </div>
        )}

        {records.procedures?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <Stethoscope size={20} />
              Procedures
            </div>
            <div className="space-y-3">
              {records.procedures.map((item: any) => renderRecordCard(item, "procedures"))}
            </div>
          </div>
        )}

        {records.allergies?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <AlertTriangle size={20} />
              Allergies
            </div>
            <div className="space-y-3">
              {records.allergies.map((item: any) => renderRecordCard(item, "allergies"))}
            </div>
          </div>
        )}

        {records.labResults?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#1F2A37]">
              <FlaskConical size={20} />
              Lab Results
            </div>
            <div className="space-y-3">
              {records.labResults.map((item: any) => renderRecordCard(item, "lab"))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineNode({
  encounter,
  expanded,
  user,
  encounterDetail,
  loadingDetail,
  onToggle,
  onAdd,
  // onAdd={(type, encounter) => handleAddRecordFromEncounter(encounter, type)}
}: {
  encounter: EncounterListItem;
  expanded: boolean;
  encounterDetail?: any;
  loadingDetail?: boolean;
  onToggle: () => void;
}) {
  const dateTime = formatEncounterDateTime(
    encounter.startedAt || encounter.scheduledAt,
  );

  return (
    <div className="relative pl-3">
      <div className="absolute left-[11px] top-2 h-full w-px bg-[#075fc4]" />
      <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0456a8] shadow-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-white" />
      </div>

      <div className="rounded-[24px] border border-[#27634a]/40 bg-[#F9FBFD] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[
                    encounter.status as
                      | "completed"
                      | "ongoing"
                      | "cancelled"
                      | "follow-up"
                  ] || "bg-[#EEF4FF] text-[#3662E3]"
                }`}
              >
                {encounter.status}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  typeStyles[encounter.encounterType]
                }`}
              >
                {encounter.encounterType}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-[#1F2A37]">
              {encounter.encounterName ||
                encounter.reasonForVisit ||
                encounter.chiefComplaint ||
                "Encounter"}
            </h3>

            <p className="mt-1 text-sm text-[#667085]">
              {encounter.chiefComplaint ||
                encounter.reasonForVisit ||
                "No summary available"}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="flex items-start gap-2 text-sm text-[#667085]">
                <CalendarDays size={16} className="mt-0.5 text-[#8CA0B3]" />
                <div>
                  <p className="font-medium text-[#8CA0B3]">Date</p>
                  <p className="text-[#475467]">
                    {dateTime.date} · {dateTime.time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-[#667085]">
                <Building2 size={16} className="mt-0.5 text-[#8CA0B3]" />
                <div>
                  <p className="font-medium text-[#8CA0B3]">Facility</p>
                  <p className="text-[#475467]">
                    {encounter.organizationFullName ||
                      encounter.organizationName ||
                      "Unknown facility"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-[#667085]">
                <Stethoscope size={16} className="mt-0.5 text-[#8CA0B3]" />
                <div>
                  <p className="font-medium text-[#8CA0B3]">Reason</p>
                  <p className="text-[#475467]">
                    {encounter.reasonForVisit ||
                      encounter.chiefComplaint ||
                      "No reason provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#E9F1EF] px-4 py-2 text-sm font-semibold text-[#138A72] transition hover:bg-[#DCEAE6]"
            >
              {expanded ? "Hide Details" : "View Details"}
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {/* 🔥 ACTION BAR */}
            {user?.role === "organization" && user?.wrOrgId && (

            <div className="grid grid-cols-2 gap-2 text-green-700 mt-1">
              <button
                onClick={() => onAdd("Vitals", encounter)}
                className="text-[#E8F7EF] px-3 py-2 text-sm font-semibold bg-[#01475c] transition hover:bg-[#025a75] rounded-xl"
              >
                + Vital
              </button>

              <button
                onClick={() => onAdd("Medications", encounter)}
                className="text-[#E8F7EF] px-3 py-2 text-sm font-semibold bg-[#01475c] transition hover:bg-[#025a75] rounded-xl"
              >
                + Medication
              </button>

              <button
                onClick={() => onAdd("Diagnoses", encounter)}
                className="text-[#E8F7EF] px-3 py-2 text-sm font-semibold bg-[#01475c] transition hover:bg-[#025a75] rounded-xl"
              >
                + Diagnosis
              </button>

              <button
                onClick={() => onAdd("Lab Results", encounter)}
                className="text-[#E8F7EF] px-3 py-2 text-sm font-semibold bg-[#01475c] transition hover:bg-[#025a75] rounded-xl"
              >
                + Lab
              </button>

              <button
                onClick={() => onAdd("Allergies", encounter)}
                className="text-[#E8F7EF] px-3 py-2 text-sm font-semibold bg-[#01475c] transition hover:bg-[#025a75] rounded-xl"
              >
                + Allergy
              </button>
              <button
                onClick={() => onAdd("Procedures", encounter)}
                className="text-[#E8F7EF] px-3 py-2 text-sm font-semibold bg-[#01475c] transition hover:bg-[#025a75] rounded-xl"
              >
                + Procedure
              </button>
            </div>
            )} 
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-4 border-t border-[#E6EBF2] pt-3">
            {loadingDetail ? (
              <p className="text-sm text-[#667085]">Loading details...</p>
            ) : encounterDetail ? (
              <EncounterDetailContent detail={encounterDetail} />
            ) : (
              <p className="text-sm text-[#98A2B3]">No detail available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function HealthHistoryTimelinePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [encounters, setEncounters] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [encounterDetails, setEncounterDetails] = useState<Record<string, any>>(
    {},
  );

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const fetchEncounters = async () => {
    try {
      setLoadingList(true);
      const response = await getUsersEncounters(1, 10);
      setEncounters(response?.items || []);
    } catch (error) {
      console.error("Failed to fetch encounters", error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleViewMore = async (encounterId: string) => {
    const isOpen = expandedId === encounterId;

    if (isOpen) {
      setExpandedId(null);
      return;
    }

    setExpandedId(encounterId);

    if (encounterDetails[encounterId]) return;

    try {
      setLoadingDetailId(encounterId);
      const response = await getEncounterDetails(encounterId);
      console.log("🚀 ~ handleViewMore ~ response:", response);

      setEncounterDetails((prev) => ({
        ...prev,
        [encounterId]: response || null,
      }));
    } catch (error) {
      console.error("Failed to fetch encounter details", error);
    } finally {
      setLoadingDetailId(null);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();

    return encounters.filter((item) => {
      const matchesSearch =
        !q ||
        [
          item.encounterName,
          item.organizationName,
          item.organizationFullName,
          item.reasonForVisit,
          item.chiefComplaint,
          item.status,
          item.encounterType,
          item.notes || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesType =
        typeFilter === "all" || item.encounterType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [encounters, search, statusFilter, typeFilter]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#1F2A37]">
            Health History Timeline
          </h1>
          <p className="mt-1 text-sm text-[#667085]">
            Track encounters, visits, diagnoses, prescriptions, and follow-ups
            over time.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-[24px] border border-[#E3E8EF] bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search encounter history..."
            className="h-11 w-full rounded-xl border border-[#D8E1EA] bg-[#F9FBFD] pl-10 pr-4 text-sm text-[#1F2A37] outline-none transition focus:border-[#9FC3B6]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#D8E1EA] bg-[#F9FBFD] px-3 text-sm text-[#1F2A37] outline-none focus:border-[#9FC3B6]"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="ongoing">Ongoing</option>
          <option value="cancelled">Cancelled</option>
          <option value="follow-up">Follow-up</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#D8E1EA] bg-[#F9FBFD] px-3 text-sm text-[#1F2A37] outline-none focus:border-[#9FC3B6]"
        >
          <option value="all">All types</option>
          <option value="outpatient">Outpatient</option>
          <option value="emergency">Emergency</option>
          <option value="telemedicine">Telemedicine</option>
          <option value="admission">Admission</option>
          <option value="follow-up">Follow-up</option>
        </select>
      </div>

      {loadingList ? (
        <HealthHistoryLoader title={"Loading encounters..."} />
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-[24px] border border-[#E3E8EF] bg-[#F9FBFD] p-10 text-center">
          <p className="text-base font-semibold text-[#344054]">
            No encounter history found
          </p>
          <p className="mt-2 text-sm text-[#667085]">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredHistory.map((encounter, index) => {
            const isLast = index === filteredHistory.length - 1;
            const detail = encounterDetails[encounter.id];
            const isExpanded = expandedId === encounter.id;
            const isLoadingDetail = loadingDetailId === encounter.id;

            return (
              <div
                key={encounter.id}
                className={isLast ? "[&_.absolute]:last:hidden" : ""}
              >
                <TimelineNode
                  encounter={encounter}
                  expanded={isExpanded}
                  encounterDetail={detail}
                  loadingDetail={isLoadingDetail}
                  onToggle={() => handleViewMore(encounter.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatEncounterDateTime(date?: string | null) {
  if (!date) return "No date";

  const d = new Date(date);

  return {
    date: d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
