import React from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Users,
    ArrowUpRight, ArrowDownRight, CreditCard,
    AlertCircle, Download, Calendar, Activity,
    ShieldAlert
} from 'lucide-react';

// --- Types & Mock Data ---

const METRICS = {
    mrr: { value: '₦0', trend: 0, isUp: true },
    arr: { value: '₦0', trend: 0, isUp: true },
    activeSubs: { value: '0', trend: 0, isUp: true },
    newSubs: { value: '0', trend: 0, isUp: true },
    churnRate: { value: '0%', trend: 0, isUp: true },
    arpu: { value: '₦0', trend: 0, isUp: true }
};

const TOP_ORGS: {
    id: number; name: string; plan: string; value: number;
    start: string; renewal: string; daysToRenewal: number;
}[] = [];

const RECENT_TX: {
    id: string; entity: string; amount: number;
    status: string; time: string; gateway: string;
}[] = [];

const RISK_ORGS: {
    id: number; name: string; reason: string;
    valueAtRisk: number; daysOverdue: number;
}[] = [];

// --- Subcomponents ---

function StatCard({ title, data }: { title: string, data: { value: string, trend: number, isUp: boolean } }) {
    const trendColor = data.isUp ? '#10b981' : '#ef4444';
    const TrendIcon = data.trend >= 0 ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="p-5 rounded-2xl" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--sa-muted)' }}>{title}</div>
            <div className="text-2xl font-black mb-2 tracking-tight" style={{ color: '#e2e8f0' }}>{data.value}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--sa-muted)' }}>
                <span>No data yet</span>
            </div>
        </div>
    );
}

// Empty-state chart placeholder — replaces the previous fabricated SVG trend line
function RevenueTrendChart() {
    return (
        <div className="mt-4 h-64 relative w-full flex items-center justify-center">
            <div className="text-center" style={{ color: 'var(--sa-muted)' }}>
                <Activity size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No revenue data yet.</p>
            </div>
        </div>
    );
}

// --- Main Component ---

