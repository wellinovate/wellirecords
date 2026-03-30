import { FirstRecordWizard } from "@/apps/patient/components/FirstRecordWizard";
import { getUsersRecords } from "@/shared/utils/utilityFunction";
import { ArrowLeft, Search, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Pill,
  Activity,
  Syringe,
  FlaskConical,
  AlertCircle,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { HealthHistoryLoader } from "./Loader/HealthHistoryLoader";

function formatDate(value?: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!value && value !== 0) return null;

  return (
    <p className="text-sm text-[#7B8BA3]">
      <span className="font-medium text-[#8B9BB3]">{label}:</span> {value}
    </p>
  );
}

function RecordShell({
  icon,
  title,
  subtitle,
  status,
  metaLeft,
  metaRight,
  footerLeft,
  actionLabel = "View Details",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: string;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  footerLeft?: React.ReactNode;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[#DDE3EA] bg-[#F9FAFB] px-5 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF7F1] text-[#2F915C]">
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-[22px] font-semibold leading-tight text-[#1F2A37] truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-base text-[#667085]">{subtitle}</p>
            )}
          </div>
        </div>

        {status && (
          <span className="shrink-0 rounded-full bg-[#E7F7EF] px-3 py-1 text-sm font-semibold text-[#22A06B]">
            {status}
          </span>
        )}
      </div>

      {(metaLeft || metaRight) && (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>{metaLeft}</div>
          <div>{metaRight}</div>
        </div>
      )}

      {children && <div className="mt-4 space-y-2">{children}</div>}

      {(footerLeft || actionLabel) && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#7B8BA3]">{footerLeft}</div>

          <button
            type="button"
            className="inline-flex items-center justify-center self-start rounded-full bg-[#E7F1EE] px-4 py-2 text-sm font-semibold text-[#138A72] transition hover:bg-[#dcebe6]"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  vitals: "Vitals Records",
  medications: "Medication Records",
  allergies: "Allergy Records",
  diagnoses: "Diagnosis Records",
  immunizations: "Immunization Records",
  "lab-results": "Lab Results Records",
  procedures: "Procedures / Surgeries Records",
  "clinical-notes": "Clinical Notes Records",
};

const CATEGORY_TABS = [
  { key: "vitals", label: "Vitals", icon: HeartPulse },
  { key: "medications", label: "Medications", icon: Pill },
  { key: "allergies", label: "Allergies", icon: AlertCircle },
  { key: "diagnoses", label: "Diagnoses", icon: Stethoscope },
  { key: "immunizations", label: "Immunizations", icon: Syringe },
  { key: "procedures", label: "Procedures", icon: Syringe },
  { key: "lab", label: "Lab Results", icon: FlaskConical },
];

export function HealthCategoryHistoryPage() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [tab, setTab] = useState<string>(category || "vitals");
  const [record, setRecord] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const title = CATEGORY_LABELS[tab] || "Health History";

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const result = await getUsersRecords(tab, 1, 10);
      setRecord(result.items || []);
    } catch (err: any) {
      console.log("🚀 ~ loadRecords ~ err.message:", err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const changeRecordsTab = (nextTab: string) => {
  setSearch("");
  setTab(nextTab);
};

  useEffect(() => {
    if (tab) {
      loadRecords();
    }
  }, [tab]);

  useEffect(() => {
  if (category && category !== tab) {
    setTab(category);
  }
}, [category]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return record.filter((item) => {
      if (tab === "vitals") {
        const hasVitalsData =
          item.bloodPressure ||
          item.heartRate ||
          item.temperature?.value ||
          item.respiratoryRate ||
          item.oxygenSaturation ||
          item.weight?.value ||
          item.height?.value ||
          item.bloodGlucose?.value;

        if (!hasVitalsData) return false;

        if (!q) return true;

        return [
          item.bloodPressure
            ? `${item.bloodPressure.systolic}/${item.bloodPressure.diastolic}`
            : "",
          item.heartRate ? `${item.heartRate}` : "",
          item.temperature?.value ? `${item.temperature.value}` : "",
          item.respiratoryRate ? `${item.respiratoryRate}` : "",
          item.oxygenSaturation ? `${item.oxygenSaturation}` : "",
          item.weight?.value ? `${item.weight.value}` : "",
          item.height?.value ? `${item.height.value}` : "",
          item.bloodGlucose?.value ? `${item.bloodGlucose.value}` : "",
          item.notes || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      }

      if (tab === "medications") {
        const hasMedicationData = item.medicationName;

        if (!hasMedicationData) return false;
        if (!q) return true;

        return [
          item.medicationName,
          item.genericName,
          item.brandName,
          item.frequency,
          item.route,
          item.indication,
          item.medicationStatus,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      }

      if (tab === "allergies") {
        const hasAllergyData = item.allergen;

        if (!hasAllergyData) return false;
        if (!q) return true;

        return [
          item.allergen,
          item.allergyType,
          item.reaction,
          item.severity,
          item.clinicalStatus,
          item.verificationStatus,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      }

      if (tab === "diagnoses") {
        const hasDiagnosisData = item.diagnosisName;

        if (!hasDiagnosisData) return false;
        if (!q) return true;

        return [
          item.diagnosisName,
          item.diagnosisType,
          item.icd10Code,
          item.clinicalStatus,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      }

      if (tab === "immunizations") {
        const hasImmunizationData = item.vaccineName;

        if (!hasImmunizationData) return false;
        if (!q) return true;

        return [
          item.vaccineName,
          item.vaccineCode,
          item.manufacturer,
          item.series,
          item.immunizationStatus,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      }

      if (tab === "lab-results") {
        const hasLabData = item.testName;

        if (!hasLabData) return false;
        if (!q) return true;

        return [
          item.testName,
          item.category,
          item.specimen,
          item.resultValue,
          item.unit,
          item.interpretation,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      }

      return true;
    });
  }, [record, tab, search]);

  const renderRecordCard = (item: any) => {
    if (tab === "vitals") {
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
          title="Vital Record"
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
              <span>
                Weight: {item.weight.value} {item.weight.unit}
              </span>
            )}
            {item.height?.value && (
              <span>
                Height: {item.height.value} {item.height.unit}
              </span>
            )}
          </div>
        </RecordShell>
      );
    }

    if (tab === "medications") {
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
                value={
                  item.prescribedByName || item.prescriberName || "Unknown"
                }
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
    }

    if (tab === "allergies") {
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
    }

    if (tab === "diagnoses") {
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
    }

    if (tab === "immunizations") {
      return (
        <RecordShell
          key={item.id}
          icon={<Syringe size={18} />}
          title={item.vaccineName}
          subtitle={
            [item.series, item.doseNumber ? `Dose ${item.doseNumber}` : null]
              .filter(Boolean)
              .join(" • ") || "Immunization entry"
          }
          status={item.immunizationStatus || "Completed"}
          metaLeft={
            <>
              <InfoRow
                label="Administered"
                value={formatDate(item.administeredAt)}
              />
              <InfoRow label="Code" value={item.vaccineCode} />
            </>
          }
          metaRight={
            <>
              <InfoRow label="Manufacturer" value={item.manufacturer} />
              <InfoRow label="Dose Number" value={item.doseNumber} />
            </>
          }
          footerLeft={item.notes || "Immunization history entry"}
          actionLabel="View Vaccine"
        />
      );
    }

    if (tab === "lab-results") {
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
    }

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
  };

  return (
    <div className="animate-fade-in">
      {wizardOpen && <FirstRecordWizard onClose={() => setWizardOpen(false)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="mb-4  top-10 left-20 z-50 bg-gray-100 px-5 rounded-lg">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#062B67] hover:opacity-70 transition"
            >
              <ArrowLeft size={26} className="  " />
              <span className="text-sm md:text-base  font-meduim">Back</span>
            </button>
          </div>
          <h1
            className="section-header font-display"
            style={{ color: "#1a2e1e" }}
          >
            {title}
          </h1>
          <p className="text-sm" style={{ color: "#5a7a63" }}>
            View all records in this category
          </p>
        </div>

        <button
          className="btn btn-patient gap-2"
          onClick={() => setWizardOpen(true)}
        >
          <UploadCloud size={16} />
          Upload New
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9ca3af" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-light w-full"
            style={{ paddingLeft: "2.5rem" }}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {CATEGORY_TABS.map(({ key, label, icon: Icon }) => {
              const isActive = tab === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeRecordsTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition border ${
                    isActive
                      ? "bg-[#2F915C] text-white border-[#2F915C]"
                      : "bg-white text-[#5B6470] border-[#DDE3EA] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <HealthHistoryLoader title={title} />
        ) : filteredRecords.length === 0 ? (
          <div className="card-patient p-8 text-center">
            <p className="font-semibold" style={{ color: "#5a7a63" }}>
              No records found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredRecords.map((item) => renderRecordCard(item))}
          </div>
        )}
      </div>
    </div>
  );
}


