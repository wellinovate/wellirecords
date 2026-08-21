import { phone } from "@/assets";
import { useAuth } from "@/shared/auth/AuthProvider";
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";
import OTPForm from "@/apps/patient/components/OTPInput";
import { PreLoginHeader } from "@/components/layout/PreLoginHeader";

type LoginStep = "credentials" | "otp";

type GoogleCredentialResponse = {
  credential: string;
};

function PasswordInput({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between">
        <label className="text-[18px] font-medium text-[#0A2F6B]">
          {label}
        </label>

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="text-[15px] text-[#0A2F6B]"
          disabled={disabled}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Enter your password"
        autoComplete="current-password"
        className="h-[46px] w-full rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] px-4 text-[16px] outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-[18px] font-medium text-[#0A2F6B]">
        {label}
      </label>

      <input
        type="email"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="email"
        className="h-[46px] w-full rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] px-4 text-[16px] outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}

export function PatientLoginPage() {
  const { setUser, verifyLoginCodeApi, signIn, resendVerifyLoginCodeApi } =
    useAuth();
  const navigate = useNavigate();

  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const [profileType, setProfileType] = useState("Personal");

  const [step, setStep] = useState<LoginStep>("credentials");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const update =
    (key: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isFormValid = isEmailValid && form.password.trim() !== "";
  // const isCodeValid = /^\d{6}$/.test(code);

  useEffect(() => setIsCodeValid(code.length === 6), [code]);

  const handleResend = async () => {
    if (!challengeToken) {
      setError("Login session expired. Please start again.");
      setStep("credentials");
      return;
    }

    if (resending) return; // a request is already in flight, ignore repeat clicks

    try {
      setResending(true);
      setCode(""); // clear existing OTP
      setError(""); // clear error messages

      const res = await resendVerifyLoginCodeApi(
        challengeToken,
        form.email,
        channel,
      );
      const payload = res?.data || res;

      if (!payload?.challengeToken) {
        throw new Error("Failed to resend OTP");
      }

      // Update challenge token and optionally masked phone
      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || maskedPhone);
      setMaskedEmail(payload.maskedEmail || maskedEmail);
      setTimeLeft(120); // reset countdown only after a successful resend

      toast.success("OTP resent successfully");
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Unable to resend OTP";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const redirectAfterLogin = (accountType?: string) => {
    localStorage.setItem("activeProfileType", profileType);

    const searchParams = new URLSearchParams(window.location.search);
    const claimToken = searchParams.get("claimToken");
    if (claimToken) {
      navigate(`/join/${claimToken}`);
      return;
    }

    if (accountType === "user") {
      navigate("/patient/overview");
      return;
    }

    navigate("/provider/overview");
  };

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Enter a valid email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await signIn(
        form.email.trim().toLowerCase(),
        form.password,
        channel,
      );

      const payload = res?.data || res;
      console.log("🚀 ~ handleSubmitCredentials ~ payload:", payload);

      if (!payload?.requiresOtp || !payload?.challengeToken) {
        throw new Error("Login verification could not be started.");
      }

      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || "");
      setMaskedEmail(payload.maskedEmail || "");
      setStep("otp");

      toast.success("Login code sent");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password. Try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!challengeToken) {
      setError("Login session expired. Please start again.");
      setStep("credentials");
      return;
    }

    if (!isCodeValid) {
      setError("Enter the 6-digit login code.");
      return;
    }

    try {
      setVerifying(true);
      setError("");

      const res = await verifyLoginCodeApi(challengeToken, code);

      const payload = res?.data || res;

      const account = payload?.account;
      const profile = payload?.profile;
      const memberships = payload?.memberships || [];
      const accessToken = payload?.accessToken || payload?.token;

      if (accessToken) {
        Cookies.set("accessToken", accessToken, {
          expires: 1,
          secure: true,
          sameSite: "lax",
        });
      }

      const uiUser = {
        id: account?._id || account?.id,
        accountType: account?.accountType,
        role: account?.role,
        profile,
        memberships,
      };

      localStorage.setItem("ui_user", JSON.stringify(uiUser));
      setUser?.(uiUser);

      toast.success("Login successful");

      if (account?.email) {
        fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: account.email,
            templateId: "welcome-back",
            variables: {
              patientName: profile?.fullName || account?.fullName || "",
              loginDateTime: new Date().toLocaleString(),
              loginMethod: pendingGoogleAccountType
                ? "Google"
                : "Email & Password",
              deviceInfo: navigator.userAgent,
              dashboardUrl: `${window.location.origin}/dashboard`,
              secureAccountUrl: `${window.location.origin}/security`,
            },
          }),
        }).catch((err) =>
          console.error("Failed to send welcome-back email:", err),
        );
      }

      if (account?.accountType !== "user") {
        Cookies.remove("accessToken");
        localStorage.removeItem("ui_user");
        setUser?.(null);
        setError(
          "This login is for patient accounts. Please use the provider portal to sign in.",
        );
        toast.error("This login is for patient accounts.");
        setStep("credentials");
        return;
      }

      redirectAfterLogin(account?.accountType);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid or expired login code.";

      setError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setCode("");
    setChallengeToken("");
    setMaskedPhone("");
    setMaskedEmail("");
    setError("");
    setPendingGoogleAccountType("");
  };

  const [pendingGoogleAccountType, setPendingGoogleAccountType] = useState("");

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
        credential: response.credential,
        profileType,
      });

      const data = res.data;

      // Existing accounts get sent through the same SMS OTP step password
      // login already uses, instead of finishing sign-in immediately. Only
      // brand-new accounts (no phone on file yet) skip straight through —
      // handled below.
      if (data?.requiresOtp && data?.challengeToken) {
        setChallengeToken(data.challengeToken);
        setMaskedPhone(data.maskedPhone || "");
        setMaskedEmail(data.maskedEmail || "");
        if (data?.channel) setChannel(data.channel);
        setPendingGoogleAccountType("user");
        setStep("otp");
        toast.success("Login code sent");
        return;
      }

      Cookies.set("accessToken", data.token, {
        expires: 1,
        secure: true,
        sameSite: "lax",
      });

      const uiUser = {
        id: data.user.id,
        accountType: data.user.accountType,
        role: data.user.role,
      };

      localStorage.setItem("ui_user", JSON.stringify(uiUser));
      setUser?.(uiUser);

      toast.success("Google sign-in successful");

      // First-time Google sign-ins from this page create an account the
      // same way the signup page does, but this page never collects a
      // phone number or shows onboarding. Route new accounts to profile
      // completion instead of the dashboard, same destination the signup
      // page's Google flow uses. Existing accounts logging back in are
      // unaffected and keep the "welcome-back" email + normal redirect.
      if (!data?.user?.hasPhone && data?.user?.accountType === "user") {
        localStorage.setItem("wrShowWelcomeWizard", "1");
        localStorage.setItem("activeProfileType", profileType);
        navigate("/patient/settings?complete=1", {
          state: { fullName: data.user.fullName },
        });
        return;
      }

      if (data?.user?.email) {
        fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: data.user.email,
            templateId: "welcome-back",
            variables: {
              patientName: data.user.fullName || "",
              loginDateTime: new Date().toLocaleString(),
              loginMethod: "Google",
              deviceInfo: navigator.userAgent,
              dashboardUrl: `${window.location.origin}/dashboard`,
              secureAccountUrl: `${window.location.origin}/security`,
            },
          }),
        }).catch((err) =>
          console.error("Failed to send welcome-back email:", err),
        );
      }

      redirectAfterLogin(data?.user?.accountType);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Google sign-in failed";

      setError(message);
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    if (step !== "credentials") return;

    const renderGoogleButton = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      googleBtnRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "signin_with",
        shape: "rectangular",
      });
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          renderGoogleButton();
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [step, profileType, googleClientId]);

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#071B3F]">
      <PreLoginHeader />

      <div className="mt-20 min-h-[calc(100vh-80px)]">
    
        <div className="mx-auto flex min-h-[calc(100vh-145px)] max-w-[1500px] px-4 pb-5 md:px-8">
          {/* =========================================================
            LEFT VISUAL PANEL
        ========================================================= */}
          <div className="relative hidden overflow-hidden rounded-2xl bg-[#E8EEF7] lg:block lg:w-[48%]">
            <button
              onClick={() => {
                if (step === "otp") {
                  handleBackToCredentials();
                } else {
                  navigate(-1);
                }
              }}
              className="group absolute left-6 top-6 z-20 flex items-center gap-2 rounded-lg border border-white/40 bg-white/80 px-3.5 py-2 text-[13px] font-medium text-[#173A71] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

              {step === "otp" ? "Back to Login" : "Back"}
            </button>
            <img
              src={phone}
              alt="WelliRecord secure health record"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Soft overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071B3F]/20 via-transparent to-transparent" />

            {/* Top accent */}
            <div className="absolute left-0 top-0 h-1 w-full bg-[#071B3F]" />

            {/* Trust message */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="max-w-md rounded-xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F3ED]">
                    <svg
                      className="h-4 w-4 text-[#16805C]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>

                  <span className="text-sm font-semibold text-[#071B3F]">
                    Your health records, protected
                  </span>
                </div>

                <p className="text-sm leading-6 text-[#52647D]">
                  Securely access your medical information whenever and wherever
                  you need it.
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================
            RIGHT AUTH PANEL
        ========================================================= */}
          <div className="flex w-full items-center justify-center mt-5 lg:w-[52%]">
            <div className="w-full max-w-[500px] px-3 py-4 pt-0 md:px-6">
              {step === "credentials" && (
                <>
                  {/* Header */}
                  <div className="mb-2">
                    <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#6881A3]">
                      Secure Patient Access
                    </p>

                    <h1 className="text-center text-[32px] font-bold tracking-[-0.02em] text-[#071B3F] md:text-[38px]">
                      Welcome back
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-center text-[14px] leading-6 text-[#68788E]">
                      Sign in to securely access your WelliRecord health
                      records.
                    </p>
                  </div>

                  {/* Form Card */}
                  <div className="rounded-2xl border border-[#E1E7EF] bg-white p-6 shadow-[0_12px_40px_rgba(7,27,63,0.06)] md:p-8">
                    <form
                      onSubmit={handleSubmitCredentials}
                      className="space-y-6"
                    >
                      {/* Email */}
                      <TextInput
                        label="Email address"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update("email")}
                        disabled={loading || googleLoading}
                      />

                      {/* Password */}
                      <PasswordInput
                        label="Password"
                        value={form.password}
                        onChange={update("password")}
                        disabled={loading || googleLoading}
                      />

                      {/* OTP Method */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-[#34445A]">
                            Verification method
                          </span>

                          <span className="text-[12px] text-[#8996A8]">
                            Required
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* SMS */}
                          <label
                            className={`relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                              channel === "sms"
                                ? "border-[#173A71] bg-[#F3F7FC] ring-1 ring-[#173A71]"
                                : "border-[#DDE4EC] bg-white hover:border-[#AEBBCB]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="otp-channel"
                              checked={channel === "sms"}
                              onChange={() => setChannel("sms")}
                              disabled={loading || googleLoading}
                              className="sr-only"
                            />

                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  channel === "sms"
                                    ? "bg-[#173A71] text-white"
                                    : "bg-[#EEF2F7] text-[#52647D]"
                                }`}
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
                                </svg>
                              </div>

                              <div>
                                <p className="text-[13px] font-semibold text-[#172B4D]">
                                  Text message
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#8996A8]">
                                  Send via SMS
                                </p>
                              </div>
                            </div>
                          </label>

                          {/* Email */}
                          <label
                            className={`relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                              channel === "email"
                                ? "border-[#173A71] bg-[#F3F7FC] ring-1 ring-[#173A71]"
                                : "border-[#DDE4EC] bg-white hover:border-[#AEBBCB]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="otp-channel"
                              checked={channel === "email"}
                              onChange={() => setChannel("email")}
                              disabled={loading || googleLoading}
                              className="sr-only"
                            />

                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  channel === "email"
                                    ? "bg-[#173A71] text-white"
                                    : "bg-[#EEF2F7] text-[#52647D]"
                                }`}
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                  />
                                  <path d="m3 7 9 6 9-6" />
                                </svg>
                              </div>

                              <div>
                                <p className="text-[13px] font-semibold text-[#172B4D]">
                                  Email
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#8996A8]">
                                  Send to your email
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Forgot password */}
                      <div className="flex justify-end">
                        <Link
                          to="/forgot-password"
                          className="text-[13px] font-semibold text-[#173A71] transition-colors hover:text-[#071B3F] hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {/* Login */}
                      <button
                        type="submit"
                        disabled={loading || googleLoading || !isFormValid}
                        className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all ${
                          loading || googleLoading || !isFormValid
                            ? "cursor-not-allowed bg-[#AAB4C2]"
                            : "bg-[#071B3F] hover:-translate-y-[1px] hover:bg-[#0C2D66] hover:shadow-md active:translate-y-0"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending verification code...
                          </>
                        ) : (
                          "Continue"
                        )}
                      </button>

                      {/* Divider */}
                      <div className="flex items-center gap-4 py-1">
                        <div className="h-px flex-1 bg-[#E3E7ED]" />
                        <span className="text-[12px] font-medium text-[#9AA5B4]">
                          OR
                        </span>
                        <div className="h-px flex-1 bg-[#E3E7ED]" />
                      </div>

                      <div className="mx-auto flex w-[90%] justify-center">
                        {googleLoading ? (
                          <div className="flex items-center gap-2 text-[16px] text-[#173A71]">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Signing in with Google...
                          </div>
                        ) : (
                          <div ref={googleBtnRef} />
                        )}
                      </div>
                    </form>
                    {/* Google */}
                    {/* <div className="flex min-h-[44px] w-full justify-center">
                      {googleLoading ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-[#52647D]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in with Google...
                        </div>
                      ) : (
                        <div ref={googleBtnRef} />
                      )}
                    </div> */}

                    {/* Sign up */}
                    <div className="mt-7 border-t border-[#EEF1F5] pt-6 text-center text-[13px] text-[#748196]">
                      Don't have an account?{" "}
                      <Link
                        to="/auth/patient/signup"
                        className="font-semibold text-[#173A71] transition-colors hover:text-[#071B3F] hover:underline"
                      >
                        Create an account
                      </Link>
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8996A8]">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>

                    <span>Your connection is secure and encrypted</span>
                  </div>
                </>
              )}

              {/* =======================================================
                OTP
            ======================================================= */}
              {step === "otp" && (
                <>
                  <div className="mb-9">
                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#6881A3]">
                      Identity Verification
                    </p>

                    <h1 className="text-center text-[32px] font-bold tracking-[-0.02em] text-[#071B3F] md:text-[38px]">
                      Verify your login
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-center text-[14px] leading-6 text-[#68788E]">
                      Enter the verification code we sent to confirm your
                      identity.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E1E7EF] bg-white p-6 shadow-[0_12px_40px_rgba(7,27,63,0.06)] md:p-8">
                    <form onSubmit={handleVerifyCode}>
                      <OTPForm
                        maskedPhone={maskedPhone}
                        maskedEmail={maskedEmail}
                        channel={channel}
                        code={code}
                        setCode={setCode}
                        isCodeValid={isCodeValid}
                        verifying={verifying}
                        handleResend={handleResend}
                        resending={resending}
                        timeLeft={timeLeft}
                        setTimeLeft={setTimeLeft}
                      />

                      <button
                        type="submit"
                        disabled={verifying || !isCodeValid}
                        className={`mt-7 flex h-[50px] w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all ${
                          verifying || !isCodeValid
                            ? "cursor-not-allowed bg-[#AAB4C2]"
                            : "bg-[#071B3F] hover:-translate-y-[1px] hover:bg-[#0C2D66] hover:shadow-md"
                        }`}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify and continue"
                        )}
                      </button>
                    </form>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8996A8]">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>

                    <span>WelliRecord protects your personal health data</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { phone } from "@/assets";
