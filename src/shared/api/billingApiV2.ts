import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

// Named billingApiV2 to avoid colliding with the existing billingApi.ts,
// which is unrelated: that file is Wellinovate's own SaaS subscription
// pricing (what a clinic pays Wellinovate to use WelliRecord). This file
// is clinical billing — what a patient owes a provider for services
// rendered. Different domain, different data, kept separate rather
// than overloading one file with two unrelated concepts.

export type InvoiceStatus = "unpaid" | "partially-paid" | "paid" | "void";
export type LineItemCategory =
  | "consultation" | "laboratory" | "radiology" | "procedure"
  | "pharmacy" | "consumable" | "other";
export type PaymentMethod = "cash" | "pos" | "bank-transfer" | "other";

export interface CheckoutSuggestion {
  description: string;
  category: LineItemCategory;
  sourceType: "lab_order" | "pharmacy_order" | "radiology_order";
  sourceId: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  category: LineItemCategory;
  sourceType: "lab_order" | "pharmacy_order" | "radiology_order" | "manual";
  sourceId?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string | { _id: string; fullName?: string; wrId?: string };
  organizationId: string | { _id: string; organizationName?: string };
  encounterId?: string | { _id: string; encounterLabel?: string; encounterCode?: string } | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  hmoContribution: number;
  patientResponsibility: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  createdAt: string;
  updatedAt: string;
  // Random lookup key for the public verify page's QR code — not the
  // same as invoiceNumber, which is sequential and only meant as a
  // human-readable label. See VerifyInvoicePage.
  verificationToken?: string;
}

export interface Payment {
  _id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  paidAt: string;
}

export interface Receipt {
  _id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentId: string;
  amount: number;
  method: string;
  issuedAt: string;
}

export interface InvoiceDetail extends Invoice {
  payments: Payment[];
  receipts: Receipt[];
}

function authHeaders() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function getCheckoutSuggestions(patientId: string): Promise<{ suggestions: CheckoutSuggestion[] }> {
  const { data } = await api.get(`${apiUrl}/api/v1/billing/checkout-suggestions/${patientId}`, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function createInvoice(payload: {
  patientId: string;
  encounterId?: string;
  lineItems: Omit<InvoiceLineItem, "id" | "lineTotal">[];
  taxTotal?: number;
  hmoContribution?: number;
  dueDate?: string;
}): Promise<Invoice> {
  const { data } = await api.post(`${apiUrl}/api/v1/billing/invoices`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function getInvoices(status?: InvoiceStatus, page = 1, limit = 20): Promise<{
  items: Invoice[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const { data } = await api.get(`${apiUrl}/api/v1/billing/invoices`, {
    params: { status, page, limit },
    headers: authHeaders(),
  });
  return data.data;
}

export async function getMyInvoices(status?: InvoiceStatus): Promise<{ items: Invoice[] }> {
  const { data } = await api.get(`${apiUrl}/api/v1/billing/invoices/my`, {
    params: { status },
    headers: authHeaders(),
  });
  return data.data;
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail> {
  const { data } = await api.get(`${apiUrl}/api/v1/billing/invoices/${id}`, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function recordPayment(
  id: string,
  payload: { amount: number; method: PaymentMethod; reference?: string; notes?: string },
): Promise<{ invoice: Invoice; payment: Payment; receipt: Receipt }> {
  const { data } = await api.post(`${apiUrl}/api/v1/billing/invoices/${id}/payments`, payload, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function voidInvoice(id: string, reason?: string): Promise<Invoice> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/billing/invoices/${id}/void`,
    { reason },
    { headers: authHeaders() },
  );
  return data.data;
}

export async function sendInvoice(id: string): Promise<{ emailed: boolean }> {
  const { data } = await api.post(`${apiUrl}/api/v1/billing/invoices/${id}/send`, {}, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function sendPaymentReminder(id: string): Promise<{ emailed: boolean }> {
  const { data } = await api.post(`${apiUrl}/api/v1/billing/invoices/${id}/remind`, {}, {
    headers: authHeaders(),
  });
  return data.data;
}

export interface InvoiceVerification {
  invoiceNumber: string;
  patientName: string;
  organizationName: string;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt: string;
}

// Public, unauthenticated — no auth header, since this is what a
// scanned invoice QR code hits from any device. Keyed on the random
// verificationToken, not invoiceNumber (which is sequential and
// guessable — see the backend comment on verifyInvoiceService).
export async function verifyInvoice(token: string): Promise<InvoiceVerification> {
  const { data } = await api.get(`${apiUrl}/api/v1/billing/invoices/verify/${token}`);
  return data.data;
}


