import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("token") || ""}` });

export type ResidenceResult = {
  wrId: string;
  registrationState: string;
  residenceState: string;
  residenceLga: string;
  lgaCode: string;
  lgaMappingStatus: string;
};

export const residenceApi = {
  async save(state: string, lga?: string, lgaCode?: string): Promise<ResidenceResult> {
    try {
      const res = await api.patch(`${apiUrl}/api/v1/users/residence`, { state, lga, lgaCode }, { headers: headers() });
      return res.data.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || "Could not save. Try again.");
    }
  },

  /** LGAs we hold for a state. Empty means the person types it. */
  async lgas(state: string): Promise<{ code: string; name: string }[]> {
    try {
      const res = await api.get(`${apiUrl}/api/v1/users/lgas`, { params: { state } });
      return res.data?.data?.lgas ?? [];
    } catch {
      return [];
    }
  },
};
