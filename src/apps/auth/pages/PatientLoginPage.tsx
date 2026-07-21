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
  const { setUser, verifyLoginCodeApi, signIn, resendVerifyLoginCodeApi } = useAuth();
  const navigate = useNavigate();

  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const [profileType, setProfileType] = useState("Personal");

  const [step, setStep] = useState<LoginStep>("credentials");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

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

    try {
      setCode("");         // clear existing OTP
      setTimeLeft(300);    // reset countdown to 5 minutes
      setError("");        // clear error messages

      const res = await resendVerifyLoginCodeApi(challengeToken);
      const payload = res?.data || res;

      if (!payload?.challengeToken) {
        throw new Error("Failed to resend OTP");
      }

      // Update challenge token and optionally masked phone
      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || maskedPhone);

      toast.success("OTP resent successfully");

    } catch (err: any) {
      console.error("Resend OTP error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Unable to resend OTP";
      toast.error(message);
    }
  };

  const redirectAfterLogin = (accountType?: string) => {
    localStorage.setItem("activeProfileType", profileType);

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
      );

      const payload = res?.data || res;
      console.log("🚀 ~ handleSubmitCredentials ~ payload:", payload)

      if (!payload?.requiresOtp || !payload?.challengeToken) {
        throw new Error("Login verification could not be started.");
      }

      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || "your phone number");
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

      const res = await verifyLoginCodeApi(
        challengeToken,
        code,
      );

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
              loginMethod: "Email & Password",
              deviceInfo: navigator.userAgent,
              dashboardUrl: `${window.location.origin}/dashboard`,
              secureAccountUrl: `${window.location.origin}/security`
            }
          })
        }).catch(err => console.error("Failed to send welcome-back email:", err));
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
    setError("");
  };

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
        credential: response.credential,
        profileType,
      });

      const data = res.data;

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
              secureAccountUrl: `${window.location.origin}/security`
            }
          })
        }).catch(err => console.error("Failed to send welcome-back email:", err));
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
        text: "signin_with",
        shape: "rectangular",
        width: 460,
      });
    };

    const existingScript = document.getElementById("google-gsi-script");

    if (existingScript && window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-gsi-script";
    script.onload = renderGoogleButton;

    document.head.appendChild(script);
  }, [googleClientId, step]);

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="relative h-screen w-full max-w-full border border-gray-200">
        <div className="absolute left-1 top-4 z-50 mb-4 rounded-lg bg-gray-100 px-5 md:left-20 md:top-10">
          <button
            onClick={() => {
              if (step === "otp") {
                handleBackToCredentials();
                return;
              }

              navigate(-1);
            }}
            className="flex items-center gap-2 text-[#062B67] transition hover:opacity-70"
          >
            <ArrowLeft size={26} />
            <span className="text-sm font-bold md:text-lg">
              {step === "otp" ? "Back to Login" : "Back"}
            </span>
          </button>
        </div>

        <div className="flex h-full px-1">
          <div className="relative hidden w-full flex-1 overflow-hidden bg-[#E8EDF2] md:block">
            <img
              src={phone}
              alt="Phone UI"
              className="h-full w-full object-cover"
            />
            <div className="absolute left-0 top-0 h-[4px] w-full bg-[#071B3F]" />
          </div>

          <div className="flex w-full flex-1 items-start justify-center bg-[#F3F4F5] px-3">
            <div className="mt-[70px] w-full max-w-[460px]">
              {step === "credentials" && (
                <>
                  <h1 className="text-center text-[34px] font-extrabold text-[#062B67] md:text-[44px]">
                    Welcome Back!
                  </h1>

                  <form
                    onSubmit={handleSubmitCredentials}
                    className="mt-12 space-y-8"
                  >
                    <TextInput
                      label="Email"
                      placeholder="johndoe@gmail.com"
                      value={form.email}
                      onChange={update("email")}
                      disabled={loading || googleLoading}
                    />

                    <PasswordInput
                      label="Password"
                      value={form.password}
                      onChange={update("password")}
                      disabled={loading || googleLoading}
                    />

                    {error && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="text-right text-[14px] text-gray-500">
                      Forgot Password?
                    </div>

                    <button
                      type="submit"
                      disabled={loading || googleLoading || !isFormValid}
                      className={`flex h-[46px] w-full items-center justify-center gap-2 rounded-md text-[18px] font-semibold text-white transition ${loading || googleLoading || !isFormValid
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-[#071B3F] hover:bg-[#0c2d66]"
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gray-300" />
                      <span className="text-[14px] text-gray-500">Or</span>
                      <div className="h-px flex-1 bg-gray-300" />
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

                    <div className="text-center text-[15px] text-gray-500">
                      Don’t have an account?{" "}
                      <Link
                        to="/auth/patient/signup"
                        className="cursor-pointer font-bold text-[#071B3F] hover:text-[#0c2d66] underline underline-offset-2"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </form>
                </>
              )}

              {step === "otp" && (
                <>
                  <h1 className="text-center text-[32px] font-extrabold text-[#062B67] md:text-[40px]">
                    Verify Login
                  </h1>

                  <form onSubmit={handleVerifyCode}>
                    <OTPForm
                      maskedPhone={maskedPhone}
                      code={code}
                      setCode={setCode}
                      isCodeValid={isCodeValid}
                      verifying={verifying}
                      handleResend={handleResend}
                      timeLeft={timeLeft}
                      setTimeLeft={setTimeLeft}
                    />

                    <button
                      type="submit"
                      disabled={verifying || !isCodeValid}
                      className={`mt-6 w-full rounded-xl py-3 text-white font-bold transition-all ${verifying || !isCodeValid ? "bg-gray-400 cursor-not-allowed" : "bg-[#071B3F] hover:bg-[#0c2d66]"
                        }`}
                    >
                      {verifying ? "Verifying..." : "Verify and Login"}
                    </button>
                  </form>
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
