import React from 'react';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const INVOICES = [
    // { id: 'inv001', date: '2026-03-01', facility: 'Lagos General Hospital', service: 'Outpatient Consultation', amount: 5000, status: 'paid', receipt: true },
    // { id: 'inv002', date: '2026-02-15', facility: 'CityLab Diagnostics', service: 'Full Blood Count + Lipid Panel', amount: 12500, status: 'paid', receipt: true },
    // { id: 'inv003', date: '2026-02-01', facility: 'WelliRecord Premium', service: 'Premium Plan – February', amount: 5000, status: 'paid', receipt: true },
    // { id: 'inv004', date: '2026-03-01', facility: 'WelliRecord Premium', service: 'Premium Plan – March', amount: 5000, status: 'pending', receipt: false },
];

const STATUS_CFG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    paid: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle, label: 'Paid' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock, label: 'Pending' },
    overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertCircle, label: 'Overdue' },
};

export function BillingPatientPage() {
    const outstanding = INVOICES.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const paid = INVOICES.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="animate-fade-in max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Billing</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Invoices, receipts, and outstanding balance.</p>
            </div>

            {/* Balance cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl p-5 text-center" style={{ background: outstanding > 0 ? 'rgba(245,158,11,0.06)' : '#f0fdfa', border: `1px solid ${outstanding > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(13,148,136,0.2)'}` }}>
                    <div className="text-xs font-bold mb-1" style={{ color: '#64748b' }}>Outstanding</div>
                    <div className="text-3xl font-black" style={{ color: outstanding > 0 ? '#f59e0b' : '#10b981' }}>
                        ₦{outstanding.toLocaleString('en-NG')}
                    </div>
                    {outstanding > 0 && (
                        <button className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold"
                            style={{ background: '#f59e0b', color: '#fff' }}>Pay Now</button>
                    )}
                </div>
                <div className="rounded-2xl p-5 text-center border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-xs font-bold mb-1" style={{ color: '#64748b' }}>Total Paid (2026)</div>
                    <div className="text-3xl font-black" style={{ color: '#1e293b' }}>₦{paid.toLocaleString('en-NG')}</div>
                </div>
            </div>

            {/* Invoices */}
            <div className="space-y-2">
                {INVOICES.map(inv => {
                    const st = STATUS_CFG[inv.status];
                    const StIcon = st.icon;
                    return (
                        <div key={inv.id} className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                            style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: st.bg }}>
                                <StIcon size={16} style={{ color: st.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm" style={{ color: '#1e293b' }}>{inv.service}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                                    {inv.facility} · {new Date(inv.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="font-black" style={{ color: '#1e293b' }}>₦{inv.amount.toLocaleString('en-NG')}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                                    {inv.receipt && (
                                        <button className="p-1 rounded-lg" style={{ color: '#94a3b8' }}>
                                            <Download size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