export function SuperAdminRevenue() {
    return (
        <div className="space-y-6 animate-fade-in pb-20 relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: '#e2e8f0' }}>
                        <DollarSign className="text-emerald-400" size={28} />
                        Platform Revenue Dashboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>Financial performance, MRR growth, and B2B subscription tracking.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-white/10 border"
                    style={{ color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Download size={16} /> Export Financial Report
                </button>
            </div>

            {/* Top Stat Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard title="Total MRR" data={METRICS.mrr} />
                <StatCard title="Annual Run Rate (ARR)" data={METRICS.arr} />
                <StatCard title="Active Subscriptions" data={METRICS.activeSubs} />
                <StatCard title="New (This Month)" data={METRICS.newSubs} />
                <StatCard title="Monthly Churn Rate" data={METRICS.churnRate} />
                <StatCard title="Average Rev per User" data={METRICS.arpu} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Main Trend Line Chart - Spans 2 columns */}
                <div className="xl:col-span-2 rounded-2xl p-6 flex flex-col" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h2 className="text-lg font-black" style={{ color: '#e2e8f0' }}>Revenue Growth Tracker</h2>
                            <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>12-month trailing MRR vs New Revenue.</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-indigo-300">
                                <Activity size={12} /> Total MRR
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                        <RevenueTrendChart />
                    </div>
                </div>

                {/* Sub Distribution / State Map */}
                <div className="rounded-2xl p-6 flex flex-col" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                    <h2 className="text-lg font-black mb-1" style={{ color: '#e2e8f0' }}>Sub Distribution</h2>
                    <p className="text-xs mb-6" style={{ color: 'var(--sa-muted)' }}>Revenue breakdown by product tier.</p>

                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Enterprise Org</span>
                                <span>0% (₦0)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Pro Org</span>
                                <span>0% (₦0)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Basic/Starter Org</span>
                                <span>0% (₦0)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Patient Premium</span>
                                <span>0% (₦0)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-purple-400 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sa-muted)' }}>Top Geographic Regions</div>
                        <div className="text-xs" style={{ color: 'var(--sa-muted)' }}>No data yet.</div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Top Paying Organisations / Renewals */}
                <div className="xl:col-span-2 rounded-2xl overflow-hidden shadow-lg flex flex-col" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                    <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(8, 14, 32, 0.4)' }}>
                        <h2 className="text-lg font-black" style={{ color: '#e2e8f0' }}>Top Paying Organisations & Renewals</h2>
                        <p className="text-xs mt-1" style={{ color: 'var(--sa-muted)' }}>Key accounts ordered by MRR value. Amber rows indicate near-term renewal risk.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Organisation</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Value (MRR)</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest text-center" style={{ color: 'var(--sa-muted)' }}>Plan</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Renewal Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                {TOP_ORGS.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center" style={{ color: 'var(--sa-muted)' }}>
                                            No paying organisations yet.
                                        </td>
                                    </tr>
                                ) : (
                                    TOP_ORGS.map((org) => {
                                        const isAtRisk = org.daysToRenewal < 30;
                                        return (
                                            <tr key={org.id} className="transition-colors hover:bg-white/[0.02]"
                                                style={{ background: isAtRisk ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                                                <td className="p-4">
                                                    <div className="text-sm font-bold flex items-center gap-2" style={{ color: isAtRisk ? '#fcd34d' : '#e2e8f0' }}>
                                                        {isAtRisk && <AlertCircle size={14} className="text-amber-500" />}
                                                        {org.name}
                                                    </div>
                                                    <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--sa-muted)' }}>Start: {org.start}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-mono font-bold text-emerald-400">₦{(org.value).toLocaleString()}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                                                        style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                                                        {org.plan}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm" style={{ color: isAtRisk ? '#fcd34d' : '#cbd5e1' }}>
                                                        {new Date(org.renewal).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase mt-0.5" style={{ color: isAtRisk ? '#ef4444' : 'var(--sa-muted)' }}>
                                                        {isAtRisk ? `${org.daysToRenewal} Days (Action Req.)` : `in ${org.daysToRenewal} days`}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Revenue at Risk & Paystack Feed */}
                <div className="space-y-6 flex flex-col">

                    {/* Revenue At Risk */}
                    <div className="rounded-2xl p-5 border relative overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                        <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: '#f87171' }}>
                            <ShieldAlert size={16} /> REVENUE AT RISK
                        </h3>

                        <div className="space-y-4">
                            {RISK_ORGS.length === 0 ? (
                                <div className="text-xs" style={{ color: 'var(--sa-muted)' }}>No accounts at risk.</div>
                            ) : (
                                RISK_ORGS.map(risk => (
                                    <div key={risk.id} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold" style={{ color: '#e2e8f0' }}>{risk.name}</span>
                                            <span className="text-xs font-mono font-bold text-red-400">₦{(risk.valueAtRisk / 1000).toFixed(0)}k</span>
                                        </div>
                                        <div className="text-[10px]" style={{ color: 'var(--sa-muted)' }}>
                                            {risk.reason} • <span className="text-amber-500 font-medium">{risk.daysOverdue} days overdue</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Transaction Feed */}
                    <div className="rounded-2xl flex flex-col overflow-hidden min-h-0 flex-1" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(8, 14, 32, 0.4)' }}>
                            <h3 className="text-sm font-black" style={{ color: '#e2e8f0' }}>Recent Transactions</h3>
                            <button className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">View All Gateway</button>
                        </div>
                        <div className="p-4 space-y-4">
                            {RECENT_TX.length === 0 ? (
                                <div className="text-xs" style={{ color: 'var(--sa-muted)' }}>No transactions yet.</div>
                            ) : (
                                RECENT_TX.map(tx => (
                                    <div key={tx.id} className="flex items-center gap-3">
                                        <div className="p-2 rounded-full" style={{ background: tx.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                            {tx.status === 'success' ? (
                                                <TrendingUp size={14} className="text-emerald-500" />
                                            ) : (
                                                <TrendingDown size={14} className="text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="text-xs font-bold truncate" style={{ color: '#e2e8f0' }}>{tx.entity}</span>
                                                <span className={`text-xs font-mono font-bold ${tx.status === 'success' ? 'text-emerald-400' : 'text-slate-400 line-through'}`}>
                                                    ₦{(tx.amount / 1000).toFixed(0)}k
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span style={{ color: 'var(--sa-muted)' }}>{tx.id} • {tx.gateway}</span>
                                                <span style={{ color: '#6b7280' }}>{tx.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}