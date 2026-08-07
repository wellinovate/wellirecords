import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface PharmacyOrder {
  id: string;
  patientId: string;
  organizationId: string | null;
  medicationName: string;
  dosage?: string;
  quantity: number;
  instructions?: string;
  status: string;
  priority: string;
  barcode?: string;
  prescribedByName?: string;
  prescribedByPhone?: string;
  dispensedBy?: string;
  price: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface PharmacyOrdersResponse {
  items: PharmacyOrder[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

function authHeaders() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function getAllPharmacyOrders(page = 1, limit = 20): Promise<PharmacyOrdersResponse> {
  const { data } = await api.get(`${apiUrl}/api/v1/pharmacy-orders`, {
    params: { page, limit },
    headers: authHeaders(),
  });
  return data.data;
}

export async function createPharmacyOrder(payload: {
  patientId: string;
  medicationName: string;
  dosage?: string;
  quantity?: number;
  instructions?: string;
  priority?: string;
  prescribedByName?: string;
  prescribedByPhone?: string;
  price?: number;
}): Promise<PharmacyOrder> {
  const { data } = await api.post(`${apiUrl}/api/v1/pharmacy-orders`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function updatePharmacyOrderStatus(id: string, status: string): Promise<PharmacyOrder> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/pharmacy-orders/${id}/status`,
    { status },
    { headers: authHeaders() },
  );
  return data.data;
}

export async function dispensePharmacyOrder(
  id: string,
  payload: { dispensedBy?: string },
): Promise<PharmacyOrder> {
  const { data } = await api.patch(`${apiUrl}/api/v1/pharmacy-orders/${id}/dispense`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

// The existing PharmacyDashboard UI renders rx.drug, rx.strength, rx.qty,
// rx.freq, rx.duration, rx.patientName, rx.patientWrId, rx.doctor, rx.source,
// rx.sourceType, rx.date — a shape from the old mock data, not what the
// backend returns. Rather than rewrite every render line, map the real
// order into that same shape so existing JSX keeps working unchanged.
export function mapPharmacyOrderToRxShape(order: PharmacyOrder) {
  return {
    id: order.id,
    source: "WelliRecord",
    sourceType: "Pharmacy",
    doctor: order.prescribedByName || "Unknown Prescriber",
    date: order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : "",
    drug: order.medicationName,
    strength: order.dosage || "",
    qty: order.quantity,
    freq: order.instructions || "As directed",
    duration: "",
    diagnosis: "",
    patientName: (order as any).patientId?.fullName || "Unknown Patient",
    patientWrId: (order as any).patientId?._id || "",
    status: order.status === "dispensed" ? "dispensed" : "pending",
    priority: order.priority,
    // Keep the raw order around too, since dispense/status calls need the real id.
    _raw: order,
  };
}
