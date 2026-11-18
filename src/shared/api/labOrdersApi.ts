import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface LabResultRow {
  code: string;
  name: string;
  type: string;
  unit: string;
  value?: string | number;
  dp?: number;
  refText?: string;
  flag?: string | null;
  critical?: boolean;
  abnormal?: boolean;
  calculated?: boolean;
  rows?: { antibiotic: string; result: string }[];
  rangeSource?: "lab" | "default";
}

export interface DeltaFlag {
  code: string;
  name: string;
  unit: string;
  previous: number;
  current: number;
  previousDate: string;
  changePct: number;
}

export interface ResultEntry {
  code: string;
  value?: string | number;
  unit?: string;
  rows?: { antibiotic: string; result: string }[];
}

export interface InstrumentResults {
  analyzerName: string;
  receivedAt: string;
  entries: { code: string; value: string; unit?: string }[];
  unmapped: string[];
  status: "pending" | "used";
}

export interface LabOrder {
  id: string;
  patientId: string;
  organizationId: string | null;
  testName: string;
  testKey?: string;
  results?: LabResultRow[];
  deltaFlags?: DeltaFlag[];
  analyzerId?: string;
  approval?: { status: "approved"; byName: string; at: string; comment?: string };
  reviewLog?: { decision: string; comment?: string; byName: string; at: string }[];
  returnReason?: string;
  patientNote?: { text: string; issueType: string; byName: string; at: string };
  transmittedAt?: string;
  reagentShortfalls?: { reagentName: string; needed: number; missing: number }[];
  instrumentResults?: InstrumentResults;
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
  enteredByName?: string;
  enteredAt?: string;
  verifiedAt?: string;
  selfVerified?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface LabOrdersResponse {
  items: LabOrder[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  viewer?: { userId: string; canApprove: boolean };
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
  testKey?: string;
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

export async function updateLabOrderStatus(id: string, status: string, reason?: string): Promise<LabOrder> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/lab-orders/${id}/status`,
    reason ? { status, reason } : { status },
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
    results?: ResultEntry[];
    analyzerId?: string;
  },
): Promise<LabOrder> {
  const { data } = await api.patch(`${apiUrl}/api/v1/lab-orders/${id}/result`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function verifyLabOrderResult(id: string): Promise<LabOrder> {
  const { data } = await api.patch(`${apiUrl}/api/v1/lab-orders/${id}/verify`, {}, { headers: authHeaders() });
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

export async function previewLabOrderResult(
  id: string,
  results: ResultEntry[],
): Promise<{ results: LabResultRow[]; isCritical: boolean; errors: string[]; deltaFlags: DeltaFlag[] }> {
  const { data } = await api.post(
    `${apiUrl}/api/v1/lab-orders/${id}/result/preview`,
    { results },
    { headers: authHeaders() },
  );
  return data.data;
}

export interface CriticalAlert {
  _id: string;
  orderId: string;
  patientName: string;
  testName: string;
  values: { name: string; value: string | number; unit?: string; flag?: string }[];
  doctorName?: string;
  sms: "not_attempted" | "no_phone" | "sent" | "failed";
  smsError?: string;
  status: "open" | "acknowledged";
  notifiedTo?: string;
  method?: string;
  note?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export async function listCriticalAlerts(status?: "open" | "acknowledged"): Promise<CriticalAlert[]> {
  const { data } = await api.get(`${apiUrl}/api/v1/lab-orders/critical-alerts`, {
    params: status ? { status } : {},
    headers: authHeaders(),
  });
  return data.data;
}

export async function acknowledgeCriticalAlert(
  id: string,
  payload: { notifiedTo: string; method: string; note?: string },
): Promise<CriticalAlert> {
  const { data } = await api.patch(`${apiUrl}/api/v1/lab-orders/critical-alerts/${id}/acknowledge`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function reviewLabOrder(id: string, decision: "approve" | "return", comment: string): Promise<LabOrder> {
  const { data } = await api.post(`${apiUrl}/api/v1/lab-orders/${id}/review`, { decision, comment }, { headers: authHeaders() });
  return data.data;
}

export async function setLabPatientNote(id: string, text: string, issueType: string): Promise<LabOrder> {
  const { data } = await api.put(`${apiUrl}/api/v1/lab-orders/${id}/patient-note`, { text, issueType }, { headers: authHeaders() });
  return data.data;
}

export async function releaseLabOrder(id: string): Promise<{ order: LabOrder; recordsCreated: number; dispatch: { inApp: string; sms: string } }> {
  const { data } = await api.post(`${apiUrl}/api/v1/lab-orders/${id}/release`, {}, { headers: authHeaders() });
  return data.data;
}
