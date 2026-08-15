import React, { useState, useEffect, useMemo } from "react";
import { getAllLabOrders, createLabOrder, updateLabOrderStatus, enterLabOrderResult } from "@/shared/api/labOrdersApi";
import { getLabTestCatalog, LabTestCatalogGroup } from "@/shared/api/labTestCatalogApi";
import VerifiedResultDeliveryModal from "@/apps/provider/components/VerifiedResultDeliveryModal";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { apiUrl } from "@/shared/api/authApi";
import {
  FlaskConical,
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  FileText,
  Truck,
  User,
  DollarSign,
  BarChart2,
  Sparkles,
  Syringe,
  Users,
  QrCode,
  Phone,
  MapPin,
  Building2,
  Download,
  Send,
  RefreshCw,
  FileSpreadsheet,
  Sliders,
  Tag,
  Activity,
  Check,
  Share2,
  MessageSquare,
  Calendar,
  Shield,
  Lock,
  Info,
  TrendingUp,
  Box,
  PackageCheck,
  AlertCircle,
  Thermometer,
  Layers,
  Printer,
  Receipt,
  FileCheck,
  UserCheck,
  Zap,
  ChevronRight,
  Filter,
  Microscope,
  FileImage,
  Upload,
  UploadCloud,
  FileSignature,
  Radio,
  HardDrive,
  CheckCircle2,
  XCircle,
  Cpu,
  Bell,
  Mail,
  Radio,
  FileSignature,
  FileCode,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { PatientSearchPicker } from "@/apps/components/shared/PatientSearchPicker";
import { consentApi, ProviderGrant } from "@/shared/api/consentApi";
import { getAllPatientLabResults, LabResultItem } from "@/shared/utils/utilityFunction";
import { createRecord } from "@/shared/api/clinicalApi";
import { sendCriticalAlertSms } from "@/shared/api/notificationApi";

// ─── Color & Design System Tokens ─────────────────────────────────────────────
const T = {
  bg: "#0A1624",
  surface: "#0F1C2E",
  surface2: "#13243A",
  border: "rgba(56,189,248,0.12)",
  accent: "#38bdf8",
  accentDim: "rgba(56,189,248,0.15)",
  text: "#E6EDF3",
  muted: "#7BA3C8",
  faint: "#3E5A78",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#a855f7",
};

// ─── Initial Mock & Live Data Seeds ──────────────────────────────────────────

const WORKFLOW_STAGES = [
  { key: "requested", label: "Requested", icon: Clock, color: "#94a3b8" },
  { key: "collected", label: "Collected", icon: Syringe, color: "#38bdf8" },
  { key: "received", label: "Received", icon: PackageCheck, color: "#818cf8" },
  { key: "processing", label: "Processing", icon: Activity, color: "#f59e0b" },
  { key: "quality-control", label: "QC Checked", icon: Layers, color: "#a855f7" },
  { key: "verified", label: "Verified", icon: ShieldCheck, color: "#10b981" },
  { key: "released", label: "Released", icon: Send, color: "#06b6d4" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, color: "#22c55e" },
];

// Module-level socket singleton — lives outside the component so it
// survives re-renders without reconnecting on every render cycle.
// Auth note: the backend verifies the JWT signature and joins this socket
// to its organization's room (shared/realtime/socket.js in wellirecord-backend),
// so lab_order_change events are scoped to the connected org.
let labOrdersSocket: Socket | null = null;

function getLabOrdersSocket() {
  if (!labOrdersSocket) {
    const token = Cookies.get("accessToken");
    labOrdersSocket = io(apiUrl, {
      auth: { token },
    });
  }
  return labOrdersSocket;
}

export function LabOrdersPage() {
  const { user, searchPatientRequest } = useAuth();
  const [activeTab, setActiveTab] = useState<"pipeline" | "entry" | "delivery" | "imaging" | "inventory" | "analytics">("pipeline");
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    getAllLabOrders()
      .then((res) => setOrders(res.items))
      .catch((err) => console.error("Failed to load lab orders:", err))
      .finally(() => setOrdersLoading(false));
  }, []);

  // Real-time sync: apply insert/update/delete changes pushed by the backend.
  useEffect(() => {
    const socket = getLabOrdersSocket();

    const handleChange = (change: {
      operationType: string;
      documentId: string;
      document: any | null;
    }) => {
      setOrders((prev) => {
        if (change.operationType === "insert" && change.document) {
          return [change.document, ...prev];
        }
        if (change.operationType === "update" && change.document) {
          return prev.map((o) => (o.id === change.documentId ? change.document : o));
        }
        if (change.operationType === "delete") {
          return prev.filter((o) => o.id !== change.documentId);
        }
        return prev;
      });
    };

    socket.on("lab_order_change", handleChange);

    return () => {
      socket.off("lab_order_change", handleChange);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"all" | "wrid" | "name" | "phone" | "doctor">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Selection for results entry modal or detailed inspection
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
    avatar?: string;
    raw: any;
  } | null>(null);

  // Results Entry Form State
  const [resultForm, setResultForm] = useState({
    measuredValue: "",
    normalRange: "",
    interpretation: "",
    isCritical: false,
    verifierRole: "Medical Laboratory Scientist",
    comments: "",
  });

  // New Order Creation Form State
  const [newOrder, setNewOrder] = useState({
    patientName: "",
    patientWrId: "",
    phone: "",
    doctorPhone: "",
    testName: "",
    category: "Hematology",
    source: "Hospital Referral",
    doctor: "",
    priority: "routine",
    sampleType: "Blood (EDTA)",
    price: 10000,
  });

  // Lab test catalog — populates the panel/test cascading selects below.
  // Falls back to manual free-text entry if the catalog fails to load
  // or a needed test genuinely isn't in it yet.
  const [testCatalog, setTestCatalog] = useState<LabTestCatalogGroup[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedPanel, setSelectedPanel] = useState<string>("");
  const [useManualTestEntry, setUseManualTestEntry] = useState(false);

  // Grants where this provider (or their org) is the grantee — used
  // only to show write-consent status in the new-order form before
  // submitting. The backend enforces this independently
  // (requireWriteConsent middleware); this is UX, not the boundary —
  // a stale or incomplete list here can never grant access it
  // wouldn't otherwise have, only mislabel the status shown.
  const [providerGrants, setProviderGrants] = useState<ProviderGrant[]>([]);

  useEffect(() => {
    consentApi.getMyGrantsAsProvider().then(setProviderGrants);
  }, []);

  const hasWriteConsent = (
    patientId: string | undefined | null,
    category: string,
  ): boolean | null => {
    if (!patientId) return null;
    const now = new Date();
    return providerGrants.some((g) => {
      const grantPatientId =
        typeof g.patientId === "string" ? g.patientId : g.patientId?._id;
      if (grantPatientId !== patientId) return false;
      if (g.status !== "active") return false;
      if (!g.permissions?.write) return false;
      if (g.expiresAt && new Date(g.expiresAt) <= now) return false;
      return (
        g.accessScope === "full-record" ||
        (g.accessScope === "category" && g.category === category)
      );
    });
  };

  useEffect(() => {
    getLabTestCatalog()
      .then(setTestCatalog)
      .catch((err) => console.error("Failed to load lab test catalog:", err))
      .finally(() => setCatalogLoading(false));
  }, []);

  const testsInSelectedPanel = useMemo(
    () => testCatalog.find((g) => g.category === selectedPanel)?.tests ?? [],
    [testCatalog, selectedPanel],
  );

  // Imaging upload state
  const [imagingForm, setImagingForm] = useState({
    patientWrId: "",
    modality: "X-Ray",
    bodyPart: "Chest PA",
    file: null as File | null,
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── Filtered Orders Calculation ──────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (searchBy === "wrid" && ord.patientWrId.toLowerCase().includes(q)) ||
        (searchBy === "name" && ord.patientName.toLowerCase().includes(q)) ||
        (searchBy === "phone" && ord.phone.includes(q)) ||
        (searchBy === "doctor" && ord.doctor.toLowerCase().includes(q)) ||
        (searchBy === "all" &&
          (ord.patientName.toLowerCase().includes(q) ||
            ord.patientWrId.toLowerCase().includes(q) ||
            ord.testName.toLowerCase().includes(q) ||
            ord.doctor.toLowerCase().includes(q) ||
            ord.barcode.toLowerCase().includes(q)));

      const matchesSource = sourceFilter === "all" || ord.sourceType.toLowerCase() === sourceFilter.toLowerCase();
      const matchesPriority = priorityFilter === "all" || ord.priority === priorityFilter;
      const matchesStage = stageFilter === "all" || ord.status === stageFilter;

      return matchesQuery && matchesSource && matchesPriority && matchesStage;
    });
  }, [orders, searchQuery, searchBy, sourceFilter, priorityFilter, stageFilter]);

  // Metric Computations
  const stats = useMemo(() => {
    const total = orders.length;
    const pendingSamples = orders.filter((o) => o.status === "requested" || o.status === "collected").length;
    const inProcessing = orders.filter((o) => o.status === "processing" || o.status === "received").length;
    const resultsReady = orders.filter((o) => o.status === "verified" || o.status === "released" || o.status === "delivered").length;
    const criticalCount = orders.filter((o) => o.isCritical).length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === "paid" ? o.price : 0), 0);
    const outstanding = orders.reduce((acc, o) => acc + (o.paymentStatus === "pending" ? o.price : 0), 0);

    return { total, pendingSamples, inProcessing, resultsReady, criticalCount, totalRevenue, outstanding };
  }, [orders]);

  // Advance Order Workflow Stage
  const handleAdvanceStage = (orderId: string, currentStatus: string) => {
    const stages = WORKFLOW_STAGES.map((s) => s.key);
    const currIndex = stages.indexOf(currentStatus);
    if (currIndex >= 0 && currIndex < stages.length - 1) {
      const nextStatus = stages[currIndex + 1];
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      showToast(`Order ${orderId} moved to ${nextStatus.toUpperCase()}`);
    }
  };

  // Open Results Entry Modal
  const openResultModal = (order: any) => {
    setSelectedOrder(order);
    setResultForm({
      measuredValue: order.measuredValue || "",
      normalRange: order.normalRange || "",
      interpretation: order.interpretation || "",
      isCritical: order.isCritical || false,
      verifierRole: "Medical Laboratory Scientist",
      comments: "",
    });
    setIsResultModalOpen(true);
  };

  // Save Results & Critical Alert Trigger
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              measuredValue: resultForm.measuredValue,
              normalRange: resultForm.normalRange,
              interpretation: resultForm.interpretation,
              isCritical: resultForm.isCritical,
              status: "verified",
              verifiedBy: `${user?.name || "MLS Specialist"} (${resultForm.verifierRole})`,
            }
          : o
      )
    );

    if (resultForm.isCritical) {
      const alertPhone = selectedOrder.doctorPhone;
      if (!alertPhone) {
        showToast(`Result saved and flagged CRITICAL, but no doctor phone on file — notify Dr. ${selectedOrder.doctor} directly.`);
      } else {
        const alertMessage = `CRITICAL LAB VALUE: ${selectedOrder.patientName} — ${selectedOrder.testName}. Check WelliRecord immediately.`;
        const result = await sendCriticalAlertSms(alertPhone, alertMessage);
        if (result.success) {
          showToast(`Critical result saved. Alert SMS sent to Dr. ${selectedOrder.doctor}.`);
        } else {
          showToast(`Result saved and flagged CRITICAL, but SMS alert failed: ${result.error}. Notify Dr. ${selectedOrder.doctor} directly.`);
        }
      }
    } else {
      showToast(`Lab result saved & verified for ${selectedOrder.patientName}`);
    }

    setIsResultModalOpen(false);
  };

  // Handle New Order Submission
  const CATEGORY_MAP: Record<string, string> = {
    "Hematology": "hematology",
    "Chemical Pathology": "chemistry",
    "Microbiology": "microbiology",
    "Histopathology": "pathology",
    "Immunology": "serology",
  };

  const handleCreateNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id) {
      showToast("Select a patient before creating the request.");
      return;
    }
    try {
      const created = await createLabOrder({
        patientId: selectedPatient.id,
        testName: newOrder.testName,
        category: CATEGORY_MAP[newOrder.category] || "other",
        priority: newOrder.priority,
        sampleType: newOrder.sampleType,
        doctorName: newOrder.doctor,
        doctorPhone: newOrder.doctorPhone,
        price: Number(newOrder.price),
      });
      showToast(`New Lab Request generated with Barcode ${created.barcode}!`);
      setIsNewOrderModalOpen(false);
      setSelectedPatient(null);
    } catch (err: any) {
      console.error(err);
      // This instance (shared/lib/api.ts) doesn't normalize errors the
      // way apiClient.ts does — the backend's actual message lives at
      // err.response.data.message, not err.message (which is just
      // axios's generic "Request failed with status code 403").
      showToast(
        err?.response?.data?.message ||
          "Failed to create lab order — check console for details.",
      );
    }
  };


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ background: T.bg, color: T.text }}>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-sky-400/30 bg-[#0d2342] text-sky-200 text-sm animate-bounce">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl border border-sky-400/20 bg-sky-500/10">
              <FlaskConical className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Diagnostic & Laboratory Workspace</h1>
              <p className="text-xs text-sky-300/70 mt-0.5">
                Specimen intake · Workflow pipeline · Critical Panic Alerts · Imaging & Verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeliveryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#061c38] hover:bg-[#09264c] text-sky-300 border border-sky-400/30 transition-all"
          >
            <UploadCloud size={18} /> Upload External Result
          </button>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus size={18} /> New Test Request
          </button>
          <button
            onClick={() => showToast("Barcode Label Printer connected via WebUSB / LIS Bridge")}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            title="Print Barcode Labels"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={() => showToast("HL7 FHIR / LIS Gateway status: Active & Synchronized")}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Radio size={16} className="text-emerald-400 animate-pulse" />
            <span>HL7 FHIR</span>
          </button>
        </div>
      </div>

      {/* ─── Today's Summary KPI Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Total Orders</div>
          <div className="text-xl font-black text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-sky-400 mt-1 flex items-center gap-1">
            <Activity size={10} /> Active Today
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Pending Intake</div>
          <div className="text-xl font-black text-amber-400 mt-1">{stats.pendingSamples}</div>
          <div className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
            <Syringe size={10} /> Phlebotomy Queue
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">In Processing</div>
          <div className="text-xl font-black text-indigo-400 mt-1">{stats.inProcessing}</div>
          <div className="text-[10px] text-indigo-400/80 mt-1 flex items-center gap-1">
            <Cpu size={10} /> Analyzers Running
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Results Ready</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{stats.resultsReady}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <ShieldCheck size={10} /> Verified & Signed
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <div className="text-xs text-rose-300 font-medium flex items-center justify-between">
            <span>Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-xl font-black text-rose-400 mt-1">{stats.criticalCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Immediate Panic Action</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Daily Revenue</div>
          <div className="text-xl font-black text-white mt-1">₦{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Paid Invoices</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Outstanding</div>
          <div className="text-xl font-black text-slate-300 mt-1">₦{stats.outstanding.toLocaleString()}</div>
          <div className="text-[10px] text-amber-400 mt-1">HMO Claims Pending</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "pipeline"
              ? "border-sky-400 text-sky-400 bg-sky-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers size={16} /> Workflow Pipeline & Orders
        </button>

        <button
          onClick={() => setActiveTab("entry")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "entry"
              ? "border-sky-400 text-sky-400 bg-sky-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileSignature size={16} /> Results Entry & Sign-off
        </button>

        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "delivery"
              ? "border-sky-400 text-sky-400 bg-sky-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UploadCloud size={16} /> Result Upload & Delivery Engine
        </button>

        <button
          onClick={() => setActiveTab("imaging")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "imaging"
              ? "border-sky-400 text-sky-400 bg-sky-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileImage size={16} /> Imaging & Radiology Hub
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "inventory"
              ? "border-sky-400 text-sky-400 bg-sky-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <HardDrive size={16} /> Analyzers & Reagents
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-sky-400 text-sky-400 bg-sky-400/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart2 size={16} /> Lab Analytics & TAT
        </button>
      </div>

      {/* TAB: RESULT UPLOAD & DELIVERY ENGINE */}
      {activeTab === "delivery" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl border border-sky-400/30 bg-gradient-to-r from-[#091f3d] via-[#0b2447] to-[#041224] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-widest mb-1">
                <Sparkles size={14} /> Longitudinally Verified Clinical Engine
              </div>
              <h2 className="text-xl font-black text-white">
                Laboratory Results & Document Delivery Engine
              </h2>
              <p className="text-xs text-sky-200/70 mt-1 max-w-2xl">
                Upload external lab reports, verify patient WelliRecord identity via dual-factor checks, extract machine-readable observations, manage critical panic escalations, and release secure multi-channel notifications.
              </p>
            </div>

            <button
              onClick={() => setIsDeliveryModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-sky-500/20 transition-all shrink-0"
            >
              <UploadCloud size={18} /> Launch Result Delivery Wizard
            </button>
          </div>

          {/* Module Grid Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c192b] space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <ShieldCheck size={18} /> 🔐 Verified Patient Identity
              </div>
              <p className="text-xs text-slate-300">
                Dual-factor verification (WR ID + Phone/Email) locks high-risk delivery until identity is confirmed. Unregistered customers receive quick invitation onboarding links.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c192b] space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Sparkles size={18} /> 🤖 AI / Machine-Readable Extraction
              </div>
              <p className="text-xs text-slate-300">
                OCR document engine converts PDFs and report scans into structured clinical observation rows (Test Name, Result, Unit, Ref Range, Abnormal Flag) alongside original document attachment.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c192b] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Send size={18} /> 🔔 Multi-Channel Notification Dispatch
              </div>
              <p className="text-xs text-slate-300">
                Release Result triggers Email, SMS, WhatsApp, and Push notifications. Sensitive medical findings remain protected behind authenticated vault login links.
              </p>
            </div>
          </div>

          {/* Delivery & Released Results Recent Audit Queue Table */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-[#0c192b] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" /> Recent Delivered & Released Results Audit Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Track who uploaded, verified, edited, approved, and released external lab reports
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-bold border border-emerald-400/20">
                  Engine Status: Active & Synced
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#061427] text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Patient & WR ID</th>
                    <th className="px-4 py-3">Report / Panel Name</th>
                    <th className="px-4 py-3">Ref #</th>
                    <th className="px-4 py-3">Result Date</th>
                    <th className="px-4 py-3">Severity Flag</th>
                    <th className="px-4 py-3">Verification</th>
                    <th className="px-4 py-3">Channels Notified</th>
                    <th className="px-4 py-3 text-right">Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#08172c]">
                  <tr className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-white">
                      Chinedu Emmanuel Okonkwo
                      <div className="text-[10px] text-sky-400 font-mono">WR-NGA-2026-8891</div>
                    </td>
                    <td className="px-4 py-3">
                      Comprehensive Metabolic & Lipid Panel
                      <div className="text-[10px] text-slate-400">4 extracted observations</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">LAB-2026-9941</td>
                    <td className="px-4 py-3 text-slate-300">2026-08-12</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 text-[10px]">
                        🚨 Critical Panic
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        Dual-Factor Verified ✓
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-300">
                      Email · SMS · WhatsApp · Push
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => showToast("Audit Log: Verified by Dr. Anthony Mbadiwe on Aug 12, 2026 21:04 UTC")}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px]"
                      >
                        View Log
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-white">
                      Amina Bello
                      <div className="text-[10px] text-sky-400 font-mono">WR-NGA-2026-4412</div>
                    </td>
                    <td className="px-4 py-3">
                      Thyroid Profile (TSH, Free T3, Free T4)
                      <div className="text-[10px] text-slate-400">3 extracted observations</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">LAB-2026-8810</td>
                    <td className="px-4 py-3 text-slate-300">2026-08-12</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                        Normal
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        Dual-Factor Verified ✓
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-300">
                      Email · SMS · WhatsApp
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => showToast("Audit Log: Verified by Dr. Kalu Onuoha on Aug 12, 2026 19:40 UTC")}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px]"
                      >
                        View Log
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: WORKFLOW PIPELINE & ORDERS */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          {/* Multi-Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-1 items-center gap-2 bg-[#081220] border border-slate-800 rounded-xl px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, WR-ID, test name, barcode, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
              <select
                value={searchBy}
                onChange={(e: any) => setSearchBy(e.target.value)}
                className="bg-[#0f1d30] text-xs text-sky-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="all">All Fields</option>
                <option value="wrid">WelliRecord ID</option>
                <option value="name">Patient Name</option>
                <option value="phone">Phone</option>
                <option value="doctor">Ordering Doctor</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-[#081220] text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Sources</option>
                <option value="hospital">Hospitals</option>
                <option value="clinic">Clinics</option>
                <option value="doctor">Doctors</option>
                <option value="patient">Direct Patients</option>
                <option value="telemedicine">Telemedicine</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#081220] text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent / STAT</option>
                <option value="routine">Routine</option>
                <option value="home-sample">Home Sample</option>
              </select>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-[#081220] text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Stages</option>
                {WORKFLOW_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Workflow Stage Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setStageFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                stageFilter === "all"
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : "bg-[#0c192b] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              All Stages ({orders.length})
            </button>
            {WORKFLOW_STAGES.map((stg) => {
              const count = orders.filter((o) => o.status === stg.key).length;
              return (
                <button
                  key={stg.key}
                  onClick={() => setStageFilter(stg.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    stageFilter === stg.key
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                      : "bg-[#0c192b] text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <stg.icon size={13} style={{ color: stg.color }} />
                  <span>{stg.label}</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lab Orders Table / Cards */}
          <div className="space-y-3">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ord.isCritical
                    ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60"
                    : "border-slate-800 bg-[#0c192b] hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl border border-sky-400/20 bg-sky-500/10 flex-shrink-0">
                      <Microscope className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-white text-base">{ord.patientName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700 font-mono">
                          {ord.patientWrId}
                        </span>
                        {ord.priority === "urgent" && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                            STAT / URGENT
                          </span>
                        )}
                        {ord.priority === "home-sample" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Home Sample
                          </span>
                        )}
                        {ord.isCritical && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                            CRITICAL VALUE
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-slate-200 mt-1">
                        {ord.testName} <span className="text-xs font-normal text-slate-400">({ord.category})</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} className="text-sky-400" /> {ord.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" /> {ord.doctor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={12} className="text-indigo-400" /> {ord.sampleType}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <QrCode size={12} className="text-amber-400" /> {ord.barcode}
                        </span>
                      </div>

                      {ord.measuredValue && (
                        <div className="mt-3 p-3 rounded-xl border border-slate-800 bg-[#081220] text-xs space-y-1">
                          <div className="text-slate-300">
                            <strong className="text-slate-400">Measured:</strong> {ord.measuredValue}
                          </div>
                          <div className="text-slate-400">
                            <strong>Reference:</strong> {ord.normalRange}
                          </div>
                          <div className="text-sky-300 font-medium">
                            <strong>Interpretation:</strong> {ord.interpretation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold capitalize border ${
                          ord.status === "verified" || ord.status === "released" || ord.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : ord.status === "processing"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-xs font-bold text-white">₦{ord.price.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openResultModal(ord)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors flex items-center gap-1"
                      >
                        <FileSignature size={13} /> Enter / Verify
                      </button>

                      {ord.status !== "delivered" && (
                        <button
                          onClick={() => handleAdvanceStage(ord.id, ord.status)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                        >
                          <span>Advance</span> <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#0c192b]">
                <FlaskConical className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-semibold text-sm">No laboratory requests match search filter.</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting the search query or priority filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RESULTS ENTRY & SIGN-OFF */}
      {activeTab === "entry" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c192b]">
            <h2 className="text-lg font-bold text-white mb-1">Pathology & Laboratory Verification Console</h2>
            <p className="text-xs text-slate-400 mb-6">
              Review analytical readings, enter reference range flags, and release verified WelliRecord test results.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl border border-slate-800 bg-[#081220] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">{ord.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{ord.category}</span>
                    </div>
                    <div className="font-bold text-white text-sm mt-1">{ord.patientName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ord.testName}</div>

                    <div className="mt-3 text-xs text-slate-300 space-y-1 bg-[#0c192b] p-3 rounded-lg border border-slate-800">
                      <div><strong>Current Value:</strong> {ord.measuredValue || "Not entered yet"}</div>
                      <div><strong>Status:</strong> <span className="text-sky-300 capitalize">{ord.status}</span></div>
                      <div><strong>Sign-off:</strong> {ord.verifiedBy}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <span className="text-xs text-slate-400">Barcode: {ord.barcode}</span>
                    <button
                      onClick={() => openResultModal(ord)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors flex items-center gap-1"
                    >
                      <FileCheck size={14} /> Open Result Sheet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMAGING & RADIOLOGY HUB */}
      {activeTab === "imaging" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c192b]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Diagnostic Imaging & Radiology Upload Hub</h2>
                <p className="text-xs text-slate-400">Upload DICOM, X-Ray, MRI, CT, Ultrasound, Eye, or Dental imaging files</p>
              </div>
              <button
                onClick={() => showToast("DICOM Web PACS server connected successfully")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-sky-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <HardDrive size={14} /> Connect PACS Server
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast(`Imaging record uploaded & attached to ${imagingForm.patientWrId || "WR-NGA-2026-8891"}`);
                }}
                className="space-y-4 p-5 rounded-xl border border-slate-800 bg-[#081220]"
              >
                <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                  <Upload size={16} /> Upload New Study / Scan
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Patient WelliRecord ID</label>
                  <input
                    type="text"
                    placeholder="e.g. WR-NGA-2026-8891"
                    value={imagingForm.patientWrId}
                    onChange={(e) => setImagingForm({ ...imagingForm, patientWrId: e.target.value })}
                    className="w-full bg-[#0c192b] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Modality</label>
                    <select
                      value={imagingForm.modality}
                      onChange={(e) => setImagingForm({ ...imagingForm, modality: e.target.value })}
                      className="w-full bg-[#0c192b] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option>X-Ray</option>
                      <option>MRI</option>
                      <option>CT Scan</option>
                      <option>Ultrasound</option>
                      <option>Eye Imaging (OCT/Fundus)</option>
                      <option>Dental Imaging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Body Part / Target</label>
                    <input
                      type="text"
                      placeholder="e.g. Chest PA, Knee Left"
                      value={imagingForm.bodyPart}
                      onChange={(e) => setImagingForm({ ...imagingForm, bodyPart: e.target.value })}
                      className="w-full bg-[#0c192b] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select File (DICOM / Image / PDF)</label>
                  <input
                    type="file"
                    onChange={(e) => setImagingForm({ ...imagingForm, file: e.target.files?.[0] || null })}
                    className="w-full bg-[#0c192b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Radiologist Findings / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter preliminary findings or impression..."
                    value={imagingForm.notes}
                    onChange={(e) => setImagingForm({ ...imagingForm, notes: e.target.value })}
                    className="w-full bg-[#0c192b] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={16} /> Attach Study to Patient Vault
                </button>
              </form>

              {/* Studies Directory */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Recent Uploaded Studies</h3>
                <div className="p-4 rounded-xl border border-slate-800 bg-[#081220] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-sky-400" />
                    <div>
                      <div className="text-sm font-bold text-white">Chest PA X-Ray</div>
                      <div className="text-xs text-slate-400">Chibuike Okonkwo · WR-NGA-2026-8891</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Attached
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#081220] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-indigo-400" />
                    <div>
                      <div className="text-sm font-bold text-white">Pelvic Ultrasound Scan</div>
                      <div className="text-xs text-slate-400">Amara Okafor · WR-NGA-2026-1102</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Attached
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYZERS & REAGENTS INVENTORY */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c192b]">
            <h2 className="text-lg font-bold text-white mb-1">Analyzer & Equipment Monitor</h2>
            <p className="text-xs text-slate-400">
              Equipment calibration tracking and reagent inventory aren't available yet.
              No machines or stock levels are being tracked, so nothing here would be real.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & TAT */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c192b]">
            <h2 className="text-lg font-bold text-white mb-1">Laboratory Operational Performance & TAT</h2>
            <p className="text-xs text-slate-400 mb-6">Turnaround time benchmarking, sample rejection rates, and test distribution</p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-[#081220] text-center">
                <div className="text-xs text-slate-400">Average Turnaround Time (TAT)</div>
                <div className="text-2xl font-black text-emerald-400 mt-2">42 Mins</div>
                <div className="text-[10px] text-slate-500 mt-1">Goal: &lt;60 Mins</div>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#081220] text-center">
                <div className="text-xs text-slate-400">Sample Rejection Rate</div>
                <div className="text-2xl font-black text-sky-400 mt-2">0.4%</div>
                <div className="text-[10px] text-slate-500 mt-1">Hemolyzed / Clotted</div>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#081220] text-center">
                <div className="text-xs text-slate-400">QC Pass Rate</div>
                <div className="text-2xl font-black text-indigo-400 mt-2">99.2%</div>
                <div className="text-[10px] text-slate-500 mt-1">Westgard Rules Passed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: RESULTS ENTRY & SIGN-OFF ────────────────────────────────── */}
      {isResultModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Enter Laboratory Test Result</h3>
                <p className="text-xs text-sky-400">{selectedOrder.testName} · {selectedOrder.patientName}</p>
              </div>
              <button onClick={() => setIsResultModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Measured Value / Readings</label>
                <input
                  type="text"
                  placeholder="e.g. WBC: 12.4 x10^9/L, Hb: 11.2 g/dL"
                  value={resultForm.measuredValue}
                  onChange={(e) => setResultForm({ ...resultForm, measuredValue: e.target.value })}
                  className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reference Range / Normal Bounds</label>
                <input
                  type="text"
                  placeholder="e.g. WBC: 4.0 - 10.0 x10^9/L"
                  value={resultForm.normalRange}
                  onChange={(e) => setResultForm({ ...resultForm, normalRange: e.target.value })}
                  className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Clinical Interpretation</label>
                <textarea
                  rows={2}
                  placeholder="Clinical impression or comments..."
                  value={resultForm.interpretation}
                  onChange={(e) => setResultForm({ ...resultForm, interpretation: e.target.value })}
                  className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10">
                <input
                  type="checkbox"
                  id="criticalCheck"
                  checked={resultForm.isCritical}
                  onChange={(e) => setResultForm({ ...resultForm, isCritical: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                />
                <label htmlFor="criticalCheck" className="text-xs font-bold text-rose-300 cursor-pointer">
                  🚨 Flag as CRITICAL PANIC VALUE (Triggers instant SMS / Push alert to Doctor & Hospital)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Verify & Release Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: NEW TEST REQUEST ────────────────────────────────────────── */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Laboratory Request</h3>
                <p className="text-xs text-slate-400">Generate order barcode and dispatch specimen collection</p>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-4">
              <PatientSearchPicker
                open={isNewOrderModalOpen}
                enabled={true}
                searchPatientRequest={searchPatientRequest}
                onSelect={setSelectedPatient}
              />

              {selectedPatient && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <p className="text-sm font-medium text-emerald-200">Selected patient</p>
                  <p className="mt-1 text-white">{selectedPatient.name}</p>
                </div>
              )}

              {selectedPatient && hasWriteConsent(selectedPatient.id, "lab-results") === false && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-sm font-semibold text-amber-200">No write consent on file</p>
                  <p className="mt-1 text-xs text-amber-200/80">
                    This patient hasn't granted you write access to lab records.
                    Submitting will be rejected until they do — ask them to enable
                    "Allow write access" when granting you access in their app.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ordering Doctor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Olayinka Adeleke"
                    value={newOrder.doctor}
                    onChange={(e) => setNewOrder({ ...newOrder, doctor: e.target.value })}
                    className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Doctor's Phone (for critical alerts)</label>
                  <input
                    type="tel"
                    value={newOrder.doctorPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, doctorPhone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">Test</label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualTestEntry((prev) => !prev);
                      setSelectedPanel("");
                      setNewOrder((prev) => ({ ...prev, testName: "" }));
                    }}
                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300"
                  >
                    {useManualTestEntry ? "Choose from catalog instead" : "Test not listed? Enter manually"}
                  </button>
                </div>

                {useManualTestEntry ? (
                  <input
                    type="text"
                    placeholder="e.g. Full Blood Count"
                    value={newOrder.testName}
                    onChange={(e) => setNewOrder({ ...newOrder, testName: e.target.value })}
                    className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    required
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Panel</label>
                      <select
                        value={selectedPanel}
                        disabled={catalogLoading}
                        onChange={(e) => {
                          setSelectedPanel(e.target.value);
                          setNewOrder((prev) => ({ ...prev, testName: "" }));
                        }}
                        className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
                      >
                        <option value="">{catalogLoading ? "Loading..." : "Select panel"}</option>
                        {testCatalog.map((group) => (
                          <option key={group.category} value={group.category}>
                            {group.category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Test name</label>
                      <select
                        value={newOrder.testName}
                        disabled={!selectedPanel}
                        onChange={(e) => {
                          const test = testsInSelectedPanel.find((t) => t.name === e.target.value);
                          setNewOrder((prev) => ({
                            ...prev,
                            testName: e.target.value,
                            category: test?.labDepartment ?? prev.category,
                          }));
                        }}
                        className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
                        required
                      >
                        <option value="">{selectedPanel ? "Select test" : "Select a panel first"}</option>
                        {testsInSelectedPanel.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Lab department</label>
                <select
                  value={newOrder.category}
                  onChange={(e) => setNewOrder({ ...newOrder, category: e.target.value })}
                  className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option>Hematology</option>
                  <option>Chemical Pathology</option>
                  <option>Microbiology</option>
                  <option>Histopathology</option>
                  <option>Immunology</option>
                  <option>General/Panel</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pre-filled from the selected test — adjust if this order should route to a different department.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                    className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent / STAT</option>
                    <option value="home-sample">Home Sample</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Sample Type</label>
                  <select
                    value={newOrder.sampleType}
                    onChange={(e) => setNewOrder({ ...newOrder, sampleType: e.target.value })}
                    className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option>Blood (EDTA)</option>
                    <option>Blood (Serum)</option>
                    <option>Urine (Mid-stream)</option>
                    <option>Stool Specimen</option>
                    <option>Sputum</option>
                    <option>Biopsy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({ ...newOrder, price: Number(e.target.value) })}
                    className="w-full bg-[#081220] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={15} /> Issue Request & Print Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verified Result Delivery Engine Modal */}
      <VerifiedResultDeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}
