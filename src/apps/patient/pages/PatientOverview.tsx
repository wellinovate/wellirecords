import { FolderHeart, Shield, UploadCloud } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  getUsersEncounters,
  getUsersRecord,
  mapApiEncounterToUi,
  UiEncounter,
} from "@/shared/utils/utilityFunction";
import { RecentEncountersCard } from "@/apps/components/RecentEncountersCard";
import { DashboardAlerts } from "@/apps/components/DashboardAlerts";
import { SummaryRecordsGrid } from "@/apps/components/SummaryRecordsGrid";

type RecordCategory = {
  category: string;
  recordCount: number;
  lastUpdatedAt: string | null;
  summaryMetric: Record<string, any>;
};

type RecordsResponse = Record<string, RecordCategory>;

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

const DUMMY_RECENT_ENCOUNTERS: EncounterItem[] = [
  // {
  //   id: "enc-001",
  //   date: "2026-04-28T09:00:00.000Z",
  //   title: "Follow-up Appointment",
  //   encounterType: "outpatient",
  //   status: "completed",
  //   facility: "Bayview Medical Center",
  //   provider: "Dr. Jane Smith, Internal Medicine",
  //   summary: "Follow-up for blood pressure review and medication adherence.",
  // },
  // {
  //   id: "enc-002",
  //   date: "2026-04-28T10:30:00.000Z",
  //   title: "Blood Test",
  //   encounterType: "lab",
  //   status: "completed",
  //   facility: "Quest Diagnostics",
  //   summary: "Complete Blood Count (CBC) ordered and processed.",
  // },
  // {
  //   id: "enc-003",
  //   date: "2026-04-20T08:15:00.000Z",
  //   title: "EKG",
  //   encounterType: "cardiology",
  //   status: "ongoing",
  //   facility: "City Heart Clinic",
  //   summary: "Irregular heartbeat observed. Awaiting cardiology review.",
  // },
  // {
  //   id: "enc-004",
  //   date: "2026-04-14T21:00:00.000Z",
  //   title: "Emergency Room Visit",
  //   encounterType: "emergency",
  //   status: "attention",
  //   facility: "Greenfield ER",
  //   summary: "Chest pain visit requires follow-up and discharge review.",
  // },
];

const DUMMY_ALERTS: DashboardAlertItem[] = [
  // {
  //   id: "alert-001",
  //   type: "warning",
  //   title: "Follow-up needed",
  //   message: "Your recent emergency room visit may need a follow-up review.",
  //   ctaLabel: "Review Visit",
  //   ctaLink: "/patient/encounters",
  // },
  // {
  //   id: "alert-002",
  //   type: "info",
  //   title: "Missing immunization records",
  //   message: "No immunization records found yet in your health record.",
  //   ctaLabel: "Upload Record",
  //   ctaLink: "/patient/vault",
  // },
];

export function PatientOverview() {
  const { user } = useAuth();
  // console.log("🚀 ~ PatientOverview ~ user:", user)
  const navigate = useNavigate();

  const [records, setRecords] = useState<RecordsResponse>({});
  const [recentEncounters, setRecentEncounters] = useState<UiEncounter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName =
    user?.fullName ||
    user?.data?.account?.fullName ||
    user?.data?.account?.firstName ||
    "there";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getUsersRecord(1, 10);
        const encounterResult = await getUsersEncounters();
        // console.log(
        //   "🚀 ~ fetchDashboardData ~ encounterResult:",
        //   encounterResult.items,
        // );
        // console.log("isArray?", Array.isArray(encounterResult));
        // console.log("type:", typeof encounterResult);
        // console.log("value:", encounterResult);
        // const formattedEncounters = encounterResult.map(mapApiEncounterToUi);
        const formattedEncounters = Object.values(encounterResult).map(
  mapApiEncounterToUi
);
        setRecentEncounters(formattedEncounters);
        const data: RecordsResponse = result?.data ?? result ?? {};
        setRecords(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const recordList = useMemo(() => Object.values(records || {}), [records]);
  const hasSummaryRecords = recordList.length > 0;

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
            className="btn btn-patient-outline gap-2"
            style={{ background: "var(--pat-surface)" }}
          >
            <UploadCloud size={16} />
            <span className="hidden sm:inline">Upload Record</span>
            <span className="sm:hidden">Upload</span>
          </button>

          <button
            onClick={() => navigate("/patient/vault")}
            className="btn btn-patient gap-2"
          >
            <FolderHeart size={16} />
            <Link to="/patient/vault" className="hidden sm:inline">
              {" "}
              Your Health Record
            </Link>
            <Link to="/" className="sm:hidden">
              Vault
            </Link>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex lg:flex-row flex-col gap-4">
          <DashboardAlerts alerts={DUMMY_ALERTS} onNavigate={navigate} />

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
    </div>
  );
}
