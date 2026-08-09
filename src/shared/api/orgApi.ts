import { Organization } from '@/shared/types/types';

// Team members, invites, and API keys now come from real endpoints —
// see teamApi.ts and apiKeysApi.ts. This file used to also export
// MOCK_ORGS (six fabricated organizations with fake staff and fake
// API keys) and getById/getAll/getMembersByOrg, which meant any
// provider whose real orgId happened to collide with one of the six
// hardcoded ids would see fake team data presented as their own.
// Only the static label/icon lookups (no data, just UI copy) remain.
export const orgApi = {
    getOrgTypeLabel(type: Organization['type']): string {
        const labels: Record<Organization['type'], string> = {
            hospital: 'Hospital / Clinic',
            clinic: 'Clinic',
            lab: 'Diagnostic Lab',
            pharmacy: 'Pharmacy',
            telehealth: 'Telehealth Platform',
            insurance: 'Insurance Provider',
            wearable: 'Wearable Vendor',
            ngo: 'NGO',
            government: 'Government / Ministry',
        };
        return labels[type] ?? type;
    },

    getOrgTypeIcon(type: Organization['type']): string {
        const icons: Record<Organization['type'], string> = {
            hospital: '🏥',
            clinic: '🏥',
            lab: '🔬',
            pharmacy: '💊',
            telehealth: '📡',
            insurance: '🛡️',
            wearable: '⌚',
            ngo: '🤝',
            government: '🏛️',
        };
        return icons[type] ?? '🏢';
    },
};
