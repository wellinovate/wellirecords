import React, { useEffect, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { getMyHealthRecords } from "@/shared/api/healthRecordsApi";
import { HealthRecord } from "@/shared/types/types";
import {
  Search,
  UploadCloud,
  FileText,
  FlaskConical,
  ScanLine,
  Pill,
  Syringe,
  Stethoscope,
  X,
  Tag,
  ShieldCheck,
  Activity,
  AlertTriangle,
  DownloadCloud,
  HardDrive,
  Sparkles,
  Lock,
  ChevronRight,
} from "lucide-react";
import { FirstRecordWizard } from "@/apps/patient/components/FirstRecordWizard";
import { Link, useNavigate } from "react-router-dom";
import { getUsersRecord } from "@/shared/utils/utilityFunction";
import { RecordsTimelineSection } from "@/apps/components/RecordsTimelineSection";

/* ─── Icon / colour maps ───────────────────────────────────────── */
const TYPE_ICONS: Record<string, any> = {
  "Lab Result": FlaskConical,
  Prescription: Pill,
  Imaging: ScanLine,
  "Clinical Note": Stethoscope,
  Vaccination: Syringe,
  Encounter: FileText,
  Referral: FileText,
  "Chronic Condition": Activity,
  Allergy: AlertTriangle,
};

const TYPE_COLORS: Record<string, string> = {
  "Lab Result": "#3b82f6",
  Prescription: "#8b5cf6",
  Imaging: "#ec4899",
  "Clinical Note": "#1a6b42",
  Vaccination: "#f59e0b",
  Encounter: "#14b8a6",
  Referral: "#6366f1",
  "Chronic Condition": "#ef4444",
  Allergy: "#f97316",
};

const FILTER_TYPES = [
  "vitals",
  "Allergy",
  "Prescription/Medications",
  "Diagnoses",
  "Lab Result",
  "Vaccination",
  "Procedures / Surgeries",
  "Clinical Note",
];

/* ─── Record-type showcase for the onboarding empty state ─────── */
const SHOWCASE_TYPES = [
  {
    label: "Vitals",
    link: "vitals",
    icon: FlaskConical,
    color: "#3b82f6",
    example: "Blood work, urinalysis, HIV, HBA1C…",
  },
  {
    label: "Medications/prescriptions",
    link: "medications",
    icon: Pill,
    color: "#8b5cf6",
    example: "Current meds, refills, dosages…",
  },
  {
    label: "Allergies",
    link: "allergies",
    icon: Stethoscope,
    color: "#1a6b42",
    example: "Visit summaries, SOAP notes…",
  },
  {
    label: "Diagnoses",
    link: "diagnoses",
    icon: Activity,
    color: "#ef4444",
    example: "Hypertension, diabetes, asthma…",
  },
  {
    label: "Lab Results",
    link: "lab",
    icon: FlaskConical,
    color: "#3b82f6",
    example: "Blood work, urinalysis, HIV, HBA1C…",
  },
  {
    label: "Procedures / Surgeries",
    link: "procedures",
    icon: ScanLine,
    color: "#ec4899",
    example: "X-ray, MRI, CT scan reports…",
  },
];

/* ─── Main page component ─────────────────────────────────────── */
export function HealthVaultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.sub;
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  // No care-journey concept exists on the backend yet — real records
  // only, no fabricated journey entries or fallback-to-another-patient.
  const journeys: any[] = [];
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState([]);
  const [activeType, setActiveType] = useState("All");
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    setRecordsLoading(true);
    getMyHealthRecords(patientId)
      .then(setRecords)
      .finally(() => setRecordsLoading(false));
  }, [patientId]);

  const loadVitals = async () => {
    try {
      const result = await getUsersRecord(1, 10);
      setSummary(result.items || []);
    } catch (err: any) {
      console.log("🚀 ~ loadVitals ~ err.message:", err.message);
    }
  };

  useEffect(() => {
    loadVitals();
  }, []);

  const vaultIsEmpty = !recordsLoading && records.length === 0;

  const groupedByType = records.reduce<Record<string, HealthRecord[]>>(
    (acc, record) => {
      const key = record.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    },
    {},
  );

  const filtered = records.filter((r) => {
    const matchType = activeType === "All" || r.type === activeType;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.provider.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      {wizardOpen && <FirstRecordWizard onClose={() => setWizardOpen(false)} />}

      {/* Page header */}
      <div className="mb-8">
        <h1
          className="section-header font-display"
          style={{ color: "#1a2e1e" }}
        >
          Health Story
        </h1>
        <p className="text-sm" style={{ color: "#5a7a63" }}>
          The complete timeline of your health journey — encrypted and owned by
          you
        </p>
      </div>

      {/* ─── EMPTY-VAULT STATE (zero records at all) ─────────────── */}
      {recordsLoading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "#1e3a8a", borderTopColor: "transparent" }} />
          <span className="text-sm" style={{ color: "#5a7a63" }}>Loading your records...</span>
        </div>
      ) : vaultIsEmpty ? (
        <VaultOnboarding onAddRecord={() => setWizardOpen(true)} />
      ) : (
        <RecordsTimelineSection
          search={search}
          setSearch={setSearch}
          activeType={activeType}
          setActiveType={setActiveType}
          filtered={filtered}
          journeys={journeys}
          FILTER_TYPES={FILTER_TYPES}
          TYPE_ICONS={TYPE_ICONS}
          TYPE_COLORS={TYPE_COLORS}
          navigate={navigate}
          setWizardOpen={setWizardOpen}
        />
      )}
    </div>
  );
}

/* ─── Sub-component: Vault onboarding (empty state) ──────────── */
function VaultOnboarding({ onAddRecord }: { onAddRecord: () => void }) {
  return (
    <div className="space-y-8">
      {/* Hero card */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          color: "white",
        }}
      >
        <div
          className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #ffffff, transparent 70%)",
          }}
        />

        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20">
            <Lock size={12} /> Encrypted & Private to You
          </div>

          <h2 className="text-2xl font-bold font-display leading-tight">
            Your Health Story Starts Here
          </h2>

          <p className="text-sm text-blue-100 leading-relaxed">
            WelliRecord keeps your complete health history — lab results,
            prescriptions, imaging, and visit notes — organized in one secure
            vault that you control.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onAddRecord}
              className="px-6 py-3 rounded-xl text-sm font-bold text-blue-900 bg-white hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <UploadCloud size={16} /> Add Your First Record
            </button>
          </div>
        </div>
      </div>

      {/* Record types grid */}
      <div>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#1a2e1e" }}>
          What you can store in your vault
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SHOWCASE_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="rounded-xl p-5 border transition-all hover:border-blue-300 group"
                style={{
                  background: "white",
                  borderColor: "rgba(30,58,138,0.1)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${t.color}15`, color: t.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <h4
                    className="font-bold text-sm"
                    style={{ color: "#1a2e1e" }}
                  >
                    {t.label}
                  </h4>
                </div>
                <p className="text-xs" style={{ color: "#5a7a63" }}>
                  {t.example}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
