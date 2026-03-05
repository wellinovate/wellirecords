import React from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Users,
    ArrowUpRight, ArrowDownRight, CreditCard,
    AlertCircle, Download, Calendar, Activity,
    ShieldAlert
} from 'lucide-react';

// --- Types & Mock Data ---

const METRICS = {
    mrr: { value: '₦42,500,000', trend: 5.2, isUp: true },
    arr: { value: '₦510,000,000', trend: 6.8, isUp: true },
    activeSubs: { value: '1,245', trend: 2.1, isUp: true },
    newSubs: { value: '42', trend: -1.5, isUp: false }, // Slightly fewer new subs than last month
    churnRate: { value: '1.2%', trend: -0.3, isUp: true }, // Negative trend is good for churn
    arpu: { value: '₦34,136', trend: 1.1, isUp: true }
};

const TOP_ORGS = [
    { id: 1, name: 'Lagos General Hospital', plan: 'Enterprise', value: 1500000, start: 'Jan 2024', renewal: '2026-12-15', daysToRenewal: 286 },
    { id: 2, name: 'Reddington Health', plan: 'Enterprise', value: 1200000, start: 'Mar 2024', renewal: '2026-06-20', daysToRenewal: 108 },
    { id: 3, name: 'Avon Medical Practice', plan: 'Enterprise', value: 850000, start: 'Jul 2025', renewal: '2026-03-22', daysToRenewal: 18 }, // < 30 days!
    { id: 4, name: 'CityLab Diagnostics', plan: 'Pro', value: 450000, start: 'Sep 2024', renewal: '2026-09-01', daysToRenewal: 181 },
    { id: 5, name: 'MedPlus Pharmacy Chain', plan: 'Pro', value: 380000, start: 'Nov 2025', renewal: '2026-03-15', daysToRenewal: 11 }, // < 30 days!
];

const RECENT_TX = [
    { id: 'tx_p9q8', entity: 'Lagos General Hospital', amount: 1500000, status: 'success', time: '10 mins ago', gateway: 'Paystack' },
    { id: 'tx_k2m1', entity: 'Lifecare Family Clinic', amount: 50000, status: 'failed', time: '1 hour ago', gateway: 'Flutterwave' },
    { id: 'tx_x7v4', entity: 'Dr. Sarah Ndubuisi', amount: 15000, status: 'success', time: '2 hours ago', gateway: 'Paystack' },
    { id: 'tx_r5n9', entity: 'Alpha Diagnostics', amount: 250000, status: 'success', time: '5 hours ago', gateway: 'Paystack' },
    { id: 'tx_f3c2', entity: 'Optimal Health', amount: 125000, status: 'success', time: '8 hours ago', gateway: 'Paystack' },
];

const RISK_ORGS = [
    { id: 1, name: 'Lifecare Family Clinic', reason: 'Failed Payment (Insufficient Funds)', valueAtRisk: 50000, daysOverdue: 2 },
    { id: 2, name: 'Crescent Hospital', reason: 'Card Expired (Not Updated)', valueAtRisk: 350000, daysOverdue: 14 },
    { id: 3, name: 'St. Nicholas Lab', reason: 'Invoice Unpaid (Net-30)', valueAtRisk: 850000, daysOverdue: 5 },
];

// --- Subcomponents ---

function StatCard({ title, data }: { title: string, data: { value: string, trend: number, isUp: boolean } }) {
    const trendColor = data.isUp ? '#10b981' : '#ef4444';
    const TrendIcon = data.trend >= 0 ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="p-5 rounded-2xl" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--sa-muted)' }}>{title}</div>
            <div className="text-2xl font-black mb-2 tracking-tight" style={{ color: '#e2e8f0' }}>{data.value}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: trendColor }}>
                <TrendIcon size={14} />
                <span>{Math.abs(data.trend)}% vs last month</span>
            </div>
        </div>
    );
}

// A simple SVG-based mock chart component
function RevenueTrendChart() {
    return (
        <div className="mt-4 h-64 relative w-full flex items-end">
            <svg viewBox="0 0 1000 250" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="gradient-mrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="1000" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

                {/* SVG Path representing the trend */}
                <path d="M0 250 L0 180 C 100 170, 200 190, 300 150 C 400 110, 500 140, 600 100 C 700 60, 800 80, 900 40 L 1000 20 L 1000 250 Z"
                    fill="url(#gradient-mrr)" />
                <path d="M0 180 C 100 170, 200 190, 300 150 C 400 110, 500 140, 600 100 C 700 60, 800 80, 900 40 L 1000 20"
                    fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* X-Axis Labels (Mock) */}
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-mono px-2 transform translate-y-6" style={{ color: 'var(--sa-muted)' }}>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
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

                    {/* Mock Donut Data representation via colored bars for simplicity in this artifact */}
                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Enterprise Org</span>
                                <span>65% (₦27.6M)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Pro Org</span>
                                <span>22% (₦9.3M)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full" style={{ width: '22%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Basic/Starter Org</span>
                                <span>8% (₦3.4M)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '8%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                <span>Patient Premium</span>
                                <span>5% (₦2.1M)</span>
                            </div>
                            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-purple-400 rounded-full" style={{ width: '5%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sa-muted)' }}>Top Geographic Regions</div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-medium">Lagos (68%)</span>
                            <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-medium">FCT Abuja (14%)</span>
                            <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-medium">Rivers (9%)</span>
                        </div>
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
                                {TOP_ORGS.map((org) => {
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
                                })}
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
                            {RISK_ORGS.map(risk => (
                                <div key={risk.id} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold" style={{ color: '#e2e8f0' }}>{risk.name}</span>
                                        <span className="text-xs font-mono font-bold text-red-400">₦{(risk.valueAtRisk / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="text-[10px]" style={{ color: 'var(--sa-muted)' }}>
                                        {risk.reason} • <span className="text-amber-500 font-medium">{risk.daysOverdue} days overdue</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transaction Feed */}
                    <div className="rounded-2xl flex flex-col overflow-hidden min-h-0 flex-1" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(8, 14, 32, 0.4)' }}>
                            <h3 className="text-sm font-black" style={{ color: '#e2e8f0' }}>Recent Transactions</h3>
                            <button className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">View All Gateway</button>
                        </div>
                        <div className="p-4 space-y-4">
                            {RECENT_TX.map(tx => (
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
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

