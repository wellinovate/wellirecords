import React, { useState } from 'react';
import {
    Users, UserPlus, Activity, ShieldCheck,
    Search, Filter, MoreVertical, CheckCircle2,
    XCircle, Clock, Download, Mail, Ban, ChevronDown
} from 'lucide-react';

// --- Types & Mock Data ---

type AccountStatus = 'Active' | 'Suspended' | 'Pending';
type VerificationStatus = 'NIN Verified' | 'Unverified' | 'Pending';
type AccountType = 'Patient' | 'Clinician' | 'Provider Admin' | 'Super Admin';
type SubscriptionPlan = 'Free' | 'Pro' | 'Enterprise' | 'N/A';

interface PlatformUser {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
    accountType: AccountType;
    org: string;
    registrationDate: string;
    verificationStatus: VerificationStatus;
    plan: SubscriptionPlan;
    lastActive: string;
    status: AccountStatus;
}

const MOCK_USERS: PlatformUser[] = [
    {
        id: 'usr_pat_001',
        fullName: 'Amara Okafor',
        email: 'amara.okafor@gmail.com',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=amara_okafor',
        accountType: 'Patient',
        org: 'Unaffiliated',
        registrationDate: '2026-02-14',
        verificationStatus: 'NIN Verified',
        plan: 'Free',
        lastActive: '2h ago',
        status: 'Active'
    },
    {
        id: 'usr_pat_002',
        fullName: 'Emeka Nwosu',
        email: 'emeka.n@yahoo.com',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=emeka_n',
        accountType: 'Patient',
        org: 'Unaffiliated',
        registrationDate: '2026-03-01',
        verificationStatus: 'Pending',
        plan: 'Pro',
        lastActive: '1m ago',
        status: 'Active'
    },
    {
        id: 'usr_pro_001',
        fullName: 'Dr. Fatima Aliyu',
        email: 'fatima.aliyu@lagosgeneral.ng',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=fatima_aliyu',
        accountType: 'Clinician',
        org: 'Lagos General Hospital',
        registrationDate: '2025-11-20',
        verificationStatus: 'NIN Verified',
        plan: 'Enterprise',
        lastActive: 'Just now',
        status: 'Active'
    },
    {
        id: 'usr_pro_002',
        fullName: 'Dr. Chidi Eze',
        email: 'dr.chidi@reddington.ng',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=chidi_eze',
        accountType: 'Clinician',
        org: 'Reddington Hospital',
        registrationDate: '2025-10-05',
        verificationStatus: 'NIN Verified',
        plan: 'Enterprise',
        lastActive: '3d ago',
        status: 'Suspended'
    },
    {
        id: 'usr_adm_001',
        fullName: 'Bayo Adewale',
        email: 'admin@citylab.ng',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=bayo_adewale',
        accountType: 'Provider Admin',
        org: 'CityLab Diagnostics',
        registrationDate: '2026-01-12',
        verificationStatus: 'Unverified',
        plan: 'Pro',
        lastActive: '5h ago',
        status: 'Pending'
    },
    {
        id: 'usr_sa_001',
        fullName: 'Tolu Adeyemi',
        email: 't.adeyemi@wellirecord.com',
        avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=tolu_adeyemi',
        accountType: 'Super Admin',
        org: 'WelliRecord Ops',
        registrationDate: '2025-01-01',
        verificationStatus: 'NIN Verified',
        plan: 'N/A',
        lastActive: 'Configuring settings',
        status: 'Active'
    }
];

// --- Subcomponents ---

function MetricCard({ title, value, change, timeframe, icon: Icon, trend }: { title: string, value: string, change: string, timeframe: string, icon: any, trend: 'up' | 'down' | 'neutral' }) {
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
                    <span style={{ color: trendColor }}>{change}</span>
                    <span style={{ color: 'var(--sa-muted)' }}>vs {timeframe}</span>
                </div>
            </div>
        </div>
    );
}

