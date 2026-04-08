import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

function RxIconCard() {
  return (
    <div className="flex h-20 w-20 sm:h-[92px] sm:w-[92px] lg:h-[106px] lg:w-[106px] items-center justify-center rounded-[20px] lg:rounded-[22px] border border-white/60 bg-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <svg
        viewBox="0 0 64 64"
        className="h-11 w-11 sm:h-12 sm:w-12 lg:h-[58px] lg:w-[58px]"
        fill="none"
      >
        <path
          d="M18 38h28"
          stroke="#3D5A73"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M22 38c2-9 6.5-15 10-15s8 6 10 15"
          stroke="#3D5A73"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M20 22l23-7"
          stroke="#3D5A73"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M42 16l5-6"
          stroke="#3D5A73"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <text
          x="25"
          y="33"
          fill="#3D5A73"
          fontSize="12"
          fontWeight="700"
          fontFamily="sans-serif"
        >
          Rx
        </text>
      </svg>
    </div>
  );
}

function PlusIconCard() {
  return (
    <div className="flex h-20 w-20 sm:h-[92px] sm:w-[92px] lg:h-[106px] lg:w-[106px] items-center justify-center rounded-[20px] lg:rounded-[22px] border border-white/60 bg-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <svg
        viewBox="0 0 64 64"
        className="h-11 w-11 sm:h-12 sm:w-12 lg:h-[58px] lg:w-[58px]"
        fill="none"
      >
        <path
          d="M32 18v28"
          stroke="#3D5A73"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M18 32h28"
          stroke="#3D5A73"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="10"
          y="10"
          width="44"
          height="44"
          rx="10"
          stroke="#3D5A73"
          strokeWidth="2.2"
        />
      </svg>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative h-[180px] w-[90px] sm:h-[194px] sm:w-[96px] lg:h-[208px] lg:w-[102px] rounded-[18px] border-[4px] border-[#1A1A1A] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="absolute left-1/2 top-[5px] h-[12px] w-[46px] -translate-x-1/2 rounded-full bg-[#151515]" />
      <div className="px-[8px] pt-[18px]">
        <div className="text-[7px] font-semibold text-[#3B4B5B]">
          Health Vault
        </div>
        <div className="mt-[8px] text-[5px] font-semibold text-[#1B2E44]">
          Dashboard
        </div>

        <div className="mt-[6px] rounded-[6px] bg-[#F5F7F9] p-[5px]">
          <div className="text-[4.8px] font-semibold text-[#1B2E44]">
            Medical Records
          </div>
          <div className="mt-[3px] grid grid-cols-2 gap-[3px] text-[3.8px] text-[#6B7280]">
            <span>Name</span>
            <span>John</span>
            <span>Date</span>
            <span>22/02</span>
            <span>Condition</span>
            <span>Eye Health</span>
          </div>
        </div>

        <div className="mt-[6px] rounded-[6px] bg-[#F5F7F9] p-[5px]">
          <div className="text-[4.8px] font-semibold text-[#1B2E44]">
            Lab Results
          </div>
          <div className="mt-[3px] grid grid-cols-2 gap-[3px] text-[3.8px] text-[#6B7280]">
            <span>Test Result</span>
            <span>5.40</span>
            <span>Lab Result</span>
            <span>00 TEST</span>
          </div>
        </div>

        <div className="mt-[6px] rounded-[6px] bg-[#F5F7F9] p-[5px]">
          <div className="text-[4.8px] font-semibold text-[#1B2E44]">
            Prescriptions
          </div>
          <div className="mt-[3px] grid grid-cols-2 gap-[3px] text-[3.8px] text-[#6B7280]">
            <span>Name</span>
            <span>---</span>
            <span>Prescription</span>
            <span>$149.00</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5px] left-0 right-0 flex items-center justify-around px-[12px] text-[8px] text-[#A1A1AA]">
        <span>⌂</span>
        <span>▣</span>
        <span className="text-[#E16B6B]">◔</span>
        <span>◯</span>
      </div>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  placeholder: string;
  type?: string;
  showToggle?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

        {showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-sm sm:text-base font-medium text-[#0C3571]"
          >
            {visible ? "Hide" : "Show"}
          </button>
        ) : (
          <span />
        )}
      </div>

      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-11 w-full rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-4 text-sm sm:text-base text-[#4B5563] outline-none transition focus:border-[#AEB7C5] focus:bg-white ${
          error ? "border-red-500 bg-red-50" : "border-[#D4D4D4] bg-[#F4F4F4]"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  agree: boolean;
};

export default function PatientSignupPage() {
  const { signUpPatient, setUser } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
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

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.role) {
      newErrors.role = "Please select a role";
    }

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
      phone: form.phone.trim() || null,
      password: form.password,
      role: form.role,
      authProvider: "local",
    };

    try {
      setLoading(true);
      const resp = await signUpPatient(payload);

      //  form.profileType,
      //   form.fullName,
      //   form.email,
      //   form.password,
      toast.success("Account created successfully");

      if (resp === "Account created successfully") {
        navigate("/auth/login");
      }
    } catch (error) {
      console.log("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    try {
      setGoogleLoading(true);

      const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
        credential: response.credential,
        role: form.role || "patient",
        phone: form.phone.trim() || null,
      });

      const data = res.data;

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

      if (data?.user?.accountType === "user") {
        navigate("/patient/overview");
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
    };

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
              src="/signups.jpg"
              alt="background"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.00)_84%,rgba(233,238,241,0.90)_100%)]" />
 
          </div>

      

          {/* Right side / form */}
          <div className="relative bg-[#F3F3F3] pb-8 pt-8">
            <div className="mx-auto flex h-full w-full max-w-[650px] flex-col px-5 pt-8 sm:px-8 sm:pt-10 md:px-10 lg:px-12 xl:px-[78px] xl:pt-[36px]">
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
                className="mt-6 lg:mt-[34px] space-y-5"
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
                  label="Phone Number"
                  optional
                  placeholder="+234 801 234 5678"
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                />

                <InputField
                  label="Create Password"
                  required
                  placeholder="Enter password"
                  showToggle
                  value={form.password}
                  onChange={update("password")}
                  error={errors.password}
                />

                <InputField
                  label="Confirm Password"
                  required
                  placeholder="Confirm password"
                  showToggle
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  error={errors.confirmPassword}
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

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-sm leading-6 text-[#173A71]">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={update("agree")}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border border-[#C9CED6] accent-[#2F915C]"
                    />
                    <span>
                      By continuing, you agree to our Terms of Service and
                      Privacy Policy.
                    </span>
                  </label>
                </div>

                <div className="pt-1 text-center">
                  <button
                    type="submit"
                    className="h-11 w-full sm:w-auto sm:min-w-[220px] rounded-[6px] bg-[#2F915C] px-6 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating Health Vault..."
                      : "Create Health Vault"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="h-px flex-1 max-w-[120px] bg-[#D8D8D8]" />
                  <span className="text-sm text-[#555]">Or</span>
                  <div className="h-px flex-1 max-w-[120px] bg-[#D8D8D8]" />
                </div>

                <div className="text-center">
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

                <div className="text-center text-sm sm:text-[15px] text-[#575757]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/patient/login")}
                    className="text-[#2F915C] underline underline-offset-2"
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
