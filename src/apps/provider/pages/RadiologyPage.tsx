import React, { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { apiUrl } from "@/shared/api/authApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { PatientSearchPicker } from "@/apps/components/shared/PatientSearchPicker";
import { consentApi, ProviderGrant } from "@/shared/api/consentApi";
import {
  getAllRadiologyOrders,
  createRadiologyOrder,
  updateRadiologyOrderStatus,
  uploadRadiologyImage,
  publishRadiologyReport,
  RadiologyOrder,
} from "@/shared/api/radiologyOrdersApi";
import {
  FileImage,
  Plus,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  FileText,
  Loader2,
  Send,
} from "lucide-react";

const MODALITIES = ["x-ray", "ultrasound", "ct", "mri", "mammography", "fluoroscopy", "other"];

const STATUS_META: Record<string, { label: string; color: string }> = {
  requested: { label: "Requested", color: "#f59e0b" },
  scheduled: { label: "Scheduled", color: "#3b82f6" },
  "in-progress": { label: "In Progress", color: "#8b5cf6" },
  "images-uploaded": { label: "Images Uploaded", color: "#06b6d4" },
  reported: { label: "Reported", color: "#10b981" },
  delivered: { label: "Delivered", color: "#22c55e" },
};

// Module-level socket singleton, same auth pattern as LabOrdersPage.tsx —
// backend joins this socket to its org's room (shared/realtime/socket.js),
// so radiology_order_change events stay scoped to the connected org.
let radiologySocket: Socket | null = null;
function getRadiologySocket() {
  if (!radiologySocket) {
    const token = Cookies.get("accessToken");
    radiologySocket = io(apiUrl, { auth: { token } });
  }
  return radiologySocket;
}

export function RadiologyPage() {
  const { searchPatientRequest } = useAuth();

  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [newOrder, setNewOrder] = useState({
    examName: "",
    modality: "x-ray",
    bodyPart: "",
    priority: "routine",
    clinicalIndication: "",
    doctorName: "",
    doctorPhone: "",
    price: 0,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [providerGrants, setProviderGrants] = useState<ProviderGrant[]>([]);

  const [uploading, setUploading] = useState(false);
  const [reportForm, setReportForm] = useState({
    findings: "",
    impression: "",
    radiologistName: "",
    isCritical: false,
  });
  const [publishing, setPublishing] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    consentApi.getMyGrantsAsProvider().then(setProviderGrants).catch(() => {});
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
        (g.accessScope === "category" && g.category === "radiology")
      );
    });
  };

  const fetchOrders = () => {
    getAllRadiologyOrders()
      .then((res) => {
        setOrders(res.items);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch radiology orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();

    const s = getRadiologySocket();
    let isInitialConnect = true;

    const handleChange = (change: { operationType: string; documentId: string; document: RadiologyOrder | null }) => {
      setOrders((prev) => {
        if (change.operationType === "insert" && change.document) {
          return [change.document, ...prev];
        }
        if (change.operationType === "update" && change.document) {
          return prev.map((o) => (o.id === change.documentId ? change.document! : o));
        }
        return prev;
      });
    };

    const handleConnect = () => {
      if (isInitialConnect) {
        isInitialConnect = false;
        return;
      }
      fetchOrders();
    };

    s.on("radiology_order_change", handleChange);
    s.on("connect", handleConnect);

    return () => {
      s.off("radiology_order_change", handleChange);
      s.off("connect", handleConnect);
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  useEffect(() => {
    if (selectedOrder?.report) {
      setReportForm({
        findings: selectedOrder.report.findings || "",
        impression: selectedOrder.report.impression || "",
        radiologistName: selectedOrder.report.radiologistName || "",
        isCritical: selectedOrder.isCritical || false,
      });
    } else {
      setReportForm({ findings: "", impression: "", radiologistName: "", isCritical: false });
    }
    setReportError("");
  }, [selectedOrderId]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id || !newOrder.examName.trim()) return;

    try {
      setCreating(true);
      setCreateError("");
      const created = await createRadiologyOrder({
        patientId: selectedPatient.id,
        examName: newOrder.examName.trim(),
        modality: newOrder.modality,
        bodyPart: newOrder.bodyPart || undefined,
        priority: newOrder.priority,
        clinicalIndication: newOrder.clinicalIndication || undefined,
        doctorName: newOrder.doctorName || undefined,
        doctorPhone: newOrder.doctorPhone || undefined,
        price: newOrder.price || undefined,
      });
      setOrders((prev) => [created, ...prev]);
      setIsNewOrderModalOpen(false);
      setSelectedPatient(null);
      setNewOrder({
        examName: "",
        modality: "x-ray",
        bodyPart: "",
        priority: "routine",
        clinicalIndication: "",
        doctorName: "",
        doctorPhone: "",
        price: 0,
      });
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Failed to create radiology order.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await updateRadiologyOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      console.warn("Failed to update status:", err);
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    try {
      setUploading(true);
      const updated = await uploadRadiologyImage(id, file);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handlePublishReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !reportForm.findings.trim()) return;

    try {
      setPublishing(true);
      setReportError("");
      const updated = await publishRadiologyReport(selectedOrder.id, {
        findings: reportForm.findings.trim(),
        impression: reportForm.impression || undefined,
        radiologistName: reportForm.radiologistName || undefined,
        isCritical: reportForm.isCritical,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err: any) {
      setReportError(err?.response?.data?.message || "Failed to publish report.");
    } finally {
      setPublishing(false);
    }
  };

  const patientLabel = (order: RadiologyOrder) => {
    if (typeof order.patientId === "string") return order.patientId;
    return order.patientId?.fullName || `${order.patientId?.firstName || ""} ${order.patientId?.lastName || ""}`.trim() || "Unknown patient";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#e2e8f0" }}>Radiology Workspace</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Imaging orders · upload scans · publish reports</p>
        </div>
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "#7c3aed" }}
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="flex gap-6">
        {/* Order list */}
        <div className="w-80 flex-shrink-0 space-y-2">
          <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>
            Orders ({orders.length})
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="rounded-xl p-4 text-xs" style={{ background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px dashed rgba(109,40,217,0.25)" }}>
              No radiology orders yet.
            </div>
          )}

          {orders.map((o) => {
            const meta = STATUS_META[o.status] || STATUS_META.requested;
            return (
              <div
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className="p-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: selectedOrderId === o.id ? "rgba(109,40,217,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedOrderId === o.id ? "rgba(109,40,217,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-xs" style={{ color: "#e2e8f0" }}>{patientLabel(o)}</div>
                  {o.isCritical
                    ? <AlertTriangle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
                    : <Clock size={13} style={{ color: "#f59e0b", flexShrink: 0 }} />}
                </div>
                <div className="text-[11px]" style={{ color: "#94a3b8" }}>{o.examName} · {o.modality}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  {o.priority === "urgent" && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="flex-1 space-y-4">
          {!selectedOrder ? (
            <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(109,40,217,0.25)" }}>
              <FileImage size={26} style={{ color: "#7c3aed" }} />
              <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Select an order to view details</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(109,40,217,0.15)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{selectedOrder.examName}</div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>{patientLabel(selectedOrder)} · {selectedOrder.modality}{selectedOrder.bodyPart ? ` · ${selectedOrder.bodyPart}` : ""}</div>
                  </div>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5 bg-black/30 border border-white/10 text-white"
                  >
                    {Object.keys(STATUS_META).map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>

                {selectedOrder.clinicalIndication && (
                  <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
                    <span className="font-semibold" style={{ color: "#cbd5e1" }}>Indication: </span>
                    {selectedOrder.clinicalIndication}
                  </p>
                )}

                {hasWriteConsent(typeof selectedOrder.patientId === "string" ? selectedOrder.patientId : selectedOrder.patientId?._id, "radiology") === false && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 mt-2">
                    <p className="text-xs font-semibold text-amber-200">No write consent on file</p>
                    <p className="mt-1 text-[11px] text-amber-200/80">
                      This patient hasn't granted write access to radiology records. Uploads and report publishing may be rejected until they do.
                    </p>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(109,40,217,0.15)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>
                    Images & Files ({selectedOrder.images.length})
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-lg" style={{ background: "rgba(109,40,217,0.15)", color: "#a78bfa" }}>
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Upload
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.dcm"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(selectedOrder.id, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <p className="text-[11px] mb-3" style={{ color: "#64748b" }}>
                  JPG/PNG/WEBP exports preview inline. .dcm DICOM files are stored and downloadable — there's no in-browser DICOM viewer yet.
                </p>

                {selectedOrder.images.length === 0 ? (
                  <p className="text-xs" style={{ color: "#64748b" }}>No files uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedOrder.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-white/10"
                      >
                        {img.resourceType === "image" ? (
                          <img src={img.url} alt={img.originalFilename || "scan"} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 flex flex-col items-center justify-center gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <FileText size={18} style={{ color: "#94a3b8" }} />
                            <span className="text-[9px]" style={{ color: "#64748b" }}>DICOM file</span>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Report */}
              <form onSubmit={handlePublishReport} className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(109,40,217,0.15)" }}>
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>
                  {selectedOrder.report ? "Report" : "Publish report"}
                </div>

                <textarea
                  value={reportForm.findings}
                  onChange={(e) => setReportForm((f) => ({ ...f, findings: e.target.value }))}
                  placeholder="Findings"
                  rows={4}
                  required
                  className="w-full text-sm rounded-lg px-3 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                />
                <textarea
                  value={reportForm.impression}
                  onChange={(e) => setReportForm((f) => ({ ...f, impression: e.target.value }))}
                  placeholder="Impression (optional)"
                  rows={2}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                />
                <div className="flex gap-3">
                  <input
                    value={reportForm.radiologistName}
                    onChange={(e) => setReportForm((f) => ({ ...f, radiologistName: e.target.value }))}
                    placeholder="Radiologist name"
                    className="flex-1 text-sm rounded-lg px-3 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                  />
                  <label className="flex items-center gap-2 text-xs" style={{ color: "#cbd5e1" }}>
                    <input
                      type="checkbox"
                      checked={reportForm.isCritical}
                      onChange={(e) => setReportForm((f) => ({ ...f, isCritical: e.target.checked }))}
                    />
                    Mark critical
                  </label>
                </div>

                {reportError && (
                  <div className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
                    {reportError}
                  </div>
                )}

                {selectedOrder.report && (
                  <p className="text-[11px]" style={{ color: "#64748b" }}>
                    Last published {new Date(selectedOrder.report.reportedAt).toLocaleString("en-NG")}. Publishing again notifies the patient again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={publishing || !reportForm.findings.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
                  style={{ background: "#7c3aed" }}
                >
                  {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {selectedOrder.report ? "Republish report" : "Publish report & notify patient"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* New order modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl p-6 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">New Radiology Order</h3>
                <p className="text-xs text-slate-400">Order an imaging study for a patient</p>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
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

              {selectedPatient && hasWriteConsent(selectedPatient.id, "radiology") === false && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-sm font-semibold text-amber-200">No write consent on file</p>
                  <p className="mt-1 text-xs text-amber-200/80">
                    This patient hasn't granted write access to radiology records.
                    Submitting will be rejected until they do.
                  </p>
                </div>
              )}

              <input
                value={newOrder.examName}
                onChange={(e) => setNewOrder((f) => ({ ...f, examName: e.target.value }))}
                placeholder="Exam name (e.g. Chest X-Ray)"
                required
                className="w-full text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newOrder.modality}
                  onChange={(e) => setNewOrder((f) => ({ ...f, modality: e.target.value }))}
                  className="text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white"
                >
                  {MODALITIES.map((m) => (
                    <option key={m} value={m}>{m.toUpperCase()}</option>
                  ))}
                </select>
                <select
                  value={newOrder.priority}
                  onChange={(e) => setNewOrder((f) => ({ ...f, priority: e.target.value }))}
                  className="text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <input
                value={newOrder.bodyPart}
                onChange={(e) => setNewOrder((f) => ({ ...f, bodyPart: e.target.value }))}
                placeholder="Body part (optional)"
                className="w-full text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
              />

              <textarea
                value={newOrder.clinicalIndication}
                onChange={(e) => setNewOrder((f) => ({ ...f, clinicalIndication: e.target.value }))}
                placeholder="Clinical indication (optional)"
                rows={2}
                className="w-full text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newOrder.doctorName}
                  onChange={(e) => setNewOrder((f) => ({ ...f, doctorName: e.target.value }))}
                  placeholder="Ordering doctor"
                  className="text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                />
                <input
                  value={newOrder.doctorPhone}
                  onChange={(e) => setNewOrder((f) => ({ ...f, doctorPhone: e.target.value }))}
                  placeholder="Doctor phone"
                  className="text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <input
                type="number"
                min={0}
                value={newOrder.price}
                onChange={(e) => setNewOrder((f) => ({ ...f, price: Number(e.target.value) }))}
                placeholder="Price (₦)"
                className="w-full text-sm rounded-lg px-3 py-2.5 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
              />

              {createError && (
                <div className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
                  {createError}
                </div>
              )}

              <button
                type="submit"
                disabled={creating || !selectedPatient || !newOrder.examName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
                style={{ background: "#7c3aed" }}
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Create Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
