import React from 'react';
import { billingApi } from '@/shared/api/billingApi';
import { CreditCard, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

function fmt(kobo: number) {
    return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    paid: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    disputed: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

export function BillingDashboardPage() {
    const rev = billingApi.getRevenueSummary();
    const invoices = billingApi.getAllInvoices();
    const COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#f472b6'];

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Revenue Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Subscription revenue, invoices, and plan performance.</p>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Monthly Recurring Revenue', value: fmt(rev.mrrKobo), icon: CreditCard, color: '#34d399' },
                    { label: 'Annual Recurring Revenue', value: fmt(rev.arrKobo), icon: TrendingUp, color: '#38bdf8' },
                    { label: 'New Subscriptions', value: rev.newSubscriptionsThisMonth, icon: Users, color: '#a78bfa' },
                    { label: 'Churned (30d)', value: rev.churnedThisMonth, icon: ArrowUpRight, color: '#ef4444' },
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

            {/* Plan breakdown */}
            <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(52,211,153,0.12)' }}>
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

            {/* Invoices table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <h2 className="font-bold text-sm" style={{ color: '#9ca3af' }}>All Invoices</h2>
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
                                            {new Date(inv.dueAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
