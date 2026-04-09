import { AllergyRecordForm } from "@/apps/components/AllergyRecordForm";
import { DiagnosisRecordForm } from "@/apps/components/DiagnosisRecordForm";
import { EncounterRecordForm } from "@/apps/components/EncounterRecordForm";
import { LabResult } from "@/apps/components/LabResult";
import { LabResultRecordForm } from "@/apps/components/LabResultRecordForm";
import PatientsLoadingSkeleton from "@/apps/components/Loader/PatientsLoadingSkeleton";
import { MedicalRecords } from "@/apps/components/MedicalRecords";
import Medication from "@/apps/components/Medication";
import { MedicationRecordForm } from "@/apps/components/MedicationRecordForm";
import { ProcedureRecordForm } from "@/apps/components/ProcedureRecordForm";
import PatientProfile from "@/apps/components/shared/PatientProfile";
import { SharedDashboardSection } from "@/apps/components/shared/SharedDashboardSection";
import { TabRecordPanel } from "@/apps/components/TabRecordPanel";
import { VitalRecordForm } from "@/apps/components/VitalRecordForm";
import { TimelineNode } from "@/apps/patient/pages/HealthHistory";
import { useAuth } from "@/shared/auth/AuthProvider";
import { recordDataByTab, TAB_CONFIG } from "@/shared/utils/data";
import {
  AllergyItem,
  DiagnosisItem,
  EncounterItem,
  getEncounterDetailsByProvider,
  getPatientAllergies,
  getPatientDetail,
  getPatientDiagnoses,
  getPatientEncounters,
  getPatientLabResults,
  getPatientMedications,
  getPatientProcedures,
  getPatientVitals,
  LabResultItem,
  MedicationItem,
  PatientDetailResponse,
  ProcedureItem,
} from "@/shared/utils/utilityFunction";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TABS = [
  "Overview",
  "Encounters Timeline",
  "Medical Records",
  "Lab Results",
  "Prescriptions",
  "Access",
  // "Vitals",
  // "Medications",
  // "Allergies",
  // "Diagnoses",
  // "Lab Results",
  // "Procedures",
  // "Documents",
];

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
  const [selectedEncounter, setSelectedEncounter] =
    useState<EncounterItem | null>(null);
  const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [proceduresError, setProceduresError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [encounterDetails, setEncounterDetails] = useState<Record<string, any>>(
    {},
  );
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const patientId = String(id);

  const handleOpenCreateModal = (tabName: string) => {
    setActiveCreateTab(tabName);
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

      const response = await getEncounterDetailsByProvider(
        encounterId,
        patientId,
      );

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

  const loadMedications = async () => {
    if (!patientId) return;

    try {
      setLoadingMedications(true);
      setMedicationsError("");

      const result = await getPatientMedications(patientId, 1, 10);
      console.log("🚀 ~ loadMedications ~ result:", result);
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
    console.log("🚀 ~ loadEncounters ~ patientId:", patientId);
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

  const loadProcedures = async () => {
    if (!patientId) return;

    try {
      setLoadingProcedures(true);
      setProceduresError("");

      const result = await getPatientProcedures(patientId, 1, 10);
      setProcedures(result.items || []);
    } catch (err: any) {
      setProceduresError(err.message || "Failed to load procedures");
    } finally {
      setLoadingProcedures(false);
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
  }, [patientId, tab]);

  useEffect(() => {
    loadDiagnoses();
  }, [patientId]);

  useEffect(() => {
    loadEncounters();
  }, [patientId, tab]);

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
    loadProcedures();
  }, [patientId]);

  useEffect(() => {
    loadVitals();
  }, [patientId]);

  const handleCloseCreateModal = () => {
    setActiveCreateTab(null);
    setSelectedEncounter(null);
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

  const procedureTabRecords = useMemo(() => {
    return procedures.map((item) => ({
      id: item.id,
      title: item.procedureName,
      subtitle:
        [item.procedureType, item.bodySite, item.outcome]
          .filter(Boolean)
          .join(" • ") || "Procedure record",
      meta: item.performedAt
        ? new Date(item.performedAt).toLocaleDateString()
        : "No procedure date",
    }));
  }, [procedures]);

  const resolvedRecordDataByTab = useMemo(() => {
    return {
      ...recordDataByTab,
      Encounters: encounterTabRecords,
      Vitals: vitalTabRecords,
      Prescriptions: medicationTabRecords,
      Allergies: allergyTabRecords,
      Diagnoses: diagnosisTabRecords,
      "Lab Results": labResultTabRecords,
      Procedures: procedureTabRecords,
    };
  }, [
    encounterTabRecords,
    vitalTabRecords,
    medicationTabRecords,
    allergyTabRecords,
    diagnosisTabRecords,
    labResultTabRecords,
    procedureTabRecords,
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

  const handleAddRecordFromEncounter = (
    encounter: EncounterItem,
    recordType:
      | "Vitals"
      | "Medications"
      | "Diagnoses"
      | "Lab Results"
      | "Allergies",
  ) => {
    setSelectedEncounter(encounter);
    setActiveCreateTab(recordType);
  };

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

  if (loading) return <PatientsLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#010a18] px-3 py-3 text-white">
      <div className="mx-auto max-w-[1280px]">
        <button
          onClick={() => navigate("/provider/patients")}
          className="mb-4 inline-flex font-bold items-center gap-2 text-sm text-[#deebfa] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to patients
        </button>

        <div className="overflow-hidden rounded-2xl border/ border-[#173a63]/ bg-[#081b35]/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <div className="border-b border-[#173a63] px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
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
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SmallActionButton label="Add Record" />
              </div>
            </div>
          </div>

          <PatientProfile patient={patient} />
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
            {
              tab === "Overview" && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                  {/* Left Column */}
                  <SharedDashboardSection
                    alerts={[]}
                    recentEncounters={[]}
                    recordList={[]}
                    loading={loading}
                    routeBase={`/provider/patients/${patientId}`}
                    navigate={navigate}
                    onShareEncounter={(id) =>
                      console.log("provider share encounter", id)
                    }
                    onContinueCare={(id) =>
                      navigate(`/provider/encounters/${id}/continue`)
                    }
                  />
                </div>
              )
              //  : (
              //   <TabRecordPanel
              //     tab={tab}
              //     records={resolvedRecordDataByTab[tab] || []}
              //     onAddRecord={handleOpenCreateModal}
              //   />
              // )
            }
            {tab === "Encounters Timeline" &&
              (loadingEncounters ? (
                <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-6 text-sm text-[#8fb0d5]">
                  Loading encounters...
                </div>
              ) : encountersError ? (
                <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-6 text-sm text-red-300">
                  {encountersError}
                </div>
              ) : encounters.length === 0 ? (
                <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-6 text-sm text-[#8fb0d5]">
                  No encounters found for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-5">
                    {encounters.map((encounter, index) => {
                      const isExpanded = expandedId === encounter.id;
                      const detail = encounterDetails[encounter.id];
                      const isLoadingDetail = loadingDetailId === encounter.id;

                      return (
                        <TimelineNode
                          key={encounter.id}
                          user={user}
                          encounter={encounter}
                          expanded={isExpanded}
                          encounterDetail={detail}
                          loadingDetail={isLoadingDetail}
                          onToggle={() => handleViewMore(encounter.id)}
                          // 🔥 THIS is the important part
                          onAdd={(type) =>
                            handleAddRecordFromEncounter(encounter, type)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
          {tab === "Medical Records" && (
            <div className="px-3">
              <MedicalRecords category="vitals" />
            </div>
            
          )}

          {tab === "Lab Results" && (
            <div className="px-3">
              <LabResult category="lab" />
            </div>
          )}
          {tab === "Prescriptions" && (
            <div className=" w-full">
              <Medication
                visibleRecords={medicationTabRecords}
                //  onAddRecord={() => handleOpenCreateModal("Medications")}
              />
            </div>
          )}

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
                {selectedEncounter && (
                  <div className="mb-4 rounded-lg border border-[#345f92] bg-[#102845] px-4 py-3 text-sm text-[#dbeafe]">
                    Adding to encounter:{" "}
                    <span className="font-semibold">
                      {selectedEncounter.reasonForVisit ||
                        selectedEncounter.encounterType ||
                        "Encounter"}
                    </span>
                    {" • "}
                    {selectedEncounter.startedAt
                      ? new Date(selectedEncounter.startedAt).toLocaleString()
                      : "No start time"}
                  </div>
                )}
                {activeCreateTab === "Vitals" && (
                  <VitalRecordForm
                    patientId={patientId}
                    organizationId={user?.data?.account?.id}
                    encounterId={selectedEncounter?.id}
                    onClose={handleCloseCreateModal}
                    onSuccess={(data) => {
                      console.log("Created vital:", data);
                      // refetch vitals here
                    }}
                  />
                )}

                {activeCreateTab === "Medications" && (
                  <MedicationRecordForm
                    encounterId={selectedEncounter?.id}
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
                    encounterId={selectedEncounter?.id}
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
                    encounterId={selectedEncounter?.id}
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
                    encounterId={selectedEncounter?.id}
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
                    // encounterId={selectedEncounter?.id}
                    patientId={patientId}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadEncounters();
                      setTab("Encounters");
                      handleCloseCreateModal();
                    }}
                  />
                )}

                {activeCreateTab === "Procedures" && (
                  <ProcedureRecordForm
                    patientId={patientId}
                    encounterId={selectedEncounter?.id}
                    onClose={handleCloseCreateModal}
                    onSuccess={async () => {
                      await loadProcedures();
                      setTab("Procedures");
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
