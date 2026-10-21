import Cookies from "js-cookie";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/api/authApi";

export type Practitioner = {
  id: string;
  wrOrgId: string | null;
  practiceName: string;
  profession: string | null;
  specialty: string;
  licenseNumber: string;
  licenseBody: string;
  yearsExperience: number | null;
  bio: string;
  officeAddress: string;
  contactPhone: string;
  contactEmail: string;
  verificationStatus: string;
  verificationNote: string;
};
export type PractitionerInput = {
  profession: string;
  licenseNumber: string;
  licenseBody: string;
  practiceName?: string;
  specialty?: string;
  officeAddress?: string;
  contactPhone?: string;
  yearsExperience?: number | null;
  bio?: string;
};

const headers = () => ({ Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("token") || ""}` });
const base = () => `${apiUrl}/api/v1/practitioners`;

export class FieldErrors extends Error {
  errors: Record<string, string>;
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.errors = errors;
  }
}
const wrap = async <T,>(p: Promise<{ data: any }>): Promise<T> => {
  try {
    return (await p).data.data as T;
  } catch (e: any) {
    const d = e?.response?.data;
    const errs = d?.errors || d?.details;
    if (errs && typeof errs === "object") throw new FieldErrors(d?.message || "Check the fields.", errs);
    throw new Error(d?.message || "Request failed.");
  }
};

export const practitionerApi = {
  options: () => wrap<{ professions: string[]; licenseBodyHints: Record<string, string> }>(api.get(`${base()}/options`)),
  me: () => wrap<{ isPractitioner: boolean; profile: Practitioner | null; inPracticeView: boolean }>(api.get(`${base()}/me`, { headers: headers() })),
  become: (body: PractitionerInput) => wrap<Practitioner>(api.post(base(), body, { headers: headers() })),
  update: (body: Partial<PractitionerInput>) => wrap<{ profile: Practitioner; reverify: boolean }>(api.patch(`${base()}/me`, body, { headers: headers() })),
  async switchTo(to: "provider" | "patient") {
    const { data } = await api.post(`${base()}/switch`, { to }, { headers: headers() }).catch((e: any) => {
      throw new Error(e?.response?.data?.message || "Could not switch.");
    });
    const { account, profile } = data.data;
    Cookies.set("accessToken", data.accessToken, { expires: 1, secure: true, sameSite: "lax" });
    localStorage.setItem(
      "ui_user",
      JSON.stringify({
        id: account?._id || account?.id,
        accountType: account?.accountType,
        role: account?.role,
        roles: account?.role ? [account.role] : [],
        profile,
      }),
    );
    // A full load drops every cached screen from the other side.
    window.location.assign(to === "provider" ? "/provider/overview" : "/patient/overview");
  },
};
