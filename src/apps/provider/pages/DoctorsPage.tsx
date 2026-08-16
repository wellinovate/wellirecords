import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teamApi, TeamMember, PermissionRegistry } from '@/shared/api/teamApi';
import AddDoctorModal from '@/apps/components/AddDoctorModal';
import { AccessPanel } from '@/apps/provider/components/AccessPanel';
import {
    Plus, Search, Stethoscope, Clock, Key, MoreVertical, UserX, UserCheck,
    CheckCircle, AlertTriangle, X, Loader2, ChevronDown, ChevronUp, UserPlus,
    Building2, ShieldCheck, Users, Calendar, Activity,
} from 'lucide-react';

function timeAgo(iso?: string | null) {
    if (!iso) return 'Never';
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ─── Status badge ───────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: TeamMember['status'] }) {
    const meta = {
        active: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,.12)' },
        invited: { label: 'Invite pending', color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
        suspended: { label: 'Suspended', color: '#ef4444', bg: 'rgba(239,68,68,.12)' },
    }[status];
    return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
        </span>
    );
}

/* ─── Doctor card ─────────────────────────────────────────────────────── */
function DoctorCard({
    member, isAdmin, onSuspend, onReactivate, actionPending, registry, onPermissionsSaved,
}: {
    member: TeamMember; isAdmin: boolean;
    onSuspend: () => void; onReactivate: () => void;
    actionPending: boolean;
    registry: PermissionRegistry | null;
    onPermissionsSaved: (membershipId: string, permissions: string[], overrides: { granted: string[]; revoked: string[] }) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [accessOpen, setAccessOpen] = useState(false);
    const active = member.status === 'active';
    const pending = member.status === 'invited';
    const canManageAccess = isAdmin && !pending && member.membershipId && registry;

    const overrideCount = (member.permissionOverrides?.granted?.length || 0) + (member.permissionOverrides?.revoked?.length || 0);
    const accessLabel = !active
        ? (member.status === 'suspended' ? 'Access Suspended' : 'Invite Pending')
        : overrideCount > 0
            ? `Custom Access (${overrideCount} override${overrideCount > 1 ? 's' : ''})`
            : 'Full Clinical Access';

    return (
        <div className="rounded-2xl border p-4.5 space-y-3" style={{ background: '#0a192f', borderColor: active ? 'rgba(56,189,248,.15)' : 'rgba(239,68,68,.2)' }}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-xl font-extrabold text-sm flex items-center justify-center border"
                            style={{
                                background: '#0c2444',
                                color: active ? '#38bdf8' : '#ef4444',
                                borderColor: active ? 'rgba(56,189,248,.25)' : 'rgba(239,68,68,.3)',
                            }}>
                            {initials(member.name)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a192f]"
                            style={{ background: active ? '#10b981' : pending ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm truncate" style={{ color: '#e2eaf4' }}>{member.name}</span>
                            <StatusBadge status={member.status} />
                        </div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: '#7ba3c8' }}>{member.email}</div>
                        <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#4a6f96' }}>
                            <Clock size={10} /> Last active: {timeAgo(member.lastActive)}
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="relative shrink-0">
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
                                    {canManageAccess && (
                                        <button onClick={() => { setMenuOpen(false); setAccessOpen(true); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-sky-400 hover:bg-sky-500/10">
                                            <Key size={13} /> Manage access
                                        </button>
                                    )}
                                    {!pending && (active ? (
                                        <button onClick={() => { setMenuOpen(false); onSuspend(); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:bg-rose-500/10">
                                            <UserX size={13} /> Suspend
                                        </button>
                                    ) : (
                                        <button onClick={() => { setMenuOpen(false); onReactivate(); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-emerald-400 hover:bg-emerald-500/10">
                                            <UserCheck size={13} /> Reactivate
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Specialty, Department & Patient Assignment Field */}
            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                    <Stethoscope size={13} className="text-sky-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-200">General Medicine & Surgery</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Outpatient Dept (OPD)</span>
                </div>
                {active && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        On Call · OPD Queue
                    </span>
                )}
            </div>

            {/* Current Access Dropdown Trigger with Explicit State Label */}
            {canManageAccess && (
                <div className="pt-1">
                    <button
                        type="button"
                        onClick={() => setAccessOpen((o) => !o)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{
                            borderColor: accessOpen ? '#38bdf8' : 'rgba(56,189,248,.18)',
                            color: accessOpen ? '#38bdf8' : '#94a3b8',
                            background: accessOpen ? 'rgba(56,189,248,.08)' : 'rgba(255,255,255,0.02)',
                        }}
                    >
                        <Key size={12} className="text-sky-400" />
                        <span>{accessLabel}</span>
                        {accessOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>
            )}

            {accessOpen && canManageAccess && registry && (
                <AccessPanel
                    member={member}
                    registry={registry}
                    onSaved={(permissions, overrides) => onPermissionsSaved(member.membershipId!, permissions, overrides)}
                />
            )}
        </div>
    );
}

/* ─── Clinical Duty & Queue Routing Overview ─────────────────────────── */
function ClinicalRosterCard() {
    return (
        <div className="rounded-2xl border p-5 space-y-4" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.1)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'rgba(56,189,248,.1)' }}>
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-sky-400" />
                    <h3 className="text-sm font-bold text-slate-100">Today's Clinical Roster & Consultation Queue Routing</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Live Routing Active
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border space-y-1" style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761' }}>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Building2 size={13} className="text-sky-400" />
                        <span>Outpatient Clinic (OPD 1 & 2)</span>
                    </div>
                    <p className="text-[11px]" style={{ color: '#7ba3c8' }}>
                        Assigned on-call physicians automatically receive checked-in patients from reception front desk.
                    </p>
                </div>

                <div className="p-3.5 rounded-xl border space-y-1" style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761' }}>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-400" />
                        <span>Clinical Signing Authority</span>
                    </div>
                    <p className="text-[11px]" style={{ color: '#7ba3c8' }}>
                        All active physicians hold full prescription dispatch, encounter sign-off, and lab order creation rights.
                    </p>
                </div>

                <div className="p-3.5 rounded-xl border space-y-1" style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761' }}>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Calendar size={13} className="text-purple-400" />
                        <span>Shift Coverage</span>
                    </div>
                    <p className="text-[11px]" style={{ color: '#7ba3c8' }}>
                        Morning & Afternoon rotations: 08:00 – 18:00 WAT. Critical alerts route to active on-duty devices.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Invite (Path B — no existing account) ──────────────────────────── */
function InviteDoctorForm({ onSent }: { onSent: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSending(true);
        try {
            await teamApi.invite({ fullName: name, email, membershipRole: 'doctor' });
            setSent(true);
            setTimeout(onSent, 1200);
        } catch (err: any) {
            setError(err.message || 'Failed to send invite');
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="p-8 text-center space-y-2">
                <CheckCircle size={40} className="mx-auto text-emerald-400" />
                <div className="font-bold text-sm text-emerald-400">Invitation sent</div>
                <p className="text-xs" style={{ color: '#7ba3c8' }}>An invite link has been emailed to {email}.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#7ba3c8' }}>Doctor's full name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Dr. Ngozi Eze" className="input input-dark w-full text-xs" />
            </div>
            <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#7ba3c8' }}>Email address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="ngozi.eze@hospital.ng" className="input input-dark w-full text-xs" />
            </div>
            <p className="text-[11px]" style={{ color: '#4a6f96' }}>
                They'll receive an invitation link by email to set their password and join your facility as a doctor.
            </p>
            {error && (
                <div className="p-3 rounded-xl border text-xs text-rose-400 flex items-center gap-2"
                    style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                    <AlertTriangle size={14} /> {error}
                </div>
            )}
            <button type="submit" disabled={sending}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 transition-all">
                {sending ? 'Sending invitation...' : 'Send invitation'}
            </button>
        </form>
    );
}

/* ─── Combined invite modal ──────────────────────────────────────────── */
function InviteDoctorModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
    const [tab, setTab] = useState<'link' | 'invite'>('link');
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,13,26,.8)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-lg rounded-3xl border p-6 space-y-5 shadow-2xl relative"
                style={{ background: '#0c203b', borderColor: 'rgba(56,189,248,.2)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-lg" style={{ color: '#e2eaf4' }}>Add Doctor to Facility</h3>
                        <p className="text-xs" style={{ color: '#7ba3c8' }}>Grant clinical consultation and prescription capabilities</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(56,189,248,.06)' }}>
                    <button type="button" onClick={() => setTab('link')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        style={{
                            background: tab === 'link' ? '#38bdf8' : 'transparent',
                            color: tab === 'link' ? '#050d1a' : '#7ba3c8',
                        }}>
                        <Search size={13} /> Link existing doctor
                    </button>
                    <button type="button" onClick={() => setTab('invite')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        style={{
                            background: tab === 'invite' ? '#38bdf8' : 'transparent',
                            color: tab === 'invite' ? '#050d1a' : '#7ba3c8',
                        }}>
                        <Mail size={13} /> Invite by email
                    </button>
                </div>

                {tab === 'link' ? (
                    <AddDoctorModal
                        isOpen={true}
                        onClose={onClose}
                        onSuccess={() => { onDone(); onClose(); }}
                        inline
                    />
                ) : (
                    <InviteDoctorForm onSent={() => { onDone(); onClose(); }} />
                )}
            </div>
        </div>
    );
}

/* ─── Main page ──────────────────────────────────────────────────────── */
export function DoctorsPage() {
    const { user } = useAuth();
    const isAdmin = (user as any)?.role === 'provider_admin';

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'invited' | 'suspended'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [permissionRegistry, setPermissionRegistry] = useState<PermissionRegistry | null>(null);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await teamApi.listMembers();
            setMembers(data.filter(m => m.role === 'doctor' || m.role === 'clinician'));
        } catch (err: any) {
            setError(err.message || 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        teamApi.getPermissionRegistry()
            .then(setPermissionRegistry)
            .catch((err) => console.warn('Could not load permission registry:', err));
    }, []);

    const handlePermissionsSaved = (membershipId: string, permissions: string[], overrides: { granted: string[]; revoked: string[] }) => {
        setMembers(prev => prev.map(m => m.membershipId === membershipId
            ? { ...m, permissions, permissionOverrides: overrides }
            : m));
    };

    const suspend = async (id: string) => {
        setPendingAction(id);
        try {
            await teamApi.suspend(id);
            fetchDoctors();
        } catch (err: any) { setError(err.message); }
        finally { setPendingAction(null); }
    };

    const reactivate = async (id: string) => {
        setPendingAction(id);
        try {
            await teamApi.reactivate(id);
            fetchDoctors();
        } catch (err: any) { setError(err.message); }
        finally { setPendingAction(null); }
    };

    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const activeCount = members.filter(m => m.status === 'active').length;
    const pendingCount = members.filter(m => m.status === 'invited').length;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6 text-slate-100 font-sans" style={{ background: '#050d1a' }}>
            {/* Header & Sub-nav Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                        <Stethoscope size={24} className="text-sky-400" /> Clinical Physicians & Roster
                    </h1>
                    <p className="text-xs mt-1" style={{ color: '#7ba3c8' }}>
                        Physician credentialing, clinical specialties, and patient queue assignments
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all text-slate-950 bg-sky-400 hover:bg-sky-300">
                        <Plus size={16} /> Invite Physician
                    </button>
                )}
            </div>

            {/* Navigation Switcher between All Staff and Clinical Roster */}
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'rgba(56,189,248,.12)' }}>
                <Link
                    to="/provider/team"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                >
                    <span className="flex items-center gap-1.5">
                        <Users size={13} /> All Facility Staff (RBAC)
                    </span>
                </Link>
                <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <span className="flex items-center gap-1.5">
                        <Stethoscope size={13} /> Physicians & Clinical Roster
                    </span>
                </div>
            </div>

            {/* Meaning-Mapped KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border p-4.5" style={{ background: '#0a192f', borderColor: '#163761' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Physicians</div>
                    <div className="text-2xl font-black mt-1 text-slate-100">{members.length}</div>
                </div>
                <div className="rounded-2xl border p-4.5" style={{ background: 'rgba(16,185,129,.05)', borderColor: 'rgba(16,185,129,.2)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active On Duty</div>
                    <div className="text-2xl font-black mt-1 text-emerald-400">{activeCount}</div>
                </div>
                <div className="rounded-2xl border p-4.5" style={{ background: 'rgba(245,158,11,.05)', borderColor: 'rgba(245,158,11,.2)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Invites</div>
                    <div className="text-2xl font-black mt-1 text-amber-400">{pendingCount}</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a6f96' }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search physician by name or email..."
                        className="input input-dark w-full text-xs" style={{ paddingLeft: '2rem' }} />
                </div>
                <div className="flex gap-1 flex-wrap">
                    {(['all', 'active', 'invited', 'suspended'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                            style={{
                                background: statusFilter === s ? '#38bdf8' : 'rgba(56,189,248,.06)',
                                color: statusFilter === s ? '#050d1a' : '#7ba3c8',
                            }}>
                            {s === 'all' ? 'All Physicians' : s === 'invited' ? 'Pending Invites' : s}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl border flex items-center justify-between text-xs text-rose-400"
                    style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                    <span>{error}</span>
                    <button onClick={fetchDoctors} className="font-bold underline">Retry</button>
                </div>
            )}

            {/* Directory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                    <div className="col-span-full p-12 text-center text-xs animate-pulse" style={{ color: '#7ba3c8' }}>
                        Loading clinical physicians...
                    </div>
                ) : filtered.length === 0 && members.length === 0 ? (
                    <div className="col-span-full p-12 text-center rounded-2xl border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)' }}>
                        <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>No physicians registered yet</p>
                        <p className="mt-2 text-xs" style={{ color: '#4a6f96' }}>
                            Click "Invite Physician" to link an existing doctor account or send an email onboarding invitation.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-xs rounded-2xl border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)', color: '#4a6f96' }}>
                        No physicians match your filter.
                    </div>
                ) : filtered.map(m => (
                    <DoctorCard key={m.membershipId ?? m.inviteId ?? m.userId} member={m} isAdmin={isAdmin}
                        actionPending={pendingAction === m.membershipId}
                        onSuspend={() => m.membershipId && suspend(m.membershipId)}
                        onReactivate={() => m.membershipId && reactivate(m.membershipId)}
                        registry={permissionRegistry}
                        onPermissionsSaved={handlePermissionsSaved}
                    />
                ))}
            </div>

            {/* Lower Page Roster & Queue Routing Context */}
            <ClinicalRosterCard />

            <InviteDoctorModal open={modalOpen} onClose={() => setModalOpen(false)} onDone={fetchDoctors} />
        </div>
    );
}

export default DoctorsPage;
