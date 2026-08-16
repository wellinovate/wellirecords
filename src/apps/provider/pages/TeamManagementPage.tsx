import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teamApi, TeamMember, MembershipRole, RoleCatalog, PermissionRegistry } from '@/shared/api/teamApi';
import {
    Plus, Mail, X, CheckCircle, Shield, Clock, Activity,
    MoreVertical, UserCheck, UserX, Key, Search,
    Users, FlaskConical, Stethoscope, AlertTriangle, Pill, UserCog, UserCheck as UserIcon,
    Loader2, ChevronDown, ChevronUp, UserPlus, FileText, Check, Sparkles,
} from 'lucide-react';

/* ─── Role config ────────────────────────────────────────────────────── */
// Base labels/colors for every role that exists anywhere in the system.
// Which of these a given facility can actually invite is filtered at
// render time by roleCatalog (fetched per-org from the backend).
const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    provider_admin: { label: 'Admin', color: '#f59e0b', bg: '#fef3c7', icon: <Shield size={11} /> },
    doctor: { label: 'Doctor', color: '#38bdf8', bg: '#e0f2fe', icon: <Stethoscope size={11} /> },
    clinician: { label: 'Doctor', color: '#38bdf8', bg: '#e0f2fe', icon: <Stethoscope size={11} /> },
    nurse: { label: 'Nurse', color: '#10b981', bg: '#d1fae5', icon: <UserCheck size={11} /> },
    lab_tech: { label: 'Lab Tech', color: '#a855f7', bg: '#f3e8ff', icon: <FlaskConical size={11} /> },
    pharmacist: { label: 'Pharmacist', color: '#ec4899', bg: '#fce7f3', icon: <Pill size={11} /> },
    frontdesk: { label: 'Front Desk', color: '#6366f1', bg: '#e0e7ff', icon: <UserCog size={11} /> },
    insurer_agent: { label: 'Insurer Agent', color: '#f97316', bg: '#ffedd5', icon: <UserIcon size={11} /> },
    support_staff: { label: 'Support Staff', color: '#6b7280', bg: '#f3f4f6', icon: <Users size={11} /> },
};

// Full label set the invite modal can offer, keyed by role.
const INVITE_ROLE_LABELS: Record<MembershipRole, string> = {
    provider_admin: 'Org Administrator',
    doctor: 'Doctor',
    clinician: 'Doctor',
    nurse: 'Nurse',
    lab_tech: 'Lab Technician',
    pharmacist: 'Pharmacist',
    frontdesk: 'Front Desk',
    insurer_agent: 'Insurer Agent',
    support_staff: 'Support Staff',
};

function labelForRole(role: string, catalog: RoleCatalog | null): string {
    const override = catalog?.labelOverrides?.[role as MembershipRole];
    if (override) return override;
    return INVITE_ROLE_LABELS[role as MembershipRole] ?? ROLE_META[role]?.label ?? role;
}

function timeAgo(iso?: string | null) {
    if (!iso) return 'Never';
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

function RoleBadge({ role, catalog }: { role: string; catalog: RoleCatalog | null }) {
    const m = ROLE_META[role] ?? { label: role, color: '#6b7280', bg: '#f3f4f6', icon: null };
    const label = labelForRole(role, catalog);
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: m.bg + '40', color: m.color, border: `1px solid ${m.color}30` }}>
            {m.icon} {label}
        </span>
    );
}

