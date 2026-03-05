import React, { useState } from 'react';
import {
    Building2, Activity, Wallet, FileLock2,
    Search, Filter, MoreVertical, CheckCircle2,
    XCircle, Clock, ExternalLink, Settings, ShieldAlert,
    Download
} from 'lucide-react';

// --- Types & Mock Data ---

type OrgStatus = 'Active' | 'Suspended' | 'Pending Review';
type OrgType = 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy' | 'Government';
type SubscriptionTier = 'Enterprise' | 'Pro' | 'Starter' | 'Free';

interface TenantOrg {
    id: string;
    name: string;
    type: OrgType;
    location: string;
    logo: string;
    adminName: string;
    adminEmail: string;
    subscription: SubscriptionTier;
    mrr: number; // Monthly Recurring Revenue in NGN
    apiCallsAvg: string; // e.g. "1.2k/min"
    staffCount: number;
    status: OrgStatus;
}

const MOCK_ORGS: TenantOrg[] = [
    {
        id: 'org_hosp_001',
        name: 'Lagos General Hospital',
        type: 'Hospital',
        location: 'Victoria Island, Lagos',
        logo: 'https://api.dicebear.com/8.x/shapes/svg?seed=lagos_gen&backgroundColor=0d1233',
        adminName: 'Dr. Chidi Okonkwo',
        adminEmail: 'admin@lagosgeneral.ng',
        subscription: 'Enterprise',
        mrr: 1500000,
        apiCallsAvg: '2.4k/min',
        staffCount: 450,
        status: 'Active'
    },
    {
        id: 'org_clin_012',
        name: 'Avon Medical Practice',
        type: 'Clinic',
        location: 'Surulere, Lagos',
        logo: 'https://api.dicebear.com/8.x/shapes/svg?seed=avon&backgroundColor=0d1233',
        adminName: 'Sarah Ndubuisi',
        adminEmail: 'sarah@avonmedical.com',
        subscription: 'Pro',
        mrr: 250000,
        apiCallsAvg: '150/min',
        staffCount: 24,
        status: 'Active'
    },
    {
        id: 'org_lab_004',
        name: 'CityLab Diagnostics',
        type: 'Laboratory',
        location: 'Wuse II, Abuja',
        logo: 'https://api.dicebear.com/8.x/shapes/svg?seed=citylab&backgroundColor=0d1233',
        adminName: 'Bayo Adewale',
        adminEmail: 'it.admin@citylab.ng',
        subscription: 'Enterprise',
        mrr: 850000,
        apiCallsAvg: '3.1k/min',
        staffCount: 112,
        status: 'Active'
    },
    {
        id: 'org_clin_088',
        name: 'Lifecare Family Clinic',
        type: 'Clinic',
        location: 'Ikeja, Lagos',
        logo: 'https://api.dicebear.com/8.x/shapes/svg?seed=lifecare&backgroundColor=0d1233',
        adminName: 'Dr. Mary Adebayo',
        adminEmail: 'mary.ade@lifecare.ng',
        subscription: 'Starter',
        mrr: 50000,
        apiCallsAvg: '12/min',
        staffCount: 5,
        status: 'Pending Review'
    },
    {
        id: 'org_pharm_021',
        name: 'MedPlus Pharmacy - Lekki',
        type: 'Pharmacy',
        location: 'Lekki Phase 1, Lagos',
        logo: 'https://api.dicebear.com/8.x/shapes/svg?seed=medplus&backgroundColor=0d1233',
        adminName: 'Ngozi Eze',
        adminEmail: 'ngozi@medplus.ng',
        subscription: 'Pro',
        mrr: 150000,
        apiCallsAvg: '45/min',
        staffCount: 18,
        status: 'Active'
    },
    {
        id: 'org_hosp_042',
        name: 'Reddington Hospital',
        type: 'Hospital',
        location: 'Ikeja, Lagos',
        logo: 'https://api.dicebear.com/8.x/shapes/svg?seed=reddington&backgroundColor=0d1233',
        adminName: 'Tunde Bakare',
        adminEmail: 'sysadmin@reddington.ng',
        subscription: 'Enterprise',
        mrr: 1200000,
        apiCallsAvg: '1.8k/min',
        staffCount: 320,
        status: 'Suspended'
    }
];

// --- Subcomponents ---

function MetricCard({ title, value, subtitle, icon: Icon, trend }: { title: string, value: string, subtitle: string, icon: any, trend: 'up' | 'down' | 'neutral' }) {
    const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';
    return (
        <div className="p-5 rounded-2xl flex items-start gap-4" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'var(--sa-accent-dim)', color: 'var(--sa-accent)' }}>
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--sa-muted)' }}>{title}</div>
                <div className="text-3xl font-black mb-1.5 tracking-tight" style={{ color: '#e2e8f0' }}>{value}</div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span style={{ color: trendColor }}>{subtitle}</span>
                </div>
            </div>
        </div>
    );
}

