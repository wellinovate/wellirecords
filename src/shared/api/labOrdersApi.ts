import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface LabOrder {
  id: string;
  patientId: string;
  organizationId: string | null;
  testName: string;
  category: string;
  status: string;
  priority: string;
  sampleType?: string;
  barcode?: string;
  doctorName?: string;
  doctorPhone?: string;
  collector?: string;
  price: number;
  paymentStatus: string;
  isCritical: boolean;
  measuredValue?: string;
  normalRange?: string;
  interpretation?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface LabOrdersResponse {
  items: LabOrder[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

function authHeaders() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function getAllLabOrders(page = 1, limit = 20): Promise<LabOrdersResponse> {
  const { data } = await api.get(`${apiUrl}/api/v1/lab-orders`, {
    params: { page, limit },
    headers: authHeaders(),
  });
  return data.data;
}

export async function createLabOrder(payload: {
  patientId: string;
  testName: string;
  category?: string;
  priority?: string;
  sampleType?: string;
  barcode?: string;
  doctorName?: string;
  doctorPhone?: string;
  price?: number;
  paymentStatus?: string;
}): Promise<LabOrder> {
  const { data } = await api.post(`${apiUrl}/api/v1/lab-orders`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function updateLabOrderStatus(id: string, status: string): Promise<LabOrder> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/lab-orders/${id}/status`,
    { status },
    { headers: authHeaders() },
  );
  return data.data;
}

export async function enterLabOrderResult(
  id: string,
  payload: {
    measuredValue?: string;
    normalRange?: string;
    interpretation?: string;
    isCritical?: boolean;
    verifiedBy?: string;
  },
): Promise<LabOrder> {
  const { data } = await api.patch(`${apiUrl}/api/v1/lab-orders/${id}/result`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function verifyPatientIdentityApi(payload: {
  wrId: string;
  phone?: string;
  email?: string;
}) {
  const { data } = await api.post(`${apiUrl}/api/v1/lab-delivery/verify-patient`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function extractReportDataApi(payload: {
  fileName: string;
  mimeType: string;
}) {
  const { data } = await api.post(`${apiUrl}/api/v1/lab-delivery/extract-report`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function releaseLabDeliveryApi(
  payload: {
    patientId: string;
    patientWrId: string;
    patientName: string;
    reportMetadata: any;
    extractedObservations: any[];
    notificationChannels: { email: boolean; sms: boolean; whatsapp: boolean; push: boolean };
    isCritical: boolean;
    recordedBy?: string;
  },
  files: File[] = [],
) {
  // Was always sent as plain JSON — the actual selected file(s) never
  // left the browser. The "External Report Intake" screen's own copy
  // says it attaches "original PDF report attachments", but nothing
  // uploaded them anywhere, so a released result had no document a
  // patient could ever open. Sending multipart when files are present
  // is what makes the upload (and later "View Document" on the
  // patient's Lab Results page) actually work; falls back to plain
  // JSON when there's nothing to attach, so existing no-file releases
  // are unaffected.
  if (files.length > 0) {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    files.forEach((file) => formData.append("reportFiles", file));

    const { data } = await api.post(`${apiUrl}/api/v1/lab-delivery/release`, formData, {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    });
    return data.data;
  }

  const { data } = await api.post(`${apiUrl}/api/v1/lab-delivery/release`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function inviteUnregisteredPatientApi(payload: {
  fullName: string;
  phone?: string;
  email?: string;
}) {
  const { data } = await api.post(
    `${apiUrl}/api/v1/lab-delivery/invite-unregistered`,
    payload,
    { headers: authHeaders() },
  );
  return data.data;
}