function StatusChip({ status }: { status: AccountStatus | VerificationStatus }) {
    let colors = { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)' };

    if (status === 'Active' || status === 'NIN Verified') colors = { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' };
    if (status === 'Suspended' || status === 'Unverified') colors = { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' };
    if (status === 'Pending') colors = { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' };

    return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-flex items-center gap-1.5"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
            {status === 'Active' || status === 'NIN Verified' ? <CheckCircle2 size={10} /> : status === 'Suspended' || status === 'Unverified' ? <XCircle size={10} /> : <Clock size={10} />}
            {status}
        </span>
    );
}

// --- Main Component ---

export function SuperAdminPlatformUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    return (
        <div className="space-y-6 animate-fade-in relative pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>User Registry</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>Manage platform users, verify identities, and govern access across the WelliRecord ecosystem.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Platform Users" value="284,592" change="+12.4%" timeframe="last month" icon={Users} trend="up" />
                <MetricCard title="New Registrations" value="14,204" change="+5.2%" timeframe="last week" icon={UserPlus} trend="up" />
                <MetricCard title="Active Today" value="94,011" change="-2.1%" timeframe="yesterday" icon={Activity} trend="down" />
                <MetricCard title="Pending Verifications" value="1,842" change="184 cleared" timeframe="today" icon={ShieldCheck} trend="neutral" />
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
                                placeholder="Search by ID, name, or org..."
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
                            <Download size={16} /> Export CSV
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:opacity-90"
                            style={{ background: 'var(--sa-accent)', color: '#000' }}>
                            <UserPlus size={16} /> Add User
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(8, 14, 32, 0.4)' }}>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>User</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--sa-muted)' }}>Role & ID</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap hidden lg:table-cell" style={{ color: 'var(--sa-muted)' }}>Organisation</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap hidden xl:table-cell" style={{ color: 'var(--sa-muted)' }}>Registration</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap hidden md:table-cell" style={{ color: 'var(--sa-muted)' }}>Verification</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap text-center" style={{ color: 'var(--sa-muted)' }}>Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest whitespace-nowrap text-right" style={{ color: 'var(--sa-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {MOCK_USERS.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors relative group">
                                    {/* User (Avatar + Name) */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar} alt={u.fullName} className="w-10 h-10 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.1)', background: '#cbd5e1' }} />
                                            <div>
                                                <div className="text-sm font-bold truncate max-w-[150px] sm:max-w-[200px]" style={{ color: '#e2e8f0' }}>{u.fullName}</div>
                                                <div className="text-xs truncate max-w-[150px] sm:max-w-[200px]" style={{ color: 'var(--sa-muted)' }}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role & ID */}
                                    <td className="p-4">
                                        <div className="text-xs font-mono mb-1" style={{ color: '#9ca3af' }}>{u.id}</div>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: 'rgba(129,140,248,0.15)', color: 'var(--sa-accent)' }}>
                                            {u.accountType}
                                        </span>
                                    </td>

                                    {/* Organisation - Hidden on small */}
                                    <td className="p-4 hidden lg:table-cell">
                                        <div className="text-sm font-medium" style={{ color: u.org === 'Unaffiliated' ? 'var(--sa-muted)' : '#e2e8f0' }}>
                                            {u.org}
                                        </div>
                                    </td>

                                    {/* Registration - Hidden on lg */}
                                    <td className="p-4 hidden xl:table-cell">
                                        <div className="text-sm" style={{ color: '#e2e8f0' }}>{new Date(u.registrationDate).toLocaleDateString('en-GB')}</div>
                                        <div className="text-xs" style={{ color: 'var(--sa-muted)' }}>Active {u.lastActive}</div>
                                    </td>

                                    {/* Verification & Plan - Hidden on md */}
                                    <td className="p-4 hidden md:table-cell">
                                        <div className="flex flex-col items-start gap-1.5">
                                            <StatusChip status={u.verificationStatus} />
                                            <span className="text-[11px] font-semibold" style={{ color: '#9ca3af' }}>Plan: {u.plan}</span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="p-4 text-center">
                                        <StatusChip status={u.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right static">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                                                className="p-2 rounded-xl transition-colors hover:bg-white/10 relative z-10"
                                                style={{ color: 'var(--sa-muted)' }}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenuId === u.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                                    <div
                                                        className="absolute right-0 top-12 w-48 rounded-xl shadow-2xl py-1 z-20 animate-fade-in z-50 overflow-hidden"
                                                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                                                    >
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                                                            style={{ color: '#e2e8f0' }}
                                                        >
                                                            <Activity size={16} /> View Profile
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                                                            style={{ color: '#e2e8f0' }}
                                                        >
                                                            <Download size={16} /> Export Audit Log
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                                                            style={{ color: '#e2e8f0' }}
                                                        >
                                                            <Mail size={16} /> Send Notification
                                                        </button>
                                                        <div className="h-px my-1 w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                                            style={{ color: '#ef4444' }}
                                                        >
                                                            <Ban size={16} /> Suspend Account
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

                {/* Table Footer / Pagination placeholder */}
                <div className="p-4 border-t flex items-center justify-between text-sm" style={{ borderColor: 'var(--sa-border)', color: 'var(--sa-muted)' }}>
                    <div>Showing <span className="font-bold text-white">1</span> to <span className="font-bold text-white">6</span> of <span className="font-bold text-white">284,592</span> users</div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg opacity-50 cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.05)' }}>Previous</button>
                        <button className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>Next</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

