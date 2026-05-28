import React, { useMemo, useState } from 'react';
import { billingApi } from '@/shared/api/billingApi';
import { CreditCard, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

function fmt(kobo: number) {
    return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

function formatDate(value: string | number | Date) {
    return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    paid: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    disputed: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

const SCENARIOS = [
    { id: 'baseline', label: 'Baseline', description: 'Current collections run rate based on existing invoices.', multiplier: 0.88, mrrFactor: 1.0 },
    { id: 'delinquent', label: 'Delinquent', description: 'Higher overdue exposure reduces expected cash flow.', multiplier: 0.68, mrrFactor: 0.92 },
    { id: 'recovery', label: 'Recovery', description: 'Improved collections bring cash flow and revenue back on track.', multiplier: 0.98, mrrFactor: 1.05 },
] as const;

type ScenarioId = (typeof SCENARIOS)[number]['id'];

export function BillingDashboardPage() {
    const [activeScenario, setActiveScenario] = useState<ScenarioId>('baseline');
    const rev = billingApi.getRevenueSummary();
    const invoices = billingApi.getAllInvoices();
    const COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#f472b6'];

    const totalInvoiceKobo = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdueAmountKobo = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0);
    const pendingAmountKobo = invoices.filter(i => i.status === 'pending').reduce((sum, invoice) => sum + invoice.amount, 0);

    const upcomingDue = useMemo(() => {
        const today = new Date();
        return invoices
            .filter(inv => inv.status !== 'paid')
            .filter(inv => new Date(inv.dueAt) >= today && new Date(inv.dueAt) <= new Date(today.getTime() + 7 * 86400000))
            .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
            .slice(0, 4);
    }, [invoices]);

    const scenario = SCENARIOS.find(s => s.id === activeScenario) ?? SCENARIOS[0];
    const simulation = useMemo(() => ({
        forecastKobo: Math.round(totalInvoiceKobo * scenario.multiplier),
        projectedMrrKobo: Math.round(rev.mrrKobo * scenario.mrrFactor),
        collectionRate: Math.round(scenario.multiplier * 100),
        riskLabel: scenario.id === 'delinquent' ? 'Elevated risk' : scenario.id === 'recovery' ? 'Improving' : 'Stable',
    }), [scenario, totalInvoiceKobo, rev.mrrKobo]);

    const invoiceStatusCounts = useMemo(() => {
        return invoices.reduce((acc, invoice) => {
            acc[invoice.status] = (acc[invoice.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [invoices]);

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Billing Simulation</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Explore invoice mix, overdue exposure, and collection forecasts across simulated scenarios.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Monthly Recurring Revenue', value: fmt(rev.mrrKobo), icon: CreditCard, color: '#34d399' },
                    { label: 'Annual Recurring Revenue', value: fmt(rev.arrKobo), icon: TrendingUp, color: '#38bdf8' },
                    { label: 'Outstanding Invoices', value: fmt(pendingAmountKobo + overdueAmountKobo), icon: Users, color: '#f59e0b' },
                    { label: 'Overdue Value', value: fmt(overdueAmountKobo), icon: ArrowUpRight, color: '#ef4444' },
                ].map(k => (
                    <div key={k.label} className="rounded-2xl p-5" style={{ background: '#111827', border: `1px solid ${k.color}22` }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>{k.label}</div>
                            <k.icon size={16} style={{ color: k.color }} />
                        </div>
                        <div className="text-2xl font-black" style={{ color: '#e5e7eb' }}>{k.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-6">
                    <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 className="font-bold text-sm mb-5" style={{ color: '#9ca3af' }}>Revenue by Plan</h2>
                        <div className="space-y-4">
                            {rev.planBreakdown.map((p, i) => {
                                const pct = Math.round((p.revenueKobo / rev.mrrKobo) * 100);
                                return (
                                    <div key={p.planName}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span style={{ color: '#d1d5db' }}>{p.planName}</span>
                                            <span className="font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                                                {fmt(p.revenueKobo)} · {p.count} subs · {pct}%
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>All Invoices</h2>
                            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Sort through the full invoice book and follow collection status.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {['Invoice ID', 'Customer', 'Plan', 'Amount', 'Status', 'Due Date'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                                    {invoices.map(inv => {
                                        const s = STATUS_STYLES[inv.status] ?? STATUS_STYLES.pending;
                                        return (
                                            <tr key={inv.id} className="hover:bg-white/4 transition-colors">
                                                <td className="px-5 py-3 font-mono text-xs" style={{ color: '#6b7280' }}>{inv.reference ?? inv.id}</td>
                                                <td className="px-5 py-3 font-semibold" style={{ color: '#e5e7eb' }}>{inv.orgId ?? inv.patientId ?? '—'}</td>
                                                <td className="px-5 py-3" style={{ color: '#9ca3af' }}>{inv.planName}</td>
                                                <td className="px-5 py-3 font-bold" style={{ color: '#34d399' }}>{fmt(inv.amount)}</td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                                                        style={{ background: s.bg, color: s.color }}>{inv.status}</span>
                                                </td>
                                                <td className="px-5 py-3 text-xs" style={{ color: '#6b7280' }}>
                                                    {formatDate(inv.dueAt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                                <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>Scenario Simulation</h2>
                                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Toggle forecasts to see how overdue invoices and recovery change cash flow.</p>
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.24em] font-semibold" style={{ color: '#d1d5db' }}>Live</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {SCENARIOS.map(s => (
                                <button
                                    key={s.id}
                                    type="button"
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
                                    <div className="text-[11px] uppercase tracking-[0.24em] font-bold" style={{ color: '#6b7280' }}>Projected cash flow</div>
                                    <div className="text-3xl font-black mt-2" style={{ color: '#e5e7eb' }}>{fmt(simulation.forecastKobo)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-semibold uppercase" style={{ color: '#34d399' }}>{simulation.collectionRate}%</div>
                                    <div className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>expected collections</div>
                                </div>
                            </div>
                            <div className="text-xs leading-5" style={{ color: '#9ca3af' }}>{scenario.description}</div>
                        </div>

                        <div className="grid gap-3 mt-5">
                            {[
                                { label: 'Projected MRR', detail: fmt(simulation.projectedMrrKobo), color: '#38bdf8' },
                                { label: 'Open invoices', detail: invoices.filter(i => i.status !== 'paid').length, color: '#f59e0b' },
                                { label: 'Risk posture', detail: simulation.riskLabel, color: '#f472b6' },
                            ].map(item => (
                                <div key={item.label} className="rounded-2xl p-4" style={{ background: '#111827', border: `1px solid ${item.color}22` }}>
                                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>{item.label}</div>
                                    <div className="mt-3 text-lg font-black" style={{ color: '#e5e7eb' }}>{item.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 className="font-bold text-sm mb-4" style={{ color: '#9ca3af' }}>Invoice Aging Mix</h2>
                        <div className="space-y-3">
                            {Object.entries(invoiceStatusCounts).map(([status, count]) => {
                                const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
                                const pct = Math.round((count / invoices.length) * 100);
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs mb-1" style={{ color: '#d1d5db' }}>
                                            <span className="capitalize">{status}</span>
                                            <span>{count} invoices · {pct}%</span>
                                        </div>
                                        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>Due Soon</h2>
                                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Invoices due within the next 7 days.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {upcomingDue.length ? upcomingDue.map(inv => {
                                const s = STATUS_STYLES[inv.status] ?? STATUS_STYLES.pending;
                                return (
                                    <div key={inv.id} className="rounded-2xl p-4" style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.12)' }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{inv.planName}</div>
                                                <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>{inv.orgId ?? inv.patientId ?? 'Unknown customer'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black" style={{ color: '#34d399' }}>{fmt(inv.amount)}</div>
                                                <div className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>{formatDate(inv.dueAt)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>{inv.status}</div>
                                    </div>
                                );
                            }) : (
                                <div className="text-sm" style={{ color: '#9ca3af' }}>No invoices are due in the next 7 days.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
