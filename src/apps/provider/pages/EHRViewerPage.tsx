import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Shield,
  Stethoscope,
  Syringe,
} from "lucide-react";
import {
  AllergyItem,
  DiagnosisItem,
  EncounterItem,
  getPatientAllergies,
  getPatientDetail,
  getPatientDiagnoses,
  getPatientEncounters,
  getPatientLabResults,
  getPatientMedications,
  getPatientVitals,
  LabResultItem,
  MedicationItem,
  PatientDetailResponse,
} from "@/shared/utils/utilityFunction";
import { TabRecordPanel } from "@/apps/components/TabRecordPanel";
import { recordDataByTab, TAB_CONFIG } from "@/shared/utils/data";
import { VitalRecordForm } from "@/apps/components/VitalRecordForm";
import { useAuth } from "@/shared/auth/AuthProvider";
import { MedicationRecordForm } from "@/apps/components/MedicationRecordForm";
import { AllergyRecordForm } from "@/apps/components/AllergyRecordForm";
import { DiagnosisRecordForm } from "@/apps/components/DiagnosisRecordForm";
import { LabResultRecordForm } from "@/apps/components/LabResultRecordForm";
import { EncounterRecordForm } from "@/apps/components/EncounterRecordForm";

const TABS = [
  "Overview",
  "Encounters",
  "Vitals",
  "Medications",
  "Allergies",
  "Diagnoses",
  "Lab Results",
  "Procedures",
  "Documents",
];

const MOCK_PATIENT = {
  id: "pat_001",
  name: "John Doe",
  code: "WR-10391",
  sex: "M",
  age: 43,
  bloodGroup: "O+",
  genotype: "AA",
  phone: "5065-123-4567",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
};

const ALERT_CHIPS = [
  { label: "Penicillin Allergy", value: "993 v", tone: "yellow" },
  { label: "Hypertension", value: "—", tone: "red" },
  { label: "Type 2 Diabetes", value: "5", tone: "purple" },
  { label: "Manage Access", value: "", tone: "slate", dropdown: true },
];

const CLINICAL_ALERTS = [
  {
    title: "Pregnals retrims",
    subtitle: "Recent infection scan findings",
    tone: "yellow",
  },
  {
    title: "Current Hypertension",
    subtitle: "Ongoing risk level",
    tone: "red",
  },
  {
    title: "Type 2 Diabetes",
    subtitle: "Early risk flagged",
    tone: "blue",
  },
];

const RECENT_TIMELINE = [
  {
    id: "tl_1",
    title: "Medication (Propranolol)",
    subtitle: "Medication • 10mg / 1 tab bd",
    doctor: "Dr. Patel",
  },
  {
    id: "tl_2",
    title: "Lab Result Processed",
    subtitle: "Medication fill Type A Result (L.O.C)",
    doctor: "Dr. Loe",
  },
  {
    id: "tl_3",
    title: "Rogeds Retical",
    subtitle: "Access point • Prior remote access, additional delegated",
    doctor: "Dr. Patel",
  },
];

const RECENT_VITALS = [
  { label: "BP", value: "101/105 mmHg", right: "102L" },
  { label: "HR", value: "68 bpm", right: "98 dc" },
  { label: "O2", value: "99 bp bpm", right: "43.2" },
  { label: "WT", value: "99 kg / bmi", right: "91 dx" },
];

const MINI_CARDS = [
  {
    title: "Last Vitals",
    tone: "blue",
    items: ["06S 1003 mcv", "Leaching"],
    action: "View Snapshot",
    meta: "1 0 9 s x",
  },
  {
    title: "Active Medications",
    tone: "yellow",
    items: ["Enalapril two up 10 doses", "Metformin ur line os caused"],
    action: "Prescribe Medication",
    meta: "5 x",
  },
  {
    title: "Recent Diagnoses",
    tone: "cyan",
    items: ["Flater", "Type 2 Diabetes"],
    action: "View Full List",
    meta: "1 x",
  },
];

function toneClasses(
  tone: "yellow" | "red" | "purple" | "blue" | "slate" | "cyan",
) {
  switch (tone) {
    case "yellow":
      return "bg-amber-400/10 text-amber-300 border-amber-400/20";
    case "red":
      return "bg-rose-400/10 text-rose-300 border-rose-400/20";
    case "purple":
      return "bg-violet-400/10 text-violet-300 border-violet-400/20";
    case "blue":
      return "bg-sky-400/10 text-sky-300 border-sky-400/20";
    case "cyan":
      return "bg-cyan-400/10 text-cyan-300 border-cyan-400/20";
    default:
      return "bg-slate-400/10 text-slate-300 border-slate-400/20";
  }
}