// import { useAuth } from "@/shared/auth/AuthProvider";
// import { ArrowLeft, Loader2 } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { apiUrl } from "@/shared/api/authApi";
// import Cookies from "js-cookie";

// function PasswordInput({
//   label,
//   value,
//   onChange,
// }: {
//   label: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }) {
//   const [visible, setVisible] = useState(false);

//   return (
//     <div className="w-full">
//       <div className="flex justify-between mb-2">
//         <label className="text-[18px] font-medium text-[#0A2F6B]">
//           {label}
//         </label>

//         <button
//           type="button"
//           onClick={() => setVisible(!visible)}
//           className="text-[15px] text-[#0A2F6B]"
//         >
//           {visible ? "Hide" : "Show"}
//         </button>
//       </div>

//       <input
//         type={visible ? "text" : "password"}
//         value={value}
//         onChange={onChange}
//         placeholder="AFRTT6Ygytn56’;."
//         className="w-full h-[46px] px-4 rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] text-[16px] outline-none focus:bg-white"
//       />
//     </div>
//   );
// }

// function TextInput({
//   label,
//   placeholder,
//   value,
//   onChange,
// }: {
//   label: string;
//   placeholder: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }) {
//   return (
//     <div className="w-full">
//       <label className="block mb-2 text-[18px] font-medium text-[#0A2F6B]">
//         {label}
//       </label>

