import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail, ShieldCheck } from "lucide-react";
import { apiUrl } from "@/shared/api/authApi";

type VerifyState = "idle" | "verifying" | "success" | "error" | "missing_token";

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [state, setState] = useState<VerifyState>(token ? "idle" : "missing_token");
    const [message, setMessage] = useState("");

    const [resendEmail, setResendEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    const handleVerify = async () => {
        if (!token) {
            setState("missing_token");
            return;
        }

        try {
            setState("verifying");
            const res = await fetch(`${apiUrl}/api/v1/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "This verification link is invalid or has expired.");
            }

            setMessage(json.message || "Your email has been verified.");
            setState("success");
        } catch (err: any) {
            setMessage(err?.message || "This verification link is invalid or has expired.");
            setState("error");
        }
    };

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail.trim()) return;

        try {
            setResending(true);
            setResendMessage("");

            const res = await fetch(`${apiUrl}/api/v1/auth/resend-verification-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
            });
            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Unable to resend verification email.");
            }

            setResendMessage(json.message || "A new verification email has been sent.");
        } catch (err: any) {
            setResendMessage(err?.message || "Unable to resend verification email. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F3F4F5] px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
                {state === "idle" && (
                    <>
                        <ShieldCheck size={48} className="mx-auto mb-4 text-[#071B3F]" />
                        <h1 className="text-xl font-bold text-[#062B67] mb-2">Verify your email address</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            Click the button below to confirm your email and activate your account.
                        </p>
                        <button
                            onClick={handleVerify}
                            className="w-full h-11 rounded-md bg-[#071B3F] text-white text-sm font-semibold hover:bg-[#0c2d66] transition"
                        >
                            Verify Email Address
                        </button>
                    </>
                )}

                {state === "verifying" && (
                    <>
                        <Loader2 size={40} className="mx-auto mb-4 animate-spin text-[#071B3F]" />
                        <h1 className="text-xl font-bold text-[#062B67] mb-2">Verifying your email…</h1>
                        <p className="text-sm text-gray-500">This will only take a moment.</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <CheckCircle size={40} className="mx-auto mb-4 text-emerald-500" />
                        <h1 className="text-xl font-bold text-[#062B67] mb-2">Email verified</h1>
                        <p className="text-sm text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="w-full h-11 rounded-md bg-[#071B3F] text-white text-sm font-semibold hover:bg-[#0c2d66] transition"
                        >
                            Continue to login
                        </button>
                    </>
                )}

                {(state === "error" || state === "missing_token") && (
                    <>
                        <XCircle size={40} className="mx-auto mb-4 text-red-500" />
                        <h1 className="text-xl font-bold text-[#062B67] mb-2">
                            {state === "missing_token" ? "Missing verification link" : "Verification failed"}
                        </h1>
                        <p className="text-sm text-gray-600 mb-6">
                            {state === "missing_token"
                                ? "This page needs a verification link from your email — please use the link we sent you, or request a new one below."
                                : message}
                        </p>

                        <form onSubmit={handleResend} className="text-left space-y-3">
                            <label className="block text-xs font-semibold text-gray-500">
                                Resend verification email
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full h-11 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:bg-white focus:border-gray-300"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={resending}
                                className="w-full h-11 rounded-md bg-[#071B3F] text-white text-sm font-semibold hover:bg-[#0c2d66] transition disabled:opacity-60"
                            >
                                {resending ? "Sending…" : "Resend verification email"}
                            </button>
                        </form>

                        {resendMessage && (
                            <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">
                                <Mail size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                    {resendMessage} Please check your inbox (and your Spam or Promotions
                                    folder) for the new verification link.
                                </p>
                            </div>
                        )}

                        <Link
                            to="/auth/login"
                            className="mt-6 inline-block text-xs font-semibold text-[#071B3F] hover:underline"
                        >
                            Back to login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
