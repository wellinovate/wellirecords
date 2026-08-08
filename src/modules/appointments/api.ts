import { api } from "@/shared/lib/api";
import { AppointmentListResponse } from "./types";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

const getAuthHeader = () => {
  const token = Cookies.get("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAppointmentsApi = async (params?: Record<string, any>) => {
  const { data } = await api.get<AppointmentListResponse>(
    `${apiUrl}/api/v1/appointments`,
    {
      params,
      headers: getAuthHeader(),
    },
  );
  return data;
};

export const createAppointmentApi = async (payload: {
  patientId: string;
  organizationId: string;
  providerId?: string | null;
  scheduledFor: string;
  reasonForVisit?: string;
}) => {
  const { data } = await api.post(`${apiUrl}/api/v1/appointments`, payload, {
    headers: getAuthHeader(),
  });
  return data;
};

export const checkInAppointmentApi = async (appointmentId: string) => {
  const { data } = await api.post(
    `${apiUrl}/api/v1/appointments/${appointmentId}/check-in`,
    {},
    {
      headers: getAuthHeader(),
    },
  );
  return data;
};

export const markAppointmentNoShowApi = async (appointmentId: string) => {
  const { data } = await api.post(
    `${apiUrl}/api/v1/appointments/${appointmentId}/no-show`,
    {},
    {
      headers: getAuthHeader(),
    },
  );
  return data;
};

export const cancelAppointmentApi = async (appointmentId: string) => {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/appointments/${appointmentId}`,
    {
      status: "cancelled",
    },
    {
      headers: getAuthHeader(),
    },
  );
  return data;
};
