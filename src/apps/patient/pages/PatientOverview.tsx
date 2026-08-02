import { DashboardAlerts } from "@/apps/components/DashboardAlerts";
import { RecentEncountersCard } from "@/apps/components/RecentEncountersCard";
import { SummaryRecordsGrid } from "@/apps/components/SummaryRecordsGrid";
import { RecordModal } from "@/apps/patient/components/FirstRecordWizard";
import {
  buildProfileCompletionAlerts,
  computeProfileCompletion,
} from "@/apps/patient/utils/profileCompletion";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  fetchProfile,
  getUsersEncounters,
  getUsersRecord,
} from "@/shared/utils/utilityFunction";
import { FolderHeart, Shield, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type RecordCategory = {
  category: string;
  recordCount: number;
  lastUpdatedAt: string | null;
  summaryMetric: Record<string, any>;
};

export type RecordsResponse = Record<string, RecordCategory>;

type ApiEncounter = {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  encounterTitle?: string | null;
  encounterType?: string | null;
  status?: string | null;
  organizationName?: string | null;
  organizationPersonName?: string | null;
  chiefComplaint?: string | null;
  reasonForVisit?: string | null;
  notes?: string | null;
  visibilityToPatient?: boolean;
};

type UiEncounter = {
  id: string;
  date: string;
  title: string;
  encounterType: "outpatient" | "lab" | "emergency" | "cardiology";
  status: "completed" | "ongoing" | "attention";
  facility: string;
  provider?: string;
  summary: string;
};

const mapEncounterStatus = (
  status?: string | null,
  endedAt?: string | null,
): UiEncounter["status"] => {
  const normalized = (status || "").toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "closed" ||
    normalized === "done" ||
    !!endedAt
  ) {
    return "completed";
  }

  if (
    normalized === "in-progress" ||
    normalized === "ongoing" ||
    normalized === "active" ||
    normalized === "open"
  ) {
    return "ongoing";
  }

  if (
    normalized === "cancelled" ||
    normalized === "failed" ||
    normalized === "requires-followup" ||
    normalized === "attention"
  ) {
    return "attention";
  }

  return "ongoing";
};

const mapEncounterType = (
  type?: string | null,
): UiEncounter["encounterType"] => {
  const normalized = (type || "").toLowerCase();

  if (normalized === "lab") return "lab";
  if (normalized === "emergency") return "emergency";
  if (normalized === "cardiology") return "cardiology";

  return "outpatient";
};

export const mapApiEncounterToUi = (item: ApiEncounter): UiEncounter => {
  const date =
    item.startedAt ||
    item.createdAt ||
    item.updatedAt ||
    new Date().toISOString();

  return {
    id: item.id,
    date,
    title: item.encounterTitle?.trim() || "Medical Visit",
    encounterType: mapEncounterType(item.encounterType),
    status: mapEncounterStatus(item.status, item.endedAt),
    facility: item.organizationName?.trim() || "Unknown facility",
    provider: item.organizationPersonName?.trim() || undefined,
    summary:
      item.chiefComplaint?.trim() ||
      item.reasonForVisit?.trim() ||
      item.notes?.trim() ||
      "No summary available",
  };
};

export type EncounterItem = {
  id: string;
  date: string;
  title: string;
  encounterType: "outpatient" | "lab" | "emergency" | "cardiology";
  status: "completed" | "ongoing" | "attention";
  facility: string;
  provider?: string;
  summary: string;
};

export type DashboardAlertItem = {
  id: string;
  type: "warning" | "info" | "critical";
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
};



