import { useState, useEffect, useMemo } from "react";
import { 
  Pill, Activity, Syringe, FlaskConical, AlertCircle, Stethoscope, HeartPulse, 
  Search,
  UploadCloud
} from "lucide-react";
import { FirstRecordWizard } from "@/apps/patient/components/FirstRecordWizard";
import { HealthHistoryLoader } from "./Loader/HealthHistoryLoader";
import { formatDate, InfoRow, RecordShell, StatusBadge, SummaryChip } from "./HealthCategoryHistoryPage";

// Keep your existing helper functions: formatDate, InfoRow, RecordShell

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

type RecordItem = any; // You can make this more specific later

type MedicalRecordsProps = {
  vitals: any[];
  medications: any[];
  allergies: any[];
  diagnoses: any[];
  labResults: any[];
  procedures: any[];
  loadingVitals: boolean;
  loadingMedications: boolean;
  loadingAllergies: boolean;
  loadingDiagnoses: boolean;
  loadingLabResults: boolean;
  loadingProcedures: boolean;
  onAddRecord?: (type: string) => void;
};

export function MedicalRecords({
  vitals,
  medications,
  allergies,
  diagnoses,
  labResults,
  procedures,
  loadingVitals,
  loadingMedications,
  loadingAllergies,
  loadingDiagnoses,
  loadingLabResults,
  loadingProcedures,
  onAddRecord,
  variant = "light",
}: MedicalRecordsProps & {
  variant?: "light" | "dark";
}) {

  const isDark = variant === "dark";

const textClass = {
  heading: isDark ? "text-white" : "text-[#1F2A37]",
  muted: isDark ? "text-[#9FB3CF]" : "text-[#667085]",
  input: isDark
    ? "border border-[#163761] bg-[#0b2447] text-white placeholder:text-[#9FB3CF]"
    : "input input-light",
  emptyCard: isDark
    ? "rounded-2xl border border-[#163761] bg-[#0b2447]/60 p-8 text-center"
    : "card-patient p-8 text-center",
};
  
  
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [tab, setTab] = useState<string>("vitals");

  const title = CATEGORY_LABELS[tab] || "Health History";

  const currentRecords = useMemo(() => {
    switch (tab) {
      case "vitals": return vitals;
      case "medications": return medications;
      case "allergies": return allergies;
      case "diagnoses": return diagnoses;
      case "lab": return labResults;
      case "procedures": return procedures;
      default: return [];
    }
  }, [tab, vitals, medications, allergies, diagnoses, labResults, procedures]);

    const isLoading = useMemo(() => {
    switch (tab) {
      case "vitals": return loadingVitals;
      case "medications": return loadingMedications;
      case "allergies": return loadingAllergies;
      case "diagnoses": return loadingDiagnoses;
      case "lab": return loadingLabResults;
      case "procedures": return loadingProcedures;
      default: return false;
    }
  }, [tab, loadingVitals, loadingMedications, loadingAllergies, loadingDiagnoses, loadingLabResults, loadingProcedures]);


  

  const changeRecordsTab = (nextTab: string) => {
    setSearch("");
    setTab(nextTab);
  };

  

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

     if (!q) return currentRecords;

    return currentRecords.filter((item) => {
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
  }, [currentRecords, tab, search]);

  const renderRecordCard = (item: RecordItem) => {
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
      variant={variant}
      title="Vital Record"
      subtitle={formatDate(item.measuredAt) || "Patient vital signs"}
      summaryChips={vitalsChips}
      status={<StatusBadge value="Recorded" tone="green" />}
      metaLeft={
        <>
          <InfoRow label="Measured" value={formatDate(item.measuredAt)} />
    
          {/* <InfoRow label="Blood Pressure" value={bloodPressure} /> */}
          {/* <InfoRow label="Heart Rate" value={item.heartRate ? `${item.heartRate} bpm` : "—"} /> */}
          <InfoRow label="Respiratory Rate" value={item.respiratoryRate} />
        </>
      }
      metaRight={
        <>
          <InfoRow
            label="Blood Glucose"
            value={
              item.bloodGlucose?.value
                && `${item.bloodGlucose.value} ${item.bloodGlucose.unit || ""}`}
          />
          <InfoRow
            label="Oxygen Saturation"
            value={item.oxygenSaturation && `${item.oxygenSaturation}%` }
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
      variant={variant}
      subtitle={item.indication || "Medication entry"}
      summaryChips={medicationChips}
      status={
        <StatusBadge
          value={item.medicationStatus || "Active"}
          tone={item.medicationStatus === "active" ? "green" : "gray"}
        />
      }
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
      return (
        <RecordShell
          key={item.id}
          icon={<AlertCircle size={18} />}
          title={item.allergen}
          variant={variant}
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
          variant={variant}
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
          variant={variant}
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

    if (tab === "procedures") {
      return (
        <RecordShell
          key={item.id}
          icon={<FlaskConical size={18} />} // Consider changing icon to something more suitable like Scalpel or Activity
          title={item.procedureName || "Unknown Procedure"}
          variant={variant}
          subtitle={
            [item.procedureType, item.outcome].filter(Boolean).join(" • ") ||
            "Surgical Procedure"
          }
          status={item.clinicalStatus || item.outcome || "Completed"}
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
                value={
                  item.facilityName || item.performedBy?.organizationName || "—"
                }
              />
            </>
          }
          footerLeft={item.notes || "No additional notes"}
          actionLabel="View Details"
        />
      );
    }

    if (tab === "lab") {
      return (
        <RecordShell
          key={item.id}
          icon={<FlaskConical size={18} />}
          title={item.testName}
          variant={variant}
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
        variant={variant}
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

      {/* Category Tabs */}
      <div className="mb-2 space-y-4">
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
    : isDark
    ? "bg-[#0b2447] text-[#D7E6FA] border-[#163761] hover:bg-[#102a4d]"
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

      {/* Header with Search + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={`font-display text-xl font-bold ${textClass.heading}`}>
  {title}
</h1>
        </div>

        <div className="relative">
          <Search
  size={16}
  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
    isDark ? "text-[#9FB3CF]" : "text-gray-400"
  }`}
/>
          <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className={`w-full rounded-xl px-4 py-2 pl-10 outline-none ${textClass.input}`}
  placeholder={`Search ${title.toLowerCase()}...`}
/>
        </div>

         {onAddRecord && (
            <button 
              className="btn btn-patient gap-2 whitespace-nowrap"
              onClick={() => onAddRecord(tab === "lab" ? "Lab Results" : tab.charAt(0).toUpperCase() + tab.slice(1))}
            >
              <UploadCloud size={16} />
              Add New
            </button>
          )}
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {isLoading  ? (
          <HealthHistoryLoader title={title} />
        ) : filteredRecords.length === 0 ? (
          <div className={textClass.emptyCard}>
  <p className={`font-semibold ${isDark ? "text-[#D7E6FA]" : "text-[#5a7a63]"}`}>
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