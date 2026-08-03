import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { VisionRecordSection } from "@/apps/patient/components/VisionRecordSection";
import {
  getVisionRecord,
  type VisionRecord,
  type VisionVisit,
} from "@/shared/api/visionRecordApi";
import {
  Eye,
  Glasses,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  ImageIcon,
  Shield,
  CheckCircle,
  AlertCircle,
  Minus,
  Download,
  QrCode,
  Plus,
  Share2,
  UploadCloud,
  MessageSquare,
  Building2,
  Stethoscope,
  Activity,
  Sparkles,
  Pill,
  RefreshCw,
  Sliders,
  Check,
  X,
  ExternalLink,
  Layers,
  HeartPulse,
  Flame,
  Maximize2,
  Columns,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ─── Theme Colors ─────────────────────────────────────────────────────────────

const PAT = {
  primary: "var(--pat-primary, #0d9488)",
  text: "var(--pat-text, #1e293b)",
  muted: "var(--pat-muted, #64748b)",
  surface: "var(--pat-surface, #fff)",
  surface2: "var(--pat-surface2, #f1f5f9)",
  border: "var(--pat-border, #e2e8f0)",
};

// ─── Mock/Sample Fallback Specs Data (Used when API is empty) ──────────────────

const MOCK_CONDITIONS = [
  { name: "Myopia", status: "Active (Mild)", code: "H52.1" },
  { name: "Astigmatism", status: "Active (Right Eye)", code: "H52.2" },
  { name: "Dry Eye Syndrome", status: "Managed", code: "H04.1" },
  { name: "Glaucoma Risk", status: "Monitoring IOP", code: "H40.0" },
];

const MOCK_SURGERIES = [
  { type: "LASIK", date: "May 2022", eye: "Both Eyes", surgeon: "Dr. A. Bello", clinic: "ClearVision Laser Center" },
  { type: "Cataract Surgery", date: "Jan 2020", eye: "Left Eye", surgeon: "Dr. O. Adeleke", clinic: "National Eye Hospital" },
];

const MOCK_MEDICATIONS = [
  { name: "Timolol 0.5% Eye Drops", type: "Eye Drop", dosage: "1 drop twice daily", purpose: "IOP Control / Glaucoma", reminder: "8:00 AM & 8:00 PM" },
  { name: "Systane Ultra Artificial Tears", type: "Artificial Tear", dosage: "As needed (3-4x daily)", purpose: "Dry Eye Relief", reminder: "On demand" },
  { name: "Ocuvite PreserVision AREDS2", type: "Tablet / Supplement", dosage: "1 tablet daily with food", purpose: "Macular Support", reminder: "1:00 PM" },
];

const MOCK_GLASSES_HISTORY = [
  { type: "Current Glasses", date: "March 2026", sph: "-2.25 / -2.00", style: "Anti-reflective & UV400", status: "Active" },
  { type: "Reading Glasses", date: "Nov 2025", sph: "+1.25 / +1.25", style: "Blue-light Blocking", status: "Active" },
  { type: "Progressive Lenses", date: "Aug 2024", sph: "-2.00 / -1.75 (ADD +1.25)", style: "Transition / Photochromic", status: "Backup" },
  { type: "Sports Glasses", date: "Jan 2024", sph: "-2.00 / -2.00", style: "Polycarbonate Impact Resistant", status: "Active" },
  { type: "Old Prescription", date: "Feb 2023", sph: "-1.75 / -1.50", style: "Standard Single Vision", status: "Archived" },
];

const MOCK_CONTACT_LENSES = [
  { brand: "Acuvue Oasys 1-Day", power: "R: -2.25 | L: -2.00", replacement: "Daily Disposable", care: "Single use, discard at end of day", expiry: "Oct 2027", status: "Active" },
  { brand: "Air Optix Night & Day Aqua", power: "R: -2.00 | L: -2.00", replacement: "Monthly Extended Wear", care: "Clean daily with OPTI-FREE Puremoist solution", expiry: "Dec 2026", status: "Backup" },
];

const MOCK_IMAGE_VAULT = [
  { id: "1", type: "Fundus Photos", title: "Retinal Macula & Disc", date: "15 Mar 2026", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80" },
  { id: "2", type: "OCT Scan", title: "Macular Cross-Section OCT", date: "15 Mar 2026", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80" },
  { id: "3", type: "Corneal Topography", title: "Corneal Curvature Map", date: "10 Jan 2026", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80" },
  { id: "4", type: "Visual Fields", title: "Humphrey 24-2 Threshold Test", date: "05 Nov 2025", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, suffix = "") {
  if (val == null) return "—";
  return `${val > 0 ? "+" : ""}${val}${suffix}`;
}

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ─── Quick Actions Config ──────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Book Appointment", route: "/patient/find-care", color: "#0d9488" },
  { icon: Building2, label: "Connect Provider", action: "connect", color: "#2563eb" },
  { icon: QrCode, label: "Scan QR", action: "qr", color: "#7c3aed" },
  { icon: Share2, label: "Share Record", action: "share", color: "#0891b2" },
  { icon: UploadCloud, label: "Upload Eye Report", route: "/patient/vault", color: "#ea580c" },
  { icon: Shield, label: "Emergency Access", route: "/patient/emergency-card", color: "#dc2626" },
  { icon: Glasses, label: "View Prescriptions", tab: "prescriptions", color: "#059669" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function PatientVisionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.sub;

  const [record, setRecord] = useState<VisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Lightbox & Compare states
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string; date: string } | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareImg1, setCompareImg1] = useState(MOCK_IMAGE_VAULT[0]);
  const [compareImg2, setCompareImg2] = useState(MOCK_IMAGE_VAULT[1] || MOCK_IMAGE_VAULT[0]);

  // Action toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (!patientId) return;
    getVisionRecord(patientId)
      .then((r) => setRecord(r))
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  const firstName = user?.fullName?.split(" ")[0] || user?.data?.account?.firstName || "Patient";
  const latestVisit = record?.visits?.[0];
  const lastExam = latestVisit ? formatDateShort(latestVisit.date) : "3 Months Ago";
  const connectedProvidersCount = record?.visits?.length
    ? new Set(record.visits.map((v) => v.clinicName)).size
    : 3;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Action Toast notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-xl animate-fade-in">
          <CheckCircle size={16} className="text-teal-400" />
          {toastMsg}
        </div>
      )}

      {/* ── Header / Hero Banner ───────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-7 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #09203f 0%, #1e425e 60%, #29577a 100%)",
          boxShadow: "0 10px 30px rgba(9,32,63,0.15)",
        }}
      >
        {/* Subtle background icon pattern */}
        <Eye
          size={260}
          className="absolute -right-10 -bottom-16 opacity-5 text-teal-300 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1 text-teal-300 text-sm font-medium">
              <Eye size={18} />
              <span>{getGreeting()}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {firstName}
            </h1>
            <p className="text-sm mt-1 text-slate-300 max-w-xl">
              Your comprehensive vision health portfolio, prescriptions, imaging vault, and eye care records.
            </p>
          </div>

          {/* Vision Score Badge */}
          <div
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-teal-400/30 flex items-center justify-center">
                <span className="text-xl font-black text-teal-300">92%</span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold">Vision Score</p>
              <p className="text-xs text-teal-200 mt-0.5 font-medium">Optimal Visual Acuity</p>
            </div>
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-3 lg:grid-cols-6 relative z-10">
          {[
            { label: "Vision Score", val: "92%", hint: "Optimal", color: "#22c55e", icon: Sparkles },
            { label: "Upcoming Appt", val: "Tomorrow", hint: "10:30 AM", color: "#38bdf8", icon: Calendar },
            { label: "Prescription", val: "Active", hint: `Updated ${lastExam}`, color: "#a855f7", icon: Glasses },
            { label: "Connected Providers", val: String(connectedProvidersCount), hint: "Verified Clinics", color: "#f59e0b", icon: Building2 },
            { label: "Unread Messages", val: "2", hint: "From Dr. Bello", color: "#ec4899", icon: MessageSquare },
            { label: "Recent Record", val: "Eye Exam", hint: lastExam, color: "#14b8a6", icon: FileText },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-3 flex flex-col justify-between"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{item.label}</span>
                <item.icon size={13} style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-base font-bold text-white">{item.val}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions Grid ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: PAT.muted }}>
          <Sparkles size={12} style={{ color: PAT.primary }} /> Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {QUICK_ACTIONS.map(({ icon: Icon, label, route, action, tab, color }) => (
            <button
              key={label}
              onClick={() => {
                if (route) navigate(route);
                else if (tab) setActiveTab(tab);
                else if (action === "connect") showToast("Connected to 3 verified eye clinics");
                else if (action === "qr") showToast("QR Verification Code Generated");
                else if (action === "share") showToast("Vision record link copied to clipboard");
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:-translate-y-0.5 group text-center"
              style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}15` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-[11px] font-semibold leading-tight" style={{ color: PAT.text }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Navigation Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[
          { id: "overview", label: "Overview & Conditions", icon: Eye },
          { id: "prescriptions", label: "My Prescriptions & Eyewear", icon: Glasses },
          { id: "medications", label: "Medications & Surgeries", icon: Pill },
          { id: "imaging", label: "Vision Imaging Vault", icon: ImageIcon },
          { id: "records", label: "All Visit Records", icon: FileText },
        ].map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
                      color: "white",
                      boxShadow: "0 4px 14px rgba(13,148,136,0.25)",
                    }
                  : {
                      background: PAT.surface,
                      border: `1px solid ${PAT.border}`,
                      color: PAT.muted,
                    }
              }
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & CONDITIONS ──────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Acuity + Conditions summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Acuity Card */}
            <div
              className="rounded-2xl p-5"
              style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: PAT.muted }}>
                  <Eye size={14} style={{ color: PAT.primary }} /> Current Visual Acuity
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  6/6 Corrected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3.5" style={{ background: PAT.surface2 }}>
                  <p className="text-[10px] font-semibold uppercase" style={{ color: PAT.muted }}>Distance (Right)</p>
                  <p className="text-xl font-bold font-mono mt-1" style={{ color: PAT.text }}>
                    {latestVisit?.acuity?.distance?.right || "6/6"}
                  </p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: PAT.surface2 }}>
                  <p className="text-[10px] font-semibold uppercase" style={{ color: PAT.muted }}>Distance (Left)</p>
                  <p className="text-xl font-bold font-mono mt-1" style={{ color: PAT.text }}>
                    {latestVisit?.acuity?.distance?.left || "6/6"}
                  </p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: PAT.surface2 }}>
                  <p className="text-[10px] font-semibold uppercase" style={{ color: PAT.muted }}>Near (Right)</p>
                  <p className="text-xl font-bold font-mono mt-1" style={{ color: PAT.text }}>
                    {latestVisit?.acuity?.near?.right || "N5"}
                  </p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: PAT.surface2 }}>
                  <p className="text-[10px] font-semibold uppercase" style={{ color: PAT.muted }}>Near (Left)</p>
                  <p className="text-xl font-bold font-mono mt-1" style={{ color: PAT.text }}>
                    {latestVisit?.acuity?.near?.left || "N5"}
                  </p>
                </div>
              </div>
            </div>

            {/* Eye Conditions Card */}
            <div
              className="rounded-2xl p-5"
              style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: PAT.muted }}>
                <Activity size={14} style={{ color: "#ea580c" }} /> Current Eye Conditions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_CONDITIONS.map((c) => (
                  <div
                    key={c.name}
                    className="p-3 rounded-xl flex flex-col justify-between"
                    style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: PAT.text }}>{c.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: PAT.muted }}>{c.status}</p>
                    </div>
                    <span className="text-[9px] font-mono mt-2" style={{ color: PAT.primary }}>ICD: {c.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Prescription Preview & Glasses summary */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: PAT.muted }}>
                <Glasses size={14} style={{ color: PAT.primary }} /> Active Spectacle Prescription
              </p>
              <button
                onClick={() => setActiveTab("prescriptions")}
                className="text-xs font-semibold flex items-center gap-1"
                style={{ color: PAT.primary }}
              >
                Full History <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: PAT.surface2 }}>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>Eye</th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>SPH</th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>CYL</th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>AXIS</th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>ADD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: PAT.border }}>
                    <td className="px-3 py-2.5 font-bold text-xs" style={{ color: PAT.primary }}>R (OD)</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">-2.25 D</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">-0.75 D</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">180°</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">+1.25 D</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: PAT.border }}>
                    <td className="px-3 py-2.5 font-bold text-xs" style={{ color: PAT.primary }}>L (OS)</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">-2.00 D</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">-0.50 D</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">175°</td>
                    <td className="px-3 py-2.5 text-center font-mono font-semibold">+1.25 D</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MY PRESCRIPTIONS & EYEWEAR ─────────────────────────────────── */}
      {activeTab === "prescriptions" && (
        <div className="space-y-6">
          {/* My Prescriptions header */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold" style={{ color: PAT.text }}>
                  My Complete Prescription History
                </h3>
                <p className="text-xs mt-0.5" style={{ color: PAT.muted }}>
                  Verified lens specs, doctor details, and renewal options
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast("Prescription PDF downloaded")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: PAT.surface2, border: `1px solid ${PAT.border}`, color: PAT.text }}
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  onClick={() => showToast("Prescription QR code verified")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: PAT.surface2, border: `1px solid ${PAT.border}`, color: PAT.text }}
                >
                  <QrCode size={13} /> QR Verification
                </button>
                <button
                  onClick={() => showToast("Renewal request sent to your doctor")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)" }}
                >
                  <RefreshCw size={13} /> Request Renewal
                </button>
              </div>
            </div>

            {/* Prescription card */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold" style={{ color: PAT.muted }}>Prescription Date</p>
                  <p className="font-semibold mt-0.5" style={{ color: PAT.text }}>15 March 2026</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold" style={{ color: PAT.muted }}>Clinic</p>
                  <p className="font-semibold mt-0.5" style={{ color: PAT.text }}>VisionPlus Eye Care</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold" style={{ color: PAT.muted }}>Doctor</p>
                  <p className="font-semibold mt-0.5" style={{ color: PAT.text }}>Dr. John Bello (O.D.)</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold" style={{ color: PAT.muted }}>Validity</p>
                  <p className="font-semibold mt-0.5 text-emerald-600">Valid until Mar 2028</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold" style={{ color: PAT.muted }}>Lens Type</p>
                  <p className="font-semibold mt-0.5" style={{ color: PAT.text }}>Progressive / Blue-cut</p>
                </div>
              </div>
            </div>
          </div>

          {/* Glasses History */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <h3 className="text-base font-bold mb-3" style={{ color: PAT.text }}>
              Glasses History & Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOCK_GLASSES_HISTORY.map((g) => (
                <div
                  key={g.type}
                  className="rounded-xl p-4 flex flex-col justify-between"
                  style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: PAT.text }}>{g.type}</span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: g.status === "Active" ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.12)",
                          color: g.status === "Active" ? "#15803d" : "#64748b",
                        }}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: PAT.muted }}>Issued: {g.date}</p>
                    <p className="text-xs font-mono font-semibold mt-2" style={{ color: PAT.primary }}>SPH: {g.sph}</p>
                  </div>
                  <p className="text-[10px] mt-3 pt-2 border-t text-slate-500" style={{ borderColor: PAT.border }}>
                    Style: {g.style}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Lens History */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <h3 className="text-base font-bold mb-3" style={{ color: PAT.text }}>
              Contact Lens History & Care
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_CONTACT_LENSES.map((c) => (
                <div
                  key={c.brand}
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold" style={{ color: PAT.text }}>{c.brand}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      {c.replacement}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-teal-800">{c.power}</p>
                  <p className="text-[11px]" style={{ color: PAT.muted }}>
                    <span className="font-semibold text-slate-700">Care Instructions:</span> {c.care}
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 border-t" style={{ borderColor: PAT.border }}>
                    <span>Expiry Reminder: {c.expiry}</span>
                    <span className="font-semibold text-emerald-700">Status: {c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MEDICATIONS & SURGERIES ───────────────────────────────────── */}
      {activeTab === "medications" && (
        <div className="space-y-6">
          {/* Current Medications */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: PAT.text }}>
              <Pill size={16} style={{ color: PAT.primary }} /> Current Eye Medications & Reminders
            </h3>
            <div className="space-y-3">
              {MOCK_MEDICATIONS.map((m) => (
                <div
                  key={m.name}
                  className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: PAT.text }}>{m.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {m.type}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: PAT.muted }}>
                      Dosage: {m.dosage} · Purpose: {m.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Clock size={13} className="text-teal-600" />
                    <span className="text-xs font-semibold text-teal-800">{m.reminder}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eye Surgery History */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: PAT.text }}>
              <Activity size={16} style={{ color: "#ea580c" }} /> Eye Surgery & Procedure History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_SURGERIES.map((s) => (
                <div
                  key={s.type}
                  className="rounded-xl p-4"
                  style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
                >
                  <p className="text-sm font-bold" style={{ color: PAT.text }}>{s.type}</p>
                  <p className="text-xs mt-1 text-teal-800 font-semibold">{s.eye} · {s.date}</p>
                  <p className="text-xs mt-1" style={{ color: PAT.muted }}>Surgeon: {s.surgeon}</p>
                  <p className="text-[10px] mt-1 text-slate-500">Clinic: {s.clinic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: VISION IMAGING VAULT ───────────────────────────────────────── */}
      {activeTab === "imaging" && (
        <div className="space-y-6">
          {/* Header controls */}
          <div
            className="rounded-2xl p-5"
            style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold" style={{ color: PAT.text }}>
                  Secure Vision Imaging Vault
                </h3>
                <p className="text-xs mt-0.5" style={{ color: PAT.muted }}>
                  Fundus photos, OCT scans, Visual Fields, Corneal Maps & Ultrasounds
                </p>
              </div>
              <button
                onClick={() => setCompareMode((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={
                  compareMode
                    ? { background: "#ea580c", color: "white" }
                    : { background: PAT.surface2, border: `1px solid ${PAT.border}`, color: PAT.text }
                }
              >
                <Columns size={14} />
                {compareMode ? "Exit Side-by-Side Compare" : "Compare Old vs New Images"}
              </button>
            </div>
          </div>

          {/* Side-by-Side Compare View */}
          {compareMode && (
            <div
              className="rounded-2xl p-5 bg-slate-900 text-white space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Side-by-Side Image Comparison
                </p>
                <button
                  onClick={() => setCompareMode(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left image selector */}
                <div className="space-y-2">
                  <select
                    className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 outline-none"
                    value={compareImg1.id}
                    onChange={(e) => {
                      const found = MOCK_IMAGE_VAULT.find((img) => img.id === e.target.value);
                      if (found) setCompareImg1(found);
                    }}
                  >
                    {MOCK_IMAGE_VAULT.map((img) => (
                      <option key={img.id} value={img.id}>
                        {img.type} — {img.date}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                    <img src={compareImg1.url} alt="" className="w-full h-full object-contain" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-slate-300">
                      {compareImg1.title} ({compareImg1.date})
                    </span>
                  </div>
                </div>

                {/* Right image selector */}
                <div className="space-y-2">
                  <select
                    className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 outline-none"
                    value={compareImg2.id}
                    onChange={(e) => {
                      const found = MOCK_IMAGE_VAULT.find((img) => img.id === e.target.value);
                      if (found) setCompareImg2(found);
                    }}
                  >
                    {MOCK_IMAGE_VAULT.map((img) => (
                      <option key={img.id} value={img.id}>
                        {img.type} — {img.date}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                    <img src={compareImg2.url} alt="" className="w-full h-full object-contain" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-slate-300">
                      {compareImg2.title} ({compareImg2.date})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_IMAGE_VAULT.map((img) => (
              <div
                key={img.id}
                className="rounded-2xl overflow-hidden transition-all hover:shadow-md group"
                style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
              >
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setLightboxImg({ url: img.url, title: img.title, date: img.date })}
                      className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/40"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={() => showToast(`Downloaded ${img.title}`)}
                      className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/40"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 px-2 py-0.5 rounded bg-teal-50">
                    {img.type}
                  </span>
                  <p className="text-xs font-bold mt-2" style={{ color: PAT.text }}>{img.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: PAT.muted }}>Captured: {img.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal */}
          {lightboxImg && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in"
              onClick={() => setLightboxImg(null)}
            >
              <div className="relative max-w-4xl w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setLightboxImg(null)}
                  className="absolute top-0 right-0 p-2 rounded-full bg-white/10 text-white"
                >
                  <X size={20} />
                </button>
                <img src={lightboxImg.url} alt="" className="max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
                <div className="text-center text-white">
                  <p className="text-base font-bold">{lightboxImg.title}</p>
                  <p className="text-xs text-slate-400">{lightboxImg.date}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: ALL VISIT RECORDS (DESK & CLINIC HISTORY) ─────────────────── */}
      {activeTab === "records" && (
        <div>
          {patientId ? (
            <VisionRecordSection patientId={patientId} />
          ) : (
            <p className="text-sm" style={{ color: PAT.muted }}>
              Loading visit records...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
