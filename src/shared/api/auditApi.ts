import { AccessLogEntry } from '@/shared/types/types';
import { MOCK_GRANTS } from './consentApi';

export const auditApi = {
    getAuditLog(patientId: string): AccessLogEntry[] { 
        return MOCK_GRANTS
            .filter(g => g.patientId === patientId)
            .flatMap(g => g.accessLog)
            .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());
    }
};