//       <input
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         className="w-full h-[46px] px-4 rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] text-[16px] outline-none focus:bg-white"
//       />
//     </div>
//   );
// }

// export function PatientLoginPage() {
//   const { signIn, setUser } = useAuth();
//   const navigate = useNavigate();

//   const [profileType, setProfileType] = useState("Personal");
//   const [loading, setLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [step, setStep] = useState<"credentials" | "otp">("credentials");

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [code, setCode] = useState("");
//   const [challengeToken, setChallengeToken] = useState("");
//   const [maskedPhone, setMaskedPhone] = useState("");

//   const [verifying, setVerifying] = useState(false);
//   const googleBtnRef = useRef<HTMLDivElement | null>(null);

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

//   const update =
//     (key: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) =>
//       setForm((prev) => ({ ...prev, [key]: e.target.value }));

//   const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

//   const isFormValid = isEmailValid && form.password.trim() !== "";

//   const handleLogin = async () => {
//     const res = await loginApi({ email, password });

//     if (res.data.requiresOtp) {
//       setChallengeToken(res.data.challengeToken);
//       setMaskedPhone(res.data.maskedPhone);
//       setStep("otp");
//       return;
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       setError("");

//       const user = await signIn(form.email, form.password);

//       if (!user) {
//         setError("Invalid email or password. Try again");
//         return;
//       }

