import { TeleSession, SymptomIntake, DigitalPrescription, RemoteMonitoringReading } from '@/shared/types/types';

// Placeholder empty responses until the dedicated telemedicine module is connected
export const MOCK_TELE_SESSIONS: TeleSession[] = [];
export const MOCK_INTAKES: SymptomIntake[] = [];
export const MOCK_DIGITAL_RX: DigitalPrescription[] = [];
export const MOCK_MONITORING: RemoteMonitoringReading[] = [];

// ─── API Surface ─────────────────────────────────────────────────────────────
export const teleMedApi = {
    getSessions(patientId: string): TeleSession[] {
        return MOCK_TELE_SESSIONS.filter(s => s.patientId === patientId);
    },
    getSession(sessionId: string): TeleSession | undefined {
        return MOCK_TELE_SESSIONS.find(s => s.id === sessionId);
    },
    getIntake(intakeId: string): SymptomIntake | undefined {
        return MOCK_INTAKES.find(i => i.id === intakeId);
    },
    getPrescriptions(patientId: string): DigitalPrescription[] {
        return MOCK_DIGITAL_RX.filter(rx => rx.patientId === patientId);
    },
    getMonitoringReadings(patientId: string): RemoteMonitoringReading[] {
        return MOCK_MONITORING.filter(r => r.patientId === patientId);
    },
    getSessionsByProvider(providerId: string): TeleSession[] {
        return MOCK_TELE_SESSIONS.filter(s => s.providerId === providerId);
    },
};
