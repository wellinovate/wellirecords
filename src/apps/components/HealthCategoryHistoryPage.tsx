import { FirstRecordWizard } from "@/apps/patient/components/FirstRecordWizard";
import { getUsersRecords } from "@/shared/utils/utilityFunction";
import { Search, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const CATEGORY_LABELS: Record<string, string> = {
  vitals: "Vitals History",
  medications: "Medication History",
  allergies: "Allergy History",
  diagnoses: "Diagnosis History",
  immunizations: "Immunization History",
  "lab-results": "Lab Results History",
  procedures: "Procedures / Surgeries History",
  "clinical-notes": "Clinical Notes History",
};

export function HealthCategoryHistoryPage() {
  const { category } = useParams();
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [record, setRecord] = useState<any[]>([]);

  const title = CATEGORY_LABELS[category || ""] || "Health History";

  const loadRecords = async () => {
    try {
      const result = await getUsersRecords(category, 1, 10);
      setRecord(result.items || []);
    } catch (err: any) {
      console.log("🚀 ~ loadRecords ~ err.message:", err.message);
    }
  };

  useEffect(() => {
    if (category) {
      loadRecords();
    }
  }, [category]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return record.filter((item) => {
      if (category === "vitals") {
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

      if (category === "medications") {
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

      if (category === "allergies") {
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

      if (category === "diagnoses") {
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

      if (category === "immunizations") {
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

      if (category === "lab-results") {
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
  }, [record, category, search]);

  const renderRecordCard = (item: any) => {
    if (category === "vitals") {
      return (
        <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 space-y-2">
          <div className="text-xs text-[#7b9ac0]">
            {item.measuredAt ? new Date(item.measuredAt).toLocaleString() : "No date"}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#e8f1ff]">
            {item.bloodPressure && (
              <span>
                BP: {item.bloodPressure.systolic}/{item.bloodPressure.diastolic}
              </span>
            )}
            {item.heartRate && <span>HR: {item.heartRate} bpm</span>}
            {item.temperature?.value && (
              <span>
                Temp: {item.temperature.value}°{item.temperature.unit}
              </span>
            )}
            {item.respiratoryRate && <span>RR: {item.respiratoryRate}</span>}
            {item.oxygenSaturation && <span>O₂: {item.oxygenSaturation}%</span>}
            {item.weight?.value && (
              <span>
                WT: {item.weight.value} {item.weight.unit}
              </span>
            )}
            {item.height?.value && (
              <span>
                HT: {item.height.value} {item.height.unit}
              </span>
            )}
            {item.bloodGlucose?.value && (
              <span>
                Glucose: {item.bloodGlucose.value} {item.bloodGlucose.unit}
              </span>
            )}
          </div>

          {item.notes && <div className="text-sm text-[#7b9ac0]">{item.notes}</div>}
        </div>
      );
    }

    if (category === "medications") {
      return (
        <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 space-y-2">
          <div className="text-xs text-[#7b9ac0]">
            {item.prescribedAt ? new Date(item.prescribedAt).toLocaleString() : "No date"}
          </div>

          <div className="text-sm font-semibold text-[#e8f1ff]">
            {item.medicationName}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#e8f1ff]">
            {item.genericName && <span>Generic: {item.genericName}</span>}
            {item.brandName && <span>Brand: {item.brandName}</span>}
            {item.dosage?.value && (
              <span>
                Dosage: {item.dosage.value} {item.dosage.unit}
              </span>
            )}
            {item.route && <span>Route: {item.route}</span>}
            {item.frequency && <span>Frequency: {item.frequency}</span>}
            {item.medicationStatus && <span>Status: {item.medicationStatus}</span>}
          </div>

          {item.indication && (
            <div className="text-sm text-[#7b9ac0]">Indication: {item.indication}</div>
          )}
          {item.notes && <div className="text-sm text-[#7b9ac0]">{item.notes}</div>}
        </div>
      );
    }

    if (category === "allergies") {
      return (
        <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 space-y-2">
          <div className="text-sm font-semibold text-[#e8f1ff]">{item.allergen}</div>

          <div className="flex flex-wrap gap-3 text-sm text-[#e8f1ff]">
            {item.allergyType && <span>Type: {item.allergyType}</span>}
            {item.severity && <span>Severity: {item.severity}</span>}
            {item.clinicalStatus && <span>Status: {item.clinicalStatus}</span>}
            {item.verificationStatus && (
              <span>Verification: {item.verificationStatus}</span>
            )}
          </div>

          {item.reaction && (
            <div className="text-sm text-[#7b9ac0]">Reaction: {item.reaction}</div>
          )}
        </div>
      );
    }

    if (category === "diagnoses") {
      return (
        <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 space-y-2">
          <div className="text-xs text-[#7b9ac0]">
            {item.diagnosedAt ? new Date(item.diagnosedAt).toLocaleString() : "No date"}
          </div>

          <div className="text-sm font-semibold text-[#e8f1ff]">
            {item.diagnosisName}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#e8f1ff]">
            {item.diagnosisType && <span>Type: {item.diagnosisType}</span>}
            {item.icd10Code && <span>ICD-10: {item.icd10Code}</span>}
            {item.clinicalStatus && <span>Status: {item.clinicalStatus}</span>}
          </div>

          {item.notes && <div className="text-sm text-[#7b9ac0]">{item.notes}</div>}
        </div>
      );
    }

    if (category === "immunizations") {
      return (
        <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 space-y-2">
          <div className="text-xs text-[#7b9ac0]">
            {item.administeredAt
              ? new Date(item.administeredAt).toLocaleString()
              : "No date"}
          </div>

          <div className="text-sm font-semibold text-[#e8f1ff]">
            {item.vaccineName}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[#e8f1ff]">
            {item.vaccineCode && <span>Code: {item.vaccineCode}</span>}
            {item.manufacturer && <span>Manufacturer: {item.manufacturer}</span>}
            {item.doseNumber && <span>Dose: {item.doseNumber}</span>}
            {item.immunizationStatus && <span>Status: {item.immunizationStatus}</span>}
          </div>
        </div>
      );
    }

    if (category === "lab-results") {
      return (
        <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 space-y-2">
          <div className="text-xs text-[#7b9ac0]">
            {item.resultedAt ? new Date(item.resultedAt).toLocaleString() : "No date"}
          </div>

          <div className="text-sm font-semibold text-[#e8f1ff]">{item.testName}</div>

          <div className="flex flex-wrap gap-3 text-sm text-[#e8f1ff]">
            {item.category && <span>Category: {item.category}</span>}
            {item.resultValue && <span>Result: {item.resultValue}</span>}
            {item.unit && <span>Unit: {item.unit}</span>}
            {item.interpretation && <span>Interpretation: {item.interpretation}</span>}
          </div>

          {item.notes && <div className="text-sm text-[#7b9ac0]">{item.notes}</div>}
        </div>
      );
    }

    return (
      <div key={item.id} className="rounded-lg bg-[#0d2443] px-4 py-3 text-sm text-[#e8f1ff]">
        Record
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {wizardOpen && <FirstRecordWizard onClose={() => setWizardOpen(false)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="section-header font-display" style={{ color: "#1a2e1e" }}>
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

      <div className="relative mb-6">
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

      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="card-patient p-8 text-center">
            <p className="font-semibold" style={{ color: "#5a7a63" }}>
              No records found
            </p>
          </div>
        ) : (
          filteredRecords.map((item) => renderRecordCard(item))
        )}
      </div>
    </div>
  );
}