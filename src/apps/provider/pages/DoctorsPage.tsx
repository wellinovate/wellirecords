import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teamApi, TeamMember, PermissionRegistry } from '@/shared/api/teamApi';
import AddDoctorModal from '@/apps/components/AddDoctorModal';
import {
    Plus, Search, Stethoscope, Clock, Key, MoreVertical, UserX, UserCheck,
    CheckCircle, AlertTriangle, X, Loader2, ChevronDown, ChevronUp, UserPlus, Mail,
} from 'lucide-react';

// This page is a doctor-filtered view of the same organization
// membership data TeamManagementPage renders — same backend endpoints
// (teamApi), same OrganizationMembership records. Two paths land a
// doctor here: linked through the "search existing account" flow
// (AddDoctorModal, the older memberships/doctors endpoints) or invited
// by email through teamApi.invite with membershipRole locked to
// "doctor". Both write to the same collection, so both show up in the
// same list below regardless of which path was used.
//
// Deliberately doesn't show per-doctor workload numbers (patients
// today, pending reviews, availability) — there's no encounter/queue
// aggregation wired up yet to back those with real numbers, and
// showing made-up ones isn't an option. That's a separate, later
// piece of work once that data actually exists.

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

/* ─── Access panel (reused pattern from TeamManagementPage) ─────────── */
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
            const result = await teamApi.updateMemberPermissions(member.membershipId!, granted, revoked);
            onSaved(result.permissions, result.permissionOverrides);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't save access — try again.");
        } finally {
            setSaving(false);
        }
    };

    const dirty = (() => {
        const granted = [...checked].filter(k => !roleDefaults.includes(k)).sort();
        const revoked = roleDefaults.filter(k => !checked.has(k)).sort();
        const currentGranted = [...(member.permissionOverrides?.granted ?? [])].sort();
        const currentRevoked = [...(member.permissionOverrides?.revoked ?? [])].sort();
        return JSON.stringify(granted) !== JSON.stringify(currentGranted) || JSON.stringify(revoked) !== JSON.stringify(currentRevoked);
    })();

    return (
        <div className="mt-2 rounded-2xl border p-4 space-y-4" style={{ background: '#081426', borderColor: 'rgba(56,189,248,.12)' }}>
            {registry.categories.map(cat => {
                const keysInCategory = Object.entries(registry.permissions).filter(([, v]) => v.category === cat.key);
                if (!keysInCategory.length) return null;
                return (
                    <div key={cat.key}>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#4a6f96' }}>{cat.label}</div>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                            {keysInCategory.map(([key, info]) => (
                                <label key={key} className="flex items-start gap-2 text-xs cursor-pointer select-none"
                                    style={{ color: checked.has(key) ? '#e2eaf4' : '#4a6f96' }}>
                                    <input type="checkbox" checked={checked.has(key)} onChange={() => toggle(key)}
                                        className="mt-0.5 accent-sky-400" />
                                    <span>
                                        {info.label}
                                        {roleDefaults.includes(key) && (
                                            <span className="ml-1.5 text-[9px] font-semibold" style={{ color: '#3e5a78' }}>(default)</span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="flex items-center gap-3 pt-1">
                <button onClick={save} disabled={!dirty || saving}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-40">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    {saving ? 'Saving…' : 'Save access'}
                </button>
                {saved && <span className="text-xs" style={{ color: '#34d399' }}>Saved.</span>}
                {error && <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>}
            </div>
        </div>
    );
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

    return (
        <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: active ? 'rgba(56,189,248,.12)' : 'rgba(239,68,68,.2)' }}>
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
                            <Clock size={9} /> Last active: {timeAgo(member.lastActive)}
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

            {canManageAccess && (
                <button onClick={() => setAccessOpen(o => !o)}
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#4a6f96' }}>
                    <Key size={11} /> Access {accessOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
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
                <p className="text-xs" style={{ color: '#7ba3c8' }}>{email} can now create their own WelliRecord account and join your organization.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Full name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Dr. Jane Oseji" className="input input-dark w-full text-xs" />
            </div>
            <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ba3c8' }}>Work email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="jane.oseji@hospital.com" className="input input-dark w-full text-xs" />
            </div>
            <p className="text-[11px]" style={{ color: '#4a6f96' }}>
                They'll get an email with a link to set their own password and create their account. Your admin login is never shared with them.
            </p>
            {error && (
                <div className="p-3 rounded-xl border text-xs text-rose-400 flex items-center gap-2"
                    style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                    <AlertTriangle size={14} /> {error}
                </div>
            )}
            <button type="submit" disabled={sending}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                {sending ? 'Sending…' : 'Send secure invitation'}
            </button>
        </form>
    );
}

/* ─── Invite chooser modal ───────────────────────────────────────────── */
function InviteDoctorModal({
    open, onClose, onDone,
}: { open: boolean; onClose: () => void; onDone: () => void }) {
    const { user } = useAuth();
    const [path, setPath] = useState<'choose' | 'search' | 'invite'>('choose');

    const handleClose = () => {
        setPath('choose');
        onClose();
    };

    if (!open) return null;

    if (path === 'search') {
        return (
            <AddDoctorModal
                open
                onClose={handleClose}
                hospitalId={(user as any)?.sub}
                onDoctorAdded={() => { onDone(); handleClose(); }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,13,26,.8)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl relative"
                style={{ background: '#0c203b', borderColor: 'rgba(56,189,248,.2)' }}>
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg" style={{ color: '#e2eaf4' }}>Invite doctor</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                {path === 'choose' && (
                    <div className="space-y-2">
                        <p className="text-xs mb-3" style={{ color: '#7ba3c8' }}>
                            Does this doctor already have a WelliRecord account?
                        </p>
                        <button onClick={() => setPath('search')}
                            className="w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:border-sky-400/40"
                            style={{ borderColor: 'rgba(56,189,248,.15)', background: 'rgba(56,189,248,.04)' }}>
                            <Search size={18} className="text-sky-400 mt-0.5 shrink-0" />
                            <div>
                                <div className="text-sm font-bold" style={{ color: '#e2eaf4' }}>Yes — search for their account</div>
                                <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>Find them by WelliRecord ID, email, or phone and link their existing account.</div>
                            </div>
                        </button>
                        <button onClick={() => setPath('invite')}
                            className="w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:border-sky-400/40"
                            style={{ borderColor: 'rgba(56,189,248,.15)', background: 'rgba(56,189,248,.04)' }}>
                            <UserPlus size={18} className="text-sky-400 mt-0.5 shrink-0" />
                            <div>
                                <div className="text-sm font-bold" style={{ color: '#e2eaf4' }}>No — send an invitation</div>
                                <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>They'll create their own account and join your organization.</div>
                            </div>
                        </button>
                    </div>
                )}

                {path === 'invite' && (
                    <InviteDoctorForm onSent={() => { onDone(); handleClose(); }} />
                )}
            </div>
        </div>
    );
}

/* ─── Main page ───────────────────────────────────────────────────────── */
export function DoctorsPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | TeamMember['status']>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [permissionRegistry, setPermissionRegistry] = useState<PermissionRegistry | null>(null);

    const isAdmin = user?.roles?.includes('provider_admin') ?? true;

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await teamApi.listMembers();
            setMembers(all.filter(m => m.role === 'doctor'));
        } catch (err: any) {
            setError(err.message || 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                        <Stethoscope size={22} className="text-sky-400" /> Doctors
                    </h1>
                    <p className="text-xs mt-1" style={{ color: '#7ba3c8' }}>
                        Clinical team, assignments &amp; patient care
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all text-slate-950 bg-sky-400 hover:bg-sky-300">
                        <Plus size={16} /> Invite Doctor
                    </button>
                )}
            </div>

            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7ba3c8' }}>Doctors</div>
                    <div className="text-2xl font-black mt-1" style={{ color: '#38bdf8' }}>{members.length}</div>
                </div>
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(16,185,129,.15)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active</div>
                    <div className="text-2xl font-black mt-1 text-emerald-400">{activeCount}</div>
                </div>
                <div className="rounded-2xl border p-4" style={{ background: '#0a192f', borderColor: 'rgba(245,158,11,.15)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Invite pending</div>
                    <div className="text-2xl font-black mt-1 text-amber-400">{pendingCount}</div>
                </div>
            </div>

            {/* Filters & search */}
            <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a6f96' }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search doctor by name or email..."
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
                            {s === 'all' ? 'All' : s === 'invited' ? 'Invite pending' : s}
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

            {/* Directory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                    <div className="col-span-full p-12 text-center text-xs animate-pulse" style={{ color: '#7ba3c8' }}>
                        Loading doctors...
                    </div>
                ) : filtered.length === 0 && members.length === 0 ? (
                    <div className="col-span-full p-12 text-center rounded-2xl border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)' }}>
                        <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>No doctors added yet</p>
                        <p className="mt-2 text-xs" style={{ color: '#4a6f96' }}>
                            Click "Invite Doctor" to search by WelliRecord ID, email, or phone — or send an invitation if they're new to WelliRecord.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-xs rounded-2xl border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)', color: '#4a6f96' }}>
                        No doctors match your filter.
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

            <InviteDoctorModal open={modalOpen} onClose={() => setModalOpen(false)} onDone={fetchDoctors} />
        </div>
    );
}

export default DoctorsPage;
