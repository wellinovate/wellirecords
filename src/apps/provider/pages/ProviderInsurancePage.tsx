import React from 'react';
import { PharmacyClaimsTab } from './pharmacy/PharmacyClaimsTab';

// This used to only be reachable as a tab inside the Pharmacy
// Dashboard. It's the same underlying feature and the same backend
// endpoints (both are already facility-scoped, not per-pharmacist) —
// this just gives it its own top-level page and sidebar entry instead
// of requiring a detour through Pharmacy & Prescriptions first. See
// PharmacyDashboard.tsx for the "Outstanding" stat card, which still
// reads from the same summary endpoint.
export function ProviderInsurancePage() {
    const triggerToast = (msg: string) => {
        // No shared toast system reaches this page yet — the claims
        // panel calls this after a successful create, so log rather
        // than silently swallow it until one exists.
        console.log(msg);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Insurance</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>HMO claims tracking for this facility</p>
            </div>

            <PharmacyClaimsTab triggerToast={triggerToast} />
        </div>
    );
}
