import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, ShieldCheck, CreditCard,
    Activity, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle, Clock, Eye, ArrowRight,
} from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { billingApi } from '@/shared/api/billingApi';
import { AuthUser, UserRole } from '@/shared/types/types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
    return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
    label, value, sub, icon: Icon, accent, trend, onClick,
}: {
    label: string; value: string | number; sub?: string;
    icon: React.ElementType; accent: string; trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`rounded-2xl p-5 flex flex-col gap-3 transition-all ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : ''}`}
            style={{ background: '#111827', border: `1px solid ${accent}22` }}
        >
            <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>{label}</div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}18` }}>
                    <Icon size={18} style={{ color: accent }} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-black" style={{ color: '#e5e7eb' }}>{value}</div>
                {sub && <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#6b7280' }}>
                    {trend === 'up' && <TrendingUp size={11} style={{ color: '#10b981' }} />}
                    {trend === 'down' && <TrendingDown size={11} style={{ color: '#ef4444' }} />}
                    {sub}
                </div>}
            </div>
            {onClick && (
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: accent }}>
                    View details <ArrowRight size={11} />
                </div>
            )}
        </div>
    );
}

// ─── Verification row ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; bg: string; label: string }> = {
        pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
        approved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Approved' },
        rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' },
        flagged: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Flagged' },
        more_info_requested: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', label: 'More Info' },
    };
    const s = map[status] ?? map.pending;
    return (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
}

const ROLE_OPTIONS: UserRole[] = [
    'patient',
    'caregiver',
    'provider_admin',
    'clinician',
    'lab_tech',
    'pharmacist',
    'super_admin',
];

function getUserLabel(user: AuthUser) {
    if (user.roles?.includes('super_admin')) return 'Super Admin';
    if (user.roles?.includes('provider_admin')) return 'Provider Admin';
    if (user.roles?.includes('clinician')) return 'Clinician';
    if (user.roles?.includes('lab_tech')) return 'Lab Tech';
    if (user.roles?.includes('pharmacist')) return 'Pharmacist';
    if (user.userType === 'PATIENT') return 'Patient';
    return user.roles?.[0] ?? 'User';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    useEffect(() => {
        setUsers(adminApi.getUsers());
    }, []);

    const refreshUsers = () => setUsers(adminApi.getUsers());
    const stats = adminApi.getPlatformStats();
    const rev = billingApi.getRevenueSummary();
    const recent = adminApi.getVerifications().slice(0, 5);

    const handleDeleteUser = (userId: string) => {
        if (!window.confirm('Delete this account? This action cannot be undone.')) return;
        setActionInProgress(userId);
        adminApi.deleteUser(userId);
        refreshUsers();
        setActionInProgress(null);
    };

    const handleRoleChange = (userId: string, nextRole: UserRole) => {
        setActionInProgress(userId);
        adminApi.updateUserRole(userId, nextRole);
        refreshUsers();
        setActionInProgress(null);
    };

    const handleAddMockUser = () => {
        adminApi.addMockUser();
        refreshUsers();
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Operations Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                    Real-time overview of the WelliRecord platform · {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* System health banner */}
            <div className="rounded-2xl px-5 py-3 flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>{stats.systemHealthMessage}</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard label="Total Patients" value={stats.totalPatients.toLocaleString()}
                    sub="+312 this month" trend="up" icon={Users} accent="#38bdf8"
                    onClick={() => navigate('/admin/patients')} />
                <KpiCard label="Active Providers" value={stats.activeProviders}
                    sub="+8 this month" trend="up" icon={Building2} accent="#a78bfa"
                    onClick={() => navigate('/admin/facilities')} />
                <KpiCard label="Pending Verifications" value={stats.pendingVerifications}
                    sub="Needs review" trend="neutral" icon={ShieldCheck}
                    accent={stats.pendingVerifications > 0 ? '#f59e0b' : '#10b981'}
                    onClick={() => navigate('/admin/verifications')} />
                <KpiCard label="Monthly Active Users" value={stats.monthlyActiveUsers.toLocaleString()}
                    sub="+9.2% vs last month" trend="up" icon={Activity} accent="#10b981" />
                <KpiCard label="Total Users" value={stats.totalUsers.toLocaleString()}
                    sub="Platform users across roles" trend="up" icon={Users} accent="#8b5cf6" />
                <KpiCard label="Consent Requests Today" value={stats.consentRequestsToday}
                    sub="Across all patients" icon={Eye} accent="#f472b6" />
                <KpiCard label="MRR" value={formatNaira(rev.mrrKobo)}
                    sub={`+${rev.newSubscriptionsThisMonth} new this month`} trend="up"
                    icon={CreditCard} accent="#34d399"
                    onClick={() => navigate('/admin/billing')} />
            </div>

            {/* Two-column: verification queue + plan breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Recent verification requests */}
                <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.12)' }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
                        <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>
                            <ShieldCheck size={14} className="inline mr-2" style={{ color: '#f59e0b' }} />
                            Verification Queue
                        </h2>
                        <button onClick={() => navigate('/admin/verifications')}
                            className="text-xs font-bold flex items-center gap-1 hover:opacity-80" style={{ color: '#f59e0b' }}>
                            See all <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        {recent.map(v => (
                            <div key={v.id}
                                onClick={() => navigate(`/admin/verifications/${v.id}`)}
                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/4 cursor-pointer transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: '#e5e7eb' }}>{v.submittedByName}</div>
                                    <div className="text-xs capitalize" style={{ color: '#6b7280' }}>
                                        {v.type} · {new Date(v.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                                <StatusBadge status={v.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue plan breakdown */}
                <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(52,211,153,0.12)' }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(52,211,153,0.1)' }}>
                        <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>
                            <CreditCard size={14} className="inline mr-2" style={{ color: '#34d399' }} />
                            Revenue by Plan
                        </h2>
                        <button onClick={() => navigate('/admin/billing')}
                            className="text-xs font-bold flex items-center gap-1 hover:opacity-80" style={{ color: '#34d399' }}>
                            Full dashboard <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="p-5 space-y-3">
                        {rev.planBreakdown.map((p, i) => {
                            const pct = Math.round((p.revenueKobo / rev.mrrKobo) * 100);
                            const colors = ['#34d399', '#38bdf8', '#a78bfa', '#f472b6'];
                            return (
                                <div key={p.planName}>
                                    <div className="flex items-center justify-between mb-1 text-xs">
                                        <span style={{ color: '#9ca3af' }}>{p.planName}</span>
                                        <span className="font-bold" style={{ color: '#e5e7eb' }}>
                                            {formatNaira(p.revenueKobo)} · {p.count} sub{p.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pt-2 border-t flex justify-between text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <span style={{ color: '#6b7280' }}>Total MRR</span>
                            <span className="font-black" style={{ color: '#34d399' }}>{formatNaira(rev.mrrKobo)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Review Verifications', to: '/admin/verifications', icon: ShieldCheck, accent: '#f59e0b' },
                    { label: 'View Audit Log', to: '/admin/audit', icon: Activity, accent: '#38bdf8' },
                    { label: 'Manage Plans', to: '/admin/plans', icon: CreditCard, accent: '#34d399' },
                    { label: 'Security Alerts', to: '/admin/security', icon: AlertTriangle, accent: '#ef4444' },
                ].map(a => (
                    <button key={a.to} onClick={() => navigate(a.to)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition-all hover:scale-105"
                        style={{ background: '#111827', border: `1px solid ${a.accent}20`, color: a.accent }}>
                        <a.icon size={20} />
                        {a.label}
                    </button>
                ))}
            </div>

            {/* User management */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(148,163,184,0.12)' }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div>
                        <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>Platform Users</h2>
                        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{users.length.toLocaleString()} total accounts managed on WelliRecord.</p>
                    </div>
                    <button onClick={handleAddMockUser}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-white/10"
                        style={{ background: '#111827', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Users size={16} /> Add mock user
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-xs font-black uppercase tracking-wider" style={{ color: '#9ca3af' }}>User</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider" style={{ color: '#9ca3af' }}>Role</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider hidden lg:table-cell" style={{ color: '#9ca3af' }}>Organisation</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-right" style={{ color: '#9ca3af' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            {users.map((user) => {
                                const currentRole = user.roles?.[0] ?? 'patient';
                                return (
                                    <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar ?? ''} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{user.name}</div>
                                                    <div className="text-xs" style={{ color: '#9ca3af' }}>{user.email ?? user.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{getUserLabel(user)}</span>
                                                <select
                                                    className="w-full rounded-xl bg-slate-900 text-xs px-3 py-2 outline-none"
                                                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}
                                                    value={currentRole}
                                                    onChange={(event) => handleRoleChange(user.userId, event.target.value as UserRole)}
                                                >
                                                    {ROLE_OPTIONS.map((roleOption) => (
                                                        <option key={roleOption} value={roleOption}>{roleOption.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="text-sm" style={{ color: '#e5e7eb' }}>{user.orgName ?? 'Unaffiliated'}</div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={user.userType === 'PATIENT' ? 'approved' : 'approved'} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.userId)}
                                                disabled={actionInProgress === user.userId}
                                                className="text-sm font-semibold rounded-xl px-3 py-2 transition-colors hover:bg-red-500/10"
                                                style={{ color: '#f87171' }}
                                            >
                                                {actionInProgress === user.userId ? 'Deleting…' : 'Delete'}
                                            </button>
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
