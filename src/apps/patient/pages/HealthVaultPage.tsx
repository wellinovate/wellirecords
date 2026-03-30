import React, { useEffect, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { vaultApi } from "@/shared/api/vaultApi";
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
  // "All",
  "vitals",
  "Allergy",
  "Prescription/Medications",
  "Diagnoses",
  "Lab Result",
  "Vaccination",
  "Procedures / Surgeries",
  "Clinical Note",
  "Immunizations",
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
    label: "Immunizations",
    link: "immunizations",
    icon: Activity,
    color: "#ef4444",
    example: "Hypertension, diabetes, asthma…",
  },
  {
    label: "Procedures / Surgeries",
    link: "procedures",
    icon: ScanLine,
    color: "#ec4899",
    example: "X-ray, MRI, CT scan reports…",
  },
  // {
  //   label: "Clinical Notes",
  //   link: "note",
  //   icon: Stethoscope,
  //   color: "#1a6b42",
  //   example: "Visit summaries, SOAP notes…",
  // },
  // {
  //   label: "Vaccinations",
  //   link: "vaccinations",
  //   icon: Syringe,
  //   color: "#f59e0b",
  //   example: "Yellow fever, COVID, travel shots…",
  // },
];

/* ─── Main page component ─────────────────────────────────────── */
export function HealthVaultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const records = vaultApi.getRecords(user?.userId ?? "");
  const journeys = vaultApi.getJourneys(user?.userId ?? "");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState([]);
  const [activeType, setActiveType] = useState("All");
  const [wizardOpen, setWizardOpen] = useState(false);

  const loadVitals = async () => {
    try {
      const result = await getUsersRecord(1, 10);
      setSummary(result.items || []);
    } catch (err: any) {
      console.log("🚀 ~ loadVitals ~ err.message:", err.message);
    } finally {
      // setLoadingVitals(false);
    }
  };

  useEffect(() => {
    loadVitals();
  }, []);

  const vaultIsEmpty = records.length === 0;

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
      {vaultIsEmpty ? (
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

/* ─── Onboarding empty state sub-component ───────────────────── */
function VaultOnboarding({ onAddRecord }: { onAddRecord: () => void }) {
  return (
    <div className="animate-fade-in">
      {/* Hero card */}
      <div
        className="rounded-3xl overflow-hidden mb-6"
        style={{
          background:
            "linear-gradient(135deg,#0d3d22 0%,#1a6b42 60%,#2d9d63 100%)",
        }}
      >
        <div className="px-8 py-4 relative">
          {/* Decorative blobs */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "#fff", transform: "translate(30%,-30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: "#fff", transform: "translate(-30%,30%)" }}
          />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <HardDrive size={24} color="#fff" />
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">
                 Your Vault
                </div>
                <div
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Let's build your lifetime health record
                </div>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Your <strong style={{ color: "#fff" }}>WelliFile</strong> is a
              portable, encrypted container that holds every piece of your
              medical history in one place. Unlike hospital portals that lock
              your data away, your WelliFile belongs <em>only to you</em>.
            </p>

            {/* Primary CTA */}
            <button
              onClick={onAddRecord}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "#fff",
                color: "#1a6b42",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              <UploadCloud size={18} />
              Upload Record
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* "What to add" grid */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-3" style={{ color: "#1a2e1e" }}>
          What kinds of records can you store?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHOWCASE_TYPES.map(({ label, link, icon: Icon, color, example }) => (
            <Link
              to={`/patient/vault/${link}`}
              key={label}
              className="card-patient p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div
                className="font-semibold text-sm mb-1"
                style={{ color: "#1a2e1e" }}
              >
                {label}
              </div>
              <div
                className="text-xs leading-tight"
                style={{ color: "#9ca3af" }}
              >
                {example}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: Lock,
            color: "#1a6b42",
            title: "End-to-end Encrypted",
            body: "Only you hold the keys to your data",
          },
          {
            icon: ShieldCheck,
            color: "#3b82f6",
            title: "WelliChain Verified",
            body: "Every record is tamper-proof on the blockchain",
          },
          {
            icon: Sparkles,
            color: "#8b5cf6",
            title: "Share in Seconds",
            body: "Send any record to a provider via QR",
          },
        ].map(({ icon: Icon, color, title, body }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: `${color}07`, border: `1px solid ${color}18` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <div
                className="font-bold text-xs mb-0.5"
                style={{ color: "#1a2e1e" }}
              >
                {title}
              </div>
              <div
                className="text-xs leading-tight"
                style={{ color: "#6b7280" }}
              >
                {body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
