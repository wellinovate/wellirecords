import apiClient from "./apiClient";

export interface AppointmentItem {
  _id: string;
  patientId: { _id: string; fullName: string } | string | null;
  providerId: { _id: string; fullName: string } | string | null;
  scheduledFor: string;
  reasonForVisit: string | null;
  status: "booked" | "checked-in" | "cancelled" | "no-show" | "completed";
}

export const getAppointments = async (params: Record<string, any> = {}) => {
  return apiClient.get("/appointments", { params });
};

export const checkInAppointment = async (id: string) => {
  return apiClient.post(`/appointments/${id}/check-in`);
};

export const markNoShow = async (id: string) => {
  return apiClient.post(`/appointments/${id}/no-show`);
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  return apiClient.patch(`/appointments/${id}`, { status });
};
