import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

export type JoinInfo = { url: string; token: string; room: string; side: "patient" | "provider"; closesAt: string };
export class JoinError extends Error {
  code: string;
  opensAt?: string;
  constructor(message: string, code: string, opensAt?: string) {
    super(message);
    this.code = code;
    this.opensAt = opensAt;
  }
}

const authHeader = () => {
  const token = Cookies.get("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getJoinInfo(appointmentId: string): Promise<JoinInfo> {
  try {
    const { data } = await api.post(`${apiUrl}/api/v1/telehealth/appointments/${appointmentId}/token`, {}, { headers: authHeader() });
    return data.data as JoinInfo;
  } catch (e: any) {
    const d = e?.response?.data;
    throw new JoinError(d?.message || "Could not open the visit room.", d?.code || "ERROR", d?.opensAt);
  }
}
