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

export function App() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isConnectingWeb3, setIsConnectingWeb3] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };
  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/auth/provider/verify-org");
  };

  const handleWeb3Signup = () => {
    setIsConnectingWeb3(true);
    setTimeout(() => {
      setIsConnectingWeb3(false);
      navigate("/auth/provider/verify-org");
    }, 1500);
  };

  return (
    <>
      <StyleOnce css={STYLES} />
      <div
        className="min-h-screen flex"
        style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
      >
        {/* ── Left brand panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-2/5 px-12 py-12 relative overflow-hidden"
          style={{ background: "#f8fafc", borderRight: "1px solid #e2e8f0" }}
        >
          <div
            className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(13,148,136,.06), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(30,58,138,.04), transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div className="flex flex-col gap-1 items-start mb-16">
              <WelliRecordLogo height={36} theme="light" />
              <div
                className="text-xs font-bold tracking-widest uppercase mt-1 pl-1"
                style={{ color: "#1e3a8a" }}
              >
                Provider Portal
              </div>
            </div>

            <h2
              className="font-black text-4xl leading-tight mb-4 tracking-tight"
              style={{ color: "#1e293b" }}
            >
              Join the
              <br />
              health network.
            </h2>
            <p
              className="text-sm leading-relaxed mb-10"
              style={{ color: "#475569" }}
            >
              Connect your organisation to patient-owned records. Trusted by
              hospitals, labs, pharmacies, and insurers across Africa.
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Building2,
                  title: "Register your org",
                  desc: "Tell us your organisation type and details.",
                },
                {
                  icon: Shield,
                  title: "Verify & get approved",
                  desc: "Our team reviews your licence and credentials.",
                },
                {
                  icon: Users,
                  title: "Invite your team",
                  desc: "Add clinicians, staff, or sub-departments.",
                },
                {
                  icon: Activity,
                  title: "Access patient records",
                  desc: "With explicit patient consent, always.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <Icon size={16} style={{ color: "#1e3a8a" }} />
                  </div>
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: "#1e293b" }}
                    >
                      {title}
                    </div>
                    <div className="text-xs" style={{ color: "#64748b" }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative z-10 flex flex-wrap gap-3 pt-8 border-t"
            style={{ borderColor: "#e2e8f0" }}
          >
            {["SOC 2 Ready", "ISO 27001", "Consent-gated"].map((b) => (
              <div
                key={b}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "#64748b" }}
              >
                <CheckCircle size={12} style={{ color: "#1e3a8a" }} /> {b}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          style={{ background: "#ffffff" }}
        >
          <div
            className="w-full max-w-sm"
            style={{ animation: "prov-su-up .5s ease both" }}
          >
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 mb-8 text-sm font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "#475569" }}
            >
              <ArrowLeft size={15} /> Back to portal selection
            </button>

            {/* Step progress */}
            <div className="flex gap-2 mb-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className="flex-1 h-1.5 rounded-full transition-all duration-500"
                  style={{ background: s <= step ? "#1e3a8a" : "#e2e8f0" }}
                />
              ))}
            </div>
            <p className="text-xs mb-8" style={{ color: "#64748b" }}>
              Step {step} of 2 —{" "}
              {step === 1 ? "Organisation details" : "Admin contact"}
            </p>

            {step === 1 ? (
              <>
                <div className="mb-8">
                  <h1
                    className="font-black text-3xl leading-tight mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    Register Organisation
                  </h1>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Tell us about your organisation.
                  </p>
                </div>
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-1.5"
                      style={{ color: "#1e293b" }}
                    >
                      Organisation name
                    </label>
                    <input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="input input-light bg-white border-slate-200 w-full"
                      placeholder="Lagos General Hospital"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold mb-1.5"
                      style={{ color: "#1e293b" }}
                    >
                      Organisation type
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="input input-light bg-white border-slate-200 w-full"
                      required
                    >
                      <option value="">Select type…</option>
                      {ORG_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 shadow-sm"
                    style={{ background: "#1e3a8a", marginTop: "12px" }}
                  >
                    Continue →
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h1
                    className="font-black text-3xl leading-tight mb-1"
                    style={{ color: "#1e293b" }}
                  >
                    Admin Contact
                  </h1>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    This person will manage the organisation account.
                  </p>
                </div>
                <form onSubmit={handleStep2} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-1.5"
                      style={{ color: "#1e293b" }}
                    >
                      Full name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input input-light bg-white border-slate-200 w-full"
                      placeholder="Dr. Fatima Aliyu"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold mb-1.5"
                      style={{ color: "#1e293b" }}
                    >
                      Work email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input input-light bg-white border-slate-200 w-full"
                      placeholder="you@org.ng"
                      required
                    />
                  </div>

                  {/* Compliance note */}
                  <div
                    className="rounded-xl p-3 flex gap-3 items-start"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Shield
                      size={14}
                      style={{ color: "#1e3a8a", flexShrink: 0, marginTop: 2 }}
                    />
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#64748b" }}
                    >
                      Verification typically takes 1–2 business days. All
                      provider access is consent-gated and fully audit-logged.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 shadow-sm"
                    style={{ background: "#1e3a8a", marginTop: "12px" }}
                  >
                    Submit for Verification →
                  </button>
                </form>
              </>
            )}

            <div className="relative my-6">
              <div className="border-t border-slate-200 w-full" />
              <span
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs bg-white"
                style={{ color: "#94a3b8" }}
              >
                or
              </span>
            </div>

            <button
              onClick={handleWeb3Signup}
              disabled={isConnectingWeb3}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
              style={{
                color: "#1e3a8a",
                border: "1.5px solid #cbd5e1",
                opacity: isConnectingWeb3 ? 0.7 : 1,
              }}
            >
              <Wallet size={15} />{" "}
              {isConnectingWeb3
                ? "Connecting Wallet..."
                : "Connect Org Wallet (Web3)"}
            </button>

            <p
              className="mt-5 text-center text-sm"
              style={{ color: "#64748b" }}
            >
              Already registered?{" "}
              <Link
                to="/auth/provider/login"
                className="font-bold hover:underline"
                style={{ color: "#1e3a8a" }}
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

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
          className="h-[48px] w-full appearance-none rounded-[7px] border border-[#BFC9D8] bg-[#F8F8F8] px-4 pr-12 text-[17px] text-[#384152] outline-none focus:bg-white"
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
      <div className="mx-auto h-screen min-h-[760px] max-w-full overflow-hidden border border-[#DDDDDD] bg-white">
        <div className="grid h-full grid-cols-[49%_51%]">
          {/* Left panel */}
          <div className="relative overflow-hidden bg-[#DDE5EE]">
            <img
              src="/doctorsignup.png"
              alt="Healthcare professional"
              className="h-full w-full object-cover object-left"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.00)_72%,rgba(221,229,238,0.22)_100%)]" />
          </div>

          {/* Right panel */}
          <div className="overflow-y-auto bg-[#F3F4F5]">
            <div className="mx-auto flex w-full max-w-[720px] flex-col px-[82px] pb-14 pt-[24px]">
              <div className="text-center">
                <h1 className="text-[46px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#062B67]">
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
