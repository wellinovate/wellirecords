import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teamApi, TeamMember, MembershipRole, RoleCatalog } from '@/shared/api/teamApi';
import {
    Plus, Mail, X, CheckCircle, Shield, Clock, Activity,
    MoreVertical, UserCheck, UserX, Key, Search,
    Users, FlaskConical, Stethoscope, AlertTriangle, Pill, UserCog, UserCheck as UserIcon,
} from 'lucide-react';

/* ─── Role config ────────────────────────────────────────────────────── */
// Base labels/colors for every role that exists anywhere in the system.
// Which of these a given facility can actually invite is filtered at
// render time by roleCatalog (fetched per-org from the backend) — a
// diagnostic lab never sees "Nurse", an eye-care hospital sees
// "Optician / Ophthalmologist" instead of a plain "Doctor" label.
const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    provider_admin: { label: 'Admin', color: '#f59e0b', bg: '#fef3c7', icon: <Shield size={11} /> },
    clinician: { label: 'Clinician', color: '#38bdf8', bg: '#e0f2fe', icon: <UserCheck size={11} /> },
    doctor: { label: 'Doctor', color: '#38bdf8', bg: '#e0f2fe', icon: <Stethoscope size={11} /> },
    nurse: { label: 'Nurse', color: '#10b981', bg: '#d1fae5', icon: <UserCheck size={11} /> },
    lab_tech: { label: 'Lab Tech', color: '#a855f7', bg: '#f3e8ff', icon: <FlaskConical size={11} /> },
    pharmacist: { label: 'Pharmacist', color: '#ec4899', bg: '#fce7f3', icon: <Pill size={11} /> },
    frontdesk: { label: 'Front Desk', color: '#6366f1', bg: '#e0e7ff', icon: <UserCog size={11} /> },
    insurer_agent: { label: 'Insurer Agent', color: '#f97316', bg: '#ffedd5', icon: <UserIcon size={11} /> },
    support_staff: { label: 'Support Staff', color: '#6b7280', bg: '#f3f4f6', icon: <Users size={11} /> },
};

// Full label set the invite modal can offer, keyed by role. The
// dropdown only shows the subset present in roleCatalog.roles, in
// that order, with roleCatalog.labelOverrides applied on top.
const INVITE_ROLE_LABELS: Record<MembershipRole, string> = {
    provider_admin: 'Org Administrator',
    doctor: 'Doctor',
    clinician: 'Doctor / Clinician',
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

/* ─── Member card ────────────────────────────────────────────────────── */
function MemberCard({
    member, isAdmin, onSuspend, onReactivate, actionPending, catalog,
}: {
    member: TeamMember; isAdmin: boolean;
    onSuspend: () => void; onReactivate: () => void;
    actionPending: boolean; catalog: RoleCatalog | null;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const active = member.status === 'active';
    const pending = member.status === 'invited';

    return (
        <div className="rounded-2xl border p-4 flex items-center justify-between gap-3 transition-all relative hover:border-sky-500/30"
            style={{ background: '#0a192f', borderColor: active ? 'rgba(56,189,248,.12)' : 'rgba(239,68,68,.2)' }}>
            <div className="relative">
                <div className="w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center border shrink-0"
                    style={{
                        background: active ? 'linear-[#0c2444]' : '#1a0d1a',
                        color: active ? '#38bdf8' : '#ef4444',
                        borderColor: active ? 'rgba(56,189,248,.25)' : 'rgba(239,68,68,.3)',
                    }}>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a192f]"
                    style={{ background: active ? '#10b981' : pending ? '#f59e0b' : '#ef4444' }} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: '#e2eaf4' }}>{member.name}</span>
                    <RoleBadge role={member.role} catalog={catalog} />
                    {pending && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Invite Pending</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>{member.email}</div>
                <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#4a6f96' }}>
                    <Clock size={9} /> Last active: {timeAgo(member.lastActive)}
                </div>
            </div>

            {isAdmin && member.role !== 'provider_admin' && (
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} disabled={actionPending}
                        className="p-2 rounded-xl transition-all border text-slate-400 hover:text-white"
                        style={{ background: 'rgba(255,255,255,.04)', borderColor: 'rgba(255,255,255,.08)' }}>
                        <MoreVertical size={15} />
                    </button>

                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border p-1 z-20 shadow-2xl space-y-0.5"
                                style={{ background: '#0c203b', borderColor: 'rgba(56,189,248,.2)' }}>
                                {active ? (
                                    <button onClick={() => { setMenuOpen(false); onSuspend(); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:bg-rose-500/10">
                                        <UserX size={13} /> Suspend Member
                                    </button>
                                ) : (
                                    <button onClick={() => { setMenuOpen(false); onReactivate(); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-emerald-400 hover:bg-emerald-500/10">
                                        <UserCheck size={13} /> Reactivate Member
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function TeamManagementPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [modalOpen, setModalOpen] = useState(false);

    // Invite form
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<MembershipRole>('clinician');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    // Which roles this facility's invite dropdown offers — fetched once
    // per session. Null while loading; the invite button stays enabled
    // but falls back to the full role list rather than blocking on it.
    const [roleCatalog, setRoleCatalog] = useState<RoleCatalog | null>(null);

    const isAdmin = user?.roles?.includes('provider_admin') ?? true;

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

    // The roles a new invite can be sent as — from the catalog once
    // loaded, falling back to every non-admin invite role so the modal
    // is never empty during the brief window before the catalog loads.
    const inviteRoles: MembershipRole[] = roleCatalog?.roles
        ?? (Object.keys(INVITE_ROLE_LABELS) as MembershipRole[]).filter(r => r !== 'doctor');

    // Role filter chips: the current catalog, plus any role that
    // already exists among fetched members (covers legacy members
    // whose role predates a facility-type change, or fell outside the
    // catalog for any other reason) — never hide someone's real role.
    const filterRoles = Array.from(new Set([...inviteRoles, ...members.map(m => m.role)]));

    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || m.role === roleFilter;
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

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7ba3c8' }}>Total Staff</div>
                    <div className="text-2xl font-black mt-1" style={{ color: '#38bdf8' }}>{members.length}</div>
                </div>
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(16,185,129,.15)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active Members</div>
                    <div className="text-2xl font-black mt-1 text-emerald-400">{activeCount}</div>
                </div>
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(245,158,11,.15)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Invites</div>
                    <div className="text-2xl font-black mt-1 text-amber-400">{pendingCount}</div>
                </div>
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(168,85,247,.15)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Your Role</div>
                    <div className="text-sm font-black mt-2 text-purple-300 capitalize">{user?.roles?.[0]?.replace('_', ' ') ?? 'Admin'}</div>
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
                ) : filtered.map(m => (
                    <MemberCard key={m.membershipId ?? m.inviteId ?? m.userId} member={m} isAdmin={isAdmin}
                        actionPending={pendingAction === m.membershipId}
                        onSuspend={() => m.membershipId && suspend(m.membershipId)}
                        onReactivate={() => m.membershipId && reactivate(m.membershipId)}
                        catalog={roleCatalog}
                    />
                ))}
            </div>

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
