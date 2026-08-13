import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teamApi, TeamMember, PermissionRegistry } from '@/shared/api/teamApi';
import { getMyOrganization, MyOrganization } from '@/shared/api/organizationApi';
import { AccessPanel } from '@/apps/provider/components/AccessPanel';
import { WorkloadPlaceholder } from '@/shared/components/WorkloadPlaceholder';
import { Stethoscope, Loader2, Key, ChevronDown, ChevronUp } from 'lucide-react';

// The doctor's own landing page — rendered at /provider/overview instead
// of the generic ProviderDashboard when the logged-in account's primary
// role is "doctor". Mirrors DoctorProfilePage's Overview/Access content
// (same underlying membership record, same permission registry) but
// framed as "my" workload rather than an admin looking at someone
// else's profile, and the Access tab is read-only — a doctor can see
// what they're permitted to do, not change it themselves.

export function ClinicianDashboardPage() {
    const { user } = useAuth();
    const [member, setMember] = useState<TeamMember | null>(null);
    const [org, setOrg] = useState<MyOrganization | null>(null);
    const [registry, setRegistry] = useState<PermissionRegistry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accessOpen, setAccessOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [members, orgData, registryData] = await Promise.all([
                    teamApi.listMembers(),
                    getMyOrganization().catch(() => null),
                    teamApi.getPermissionRegistry().catch(() => null),
                ]);
                const self = members.find(
                    m => m.userId === (user as any)?.sub || (m.email && m.email === user?.email),
                );
                setMember(self ?? null);
                setOrg(orgData);
                setRegistry(registryData);
            } catch (err: any) {
                setError(err.message || 'Failed to load your workspace');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050d1a' }}>
                <Loader2 size={22} className="animate-spin" style={{ color: '#4a6f96' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6 text-slate-100 font-sans" style={{ background: '#050d1a' }}>
            <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                    <Stethoscope size={22} className="text-sky-400" /> Welcome, {member?.name ?? user?.name ?? 'Doctor'}
                </h1>
                <p className="text-xs mt-1" style={{ color: '#7ba3c8' }}>
                    {org?.organizationName ? `${org.organizationName} · ` : ''}Doctor
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border text-xs text-rose-400"
                    style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.2)' }}>
                    {error}
                </div>
            )}

            <WorkloadPlaceholder
                title="Today's workload isn't wired up yet"
                detail="Your appointments, pending reviews, and lab results awaiting review need a live query against encounters, the visit queue, and lab orders scoped to you specifically — that aggregation doesn't exist yet."
            />

            <WorkloadPlaceholder
                title="Your patient list isn't wired up yet"
                detail="Showing which patients you're actually treating (not every patient in the organization) needs the access-context model — current encounter, assignment, referral, or consent — which hasn't been built yet."
            />

            {member && registry && (
                <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.12)' }}>
                    <button onClick={() => setAccessOpen(o => !o)}
                        className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#7ba3c8' }}>
                        <Key size={13} /> Your access {accessOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {accessOpen && (
                        <AccessPanel member={member} registry={registry} onSaved={() => {}} readOnly />
                    )}
                </div>
            )}
        </div>
    );
}

export default ClinicianDashboardPage;
