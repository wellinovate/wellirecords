import Cookies from "js-cookie";
import { apiUrl } from "@/shared/api/authApi";
import { isStepUpCode, STEP_UP_HEADER, stepUpStore, StepUpCode } from "@/shared/api/stepUp";

/**
 * Reviewer tools for provider verification. Every call needs the normal login token plus, once the second step is on,
 * the step-up token in `x-step-up-token`. The token lives in sessionStorage only: it ends with the tab.
 */

const safeSession = (): Storage | null => {
  try { return typeof window !== "undefined" ? window.sessionStorage : null; } catch { return null; }
};
export const stepUp = stepUpStore(safeSession());

export class ReviewerApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ReviewerApiError";
    this.status = status;
    this.code = code;
  }
}

// The gate listens here. When any call reports that the second step is missing, the gate asks for a code again.
const listeners = new Set<(code: StepUpCode) => void>();
export const onStepUpLost = (fn: (code: StepUpCode) => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const login = Cookies.get("accessToken");
  if (login) headers.Authorization = `Bearer ${login}`;
  const token = stepUp.get();
  if (token) headers[STEP_UP_HEADER] = token;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/v1${path}`, { method, headers, credentials: "include", body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ReviewerApiError("Could not reach the server. Check your connection and try again.", 0, "network");
  }
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const code: string | undefined = json?.code;
    if (res.status === 403 && isStepUpCode(code)) {
      stepUp.clear();
      listeners.forEach((fn) => fn(code));
    }
    throw new ReviewerApiError(json?.message || "Something went wrong. Try again.", res.status, code);
  }
  return (json?.data ?? json) as T;
}

export interface MfaStatus { enabled: boolean; recoveryLeft: number }
export interface MfaSetup { secret: string; otpauthUrl: string }
export interface MfaEnabled { recoveryCodes: string[]; stepUpToken: string }
export interface MfaVerified { stepUpToken: string; recoveryLeft: number }

export interface CaseRow {
  id: string;
  providerId: string;
  name: string;
  category: string;
  status: string;
  kind: string;
  submittedAt: string;
  ageDays: number;
  assignedReviewer: string | null;
  checks: number;
  awaitingEvidence: boolean;
}

export const reviewerApi = {
  mfaStatus: () => call<MfaStatus>("GET", "/staff/verification/mfa/status"),
  mfaSetup: () => call<MfaSetup>("POST", "/staff/verification/mfa/setup", {}),
  async mfaEnable(code: string): Promise<MfaEnabled> {
    const r = await call<MfaEnabled>("POST", "/staff/verification/mfa/enable", { code });
    stepUp.set(r.stepUpToken);
    return r;
  },
  async mfaVerify(input: { code?: string; recoveryCode?: string }): Promise<MfaVerified> {
    const r = await call<MfaVerified>("POST", "/staff/verification/mfa/verify", input);
    stepUp.set(r.stepUpToken);
    return r;
  },
  /** The open queue. The server returns `{ success, cases }`, so `call` hands back the whole object. */
  async cases(params: { state?: "open" | "closed"; assigned?: "me" | "unassigned" } = {}): Promise<CaseRow[]> {
    const q = new URLSearchParams();
    if (params.state) q.set("state", params.state);
    if (params.assigned) q.set("assigned", params.assigned);
    const r = await call<{ cases: CaseRow[] }>("GET", `/staff/verification/cases${q.size ? `?${q}` : ""}`);
    return Array.isArray(r?.cases) ? r.cases : [];
  },
};
