import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    Users, Building2, ShieldCheck, CreditCard,
    Activity, TrendingUp, AlertTriangle, CheckCircle,
    ArrowRight, Zap, Server, Eye, Flag, Lock,
    Shield, Flame, Search, MessageSquare,
} from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { billingApi } from '@/shared/api/billingApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
    return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

function uptime() { return '99.98%'; }

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
    label, value, sub, icon: Icon, accent, trend, onClick,
}: {
    label: string; value: string | number; sub?: string;
    icon: React.ElementType; accent: string; trend?: 'up' | 'down';
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`rounded-2xl p-5 flex flex-col gap-3 transition-all ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl' : ''}`}
            style={{ background: '#0d1233', border: `1px solid ${accent}22` }}
        >
            <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</div>
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}18` }}
                >
                    <Icon size={18} style={{ color: accent }} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-black" style={{ color: '#e2e8f0' }}>{value}</div>
                {sub && (
                    <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#6b7280' }}>
                        {trend === 'up' && <TrendingUp size={11} style={{ color: '#10b981' }} />}
                        {sub}
                    </div>
                )}
            </div>
            {onClick && (
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: accent }}>
                    View details <ArrowRight size={11} />
                </div>
            )}
        </div>
    );
}

// ─── Command Tile ─────────────────────────────────────────────────────────────

function CommandTile({
    label, icon: Icon, accent, to,
}: {
    label: string; icon: React.ElementType; accent: string; to: string;
}) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl font-medium text-sm transition-all hover:scale-105 hover:-translate-y-0.5"
            style={{
                background: '#0d1233',
                border: `1px solid ${accent}22`,
                color: accent,
            }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${accent}15` }}
            >
                <Icon size={20} />
            </div>
            <span className="text-center leading-tight text-xs font-bold" style={{ color: '#94a3b8' }}>{label}</span>
        </button>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SuperAdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const stats = adminApi.getPlatformStats();
    const rev = billingApi.getRevenueSummary();
    const recent = adminApi.getVerifications().slice(0, 5);

    const now = new Date().toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="animate-fade-in space-y-8">

            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={18} style={{ color: '#818cf8' }} />
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#818cf8' }}>
                            Super Admin Command Centre
                        </span>
                    </div>
                    <h1 className="text-2xl font-black" style={{ color: '#f1f5f9' }}>
                        Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#475569' }}>
                        Platform-wide overview · {now}
                    </p>
                </div>
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold self-start flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                    <CheckCircle size={14} />
                    {stats.systemHealthMessage}
                </div>
            </div>

            {/* ─── KPI Grid ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard
                    label="Total Patients" value={stats.totalPatients.toLocaleString()}
                    sub="+312 this month" trend="up" icon={Users} accent="#38bdf8"
                    onClick={() => navigate('/super-admin/users')}
                />
                <KpiCard
                    label="Active Providers" value={stats.activeProviders}
                    sub="+8 this month" trend="up" icon={Building2} accent="#a78bfa"
                    onClick={() => navigate('/super-admin/organisations')}
                />
                <KpiCard
                    label="Pending Verifications" value={stats.pendingVerifications}
                    sub="Awaiting review" icon={ShieldCheck}
                    accent={stats.pendingVerifications > 0 ? '#f59e0b' : '#10b981'}
                />
                <KpiCard
                    label="Monthly Active Users" value={stats.monthlyActiveUsers.toLocaleString()}
                    sub="+9.2% vs last month" trend="up" icon={Activity} accent="#10b981"
                />
                <KpiCard
                    label="System Uptime" value={uptime()}
                    sub="Last 30 days" icon={Server} accent="#34d399"
                    onClick={() => navigate('/super-admin/system-health')}
                />
                <KpiCard
                    label="Total MRR" value={formatNaira(rev.mrrKobo)}
                    sub={`+${rev.newSubscriptionsThisMonth} new subs`} trend="up"
                    icon={CreditCard} accent="#f472b6"
                    onClick={() => navigate('/super-admin/revenue')}
                />
            </div>

            {/* ─── Command Centre ─── */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={14} style={{ color: '#818cf8' }} />
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: '#818cf8' }}>
                        Command Centre
                    </h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <CommandTile label="Impersonation Log" icon={Eye} accent="#a78bfa" to="/super-admin/impersonation" />
                    <CommandTile label="Feature Flags" icon={Flag} accent="#38bdf8" to="/super-admin/feature-flags" />
                    <CommandTile label="Broadcast Message" icon={MessageSquare} accent="#34d399" to="/super-admin/broadcast" />
                    <CommandTile label="Audit Search" icon={Search} accent="#f59e0b" to="/super-admin/audit" />
                    <CommandTile label="Incident Log" icon={Flame} accent="#f87171" to="/super-admin/incidents" />
                    <CommandTile label="Permission History" icon={Shield} accent="#fb923c" to="/super-admin/permissions" />
                </div>
            </div>

            {/* ─── Two-col: Verification Queue + Revenue ─── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Verification Queue */}
                <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1233', border: '1px solid rgba(129,140,248,0.12)' }}>
                    <div
                        className="flex items-center justify-between px-5 py-4 border-b"
                        style={{ borderColor: 'rgba(129,140,248,0.1)' }}
                    >
                        <h2 className="font-bold text-sm" style={{ color: '#e2e8f0' }}>
                            <ShieldCheck size={14} className="inline mr-2" style={{ color: '#818cf8' }} />
                            Verification Queue
                        </h2>
                        <button
                            onClick={() => navigate('/super-admin/users')}
                            className="text-xs font-bold flex items-center gap-1 hover:opacity-80"
                            style={{ color: '#818cf8' }}
                        >
                            See all <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        {recent.map(v => (
                            <div
                                key={v.id}
                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{v.submittedByName}</div>
                                    <div className="text-xs capitalize" style={{ color: '#475569' }}>
                                        {v.type} · {new Date(v.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                                <StatusBadge status={v.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1233', border: '1px solid rgba(244,114,182,0.12)' }}>
                    <div
                        className="flex items-center justify-between px-5 py-4 border-b"
                        style={{ borderColor: 'rgba(244,114,182,0.1)' }}
                    >
                        <h2 className="font-bold text-sm" style={{ color: '#e2e8f0' }}>
                            <CreditCard size={14} className="inline mr-2" style={{ color: '#f472b6' }} />
                            Revenue by Plan
                        </h2>
                        <button
                            onClick={() => navigate('/super-admin/revenue')}
                            className="text-xs font-bold flex items-center gap-1 hover:opacity-80"
                            style={{ color: '#f472b6' }}
                        >
                            Full report <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="p-5 space-y-3">
                        {rev.planBreakdown.map((p, i) => {
                            const pct = Math.round((p.revenueKobo / rev.mrrKobo) * 100);
                            const colors = ['#f472b6', '#818cf8', '#38bdf8', '#34d399'];
                            return (
                                <div key={p.planName}>
                                    <div className="flex items-center justify-between mb-1 text-xs">
                                        <span style={{ color: '#6b7280' }}>{p.planName}</span>
                                        <span className="font-bold" style={{ color: '#e2e8f0' }}>
                                            {formatNaira(p.revenueKobo)} · {p.count} sub{p.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div
                                            className="h-1.5 rounded-full transition-all"
                                            style={{ width: `${pct}%`, background: colors[i % colors.length] }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pt-2 border-t flex justify-between text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <span style={{ color: '#475569' }}>Total MRR</span>
                            <span className="font-black" style={{ color: '#f472b6' }}>{formatNaira(rev.mrrKobo)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Governance & Security Quick Links ─── */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={14} style={{ color: '#f87171' }} />
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: '#f87171' }}>
                        Security & Governance
                    </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Security Alerts', to: '/super-admin/security', icon: AlertTriangle, accent: '#f87171' },
                        { label: 'Audit Trail', to: '/super-admin/audit', icon: Activity, accent: '#38bdf8' },
                        { label: 'Consent Governance', to: '/super-admin/consent', icon: Lock, accent: '#a78bfa' },
                        { label: 'Data Retention', to: '/super-admin/retention', icon: Shield, accent: '#34d399' },
                    ].map(a => (
                        <button
                            key={a.to}
                            onClick={() => navigate(a.to)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition-all hover:scale-105"
                            style={{ background: '#0d1233', border: `1px solid ${a.accent}20`, color: a.accent }}
                        >
                            <a.icon size={20} />
                            <span className="text-xs text-center font-bold" style={{ color: '#94a3b8' }}>{a.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
