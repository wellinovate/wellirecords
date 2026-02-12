// src/hooks/useEmailAuth.ts
import { useCallback, useState } from "react";
import { initiateLogin, verifyOtp } from "./authApi";

export function useEmailAuth() {
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const start = useCallback(() => {
    setLoginStep(1);
    setLoading(false);
    setErrorMsg(null);
  }, []);

  const submitCredentials = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await initiateLogin(email, password);
      if (res.status === 200) setLoginStep(2);
      else setErrorMsg("Login initiation failed.");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? "Login initiation failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitOtp = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyOtp(email, Number(otp));
      if (res.status !== 200) {
        setErrorMsg("Wrong OTP");
        return { ok: false as const };
      }
      return { ok: true as const, data: res.data };
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? "OTP verification failed.");
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loginStep,
    loading,
    errorMsg,
    start,
    submitCredentials,
    submitOtp,
  };
}
