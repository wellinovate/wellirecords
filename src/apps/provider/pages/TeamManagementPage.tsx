import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { orgApi } from '@/shared/api/orgApi';
import {
    Plus, Mail, X, CheckCircle, Shield, Clock, Activity,
    MoreVertical, UserCheck, UserX, Edit2, Key, Search,
    TrendingUp, Users, AlertCircle,
} from 'lucide-react';

/* ─── Role config ────────────────────────────────────────────────────── */
const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    provider_admin: { label: 'Admin', color: '#f59e0b', bg: '#fef3c7', icon: <Shield size={11} /> },
    clinician: { label: 'Clinician', color: '#38bdf8', bg: '#e0f2fe', icon: <UserCheck size={11} /> },
    lab_tech: { label: 'Lab Tech', color: '#10b981', bg: '#d1fae5', icon: <Activity size={11} /> },
    pharmacist: { label: 'Pharmacist', color: '#a855f7', bg: '#f3e8ff', icon: <Key size={11} /> },
    nurse: { label: 'Nurse', color: '#0ea5e9', bg: '#e0f7fa', icon: <UserCheck size={11} /> },
};

const INVITE_ROLES = [
    { value: 'clinician', label: 'Doctor / Clinician' },
    { value: 'lab_tech', label: 'Lab Technician' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'provider_admin', label: 'Org Administrator' },
];

function timeAgo(iso?: string | null) {
    if (!iso) return 'Never';
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

function RoleBadge({ role }: { role: string }) {
    const m = ROLE_META[role] ?? { label: role, color: '#6b7280', bg: '#f3f4f6', icon: null };
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: m.bg + '40', color: m.color, border: `1px solid ${m.color}30` }}>
            {m.icon} {m.label}
        </span>
    );
}

