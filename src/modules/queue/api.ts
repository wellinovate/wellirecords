import { api } from "@/shared/lib/api";
import type { QueueListResponse, StartEncounterResponse } from "./types";
import { apiUrl } from "@/shared/api/authApi";

export const getQueueApi = async (params?: Record<string, any>) => {
  const { data } = await api.get<QueueListResponse>(`${apiUrl}/api/v1/queue`, { params });
  return data;
};

export const createWalkInQueueApi = async (payload: {
  patientId: string;
  organizationId: string;
  providerId?: string | null;
  visitType?: "consultation" | "follow-up" | "review" | "emergency";
  priority?: "normal" | "urgent" | "emergency";
  chiefComplaint?: string;
}) => {
  const { data } = await api.post(`${apiUrl}/api/v1/queue/walk-in`, payload);
  return data;
};

export const saveTriageApi = async (
  queueId: string,
  payload: {
    triageNotes?: string;
    chiefComplaint?: string;
    priority?: "normal" | "urgent" | "emergency";
    vitals?: {
      temperature?: number | null;
      pulse?: number | null;
      bloodPressure?: string | null;
      respiratoryRate?: number | null;
      spo2?: number | null;
      weight?: number | null;
      height?: number | null;
    };
  },
) => {
  const { data } = await api.patch(`${apiUrl}/api/v1/queue/${queueId}/triage`, payload);
  return data;
};

export const updateQueueStatusApi = async (
  queueId: string,
  workflowStatus:
    | "checked-in"
    | "triage"
    | "waiting"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show",
) => {
  const { data } = await api.patch(`${apiUrl}/api/v1/queue/${queueId}/status`, { workflowStatus });
  return data;
};

export const startEncounterFromQueueApi = async (
  queueId: string,
  providerId?: string,
) => {
  const { data } = await api.post<StartEncounterResponse>(
    `${apiUrl}/api/v1/queue/${queueId}/start-encounter`,
    providerId ? { providerId } : {},
  );
  return data;
};

export const completeQueueVisitApi = async (queueId: string) => {
  const { data } = await api.post(`${apiUrl}/api/v1/queue/${queueId}/complete`);
  return data;
};
