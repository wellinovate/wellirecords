import { api } from "@/shared/lib/api";
import type { QueueListResponse, StartEncounterResponse } from "./types";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

const getAuthHeader = () => {
  const token = Cookies.get("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getQueueApi = async (params?: Record<string, any>) => {
  const { data } = await api.get<QueueListResponse>(`${apiUrl}/api/v1/queue`, {
    params,
    headers: getAuthHeader(),
  });

  return data;
};

export const createWalkInQueueApi = async (payload: {
  patientId: string;
  organizationId: string;
  // Was "providerId" — the backend's createWalkInQueueService only ever
  // reads req.body.assignedDoctorId (see visitQueue_service.js). The old
  // field name meant this was silently dropped on every submission —
  // whatever the front desk picked in the dropdown, the walk-in always
  // landed in the queue as unassigned.
  assignedDoctorId?: string | null;
  visitType?: "consultation" | "follow-up" | "review" | "emergency";
  priority?: "normal" | "urgent" | "emergency";
  chiefComplaint?: string;
}) => {
  const { data } = await api.post(`${apiUrl}/api/v1/queue/walk-in`, payload, {
    headers: getAuthHeader(),
  });
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
  const { data } = await api.patch(
    `${apiUrl}/api/v1/queue/${queueId}/triage`,
    payload,
    {
      headers: getAuthHeader(),
    },
  );
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
  const { data } = await api.patch(
    `${apiUrl}/api/v1/queue/${queueId}/status`,
    { workflowStatus },
    {
      headers: getAuthHeader(),
    },
  );
  return data;
};

export const startEncounterFromQueueApi = async (
  queueId: string,
  providerId?: string,
) => {
  const { data } = await api.post<StartEncounterResponse>(
    `${apiUrl}/api/v1/queue/${queueId}/start-encounter`,
    providerId ? { providerId } : {},
    {
      headers: getAuthHeader(),
    },
  );
  return data;
};

export const completeQueueVisitApi = async (queueId: string) => {
  const { data } = await api.post(
    `${apiUrl}/api/v1/queue/${queueId}/complete`,
    {},
    {
      headers: getAuthHeader(),
    },
  );
  return data;
};
