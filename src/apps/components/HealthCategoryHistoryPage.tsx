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

export function formatDate(value?: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
}

export function InfoRow({
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

export function SummaryChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "red" | "green" | "blue" | "amber" | "purple";
}) {
  const toneClasses = {
    neutral: "bg-gray-100 text-gray-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${toneClasses[tone]}`}
    >
      <span className="opacity-80">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export function StatusBadge({
  value,
  tone = "green",
}: {
  value: string;
  tone?: "green" | "red" | "amber" | "blue" | "gray";
}) {
  const toneClasses = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {value}
    </span>
  );
}

export function RecordShell({
  icon,
  title,
  subtitle,
  summaryChips,
  status,
  metaLeft,
  metaRight,
  footerLeft,
  actionLabel = "View Details",
  children,
  accentColor = "#2F915C",
  iconBg = "#EAF7F1",
  iconColor = "#2F915C",
  variant = "light",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  summaryChips?: React.ReactNode;
  status?: React.ReactNode;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  footerLeft?: React.ReactNode;
  actionLabel?: string;
  children?: React.ReactNode;
  accentColor?: string;
  iconBg?: string;
  iconColor?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={`rounded-[22px] px-5 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
        isDark
          ? "border border-[#163761] text-white"
          : "border border-[#DDE3EA] bg-white text-[#1F2A37]"
      }`}
      style={{
        borderLeft: `4px solid ${accentColor}`,
        ...(isDark
          ? {
              background:
                "radial-gradient(circle at 72% 18%, rgba(116,167,255,0.08) 0%, rgba(116,167,255,0.02) 22%, transparent 40%), linear-gradient(180deg, #0B1730 0%, #091427 100%)",
            }
          : {}),
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isDark ? "border border-[#163761]" : ""
            }`}
            style={{
              backgroundColor: isDark ? "#102a4d" : iconBg,
              color: isDark ? iconColor : iconColor,
            }}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h3
              className={`truncate text-[18px] font-semibold leading-tight ${
                isDark ? "text-white" : "text-[#1F2A37]"
              }`}
            >
              {title}
            </h3>

            {subtitle && (
              <div
                className={`mt-1 text-sm ${
                  isDark ? "text-[#9FB3CF]" : "text-[#667085]"
                }`}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {status && <div className="shrink-0">{status}</div>}
      </div>

      {summaryChips && (
        <div className="mt-3 flex flex-wrap gap-2">{summaryChips}</div>
      )}

      {(metaLeft || metaRight) && (
        <div
          className={`mt-4 grid gap-3 text-sm sm:grid-cols-2 ${
            isDark ? "text-[#D7E6FA]" : "text-[#344054]"
          }`}
        >
          <div className="space-y-2">{metaLeft}</div>
          <div className="space-y-2">{metaRight}</div>
        </div>
      )}

      {children && (
        <div className={isDark ? "mt-4 text-[#D7E6FA]" : "mt-4"}>
          {children}
        </div>
      )}

      {footerLeft && (
        <div
          className={`mt-4 border-t pt-3 text-sm ${
            isDark
              ? "border-[#163761] text-[#9FB3CF]"
              : "border-[#EAECF0] text-[#667085]"
          }`}
        >
          {footerLeft}
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

      if (tab === "lab") {
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

      if (tab === "procedures") {
        const hasProcedureData = !!item.procedureName;

        if (!hasProcedureData) return false;

        if (!q) return true;

        // Search across relevant procedure fields
        return [
          item.procedureName,
          item.procedureType,
          item.indication,
          item.outcome,
          item.notes,
          item.facilityName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      }

      return true;
    });
  }, [record, tab, search]);

  const renderRecordCard = (item: any) => {
    if (tab === "vitals") {
      
       

      const vitalsSubtitle = (
        <div className="space-y-1 flex justify-between w-full">
          {item.bloodPressure && (
            <div>
              <span className="font-medium text-[#344054]">BP:</span>{" "}
              <span className="font-semibold text-[#B42318]">
                {item.bloodPressure.systolic}/{item.bloodPressure.diastolic}
              </span>
            </div>
          )}

          {item.heartRate && (
            <div>
              <span className="font-medium text-[#344054]">HR:</span>{" "}
              <span className="font-semibold text-[#1D2939]">
                {item.heartRate} bpm
              </span>
            </div>
          )}

          {item.temperature?.value && (
            <div>
              <span className="font-medium text-[#344054]">Temp:</span>{" "}
              <span className="font-semibold text-[#DC6803]">
                {item.temperature.value}°{item.temperature.unit || "C"}
              </span>
            </div>
          )}
        </div>
      );

      

      const bloodPressure = item.bloodPressure
  ? `${item.bloodPressure.systolic}/${item.bloodPressure.diastolic}`
  : "—";

const vitalsChips = (
  <>
    {item?.bloodPressure && (
      <SummaryChip
        label="BP"
        value={bloodPressure}
        tone="red"
      />
    )}
    {item?.heartRate && (
      <SummaryChip
        label="HR"
        value={`${item.heartRate} bpm`}
        tone="blue"
      />
    )}
    {item?.temperature?.value && (
      <SummaryChip
        label="Temp"
        value={`${item.temperature.value}°${item.temperature.unit || "C"}`}
        tone="amber"
      />
    )}
    {item?.oxygenSaturation && (
      <SummaryChip
        label="SpO₂"
        value={`${item.oxygenSaturation}%`}
        tone="green"
      />
    )}
  </>
);



      return (
        <RecordShell
  key={item.id}
  icon={<HeartPulse size={18} />}
  title="Vital Record"
  subtitle={formatDate(item.measuredAt) || "Patient vital signs"}
  summaryChips={vitalsChips}
  status={<StatusBadge value="Recorded" tone="green" />}
  accentColor="#10B981"
  iconBg="#EAF7F1"
  iconColor="#2F915C"
  metaLeft={
    <>
      <InfoRow label="Measured" value={formatDate(item.measuredAt)} />
      <InfoRow label="Respiratory Rate" value={item.respiratoryRate} />
    </>
  }
  metaRight={
    <>
      <InfoRow
        label="Blood Glucose"
        value={
          item.bloodGlucose?.value &&
          `${item.bloodGlucose.value} ${item.bloodGlucose.unit || ""}`
        }
      />
      <InfoRow
        label="Oxygen Saturation"
        value={item.oxygenSaturation && `${item.oxygenSaturation}%`}
      />
    </>
  }
  footerLeft={item.notes ? `Notes: ${item.notes}` : "Vitals history entry"}
>
  <div className="flex flex-wrap gap-2 text-sm text-[#475467]">
    {item.weight?.value && (
      <SummaryChip
        label="Weight"
        value={`${item.weight.value} ${item.weight.unit || ""}`}
        tone="neutral"
      />
    )}
    {item.height?.value && (
      <SummaryChip
        label="Height"
        value={`${item.height.value} ${item.height.unit || ""}`}
        tone="neutral"
      />
    )}
  </div>
</RecordShell>)
    }

    if (tab === "medications") {

      const medicationChips = (
  <>
    {item.dosage?.value && (
      <SummaryChip
        label="Dose"
        value={`${item.dosage.value} ${item.dosage.unit || ""}`}
        tone="blue"
      />
    )}
    {item.frequency && (
      <SummaryChip label="Frequency:" value={item.frequency} tone="purple" />
    )}
    {item.route && (
      <SummaryChip label="Route:" value={item.route} tone="neutral" />
    )}
  </>
);


      const medicationSubtitle = (
        <div className="flex flex-wrap gap-2">
          {item.dosage?.value && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
              {item.dosage.value} {item.dosage.unit || ""}
            </span>
          )}

          {item.frequency && (
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-sm font-semibold text-purple-700">
              {item.frequency}
            </span>
          )}

          {item.route && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-700">
              {item.route}
            </span>
          )}
        </div>
      );

      return (
        <RecordShell
  key={item.id}
  icon={<Pill size={18} />}
  title={item.medicationName}
  subtitle={item.indication || "Medication entry"}
  summaryChips={medicationChips}
  status={
    <StatusBadge
      value={item.medicationStatus || "Active"}
      tone={item.medicationStatus === "active" ? "green" : "gray"}
    />
  }
  accentColor="#3B82F6"
  iconBg="#EFF6FF"
  iconColor="#2563EB"
  metaLeft={
    <>
      <InfoRow label="Form" value={item.form || "—"} />
      <InfoRow
        label="Prescribed by"
        value={item.prescribedByFullName || item.prescriberName || "Unknown"}
      />
      <InfoRow label="Started" value={formatDate(item.prescribedAt)} />
    </>
  }
  metaRight={
    <>
      <InfoRow label="Generic" value={item.genericName || "—"} />
      <InfoRow label="Brand" value={item.brandName || "—"} />
      <InfoRow label="Facility" value={item.facilityName || "—"} />
    </>
  }
  footerLeft={item.notes || "Medication history entry"}
/>
      );
    }

    if (tab === "allergies") {
      const allergySubtitle = (
        <div className="flex flex-wrap gap-2">
          {item.allergyType && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
              {item.allergyType}
            </span>
          )}

          {item.reaction && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
              {item.reaction}
            </span>
          )}
        </div>
      );
      return (
        <RecordShell
  key={item.id}
  icon={<AlertCircle size={18} />}
  title={item.allergen}
  subtitle={allergySubtitle || "Allergy record"}
  status={item.clinicalStatus || "Active"}
  accentColor="#EF4444"
  iconBg="#FEF2F2"
  iconColor="#DC2626"
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
      const diagnosisSubtitle = (
        <div className="flex flex-wrap gap-2">
          {item.diagnosisType && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-sm text-indigo-700">
              {item.diagnosisType}
            </span>
          )}

          {item.icd10Code && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm font-mono text-gray-700">
              {item.icd10Code}
            </span>
          )}
        </div>
      );
      return (
        <RecordShell
  key={item.id}
  icon={<Stethoscope size={18} />}
  title={item.diagnosisName}
  subtitle={diagnosisSubtitle || "Diagnosis entry"}
  status={item.clinicalStatus || "Recorded"}
  accentColor="#6366F1"
  iconBg="#EEF2FF"
  iconColor="#4F46E5"
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
      const immunizationSubtitle = (
        <div className="flex flex-wrap gap-2">
          {item.series && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm text-blue-700">
              {item.series}
            </span>
          )}

          {item.doseNumber && (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
              Dose {item.doseNumber}
            </span>
          )}
        </div>
      );
      return (
        <RecordShell
  key={item.id}
  icon={<Syringe size={18} />}
  title={item.vaccineName}
  subtitle={immunizationSubtitle || "Immunization entry"}
  status={item.immunizationStatus || "Completed"}
  accentColor="#14B8A6"
  iconBg="#F0FDFA"
  iconColor="#0F766E"
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

    if (tab === "procedures") {
      const procedureSubtitle = (
        <div className="flex flex-wrap gap-2">
          {item.procedureType && (
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-sm text-purple-700">
              {item.procedureType}
            </span>
          )}

          {item.outcome && (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
              {item.outcome}
            </span>
          )}
        </div>
      );
      return (
        <RecordShell
  key={item.id}
  icon={<FlaskConical size={18} />}
  title={item.procedureName || "Unknown Procedure"}
  subtitle={procedureSubtitle || "Surgical Procedure"}
  status={item.clinicalStatus || item.outcome || "Completed"}
  accentColor="#8B5CF6"
  iconBg="#F5F3FF"
  iconColor="#7C3AED"
  metaLeft={
    <>
      <InfoRow
        label="Performed"
        value={item.performedAt ? formatDate(item.performedAt) : "—"}
      />
      <InfoRow label="Indication" value={item.indication || "—"} />
    </>
  }
  metaRight={
    <>
      <InfoRow
        label="Performed By"
        value={item.performedBy?.organizationName || "—"}
      />
      <InfoRow
        label="Facility"
        value={item.facilityName || item.performedBy?.organizationName || "—"}
      />
    </>
  }
  footerLeft={item.notes || "No additional notes"}
  actionLabel="View Details"
/>
      );
    }

    if (tab === "lab") {
      const labSubtitle = (
        <div className="flex flex-wrap gap-2">
          {item.resultValue && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
              {item.resultValue} {item.unit || ""}
            </span>
          )}

          {item.interpretation && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
              {item.interpretation}
            </span>
          )}
        </div>
      );
      return (
        <RecordShell
  key={item.id}
  icon={<FlaskConical size={18} />}
  title={item.testName}
  subtitle={labSubtitle || "Lab result"}
  status={item.interpretation || "Completed"}
  accentColor="#F59E0B"
  iconBg="#FFFBEB"
  iconColor="#D97706"
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
