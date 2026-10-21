import { api } from "@/shared/lib/api";
import Cookies from "js-cookie";

export type LinkStatus =
  | "not_initiated"
  | "awaiting_patient_verification"
  | "awaiting_consent"
  | "under_hospital_review"
  | "linking_in_progress"
  | "linked"
  | "action_required"
  | "cancelled"
  | "expired";

export interface ClaimInfo {
  organization: string;
  firstName: string;
  status: LinkStatus;
  consentVersion: string;
  scopes: string[];
}

const auth = () => ({ Authorization: `Bearer ${Cookies.get("accessToken")}` });

export async function getLinkInfo(token: string): Promise<ClaimInfo> {
  const { data } = await api.get(`/record-links/claim/${token}`);
  return data.data;
}

export async function sendLinkCode(token: string): Promise<{ sentTo: string; expiresInMinutes: number }> {
  const { data } = await api.post(`/record-links/claim/${token}/otp`, {}, { headers: auth() });
  return data.data;
}

export async function verifyLinkCode(token: string, code: string): Promise<{ status: LinkStatus }> {
  const { data } = await api.post(`/record-links/claim/${token}/verify`, { code }, { headers: auth() });
  return data.data;
}

export async function giveLinkConsent(token: string, version: string, scopes: string[]): Promise<{ status: LinkStatus }> {
  const { data } = await api.post(`/record-links/claim/${token}/consent`, { version, scopes }, { headers: auth() });
  return data.data;
}

// ----- hospital staff -----

export interface StaffLink {
  id: string;
  localCustomerId: string;
  patientName?: string;
  externalId?: string | null;
  status: LinkStatus;
  actionReason: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt: string | null;
  verifiedMethod: "dob" | "name" | null;
  verificationWeak: boolean;
  consentAt: string | null;
  consentVersion: string | null;
  consentScopes: string[];
  releasedAt: string | null;
  stagedCount: number;
  transferred: { allergies: number; medications: number; skipped: number; failed: number };
  transferredAt: string | null;
  history: { status: string; at: string; by: string; note: string }[];
}

export interface LinkAuditRow {
  _id: string;
  action: string;
  actorType: "staff" | "patient" | "system";
  detail: string;
  ip: string;
  at: string;
}

export type StagedInput =
  | { kind: "allergy"; allergen: string; allergyType?: string; reaction?: string; severity?: string; sourceRef?: string }
  | { kind: "medication"; medicationName: string; dosage?: string; frequency?: string; notes?: string; sourceRef?: string };

export async function startRecordLink(localCustomerId: string): Promise<{ link: StaffLink; token: string; url: string; phoneHint: string }> {
  const { data } = await api.post(`/record-links`, { localCustomerId }, { headers: auth() });
  return data.data;
}

export async function listRecordLinks(params: { status?: string; page?: number; limit?: number } = {}): Promise<{ total: number; links: StaffLink[] }> {
  const { data } = await api.get(`/record-links`, { params, headers: auth() });
  return data.data;
}

export async function getRecordLink(id: string): Promise<{ link: StaffLink; audit: LinkAuditRow[] }> {
  const { data } = await api.get(`/record-links/${id}`, { headers: auth() });
  return data.data;
}

export async function stageLinkItems(id: string, items: StagedInput[]): Promise<{ added: number }> {
  const { data } = await api.post(`/record-links/${id}/items`, { items }, { headers: auth() });
  return data.data;
}

export async function approveRecordLink(id: string, note?: string): Promise<StaffLink> {
  const { data } = await api.post(`/record-links/${id}/approve`, { note }, { headers: auth() });
  return data.data;
}

export async function rejectRecordLink(id: string, reason: string): Promise<StaffLink> {
  const { data } = await api.post(`/record-links/${id}/reject`, { reason }, { headers: auth() });
  return data.data;
}

export async function reopenRecordLink(id: string): Promise<StaffLink> {
  const { data } = await api.post(`/record-links/${id}/reopen`, {}, { headers: auth() });
  return data.data;
}

export async function cancelRecordLink(id: string): Promise<StaffLink> {
  const { data } = await api.post(`/record-links/${id}/cancel`, {}, { headers: auth() });
  return data.data;
}
