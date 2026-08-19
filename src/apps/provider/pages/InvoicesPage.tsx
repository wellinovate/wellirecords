import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { useAuth } from "@/shared/auth/AuthProvider";
import { PatientSearchPicker } from "@/apps/components/shared/PatientSearchPicker";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  voidInvoice,
  sendInvoice,
  sendPaymentReminder,
  getCheckoutSuggestions,
  Invoice,
  InvoiceDetail,
  InvoiceStatus,
  CheckoutSuggestion,
  LineItemCategory,
} from "@/shared/api/billingApiV2";
import {
  Plus, X, Search, Receipt, Send, Bell, Ban, CheckCircle,
  Clock, AlertTriangle, Loader2, Printer, Trash2,
} from "lucide-react";

const STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  unpaid: { label: "Unpaid", color: "#f59e0b" },
  "partially-paid": { label: "Part-paid", color: "#3b82f6" },
  paid: { label: "Paid", color: "#10b981" },
  void: { label: "Void", color: "#64748b" },
};

const CATEGORIES: LineItemCategory[] = [
  "consultation", "laboratory", "radiology", "procedure", "pharmacy", "consumable", "other",
];

function fmt(n: number) {
  return `₦${(n || 0).toLocaleString("en-NG")}`;
}

function patientLabel(p: Invoice["patientId"]) {
  if (typeof p === "string") return p;
  return p?.fullName || p?.wrId || "Unknown patient";
}

