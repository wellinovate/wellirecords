import apiClient from "./apiClient";

export interface QueueVitals {
  temperature?: number | null;
  pulse?: number | null;
  bloodPressure?: string | null;
  spo2?: number | null;
  weight?: number | null;
}

export interface QueueItem {
  _id: string;
  patientId: { _id: string; fullName: string } | string;
  workflowStatus: string;
  priority: "normal" | "urgent" | "emergency";
  chiefComplaint: string | null;
  triageNotes: string | null;
  vitals: QueueVitals;
  checkedInAt: string;
}

export const getQueue = async (params: Record<string, any> = {}) => {
  return apiClient.get("/queue", { params });
};

export const saveTriage = async (
  queueId: string,
  payload: { triageNotes?: string; chiefComplaint?: string; priority?: string; vitals?: QueueVitals },
) => {
  return apiClient.patch(`/queue/${queueId}/triage`, payload);
};
