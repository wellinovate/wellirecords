import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamApi, TeamMember, PermissionRegistry } from '@/shared/api/teamApi';
import { getMyOrganization, MyOrganization } from '@/shared/api/organizationApi';
import { AccessPanel } from '@/apps/provider/components/AccessPanel';
import { WorkloadPlaceholder } from '@/shared/components/WorkloadPlaceholder';
import { ArrowLeft, Stethoscope, Loader2 } from 'lucide-react';

const TABS = ['Overview', 'Patients', 'Encounters', 'Schedule', 'Access', 'Activity'] as const;
type Tab = typeof TABS[number];

function StatusDot({ status }: { status: TeamMember['status'] }) {
    const color = status === 'active' ? '#10b981' : status === 'invited' ? '#f59e0b' : '#ef4444';
    const label = status === 'active' ? 'Active' : status === 'invited' ? 'Invite pending' : 'Suspended';
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: color }} /> {label}
        </span>
    );
}

export function DoctorProfilePage() {
    const { membershipId } = useParams<{ membershipId: string }>();
    const [member, setMember] = useState<TeamMember | null>(null);
    const [org, setOrg] = useState<MyOrganization | null>(null);
    const [registry, setRegistry] = useState<PermissionRegistry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('Overview');

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [members, orgData, registryData] = await Promise.all([
                teamApi.listMembers(),
                getMyOrganization().catch(() => null),
                teamApi.getPermissionRegistry().catch(() => null),
            ]);
            const found = members.find(m => m.membershipId === membershipId);
            if (!found) {
                setError('Doctor not found in your organization.');
            } else {
                setMember(found);
            }
            setOrg(orgData);
            setRegistry(registryData);
        } catch (err: any) {
            setError(err.message || 'Failed to load doctor profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [membershipId]);

    const handlePermissionsSaved = (permissions: string[], overrides: { granted: string[]; revoked: string[] }) => {
        setMember(prev => prev ? { ...prev, permissions, permissionOverrides: overrides } : prev);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050d1a' }}>
                <Loader2 size={22} className="animate-spin" style={{ color: '#4a6f96' }} />
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#050d1a' }}>
                <Link to="/provider/doctors" className="inline-flex items-center gap-1.5 text-xs mb-6" style={{ color: '#7ba3c8' }}>
                    <ArrowLeft size={13} /> Back to Doctors
                </Link>
                <div className="p-6 rounded-2xl border text-sm text-rose-400"
                    style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                    {error || 'Doctor not found.'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6 text-slate-100 font-sans" style={{ background: '#050d1a' }}>
            <Link to="/provider/doctors" className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#7ba3c8' }}>
                <ArrowLeft size={13} /> Back to Doctors
            </Link>

            {/* Identity header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl font-extrabold text-lg flex items-center justify-center border shrink-0"
                    style={{ background: '#0c2444', color: '#38bdf8', borderColor: 'rgba(56,189,248,.25)' }}>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#e2eaf4' }}>{member.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs flex items-center gap-1" style={{ color: '#7ba3c8' }}>
                            <Stethoscope size={12} /> {member.role === 'clinician' ? 'Clinician' : 'Doctor'}
                        </span>
                        <span style={{ color: '#3e5a78' }}>·</span>
                        <StatusDot status={member.status} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'rgba(56,189,248,.12)' }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all"
                        style={{
                            color: tab === t ? '#38bdf8' : '#7ba3c8',
                            borderColor: tab === t ? '#38bdf8' : 'transparent',
                        }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div>
                {tab === 'Overview' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border p-4 grid grid-cols-2 sm:grid-cols-3 gap-4"
                            style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7ba3c8' }}>Email</div>
                                <div className="text-sm mt-1" style={{ color: '#e2eaf4' }}>{member.email}</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#7ba3c8' }}>Status</div>
                                <div className="text-sm mt-1"><StatusDot status={member.status} /></div>
                            </div>
                        </div>
                        <WorkloadPlaceholder
                            title="Today's workload isn't wired up yet"
                            detail="Appointment counts, pending reviews, and lab results awaiting review need a live query against encounters, the visit queue, and lab orders for this doctor specifically — that aggregation doesn't exist yet."
                        />
                    </div>
                )}

                {tab === 'Patients' && (
                    <WorkloadPlaceholder
                        title="Patient list isn't wired up yet"
                        detail="Showing which patients this doctor is actually treating (not every patient in the organization) needs the access-context model — current encounter, assignment, referral, or consent — which hasn't been built yet."
                    />
                )}

                {tab === 'Encounters' && (
                    <WorkloadPlaceholder
                        title="Encounter history isn't wired up yet"
                        detail="There's no endpoint yet that lists encounters by provider — only by patient. Needs a small addition to the encounter module."
                    />
                )}

                {tab === 'Schedule' && (
                    <WorkloadPlaceholder
                        title="Schedule isn't wired up yet"
                        detail="Appointments are tracked with a providerId, but nothing queries them by provider yet — only by patient or organization."
                    />
                )}

                {tab === 'Access' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border p-4 space-y-2 text-xs"
                            style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                            <div><span style={{ color: '#7ba3c8' }}>Organization: </span><span style={{ color: '#e2eaf4' }}>{org?.organizationName ?? 'Unknown'}</span></div>
                            <div><span style={{ color: '#7ba3c8' }}>Role: </span><span style={{ color: '#e2eaf4' }}>{member.role === 'clinician' ? 'Clinician' : 'Doctor'}</span></div>
                        </div>
                        {registry ? (
                            <AccessPanel member={member} registry={registry} onSaved={handlePermissionsSaved} />
                        ) : (
                            <div className="text-xs" style={{ color: '#4a6f96' }}>Loading permissions…</div>
                        )}
                    </div>
                )}

                {tab === 'Activity' && (
                    <WorkloadPlaceholder
                        title="Activity log isn't wired up yet"
                        detail="There's an ActivityLog model with a providerId field, but nothing in the backend writes to it yet — no action anywhere creates a record. The schema exists; the instrumentation doesn't."
                    />
                )}
            </div>
        </div>
    );
}

export default DoctorProfilePage;
