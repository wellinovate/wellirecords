import { ApiKey } from '@/shared/types/types';

const MOCK_KEYS = [
    { id: 'key_001', label: 'FHIR Integration', key: 'welli_pk_hosp_xxx...', createdAt: '2026-01-10T08:00:00Z', lastUsed: '2026-02-24T08:00:00Z', scopes: ['fhir:read', 'fhir:write'], orgId: 'org_hosp_001' },
    { id: 'key_002', label: 'Lab System', key: 'welli_pk_lab_yyy...', createdAt: '2026-01-15T08:00:00Z', scopes: ['labs:read', 'labs:write'], orgId: 'org_hosp_001' }
];

let _keys = [...MOCK_KEYS];

export const integrationApi = {
    getKeys(orgId: string): ApiKey[] { 
        return _keys.filter(k => k.orgId === orgId); 
    },
    generateKey(orgId: string, label: string, scopes: string[]): ApiKey {
        const newKey = {
            id: `key_${Date.now()}`,
            label,
            key: `welli_pk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            createdAt: new Date().toISOString(),
            scopes,
            orgId
        };
        _keys.push(newKey);
        return newKey;
    },
    revokeKey(orgId: string, keyId: string): void {
        _keys = _keys.filter(k => k.id !== keyId);
    },
};
