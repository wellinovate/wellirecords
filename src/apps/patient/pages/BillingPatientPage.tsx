import React, { useMemo, useState } from 'react';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const INVOICES = [
    { id: 'inv001', date: '2026-03-01', facility: 'Lagos General Hospital', service: 'Outpatient Consultation', amount: 5000, status: 'paid', receipt: true },
    { id: 'inv002', date: '2026-02-15', facility: 'CityLab Diagnostics', service: 'Full Blood Count + Lipid Panel', amount: 12500, status: 'paid', receipt: true },
    { id: 'inv003', date: '2026-02-01', facility: 'WelliRecord Premium', service: 'Premium Plan – February', amount: 5000, status: 'paid', receipt: true },
    { id: 'inv004', date: '2026-03-01', facility: 'WelliRecord Premium', service: 'Premium Plan – March', amount: 5000, status: 'pending', receipt: false },
    { id: 'inv005', date: '2026-03-08', facility: 'Apex Care Clinic', service: 'Telemedicine Consult', amount: 8500, status: 'pending', receipt: false },
    { id: 'inv006', date: '2026-02-08', facility: 'Pearl Radiology', service: 'Chest X-ray', amount: 9500, status: 'overdue', receipt: false },
];

const STATUS_CFG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    paid: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle, label: 'Paid' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock, label: 'Pending' },
    overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertCircle, label: 'Overdue' },
};

const SCENARIOS = [
    { id: 'current', label: 'Current', description: 'Your current balance, due dates, and likely payment outlook.', multiplier: 1.0, cashFlowFactor: 1.0 },
    { id: 'fast_pay', label: 'Fast Pay', description: 'If you settle all upcoming invoices this week, your balance drops fast.', multiplier: 0.65, cashFlowFactor: 1.1 },
    { id: 'delay', label: 'Delay', description: 'If payments slip into next month, your forecast increases and risk stays high.', multiplier: 1.25, cashFlowFactor: 0.8 },
] as const;

type ScenarioId = (typeof SCENARIOS)[number]['id'];

function fmt(amount: number) {
    return `₦${amount.toLocaleString('en-NG')}`;
}

function formatDate(value: string | number | Date) {
    return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BillingPatientPage() {
    const [activeScenario, setActiveScenario] = useState<ScenarioId>('current');
    const outstanding = INVOICES.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const paid = INVOICES.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const total = INVOICES.reduce((sum, i) => sum + i.amount, 0);

    const overdueAmount = INVOICES.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
    const dueSoon = useMemo(() => {
        const today = new Date();
        return INVOICES.filter(i => i.status !== 'paid' && new Date(i.date) >= today && new Date(i.date) <= new Date(today.getTime() + 14 * 86400000));
    }, []);

    const scenario = SCENARIOS.find(s => s.id === activeScenario) ?? SCENARIOS[0];
    const simulation = useMemo(() => {
        const projectedBalance = Math.round(outstanding * scenario.multiplier);
        const cashFlow = Math.round((total - projectedBalance) * scenario.cashFlowFactor);
        return {
            projectedBalance,
            cashFlow,
            statusLabel: scenario.id === 'fast_pay' ? 'Improving' : scenario.id === 'delay' ? 'At risk' : 'On track',
        };
    }, [outstanding, total, scenario]);

    return (
        <div className="animate-fade-in space-y-6 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Billing</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Check invoices, receipts, and your payment forecast.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{fmt(outstanding)}</div>
                    <div className="mt-2 text-sm text-slate-500">Current unpaid invoices and overdue items.</div>
                </div>
                <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Paid This Year</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{fmt(paid)}</div>
                    <div className="mt-2 text-sm text-slate-500">Total amount settled in 2026 so far.</div>
                </div>
                <div className="rounded-2xl p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Book</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{INVOICES.length}</div>
                    <div className="mt-2 text-sm text-slate-500">Total invoices recorded in your account.</div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Invoice summary</h2>
                            <p className="text-sm text-slate-500 mt-1">Your latest charges and payment status.</p>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold text-slate-700" style={{ borderColor: '#cbd5e1' }}>
                            <CreditCard size={14} /> Export statements
                        </button>
                    </div>
                    <div className="space-y-3">
                        {INVOICES.map(inv => {
                            const st = STATUS_CFG[inv.status];
                            const StIcon = st.icon;
                            return (
                                <div key={inv.id} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl grid place-items-center" style={{ background: st.bg }}>
                                                <StIcon size={18} style={{ color: st.color }} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{inv.service}</div>
                                                <div className="text-xs text-slate-500 mt-1">{inv.facility} · {formatDate(inv.date)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right md:text-left">
                                        <div className="font-black text-slate-900">{fmt(inv.amount)}</div>
                                        <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-[11px] font-semibold uppercase" style={{ color: st.color }}>
                                            <span className="rounded-full px-2 py-1" style={{ background: st.bg }}>{st.label}</span>
                                            {inv.receipt && (
                                                <button className="rounded-lg p-1" style={{ color: '#64748b' }}>
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

                <div className="space-y-6">
                    <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="mb-5">
                            <h2 className="text-sm font-bold" style={{ color: '#9ca3af' }}>Payment forecast</h2>
                            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Choose a scenario to project your balance and cash movement.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {SCENARIOS.map(s => (
                                <button
                                    type="button"
                                    key={s.id}
                                    onClick={() => setActiveScenario(s.id)}
                                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${activeScenario === s.id ? 'ring-2 ring-cyan-400/40' : 'hover:bg-white/5'}`}
                                    style={{ color: activeScenario === s.id ? '#fff' : '#cbd5e1', background: activeScenario === s.id ? '#0f172a' : 'transparent', border: '1px solid rgba(148,163,184,0.16)' }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <div className="rounded-3xl p-5" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.24em] font-bold" style={{ color: '#6b7280' }}>Projected balance</div>
                                    <div className="text-3xl font-black mt-2" style={{ color: '#e5e7eb' }}>{fmt(simulation.projectedBalance)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-semibold" style={{ color: '#34d399' }}>{fmt(simulation.cashFlow)}</div>
                                    <div className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>potential cash flow</div>
                                </div>
                            </div>
                            <div className="text-xs leading-5" style={{ color: '#9ca3af' }}>{scenario.description}</div>
                        </div>
                        <div className="grid gap-3 mt-5">
                            {[
                                { label: 'Scenario status', value: simulation.statusLabel },
                                { label: 'Outstanding invoices', value: INVOICES.filter(i => i.status !== 'paid').length },
                                { label: 'Overdue amount', value: fmt(overdueAmount) },
                            ].map(item => (
                                <div key={item.label} className="rounded-2xl p-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>{item.label}</div>
                                    <div className="mt-3 text-lg font-black" style={{ color: '#e5e7eb' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                        <h2 className="text-sm font-bold text-slate-900">Due soon</h2>
                        <p className="text-xs text-slate-500 mt-1">Invoices coming due in the next 14 days.</p>
                        <div className="mt-4 space-y-3">
                            {dueSoon.length > 0 ? dueSoon.map(inv => {
                                const st = STATUS_CFG[inv.status];
                                return (
                                    <div key={inv.id} className="rounded-2xl border p-4" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="font-semibold text-slate-900">{inv.service}</div>
                                                <div className="text-xs text-slate-500 mt-1">{inv.facility}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-slate-900">{fmt(inv.amount)}</div>
                                                <div className="text-[11px] text-slate-500 mt-1">{formatDate(inv.date)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: st.bg, color: st.color }}>{st.label}</div>
                                    </div>
                                );
                            }) : (
                                <div className="text-sm text-slate-500">No invoices due in the next two weeks.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
