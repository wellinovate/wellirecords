import { Organization, OrgMember } from '@/shared/types/types';

const MOCK_ORGS: Organization[] = [
    {
        id: 'org_hosp_001',
        name: 'Lagos General Hospital',
        type: 'hospital',
        tier: 'enterprise',
        verified: true,
        address: '1 Hospital Road, Lagos Island, Lagos',
        members: [
            { userId: 'prov_001', name: 'Dr. Fatima Aliyu', email: 'fatima@lagosgeneral.ng', role: 'clinician', permissions: ['read_ehr', 'write_encounter', 'order_labs', 'prescribe'], status: 'active', lastActive: '2026-02-24T10:00:00Z' },
            { userId: 'prov_004', name: 'Chidi Okonkwo', email: 'admin@lagosgeneral.ng', role: 'provider_admin', permissions: ['*'], status: 'active', lastActive: '2026-02-24T09:30:00Z' },
            { userId: 'prov_006', name: 'Nurse Blessing', email: 'blessing@lagosgeneral.ng', role: 'clinician', permissions: ['read_ehr', 'write_encounter'], status: 'active', lastActive: '2026-02-23T16:00:00Z' },
        ],
        apiKeys: [
            { id: 'key_001', label: 'FHIR Integration', key: 'welli_pk_hosp_xxx...', createdAt: '2026-01-10T08:00:00Z', lastUsed: '2026-02-24T08:00:00Z', scopes: ['fhir:read', 'fhir:write'] },
            { id: 'key_002', label: 'Lab System', key: 'welli_pk_lab_yyy...', createdAt: '2026-01-15T08:00:00Z', scopes: ['labs:read', 'labs:write'] },
        ],
        createdAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 'org_lab_001',
        name: 'CityLab Diagnostics',
        type: 'lab',
        tier: 'professional',
        verified: true,
        address: '7 Victoria Island, Lagos',
        members: [
            { userId: 'prov_002', name: 'Bayo Adewale', email: 'bayo@citylab.ng', role: 'lab_tech', permissions: ['read_lab_orders', 'publish_results'], status: 'active', lastActive: '2026-02-24T11:00:00Z' },
        ],
        apiKeys: [
            { id: 'key_003', label: 'Results API', key: 'welli_pk_res_zzz...', createdAt: '2026-01-20T08:00:00Z', scopes: ['labs:write'] },
        ],
        createdAt: '2026-01-05T00:00:00Z',
    },
    {
        id: 'org_pharm_001',
        name: 'MedPlus Pharmacy',
        type: 'pharmacy',
        tier: 'professional',
        verified: true,
        address: '15 Allen Avenue, Ikeja, Lagos',
        members: [
            { userId: 'prov_003', name: 'Ngozi Eze', email: 'ngozi@medplus.ng', role: 'pharmacist', permissions: ['read_prescriptions', 'dispense', 'write_medication_history'], status: 'active', lastActive: '2026-02-24T12:00:00Z' },
        ],
        apiKeys: [],
        createdAt: '2026-01-08T00:00:00Z',
    },
    {
        id: 'org_ins_001',
        name: 'AXA Mansard Insurance',
        type: 'insurance',
        tier: 'enterprise',
        verified: true,
        address: '90 Adeola Odeku Street, Victoria Island, Lagos',
        members: [
            { userId: 'prov_007', name: 'Kola Adeyemi', email: 'kola@axamansard.ng', role: 'insurer', permissions: ['read_claims', 'verify_eligibility', 'read_consented_ehr'], status: 'active', lastActive: '2026-02-24T09:00:00Z' },
        ],
        apiKeys: [
            { id: 'key_004', label: 'Claims API', key: 'welli_pk_ins_aaa...', createdAt: '2026-01-12T08:00:00Z', scopes: ['claims:read', 'claims:write'] },
        ],
        createdAt: '2026-01-03T00:00:00Z',
    },
    {
        id: 'org_gov_001',
        name: 'FG Ministry of Health',
        type: 'government',
        tier: 'enterprise',
        verified: true,
        address: 'Federal Secretariat Complex, Abuja',
        members: [
            { userId: 'prov_005', name: 'Aisha Bello', email: 'aisha@ministry.gov.ng', role: 'government', permissions: ['read_aggregated_analytics', 'manage_programs'], status: 'active', lastActive: '2026-02-23T14:00:00Z' },
        ],
        apiKeys: [
            { id: 'key_005', label: 'Dashboard API', key: 'welli_pk_gov_bbb...', createdAt: '2026-01-02T08:00:00Z', scopes: ['analytics:read'] },
        ],
        createdAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 'org_tele_001',
        name: 'WelliHealth Telehealth',
        type: 'telehealth',
        tier: 'professional',
        verified: true,
        address: 'Online',
        members: [
            { userId: 'prov_008', name: 'Dr. Sola Martins', email: 'sola@wellihealth.ng', role: 'telehealth_provider', permissions: ['read_ehr', 'write_encounter', 'create_session'], status: 'active', lastActive: '2026-02-24T13:00:00Z' },
        ],
        apiKeys: [],
        createdAt: '2026-01-10T00:00:00Z',
    },
];

export const orgApi = {
    getAll(): Organization[] {
        return MOCK_ORGS;
    },

    getById(id: string): Organization | undefined {
        return MOCK_ORGS.find(o => o.id === id);
    },

    getByType(type: Organization['type']): Organization[] {
        return MOCK_ORGS.filter(o => o.type === type);
    },

    getMembersByOrg(orgId: string): OrgMember[] {
        return orgApi.getById(orgId)?.members ?? [];
    },

    getOrgForUser(userId: string): Organization | undefined {
        return MOCK_ORGS.find(o => o.members.some(m => m.userId === userId));
    },

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
