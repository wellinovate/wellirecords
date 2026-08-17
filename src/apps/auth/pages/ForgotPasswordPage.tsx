import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/shared/api/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");

      await axios.post(`${apiUrl}/api/v1/auth/forgot-password`, {
        email: email.trim().toLowerCase(),
      });

      // The backend always returns the same generic response whether or
      // not the email is registered, so this branch covers both cases.
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F5] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
        {!submitted ? (
          <>
            <ShieldCheck size={48} className="mx-auto mb-4 text-[#071B3F]" />
            <h1 className="text-xl font-bold text-[#062B67] mb-2">Reset your password</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter the email on your account and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit} className="text-left space-y-3">
              <label className="block text-xs font-semibold text-gray-500">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full h-11 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:bg-white focus:border-gray-300"
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-11 rounded-md bg-[#071B3F] text-white text-sm font-semibold hover:bg-[#0c2d66] transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <Link
              to="/auth/login"
              className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-[#071B3F] hover:underline"
            >
              <ArrowLeft size={12} /> Back to login
            </Link>
          </>
        ) : (
          <>
            <Mail size={40} className="mx-auto mb-4 text-emerald-500" />
            <h1 className="text-xl font-bold text-[#062B67] mb-2">Check your email</h1>
            <p className="text-sm text-gray-600 mb-6">
              If an account exists for <strong>{email}</strong>, we've sent a link to
              reset your password. The link expires in 30 minutes.
            </p>
            <Link
              to="/auth/login"
              className="inline-block text-xs font-semibold text-[#071B3F] hover:underline"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
