import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface RadiologyImage {
  id: string;
  url: string;
  resourceType: "image" | "raw";
  originalFilename?: string | null;
  format?: string | null;
  bytes?: number | null;
  uploadedAt: string;
}

export interface RadiologyReport {
  findings: string;
  impression?: string | null;
  radiologistName?: string | null;
  reportedAt: string;
}

export interface RadiologyOrder {
  id: string;
  patientId: string | { _id: string; fullName?: string; firstName?: string; lastName?: string; email?: string };
  organizationId: string | null;
  examName: string;
  modality: string;
  bodyPart?: string;
  status: string;
  priority: string;
  clinicalIndication?: string;
  doctorName?: string;
  doctorPhone?: string;
  price: number;
  paymentStatus: string;
  isCritical: boolean;
  images: RadiologyImage[];
  report: RadiologyReport | null;
  review?: { state: "approved"; byName: string; at: string; comment?: string } | null;
  reviewLog?: { decision: string; comment?: string; byName: string; at: string }[];
  returnReason?: string | null;
  patientNote?: { text: string; issueType: string; byName: string; at: string } | null;
  releasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RadiologyOrdersResponse {
  items: RadiologyOrder[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  viewer?: { userId: string; canApprove: boolean };
}

function authHeaders() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function getAllRadiologyOrders(page = 1, limit = 20): Promise<RadiologyOrdersResponse> {
  const { data } = await api.get(`${apiUrl}/api/v1/radiology-orders`, {
    params: { page, limit },
    headers: authHeaders(),
  });
  return data.data;
}

export async function createRadiologyOrder(payload: {
  patientId: string;
  examName: string;
  modality?: string;
  bodyPart?: string;
  priority?: string;
  clinicalIndication?: string;
  doctorName?: string;
  doctorPhone?: string;
  price?: number;
  paymentStatus?: string;
}): Promise<RadiologyOrder> {
  const { data } = await api.post(`${apiUrl}/api/v1/radiology-orders`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function updateRadiologyOrderStatus(id: string, status: string): Promise<RadiologyOrder> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/radiology-orders/${id}/status`,
    { status },
    { headers: authHeaders() },
  );
  return data.data;
}

export async function uploadRadiologyImage(id: string, file: File): Promise<RadiologyOrder> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(
    `${apiUrl}/api/v1/radiology-orders/${id}/images`,
    formData,
    {
      headers: {
        ...authHeaders(),
        // No Content-Type here — the browser sets the multipart
        // boundary automatically, same as uploadAvatar in authApi.ts.
      },
    },
  );
  return data.data;
}

export async function publishRadiologyReport(
  id: string,
  payload: {
    findings: string;
    impression?: string;
    radiologistName?: string;
    isCritical?: boolean;
  },
): Promise<RadiologyOrder> {
  const { data } = await api.patch(`${apiUrl}/api/v1/radiology-orders/${id}/report`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function reviewRadiologyReport(id: string, decision: "approve" | "return", comment: string): Promise<RadiologyOrder> {
  const { data } = await api.post(`${apiUrl}/api/v1/radiology-orders/${id}/review`, { decision, comment }, { headers: authHeaders() });
  return data.data;
}

export async function setRadiologyNote(id: string, text: string, issueType: string): Promise<RadiologyOrder> {
  const { data } = await api.put(`${apiUrl}/api/v1/radiology-orders/${id}/patient-note`, { text, issueType }, { headers: authHeaders() });
  return data.data;
}

export async function releaseRadiologyReport(id: string): Promise<{ order: RadiologyOrder; dispatch: { inApp: string; email: string } }> {
  const { data } = await api.post(`${apiUrl}/api/v1/radiology-orders/${id}/release`, {}, { headers: authHeaders() });
  return data.data;
}
