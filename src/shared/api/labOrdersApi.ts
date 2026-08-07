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
