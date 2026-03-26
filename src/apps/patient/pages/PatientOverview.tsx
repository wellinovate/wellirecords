import { dependantApi } from "@/shared/api/dependantApi";
import { patientDashboardApi } from "@/shared/api/patientDashboardApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { ConsentGrant, TimelineRecord, VitalRecord } from "@/shared/types/types";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Beaker,
  BrainCircuit,
  Camera,
  ChevronRight,
  Clock,
  Dna,
  Droplets,
  FileText,
  FolderHeart,
  Heart,
  Pill,
  QrCode,
  Shield,
  Sparkles,
  Stethoscope,
  Syringe,
  TrendingUp,
  TriangleAlert,
  UploadCloud,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── tiny inline SVG sparkline ───────────────────────────────────────────── */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 80,
    h = 28,
    pad = 3;
  const min = Math.min(...points),
    max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map(
    (_, i) => pad + (i / (points.length - 1)) * (w - pad * 2),
  );
  const ys = points.map((v) => h - pad - ((v - min) / range) * (h - pad * 2));
  const d = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  const fill = `${d} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className="overflow-visible"
    >
      <path d={fill} fill={color} opacity="0.1" />
      <path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── record-type icon + label ─────────────────────────────────────────────── */
function RecordTypeChip({ type }: { type: string }) {
  const map: Record<
    string,
    { icon: React.ElementType; color: string; bg: string }
  > = {
    "Lab Result": { icon: Beaker, color: "#3b82f6", bg: "rgba(59,130,246,.1)" },
    Prescription: { icon: Pill, color: "#8b5cf6", bg: "rgba(139,92,246,.1)" },
    Imaging: { icon: Camera, color: "#06b6d4", bg: "rgba(6,182,212,.1)" },
    "Clinical Note": {
      icon: Stethoscope,
      color: "#10b981",
      bg: "rgba(16,185,129,.1)",
    },
    Vaccination: { icon: Syringe, color: "#f59e0b", bg: "rgba(245,158,11,.1)" },
    "Chronic Condition": {
      icon: Activity,
      color: "#ef4444",
      bg: "rgba(239,68,68,.1)",
    },
    Allergy: {
      icon: AlertTriangle,
      color: "#ef4444",
      bg: "rgba(239,68,68,.1)",
    },
  };
  const {
    icon: Icon,
    color,
    bg,
  } = map[type] ?? {
    icon: FileText,
    color: "#6b7280",
    bg: "rgba(107,114,128,.1)",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ color, background: bg }}
    >
      <Icon size={10} /> {type}
    </span>
  );
}

/* ── health status chip ───────────────────────────────────────────────────── */
function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
      style={{ color, background: `${color}18` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

/* ── Family Health Snapshot ──────────────────────────────────────────────── */
function FamilyHealthSnapshot({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate: (path: string) => void;
}) {
  const children = dependantApi.getChildrenByParent(userId);
  if (children.length === 0) return null;

  return (
    <div className="card-patient p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-bold text-sm flex items-center gap-2"
          style={{ color: "var(--pat-text)" }}
        >
          <Users size={15} style={{ color: "var(--pat-primary)" }} />
          Family Health Snapshot
        </h2>
        <button
          onClick={() => onNavigate("/patient/dependants")}
          className="text-xs font-bold flex items-center gap-0.5 transition-opacity hover:opacity-70"
          style={{ color: "var(--pat-primary)" }}
        >
          View All <ChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children.map((child) => {
          const ageYears =
            new Date().getFullYear() -
            new Date(child.profile.dateOfBirth).getFullYear();
          const vacPending = child.vaccinations.filter(
            (v) => v.status === "Pending",
          ).length;
          const hasAlerts =
            child.medicalHistory.allergies.length > 0 ||
            child.medicalHistory.chronicConditions.length > 0;
          const isASCarrier =
            child.profile.genotype === "AS" || child.profile.genotype === "SS";

          // Mirror the exact same accent-color logic as DependantsListPage
          const accentColor = hasAlerts
            ? "#ef4444"
            : vacPending > 0
              ? "#f59e0b"
              : "#10b981";
          const accentBg = hasAlerts
            ? "rgba(239,68,68,0.06)"
            : vacPending > 0
              ? "rgba(245,158,11,0.06)"
              : "rgba(16,185,129,0.06)";
          const statusLabel = hasAlerts
            ? "Alert"
            : vacPending > 0
              ? `${vacPending} Vaccine${vacPending > 1 ? "s" : ""} Due`
              : "All Clear";

          return (
            <button
              key={child.id}
              onClick={() => onNavigate(`/patient/dependants/${child.id}`)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md border-l-4"
              style={{
                background: accentBg,
                borderLeftColor: accentColor,
                border: `1px solid ${accentColor}30`,
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              {/* Avatar */}
              <img
                src={child.profile.avatar}
                alt={child.profile.fullName}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border"
                style={{ borderColor: "var(--pat-border)" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(child.profile.fullName)}&background=1a6b42&color=fff&size=80&rounded=true`;
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-sm truncate"
                  style={{ color: "var(--pat-text)" }}
                >
                  {child.profile.fullName}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--pat-muted)" }}
                >
                  {ageYears} yrs old
                </div>
              </div>

              {/* Alert badges */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  {statusLabel}
                </span>
                {isASCarrier && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(245,158,11,0.15)",
                      color: "#92400e",
                    }}
                  >
                    <TriangleAlert size={9} /> AS Carrier
                  </span>
                )}
                {child.profile.genotype === "AA" && !isASCarrier && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      color: "#047857",
                    }}
                  >
                    <Dna size={9} /> AA
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── AI Health Brief ──────────────────────────────────────────────────────── */
function AIHealthBrief() {
  const lines = [
    "Your vitals look stable today — heart rate and O₂ saturation are within optimal ranges.",
    "Blood pressure is excellent at 118/78 mmHg. Continue your Lisinopril schedule as prescribed.",
    "Your next appointment is in 5 days. Consider logging today's symptoms if you have any.",
  ];
  return (
    <div
      className="card-patient p-5 mb-6 relative overflow-hidden"
      style={{ border: "1.5px solid rgba(4,30,66,0.12)" }}
    >
      {/* Subtle glow blob */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "var(--pat-primary)" }}
      />

      <div className="flex items-start gap-3 relative z-10">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(4,30,66,0.08)" }}
        >
          <Sparkles size={17} style={{ color: "var(--pat-primary)" }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--pat-primary)" }}
            >
              AI Health Brief
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}
            >
              WelliMate
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--pat-text)" }}
          >
            {lines.join(" ")}
          </p>
          <div
            className="mt-3 text-[10px] font-medium flex items-center gap-1.5"
            style={{ color: "var(--pat-muted)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Generated from your latest vitals · Updated just now
          </div>
        </div>
      </div>
    </div>
  );
}

