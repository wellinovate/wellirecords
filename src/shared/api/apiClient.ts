import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1",
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