//       toast.success("Login successful");
//       localStorage.setItem("activeProfileType", profileType);

//       if (user?.data?.account?.accountType === "user") {
//         navigate("/patient/overview");
//       } else {
//         navigate("/provider/overview");
//       }
//     } catch (error: any) {
//       if (error?.message?.includes("timeout")) {
//         toast.error("Request took too long. Check your connection.");
//       } else {
//         toast.error(
//           error?.message ===
//             "Cannot read properties of undefined (reading 'data')"
//             ? "Something went wrong. Try again."
//             : error?.message,
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
//     try {
//       setGoogleLoading(true);
//       setError("");

//       const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
//         credential: response.credential,
//         profileType,
//       });

//       const data = res.data;
//       Cookies.set("accessToken", data.token, {
//         expires: 1, // days
//         secure: true, // only over HTTPS (important in prod)
//         sameSite: "lax",
//       });

//       localStorage.setItem(
//         "ui_user",
//         JSON.stringify({
//           id: data.user.id,
//           accountType: data.user.accountType,
//         }),
//       );

//       const userstored = localStorage.getItem("ui_user");
//       const storedUser = userstored ? JSON.parse(userstored) : null;
//       setUser?.(storedUser);
//       toast.success("Google sign-in successful");

//       if (data?.user?.accountType === "user") {
//         navigate("/patient/overview");
//       } else {
//         navigate("/provider/overview");
//       }
//     } catch (error: any) {
//       toast.error(
//         error?.response?.data?.message ||
//           error?.message ||
//           "Google sign-in failed",
//       );
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!googleClientId) {
//       console.error("Missing VITE_GOOGLE_CLIENT_ID");
//       return;
//     }

//     const existingScript = document.getElementById("google-gsi-script");
//     if (existingScript && window.google && googleBtnRef.current) {
//       window.google.accounts.id.initialize({
//         client_id: googleClientId,
//         callback: handleGoogleCredential,
//       });

//       googleBtnRef.current.innerHTML = "";

//       window.google.accounts.id.renderButton(googleBtnRef.current, {
//         theme: "outline",
//         size: "large",
//         text: "signin_with",
//         shape: "rectangular",
//         width: 460,
//       });

//       return;
//     }

//     const script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     script.id = "google-gsi-script";

//     script.onload = () => {
//       if (!window.google || !googleBtnRef.current) return;

//       window.google.accounts.id.initialize({
//         client_id: googleClientId,
//         callback: handleGoogleCredential,
//       });

//       googleBtnRef.current.innerHTML = "";

//       window.google.accounts.id.renderButton(googleBtnRef.current, {
//         theme: "outline",
//         size: "large",
//         text: "signin_with",
//         shape: "rectangular",
//         width: 460,
//       });
//     };

//     document.head.appendChild(script);
//   }, [googleClientId]);

//   return (
//     <div className="min-h-screen bg-white pb-8">
//       <div className="relative h-screen w-full max-w-full border border-gray-200">
//         <div className="absolute left-1 top-4 z-50 mb-4 rounded-lg bg-gray-100 px-5 md:left-20 md:top-10">
//           <button
//             onClick={() => {
//               if (step === "otp") {
//                 handleBackToCredentials();
//                 return;
//               }

//               navigate(-1);
//             }}
//             className="flex items-center gap-2 text-[#062B67] transition hover:opacity-70"
//           >
//             <ArrowLeft size={26} />
//             <span className="text-sm font-bold md:text-lg">
//               {step === "otp" ? "Back to Login" : "Back"}
//             </span>
//           </button>
//         </div>

//         <div className="flex h-full px-1">
//           <div className="relative hidden w-full flex-1 overflow-hidden bg-[#E8EDF2] md:block">
//             <img
//               src={phone}
//               alt="Phone UI"
//               className="h-full w-full object-cover"
//             />
//             <div className="absolute left-0 top-0 h-[4px] w-full bg-[#2F915C]" />
//           </div>

//           <div className="flex w-full flex-1 items-start justify-center bg-[#F3F4F5] px-3">
//             <div className="mt-[70px] w-full max-w-[460px]">
//               {step === "credentials" && (
//                 <>
//                   <h1 className="text-center text-[34px] font-extrabold text-[#062B67] md:text-[44px]">
//                     Welcome Back!
//                   </h1>

//                   <form
//                     onSubmit={handleSubmitCredentials}
//                     className="mt-12 space-y-8"
//                   >
//                     <TextInput
//                       label="Email"
//                       placeholder="johndoe@gmail.com"
//                       value={form.email}
//                       onChange={update("email")}
//                       disabled={loading || googleLoading}
//                     />

//                     <PasswordInput
//                       label="Password"
//                       value={form.password}
//                       onChange={update("password")}
//                       disabled={loading || googleLoading}
//                     />

//                     {error && (
//                       <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
//                         {error}
//                       </div>
//                     )}

//                     <div className="text-right text-[14px] text-gray-500">
//                       Forgot Password?
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || googleLoading || !isFormValid}
//                       className={`flex h-[46px] w-full items-center justify-center gap-2 rounded-md text-[18px] font-semibold text-white transition ${
//                         loading || googleLoading || !isFormValid
//                           ? "cursor-not-allowed bg-gray-400"
//                           : "bg-[#2F915C] hover:brightness-95"
//                       }`}
//                     >
//                       {loading ? (
//                         <>
//                           <Loader2 className="h-5 w-5 animate-spin" />
//                           Sending code...
//                         </>
//                       ) : (
//                         "Log In"
//                       )}
//                     </button>

