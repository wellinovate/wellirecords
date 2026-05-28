import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  consentApi,
  auditApi,
  type AccessGrant,
  type AccessAudit,
  type CreateGrantPayload,
} from "@/shared/api/consentApi";

import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  X,
  Plus,
  Eye,
  AlertTriangle,
  FileText,
  DownloadCloud,
  QrCode,
  Share2,
  Copy,
  FileJson,
  Link,
  Activity,
  Trash2,
  Lock,
  Loader2,
} from "lucide-react";

type ConsentScope = "full-record" | "category" | "encounter";
type ConsentDuration = "24h" | "7d" | "30d" | "permanent";
type ActiveTab = "active" | "requests" | "audit" | "export";

const SCOPE_OPTIONS: {
  value: ConsentScope;
  label: string;
  category?: string | null;
}[] = [
  { value: "full-record", label: "Full History", category: null },
  { value: "category", label: "Labs Only", category: "lab-results" },
  { value: "category", label: "Medications", category: "medications" },
  { value: "category", label: "Vitals", category: "vitals" },
  { value: "category", label: "Diagnoses", category: "diagnoses" },
  { value: "category", label: "Allergies", category: "allergies" },
];

const DURATION_OPTIONS: {
  value: ConsentDuration;
  label: string;
  aiNote?: string;
}[] = [
  { value: "24h", label: "24 hours", aiNote: "Recommended" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "permanent", label: "Permanent" },
];

function timeAgo(iso?: string | null) {
  if (!iso) return "Unknown";

  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;

  return `${Math.floor(secs / 86400)}d ago`;
}

function getGrantName(grant: AccessGrant) {
  if (
    grant.granteeOrganizationId 
    // && typeof grant.granteeOrganizationId === "object"
  ) {
    return (
      grant.granteeOrganizationId?.organizationName || "Unknown organization"
    );
  }

  if (grant.granteeUserId && typeof grant.granteeUserId === "object") {
    return (
      grant.granteeUserId.fullName ||
      grant.granteeUserId.email ||
      "Unknown provider"
    );
  }

  return "Unknown grantee";
}

