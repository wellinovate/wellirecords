import React, { useEffect, useMemo, useState } from 'react';
import {
    CheckCircle, Clock, AlertCircle, Receipt, FileText, Loader2, Ban, X,
} from 'lucide-react';
import { getMyInvoices, Invoice, InvoiceStatus } from '@/shared/api/billingApiV2';

const STATUS_CFG: Record<InvoiceStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    unpaid: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock, label: 'Unpaid' },
    'partially-paid': { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: AlertCircle, label: 'Part-paid' },
    paid: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle, label: 'Paid' },
    void: { color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: Ban, label: 'Void' },
};

function fmt(amount: number) {
    return `₦${(amount || 0).toLocaleString('en-NG')}`;
}

function orgName(o: Invoice['organizationId']) {
    if (typeof o === 'string') return o;
    return o?.organizationName || 'Your provider';
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BillingPatientPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewing, setViewing] = useState<Invoice | null>(null);

    useEffect(() => {
        getMyInvoices()
            .then((res) => setInvoices(res.items))
            .catch(() => setError('Could not load your invoices right now.'))
            .finally(() => setLoading(false));
    }, []);

    const outstanding = useMemo(
        () => invoices.filter((i) => i.status === 'unpaid' || i.status === 'partially-paid')
            .reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0),
        [invoices],
    );
    const paidTotal = useMemo(
        () => invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amountPaid, 0),
        [invoices],
    );
    const hmoCovered = useMemo(
        () => invoices.reduce((sum, i) => sum + (i.hmoContribution || 0), 0),
        [invoices],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={26} className="animate-spin" style={{ color: '#0ea5e9' }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Billing & Payments</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Invoices, receipts, and balances from your providers.</p>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{fmt(outstanding)}</div>
                    <div className="mt-2 text-sm text-slate-500">Across unpaid and part-paid invoices.</div>
                </div>
                <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Paid</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{fmt(paidTotal)}</div>
                    <div className="mt-2 text-sm text-slate-500">Total settled across all invoices.</div>
                </div>
                <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">HMO Covered</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{fmt(hmoCovered)}</div>
                    <div className="mt-2 text-sm text-slate-500">Contributions applied by your insurer.</div>
                </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                <h2 className="text-base font-bold text-slate-900 mb-1">Your invoices</h2>
                <p className="text-sm text-slate-500 mb-5">Tap an invoice to see the full breakdown and any receipts.</p>

                {invoices.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No invoices yet.</p>
                ) : (
                    <div className="space-y-3">
                        {invoices.map((inv) => {
                            const st = STATUS_CFG[inv.status];
                            const StIcon = st.icon;
                            const remaining = inv.totalAmount - inv.amountPaid;
                            return (
                                <button
                                    key={inv.id}
                                    onClick={() => setViewing(inv)}
                                    className="w-full text-left grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto] cursor-pointer hover:shadow-sm transition-shadow"
                                    style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-slate-500">{inv.invoiceNumber}</span>
                                            <span
                                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                                style={{ color: st.color, background: st.bg }}
                                            >
                                                <StIcon size={10} /> {st.label}
                                            </span>
                                        </div>
                                        <div className="font-bold text-slate-900 mt-1">{orgName(inv.organizationId)}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{formatDate(inv.createdAt)} · {inv.lineItems.length} item{inv.lineItems.length !== 1 ? 's' : ''}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-900">{fmt(inv.totalAmount)}</div>
                                        {inv.hmoContribution > 0 && (
                                            <div className="text-xs text-slate-500">HMO: {fmt(inv.hmoContribution)}</div>
                                        )}
                                        {remaining > 0 && inv.status !== 'void' && (
                                            <div className="text-xs font-bold" style={{ color: '#f59e0b' }}>You pay: {fmt(remaining)}</div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {viewing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-mono text-xs text-slate-500">{viewing.invoiceNumber}</div>
                                <h3 className="text-lg font-bold text-slate-900">{orgName(viewing.organizationId)}</h3>
                            </div>
                            <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
                        </div>

                        <div className="space-y-1.5 mb-4">
                            {viewing.lineItems.map((li) => (
                                <div key={li.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{li.description} ×{li.quantity}</span>
                                    <span className="text-slate-900 font-medium">{fmt(li.lineTotal || li.quantity * li.unitPrice - li.discount)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 pt-3 space-y-1.5">
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-900">{fmt(viewing.subtotal)}</span></div>
                            {viewing.discountTotal > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="text-slate-900">-{fmt(viewing.discountTotal)}</span></div>}
                            {viewing.taxTotal > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Tax</span><span className="text-slate-900">{fmt(viewing.taxTotal)}</span></div>}
                            <div className="flex justify-between text-base font-bold"><span className="text-slate-900">Total</span><span className="text-slate-900">{fmt(viewing.totalAmount)}</span></div>
                            {viewing.hmoContribution > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">HMO covers</span><span className="text-slate-900">-{fmt(viewing.hmoContribution)}</span></div>}
                            <div className="flex justify-between text-base font-bold" style={{ color: '#0ea5e9' }}><span>You pay</span><span>{fmt(viewing.patientResponsibility)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Paid so far</span><span style={{ color: '#10b981' }}>{fmt(viewing.amountPaid)}</span></div>
                        </div>

                        {viewing.status !== 'paid' && viewing.status !== 'void' && (
                            <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
                                Outstanding balance of {fmt(viewing.totalAmount - viewing.amountPaid)}. Settle this at {orgName(viewing.organizationId)} —
                                online payment isn't available yet, so payment is collected in person or by bank transfer at the facility.
                            </div>
                        )}

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border cursor-pointer"
                                style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
                            >
                                <FileText size={14} /> Print / Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
