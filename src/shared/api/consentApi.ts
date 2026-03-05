import { ConsentGrant, ConsentRequest, ConsentScope, ConsentDuration, ConsentPurpose } from '@/shared/types/types';

export const MOCK_GRANTS: ConsentGrant[] = [
    {
        grantId: 'grant_001',
        patientId: 'pat_001',
        providerId: 'prov_001',
        providerName: 'Dr. Fatima Aliyu',
        orgId: 'org_hosp_001',
        orgName: 'Lagos General Hospital',
        orgType: 'hospital',
        scope: 'full',
        purpose: 'consultation',
        grantedAt: '2026-02-01T10:00:00Z',
        expiresAt: '2026-03-01T10:00:00Z',
        status: 'active',
        accessLog: [
            { id: 'log_001', accessedBy: 'prov_001', accessedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', orgName: 'Lagos General Hospital', accessedAt: '2026-02-10T09:15:00Z', action: 'view', recordId: 'rec_001', recordTitle: 'Comprehensive Metabolic Panel' },
            { id: 'log_002', accessedBy: 'prov_001', accessedByName: 'Dr. Fatima Aliyu', orgId: 'org_hosp_001', orgName: 'Lagos General Hospital', accessedAt: '2026-02-15T14:30:00Z', action: 'view', recordId: 'rec_002', recordTitle: 'Amoxicillin 500mg' },
        ],
    },
    {
        grantId: 'grant_002',
        patientId: 'pat_001',
        providerId: 'prov_002',
        providerName: 'Bayo Adewale',
        orgId: 'org_lab_001',
        orgName: 'CityLab Diagnostics',
        orgType: 'lab',
        scope: 'labs',
        recordTypes: ['Lab Result'],
        purpose: 'referral',
        grantedAt: '2026-02-10T08:00:00Z',
        expiresAt: '2026-02-17T08:00:00Z',
        status: 'expired',
        accessLog: [
            { id: 'log_003', accessedBy: 'prov_002', accessedByName: 'Bayo Adewale', orgId: 'org_lab_001', orgName: 'CityLab Diagnostics', accessedAt: '2026-02-10T10:00:00Z', action: 'view', recordId: 'rec_001', recordTitle: 'Comprehensive Metabolic Panel' },
        ],
    },
];

const MOCK_CONSENT_REQUESTS: ConsentRequest[] = [
    {
        requestId: 'req_001',
        providerId: 'prov_007',
        providerName: 'Kola Adeyemi',
        orgId: 'org_ins_001',
        orgName: 'AXA Mansard Insurance',
        orgType: 'insurance',
        requestedScope: 'full',
        purpose: 'claim',
        message: 'We need to verify your recent hospital visit for your claim #AXA-2026-1234.',
        requestedAt: '2026-02-23T09:00:00Z',
        status: 'pending',
    },
];

let _grants = [...MOCK_GRANTS];
let _requests = [...MOCK_CONSENT_REQUESTS];

export const consentApi = {
    getGrants(patientId: string): ConsentGrant[] { 
        return _grants.filter(g => g.patientId === patientId); 
    },
    getProviderGrants(orgId: string): ConsentGrant[] { 
        return _grants.filter(g => g.orgId === orgId && g.status === 'active');
    },
    getRequests(patientId: string): ConsentRequest[] { 
        return _requests.filter(r => r.status === 'pending');
    },
    grantAccess(patientId: string, params: any): ConsentGrant {
        const now = new Date();
        const expiresAt = params.duration === 'permanent' ? null : (() => {
            const d = new Date(now);
            if (params.duration === '24h') d.setHours(d.getHours() + 24);
            if (params.duration === '7d') d.setDate(d.getDate() + 7);
            if (params.duration === '30d') d.setDate(d.getDate() + 30);
            return d.toISOString();
        })();
        const grant: ConsentGrant = {
            grantId: `grant_${Date.now()}`,
            patientId,
            ...params,
            grantedAt: now.toISOString(),
            expiresAt,
            status: 'active',
            accessLog: [],
        };
        _grants = [..._grants, grant];
        return grant;
    },
    revokeAccess(grantId: string): void {
        _grants = _grants.map(g => g.grantId === grantId ? { ...g, status: 'revoked' as const } : g);
    },
    approveRequest(requestId: string, duration: ConsentDuration): void {
        _requests = _requests.map(r => r.requestId === requestId ? { ...r, status: 'approved' as const } : r);
    },
    denyRequest(requestId: string): void {
        _requests = _requests.map(r => r.requestId === requestId ? { ...r, status: 'denied' as const } : r);
    },
};