/* ─── Member card ────────────────────────────────────────────────────── */
function MemberCard({
    member, isSelf, isAdmin,
    onSuspend, onReactivate,
}: {
    member: any; isSelf: boolean; isAdmin: boolean;
    onSuspend: () => void; onReactivate: () => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const active = member.status === 'active';
    const pending = member.status === 'invited';

    const initials = member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const meta = ROLE_META[member.role] ?? { color: '#6b7280', bg: '#f3f4f6' };

    return (
        <div className="relative flex items-center gap-4 px-5 py-4 border-b transition-colors hover:bg-white/[0.03]"
            style={{ borderColor: 'var(--prov-border)' }}>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{ background: `${meta.color}18`, color: meta.color }}>
                    {initials}
                </div>
                {!pending && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2`}
                        style={{
                            background: active ? '#22c55e' : '#9ca3af',
                            borderColor: 'var(--prov-surface)',
                        }} />
                )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: '#e2eaf4' }}>{member.name}</span>
                    {isSelf && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400">You</span>}
                    <RoleBadge role={member.role} />
                    {pending && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Invite Pending</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>{member.email}</div>
            </div>

            {/* Permissions preview */}
            <div className="hidden md:flex gap-1 flex-wrap max-w-[180px]">
                {member.permissions.slice(0, 2).map((p: string) => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'rgba(56,189,248,.08)', color: '#64748b' }}>
                        {p === '*' ? 'all:*' : p}
                    </span>
                ))}
                {member.permissions.length > 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ color: '#3e5a78' }}>
                        +{member.permissions.length - 2}
                    </span>
                )}
            </div>

            {/* Last active */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: '#3e5a78' }}>
                <Clock size={11} />
                {timeAgo(member.lastActive)}
            </div>

            {/* Status dot */}
            <div className="hidden sm:block text-[10px] font-bold w-16 text-center flex-shrink-0"
                style={{ color: active ? '#22c55e' : pending ? '#f59e0b' : '#9ca3af' }}>
                {active ? '● Active' : pending ? '◌ Invited' : '○ Suspended'}
            </div>

            {/* Kebab menu */}
            {isAdmin && !isSelf && (
                <div className="relative flex-shrink-0">
                    <button onClick={() => setMenuOpen(m => !m)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
                        <MoreVertical size={14} style={{ color: '#7ba3c8' }} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-8 z-20 w-44 rounded-xl overflow-hidden shadow-2xl"
                            style={{ background: '#0d2137', border: '1px solid rgba(56,189,248,.15)' }}>
                            <button onClick={() => setMenuOpen(false)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-white/5 text-left"
                                style={{ color: '#e2eaf4' }}>
                                <Edit2 size={12} style={{ color: '#38bdf8' }} /> Edit Permissions
                            </button>
                            <button onClick={() => setMenuOpen(false)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-white/5 text-left"
                                style={{ color: '#e2eaf4' }}>
                                <Key size={12} style={{ color: '#a855f7' }} /> Reset 2FA
                            </button>
                            <div className="h-px mx-3" style={{ background: 'rgba(56,189,248,.1)' }} />
                            {active ? (
                                <button onClick={() => { onSuspend(); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-red-500/10 text-left"
                                    style={{ color: '#f87171' }}>
                                    <UserX size={12} /> Suspend Access
                                </button>
                            ) : !pending && (
                                <button onClick={() => { onReactivate(); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-emerald-500/10 text-left"
                                    style={{ color: '#34d399' }}>
                                    <UserCheck size={12} /> Reactivate
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function TeamManagementPage() {
    const { user } = useAuth();
    const org = user?.orgId ? orgApi.getById(user.orgId) : undefined;
    const [members, setMembers] = useState(org?.members ?? []);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('clinician');
    const [inviteName, setInviteName] = useState('');
    const [sent, setSent] = useState(false);

    const isAdmin = user?.roles?.includes('provider_admin') ?? false;

    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || m.role === roleFilter;
        return matchSearch && matchRole;
    });

    const stats = {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        pending: members.filter(m => m.status === 'invited').length,
        suspended: members.filter(m => m.status === 'suspended').length,
    };

    const suspend = (id: string) => setMembers(prev => prev.map(m => m.userId === id ? { ...m, status: 'suspended' } : m));
    const reactivate = (id: string) => setMembers(prev => prev.map(m => m.userId === id ? { ...m, status: 'active' } : m));

    const sendInvite = () => {
        setSent(true);
        setTimeout(() => { setSent(false); setShowInvite(false); setInviteEmail(''); setInviteName(''); }, 2000);
    };

    return (
        <div className="animate-fade-in">
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Team Management</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>{org?.name ?? 'Your Organisation'} · Access control & member roles</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowInvite(true)} className="btn btn-provider gap-2">
                        <Plus size={16} /> Invite Member
                    </button>
                )}
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Members', value: stats.total, icon: Users, color: '#38bdf8' },
                    { label: 'Active', value: stats.active, icon: CheckCircle, color: '#22c55e' },
                    { label: 'Invite Pending', value: stats.pending, icon: Clock, color: '#f59e0b' },
                    { label: 'Suspended', value: stats.suspended, icon: AlertCircle, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl border p-4 flex items-center gap-3"
                        style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${s.color}18` }}>
                            <s.icon size={18} style={{ color: s.color }} />
                        </div>
                        <div>
                            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#3e5a78' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-40">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3e5a78' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="input input-dark w-full text-xs" style={{ paddingLeft: '2rem' }} />
                </div>
                <div className="flex gap-1">
                    {['all', ...Object.keys(ROLE_META)].map(r => (
                        <button key={r}
                            onClick={() => setRoleFilter(r)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: roleFilter === r ? '#38bdf8' : 'rgba(56,189,248,.06)',
                                color: roleFilter === r ? '#050d1a' : '#7ba3c8',
                            }}>
                            {r === 'all' ? 'All Roles' : ROLE_META[r]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Member list ── */}
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--prov-border)' }}>
                {/* Column headers */}
                <div className="grid px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(255,255,255,.02)', color: '#3e5a78', borderBottom: '1px solid var(--prov-border)', gridTemplateColumns: '1fr 1fr auto auto auto auto' }}>
                    <div>Member</div>
                    <div className="hidden md:block">Permissions</div>
                    <div className="hidden lg:block w-24">Last Active</div>
                    <div className="hidden sm:block w-20 text-center">Status</div>
                    <div />
                </div>

                {filtered.length === 0 ? (
                    <div className="py-16 text-center" style={{ color: '#3e5a78' }}>
                        <Users size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No members match your filter.</p>
                    </div>
                ) : filtered.map(m => (
                    <MemberCard
                        key={m.userId}
                        member={m}
                        isSelf={m.userId === user?.userId}
                        isAdmin={isAdmin}
                        onSuspend={() => suspend(m.userId)}
                        onReactivate={() => reactivate(m.userId)}
                    />
                ))}
            </div>

            <p className="text-[11px] mt-3" style={{ color: '#3e5a78' }}>
                🔒 All access changes are logged to the WelliChain audit trail. Suspensions take effect immediately.
            </p>

            {/* ── Invite modal ── */}
            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)' }}>
                    <div className="w-full max-w-sm rounded-2xl animate-fade-in-up overflow-hidden"
                        style={{ background: 'var(--prov-surface)', border: '1px solid rgba(56,189,248,.2)' }}>
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#38bdf8,#a855f7)' }} />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-base" style={{ color: '#e2eaf4' }}>Invite Team Member</h3>
                                <button onClick={() => setShowInvite(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
                                    <X size={14} style={{ color: '#7ba3c8' }} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Full Name</label>
                                    <input value={inviteName} onChange={e => setInviteName(e.target.value)}
                                        className="input input-dark w-full"
                                        placeholder="Dr. Jane Oseji" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Work Email</label>
                                    <div className="relative">
                                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3e5a78' }} />
                                        <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                            className="input input-dark w-full" style={{ paddingLeft: '2.1rem' }}
                                            placeholder="doctor@hospital.ng" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Role</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {INVITE_ROLES.map(r => {
                                            const m = ROLE_META[r.value];
                                            return (
                                                <button key={r.value}
                                                    onClick={() => setInviteRole(r.value)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all"
                                                    style={{
                                                        borderColor: inviteRole === r.value ? (m?.color ?? '#38bdf8') : 'rgba(56,189,248,.12)',
                                                        background: inviteRole === r.value ? `${m?.color ?? '#38bdf8'}18` : 'transparent',
                                                        color: inviteRole === r.value ? (m?.color ?? '#38bdf8') : '#7ba3c8',
                                                    }}>
                                                    {m?.icon}
                                                    {r.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(56,189,248,.06)', color: '#7ba3c8' }}>
                                    📨 An encrypted invite link will be sent. It expires in 48 hours and requires 2FA setup on first login.
                                </div>

                                <button onClick={sendInvite}
                                    disabled={!inviteEmail.includes('@') || !inviteName}
                                    className="btn btn-provider w-full justify-center gap-2 disabled:opacity-40">
                                    {sent
                                        ? <><CheckCircle size={15} /> Invite Sent!</>
                                        : <><Mail size={15} /> Send Secure Invite</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