/* ─── Access panel ───────────────────────────────────────────────────── */
function AccessPanel({
    member, registry, onSaved,
}: {
    member: TeamMember; registry: PermissionRegistry; onSaved: (permissions: string[], overrides: { granted: string[]; revoked: string[] }) => void;
}) {
    const roleDefaults = registry.roleDefaults[member.role] ?? [];
    const [checked, setChecked] = useState<Set<string>>(new Set(member.permissions));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const toggle = (key: string) => {
        setSaved(false);
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        const granted = [...checked].filter(k => !roleDefaults.includes(k));
        const revoked = roleDefaults.filter(k => !checked.has(k));
        try {
            if (!member.membershipId) throw new Error('No membership ID');
            const res = await teamApi.updateMemberPermissions(member.membershipId, { granted, revoked });
            onSaved(res.permissions, res.permissionOverrides);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 rounded-xl border mt-3 space-y-4" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.15)' }}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-bold text-slate-200">Custom Permission Overrides</h4>
                    <p className="text-[11px]" style={{ color: '#7ba3c8' }}>
                        Modify specific capabilities for this user beyond their default role permissions.
                    </p>
                </div>
                <button onClick={save} disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 transition-all flex items-center gap-1.5">
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    {saved ? <Check size={12} /> : null}
                    {saved ? 'Saved' : 'Save Changes'}
                </button>
            </div>

            {error && <div className="text-xs text-rose-400">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registry.categories.map(cat => {
                    const perms = Object.entries(registry.permissions).filter(([_, info]) => info.category === cat.key);
                    if (!perms.length) return null;
                    return (
                        <div key={cat.key} className="space-y-1.5">
                            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">{cat.label}</div>
                            <div className="space-y-1">
                                {perms.map(([k, info]) => {
                                    const isDefault = roleDefaults.includes(k);
                                    const isChecked = checked.has(k);
                                    const isOverridden = isChecked !== isDefault;
                                    return (
                                        <label key={k} className="flex items-center gap-2 text-xs cursor-pointer select-none p-1 rounded hover:bg-slate-800/50">
                                            <input type="checkbox" checked={isChecked} onChange={() => toggle(k)}
                                                className="rounded border-slate-700 bg-slate-900 text-sky-400 h-3.5 w-3.5" />
                                            <span style={{ color: isChecked ? '#e2eaf4' : '#64748b' }}>{info.label}</span>
                                            {isOverridden && (
                                                <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold"
                                                    style={{ background: isChecked ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)', color: isChecked ? '#10b981' : '#f87171' }}>
                                                    {isChecked ? '+grant' : '-revoked'}
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Member card row ────────────────────────────────────────────────── */
function MemberCard({
    member, isAdmin, actionPending, onSuspend, onReactivate, catalog, registry, onPermissionsSaved,
}: {
    member: TeamMember; isAdmin: boolean; actionPending: boolean;
    onSuspend: () => void; onReactivate: () => void;
    catalog: RoleCatalog | null; registry: PermissionRegistry | null;
    onPermissionsSaved: (permissions: string[], overrides: { granted: string[]; revoked: string[] }) => void;
}) {
    const [showAccess, setShowAccess] = useState(false);
    const isOwner = member.role === 'provider_admin';
    const isInvited = member.status === 'invited';
    const isSuspended = member.status === 'suspended';

    return (
        <div className="rounded-2xl border p-4 transition-all" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: isInvited ? 'rgba(245,158,11,.15)' : isSuspended ? 'rgba(239,68,68,.15)' : 'rgba(56,189,248,.15)', color: isInvited ? '#f59e0b' : isSuspended ? '#ef4444' : '#38bdf8' }}>
                        {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm" style={{ color: '#e2eaf4' }}>{member.name}</span>
                            <RoleBadge role={member.role} catalog={catalog} />
                            {isInvited && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Invited
                                </span>
                            )}
                            {isSuspended && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Suspended
                                </span>
                            )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                            {member.email} · Last active: {timeAgo(member.lastActive)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                    {isAdmin && !isOwner && !isInvited && registry && (
                        <button onClick={() => setShowAccess(!showAccess)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                            style={{ borderColor: showAccess ? '#38bdf8' : 'rgba(56,189,248,.2)', color: showAccess ? '#38bdf8' : '#7ba3c8', background: showAccess ? 'rgba(56,189,248,.1)' : 'transparent' }}>
                            <Key size={12} />
                            <span>Permissions</span>
                            {showAccess ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    )}

                    {isAdmin && !isOwner && !isInvited && (
                        isSuspended ? (
                            <button onClick={onReactivate} disabled={actionPending}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-40">
                                Reactivate
                            </button>
                        ) : (
                            <button onClick={onSuspend} disabled={actionPending}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-40">
                                Suspend
                            </button>
                        )
                    )}
                </div>
            </div>

            {showAccess && registry && member.membershipId && (
                <AccessPanel member={member} registry={registry}
                    onSaved={(perms, overrides) => onPermissionsSaved(member.membershipId!, perms, overrides)} />
            )}
        </div>
    );
}

/* ─── Role Capabilities Reference Grid ───────────────────────────────── */
function RolesOverviewGrid() {
    const roles = [
        {
            title: 'Doctors & Clinicians',
            icon: Stethoscope,
            color: '#38bdf8',
            desc: 'Primary clinical care, diagnosis entry, consultations, prescriptions & lab orders',
        },
        {
            title: 'Nurses & Care Staff',
            icon: UserCheck,
            color: '#10b981',
            desc: 'Vitals recording, patient queue triage, triage encounters & care notes',
        },
        {
            title: 'Laboratory Scientists',
            icon: FlaskConical,
            color: '#a855f7',
            desc: 'Specimen intake, barcode labeling, test execution & diagnostic result releases',
        },
        {
            title: 'Pharmacy & Front Desk',
            icon: Pill,
            color: '#ec4899',
            desc: 'Medication dispensing, prescription fulfillment, appointment check-ins & patient search',
        },
    ];

    return (
        <div className="rounded-2xl border p-5 space-y-4" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.1)' }}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Shield size={15} className="text-sky-400" />
                <span>Facility Role Scopes & Access Boundaries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {roles.map((r, i) => {
                    const Icon = r.icon;
                    return (
                        <div key={i} className="p-3.5 rounded-xl border space-y-1.5" style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${r.color}15`, color: r.color }}>
                                    <Icon size={13} />
                                </div>
                                <div className="text-xs font-bold text-slate-200">{r.title}</div>
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: '#7ba3c8' }}>
                                {r.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Main Team Management Page ──────────────────────────────────────── */
export function TeamManagementPage() {
    const { user } = useAuth();
    const isAdmin = (user as any)?.role === 'provider_admin';

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [roleCatalog, setRoleCatalog] = useState<RoleCatalog | null>(null);
    const [permissionRegistry, setPermissionRegistry] = useState<PermissionRegistry | null>(null);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [modalOpen, setModalOpen] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<MembershipRole>('doctor');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await teamApi.listMembers();
            setMembers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load team members');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchMembers(); }, []);

    useEffect(() => {
        teamApi.getRoleCatalog()
            .then((catalog) => {
                setRoleCatalog(catalog);
                if (catalog.roles.length && !catalog.roles.includes(inviteRole)) {
                    setInviteRole(catalog.roles[0]);
                }
            })
            .catch((err) => console.warn('Could not load role catalog:', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        teamApi.getPermissionRegistry()
            .then(setPermissionRegistry)
            .catch((err) => console.warn('Could not load permission registry:', err));
    }, []);

    const handlePermissionsSaved = (membershipId: string, permissions: string[], overrides: { granted: string[]; revoked: string[] }) => {
        setMembers(prev => prev.map(m => m.membershipId === membershipId
            ? { ...m, permissions, permissionOverrides: overrides }
            : m));
    };

    // Filter out clinician duplicate so only doctor is presented in invite dropdown
    const inviteRoles: MembershipRole[] = (
        roleCatalog?.roles ?? (Object.keys(INVITE_ROLE_LABELS) as MembershipRole[])
    ).filter((r, idx, arr) => r !== 'clinician' && arr.indexOf(r) === idx);

    // De-duplicate roles in filter bar: merge 'clinician' into 'doctor'
    const rawFilterRoles = Array.from(new Set([...inviteRoles, ...members.map(m => (m.role === 'clinician' ? 'doctor' : m.role))]));
    const filterRoles = rawFilterRoles.filter(r => r !== 'clinician');

    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const effectiveMemberRole = m.role === 'clinician' ? 'doctor' : m.role;
        const matchRole = roleFilter === 'all' || effectiveMemberRole === roleFilter;
        return matchSearch && matchRole;
    });

    const activeCount = members.filter(m => m.status === 'active').length;
    const pendingCount = members.filter(m => m.status === 'invited').length;

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendError(null);
        setSending(true);
        try {
            await teamApi.invite({ fullName: inviteName, email: inviteEmail, membershipRole: inviteRole });
            setSent(true);
            setTimeout(() => {
                setModalOpen(false);
                setSent(false);
                setInviteName('');
                setInviteEmail('');
                fetchMembers();
            }, 1200);
        } catch (err: any) {
            setSendError(err.message || 'Failed to send invite');
        } finally { setSending(false); }
    };

    const suspend = async (id: string) => {
        setPendingAction(id);
        try {
            await teamApi.suspend(id);
            fetchMembers();
        } catch (err: any) { setError(err.message); }
        finally { setPendingAction(null); }
    };

    const reactivate = async (id: string) => {
        setPendingAction(id);
        try {
            await teamApi.reactivate(id);
            fetchMembers();
        } catch (err: any) { setError(err.message); }
        finally { setPendingAction(null); }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6 text-slate-100 font-sans" style={{ background: '#050d1a' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2eaf4' }}>
                        Team & Personnel Management
                    </h1>
                    <p className="text-xs mt-1" style={{ color: '#7ba3c8' }}>
                        Manage clinical staff, role-based access controls, and organization invitations.
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all text-slate-950 bg-sky-400 hover:bg-sky-300">
                        <Plus size={16} /> Invite Team Member
                    </button>
                )}
            </div>

            {/* KPI Cards — Color Mapped to Meaning */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total Staff (Neutral Slate/Navy) */}
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: '#163761' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7ba3c8' }}>Total Staff</div>
                    <div className="text-2xl font-black mt-1" style={{ color: '#e2eaf4' }}>{members.length}</div>
                </div>

                {/* Active Members (Positive Emerald) */}
                <div className="rounded-2xl border p-4" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active Members</div>
                    <div className="text-2xl font-black mt-1 text-emerald-400">{activeCount}</div>
                </div>

                {/* Pending Invites (Action Attention Amber) */}
                <div className="rounded-2xl border p-4" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Invites</div>
                    <div className="text-2xl font-black mt-1 text-amber-400">{pendingCount}</div>
                </div>

                {/* Your Role (Neutral Profile Badge) */}
                <div className="rounded-2xl border p-4 flex flex-col justify-between" style={{ background: '#0a192f', borderColor: '#163761' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7ba3c8' }}>Your Role</div>
                    <div className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 capitalize">
                            <Shield size={12} className="text-sky-400" />
                            {user?.roles?.[0]?.replace('_', ' ') ?? 'Admin'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a6f96' }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="input input-dark w-full text-xs" style={{ paddingLeft: '2rem' }} />
                </div>
                <div className="flex gap-1 flex-wrap">
                    {['all', ...filterRoles].map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: roleFilter === r ? '#38bdf8' : 'rgba(56,189,248,.06)',
                                color: roleFilter === r ? '#050d1a' : '#7ba3c8',
                            }}>
                            {r === 'all' ? 'All Roles' : labelForRole(r, roleCatalog)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-4 rounded-xl border flex items-center justify-between text-xs text-rose-400"
                    style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                    <span>{error}</span>
                    <button onClick={fetchMembers} className="font-bold underline">Retry</button>
                </div>
            )}

            {/* Member List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="p-12 text-center text-xs animate-pulse" style={{ color: '#7ba3c8' }}>
                        Loading team directory...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-xs rounded-2xl border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)', color: '#4a6f96' }}>
                        No members match your filter criteria.
                    </div>
                ) : (
                    filtered.map(m => (
                        <MemberCard key={m.membershipId ?? m.inviteId ?? m.userId} member={m} isAdmin={isAdmin}
                            actionPending={pendingAction === m.membershipId}
                            onSuspend={() => m.membershipId && suspend(m.membershipId)}
                            onReactivate={() => m.membershipId && reactivate(m.membershipId)}
                            catalog={roleCatalog}
                            registry={permissionRegistry}
                            onPermissionsSaved={handlePermissionsSaved}
                        />
                    ))
                )}
            </div>

            {/* Getting-Started & Team Expansion Prompt (Reclaims empty space) */}
            {isAdmin && (
                <div className="rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    style={{ background: 'rgba(56,189,248,0.03)', borderColor: 'rgba(56,189,248,0.18)' }}>
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-sky-500/10 text-sky-400">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-100">Expand Your Facility's Care Team</h3>
                            <p className="text-xs mt-0.5 max-w-xl leading-relaxed" style={{ color: '#7ba3c8' }}>
                                Invite medical doctors, nurses, pharmacists, and lab scientists to streamline consultations and order fulfillment. Each role comes preconfigured with appropriate clinical access boundaries.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                        <Plus size={14} /> Invite New Staff
                    </button>
                </div>
            )}

            {/* Role Capabilities Reference Grid */}
            <RolesOverviewGrid />

            {/* Invite Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,13,26,.8)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl relative"
                        style={{ background: '#0c203b', borderColor: 'rgba(56,189,248,.2)' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg" style={{ color: '#e2eaf4' }}>Invite Team Member</h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                        </div>

                        {sent ? (
                            <div className="p-8 text-center space-y-2">
                                <CheckCircle size={40} className="mx-auto text-emerald-400 animate-bounce" />
                                <div className="font-bold text-sm text-emerald-400">Invitation Sent!</div>
                                <p className="text-xs" style={{ color: '#7ba3c8' }}>An email invitation link has been dispatched to {inviteEmail}.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendInvite} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Full Name</label>
                                    <input type="text" required value={inviteName} onChange={e => setInviteName(e.target.value)}
                                        placeholder="Dr. Jane Doe" className="input input-dark w-full text-xs" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Email Address</label>
                                    <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="jane.doe@hospital.com" className="input input-dark w-full text-xs" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Role</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {inviteRoles.map(role => {
                                            const m = ROLE_META[role];
                                            const label = labelForRole(role, roleCatalog);
                                            return (
                                                <button key={role} type="button" onClick={() => setInviteRole(role)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all"
                                                    style={{
                                                        borderColor: inviteRole === role ? (m?.color ?? '#38bdf8') : 'rgba(56,189,248,.12)',
                                                        background: inviteRole === role ? `${m?.color ?? '#38bdf8'}18` : 'transparent',
                                                        color: inviteRole === role ? (m?.color ?? '#38bdf8') : '#7ba3c8',
                                                    }}>
                                                    {m?.icon}
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {sendError && (
                                    <div className="p-3 rounded-xl border text-xs text-rose-400 flex items-center gap-2"
                                        style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                                        <AlertTriangle size={14} /> {sendError}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button type="button" onClick={() => setModalOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-xs border text-slate-300 hover:text-white"
                                        style={{ borderColor: 'rgba(255,255,255,.1)' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={sending}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50">
                                        {sending ? 'Sending Invite...' : 'Send Invitation'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
