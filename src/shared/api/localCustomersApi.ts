import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface LocalCustomer {
  _id: string;
  organizationId: string;
  externalId: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  dob: string | null;
  gender: "male" | "female" | "other" | null;
  address: string | null;
  hmo: string | null;
  lastVisit: string | null;
  matchStatus: "pending" | "matched" | "possible_match" | "new" | "failed";
  matchConfidence: number;
  matchedOn: string[];
  matchCandidates: { userId: string; score: number; matchedOn: string[] }[];
  welliRecordUserId: string | null;
  invitationStatus: "not_sent" | "sent" | "opened" | "registered" | "linked" | "expired";
  invitationSentAt: string | null;
  invitationExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportResult {
  total: number;
  processed: number;
  matched: number;
  possibleMatch: number;
  new: number;
  failed: number;
  duplicatesSkipped: number;
}

export interface LocalCustomerStats {
  total: number;
  matched: number;
  possibleMatch: number;
  new: number;
  invitations: {
    notSent: number;
    sent: number;
    opened: number;
    registered: number;
    linked: number;
    expired: number;
  };
  registeredThisMonth: number;
  registrationRate: number;
}

interface ListResponse {
  items: LocalCustomer[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

function authHeaders() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function importLocalCustomers(rows: Record<string, any>[]): Promise<ImportResult> {
  const { data } = await api.post(
    `${apiUrl}/api/v1/local-customers/import`,
    { rows },
    { headers: authHeaders() }
  );
  return data.data;
}

export async function getLocalCustomers(
  page = 1,
  limit = 20,
  filters: { matchStatus?: string; invitationStatus?: string; search?: string } = {}
): Promise<ListResponse> {
  const { data } = await api.get(`${apiUrl}/api/v1/local-customers`, {
    params: { page, limit, ...filters },
    headers: authHeaders(),
  });
  return data.data;
}

export async function getLocalCustomerStats(): Promise<LocalCustomerStats> {
  const { data } = await api.get(`${apiUrl}/api/v1/local-customers/stats`, {
    headers: authHeaders(),
  });
  return data.data;
}

export async function confirmMatch(id: string, userId: string): Promise<LocalCustomer> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/local-customers/${id}/confirm-match`,
    { userId },
    { headers: authHeaders() }
  );
  return data.data;
}

export async function dismissMatch(id: string): Promise<LocalCustomer> {
  const { data } = await api.patch(
    `${apiUrl}/api/v1/local-customers/${id}/dismiss-match`,
    {},
    { headers: authHeaders() }
  );
  return data.data;
}

export async function sendInvitation(id: string): Promise<{ customer: LocalCustomer; inviteUrl: string; token: string }> {
  const { data } = await api.post(
    `${apiUrl}/api/v1/local-customers/${id}/invite`,
    {},
    { headers: authHeaders() }
  );
  return data.data;
}

export async function bulkSendInvitations(ids?: string[]): Promise<{ totalInvited: number }> {
  const { data } = await api.post(
    `${apiUrl}/api/v1/local-customers/bulk-invite`,
    { ids },
    { headers: authHeaders() }
  );
  return data.data;
}

export async function getClaimInfo(token: string): Promise<{
  customer: { id: string; fullName: string; firstName?: string; phone?: string; email?: string };
  organization: { name: string; type: string };
  status: string;
  isClaimed: boolean;
}> {
  const { data } = await api.get(`${apiUrl}/api/v1/local-customers/claim/${token}`);
  return data.data;
}

export async function claimRecord(token: string): Promise<{ customer: LocalCustomer; claimed?: boolean; alreadyClaimed?: boolean }> {
  const { data } = await api.post(
    `${apiUrl}/api/v1/local-customers/claim/${token}`,
    {},
    { headers: authHeaders() }
  );
  return data.data;
}
