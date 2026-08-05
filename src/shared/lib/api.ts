import axios from "axios";

// See apiClient.ts for why /api/v1 is appended here rather than
// expected to already be part of VITE_API_BASE_URL.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const api = axios.create({
  baseURL: `${rawBaseUrl}/api/v1`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
