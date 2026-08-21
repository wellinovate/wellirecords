import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  Building2,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle,
  Activity,
  Users,
  ChevronDown,
  Check,
} from "lucide-react";
import { UserRole } from "@/shared/types/types";
import { ROLE_METADATA } from "@/shared/rbac/permissions";
import OTPForm from "@/apps/patient/components/OTPInput";
import Cookies from "js-cookie";
import { PATIENT_SIDE_ROLES } from "@/shared/auth/RequireRole";
import { welliIcon } from "@/assets";

const BRAND_FEATURES = [
  {
    icon: Building2,
    title: "Org Verification",
    desc: "Every provider undergoes identity and licence verification before gaining access.",
  },
  {
    icon: Shield,
    title: "Consent-gated Access",
    desc: "Records are only accessible with explicit patient approval — zero exceptions.",
  },
  {
    icon: Activity,
    title: "Full Audit Trail",
    desc: "Every record access is timestamped, logged, and traceable for compliance.",
  },
  {
    icon: Users,
    title: "Multi-role Teams",
    desc: "Clinicians, labs, pharmacists, and admins operating under one verified org.",
  },
];

const TRUST = ["SOC 2 Type II", "ISO 27001", "NDPA Compliant", "Patient-first"];

type LoginStep = "credentials" | "otp";