//                     <div className="flex items-center gap-4">
//                       <div className="h-px flex-1 bg-gray-300" />
//                       <span className="text-[14px] text-gray-500">Or</span>
//                       <div className="h-px flex-1 bg-gray-300" />
//                     </div>

//                     <div className="mx-auto flex w-[90%] justify-center">
//                       {googleLoading ? (
//                         <div className="flex items-center gap-2 text-[16px] text-[#173A71]">
//                           <Loader2 className="h-5 w-5 animate-spin" />
//                           Signing in with Google...
//                         </div>
//                       ) : (
//                         <div ref={googleBtnRef} />
//                       )}
//                     </div>

//                     <div className="text-center text-[15px] text-gray-500">
//                       Don’t have an account?{" "}
//                       <Link
//                         to="/auth/patient/signup"
//                         className="cursor-pointer font-bold text-[#137742]"
//                       >
//                         Sign Up
//                       </Link>
//                     </div>
//                   </form>
//                 </>
//               )}

//               {step === "otp" && (
//                 <>
//                   <h1 className="text-center text-[32px] font-extrabold text-[#062B67] md:text-[40px]">
//                     Verify Login
//                   </h1>

//                   <form onSubmit={handleVerifyCode} className="mt-10">
//                     <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
//                       <h2 className="text-xl font-bold text-slate-900">
//                         Enter login code
//                       </h2>