function getGrantSubtitle(grant: AccessGrant) {
  const scope =
    grant.accessScope === "full-record"
      ? "Full History"
      : grant.accessScope === "category"
        ? grant.category || "Category"
        : grant.accessScope;

  const expiry = grant.expiresAt
    ? `Expires ${timeAgo(grant.expiresAt)}`
    : "No expiry";

  return `${grant.granteeType} · ${scope} · ${expiry}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getStatusClasses(status: AccessGrant["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    case "revoked":
      return "bg-red-100 text-red-700 ring-red-200";
    case "expired":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case "rejected":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function TrustRing({ score = 90 }: { score?: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const colorClass =
    score >= 85
      ? "text-emerald-500"
      : score >= 65
        ? "text-amber-500"
        : "text-red-500";

  return (
    <svg width={44} height={44} className="shrink-0">
      <circle
        cx={22}
        cy={22}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-slate-200"
        strokeWidth={4}
      />
      <circle
        cx={22}
        cy={22}
        r={r}
        fill="none"
        stroke="currentColor"
        className={colorClass}
        strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text
        x={22}
        y={26}
        textAnchor="middle"
        fontSize={10}
        fontWeight="bold"
        className={colorClass}
        fill="currentColor"
      >
        {score}
      </text>
    </svg>
  );
}



export function DataSovereigntyCenterPage() {
  const { user } = useAuth();
  // console.log("🚀 ~ DataSovereigntyCenterPageXXXXXXXXXXX ~ user:", user);

  const patientId = user?.sub;

  const [tab, setTab] = useState<ActiveTab>("active");

  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [requests, setRequests] = useState<AccessGrant[]>([]);
  const [audit, setAudit] = useState<AccessAudit[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [newScope, setNewScope] = useState<ConsentScope>("category");
  const [newCategory, setNewCategory] = useState<string | null>("lab-results");
  const [newDuration, setNewDuration] = useState<number>(1);
  const [granteeType, setGranteeType] = useState<"provider" | "organization">(
    "provider",
  );
  const [granteeId, setGranteeId] = useState("");
  const [purpose, setPurpose] = useState("");

  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [requestApprovalDuration, setRequestApprovalDuration] =
    useState<ConsentDuration>("24h");



  const [emergencyMode, setEmergencyMode] = useState(false);

  const [exportFormat, setExportFormat] = useState<"fhir" | "pdf">("fhir");
  const [isExporting, setIsExporting] = useState(false);

  const activeGrants = useMemo(
    () => grants?.filter((grant) => grant?.status === "active"),
    [grants],
  );

  const pendingReqs = useMemo(
    () => requests?.filter((request) => request?.status === "pending"),
    [requests],
  );

  const DURATION_OPTIONS = [
  {
    label: "24 Hours",
    value: 1,
    aiNote: "Emergency",
  },
  {
    label: "7 Days",
    value: 7,
    aiNote: "Suggested",
  },
  {
    label: "30 Days",
    value: 30,
  },
  {
    label: "90 Days",
    value: 90,
  },
] as const;

  const recordsViewed30d = audit?.length;

  const flaggedCount = useMemo(() => {
    return audit?.filter((entry) => {
      const hour = new Date(entry.createdAt).getHours();
      return hour < 6 || hour > 22;
    }).length;
  }, [audit]);

  useEffect(() => {
    if (!patientId) return;

    let mounted = true;

    async function loadPageData() {
      try {
        setLoading(true);

        const [grantsData, requestsData, auditData] = await Promise.all([
          consentApi.getMyGrants(patientId),
          consentApi.getRequests(patientId),
          auditApi.getAuditLog(patientId),
        ]);

        if (!mounted) return;

        setGrants(grantsData);
        setRequests(requestsData);
        setAudit(auditData);
      } catch (error) {
        console.error("Failed to load consent center:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPageData();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  async function handleRevokeGrant(grantId: string) {
    try {
      setActionLoadingId(grantId);

      const updatedGrant = await consentApi.revokeGrant(grantId);

      if(updatedGrant){

        setGrants((current) =>
          current.map((grant) => (grant._id === grantId ? updatedGrant : grant)),
        );
      }

    } catch (error) {
      console.error("Failed to revoke grant:", error);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCreateGrant() {
    if (!patientId) return;

    if (!granteeId.trim()) {
      alert("Enter the provider or organization ID.");
      return;
    }

    try {
      const payload: CreateGrantPayload = {
        granteeType,
        accessScope: newScope,
        category: newScope === "category" ? newCategory : null,
        durationDays: Number(newDuration),
        purpose: purpose.trim() || null,
        ...(granteeType === "provider"
          ? { granteeUserId: granteeId.trim() }
          : { granteeOrganizationId: granteeId.trim() }),
      };

      const createdGrant = await consentApi.createGrant(patientId, payload);

      if (createdGrant) {
        setGrants((current) => [createdGrant, ...current]);
        setShowNew(false);
  
        setGranteeId("");
        setPurpose("");
        setNewScope("category");
        setNewCategory("lab-results");
        setNewDuration(1);
         
      }

    } catch (error) {
      console.error("Failed to create grant:", error);
    }
  }

  async function handleApproveRequest(requestId: string) {
    try {
      setRequestActionId(requestId);

      const approvedGrant = await consentApi.approveRequest(
        requestId,
        requestApprovalDuration,
      );

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status: "active",
                reviewedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : request,
        ),
      );

      setGrants((current) => [approvedGrant, ...current]);
    } catch (error) {
      console.error("Failed to approve request:", error);
    } finally {
      setRequestActionId(null);
    }
  }

  async function handleDenyRequest(requestId: string) {
    try {
      setRequestActionId(requestId);

      const deniedRequest = await consentApi.denyRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request._id === requestId ? deniedRequest : request,
        ),
      );
    } catch (error) {
      console.error("Failed to deny request:", error);
    } finally {
      setRequestActionId(null);
    }
  }

  async function handleEmergencyToggle() {
    const nextValue = !emergencyMode;

    try {
      setEmergencyMode(nextValue);
      await consentApi.toggleEmergencyAccess(nextValue);
    } catch (error) {
      console.error("Failed to toggle emergency access:", error);
      setEmergencyMode(!nextValue);
    }
  }

  async function handleExport() {
    try {
      setIsExporting(true);

      const blob = await consentApi.exportRecords(exportFormat);
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        exportFormat === "fhir"
          ? "wellirecord-fhir-export.json"
          : "wellirecord-health-summary.pdf";

      anchor.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export records:", error);
    } finally {
      setIsExporting(false);
    }
  }

  const GRANTEE_TYPE_LABELS = {
    provider: "Individual Provider",
    organization: "Organization",
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading consent center...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      <div className="mb-8 mt-2 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <h1 className="mb-2 flex items-center gap-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Data Sovereignty Center
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Control who can view your health records, how long they can access
            them, and what category of history they are allowed to see.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Grant New Access
            </button>

            <button
              onClick={() => setTab("export")}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              <DownloadCloud className="h-4 w-4" />
              Export Records
            </button>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-start gap-4 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-800 p-5 shadow-sm lg:w-80">
          <div className="rounded-xl bg-white p-2 shadow-inner">
            <QrCode className="h-14 w-14 text-slate-950" />
          </div>

          <div className="flex-1 text-white">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/70">
              WelliRecord ID
            </div>

            <div className="mb-1 font-mono text-lg font-bold tracking-wider">
              {user?.wrId || "WR-8921-XXXX"}
            </div>

            <div className="mb-3 text-[10px] text-white/60">
              Verified patient identity
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] transition hover:bg-white/20">
                <Copy className="h-2.5 w-2.5" />
                Copy ID
              </button>

              <button className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] transition hover:bg-white/20">
                <Share2 className="h-2.5 w-2.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mb-8 overflow-hidden rounded-2xl border-2 transition ${
          emergencyMode
            ? "border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.25)]"
            : "border-slate-200"
        }`}
      >
        <div
          className={`h-1.5 w-full ${emergencyMode ? "bg-red-500" : "bg-slate-200"}`}
        />

        <div className={emergencyMode ? "bg-red-50 p-5" : "bg-white p-5"}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  emergencyMode
                    ? "animate-pulse bg-red-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h3
                    className={`text-base font-bold ${
                      emergencyMode ? "text-red-700" : "text-slate-800"
                    }`}
                  >
                    Emergency Access Mode
                  </h3>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      emergencyMode
                        ? "bg-red-200 text-red-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {emergencyMode ? "Active" : "Standby"}
                  </span>
                </div>

                <p
                  className={`max-w-xl text-sm leading-relaxed ${
                    emergencyMode ? "text-red-700" : "text-slate-600"
                  }`}
                >
                  {emergencyMode
                    ? "Verified first responders can view your emergency vitals and allergies. This access should auto-expire after 24 hours."
                    : "Turn this on only when emergency access is needed. It should expose emergency-safe data, not your full medical history."}
                </p>

                {emergencyMode && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-red-600">
                    <Clock className="h-3 w-3" />
                    Auto-expires in 24h
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleEmergencyToggle}
              className={`relative h-7 w-14 shrink-0 rounded-full transition focus:outline-none ${
                emergencyMode ? "bg-red-500" : "bg-slate-300"
              }`}
              aria-label="Toggle emergency access"
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  emergencyMode ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex w-full gap-1 overflow-x-auto rounded-xl border border-emerald-100 bg-emerald-50/70 p-1 sm:w-fit">
        {/* {(["active", "requests", "audit", "export"] as ActiveTab[]).map( */}
        {(["active", "audit", "export"] as ActiveTab[])?.map(
          (item) => {
            const active = tab === item;

            return (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold capitalize transition ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-emerald-700 hover:bg-white"
                }`}
              >
                {item === "requests"
                  ? `Requests${pendingReqs.length > 0 ? ` (${pendingReqs.length})` : ""}`
                  : item === "active"
                    ? "Security Status"
                    : item}
              </button>
            );
          },
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tab === "active" && (
            <>
              <div className="flex items-start gap-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <Shield className="h-8 w-8 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base font-bold text-emerald-950">
                      Your Data Is Protected
                    </span>

                    <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      All Clear
                    </span>
                  </div>

                  <p className="text-sm text-emerald-800">
                    {activeGrants?.length} active provider access grant
                    {activeGrants?.length === 1 ? "" : "s"}. Every access should
                    be logged, timestamped, and revocable.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4">
                    {[
                      {
                        label: "Active Grants",
                        value: activeGrants?.length,
                        className: "text-emerald-600",
                      },
                      {
                        label: "Records Viewed",
                        value: recordsViewed30d || 0,
                        className: "text-emerald-800",
                      },
                      {
                        label: "Flagged Events",
                        value: flaggedCount || 0,
                        className:
                          flaggedCount > 0
                            ? "text-red-500"
                            : "text-emerald-600",
                      },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div
                          className={`text-2xl font-black ${stat.className}`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {flaggedCount > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-orange-300 bg-orange-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />

                  <div>
                    <div className="text-sm font-bold text-orange-900">
                      Unusual Access Detected
                    </div>

                    <p className="mt-0.5 text-xs text-orange-700">
                      Some access events happened outside normal operating
                      hours. Review the audit log and revoke access where
                      needed.
                    </p>

                    <button
                      onClick={() => setTab("audit")}
                      className="mt-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-700"
                    >
                      Review Audit Log
                    </button>
                  </div>
                </div>
              )}

              <h2 className="pt-2 text-base font-bold text-slate-950">
                Active Access Grants
              </h2>

              <div className="space-y-3">
                {activeGrants?.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                    <Lock className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                    <div className="font-bold text-slate-800">
                      No active access grants
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      No provider currently has active access to your health
                      records.
                    </p>
                  </div>
                ) : (
                  activeGrants?.map((grant) => {
                    const name = getGrantName(grant);
                    const initials = getInitials(name);

                    return (
                      <div
                        key={grant._id}
                        className="flex items-center gap-4 rounded-2xl border border-l-4 border-slate-200 border-l-emerald-500 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-sm font-black text-white">
                          {initials || "PR"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-950">
                              {name}
                            </span>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${getStatusClasses(
                                grant.status,
                              )}`}
                            >
                              {grant.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600">
                            {getGrantSubtitle(grant)}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Eye className="h-2.5 w-2.5" />
                              View:{" "}
                              {grant.permissions.view ? "Allowed" : "Blocked"}
                            </span>

                            <span className="flex items-center gap-1">
                              <DownloadCloud className="h-2.5 w-2.5" />
                              Download:{" "}
                              {grant.permissions.download
                                ? "Allowed"
                                : "Blocked"}
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              Created {timeAgo(grant.createdAt)}
                            </span>
                          </div>
                        </div>

                        <TrustRing score={90} />

                        <button
                          onClick={() => handleRevokeGrant(grant._id)}
                          disabled={actionLoadingId === grant._id}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingId === grant._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Revoke
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {tab === "requests" && (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Pending Access Requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review who is asking to access your health records before
                    approving.
                  </p>
                </div>

                {pendingReqs?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Approval duration:
                    </span>

                    <select
                      value={requestApprovalDuration}
                      onChange={(event) =>
                        setRequestApprovalDuration(
                          event.target.value as ConsentDuration,
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="24h">24 hours</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>
                )}
              </div>

              {pendingReqs?.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                  <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
                  <div className="font-bold text-slate-800">
                    No pending requests
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Providers who request access will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReqs.map((request) => {
                    const name = getGrantName(request);
                    const initials = getInitials(name);
                    const isLoading = requestActionId === request._id;

                    return (
                      <div
                        key={request._id}
                        className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 text-sm font-black text-white">
                            {initials || "RQ"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-amber-950">
                                {name}
                              </h3>

                              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                Pending
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-amber-800">
                              Requested{" "}
                              <span className="font-bold">
                                {request.accessScope === "full-record"
                                  ? "Full History"
                                  : request.accessScope === "category"
                                    ? request.category || "Category"
                                    : request.accessScope}
                              </span>{" "}
                              access.
                            </p>

                            {request.purpose && (
                              <p className="mt-2 rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-amber-800">
                                <span className="font-bold">Purpose:</span>{" "}
                                {request.purpose}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-amber-700/70">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Requested {timeAgo(request.createdAt)}
                              </span>

                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                View permission requested
                              </span>

                              {request.permissions.download && (
                                <span className="flex items-center gap-1">
                                  <DownloadCloud className="h-3 w-3" />
                                  Download requested
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 border-t border-amber-200 pt-4 sm:flex-row sm:justify-end">
                          <button
                            onClick={() => handleDenyRequest(request._id)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Reject
                          </button>

                          <button
                            onClick={() => handleApproveRequest(request._id)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                            Approve for {requestApprovalDuration}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === "audit" && (
            <>
              <h2 className="mb-4 text-lg font-bold text-slate-950">
                Access Audit Log
              </h2>

              <div className="space-y-3">
                {audit?.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                    <Activity className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                    <div className="font-bold text-slate-800">
                      No audit activity yet
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Provider access events will appear here.
                    </p>
                  </div>
                ) : (
                  audit?.map((entry) => {
                    const hour = new Date(entry.createdAt).getHours();
                    const flagged = hour < 6 || hour > 22;

                    return (
                      <div
                        key={entry._id}
                        className={`flex items-start gap-4 rounded-xl border bg-white p-4 ${
                          flagged ? "border-orange-300" : "border-slate-200"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            flagged
                              ? "bg-orange-100 text-orange-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {flagged ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-950">
                            {entry.accessedBy?.fullName || "A provider"}{" "}
                            <span className="font-normal text-slate-500">
                              performed {entry.action} on {entry.category}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {new Date(entry.createdAt).toLocaleString()} ·{" "}
                            {entry.organizationId &&
                            typeof entry.organizationId === "object"
                              ? entry.organizationId.organizationName
                              : "No organization"}
                          </div>
                        </div>

                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                          {entry._id.slice(-8)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {tab === "export" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-xl font-bold text-slate-950">
                Cross-Border Ready Data
              </h2>

              <p className="mb-6 text-sm text-slate-600">
                Export your health record securely. For MVP, support PDF and
                JSON. Add FHIR later when your schema is mature enough.
              </p>

              <div className="mb-6 space-y-3">
                {[
                  {
                    id: "fhir",
                    label: "FHIR Format JSON",
                    desc: "Structured data for interoperable systems",
                    icon: FileJson,
                  },
                  {
                    id: "pdf",
                    label: "PDF Health Summary",
                    desc: "Readable clinical summary for doctors",
                    icon: FileText,
                  },
                ].map((format) => {
                  const Icon = format.icon;

                  return (
                    <label
                      key={format.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === format.id}
                        onChange={() =>
                          setExportFormat(format.id as "fhir" | "pdf")
                        }
                        className="accent-emerald-600"
                      />

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {format.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format.desc}
                        </div>
                      </div>

                      <Icon className="h-5 w-5 text-slate-400" />
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4" />
                    Generate Export Bundle
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <Activity className="h-5 w-5 text-emerald-700" />
              Access Statistics
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                30D
              </span>
            </h3>

            <div className="space-y-4">
              {[
                {
                  value: recordsViewed30d,
                  label: "Access Events",
                  className: "text-slate-950",
                },
                {
                  value: activeGrants?.length,
                  label: "Active Grants",
                  className: "text-emerald-700",
                },
                {
                  value: pendingReqs?.length,
                  label: "Pending Requests",
                  className: "text-amber-600",
                },
                {
                  value: flaggedCount,
                  label: "Flagged Events",
                  className:
                    flaggedCount > 0 ? "text-red-500" : "text-slate-500",
                },
              ].map((stat, index) => (
                <React.Fragment key={stat.label}>
                  {index > 0 && <div className="h-px w-full bg-slate-100" />}
                  <div>
                    <div className={`text-3xl font-black ${stat.className}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-950">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              Consent Rules
            </h3>

            <p className="mb-4 text-xs text-slate-400">
              Keep this simple for MVP. Do not overbuild AI risk scoring before
              your audit logs are reliable.
            </p>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="font-bold text-slate-900">Full History</div>
                <p className="mt-1 text-xs text-slate-500">
                  Use only for trusted providers and short duration.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="font-bold text-slate-900">Category Access</div>
                <p className="mt-1 text-xs text-slate-500">
                  Best for labs, pharmacies, diagnostics, and payers.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="font-bold text-slate-900">Encounter Access</div>
                <p className="mt-1 text-xs text-slate-500">
                  Best for sharing one visit without exposing the full history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg h-[90vh] animate-in fade-in slide-in-from-bottom-4 rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-950">
                Smart Consent Controls
              </h3>

              <button
                onClick={() => setShowNew(false)}
                className="rounded-full p-1 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              <Link className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Grant access to a provider or organization.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Grantee Type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {(["provider", "organization"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setGranteeType(type)}
                      className={`rounded-lg border p-2 text-left text-xs font-bold capitalize transition ${
                        granteeType === type
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {GRANTEE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  {granteeType === "provider"
                    ? "Provider User ID"
                    : "Organization ID"}
                </label>

                <input
                  value={granteeId}
                  onChange={(event) => setGranteeId(event.target.value)}
                  placeholder={
                    granteeType === "provider"
                      ? "Enter provider user ID"
                      : "Enter organization ID"
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Access Scope
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {SCOPE_OPTIONS.map((scope) => {
                    const active =
                      newScope === scope.value &&
                      (scope.value !== "category" ||
                        newCategory === scope.category);

                    return (
                      <button
                        key={`${scope.value}-${scope.category || "all"}`}
                        onClick={() => {
                          setNewScope(scope.value);
                          setNewCategory(scope.category || null);
                        }}
                        className={`rounded-lg border p-2 text-left text-xs font-bold transition ${
                          active
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {scope.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Auto-Expire Duration
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {DURATION_OPTIONS.map((duration) => (
  <button
    key={duration.value}
    onClick={() => setNewDuration(duration.value)}
    className={`relative rounded-lg border p-2 text-xs font-bold transition ${
      newDuration === duration.value
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
    }`}
  >
    {duration.label}

    {duration.aiNote && (
      <span className="absolute -right-2 -top-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] text-white shadow">
        {duration.aiNote}
      </span>
    )}
  </button>
))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Purpose
                </label>

                <textarea
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="Example: Second opinion, emergency treatment, lab review..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <button
                onClick={handleCreateGrant}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