export function ProviderLoginPage() {
  const navigate = useNavigate();
  const {
    signIn,
    signInAsRole,
    verifyLoginCodeApi,
    resendVerifyLoginCodeApi,
    setUser,
  } = useAuth();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [showRoleDrop, setShowRoleDrop] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("clinician");
  const roleDropRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  useEffect(() => setIsCodeValid(code.length === 6), [code]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropRef.current &&
        !roleDropRef.current.contains(event.target as Node)
      ) {
        setShowRoleDrop(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDemoLogin = () => {
    signInAsRole(selectedRole);
    navigate("/provider/overview");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn(email.trim().toLowerCase(), password, channel);
      const payload = res?.data || res;

      if (!payload?.requiresOtp || !payload?.challengeToken) {
        throw new Error("Login verification could not be started.");
      }

      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || "");
      setMaskedEmail(payload.maskedEmail || "");
      setStep("otp");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password. Try again.";
      setError(message);
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

      const uiUser = {
        id: account?._id || account?.id,
        sub: account?._id || account?.id,
        accountType: account?.accountType,
        role: account?.role,
        // BUGFIX: was missing entirely — the sidebar's hasAccess
        // check (ProviderLayout.tsx) reads user.roles (plural
        // array), not user.role. Without this, every role-gated
        // nav item (Referrals, Insurance, Reports, Team,
        // Settings) showed locked for every provider immediately
        // after login, regardless of their actual role, until
        // something else (a refresh hitting getAuthFromToken's
        // token-decode path) happened to repopulate it. Matches
        // the pattern AuthProvider.tsx already uses elsewhere.
        roles: account?.role ? [account.role] : [],
        isVerified: account?.isVerified,
        orgId: account?._id || account?.id,
        orgName: profile?.organizationName,
        profile,
      };

      // Org owner accounts are accountType "organization" outright.
      // Invited staff (doctor, nurse, lab tech, ...) keep accountType
      // "user" — identical to a patient account — and are told apart
      // only by role. Same rule as RequireRole's "organization" gate;
      // see PATIENT_SIDE_ROLES there for why it's shared rather than
      // redefined here.
      const isProviderAccount =
        account?.accountType === "organization" ||
        (!!account?.role && !PATIENT_SIDE_ROLES.includes(account.role as any));

      if (!isProviderAccount) {
        Cookies.remove("accessToken");
        localStorage.removeItem("ui_user");
        setUser?.(null);
        setError(
          "This login is for provider accounts. Please use the patient portal to sign in.",
        );
        setStep("credentials");
        return;
      }

      localStorage.setItem("ui_user", JSON.stringify(uiUser));
      setUser?.(uiUser);

      navigate("/provider/overview");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired login code.";
      setError(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!challengeToken) {
      setError("Login session expired. Please start again.");
      setStep("credentials");
      return;
    }

    if (resending) return; // a request is already in flight, ignore repeat clicks

    try {
      setResending(true);
      setCode("");
      setError("");

      const res = await resendVerifyLoginCodeApi(
        challengeToken,
        email,
        channel,
      );
      const payload = res?.data || res;

      if (!payload?.challengeToken) {
        throw new Error("Failed to resend OTP");
      }

      setChallengeToken(payload.challengeToken);
      setMaskedPhone(payload.maskedPhone || maskedPhone);
      setMaskedEmail(payload.maskedEmail || maskedEmail);
      setTimeLeft(120);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to resend OTP";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setCode("");
    setChallengeToken("");
    setMaskedPhone("");
    setMaskedEmail("");
    setError("");
  };

  return (
  <div
    className="min-h-screen flex bg-[#f8fafc] text-slate-900"
    style={{
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    }}
  >
    {/* ================================================================
        LEFT — ENTERPRISE BRAND PANEL
    ================================================================= */}
    <aside className="hidden lg:flex lg:w-[43%] xl:w-[40%] relative overflow-hidden bg-[#071a33] text-white">
      {/* Subtle architectural background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(53,92,160,0.22) 0%, rgba(53,92,160,0) 68%)",
          }}
        />

        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.08) 0%, rgba(20,184,166,0) 65%)",
          }}
        />

        <div className="absolute inset-0 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 xl:px-14 py-10">
        {/* Brand */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3 group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
              <img
                src={welliIcon}
                alt="WelliRecord"
                className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-xl font-extrabold tracking-[-0.04em] text-white">
                  Welli
                </span>
                <span className="text-xl font-normal tracking-[-0.04em] text-slate-300">
                  Record
                </span>
                <sup className="ml-0.5 text-[8px] text-slate-400">
                  TM
                </sup>
              </div>

              <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                One patient. One trusted record.
              </span>
            </div>
          </Link>

          {/* Portal badge */}
          <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Provider Portal
            </span>
          </div>

          {/* Main headline */}
          <div className="mt-7 max-w-[480px]">
            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white xl:text-[42px]">
              Healthcare access,
              <br />
              <span className="text-slate-400">built around trust.</span>
            </h2>

            <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-slate-400">
              Connect your organisation to patient-owned records through
              consent-aware access, verified identities, and complete
              auditability.
            </p>
          </div>

          {/* Enterprise capabilities */}
          <div className="mt-10 space-y-5">
            {BRAND_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex items-start gap-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] transition-colors group-hover:border-white/20 group-hover:bg-white/[0.08]">
                  <Icon
                    size={17}
                    strokeWidth={1.7}
                    className="text-slate-300"
                  />
                </div>

                <div className="pt-0.5">
                  <div className="text-sm font-semibold text-slate-100">
                    {title}
                  </div>

                  <p className="mt-1 max-w-[390px] text-xs leading-5 text-slate-500">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust footer */}
        <div>
          <div className="mb-5 h-px w-full bg-white/10" />

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {TRUST.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
              >
                <CheckCircle
                  size={12}
                  strokeWidth={1.8}
                  className="text-slate-400"
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>

    {/* ================================================================
        RIGHT — AUTHENTICATION AREA
    ================================================================= */}
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#f8fafc] px-5 py-8 sm:px-8 lg:px-12">
      <div className="w-full max-w-[470px]">
        {/* Top navigation */}
        <button
          onClick={() => {
            if (step === "otp") {
              handleBackToCredentials();
              return;
            }

            navigate("/auth");
          }}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-0.5"
          />

          {step === "otp"
            ? "Back to sign in"
            : "Back to portal selection"}
        </button>

        {/* Authentication card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:p-9">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#1e3a8a]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Secure provider access
              </span>
            </div>

            <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-slate-900">
              {step === "otp"
                ? "Verify your sign in"
                : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {step === "otp"
                ? "Confirm your identity with the verification code we sent."
                : "Sign in to securely access your organisation's provider workspace."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">
                !
              </div>

              <p className="text-xs font-medium leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ============================================================
              OTP
          ========================================================== */}
          {step === "otp" ? (
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
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173b82] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#12316c] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify and continue
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ============================================================
               CREDENTIALS
            ========================================================== */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Organisation email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organisation.ng"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#4266a8] focus:bg-white focus:ring-4 focus:ring-[#1e3a8a]/[0.07]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#23458e] transition-colors hover:text-[#142e63] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock
                    size={17}
                    strokeWidth={1.8}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#4266a8] focus:bg-white focus:ring-4 focus:ring-[#1e3a8a]/[0.07]"
                  />
                </div>
              </div>

              {/* Verification method */}
              <div>
                <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Verification method
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* SMS */}
                  <label
                    className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                      channel === "sms"
                        ? "border-[#31589d] bg-[#f4f7fc] ring-1 ring-[#31589d]/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="otp-channel"
                      checked={channel === "sms"}
                      onChange={() => setChannel("sms")}
                      className="sr-only"
                    />

                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        channel === "sms"
                          ? "border-[#1e3a8a]"
                          : "border-slate-300"
                      }`}
                    >
                      {channel === "sms" && (
                        <div className="h-2 w-2 rounded-full bg-[#1e3a8a]" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Text message
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        SMS verification
                      </div>
                    </div>
                  </label>

                  {/* Email */}
                  <label
                    className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                      channel === "email"
                        ? "border-[#31589d] bg-[#f4f7fc] ring-1 ring-[#31589d]/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="otp-channel"
                      checked={channel === "email"}
                      onChange={() => setChannel("email")}
                      className="sr-only"
                    />

                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        channel === "email"
                          ? "border-[#1e3a8a]"
                          : "border-slate-300"
                      }`}
                    >
                      {channel === "email" && (
                        <div className="h-2 w-2 rounded-full bg-[#1e3a8a]" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Email
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        Email verification
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173b82] px-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#12316c] hover:shadow-lg hover:shadow-[#173b82]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Continue to provider portal
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Registration */}
          {step === "credentials" && (
            <>
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  New organisation?
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <Link
                to="/auth/provider/signup"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Register your organisation
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Security footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <Shield
            size={13}
            strokeWidth={1.8}
            className="text-slate-400"
          />

          <p className="text-[10px] font-medium leading-4 text-slate-400">
            Secure access · Consent-aware · Fully auditable
          </p>
        </div>

        {/* ================================================================
            DEVELOPMENT MODE
        ============================================================= */}
        {/* {import.meta.env.DEV && isLocalhost && (
          <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100">
                  <Activity
                    size={13}
                    className="text-amber-600"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                    Development mode
                  </p>

                  <p className="text-[10px] text-amber-600/70">
                    Authentication bypass enabled
                  </p>
                </div>
              </div>
            </div>

            <div
              className="relative"
              ref={roleDropRef}
            >
              <button
                type="button"
                onClick={() => setShowRoleDrop(!showRoleDrop)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-amber-200 bg-white px-3.5 text-left transition-colors hover:bg-amber-50"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        ROLE_METADATA[selectedRole]?.color ||
                        "#38bdf8",
                    }}
                  />

                  <span className="text-xs font-bold text-slate-700">
                    {ROLE_METADATA[selectedRole]?.label ||
                      selectedRole}
                  </span>
                </div>

                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${
                    showRoleDrop ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showRoleDrop && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                  {(
                    [
                      "provider_admin",
                      "clinician",
                      "lab_tech",
                      "pharmacist",
                      "insurer",
                      "telehealth",
                    ] as UserRole[]
                  ).map((role) => {
                    const meta = ROLE_METADATA[role];

                    if (!meta) return null;

                    const selected = selectedRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role);
                          setShowRoleDrop(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                          selected
                            ? "bg-slate-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: meta.color,
                            }}
                          />

                          <div>
                            <div className="text-xs font-bold text-slate-700">
                              {meta.label}
                            </div>

                            <div className="mt-0.5 text-[9px] text-slate-400">
                              {meta.description?.split(".")[0]}
                            </div>
                          </div>
                        </div>

                        {selected && (
                          <Check
                            size={14}
                            className="text-[#1e3a8a]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#071a33] text-xs font-bold text-white transition-all hover:bg-[#0b2547]"
            >
              Preview as{" "}
              {ROLE_METADATA[selectedRole]?.label ||
                selectedRole}
              <ArrowRight size={13} />
            </button>
          </div>
        )} */}
      </div>
    </main>
  </div>
);
}
