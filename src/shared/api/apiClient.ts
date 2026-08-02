// Deliberately appends /api/v1 here rather than relying on
// VITE_API_BASE_URL to already include it. The env var is the bare
// domain (see authApi.ts, which uses it the same way) — coding the
// suffix here keeps this file correct regardless of how the var is
// set on any given deployment, instead of silently 404ing if it isn't.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiClient = axios.create({
  baseURL: `${rawBaseUrl}/api/v1`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * attach auth token automatically
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor
 * normalize error responses
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject({
      message,
      status: error?.response?.status,
      errors: error?.response?.data?.errors,
    });
  },
);

export default apiClient;