function StatusChip({ status }: { status: OrgStatus }) {
    let colors = { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)' };

    if (status === 'Active') colors = { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' };
    if (status === 'Suspended') colors = { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' };
    if (status === 'Pending Review') colors = { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' };

    return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-flex items-center gap-1.5"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
            {status === 'Active' ? <CheckCircle2 size={10} /> : status === 'Suspended' ? <XCircle size={10} /> : <Clock size={10} />}
            {status}
        </span>
    );
}

function TierBadge({ tier }: { tier: SubscriptionTier }) {
    const colors = {
        'Enterprise': { bg: 'linear-gradient(135deg, #6366f1, #a855f7)', text: '#fff' },
        'Pro': { bg: 'rgba(56,189,248,0.15)', text: '#38bdf8' },
        'Starter': { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
        'Free': { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af' },
    }[tier];

    return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase"
            style={{ background: colors.bg, color: colors.text }}>
            {tier}
        </span>
    );
}

// --- Main Component ---

export function SuperAdminOrganisations() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    return (
        <div className="space-y-6 animate-fade-in relative pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>Organisation Registry</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>B2B tenant management for hospitals, clinics, and healthcare partners.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Facilities" value="842" subtitle="+12 this month" icon={Building2} trend="up" />
                <MetricCard title="Active API Traffic" value="14.2k/m" subtitle="peak: 18k/m" icon={Activity} trend="neutral" />
                <MetricCard title="Platform MRR" value="₦42.5M" subtitle="+₦2.1M vs last month" icon={Wallet} trend="up" />
                <MetricCard title="Pending KYC Review" value="8" subtitle="Average wait: 1.2 days" icon={FileLock2} trend="down" />
            </div>

            {/* Main Table Card */}
            <div className="rounded-2xl flex flex-col overflow-hidden" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>

                {/* Control Bar */}
                <div className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between border-b" style={{ borderColor: 'var(--sa-border)' }}>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--sa-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search by org ID, name, or admin..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full text-sm rounded-xl pl-10 pr-4 py-2 outline-none transition-all placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50"
                                style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                            style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Filter size={16} /> <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
                            style={{ color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Download size={16} /> Export Sheet
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(8, 14, 32, 0.4)' }}>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Organisation</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap hidden lg:table-cell" style={{ color: 'var(--sa-muted)' }}>Primary Admin</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap hidden xl:table-cell" style={{ color: 'var(--sa-muted)' }}>Utilization</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Subscription</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap text-center" style={{ color: 'var(--sa-muted)' }}>Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap text-right" style={{ color: 'var(--sa-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {MOCK_ORGS.map((org) => (
                                <tr key={org.id} className="hover:bg-white/[0.02] transition-colors relative group">
                                    {/* Org (Logo + Name + Location) */}
                                    <td className="p-4">
                                        <div className="flex items-start gap-3">
                                            <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                                            <div>
                                                <div className="text-sm font-bold truncate max-w-[200px]" style={{ color: '#e2e8f0' }}>{org.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-mono" style={{ color: '#9ca3af' }}>{org.id}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--sa-muted)' }}>{org.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Primary Admin - Hidden on small */}
                                    <td className="p-4 hidden lg:table-cell">
                                        <div className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{org.adminName}</div>
                                        <div className="text-xs" style={{ color: 'var(--sa-muted)' }}>{org.adminEmail}</div>
                                    </td>

                                    {/* Utilization - Hidden on lg */}
                                    <td className="p-4 hidden xl:table-cell">
                                        <div className="flex gap-4">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--sa-muted)' }}>Staff</div>
                                                <div className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{org.staffCount}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--sa-muted)' }}>API Load</div>
                                                <div className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{org.apiCallsAvg}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Subscription details */}
                                    <td className="p-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <TierBadge tier={org.subscription} />
                                            <div className="text-[11px] font-mono mt-1" style={{ color: '#9ca3af' }}>₦{(org.mrr / 1000).toFixed(0)}k / month</div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="p-4 text-center">
                                        <StatusChip status={org.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right static">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === org.id ? null : org.id)}
                                                className="p-2 rounded-xl transition-colors hover:bg-white/10 relative z-10"
                                                style={{ color: 'var(--sa-muted)' }}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenuId === org.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                                    <div
                                                        className="absolute right-0 top-12 w-56 rounded-xl shadow-2xl py-1 z-20 animate-fade-in z-50 overflow-hidden"
                                                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                                                    >
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                                                            style={{ color: '#e2e8f0' }}
                                                        >
                                                            <Settings size={16} /> Manage Subscription
                                                        </button>
                                                        {org.status === 'Pending Review' && (
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                                                                style={{ color: '#10b981' }}
                                                            >
                                                                <FileLock2 size={16} /> Verify Medical License
                                                            </button>
                                                        )}
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                                                            style={{ color: '#e2e8f0' }}
                                                        >
                                                            <ExternalLink size={16} /> View Tenant Audit Log
                                                        </button>
                                                        <div className="h-px my-1 w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                                            style={{ color: '#ef4444' }}
                                                        >
                                                            <ShieldAlert size={16} /> Suspend Organisation
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

