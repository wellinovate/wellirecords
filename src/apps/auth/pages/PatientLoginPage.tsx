import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle,
  Activity,
  Zap,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react";
import { phone } from "@/assets";

const BRAND_FEATURES = [
  {
    icon: Shield,
    title: "AES-256 Encryption",
    desc: "Your records form a cryptographic zero-knowledge vault.",
  },
  {
    icon: Lock,
    title: "Granular Consent",
    desc: "You approve every single access to your medical history.",
  },
  {
    icon: Zap,
    title: "Emergency Ready",
    desc: "NFC medical ID card to instantly securely share vitals.",
  },
  {
    icon: Activity,
    title: "AI Companion",
    desc: "Chat with WelliMate to decode your lab results and notes.",
  },
];

const TRUST = [
  "HIPAA Ready",
  "NDPR Compliant",
  "E2E Encrypted",
  "Patient-owned",
];

export function App() {
  const navigate = useNavigate();
  const { signIn, signInAsRole } = useAuth();
  const [email, setEmail] = useState("amara@patient.com");
  const [password, setPassword] = useState("password");
  const [profileType, setProfileType] = useState("Personal");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWeb3, setShowWeb3] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // --- Access Restrictions based on Profile Type ---
    if (profileType === "Child") {
      setError(
        "Restricted Access: Child records cannot log in independently. A parent or guardian must log in via a Personal or Family profile to access dependants.",
      );
      return;
    }

    // Proceed with login...
    setLoading(true);
    setError("");
    const user = signIn(email, password);
    setLoading(false);
    if (!user) {
      setError("Invalid email or password. Try: amara@patient.com");
      return;
    }
    if (!user.roles?.includes("patient")) {
      setError("This account is not a patient account.");
      return;
    }

    // Pass the profile type to state so we know what mode they logged in as
    localStorage.setItem("activeProfileType", profileType);

    navigate("/patient/overview");
  };

  const handleWeb3 = () => {
    setWeb3Loading(true);
    setTimeout(() => {
      signInAsRole("patient");
      navigate("/patient/overview");
    }, 1400);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        background: "#f8faf9",
      }}
    >
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 px-12 py-10 relative overflow-hidden flex-shrink-0"
        style={{ background: "#f0fdfa", borderRight: "1px solid #ccfbf1" }}
      >
        {/* Decorative soft orbs */}
        <div
          className="absolute top-[-100px] left-[-60px] w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(13,148,136,.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(30,58,138,.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex flex-col gap-1 items-start mb-14">
            <WelliRecordLogo height={40} theme="dark" />
            <div
              className="text-[10px] font-bold tracking-widest uppercase mt-1 pl-1"
              style={{ color: "#0d9488" }}
            >
              Patient Portal
            </div>
          </div>

          <h2
            className="font-black text-4xl leading-tight mb-3 tracking-tight"
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
            Access your encrypted records, manage who sees your medical history,
            and get AI-assisted health insights — all on your terms.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-5">
            {BRAND_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#ffffff", border: "1px solid #ccfbf1" }}
                >
                  <Icon size={16} style={{ color: "#0d9488" }} />
                </div>
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#1e293b" }}
                  >
                    {title}
                  </div>
                  <div
                    className="text-xs leading-relaxed mt-0.5"
                    style={{ color: "#64748b" }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div
          className="relative z-10 pt-8 border-t"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {TRUST.map((t) => (
              <div
                key={t}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "#64748b" }}
              >
                <CheckCircle size={12} style={{ color: "#0d9488" }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: "#ffffff" }}
      >
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Back */}
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 mb-8 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "#5a7a63" }}
          >
            <ArrowLeft size={15} /> Back to portal selection
          </button>

          <div className="mb-7">
            <h1
              className="font-black text-3xl leading-tight mb-1"
              style={{ color: "#0f2818" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "#4a6e58" }}>
              Sign in to your health vault
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3 rounded-xl text-sm"
              style={{
                background: "rgba(220,38,38,.06)",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,.18)",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
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
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value)}
                  className="input input-light w-full appearance-none bg-white transition-all focus:ring-2 focus:ring-emerald-500/20"
                  style={{
                    paddingLeft: "1rem",
                    cursor: "pointer",
                    borderColor: "rgba(26,107,66,.2)",
                  }}
                >
                  <option value="Personal">Personal Profile</option>
                  <option value="Child">
                    Child (Dependants & Child Records)
                  </option>
                  <option value="Family" className="font-bold text-amber-700">
                    Family Profile ✦ Premium
                  </option>
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
                  className="input input-light transition-all focus:ring-2 focus:ring-emerald-500/20"
                  style={{
                    paddingLeft: "2.5rem",
                    borderColor: "rgba(26,107,66,.2)",
                  }}
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#1a2e1e" }}
                >
                  Password
                </label>
                <span
                  className="text-xs font-semibold cursor-pointer hover:underline"
                  style={{ color: "#1a6b42" }}
                >
                  Forgot password?
                </span>
              </div>
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
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-patient w-full justify-center gap-2"
              style={{ opacity: loading ? 0.7 : 1, marginTop: "6px" }}
            >
              {loading ? "Signing in…" : "Sign In to Health Vault"}{" "}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Web3 — demoted to subtle secondary option */}
          <div className="mt-5 text-center">
            {!showWeb3 ? (
              <button
                onClick={() => setShowWeb3(true)}
                className="text-xs hover:underline transition-opacity hover:opacity-80"
                style={{ color: "#5a7a63" }}
              >
                Sign in with Web3 wallet instead
              </button>
            ) : (
              <button
                onClick={handleWeb3}
                disabled={web3Loading}
                className="btn w-full justify-center gap-2 text-sm"
                style={{
                  background: "rgba(26,107,66,.06)",
                  color: "#1a6b42",
                  border: "1px solid rgba(26,107,66,.15)",
                  opacity: web3Loading ? 0.7 : 1,
                }}
              >
                <Wallet size={14} />{" "}
                {web3Loading ? "Connecting…" : "Connect Web3 Wallet"}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "#5a7a63" }}>
            No account yet?{" "}
            <Link
              to="/auth/patient/signup"
              className="font-bold hover:underline"
              style={{ color: "#1a6b42" }}
            >
              Create your health vault →
            </Link>
          </p>

          {/* Dev-mode demo link — clearly scoped */}
          {isLocalhost && (
            <div
              className="mt-8 rounded-xl p-3 text-center"
              style={{
                background: "rgba(26,107,66,.05)",
                border: "1px dashed rgba(26,107,66,.2)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "#5a7a63" }}
              >
                Development only
              </p>
              <button
                onClick={() => {
                  signInAsRole("patient");
                  navigate("/patient/overview");
                }}
                className="text-xs font-semibold hover:underline"
                style={{ color: "#1a6b42" }}
              >
                Skip to patient portal (demo account)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <label className="text-[18px] font-medium text-[#0A2F6B]">
          {label}
        </label>

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="text-[15px] text-[#0A2F6B]"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="AFRTT6Ygytn56’;."
        className="w-full h-[46px] px-4 rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] text-[16px] outline-none focus:bg-white"
      />
    </div>
  );
}

function TextInput({ label, placeholder, value, onChange }) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-[18px] font-medium text-[#0A2F6B]">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-[46px] px-4 rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] text-[16px] outline-none focus:bg-white"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.25-.2-1.8H12v3.41h5.37
        c-.11.85-.74 2.13-2.13 2.99l-.02.11
        3.1 2.4.21.02c1.92-1.77 3.02-4.37
        3.02-7.13z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87
        6.45-2.37l-3.07-2.38
        c-.82.57-1.91.97-3.38.97
        -2.57 0-4.75-1.69-5.52-4.02
        l-.1.01-3.23 2.49-.03.1
        C4.71 19.72 8.08 21.75 12 21.75z"
      />
      <path
        fill="#FBBC05"
        d="M6.48 13.95A5.98 5.98 0 0 1
        6.16 12c0-.68.12-1.34.31-1.95
        l-.01-.13-3.26-2.53-.11.05
        A9.7 9.7 0 0 0 2 12
        c0 1.57.37 3.05 1.03 4.38l3.45-2.43z"
      />
      <path
        fill="#EA4335"
        d="M12 6.03c1.85 0 3.1.8
        3.81 1.46l2.78-2.71
        C16.83 3.16 14.63 2.25
        12 2.25 8.08 2.25
        4.71 4.28 3.12 7.45
        l3.38 2.61C7.25 7.72
        9.43 6.03 12 6.03z"
      />
    </svg>
  );
}

export function PatientLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [profileType, setProfileType] = useState("Personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Access Restrictions based on Profile Type ---
    if (profileType === "Child") {
      setError(
        "Restricted Access: Child records cannot log in independently. A parent or guardian must log in via a Personal or Family profile to access dependants.",
      );
      return;
    }

    console.log("🚀 ~ handleSubmit ~ form?.email:", form?.email);
    // Proceed with login...
    setLoading(true);
    setError("");
    const user = await signIn(form?.email, form?.password);
    console.log("🚀 ~ handleSubmit ~ user:", user);
    setLoading(false);
    if (!user) {
      setError("Invalid email or password. try again");
      return;
    }
    localStorage.setItem("activeProfileType", profileType);
    if (user?.data?.account?.accountType === "user") {
      navigate("/patient/overview");
    } else {
      navigate("/provider/overview");

    }
    // if (!user.roles?.includes("patient")) {
    //   setError("This account is not a patient account.");
    //   return;
    // }

    // Pass the profile type to state so we know what mode they logged in as

  };

  //   const handleWeb3 = () => {
  //     setWeb3Loading(true);
  //     setTimeout(() => {
  //       signInAsRole("patient");
  //       navigate("/patient/overview");
  //     }, 1400);
  //   };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-white">
      <div className=" h-screen max-w-full border border-gray-200">
        <div className="flex h-full px-1  ">
          {/* LEFT IMAGE PANEL */}
          <div className="hidden md:block relative w-full flex-1 overflow-hidden bg-[#E8EDF2]">
            <img
              src={phone}
              alt="Phone UI"
              className="  w-ful h-full object-cover"
            />

            <div className=" top-0 left-0 w-full h-[4px] bg-[#2F915C]" />
          </div>

          {/* RIGHT LOGIN PANEL */}
          <div className="bg-[#F3F4F5] flex w-full flex-1 items-start justify-center px-3">

            
            <div className="w-full max-w-[460px] mt-[70px]">
              <h1 className="text-[44px] font-extrabold text-center text-[#062B67]">
                Welcome Back!
              </h1>

              <form onSubmit={handleSubmit} className="mt-12 space-y-8">
                <TextInput
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  value={form.email}
                  onChange={update("email")}
                />

                <PasswordInput
                  label="Password"
                  value={form.password}
                  onChange={update("password")}
                />

                <div className="text-right text-[14px] text-gray-500">
                  Forgot Password?
                </div>

                <button
                  type="submit"
                  className="w-full h-[46px] bg-[#2F915C] text-white rounded-md text-[18px] font-semibold hover:brightness-95 transition"
                >
                  {loading ? "Signing in..." : " Log In"}
                </button>

                {/* divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-300"></div>
                  <span className="text-gray-500 text-[14px]">Or</span>
                  <div className="h-px flex-1 bg-gray-300"></div>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 text-[16px] text-[#173A71]"
                >
                  <GoogleIcon />
                  Sign In
                </button>

                <div className="text-center text-[15px] text-[#333]">
                  Connect Wallet (Web3 Access)
                </div>

                <div className="text-center text-[15px] text-gray-500">
                  Don’t have an account?{" "}
                  <span className="text-[#2F915C] cursor-pointer">Sign Up</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
