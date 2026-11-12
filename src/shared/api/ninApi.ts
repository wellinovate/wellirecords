import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("token") || ""}` });

export type NinStatus = { verified: boolean; verifiedAt: string | null; method: string | null; available: boolean };

export const ninApi = {
  async status(): Promise<NinStatus> {
    try {
      const res = await api.get(`${apiUrl}/api/v1/user/identity/nin/status`, { headers: headers() });
      return res.data.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || "Could not load your verification status.");
    }
  },

  // The NIN goes to our server for this one check. It is not saved and is not kept in the browser after the call.
  async verify(nin: string): Promise<{ verified: boolean; already: boolean; verifiedAt: string }> {
    try {
      const res = await api.post(`${apiUrl}/api/v1/user/identity/nin`, { nin, consent: true }, { headers: headers() });
      return res.data.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || "Could not complete the check. Try again.");
    }
  },
};
