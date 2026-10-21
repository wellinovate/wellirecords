import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("token") || ""}` });
const base = () => `${apiUrl}/api/v1/mobile-link`;
const wrap = async <T,>(p: Promise<{ data: any }>): Promise<T> => {
  try {
    return (await p).data.data as T;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Request failed.");
  }
};

export const mobileLinkApi = {
  status: () => wrap<{ linked: boolean; linkedAt: string | null }>(api.get(base(), { headers: headers() })),
  makeCode: () => wrap<{ code: string; expiresAt: string }>(api.post(base() + "/code", {}, { headers: headers() })),
  unlink: () => wrap<{ linked: boolean }>(api.delete(base(), { headers: headers() })),
};