export function PatientOverview() {
  const { user } = useAuth();
  // console.log("🚀 ~ PatientOverview ~ user:", user)
  const navigate = useNavigate();

  const [records, setRecords] = useState<RecordsResponse>({});
  const [recentEncounters, setRecentEncounters] = useState<UiEncounter[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Set when a completion alert's CTA points at a record type (e.g.
  // "record:Allergy") rather than a route — opens the same RecordModal
  // FirstRecordWizard uses, instead of building a second form.
  const [activeRecordType, setActiveRecordType] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [genotype, setGenotype] = useState<string | null>(null);
  const [confirmedNone, setConfirmedNone] = useState<{
    allergies?: boolean;
    medications?: boolean;
    diagnoses?: boolean;
  } | null>(null);

  const displayName =
    user?.fullName ||
    user?.data?.account?.fullName ||
    user?.data?.account?.firstName ||
    "there";
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getUsersRecord(1, 10);
      const encounterResult = await getUsersEncounters();

      // Best-effort: the completion score still works without this,
      // it just treats blood/emergency info as missing.
      fetchProfile()
        .then((profile) => {
          setEmergencyContacts(
            Array.isArray(profile?.emergencyContacts)
              ? profile.emergencyContacts
              : [],
          );
          setBloodGroup(profile?.bloodGroup ?? null);
          setGenotype(profile?.genotype ?? null);
          setConfirmedNone(profile?.confirmedNone ?? null);
        })
        .catch(() => {
          setEmergencyContacts([]);
        });

      const rawItems = Array.isArray(encounterResult?.items)
        ? encounterResult.items
        : [];

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const formattedEncounters = rawItems
        .filter((item: any) => item?.visibilityToPatient !== false)
        .filter((item: any) => {
          const encounterDate = new Date(
            item?.startedAt || item?.createdAt || item?.updatedAt,
          );
          return (
            !Number.isNaN(encounterDate.getTime()) &&
            encounterDate >= twoWeeksAgo
          );
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(
            a?.startedAt || a?.createdAt || a?.updatedAt,
          ).getTime();
          const dateB = new Date(
            b?.startedAt || b?.createdAt || b?.updatedAt,
          ).getTime();
          return dateB - dateA;
        })
        .map(mapApiEncounterToUi);

      setRecentEncounters(formattedEncounters);

      const data: RecordsResponse = result?.data ?? result ?? {};
      setRecords(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
      setRecentEncounters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  const recordList = useMemo(() => Object.values(records || {}), [records]);
  const hasSummaryRecords = recordList.length > 0;

  const completionAlerts = useMemo(() => {
    const result = computeProfileCompletion(
      records,
      emergencyContacts,
      bloodGroup,
      genotype,
      confirmedNone,
    );
    return buildProfileCompletionAlerts(result);
  }, [records, emergencyContacts, bloodGroup, genotype, confirmedNone]);

  const handleAlertNavigate = (ctaLink: string) => {
    if (ctaLink.startsWith("record:")) {
      setActiveRecordType(ctaLink.slice("record:".length));
      return;
    }
    navigate(ctaLink);
  };

  const handleRecordModalClose = () => {
    setActiveRecordType(null);
    fetchDashboardData();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="section-header font-display mb-1 text-[28px]"
            style={{ color: "var(--pat-text)" }}
          >
            Welcome to your Dashboard, {displayName}!
          </h1>
          <p
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--pat-muted)" }}
          >
            <Shield size={16} style={{ color: "var(--pat-primary)" }} />
            Your records are private and securely stored.
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/patient/vault")}
            className="inline-flex items-center gap-2 rounded-lg border border-[#365f8f] bg-[#102849] px-4 py-2 text-sm font-medium text-[#dcecff] transition hover:bg-[#143258]"
          >
            <UploadCloud size={16} />
            <span className="hidden sm:inline">Upload Record</span>
            <span className="sm:hidden">Upload</span>
          </button>

          <button
            onClick={() => navigate("/patient/vault")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(47,107,255,0.28)] transition hover:from-[#037269] hover:to-[#046839]"
            style={{
              background:
                "linear-gradient(135deg,#0d3d22 0%,#1a6b42 60%,#2d9d63 100%)",
            }}
          >
            <FolderHeart size={16} />
            <span className="hidden sm:inline">Your Health Record</span>
            <span className="sm:hidden">Vault</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex lg:flex-row flex-col gap-4">
          <DashboardAlerts alerts={completionAlerts} onNavigate={handleAlertNavigate} />

          <RecentEncountersCard
            encounters={recentEncounters}
            onViewAll={() => navigate("/patient/encounters")}
            isLoading={loading}
            onViewDetails={(id) => navigate(`/patient/encounters/${id}`)}
            onShare={(id) => console.log("share encounter", id)}
            onContinueCare={(id) => console.log("continue care", id)}
          />
        </div>

        <SummaryRecordsGrid
          loading={loading}
          records={recordList}
          onViewCategory={(category) =>
            navigate(`/patient/records/${category}`)
          }
        />

        {/* {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )} */}

        {!loading && !hasSummaryRecords && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No health record summary yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload your first health record to start building your dashboard.
            </p>
            <button
              onClick={() => navigate("/patient/vault")}
              className="btn btn-patient"
            >
              Upload Record
            </button>
          </div>
        )}
      </div>

      {activeRecordType && (
        <RecordModal
          type={activeRecordType}
          onClose={handleRecordModalClose}
        />
      )}
    </div>
  );
}
