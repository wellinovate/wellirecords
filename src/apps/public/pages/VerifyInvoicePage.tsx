import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, XCircle, Loader2, CheckCircle, Clock, Ban } from "lucide-react";
import { verifyInvoice, InvoiceVerification, InvoiceStatus } from "@/shared/api/billingApiV2";

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  unpaid: { label: "Unpaid", color: "#f59e0b", icon: Clock },
  "partially-paid": { label: "Partially paid", color: "#3b82f6", icon: Clock },
  paid: { label: "Paid in full", color: "#10b981", icon: CheckCircle },
  void: { label: "Void", color: "#64748b", icon: Ban },
};

function fmt(n: number) {
  return `₦${(n || 0).toLocaleString("en-NG")}`;
}

export default function VerifyInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [record, setRecord] = useState<InvoiceVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    verifyInvoice(token)
      .then(setRecord)
      .catch((err) => setError(err?.response?.data?.message || "This invoice could not be verified."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
        {loading && <Loader2 size={32} className="mx-auto animate-spin text-slate-400" />}

        {!loading && error && (
          <>
            <XCircle size={40} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-lg font-bold text-slate-900 mb-2">Not verified</h1>
            <p className="text-sm text-slate-600">{error}</p>
          </>
        )}

        {!loading && record && (
          <>
            <ShieldCheck size={40} className="mx-auto mb-4 text-emerald-500" />
            <h1 className="text-lg font-bold text-slate-900 mb-1">Invoice verified</h1>
            <p className="text-xs text-slate-500 mb-6">
              This confirms a genuine WelliRecord invoice — compare these details against the printed copy.
            </p>

            <div className="text-left space-y-3 rounded-xl border border-slate-200 p-4">
              <Row label="Invoice #" value={record.invoiceNumber} mono />
              <Row label="Patient" value={record.patientName} />
              <Row label="Issued by" value={record.organizationName} />
              <Row label="Amount" value={fmt(record.totalAmount)} />
              <Row label="Issued" value={new Date(record.issuedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-500">Status</span>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                  style={{ color: STATUS_META[record.status].color, background: `${STATUS_META[record.status].color}18` }}
                >
                  {STATUS_META[record.status].label}
                </span>
              </div>
            </div>

            <p className="mt-5 text-[11px] text-slate-400">
              For your privacy, this page shows only what's already printed on the invoice — no clinical details.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className={`text-sm text-slate-900 ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}