export function InvoicesPage() {
  const { searchPatientRequest } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [suggestions, setSuggestions] = useState<CheckoutSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [lineItems, setLineItems] = useState<
    { description: string; category: LineItemCategory; sourceType: string; sourceId?: string; quantity: number; unitPrice: number; discount: number; included: boolean }[]
  >([]);
  const [hmoContribution, setHmoContribution] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash" as const, reference: "", notes: "" });
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [sendingAction, setSendingAction] = useState<string | null>(null);

  const fetchInvoices = () => {
    setLoading(true);
    getInvoices(statusFilter || undefined)
      .then((res) => setInvoices(res.items))
      .catch((err) => console.warn("Failed to fetch invoices:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Deep-link from EHRViewerPage's "Checkout Patient" button — opens
  // straight to the new-invoice modal with the patient already selected,
  // instead of landing here and having to search for them again.
  useEffect(() => {
    const checkoutPatientId = searchParams.get("checkoutPatientId");
    const checkoutPatientName = searchParams.get("checkoutPatientName");
    if (checkoutPatientId) {
      setSelectedPatient({ id: checkoutPatientId, name: checkoutPatientName || "" });
      setIsNewModalOpen(true);
      searchParams.delete("checkoutPatientId");
      searchParams.delete("checkoutPatientName");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    getInvoiceById(selectedId)
      .then(setDetail)
      .catch((err) => console.warn("Failed to load invoice:", err))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  useEffect(() => {
    if (!selectedPatient?.id) {
      setSuggestions([]);
      setLineItems([]);
      return;
    }
    setLoadingSuggestions(true);
    getCheckoutSuggestions(selectedPatient.id)
      .then((res) => {
        setSuggestions(res.suggestions);
        setLineItems(
          res.suggestions.map((s) => ({ ...s, discount: 0, included: true })),
        );
      })
      .catch((err) => console.warn("Failed to load checkout suggestions:", err))
      .finally(() => setLoadingSuggestions(false));
  }, [selectedPatient?.id]);

  const stats = useMemo(() => {
    const activeInvoices = invoices.filter((i) => i.status !== "void");
    const totalInvoiced = activeInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPaid = activeInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const outstandingBalance = invoices
      .filter((i) => i.status === "unpaid" || i.status === "partially-paid")
      .reduce((sum, i) => sum + Math.max(0, i.totalAmount - i.amountPaid), 0);
    const paidInvoicesCount = invoices.filter((i) => i.status === "paid").length;
    const unpaidInvoicesCount = invoices.filter(
      (i) => i.status === "unpaid" || i.status === "partially-paid"
    ).length;
    const hmoTotal = activeInvoices.reduce((sum, i) => sum + (i.hmoContribution || 0), 0);

    return {
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      paidInvoicesCount,
      unpaidInvoicesCount,
      hmoTotal,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        patientLabel(inv.patientId).toLowerCase().includes(q),
    );
  }, [invoices, search]);

  const addManualLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", category: "other", sourceType: "manual", quantity: 1, unitPrice: 0, discount: 0, included: true },
    ]);
  };

  const updateLineItem = (idx: number, patch: Partial<(typeof lineItems)[0]>) => {
    setLineItems((prev) => prev.map((li, i) => (i === idx ? { ...li, ...patch } : li)));
  };

  const removeLineItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const activeLineItems = lineItems.filter((li) => li.included);
  const subtotal = activeLineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const discountTotal = activeLineItems.reduce((sum, li) => sum + li.discount, 0);
  const totalAmount = Math.max(0, subtotal - discountTotal + taxTotal);
  const patientResponsibility = Math.max(0, totalAmount - hmoContribution);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id || activeLineItems.length === 0) return;

    try {
      setCreating(true);
      setCreateError("");
      const created = await createInvoice({
        patientId: selectedPatient.id,
        lineItems: activeLineItems.map((li) => ({
          description: li.description,
          category: li.category,
          sourceType: li.sourceType as any,
          sourceId: li.sourceId,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          discount: li.discount,
        })),
        taxTotal,
        hmoContribution,
      });
      setInvoices((prev) => [created, ...prev]);
      setIsNewModalOpen(false);
      setSelectedPatient(null);
      setLineItems([]);
      setHmoContribution(0);
      setTaxTotal(0);
      setSelectedId(created.id);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Failed to create invoice.");
    } finally {
      setCreating(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !paymentForm.amount) return;

    try {
      setRecordingPayment(true);
      setPaymentError("");
      const result = await recordPayment(detail.id, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      });
      setDetail((prev) => (prev ? { ...prev, ...result.invoice, payments: [result.payment, ...prev.payments], receipts: [result.receipt, ...prev.receipts] } : prev));
      setInvoices((prev) => prev.map((inv) => (inv.id === result.invoice.id ? result.invoice : inv)));
      setPaymentForm({ amount: "", method: "cash", reference: "", notes: "" });
    } catch (err: any) {
      setPaymentError(err?.response?.data?.message || "Failed to record payment.");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleVoid = async () => {
    if (!detail) return;
    if (!confirm(`Void invoice ${detail.invoiceNumber}? This cannot be undone.`)) return;
    try {
      const updated = await voidInvoice(detail.id);
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to void invoice.");
    }
  };

  const handleSend = async (isReminder: boolean) => {
    if (!detail) return;
    try {
      setSendingAction(isReminder ? "remind" : "send");
      if (isReminder) await sendPaymentReminder(detail.id);
      else await sendInvoice(detail.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send.");
    } finally {
      setSendingAction(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#e2e8f0" }}>Billing — Invoices</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Checkout patients, track payments, issue receipts</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-sky-500/20 hover:opacity-95 transition-opacity"
          style={{ background: "#0ea5e9" }}
        >
          <Plus size={16} /> Checkout Patient
        </button>
      </div>

      {/* Financial Overview KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Total Invoiced</div>
          <div className="text-xl font-black text-white mt-1">{fmt(stats.totalInvoiced)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across all facility invoices</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Outstanding Balance</div>
          <div className={`text-xl font-black mt-1 ${stats.outstandingBalance > 0 ? "text-amber-400" : "text-slate-200"}`}>
            {fmt(stats.outstandingBalance)}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">
            {stats.unpaidInvoicesCount} invoice{stats.unpaidInvoicesCount === 1 ? "" : "s"} pending settlement
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">Total Collected</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{fmt(stats.totalPaid)}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            {stats.paidInvoicesCount} fully settled invoice{stats.paidInvoicesCount === 1 ? "" : "s"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-[#0c192b]">
          <div className="text-xs text-slate-400 font-medium">HMO Deductions</div>
          <div className="text-xl font-black text-indigo-400 mt-1">{fmt(stats.hmoTotal)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Applied insurer coverage</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or patient"
            className="w-full h-10 rounded-lg pl-9 pr-3 text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "")}
          className="h-10 rounded-lg px-3 text-sm bg-black/30 border border-white/10 text-white"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_META).map((s) => (
            <option key={s} value={s}>{STATUS_META[s as InvoiceStatus].label}</option>
          ))}
        </select>
      </div>

      {invoices.length === 0 && !loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="max-w-md w-full p-8 rounded-3xl border border-slate-800 bg-[#0c192b] text-center shadow-xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mb-4">
              <Receipt size={28} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-semibold text-slate-300 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Ready for Billing</span>
            </div>

            <h2 className="text-base font-bold text-white mb-2">
              No Invoices Issued Yet
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              Start by checking out a patient to automatically pull unbilled lab orders, pharmacy prescriptions, or radiology studies into a single trackable invoice.
            </p>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Plus size={15} /> Checkout First Patient
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Invoice table */}
          <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(14,165,233,0.15)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                    <Loader2 size={16} className="animate-spin inline" /> Loading…
                  </td></tr>
                )}
                {!loading && filteredInvoices.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                    No invoices matching current filter criteria.
                  </td></tr>
                )}
                {filteredInvoices.map((inv) => {
                  const meta = STATUS_META[inv.status];
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedId(inv.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: selectedId === inv.id ? "rgba(14,165,233,0.08)" : "transparent",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "#e2e8f0" }}>{inv.invoiceNumber}</td>
                      <td className="px-4 py-3" style={{ color: "#e2e8f0" }}>{patientLabel(inv.patientId)}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: "#e2e8f0" }}>{fmt(inv.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase" style={{ background: `${meta.color}22`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                        {new Date(inv.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedId && (
            <div className="w-[380px] flex-shrink-0 rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(14,165,233,0.15)", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
            {detailLoading && <Loader2 size={18} className="animate-spin" style={{ color: "#0ea5e9" }} />}

            {detail && !detailLoading && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs" style={{ color: "#94a3b8" }}>{detail.invoiceNumber}</div>
                    <div className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{patientLabel(detail.patientId)}</div>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="cursor-pointer" style={{ color: "#64748b" }}><X size={16} /></button>
                </div>

                <div className="rounded-xl p-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  {detail.lineItems.map((li) => (
                    <div key={li.id} className="flex justify-between text-xs">
                      <span style={{ color: "#cbd5e1" }}>{li.description} ×{li.quantity}</span>
                      <span style={{ color: "#e2e8f0" }}>{fmt(li.lineTotal || li.quantity * li.unitPrice - li.discount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Subtotal</span><span style={{ color: "#e2e8f0" }}>{fmt(detail.subtotal)}</span></div>
                    {detail.discountTotal > 0 && <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Discount</span><span style={{ color: "#e2e8f0" }}>-{fmt(detail.discountTotal)}</span></div>}
                    {detail.taxTotal > 0 && <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Tax</span><span style={{ color: "#e2e8f0" }}>{fmt(detail.taxTotal)}</span></div>}
                    <div className="flex justify-between text-sm font-bold"><span style={{ color: "#e2e8f0" }}>Total</span><span style={{ color: "#e2e8f0" }}>{fmt(detail.totalAmount)}</span></div>
                    {detail.hmoContribution > 0 && <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>HMO covers</span><span style={{ color: "#e2e8f0" }}>-{fmt(detail.hmoContribution)}</span></div>}
                    <div className="flex justify-between text-sm font-bold" style={{ color: "#0ea5e9" }}><span>Patient owes</span><span>{fmt(detail.patientResponsibility)}</span></div>
                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Paid so far</span><span style={{ color: "#10b981" }}>{fmt(detail.amountPaid)}</span></div>
                  </div>
                </div>

                {detail.status !== "void" && detail.status !== "paid" && (
                  <form onSubmit={handleRecordPayment} className="space-y-2 rounded-xl p-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div className="text-xs font-bold" style={{ color: "#10b981" }}>Record payment</div>
                    <div className="flex gap-2">
                      <input
                        type="number" min={0} step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                        placeholder={`Up to ${fmt(detail.totalAmount - detail.amountPaid)}`}
                        className="flex-1 text-xs rounded-lg px-2.5 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                      />
                      <select
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value as any }))}
                        className="text-xs rounded-lg px-2 py-2 bg-black/30 border border-white/10 text-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="pos">POS</option>
                        <option value="bank-transfer">Bank transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <input
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))}
                      placeholder="Reference (optional)"
                      className="w-full text-xs rounded-lg px-2.5 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                    />
                    {paymentError && <div className="text-[11px]" style={{ color: "#ef4444" }}>{paymentError}</div>}
                    <button
                      type="submit"
                      disabled={recordingPayment || !paymentForm.amount}
                      className="w-full py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      style={{ background: "#10b981" }}
                    >
                      {recordingPayment ? "Recording…" : "Record payment"}
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleSend(false)} disabled={sendingAction === "send"} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold cursor-pointer" style={{ background: "rgba(14,165,233,0.12)", color: "#0ea5e9" }}>
                    <Send size={12} /> Resend
                  </button>
                  <button onClick={() => handleSend(true)} disabled={sendingAction === "remind" || detail.status === "paid"} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                    <Bell size={12} /> Remind
                  </button>
                  <button onClick={() => window.print()} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold cursor-pointer" style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}>
                    <Printer size={12} /> Print
                  </button>
                  <button onClick={handleVoid} disabled={detail.status === "void" || detail.amountPaid > 0} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                    <Ban size={12} /> Void
                  </button>
                </div>

                <div className="rounded-xl p-3 flex flex-col items-center gap-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="bg-white p-2.5 rounded-lg">
                    <QRCode value={`${window.location.origin}/verify/${detail.invoiceNumber}`} size={100} />
                  </div>
                  <p className="text-[10px] text-center" style={{ color: "#64748b" }}>
                    Scan to verify this invoice is genuine — printed on the invoice for auditors, HMOs, or banks to confirm authenticity.
                  </p>
                </div>

                {detail.receipts.length > 0 && (
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Receipts</div>
                    {detail.receipts.map((r) => (
                      <div key={r._id} className="flex items-center justify-between text-xs py-1.5" style={{ color: "#cbd5e1" }}>
                        <span className="flex items-center gap-1.5"><Receipt size={11} /> {r.receiptNumber}</span>
                        <span>{fmt(r.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      )}

      {/* New invoice / checkout modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Checkout Patient</h3>
                <p className="text-xs text-slate-400">Pull unbilled charges and issue a clinical invoice</p>
              </div>
              <button
                onClick={() => {
                  setIsNewModalOpen(false);
                  setSelectedPatient(null);
                  setLineItems([]);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step flow pill indicator */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold ${!selectedPatient ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "text-slate-400"}`}>
                <span className="w-4 h-4 rounded-full bg-sky-500/30 text-sky-200 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Select Patient</span>
              </div>
              <span className="text-slate-600">→</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold ${selectedPatient ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "text-slate-500"}`}>
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Review & Itemize Charges</span>
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Patient Search <span className="text-rose-400">*</span>
                </label>
                <PatientSearchPicker
                  open={isNewModalOpen}
                  enabled={true}
                  searchPatientRequest={searchPatientRequest}
                  onSelect={setSelectedPatient}
                />
              </div>

              {selectedPatient && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-sky-300">Selected Patient</p>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedPatient.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setLineItems([]);
                      setSuggestions([]);
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  >
                    Change patient
                  </button>
                </div>
              )}

              {loadingSuggestions && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-center gap-2.5 text-xs text-slate-300">
                  <Loader2 size={15} className="animate-spin text-sky-400" />
                  <span>Pulling unbilled lab orders, pharmacy prescriptions, and radiology studies…</span>
                </div>
              )}

              {!selectedPatient && !loadingSuggestions && (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
                    <Receipt size={18} />
                  </div>
                  <div className="text-xs font-bold text-slate-300">Charges Review Step</div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Search and select a patient above. WelliRecord will automatically retrieve all pending unbilled orders and let you customize discounts, taxes, and HMO coverage before issuing the invoice.
                  </p>
                </div>
              )}

              {selectedPatient && !loadingSuggestions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Billable Line Items</div>
                      <p className="text-[11px] text-slate-400">Uncheck items to exclude or adjust prices directly</p>
                    </div>
                    <button
                      type="button"
                      onClick={addManualLineItem}
                      className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                      <Plus size={13} /> Add manual item
                    </button>
                  </div>

                  {lineItems.length === 0 && (
                    <div className="rounded-lg p-3 bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <span>No unbilled clinical orders found for this patient.</span>
                      <button
                        type="button"
                        onClick={addManualLineItem}
                        className="text-sky-400 font-bold hover:underline cursor-pointer"
                      >
                        Add custom charge
                      </button>
                    </div>
                  )}

                  {lineItems.map((li, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl p-2.5 transition-colors"
                      style={{
                        background: li.included ? "rgba(14,165,233,0.06)" : "rgba(255,255,255,0.02)",
                        border: li.included ? "1px solid rgba(14,165,233,0.2)" : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={li.included}
                        onChange={(e) => updateLineItem(idx, { included: e.target.checked })}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <input
                          value={li.description}
                          onChange={(e) => updateLineItem(idx, { description: e.target.value })}
                          placeholder="Item description (e.g., General Consultation)"
                          disabled={li.sourceType !== "manual"}
                          className="w-full text-xs rounded-md px-2 py-1.5 bg-black/40 border border-white/10 text-white placeholder:text-slate-500 disabled:opacity-75"
                        />
                        {li.sourceType !== "manual" && (
                          <span className="text-[10px] font-mono text-sky-400/80 px-1 mt-0.5 inline-block">
                            Auto-pulled from {li.sourceType.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <select
                        value={li.category}
                        onChange={(e) => updateLineItem(idx, { category: e.target.value as LineItemCategory })}
                        className="text-xs rounded-md px-1.5 py-1.5 bg-black/40 border border-white/10 text-white w-28"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="w-16">
                        <input
                          type="number"
                          min={1}
                          value={li.quantity}
                          onChange={(e) => updateLineItem(idx, { quantity: Number(e.target.value) || 1 })}
                          placeholder="Qty"
                          className="w-full text-xs rounded-md px-2 py-1.5 bg-black/40 border border-white/10 text-white text-center"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          min={0}
                          value={li.unitPrice === 0 ? "" : li.unitPrice}
                          onChange={(e) => updateLineItem(idx, { unitPrice: e.target.value === "" ? 0 : Number(e.target.value) })}
                          placeholder="₦ Price"
                          className="w-full text-xs rounded-md px-2 py-1.5 bg-black/40 border border-white/10 text-white placeholder:text-slate-500 text-right font-medium"
                        />
                      </div>
                      {li.sourceType === "manual" ? (
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tax Total (₦)</label>
                      <input
                        type="number"
                        min={0}
                        value={taxTotal === 0 ? "" : taxTotal}
                        onChange={(e) => setTaxTotal(e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="0"
                        className="w-full text-xs rounded-md px-2.5 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">HMO Contribution (₦)</label>
                      <input
                        type="number"
                        min={0}
                        value={hmoContribution === 0 ? "" : hmoContribution}
                        onChange={(e) => setHmoContribution(e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="0"
                        className="w-full text-xs rounded-md px-2.5 py-2 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    HMO coverage is entered manually — live payer adjudication is not yet integrated.
                  </p>

                  <div className="rounded-xl p-3.5 space-y-1.5 bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Subtotal ({activeLineItems.length} items)</span><span className="text-white font-medium">{fmt(subtotal)}</span></div>
                    {discountTotal > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">Discount</span><span className="text-white">-{fmt(discountTotal)}</span></div>}
                    {taxTotal > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">Tax</span><span className="text-white">+{fmt(taxTotal)}</span></div>}
                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-800"><span className="text-slate-300">Gross Total</span><span className="text-white">{fmt(totalAmount)}</span></div>
                    {hmoContribution > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">HMO Deductions</span><span className="text-slate-300">-{fmt(hmoContribution)}</span></div>}
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-800" style={{ color: "#0ea5e9" }}>
                      <span>Patient Responsibility</span>
                      <span>{fmt(patientResponsibility)}</span>
                    </div>
                  </div>
                </div>
              )}

              {createError && (
                <div className="text-xs rounded-lg px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  {createError}
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={creating || !selectedPatient || activeLineItems.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${
                    !selectedPatient || activeLineItems.length === 0
                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70"
                      : "bg-sky-500 hover:bg-sky-400 shadow-lg shadow-sky-500/20 cursor-pointer"
                  }`}
                >
                  {creating ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {!selectedPatient
                    ? "Select a Patient to Review Charges"
                    : activeLineItems.length === 0
                    ? "Add at Least 1 Line Item"
                    : `Issue Invoice · ${fmt(patientResponsibility)}`}
                </button>

                {!selectedPatient && (
                  <p className="text-[11px] text-center text-slate-500">
                    Search and select a patient above to review unbilled charges and enable invoice generation.
                  </p>
                )}
                {selectedPatient && activeLineItems.length === 0 && (
                  <p className="text-[11px] text-center text-amber-400/80">
                    Include or add at least one line item before issuing the invoice.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
