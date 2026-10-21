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
