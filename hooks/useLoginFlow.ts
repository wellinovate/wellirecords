import { useState } from "react";
import { initiateLogin, verifyOtp } from "../services/authApi";

export function useLoginFlow(onComplete: (userData: any) => void) {
  const [loginStep, setLoginStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState<"email" | "wallet">("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const reset = () => {
    setLoginStep(1);
    setLoginMethod("email");
    setOtp("");
    setLoading(false);
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await initiateLogin(formData.email, formData.password);
      if (res.status === 200) setLoginStep(2);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(formData.email, Number(otp));
      if (res.status === 200) onComplete({ email: formData.email, name: "Returning User" });
      else alert("Wrong OTP");
    } finally {
      setLoading(false);
    }
  };

  return {
    loginStep,
    loginMethod,
    setLoginMethod,
    otp,
    setOtp,
    loading,
    formData,
    setFormData,
    reset,
    actions: { submitCredentials, submitOtp },
  };
}
