import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teamApi } from '@/shared/api/teamApi';
import { ProviderDashboard } from './ProviderDashboard';
import { ClinicianDashboardPage } from './ClinicianDashboardPage';
import { Loader2 } from 'lucide-react';

// Dynamically renders ClinicianDashboardPage when the logged-in
// user's active membership role is "doctor", or ProviderDashboard
// (the org-wide overview) for organization owner accounts,
// provider_admin, and non-doctor staff.
export function ProviderOverviewRouter() {
    const { user } = useAuth();
    const [isDoctor, setIsDoctor] = useState<boolean | null>(null);

    useEffect(() => {
        // Patients shouldn't land on provider routes at all (guarded by
        // RequireRole in AppRoutes.tsx), but if they do, render default.
        if (!user || user.role === 'patient') {
            setIsDoctor(false);
            return;
        }

        // Organization owner accounts authenticating directly (accountType
        // "organization") get the full org-wide dashboard.
        if ((user as any).accountType === 'organization') {
            setIsDoctor(false);
            return;
        }

        teamApi.listMembers()
            .then(members => {
                const self = members.find(
                    m => m.userId === (user as any).sub || (m.email && m.email === user.email),
                );
                setIsDoctor(self?.role === 'doctor');
            })
            .catch(() => setIsDoctor(false));
    }, [user]);

    if (isDoctor === null) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050d1a' }}>
                <Loader2 size={22} className="animate-spin" style={{ color: '#4a6f96' }} />
            </div>
        );
    }

    return isDoctor ? <ClinicianDashboardPage /> : <ProviderDashboard />;
}

export default ProviderOverviewRouter;
