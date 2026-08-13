import axios from "axios";
import { handleSessionExpired } from "@/shared/utils/sessionExpired";

// See apiClient.ts for why /api/v1 is appended here rather than
// expected to already be part of VITE_API_BASE_URL.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const api = axios.create({
  baseURL: `${rawBaseUrl}/api/v1`,
  withCredentials: true,
});

// NOTE: this only ever attaches a token when one exists under the
// "token" key in localStorage — the app never writes one there (the
// real session token is the "accessToken" cookie, set in authApi.ts).
// Callers on this instance (e.g. organizationApi.ts, modules/queue/api.ts)
// pass their own Authorization header per-request instead. Left as-is
// rather than removed, since deleting it isn't part of this fix.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  },
);
