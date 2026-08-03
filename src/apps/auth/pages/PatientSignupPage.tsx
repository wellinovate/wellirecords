import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";
import { signups } from "@/assets";
import OTPForm from "@/apps/patient/components/OTPInput";

type InputFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  placeholder: string;
  type?: string;
  showToggle?: boolean;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  isSelect?: boolean;
  children?: React.ReactNode;
};

function InputField({
  label,
  error,
  required,
  optional,
  placeholder,
  type = "text",
  showToggle = false,
  value,
  onChange,
  isSelect = false,
  children,
}: InputFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm sm:text-base font-medium text-[#0C3571]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {optional && (
            <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
          )}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-sm sm:text-base font-medium text-[#0C3571]"
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {isSelect ? (
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className={`h-11 w-full appearance-none rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-4 pr-10 text-sm sm:text-base text-[#4B5563] outline-none focus:border-[#AEB7C5] focus:bg-white ${error ? "border-red-500 bg-red-50" : ""
              }`}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-4 text-sm sm:text-base text-[#4B5563] outline-none transition focus:border-[#AEB7C5] focus:bg-white ${error ? "border-red-500 bg-red-50" : ""
            }`}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type FormState = {
  fullName: string;
  email: string;
  phone: string; // ← remains string
  gender: string;
  address: string;
  password: string;
  confirmPassword: string;
  role: string;
  agree: boolean;
};

export default function PatientSignupPage() {
  const { signUpPatient, setUser, verifyLoginCodeApi, resendVerifyLoginCodeApi } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Google sign-up now goes through an SMS OTP step before finishing,
  // same mechanism password login already uses. Kept as a separate screen
  // rather than threading through the existing form JSX below.
  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpError, setOtpError] = useState("");
  // Whether the account behind this OTP challenge was just created here vs
  // already existed (e.g. someone with a password account clicking
  // "Sign up with Google"). Only genuinely new accounts get routed to
  // onboarding after verification; existing ones go straight to their
  // dashboard, same as a normal login would.
  const [pendingIsNewAccount, setPendingIsNewAccount] = useState(false);

  useEffect(() => setIsCodeValid(code.length === 6), [code]);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!googleClientId) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    const initializeGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      googleBtnRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "rectangular",
        width: 320,
      });
    };

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-gsi-script";
    script.onload = initializeGoogle;

    document.head.appendChild(script);
  }, [googleClientId, form.role, form.phone]);

  const validate = () => {
    const newErrors: any = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(form.phone.trim().replace(/[\s-]/g, ""))) {
      // Digits only (an optional leading + for international format),
      // 10-15 digits. Previously this only checked string length, so
      // "0000000000" or "abcdefghij" both passed as "valid".
      newErrors.phone = "Please enter a valid phone number (digits only)";
    }

    if (!form.gender) newErrors.gender = "Gender is required";

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      accountType: "user",
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      gender: form.gender,
      address: form.address.trim() || null,
      password: form.password,
      role: form.role,
      authProvider: "local",
    };
    // console.log("🚀 ~ handleSubmit ~ payload:", payload);

    try {
      setLoading(true);
      const resp = await signUpPatient(payload);
      console.log("🚀 ~ handleSubmit ~ resp:", resp)

      //  form.profileType,
      //   form.fullName,
      //   form.email,
      //   form.password,

      if (resp === "Account created successfully") {
        toast.success("Account created successfully");
        fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: payload.email,
            templateId: "patient-welcome",
            variables: {
              patientName: payload.fullName,
              // See handleGoogleCredential for why this is omitted rather
              // than a fabricated random number.
              accountCreationDate: new Date().toLocaleDateString(),
              verifyEmailUrl: `${window.location.origin}/verify-email`,
              loginUrl: `${window.location.origin}/auth/login`,
              completeProfileUrl: `${window.location.origin}/profile`,
              dashboardUrl: `${window.location.origin}/dashboard`,
              privacyPolicyUrl: `${window.location.origin}/privacy`,
              contactSupportUrl: `${window.location.origin}/support`
            }
          })
        }).catch(err => console.error("Failed to send welcome email:", err));
        navigate("/auth/patient/signup-success", { state: { email: payload.email } });
      }
    } catch (error) {
      console.log("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    // Regular signup already requires a phone number (see validate() above,
    // which has no fallback for it). Google signup was the one path that
    // let this through as null — nothing downstream ever asked for it
    // again, since Google signup skips straight to the dashboard instead
    // of the /auth/login checkpoint the regular flow goes through.
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number before continuing with Google.");
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(form.phone.trim().replace(/[\s-]/g, ""))) {
      toast.error("Please enter a valid phone number (digits only) before continuing with Google.");
      return;
    }

    try {
      setGoogleLoading(true);

      const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
        credential: response.credential,
        role: form.role || "patient",
        phone: form.phone.trim(),
      });

      const data = res.data;

      // Signup always collects a phone number before this request fires
      // (see the guard above), so the backend will almost always require
      // OTP here. The token branch below stays as a fallback in case the
      // backend ever returns without it.
      if (data?.requiresOtp && data?.challengeToken) {
        setChallengeToken(data.challengeToken);
        setMaskedPhone(data.maskedPhone || "your phone number");
        setPendingIsNewAccount(Boolean(data.isNewAccount));
        setSignupStep("otp");
        toast.success("Verification code sent");
        return;
      }

      Cookies.set("accessToken", data.token, {
        expires: 1,
        secure: true,
        sameSite: "lax",
      });

      const userPayload = {
        id: data.user.id,
        accountType: data.user.accountType,
        role: data.user.role,
        fullName: data.user.fullName,
        email: data.user.email,
      };

      localStorage.setItem("ui_user", JSON.stringify(userPayload));
      setUser?.(userPayload);

      toast.success("Google sign-up successful");

      fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.user.email,
          templateId: "patient-welcome",
          variables: {
            patientName: data.user.fullName,
            // No real Member ID exists yet at this point — the backend
            // doesn't return one from this endpoint, and the previous
            // code was sending a random fabricated number that never
            // matched the account's real wrId. Omitted rather than lied
            // about; the template should handle this field being absent.
            accountCreationDate: new Date().toLocaleDateString(),
            verifyEmailUrl: `${window.location.origin}/verify-email`,
              loginUrl: `${window.location.origin}/auth/login`,
            completeProfileUrl: `${window.location.origin}/profile`,
            dashboardUrl: `${window.location.origin}/dashboard`,
            privacyPolicyUrl: `${window.location.origin}/privacy`,
            contactSupportUrl: `${window.location.origin}/support`
          }
        })
      }).catch(err => console.error("Failed to send welcome email:", err));

      // New Google sign-ups land on the profile completion step instead
      // of the dashboard. The backend only received a full name and phone
      // from this flow — first/last name split, and anything else the
      // profile needs, was never collected. Provider accounts keep their
      // existing destination since this gap was specifically observed on
      // the patient path.
      if (data?.user?.accountType === "user") {
        // Signal PatientLayout to show the onboarding wizard on first load.
        localStorage.setItem("wrShowWelcomeWizard", "1");
        navigate("/patient/settings?complete=1", {
          state: { fullName: data.user.fullName, phone: form.phone.trim() },
        });
      } else {
        navigate("/provider/overview");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Google sign-up failed",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!challengeToken) {
      setOtpError("Verification session expired. Please try again.");
      setSignupStep("form");
      return;
    }

    if (!isCodeValid) {
      setOtpError("Enter the 6-digit code.");
      return;
    }

    try {
      setVerifying(true);
      setOtpError("");

      const res = await verifyLoginCodeApi(challengeToken, code);
      const payload = (res as any)?.data || res;

      const account = payload?.account;
      const profile = payload?.profile;
      const accessToken = payload?.accessToken || payload?.token;

      if (accessToken) {
        Cookies.set("accessToken", accessToken, {
          expires: 1,
          secure: true,
          sameSite: "lax",
        });
      }

      const userPayload = {
        id: account?._id || account?.id,
        accountType: account?.accountType,
        role: account?.role,
        fullName: profile?.fullName,
        email: account?.email || profile?.email,
      };

      localStorage.setItem("ui_user", JSON.stringify(userPayload));
      setUser?.(userPayload);

      toast.success("Google sign-up successful");

      if (userPayload.email) {
        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: userPayload.email,
            templateId: "patient-welcome",
            variables: {
              patientName: userPayload.fullName,
              // See original handleGoogleCredential comment: no real
              // Member ID is available at this point, so it's omitted
              // rather than fabricated.
              accountCreationDate: new Date().toLocaleDateString(),
              verifyEmailUrl: `${window.location.origin}/verify-email`,
              loginUrl: `${window.location.origin}/auth/login`,
              completeProfileUrl: `${window.location.origin}/profile`,
              dashboardUrl: `${window.location.origin}/dashboard`,
              privacyPolicyUrl: `${window.location.origin}/privacy`,
              contactSupportUrl: `${window.location.origin}/support`
            }
          })
        }).catch(err => console.error("Failed to send welcome email:", err));
      }

      if (userPayload.accountType !== "user") {
        navigate("/provider/overview");
        return;
      }

      if (pendingIsNewAccount) {
        localStorage.setItem("wrShowWelcomeWizard", "1");
        navigate("/patient/settings?complete=1", {
          state: { fullName: userPayload.fullName, phone: form.phone.trim() },
        });
        return;
      }

      // Existing account that happened to sign up again via Google — this
      // is really a login, not a first-time signup, so skip onboarding.
      navigate("/patient/overview");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid or expired code.";

      setOtpError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendSignupOtp = async () => {
    if (!challengeToken) {
      setOtpError("Verification session expired. Please try again.");
      setSignupStep("form");
      return;
    }

    if (resending) return;

    try {
      setResending(true);
      setCode("");
      setOtpError("");

      const res = await resendVerifyLoginCodeApi(challengeToken);
      const payload = (res as any)?.data || res;

      if (!payload?.challengeToken) {
        throw new Error("Failed to resend code");
      }

      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || maskedPhone);
      setTimeLeft(120);

      toast.success("Code resent successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to resend code";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  // const update =
  //   (key: keyof FormState) =>
  //   (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //     const value =
  //       key === "agree"
  //         ? (e.target as HTMLInputElement).checked
  //         : e.target.value;

  //     setForm((prev) => ({ ...prev, [key]: value }));
  //   };

  const update =
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value =
          e.target instanceof HTMLInputElement && e.target.type === "checkbox"
            ? e.target.checked
            : e.target.value;

        setForm((prev) => ({
          ...prev,
          [field]: value,
        }));

        // Track when password is first touched
        if (field === "password") {
          setPasswordTouched(true);
        }
      };

  const passwordMatchError =
    form.confirmPassword && form.password !== form.confirmPassword
      ? "Passwords do not match"
      : "";

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      confirmPassword: value,
    }));

    // Immediate validation while typing
    if (value && form.password !== value) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  if (signupStep === "otp") {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative min-h-screen max-w-full overflow-x-hidden border border-[#D9D9D9] bg-white">
          <div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6 lg:left-10 lg:top-10">
            <button
              onClick={() => {
                setSignupStep("form");
                setCode("");
                setChallengeToken("");
                setMaskedPhone("");
                setOtpError("");
              }}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-[#062B67] transition hover:opacity-70 sm:px-4"
            >
              <ArrowLeft size={22} className="sm:hidden" />
              <ArrowLeft size={30} className="hidden sm:block" />
              <span className="text-sm sm:text-base font-bold">Back</span>
            </button>
          </div>

          <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-5 sm:px-8">
            <h1 className="text-center text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#082E6A]">
              Verify it's you
            </h1>
            <p className="mt-2 text-center text-base text-[#49576A]">
              Enter the code we sent to finish setting up your account.
            </p>

            {otpError && (
              <p className="mt-4 text-center text-sm text-red-600">{otpError}</p>
            )}

            <form onSubmit={handleVerifySignupOtp} className="mt-6">
              <OTPForm
                maskedPhone={maskedPhone}
                code={code}
                setCode={setCode}
                isCodeValid={isCodeValid}
                verifying={verifying}
                handleResend={handleResendSignupOtp}
                resending={resending}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
              />

              <button
                type="submit"
                disabled={verifying || !isCodeValid}
                className={`mt-6 w-full rounded-xl py-3 text-white font-bold transition-all ${
                  verifying || !isCodeValid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#071B3F] hover:bg-[#0c2d66]"
                }`}
              >
                {verifying ? "Verifying..." : "Verify and continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative min-h-screen max-w-full overflow-x-hidden border border-[#D9D9D9] bg-white">
        {/* Back button */}
        <div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6 lg:left-10 lg:top-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-[#062B67] transition hover:opacity-70 sm:px-4"
          >
            <ArrowLeft size={22} className="sm:hidden" />
            <ArrowLeft size={30} className="hidden sm:block" />
            <span className="text-sm sm:text-base font-bold">Back</span>
          </button>
        </div>

        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[45.4%_54.6%]">
          {/* Left side */}
          <div className="relative hidden min-h-[320px] overflow-hidden bg-[#E9EEF1] lg:block">
            <img
              src={signups}
              alt="background"
              className="absolute inset-0 h-full w-full object-cover object-right"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.00)_84%,rgba(233,238,241,0.90)_100%)]" />
          </div>

          {/* Right side / form */}
          <div className="relative bg-[#F3F3F3] pb-8 pt-8">
            <div className="mx-auto flex h-full w-full max-w-[850px] flex-col px-5 pt-8 sm:px-8 md:px-2 sm:pt-10   lg:px-12 xl:px-[78px] xl:pt-[36px]">
              <div className=" text-center lg:block">
                <h1 className="text-3xl md:text-4xl xl:text-[50px] font-extrabold leading-none tracking-[-0.03em] text-[#082E6A]">
                  Create Your Account
                </h1>
                <p className="mt-2 text-base xl:text-[18px] text-[#49576A]">
                  Start your WelliRecord health vault in minutes.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 lg:mt-[34px] grid grid-cols-2 gap-4 space-y-"
              >
                <InputField
                  label="Full Name"
                  required
                  placeholder="Example: John Doe"
                  value={form.fullName}
                  onChange={update("fullName")}
                  error={errors.fullName}
                />

                <InputField
                  label="Email"
                  required
                  placeholder="johndoe@gmail.com"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  error={errors.email}
                />

                <InputField
                  label="Gender"
                  required
                  isSelect
                  value={form.gender}
                  onChange={update("gender")}
                  error={errors.gender}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </InputField>

                <div className="relative w-full group">
                  <InputField
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    required
                    error={errors.phone}
                  />
                  <div className="absolute left-0 top-full mt-1 w-max rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 shadow-lg opacity-0 group-focus-within:opacity-100 transition-opacity">
                    Please enter a phone number that can receive the OTP code.
                  </div>
                </div>

                {/* Create Password */}
                <InputField
                  label="Create Password"
                  required
                  placeholder="Enter password"
                  showToggle
                  value={form.password}
                  onChange={update("password")}
                  error={errors.password}
                />

                {/* Confirm Password - with restrictions */}
                <InputField
                  label="Confirm Password"
                  required
                  placeholder="Confirm password"
                  showToggle
                  value={form.confirmPassword}
                  onChange={handleConfirmPasswordChange} // ← Special handler for real-time check
                  error={errors.confirmPassword || passwordMatchError} // Show real-time error
                  // Disable confirm password until password is entered
                  disabled={!form.password}
                />

                {/* New: Address Field (Optional) */}
                <InputField
                  label="Address"
                  optional
                  placeholder="Enter your full address"
                  value={form.address}
                  onChange={update("address")}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1a2e1e]">
                    Role <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={update("role")}
                      className="h-11 w-full appearance-none rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-4 pr-10 text-sm sm:text-base text-[#4B5563] outline-none focus:border-[#AEB7C5] focus:bg-white"
                    >
                      <option value="">--- select ---</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="caregiver">Caregiver</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-xs text-red-500">{errors.role}</p>
                    )}

                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* <div className="pt-1 col-span-2">
                  <label className="flex items-start gap-2 text-sm leading-6 text-[#173A71]">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={update("agree")}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border border-[#C9CED6] accent-[#071B3F]"
                    />
                    <span>
                      By continuing, you agree to our Terms of Service and
                      Privacy Policy.
                    </span>
                  </label>
                </div> */}

                <div className="pt-1 text-center col-span-2 w-full">
                  <button
                    type="submit"
                    className="h-11 w-full sm:w-auto sm:min-w-[220px] md:min-w-[500px] rounded-[6px] bg-[#071B3F] hover:bg-[#0c2d66] px-6 text-sm sm:text-base font-semibold text-white shadow-sm transition disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating Health Vault..."
                      : "Create Health Vault"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1 col-span-2">
                  <div className="h-px flex-1 max-w-[120px] bg-[#D8D8D8]" />
                  <span className="text-sm text-[#555]">Or</span>
                  <div className="h-px flex-1 max-w-[120px] bg-[#D8D8D8]" />
                </div>

                <div className="text-center col-span-2">
                  {googleLoading ? (
                    <div className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#1D4A8B]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing up with Google...
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div ref={googleBtnRef} />
                    </div>
                  )}
                </div>

                <div className="text-center text-sm sm:text-[15px] col-span-2 text-[#575757]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/patient/login")}
                    className="text-[#071B3F] hover:text-[#0c2d66] font-bold underline underline-offset-2"
                  >
                    Log in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
