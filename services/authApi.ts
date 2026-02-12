import axios from "axios";

const API_URL = process.env.VITE_API_URL ?? "https://welli-record.vercel.app";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// const API_URL = import.meta.env.VITE_API_URL ?? "https://welli-record.vercel.app";

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  nin: string;
  agreeToTerms: boolean;
};

export async function signupUser(formData: SignupPayload) {
  // your existing payload shape: { formData }
  const res = await api.post("/api/v1/user/users", { formData });
  return res;
}

export async function initiateLogin(email: string, password: string) {
  const res = await api.post("/api/v1/user/initiate", { email, password });
  return res;
}

export async function verifyOtp(email: string, otp: number) {
  const res = await api.post("/api/v1/user/verify-otp", { email, otp });
  return res;
}
