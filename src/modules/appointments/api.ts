import { api } from "@/shared/lib/api";
import { AppointmentListResponse } from "./types";
import { apiUrl } from "@/shared/api/authApi";


export const getAppointmentsApi = async (params?: Record<string, any>) => {
  const { data } = await api.get<AppointmentListResponse>(`${apiUrl}/api/v1/appointments`, {
    params,
  });
  return data;
};

export const createAppointmentApi = async (payload: {
  patientId: string;
  organizationId: string;
  providerId?: string | null;
  scheduledFor: string;
  reasonForVisit?: string;
}) => {
  console.log("🚀 ~ createAppointmentApi ~ payload:", payload)
  
  const { data } = await api.post(`${apiUrl}/api/v1/appointments`, payload);
  console.log("🚀 ~ createAppointmentApi ~ data:", data)
  return data;
};

export const checkInAppointmentApi = async (appointmentId: string) => {
  const { data } = await api.post(`${apiUrl}/api/v1/appointments/${appointmentId}/check-in`);
  return data;
};

export const markAppointmentNoShowApi = async (appointmentId: string) => {
  const { data } = await api.post(`${apiUrl}/api/v1/appointments/${appointmentId}/no-show`);
  return data;
};

export const cancelAppointmentApi = async (appointmentId: string) => {
  const { data } = await api.patch(`${apiUrl}/api/v1/appointments/${appointmentId}`, {
    status: "cancelled",
  });
  return data;
};