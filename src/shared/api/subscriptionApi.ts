import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

export interface SubscriptionStatus {
  state: "none" | "active" | "grace" | "suspended";
  plan?: string;
  periodEnd: string | null;
  graceEndsAt: string | null;
  daysLeft: number | null;
}

export async function getMySubscription(): Promise<SubscriptionStatus> {
  const { data } = await api.get(`${apiUrl}/api/v1/subscriptions/me`, {
    headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
  });
  return data.data;
}

const authHeaders = () => ({ headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } });

export async function startSubscriptionCheckout(): Promise<{ authorizationUrl: string; amountKobo: number }> {
  const { data } = await api.post(`${apiUrl}/api/v1/subscriptions/me/checkout`, {}, authHeaders());
  return data.data;
}

export async function verifySubscriptionPayment(reference: string): Promise<{ success: boolean; reason?: string }> {
  const { data } = await api.post(`${apiUrl}/api/v1/subscriptions/me/verify`, { reference }, authHeaders());
  return data;
}
