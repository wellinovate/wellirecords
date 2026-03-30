import { useAuth } from "@/shared/auth/AuthProvider";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RxIconCard() {
  return (
    <div className="flex h-20 w-20 sm:h-[92px] sm:w-[92px] lg:h-[106px] lg:w-[106px] items-center justify-center rounded-[20px] lg:rounded-[22px] border border-white/60 bg-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <svg viewBox="0 0 64 64" className="h-11 w-11 sm:h-12 sm:w-12 lg:h-[58px] lg:w-[58px]" fill="none">
        <path d="M18 38h28" stroke="#3D5A73" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M22 38c2-9 6.5-15 10-15s8 6 10 15" stroke="#3D5A73" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 22l23-7" stroke="#3D5A73" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M42 16l5-6" stroke="#3D5A73" strokeWidth="2.2" strokeLinecap="round" />
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
      <svg viewBox="0 0 64 64" className="h-11 w-11 sm:h-12 sm:w-12 lg:h-[58px] lg:w-[58px]" fill="none">
        <path d="M32 18v28" stroke="#3D5A73" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 32h28" stroke="#3D5A73" strokeWidth="4" strokeLinecap="round" />
        <rect x="10" y="10" width="44" height="44" rx="10" stroke="#3D5A73" strokeWidth="2.2" />
      </svg>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative h-[180px] w-[90px] sm:h-[194px] sm:w-[96px] lg:h-[208px] lg:w-[102px] rounded-[18px] border-[4px] border-[#1A1A1A] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="absolute left-1/2 top-[5px] h-[12px] w-[46px] -translate-x-1/2 rounded-full bg-[#151515]" />
      <div className="px-[8px] pt-[18px]">
        <div className="text-[7px] font-semibold text-[#3B4B5B]">Health Vault</div>
        <div className="mt-[8px] text-[5px] font-semibold text-[#1B2E44]">Dashboard</div>

        <div className="mt-[6px] rounded-[6px] bg-[#F5F7F9] p-[5px]">
          <div className="text-[4.8px] font-semibold text-[#1B2E44]">Medical Records</div>
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
          <div className="text-[4.8px] font-semibold text-[#1B2E44]">Lab Results</div>
          <div className="mt-[3px] grid grid-cols-2 gap-[3px] text-[3.8px] text-[#6B7280]">
            <span>Test Result</span>
            <span>5.40</span>
            <span>Lab Result</span>
            <span>00 TEST</span>
          </div>
        </div>

        <div className="mt-[6px] rounded-[6px] bg-[#F5F7F9] p-[5px]">
          <div className="text-[4.8px] font-semibold text-[#1B2E44]">Prescriptions</div>
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
  placeholder: string;
  type?: string;
  showToggle?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({
  label,
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
        className="h-11 w-full rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-4 text-sm sm:text-base text-[#4B5563] outline-none transition focus:border-[#AEB7C5] focus:bg-white"
      />
    </div>
  );
}

type FormState = {
  profileType: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
};

export default function PatientSignupPage() {
  const { signUpPatient } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    profileType: "Personal",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      const resp = await signUpPatient(
        form.profileType,
        form.fullName,
        form.email,
        form.password
      );

      if (resp === "Account created successfully") {
        navigate("/auth/patient/login");
      }
    } catch (error) {
      console.log("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const update =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const value =
        key === "agree"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setForm((prev) => ({ ...prev, [key]: value }));
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
              className="absolute inset-0 h-full w-full object-cover object-left"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.00)_84%,rgba(233,238,241,0.90)_100%)]" />

            <div className="absolute right-[-2px] top-[170px] z-10">
              <RxIconCard />
            </div>

            <div className="absolute right-[74px] top-[218px] z-10">
              <PhoneMockup />
            </div>

            <div className="absolute right-[-2px] top-[372px] z-10">
              <PlusIconCard />
            </div>
          </div>

          {/* Mobile / tablet hero */}
          <div className="relative overflow-hidden bg-[#E9EEF1] px-5 pb-8 pt-20 sm:px-6 lg:hidden">
            <img
              src="/signups.jpg"
              alt="background"
              className="absolute inset-0 h-full w-full object-cover object-left opacity-40"
            />
            <div className="absolute inset-0 bg-[#E9EEF1]/85" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4">
                <RxIconCard />
                <PhoneMockup />
                <PlusIconCard />
              </div>

              <div className="mt-6 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-[-0.03em] text-[#082E6A]">
                  Create Your Account
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[#49576A]">
                  Choose how you want to use WelliRecord.
                </p>
              </div>
            </div>
          </div>

          {/* Right side / form */}
          <div className="relative bg-[#F3F3F3] pb-8">
            <div className="mx-auto flex h-full w-full max-w-[650px] flex-col px-5 pt-8 sm:px-8 sm:pt-10 md:px-10 lg:px-12 xl:px-[78px] xl:pt-[36px]">
              <div className="hidden text-center lg:block">
                <h1 className="text-4xl xl:text-[50px] font-extrabold leading-none tracking-[-0.03em] text-[#082E6A]">
                  Create Your Account
                </h1>
                <p className="mt-2 text-base xl:text-[18px] text-[#49576A]">
                  Choose how you want to use WelliRecord.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 lg:mt-[34px] space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#1a2e1e]">
                    Profile type
                  </label>

                  <div className="relative">
                    <select
                      value={form.profileType}
                      onChange={update("profileType")}
                      className="h-11 w-full appearance-none rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-4 pr-10 text-sm sm:text-base text-[#4B5563] outline-none focus:border-[#AEB7C5] focus:bg-white"
                    >
                      <option value="">--- select ---</option>
                      <option value="Personal">Personal Profile</option>
                      <option value="Child">Child (Dependants & Child Records)</option>
                      <option value="Family">Family Profile</option>
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
                </div>

                <InputField
                  label="Full Name"
                  placeholder="example: John Doe"
                  value={form.fullName}
                  onChange={update("fullName")}
                />

                <InputField
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                />

                <InputField
                  label="Create Password"
                  placeholder="Enter password"
                  showToggle
                  value={form.password}
                  onChange={update("password")}
                />

                <InputField
                  label="Confirm Password"
                  placeholder="Confirm password"
                  showToggle
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                />

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-sm leading-6 text-[#173A71]">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={update("agree")}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border border-[#C9CED6] accent-[#2F915C]"
                    />
                    <span>
                      By continuing, you agree to our Terms of Service and Privacy Policy.
                    </span>
                  </label>
                </div>

                <div className="pt-1 text-center">
                  <button
                    type="submit"
                    className="h-11 w-full sm:w-auto sm:min-w-[220px] rounded-[6px] bg-[#2F915C] px-6 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? "Creating Health Vault..." : "Create Health Vault"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="h-px flex-1 max-w-[120px] bg-[#D8D8D8]" />
                  <span className="text-sm text-[#555]">Or</span>
                  <div className="h-px flex-1 max-w-[120px] bg-[#D8D8D8]" />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#1D4A8B]"
                  >
                    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]">
                      <path
                        d="M21.35 12.23c0-.72-.06-1.25-.2-1.8H12v3.41h5.37c-.11.85-.74 2.13-2.13 2.99l-.02.11 3.1 2.4.21.02c1.92-1.77 3.02-4.37 3.02-7.13Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.07-2.38c-.82.57-1.91.97-3.38.97-2.57 0-4.75-1.69-5.52-4.02l-.1.01-3.23 2.49-.03.1C4.71 19.72 8.08 21.75 12 21.75Z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.48 13.95A5.98 5.98 0 0 1 6.16 12c0-.68.12-1.34.31-1.95l-.01-.13-3.26-2.53-.11.05A9.7 9.7 0 0 0 2 12c0 1.57.37 3.05 1.03 4.38l3.45-2.43Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 6.03c1.85 0 3.1.8 3.81 1.46l2.78-2.71C16.83 3.16 14.63 2.25 12 2.25 8.08 2.25 4.71 4.28 3.12 7.45l3.38 2.61C7.25 7.72 9.43 6.03 12 6.03Z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign Up</span>
                  </button>
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