function TopChip({
  label,
  value,
  tone,
  dropdown,
}: {
  label: string;
  value?: string;
  tone: "yellow" | "red" | "purple" | "blue" | "slate" | "cyan";
  dropdown?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${toneClasses(
        tone,
      )}`}
    >
      <span>{label}</span>
      {value ? <span className="text-[10px] opacity-80">{value}</span> : null}
      {dropdown ? <ChevronDown size={13} /> : null}
    </button>
  );
}

function SmallActionButton({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition ${
        active
          ? "border-[#35a8ff] bg-[#0c2c50] text-[#7fd0ff]"
          : "border-[#2d527b] bg-transparent text-[#dbeafe] hover:bg-[#102845]"
      }`}
    >
      {label}
    </button>
  );
}

export function EHRViewerPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  console.log("🚀 ~ EHRViewerPage ~ user:", user);
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientDetailResponse | null>(null);
  console.log("🚀 ~ EHRViewerPage ~ patient:", patient);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Overview");
  const [activeCreateTab, setActiveCreateTab] = useState<string | null>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [vitalsError, setVitalsError] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [medicationsError, setMedicationsError] = useState("");
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  const [allergiesError, setAllergiesError] = useState("");
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);
  const [diagnosesError, setDiagnosesError] = useState("");
  const [labResults, setLabResults] = useState<LabResultItem[]>([]);
  const [loadingLabResults, setLoadingLabResults] = useState(false);
  const [labResultsError, setLabResultsError] = useState("");
  const [encounters, setEncounters] = useState<EncounterItem[]>([]);
  const [loadingEncounters, setLoadingEncounters] = useState(false);
  const [encountersError, setEncountersError] = useState("");

  const patientId = String(id);

  const handleOpenCreateModal = (tabName: string) => {
    setActiveCreateTab(tabName);
  };

  const loadMedications = async () => {
    if (!patientId) return;

    try {
      setLoadingMedications(true);
      setMedicationsError("");

      const result = await getPatientMedications(patientId, 1, 10);
      setMedications(result.items || []);
    } catch (err: any) {
      setMedicationsError(err.message || "Failed to load medications");
    } finally {
      setLoadingMedications(false);
    }
  };

  const loadAllergies = async () => {
    if (!patientId) return;

    try {
      setLoadingAllergies(true);
      setAllergiesError("");

      const result = await getPatientAllergies(patientId, 1, 10);
      setAllergies(result.items || []);
    } catch (err: any) {
      setAllergiesError(err.message || "Failed to load allergies");
    } finally {
      setLoadingAllergies(false);
    }
  };

  const loadDiagnoses = async () => {
    if (!patientId) return;

    try {
      setLoadingDiagnoses(true);
      setDiagnosesError("");

      const result = await getPatientDiagnoses(patientId, 1, 10);
      setDiagnoses(result.items || []);
    } catch (err: any) {
      setDiagnosesError(err.message || "Failed to load diagnoses");
    } finally {
      setLoadingDiagnoses(false);
    }
  };

  const loadLabResults = async () => {
    if (!patientId) return;

    try {
      setLoadingLabResults(true);
      setLabResultsError("");

      const result = await getPatientLabResults(patientId, 1, 10);
      setLabResults(result.items || []);
    } catch (err: any) {
      setLabResultsError(err.message || "Failed to load lab results");
    } finally {
      setLoadingLabResults(false);
    }
  };

  const loadEncounters = async () => {
    if (!patientId) return;

    try {
      setLoadingEncounters(true);
      setEncountersError("");

      const result = await getPatientEncounters(patientId, 1, 10);
      setEncounters(result.items || []);
    } catch (err: any) {
      setEncountersError(err.message || "Failed to load encounters");
    } finally {
      setLoadingEncounters(false);
    }
  };

  useEffect(() => {
    loadLabResults();
  }, [patientId]);

  useEffect(() => {
    loadAllergies();
  }, [patientId]);

  useEffect(() => {
    loadMedications();
  }, [patientId]);

  useEffect(() => {
    loadDiagnoses();
  }, [patientId]);

  useEffect(() => {
    loadEncounters();
  }, [patientId]);

  const loadVitals = async () => {
    if (!patientId) return;

    try {
      setLoadingVitals(true);
      setVitalsError("");

      const result = await getPatientVitals(patientId, 1, 10);
      setVitals(result.items || []);
    } catch (err: any) {
      setVitalsError(err.message || "Failed to load vitals");
    } finally {
      setLoadingVitals(false);
    }
  };

  useEffect(() => {
    loadVitals();
  }, [patientId]);

  const handleCloseCreateModal = () => {
    setActiveCreateTab(null);
  };
  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getPatientDetail(String(id));

        if (!ignore) {
          setPatient(result);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || "Failed to fetch patient");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [id]);

  const vitalTabRecords = useMemo(() => {
    return vitals.map((item) => {
      const bp =
        item.bloodPressure?.systolic && item.bloodPressure?.diastolic
          ? `${item.bloodPressure.systolic}/${item.bloodPressure.diastolic} mmHg`
          : null;

      const temp = item.temperature?.value
        ? `${item.temperature.value}°${item.temperature.unit || "C"}`
        : null;

      const hr = item.heartRate ? `${item.heartRate} bpm` : null;
      const spo2 =
        item.oxygenSaturation !== null && item.oxygenSaturation !== undefined
          ? `${item.oxygenSaturation}% SpO₂`
          : null;

      const summary = [bp, hr, temp, spo2].filter(Boolean).join(" • ");

      return {
        id: item.id,
        title: "Vital Record",
        subtitle: summary || "Recorded vital observation",
        meta: item.measuredAt
          ? new Date(item.measuredAt).toLocaleString()
          : "No measurement time",
      };
    });
  }, [vitals]);

  const medicationTabRecords = useMemo(() => {
    return medications.map((item) => ({
      id: item.id,
      title: item.medicationName,
      subtitle:
        [
          item.dosage?.value
            ? `${item.dosage.value}${item.dosage.unit || ""}`
            : null,
          item.frequency,
          item.route,
        ]
          .filter(Boolean)
          .join(" • ") || "Medication record",
      meta: item.prescribedAt
        ? new Date(item.prescribedAt).toLocaleDateString()
        : "No prescribed date",
    }));
  }, [medications]);

  const allergyTabRecords = useMemo(() => {
    return allergies.map((item) => ({
      id: item.id,
      title: item.allergen,
      subtitle:
        [item.allergyType, item.reaction, item.severity]
          .filter(Boolean)
          .join(" • ") || "Allergy record",
      meta: item.confirmed ? "Confirmed" : "Unconfirmed",
    }));
  }, [allergies]);

  const diagnosisTabRecords = useMemo(() => {
    return diagnoses.map((item) => ({
      id: item.id,
      title: item.diagnosisName,
      subtitle:
        [item.diagnosisType, item.icd10Code, item.clinicalStatus]
          .filter(Boolean)
          .join(" • ") || "Diagnosis record",
      meta: item.diagnosedAt
        ? new Date(item.diagnosedAt).toLocaleDateString()
        : "No diagnosis date",
    }));
  }, [diagnoses]);

  const labResultTabRecords = useMemo(() => {
    return labResults.map((item) => ({
      id: item.id,
      title: item.testName,
      subtitle:
        [item.resultValue, item.unit, item.interpretation]
          .filter(Boolean)
          .join(" • ") || "Lab result",
      meta: item.resultedAt
        ? new Date(item.resultedAt).toLocaleDateString()
        : "No result date",
    }));
  }, [labResults]);

  const encounterTabRecords = useMemo(() => {
    return encounters.map((item) => ({
      id: item.id,
      title: item.reasonForVisit || item.encounterType || "Encounter",
      subtitle:
        [item.chiefComplaint, item.priority, item.status]
          .filter(Boolean)
          .join(" • ") || "Encounter record",
      meta: item.startedAt
        ? new Date(item.startedAt).toLocaleString()
        : "No start time",
    }));
  }, [encounters]);

  const resolvedRecordDataByTab = useMemo(() => {
    return {
      ...recordDataByTab,
      Encounters: encounterTabRecords,
      Vitals: vitalTabRecords,
      Medications: medicationTabRecords,
      Allergies: allergyTabRecords,
      Diagnoses: diagnosisTabRecords,
      "Lab Results": labResultTabRecords,
    };
  }, [
    encounterTabRecords,
    vitalTabRecords,
    medicationTabRecords,
    allergyTabRecords,
    diagnosisTabRecords,
    labResultTabRecords,
  ]);

  const recentVitalCards = useMemo(() => {
    return vitals.slice(0, 4).map((item) => {
      if (item.bloodPressure?.systolic && item.bloodPressure?.diastolic) {
        return {
          label: "BP",
          value: `${item.bloodPressure.systolic}/${item.bloodPressure.diastolic} mmHg`,
          right: item.measuredAt
            ? new Date(item.measuredAt).toLocaleDateString()
            : "—",
        };
      }

      if (item.heartRate) {
        return {
          label: "HR",
          value: `${item.heartRate} bpm`,
          right: item.measuredAt
            ? new Date(item.measuredAt).toLocaleDateString()
            : "—",
        };
      }

      if (
        item.oxygenSaturation !== null &&
        item.oxygenSaturation !== undefined
      ) {
        return {
          label: "O2",
          value: `${item.oxygenSaturation}%`,
          right: item.measuredAt
            ? new Date(item.measuredAt).toLocaleDateString()
            : "—",
        };
      }

      if (item.temperature?.value) {
        return {
          label: "Temp",
          value: `${item.temperature.value}°${item.temperature.unit || "C"}`,
          right: item.measuredAt
            ? new Date(item.measuredAt).toLocaleDateString()
            : "—",
        };
      }

      return {
        label: "Vital",
        value: "Recorded",
        right: item.measuredAt
          ? new Date(item.measuredAt).toLocaleDateString()
          : "—",
      };
    });
  }, [vitals]);

  const getAgeFromDateOfBirth = (dateOfBirth?: string | null) => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }

    return age;
  };

  const age = getAgeFromDateOfBirth(patient?.dateOfBirth);
  const initials =
    patient?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PT";

  return (
    <div className="min-h-screen bg-[#06162d] px-5 py-5 text-white">
      <div className="mx-auto max-w-[1280px]">
        <button
          onClick={() => navigate("/provider/patients")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#86a8ce] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to patients
        </button>

        <div className="overflow-hidden rounded-2xl border border-[#173a63] bg-[#081b35] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <div className="border-b border-[#173a63] px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
                {patient?.avatar ? (
                  <img
                    src={patient.avatar}
                    alt={patient?.fullName || "Patient"}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#14345c] text-sm font-semibold text-[#dcecff] ring-1 ring-white/10">
                    {initials}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#eef5ff]">
                      {patient?.fullName || "Unknown Patient"}
                    </h1>

                    {patient?.wrId && (
                      <span className="text-[18px] text-[#9eb9da]">
                        {patient.wrId}
                      </span>
                    )}

                    {patient?.relationship?.externalPatientId && (
                      <span className="rounded bg-[#14345c] px-2 py-0.5 text-[12px] text-[#dbeafe]">
                        Org ID: {patient.relationship.externalPatientId}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-col items-start justify-start gap-3 text-[13px] text-[#8fb0d5]">
                    <span>{patient?.email || "No email"}</span>
                    <span>{patient?.phone || "No phone"}</span>
                    <div className="space-x-4">
                      <span>{patient?.gender || "—"}</span>
                      <span>
                        {age !== null ? `${age} years` : "Age unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#7fd0ff]"
                      type="button"
                    >
                      <Shield size={14} />
                      Retention Access
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SmallActionButton label="Add Record" />
              </div>
            </div>

            {/* <div className="mt-4 flex flex-wrap gap-2">
              {ALERT_CHIPS.map((chip) => (
                <TopChip
                  key={chip.label}
                  label={chip.label}
                  value={chip.value}
                  tone={chip.tone as any}
                  dropdown={chip.dropdown}
                />
              ))}
            </div> */}
          </div>

          {/* Tabs */}
          <div className="border-b border-[#173a63] px-5">
            <div className="flex flex-wrap gap-2 py-3">
              {TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-md px-4 py-2 text-[13px] font-medium transition ${
                    tab === item
                      ? "bg-[#12355f] text-white border border-[#3d72ab]"
                      : "text-[#a0bad8] hover:bg-[#0e294b]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {tab === "Overview" ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                {/* keep your current Overview content exactly here */}
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                    <div className="mb-4 text-[22px] font-semibold text-[#eef5ff]">
                      Active Clinical Alerts
                    </div>

                    <div className="space-y-3">
                      {CLINICAL_ALERTS.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-lg bg-[#0d2443] px-3 py-3"
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              {item.tone === "yellow" ? (
                                <AlertTriangle
                                  size={16}
                                  className="text-amber-300"
                                />
                              ) : item.tone === "red" ? (
                                <HeartPulse
                                  size={16}
                                  className="text-rose-300"
                                />
                              ) : (
                                <Stethoscope
                                  size={16}
                                  className="text-sky-300"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#eef5ff]">
                                {item.title}
                              </div>
                              <div className="mt-1 text-[11px] text-[#7b9ac0]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14365d] text-[#8bc7ff]"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                    <div className="mb-4 text-[22px] font-semibold text-[#eef5ff]">
                      Recent Vitals
                    </div>

                    <div className="space-y-3">
                      {loadingVitals ? (
                        <div className="rounded-lg bg-[#0d2443] px-3 py-4 text-sm text-[#7b9ac0]">
                          Loading vitals...
                        </div>
                      ) : vitalsError ? (
                        <div className="rounded-lg bg-[#0d2443] px-3 py-4 text-sm text-red-300">
                          {vitalsError}
                        </div>
                      ) : recentVitalCards.length > 0 ? (
                        recentVitalCards.map((item) => (
                          <div
                            key={`${item.label}-${item.right}-${item.value}`}
                            className="flex items-center justify-between rounded-lg bg-[#0d2443] px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <div className="rounded bg-[#12355f] px-1.5 py-0.5 text-[10px] font-semibold text-[#9ccfff]">
                                {item.label}
                              </div>
                              <span className="text-[13px] text-[#e8f1ff]">
                                {item.value}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#7b9ac0]">
                              {item.right}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg bg-[#0d2443] px-3 py-4 text-sm text-[#7b9ac0]">
                          No vitals recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-[22px] font-semibold text-[#eef5ff]">
                        Recent Timeline
                      </div>

                      <button
                        type="button"
                        className="inline-flex h-8 items-center gap-2 rounded-md border border-[#345f92] bg-[#102845] px-3 text-[12px] font-medium text-[#dbeafe]"
                      >
                        <ClipboardList size={14} />
                        Start Chart
                      </button>
                    </div>

                    <div className="space-y-3">
                      {RECENT_TIMELINE.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-lg bg-[#0d2443] px-4 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1b3458] text-[#aac8eb]">
                              <FileText size={15} />
                            </div>

                            <div>
                              <div className="text-[14px] font-semibold text-[#eef5ff]">
                                {item.title}
                              </div>
                              <div className="mt-1 text-[12px] text-[#7b9ac0]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex min-w-[160px] items-center justify-end gap-4">
                            <span className="text-[12px] text-[#c8daf0]">
                              {item.doctor}
                            </span>

                            <button
                              type="button"
                              className="inline-flex h-8 items-center rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#e8f1ff] hover:bg-[#13345e]"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <TabRecordPanel
                tab={tab}
                records={resolvedRecordDataByTab[tab] || []}
                onAddRecord={handleOpenCreateModal}
              />
            )}
          </div>

          {activeCreateTab && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-10">
              <div className="w-full py-10 h-[90vh] overflow-y-auto max-w-5xl rounded-2xl border border-[#1d3f69] bg-[#081b35] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#edf5ff]">
                    {
                      TAB_CONFIG[activeCreateTab as keyof typeof TAB_CONFIG]
                        ?.actionLabel
                    }
                  </h3>

                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] text-[#9ab7d8]"
                  >
                    ✕
                  </button>
                </div>
                {activeCreateTab === "Vitals" && (
                  <VitalRecordForm
                    patientId={patientId}
                    organizationId={user?.data?.account?.id}
                    providerId={user?.data?.account?.id}
                    encounterId={undefined}
                    onClose={handleCloseCreateModal}
                    onSuccess={(data) => {
                      console.log("Created vital:", data);
                      // refetch vitals here
                    }}
                  />
                )}

                {activeCreateTab === "Medications" && (
                  <MedicationRecordForm
                    patientId={patientId}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadMedications();
                      setTab("Medications");
                      handleCloseCreateModal();
                    }}
                  />
                )}

                {activeCreateTab === "Allergies" && (
                  <AllergyRecordForm
                    patientId={patientId}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadAllergies();
                      setTab("Allergies");
                      handleCloseCreateModal();
                    }}
                  />
                )}

                {activeCreateTab === "Diagnoses" && (
                  <DiagnosisRecordForm
                    patientId={patientId}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadDiagnoses();
                      setTab("Diagnoses");
                      handleCloseCreateModal();
                    }}
                  />
                )}

                {activeCreateTab === "Lab Results" && (
                  <LabResultRecordForm
                    patientId={patientId}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadLabResults();
                      setTab("Lab Results");
                      handleCloseCreateModal();
                    }}
                  />
                )}

                {activeCreateTab === "Encounters" && (
                  <EncounterRecordForm
                    patientId={patientId}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadEncounters();
                      setTab("Encounters");
                      handleCloseCreateModal();
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
