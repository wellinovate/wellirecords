import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("token") || ""}` });

export const residenceApi = {
  async save(state: string, lga?: string): Promise<{ wrId: string; registrationState: string; residenceState: string; residenceLga: string }> {
    try {
      const res = await api.patch(`${apiUrl}/api/v1/users/residence`, { state, lga }, { headers: headers() });
      return res.data.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || "Could not save. Try again.");
    }
  },
};
