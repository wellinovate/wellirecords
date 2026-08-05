import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";
import { apiUrl } from "@/shared/api/authApi";

type Role = "patient" | "provider";

interface LocationState {
  email?: string;
}

const copy: Record<
  Role,
  {
    heading: string;
    subheading: string;
    body: string;
    afterVerifyBody: string;
    loginPath: string;
  }
> = {
  patient: {
    heading: "🎉 Welcome to WelliRecord™!",
    subheading: "Your account has been created successfully.",
    body: "The next step is to verify your email address to activate your account and protect your health information.",
    afterVerifyBody:
      "Once verified, you'll be able to securely access your health records, complete your medical profile, and start managing your healthcare with confidence.",
    loginPath: "/auth/login",
  },
  provider: {
    heading: "🎉 Welcome to the WelliRecord™ Provider Network!",
    subheading: "Your provider account has been created successfully.",
    body: "To activate your account, please verify your email address.",
    afterVerifyBody:
      "After verification, you'll be able to complete your organization profile, invite your clinical team, and begin delivering connected, patient-centered care through WelliRecord™.",
    loginPath: "/auth/provider/login",
  },
};

function getWebmailUrl(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  if (domain.includes("gmail.com")) return "https://mail.google.com/mail/u/0/#inbox";
  if (
    domain.includes("outlook.com") ||
    domain.includes("hotmail.com") ||
    domain.includes("live.com")
  )
    return "https://outlook.live.com/mail/0/inbox";
  if (domain.includes("yahoo.com")) return "https://mail.yahoo.com";
  if (domain.includes("icloud.com") || domain.includes("me.com"))
    return "https://www.icloud.com/mail";

  return null;
}

export function SignupSuccessScreen({ role }: { role: Role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email ?? "";

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const text = copy[role];

  const handleOpenEmail = () => {
    const webmailUrl = email ? getWebmailUrl(email) : null;
    if (webmailUrl) {
      window.open(webmailUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMessage("");
    setResendError("");
    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Could not resend verification email.");
      }
      setResendMessage(json.message || "Verification email resent successfully.");
    } catch (err: any) {
      setResendError(err?.message || "Could not resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <CheckCircle2 size={48} className="text-teal-500 mx-auto mb-4" />

        <h1 className="text-xl font-bold text-gray-900 mb-1">{text.heading}</h1>
        <p className="text-sm text-gray-500 mb-6">{text.subheading}</p>

        <p className="text-sm text-gray-600 mb-4">{text.body}</p>

        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left mb-2">
          <Mail size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            We've sent a verification email to{" "}
            <span className="font-semibold">{email || "your email address"}</span>.
          </p>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Please check your inbox and click the verification link to continue. If you don't see
          the email, check your Spam, Junk, or Promotions folder.
        </p>

        <p className="text-sm text-gray-600 mb-6">{text.afterVerifyBody}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleOpenEmail}
            className="rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold py-3 hover:opacity-90 transition"
          >
            Open My Email
          </button>
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold py-3 hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {resending && <Loader2 size={14} className="animate-spin" />}
            Resend Verification Email
          </button>
        </div>

        {resendMessage && (
          <p className="text-xs text-green-600 mb-2">{resendMessage}</p>
        )}
        {resendError && <p className="text-xs text-red-600 mb-2">{resendError}</p>}

        <p className="text-xs text-gray-400 mb-4">
          💡 Tip: Verification emails usually arrive within a minute. If you haven't received
          yours after a few minutes, click Resend Verification Email or contact our support team
          for assistance.
        </p>

        <button
          onClick={() => navigate(text.loginPath)}
          className="text-sm text-teal-600 font-medium hover:underline"
        >
          Continue to login
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm font-bold text-[#0B1F3A]">WelliRecord™</p>
          <p className="text-xs text-gray-400">
            One patient. One trusted record. Accessible when it matters.
          </p>
        </div>
      </div>
    </div>
  );
}
