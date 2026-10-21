import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";
import { JoinError } from "@/shared/api/telehealthApi";

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("token") || ""}` });
const base = () => `${apiUrl}/api/v1/mobile-booking`;
const fail = (e: any): never => {
  const d = e?.response?.data;
  throw new JoinError(d?.message || "Request failed.", d?.code || "ERROR", d?.opensAt);
};
const call = async <T,>(p: Promise<{ data: any }>): Promise<T> => {
  try {
    return (await p).data.data as T;
  } catch (e) {
    return fail(e);
  }
};

export type DayHours = { day: number; start: string; end: string };
export type Service = {
  active?: boolean;
  offersInPerson?: boolean;
  offersVirtual?: boolean;
  feeInPersonMinor?: number;
  feeVirtualMinor?: number;
  slotMinutes?: number;
  weekly?: DayHours[];
  acceptsHmo?: string[];
  facilityName?: string;
  payAtVisit?: boolean;
  onlinePayment?: boolean;
  payoutReady?: boolean;
} | null;
export type ServiceView = { organization: { name: string; facilityId: string }; service: Service; canManage: boolean };
export type Visit = {
  id: string;
  bookingRef: string;
  patientName: string;
  startsAt: string | null;
  timeSlot?: string;
  visitType: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  feeMinor?: number;
  hmo?: { policyLabel?: string; preAuthId?: string; clientStatus?: string };
  reason: string;
  canJoin: boolean;
  joinMessage: string;
};

export const mobileBookingApi = {
  service: () => call<ServiceView>(api.get(`${base()}/service`, { headers: headers() })),
  saveService: (body: Record<string, unknown>) => call<Service>(api.put(`${base()}/service`, body, { headers: headers() })),
  visits: () => call<Visit[]>(api.get(`${base()}/visits`, { headers: headers() })),
  act: (id: string, action: "confirm" | "cancel") => call<unknown>(api.post(`${base()}/visits/${id}/${action}`, {}, { headers: headers() })),
  hmo: (id: string, decision: "approve" | "decline", approvalCode = "") => call<unknown>(api.post(`${base()}/visits/${id}/hmo`, { decision, approvalCode }, { headers: headers() })),
  join: (id: string) => call<{ url: string; token: string; room: string }>(api.post(`${base()}/visits/${id}/video-token`, {}, { headers: headers() })),
};