export function PatientOverview() {
  const { user } = useAuth();
  // console.log("🚀 ~ PatientOverview ~ user:", user?.data?.account?._id)
  const navigate = useNavigate();
  const [records, setRecords] = useState<TimelineRecord[]>([]);
  const [grants, setGrants] = useState<ConsentGrant[]>([]);
  const [vitalRecords, setVitalRecords] = useState<VitalRecord[]>([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const patientId = user?.data?.account?._id;
  console.log("🚀 ~ PatientOverview ~ patientId:", patientId);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const [recordsRes, grantsRes] = await Promise.all([
          patientDashboardApi.getRecords(patientId, { page: 1, limit: 10 }),
          //   patientDashboardApi.getGrants(patientId),
          //   patientDashboardApi.getRequests(patientId),
          patientDashboardApi.getVitals(patientId, { page: 1, limit: 10 }),
        ]);
        console.log("🚀 ~ fetchDashboardData ~ recordsRes:", recordsRes);

        // if (!isMounted) return;

        setRecords(recordsRes?.items || recordsRes?.data || []);
        setGrants(
          (grantsRes?.data || grantsRes || []).filter(
            (g) => g.status === "active",
          ),
        );
        // setRequests(requestsRes?.data || requestsRes || []);
        // setVitalRecords(vitalsRes?.items || vitalsRes?.data || []);
      } catch (err) {
        const error: Error = err;
        // if (!isMounted) return;
        setError(error.message || "Failed to load dashboard data");
      } finally {
        // if (isMounted)
        setLoading(false);
      }
    };

    // fetchDashboardData();

    // return () => {
    //   isMounted = false;
    // };
  }, [patientId]);

  // const records = vaultApi.getRecords(user?.userId ?? '');
  // const grants = consentApi.getGrants(user?.userId ?? '').filter(g => g.status === 'active');
  // const requests = consentApi.getRequests(user?.userId ?? '');

  /* vitals — neutral border; color lives in icon + sparkline only */
  const vitals = [
    {
      label: "Heart Rate",
      value: "72",
      unit: "BPM",
      icon: Heart,
      metricColor: "#ef4444",
      spark: [68, 74, 71, 76, 70, 72, 72],
      status: "Normal",
      statusColor: "#10b981",
      subtext: "60–100 BPM is healthy",
    },
    {
      label: "Blood Pressure",
      value: "118/78",
      unit: "mmHg",
      icon: Activity,
      metricColor: "#3b82f6",
      spark: [115, 122, 119, 125, 117, 120, 118],
      status: "Optimal",
      statusColor: "#10b981",
      subtext: "Below 120/80 is ideal",
    },
    {
      label: "O₂ Saturation",
      value: "98",
      unit: "%",
      icon: Droplets,
      metricColor: "#06b6d4",
      spark: [97, 98, 97, 99, 98, 98, 98],
      status: "Normal",
      statusColor: "#10b981",
      subtext: "95–100% is healthy",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="section-header font-display mb-1 text-[28px]"
            style={{ color: "var(--pat-text)" }}
          >
            Welcome to your Dashboard{" "}
            {user ?`, ${user?.fullName}` : ""}!
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
            <span className="hidden sm:inline">Health Vault</span>
            <span className="sm:hidden">Vault</span>
          </button>
        </div>
      </div>

      {/* ── Pending consent alert ── */}
      {requests.length > 0 && (
        <div
          className="mb-6 p-4 rounded-2xl flex items-start gap-3 animate-fade-in-up"
          style={{
            background: "rgba(200,121,65,.08)",
            border: "1.5px solid rgba(200,121,65,.25)",
          }}
        >
          <AlertCircle
            size={20}
            style={{ color: "#c87941", flexShrink: 0, marginTop: 2 }}
          />
          <div className="flex-1">
            <div
              className="font-semibold text-sm"
              style={{ color: "var(--pat-text)" }}
            >
              {requests.length} pending consent request
              {requests.length > 1 ? "s" : ""}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--pat-muted)" }}
            >
              Providers are requesting access to your health records.
            </div>
          </div>
          <button
            onClick={() => navigate("/patient/consents")}
            className="btn btn-patient btn-sm flex-shrink-0"
          >
            Review <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Vital Stats — neutral top border, color in icon + sparkline only ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {records?.map((v) => (
          <div
            key={v.label}
            className="card-patient p-5 relative overflow-hidden"
          >
            {/* Neutral top border — NOT metric-colored so "red" doesn't imply alert */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[var(--radius-lg)]"
              style={{ background: "var(--pat-border)" }}
            />

            <div className="flex items-start justify-between mb-3">
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "var(--pat-muted)" }}
                >
                  {v.label}
                </div>
                <div
                  className="text-3xl font-black font-display leading-none"
                  style={{ color: "var(--pat-text)" }}
                >
                  {v.value}
                </div>
                <div
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: "var(--pat-muted)" }}
                >
                  {v.unit}
                </div>
              </div>
              {/* Icon retains full metric color */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${v.metricColor}15` }}
              >
                <v.icon size={18} style={{ color: v.metricColor }} />
              </div>
            </div>

            {/* Sparkline retains metric color */}
            <div className="mb-2">
              <Sparkline points={v.spark} color={v.metricColor} />
            </div>

            <div className="flex items-center justify-between">
              <StatusChip label={v.status} color={v.statusColor} />
              <span
                className="text-[10px]"
                style={{ color: "var(--pat-muted)" }}
              >
                {v.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Health Brief ── */}
      <AIHealthBrief />

      {/* ── Family Health Snapshot ── */}
      <FamilyHealthSnapshot
        userId={user?.userId ?? "pat_1"}
        onNavigate={navigate}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left 2/3: Smart Health Timeline ── */}
        <div className="lg:col-span-2 space-y-6">
          {records.length > 0 ? (
            <div className="card-patient p-6">
              <div
                className="flex items-center justify-between mb-6 border-b pb-4"
                style={{ borderColor: "var(--pat-border)" }}
              >
                <h2
                  className="font-bold text-base flex items-center gap-2"
                  style={{ color: "var(--pat-text)" }}
                >
                  <TrendingUp
                    size={16}
                    style={{ color: "var(--pat-primary)" }}
                  />
                  Smart Health Timeline
                </h2>
                <button
                  onClick={() => navigate("/patient/vault")}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: "var(--pat-primary)" }}
                >
                  View All →
                </button>
              </div>

              <div
                className="relative pl-4 space-y-5 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5"
                style={{ ["--tw-before-bg" as string]: "var(--pat-border)" }}
              >
                <style>{`.timeline-line::before { background: var(--pat-border); }`}</style>
                <div className="relative pl-6 space-y-5 timeline-line">
                  {records.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="relative">
                      <div
                        className="absolute left-[-1.6rem] top-1.5 w-3 h-3 rounded-full border-2"
                        style={{
                          background: "var(--pat-primary)",
                          borderColor: "var(--pat-surface)",
                        }}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <RecordTypeChip type={rec.type} />
                            <span
                              className={`badge text-[10px] ${rec.status === "Verified" ? "badge-active" : "badge-pending"}`}
                            >
                              {rec.status}
                            </span>
                          </div>
                          <div
                            className="font-bold text-sm"
                            style={{ color: "var(--pat-text)" }}
                          >
                            {rec.title}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "var(--pat-muted)" }}
                          >
                            {rec.provider}
                          </div>
                          <div
                            className="text-xs mt-1.5 leading-relaxed"
                            style={{ color: "var(--pat-muted)" }}
                          >
                            {rec.summary}
                          </div>
                        </div>
                        <div
                          className="text-xs font-semibold flex-shrink-0"
                          style={{ color: "var(--pat-muted)" }}
                        >
                          {new Date(rec.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Clean, Friendly White Block Empty State */
            <div
              className="rounded-2xl overflow-hidden shadow-sm border-2 border-dashed relative"
              style={{
                background: "var(--pat-surface)",
                borderColor: "var(--pat-border)",
              }}
            >
              <div
                className="p-14 flex flex-col items-center text-center relative z-10 border-b"
                style={{ borderColor: "var(--pat-border)" }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(4, 30, 66, 0.05)",
                    color: "var(--pat-primary)",
                  }}
                >
                  <FolderHeart size={48} />
                </div>
                <h3
                  className="font-display font-bold text-2xl mb-3 tracking-tight"
                  style={{ color: "var(--pat-text)" }}
                >
                  You don't have any health records yet
                </h3>
                <p
                  className="text-base mb-10 max-w-md leading-relaxed"
                  style={{ color: "var(--pat-muted)" }}
                >
                  It's easy to get started. Just upload a photo or PDF of your
                  latest lab results, a prescription, or a doctor's note.
                </p>
                <button
                  onClick={() => navigate("/patient/vault")}
                  className="flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-1 shadow-md hover:shadow-lg w-full sm:w-auto"
                  style={{ background: "var(--pat-primary)", color: "#ffffff" }}
                >
                  <UploadCloud size={20} />
                  Upload a Record Now
                </button>
              </div>

              {/* Drag-and-drop zone */}
              <div
                className="p-10 relative overflow-hidden z-10"
                style={{ background: "var(--pat-bg)" }}
              >
                <div className="flex flex-col items-center">
                  <p
                    className="font-bold text-sm text-center mb-4 max-w-sm"
                    style={{ color: "var(--pat-text)" }}
                  >
                    Or instantly auto-save a physical document:
                  </p>
                  <div
                    className="w-full max-w-lg border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white group"
                    style={{
                      borderColor: "var(--pat-border)",
                      background: "transparent",
                    }}
                  >
                    <BrainCircuit
                      size={32}
                      className="mx-auto mb-3 transition-transform group-hover:-translate-y-1"
                      style={{ color: "var(--pat-primary)" }}
                    />
                    <div
                      className="font-bold text-base mb-1"
                      style={{ color: "var(--pat-text)" }}
                    >
                      Drop a PDF or image here
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--pat-muted)" }}
                    >
                      or click to browse your files
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right 1/3: Sidebar widgets ── */}
        <div className="space-y-4">
          {/* Connected Devices */}
          <div className="card-patient p-6">
            <h2
              className="font-bold text-sm mb-4"
              style={{ color: "var(--pat-text)" }}
            >
              Connected Devices
            </h2>
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "var(--pat-surface)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,68,68,.1)" }}
              >
                <Heart size={18} style={{ color: "#ef4444" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-sm truncate mb-0.5"
                  style={{ color: "var(--pat-text)" }}
                >
                  Apple Watch Ultra
                </div>
                <div
                  className="text-xs flex items-center gap-1.5 font-medium"
                  style={{ color: "#10b981" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Syncing live
                </div>
              </div>
            </div>
          </div>

          {/* Who Has Access */}
          <div className="card-patient p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-bold text-sm"
                style={{ color: "var(--pat-text)" }}
              >
                Who Has Access
              </h2>
              <button
                onClick={() => navigate("/patient/consents")}
                className="text-xs font-bold transition-opacity hover:opacity-70"
                style={{ color: "var(--pat-primary)" }}
              >
                Manage →
              </button>
            </div>
            {grants.length === 0 ? (
              <div
                className="text-center py-6 rounded-2xl"
                style={{ background: "var(--pat-surface)" }}
              >
                <Shield
                  size={24}
                  className="mx-auto mb-3 opacity-40"
                  style={{ color: "var(--pat-text)" }}
                />
                <p
                  className="text-sm font-bold mb-1"
                  style={{ color: "var(--pat-text)" }}
                >
                  No active consents
                </p>
                <p
                  className="text-xs max-w-[200px] mx-auto"
                  style={{ color: "var(--pat-muted)" }}
                >
                  Your data hasn't been shared with anyone yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {grants.map((g) => (
                  <div
                    key={g.grantId}
                    className="p-4 rounded-2xl"
                    style={{ background: "var(--pat-surface)" }}
                  >
                    <div
                      className="font-bold text-sm mb-1"
                      style={{ color: "var(--pat-text)" }}
                    >
                      {g.orgName}
                    </div>
                    <div
                      className="text-xs mb-2"
                      style={{ color: "var(--pat-muted)" }}
                    >
                      {g.scope} · {g.purpose}
                    </div>
                    {g.expiresAt && (
                      <div
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: "#c87941" }}
                      >
                        <Clock size={12} /> Expires{" "}
                        {new Date(g.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate("/patient/emergency-card")}
              className="mt-4 w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{
                background: "var(--pat-surface)",
                color: "var(--pat-text)",
              }}
            >
              <QrCode size={16} /> View Emergency Card
            </button>
          </div>

          {/* AI Document Extraction — only when records exist */}
          {records.length > 0 && (
            <div className="card-patient p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--pat-primary)] rounded-full blur-[40px] opacity-10" />
              <h2
                className="font-bold text-sm flex items-center gap-2 mb-2"
                style={{ color: "var(--pat-text)" }}
              >
                <BrainCircuit
                  size={16}
                  style={{ color: "var(--pat-primary)" }}
                />{" "}
                AI Extraction
              </h2>
              <p
                className="text-xs mb-5 leading-relaxed"
                style={{ color: "var(--pat-muted)" }}
              >
                Drag PDFs here to auto-digitize historical records into your
                vault.
              </p>
              <div
                className="border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-[var(--pat-surface)]"
                style={{
                  borderColor: "var(--pat-border)",
                  background: "transparent",
                }}
              >
                <UploadCloud
                  size={24}
                  className="mx-auto mb-2 transition-transform group-hover:-translate-y-1"
                  style={{ color: "var(--pat-primary)" }}
                />
                <div
                  className="font-bold text-xs"
                  style={{ color: "var(--pat-text)" }}
                >
                  Drop PDF or click
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
