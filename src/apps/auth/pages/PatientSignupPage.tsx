import { useAuth } from "@/shared/auth/AuthProvider";
import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import { profile } from "console";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STYLES = `
@keyframes pat-su-up {
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

function App() {
  const { signUpPatient } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileType, setProfileType] = useState("Personal");
  const [showPw, setShowPw] = useState(false);
  const [isConnectingWeb3, setIsConnectingWeb3] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    signUpPatient(name, email);
    navigate("/patient/overview");
  };

  const handleWeb3Signup = () => {
    setIsConnectingWeb3(true);
    setTimeout(() => {
      setIsConnectingWeb3(false);
      signUpPatient("Web3 User", "web3@patient.com");
      navigate("/patient/overview");
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
            className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(30,58,138,.04), transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div className="flex flex-col gap-1 items-start mb-16">
              <WelliRecordLogo height={36} theme="dark" />
              <div
                className="text-xs font-bold tracking-widest uppercase mt-1 pl-1"
                style={{ color: "#0d9488" }}
              >
                Patient Portal
              </div>
            </div>

            <h2
              className="font-black text-4xl leading-tight mb-4 tracking-tight"
              style={{ color: "#1e293b" }}
            >
              Your health vault,
              <br />
              built for life.
            </h2>
            <p
              className="text-sm leading-relaxed mb-10"
              style={{ color: "#475569" }}
            >
              Join thousands of patients who have taken control of their health
              records. Free forever — you own 100% of your data.
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  step: "01",
                  title: "Create your vault",
                  desc: "Takes 60 seconds, no credit card required.",
                },
                {
                  step: "02",
                  title: "Connect your records",
                  desc: "Import from hospitals, labs, and wearables.",
                },
                {
                  step: "03",
                  title: "Control who sees what",
                  desc: "Grant and revoke provider access anytime.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-4">
                  <div
                    className="text-xs font-black w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#f0fdfa",
                      color: "#0d9488",
                      border: "1px solid #ccfbf1",
                    }}
                  >
                    {step}
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
            {["HIPAA Ready", "NDPR Compliant", "E2E Encrypted"].map((b) => (
              <div
                key={b}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "#64748b" }}
              >
                <CheckCircle size={12} style={{ color: "#0d9488" }} /> {b}
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
            style={{ animation: "pat-su-up .5s ease both" }}
          >
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 mb-8 text-sm font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "#4a6e58" }}
            >
              <ArrowLeft size={15} /> Back to portal selection
            </button>

            <div className="mb-8">
              <h1
                className="font-black text-3xl leading-tight mb-1"
                style={{ color: "#0f2818" }}
              >
                Create your vault
              </h1>
              <p className="text-sm" style={{ color: "#4a6e58" }}>
                Free forever — you own your data 100%
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#1a2e1e" }}
                >
                  Profile type
                </label>
                <div className="relative">
                  <select
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value)}
                    className="input input-light w-full appearance-none bg-white"
                    style={{ paddingLeft: "1rem", cursor: "pointer" }}
                  >
                    <option value="Personal">Personal Profile</option>
                    <option value="Child">
                      Child (Dependants & Child Records)
                    </option>
                    <option value="Family">Family Profile</option>
                  </select>
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#9ca3af" }}
                  >
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
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#1a2e1e" }}
                >
                  Full name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-light"
                    style={{ paddingLeft: "2.6rem" }}
                    placeholder="Amara Okafor"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#1a2e1e" }}
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-light"
                    style={{ paddingLeft: "2.6rem" }}
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#1a2e1e" }}
                >
                  Create password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-light"
                    style={{ paddingLeft: "2.6rem", paddingRight: "2.75rem" }}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Privacy note */}
              <div
                className="rounded-xl p-3 flex gap-3 items-start"
                style={{
                  background: "rgba(26,107,66,.07)",
                  border: "1px solid rgba(26,107,66,.15)",
                }}
              >
                <Shield
                  size={15}
                  style={{ color: "#1a6b42", flexShrink: 0, marginTop: 2 }}
                />
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#4a6e58" }}
                >
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy. Your data is AES-256 encrypted and only you control
                  access.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-patient w-full justify-center"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating vault…" : "Create Health Vault →"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="divider-patient" />
              <span
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs"
                style={{ color: "#9ca3af" }}
              >
                or Web3
              </span>
            </div>

            <button
              onClick={handleWeb3Signup}
              disabled={isConnectingWeb3}
              className="btn w-full justify-center gap-2"
              style={{
                background: "#0e1726",
                color: "#fff",
                opacity: isConnectingWeb3 ? 0.7 : 1,
              }}
            >
              <Wallet size={15} />{" "}
              {isConnectingWeb3
                ? "Connecting Wallet..."
                : "Connect Web3 Wallet"}
            </button>

            <p
              className="mt-6 text-center text-sm"
              style={{ color: "#5a7a63" }}
            >
              Already have an account?{" "}
              <Link
                to="/auth/patient/login"
                className="font-bold hover:underline"
                style={{ color: "#1a6b42" }}
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

function RxIconCard() {
  return (
    <div className="flex h-[106px] w-[106px] items-center justify-center rounded-[22px] border border-white/60 bg-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <svg viewBox="0 0 64 64" className="h-[58px] w-[58px]" fill="none">
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
    <div className="flex h-[106px] w-[106px] items-center justify-center rounded-[22px] border border-white/60 bg-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
      <svg viewBox="0 0 64 64" className="h-[58px] w-[58px]" fill="none">
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
    <div className="relative h-[208px] w-[102px] rounded-[18px] border-[4px] border-[#1A1A1A] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
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

function InputField({
  label,
  placeholder,
  type = "text",
  showToggle = false,
  value,
  onChange,
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full">
      <div className="mb-[10px] flex items-center justify-between">
        <label className="text-[17px] font-medium text-[#0C3571]">
          {label}
        </label>
        {showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-[16px] font-medium text-[#0C3571]"
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
        className="h-[40px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-[16px] text-[17px] text-[#4B5563] outline-none focus:border-[#AEB7C5] focus:bg-white"
      />
    </div>
  );
}

export default function PatientSignupPage() {
  const { signUpPatient } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    profileType: "Personal",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await signUpPatient(
        form.profileType,
        form.fullName,
        form.email,
        form.password,
      );
      console.log("checkig....", resp);
      if (resp === "Account created successfully") {
        navigate("auth/patient/login");
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
      <div className=" h-screen min-h-[714px] max-w-full overflow-x-hidden border border-[#D9D9D9] bg-white ">
        <div className="grid h-full grid-cols-[45.4%_54.6%] ">
          {/* Left side */}
          <div className="relative overflow-hidden bg-[#E9EEF1]">
            <img
              src="/signups.jpg"
              alt="background"
              className="absolute inset-0 h-full w-full object-cover object-left"
            />

            {/* mask to isolate left panel feeling */}
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

          {/* Right side */}
          <div className="relative bg-[#F3F3F3] pb-8">
            <div className="mx-auto flex h-full w-full max-w-[650px] flex-col px-[78px] pt-[36px]">
              <div className="text-center">
                <h1 className="text-[50px] font-extrabold leading-none tracking-[-0.03em] text-[#082E6A]">
                  Create Your Account
                </h1>
                <p className="mt-[8px] text-[18px] text-[#49576A]">
                  Choose how you want to use WelliRecord.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-[34px] space-y-[20px]"
              >
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: "#1a2e1e" }}
                  >
                    Profile type
                  </label>
                  <div className="relative">
                    <select
                      value={form.profileType}
                      onChange={update("profileType")}
                      // onChange={e => setProfileType(e.target.value)}
                      className="h-[40px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#F4F4F4] px-[16px] text-[17px] text-[#4B5563] outline-none focus:border-[#AEB7C5] focus:bg-white"
                    >
                      <option value="personal">Personal Profile</option>
                      <option value="Child">
                        Child (Dependants & Child Records)
                      </option>
                      <option value="Family">Family Profile</option>
                    </select>
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#9ca3af" }}
                    >
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
                  placeholder="AFRTT6Ygytn56’;."
                  showToggle
                  value={form.password}
                  onChange={update("password")}
                />

                <InputField
                  label="Confirm Password"
                  placeholder="AFRTT6Ygytn56’;."
                  showToggle
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                />

                <div className="pt-[4px]">
                  <label className="flex items-center gap-[8px] text-[15px] leading-[1.4] text-[#173A71]">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={update("agree")}
                      className="h-[20px] w-[20px] rounded-[4px] border border-[#C9CED6] accent-[#2F915C]"
                    />
                    <span>
                      By continuing, you agree to our Terms of Service and
                      Privacy Policy.
                    </span>
                  </label>
                </div>

                <div className="pt-[2px] text-center">
                  <button
                    type="submit"
                    // onClick={handleSubmit}
                    className="h-[44px] min-w-[201px] rounded-[6px] bg-[#2F915C] px-[28px] text-[17px] font-semibold text-white shadow-sm transition hover:brightness-95"
                  >
                    {loading
                      ? "Creating Health Vault..."
                      : "Create Health Vault"}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-[10px] pt-[2px]">
                  <div className="h-px w-[88px] bg-[#D8D8D8]" />
                  <span className="text-[15px] text-[#555]">Or</span>
                  <div className="h-px w-[88px] bg-[#D8D8D8]" />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-[8px] text-[16px] font-medium text-[#1D4A8B]"
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

                <div className="text-center text-[15px] text-[#575757]">
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
          </div>
        </div>
      </div>
    </div>
  );
}
