import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  CheckCircle,
  Wallet,
  Shield,
  Users,
  Activity,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { doctorsignup } from "@/assets";

const STYLES = `
@keyframes prov-su-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}
`;
function StyleOnce({ css }: { css: string }) {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
    injected.current = true;
  }, [css]);
  return null;
}

const ORG_TYPES = [
  "Hospital / Clinic",
  "Diagnostic Lab",
  "Pharmacy",
  "Telehealth Platform",
  "Insurance Provider",
  "NGO",
  "Government Ministry",
  "Wearable Vendor",
];

function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  showToggle = false,
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-[18px] font-medium leading-none text-[#0A2F6B]">
          {label}
        </label>

        {showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-[15px] font-medium text-[#0A2F6B]"
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
        className="h-[46px] w-full rounded-[9px] border border-[#D7D7D7] bg-[#F8F8F8] px-4 text-[17px] text-[#384152] outline-none placeholder:text-[#B7B7B7] focus:border-[#BFC9D8] focus:bg-white"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="text-[18px] font-medium leading-none text-[#333B4C]">
          {label}
        </label>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-[48px] w-full appearance-none rounded-[7px] border border-[#BFC9D8] bg-[#F8F8F8] px-4 pr-12 text-[14px] md:text-[17px] text-[#384152] outline-none focus:bg-white"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="#3B4658"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
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
  );
}

export function ProviderSignupPage() {
  const { signUpProvider } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organisationName: "",
    organisationType: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("🚀 ~ handleSubmit ~ form:", form);
    try {
      const resp = await signUpProvider(
        form.organisationType,
        form.organisationName,
        form.email,
        form.phone,
        form.country,
        form.password,
      );
      console.log("checkig....", resp);
      if (resp === "Account created successfully") {
        navigate("auth/provider/login");
      }
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => {
    const value = key === "agree" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative mx-auto h-screen min-h-[760px] max-w-full overflow-hidden border border-[#DDDDDD] bg-white">
        <div className="mb-4 absolute top-5 md:top-10  md:left-20 z-50 bg-gray-100 px-5 rounded-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#062B67] hover:opacity-70 transition"
          >
            <ArrowLeft size={26} className="  " />
            <span className="text-sm md:text-lg  font-bold">Back</span>
          </button>
        </div>

        <div className="flex h-full ">
          {/* Left panel */}
          <div className="hidden md:block md:w-[45%] relative overflow-hidden bg-[#DDE5EE]">
            <img
              src={doctorsignup}
              alt="Healthcare professional"
              className="h-full w-full object-center object-cover"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.00)_72%,rgba(221,229,238,0.22)_100%)]" />
          </div>

          {/* Right panel */}
          <div className="overflow-y-auto md:w-[55%] bg-[#F3F4F5] pt-6">
            <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 md:px-[82px] pb-14 pt-[24px]">
              <div className="text-center">
                <h1 className="text-[36px] md:text-[46px] font-extrabold leading-[1.08] md:tracking-[-0.03em] text-[#062B67]">
                  Register Your Healthcare {/* <br /> */}
                  Organisation
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="mt-9 space-y-8">
                <FormInput
                  label="Organisation Name"
                  placeholder="example: John Doe"
                  value={form.organisationName}
                  onChange={update("organisationName")}
                />

                {/* {ORG_TYPES.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))} */}
                <FormSelect
                  label="Organisation Type"
                  value={form.organisationType}
                  onChange={update("organisationType")}
                  //  options={ORG_TYPES}

                  options={[
                    { value: "", label: "Select", disabled: true },

                    {
                      value: "healthcare_provider",
                      label: "Healthcare Provider (Hospital, Lab, Pharmacy)",
                    },

                    {
                      value: "diagnostic",
                      label: "Diagnostic Only (Lab Center)",
                    },
                    { value: "pharmacy", label: "Pharmacy Only" },

                    { value: "telehealth", label: "Telehealth Platform" },
                    { value: "insurance", label: "Insurance Provider" },
                    { value: "ngo", label: "NGO" },
                    { value: "government", label: "Government / Ministry" },
                    { value: "vendor", label: "Medical / Device Vendor" },
                  ]}
                />

                <FormInput
                  label="Work Email"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                />

                <FormInput
                  label="Phone Number"
                  placeholder="johndoe@gmail.com"
                  value={form.phone}
                  onChange={update("phone")}
                />

                <FormSelect
                  label="Country"
                  value={form.country}
                  onChange={update("country")}
                  options={[
                    { value: "", label: "Select", disabled: true },
                    { value: "ng", label: "Nigeria" },
                    { value: "gh", label: "Ghana" },
                    { value: "ke", label: "Kenya" },
                    { value: "uk", label: "United Kingdom" },
                    { value: "us", label: "United States" },
                  ]}
                />

                <FormInput
                  label="Create Password"
                  placeholder="AFRTT6Ygytn56’;."
                  value={form.password}
                  onChange={update("password")}
                  showToggle
                />

                <FormInput
                  label="Confirm Password"
                  placeholder="AFRTT6Ygytn56’;."
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  showToggle
                />

                <div className="pt-1">
                  <label className="flex items-center gap-2 text-[15px] leading-[1.4] text-[#173A71]">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={update("agree")}
                      className="h-[21px] w-[21px] rounded-[4px] border border-[#C6CEDA] accent-[#2F915C]"
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
                    className="inline-flex h-[44px] items-center justify-center rounded-[6px] bg-[#2F915C] px-8 text-[17px] font-semibold text-white shadow-sm transition hover:brightness-95"
                  >
                    Register Organisation
                  </button>
                </div>

                <p className="text-center text-[15px] text-[#32445B]">
                  Organisation accounts will be reviewed before activation.
                </p>

                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-[84px] bg-[#D9D9D9]" />
                  <span className="text-[15px] text-[#4D4D4D]">Or</span>
                  <div className="h-px w-[84px] bg-[#D9D9D9]" />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[16px] font-medium text-[#173A71]"
                  >
                    <GoogleIcon />
                    <span>Sign Up</span>
                  </button>
                </div>

                <div className="text-center text-[15px] text-[#5E5E5E]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-[#2F915C] underline underline-offset-2"
                  >
                    Log in
                  </button>
                </div>
              </form>
            </div>

            {/* bottom black strip visible in screenshot */}
            <div className="h-[8px] w-full bg-[#1B0D2A]" />
          </div>
        </div>
      </div>
    </div>
  );
}