//                       <p className="mt-2 text-sm leading-6 text-slate-600">
//                         We sent a 6-digit code to{" "}
//                         <span className="font-bold text-[#062B67]">
//                           {maskedPhone}
//                         </span>
//                         . Enter it below to complete your login.
//                       </p>

//                       <input
//                         value={code}
//                         onChange={(e) => {
//                           setError("");
//                           const onlyNumbers = e.target.value.replace(/\D/g, "");
//                           setCode(onlyNumbers.slice(0, 6));
//                         }}
//                         maxLength={6}
//                         inputMode="numeric"
//                         autoComplete="one-time-code"
//                         className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-emerald-500"
//                         placeholder="000000"
//                         disabled={verifying}
//                       />

//                       {error && (
//                         <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
//                           {error}
//                         </div>
//                       )}

//                       <button
//                         type="submit"
//                         disabled={verifying || !isCodeValid}
//                         className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white transition ${
//                           verifying || !isCodeValid
//                             ? "cursor-not-allowed bg-gray-400"
//                             : "bg-emerald-600 hover:brightness-95"
//                         }`}
//                       >
//                         {verifying ? (
//                           <>
//                             <Loader2 className="h-5 w-5 animate-spin" />
//                             Verifying...
//                           </>
//                         ) : (
//                           "Verify and Login"
//                         )}
//                       </button>

//                       <button
//                         type="button"
//                         onClick={handleBackToCredentials}
//                         disabled={verifying}
//                         className="mt-4 w-full text-center text-sm font-semibold text-[#062B67] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         Use another email
//                       </button>
//                     </div>
//                   </form>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
