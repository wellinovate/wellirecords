import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Lock, ShieldCheck } from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/shared/api/authApi";

type ResetState = "form" | "success" | "error" | "missing_token";

function PasswordField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="block text-xs font-semibold text-gray-500">{label}</label>
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="text-xs font-semibold text-[#071B3F] cursor-pointer"
          disabled={disabled}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder="••••••••"
          minLength={8}
          required
          className="w-full h-11 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:bg-white focus:border-gray-300 disabled:opacity-60"
        />
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [state, setState] = useState<ResetState>(token ? "form" : "missing_token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isFormValid) return;

    try {
      setLoading(true);
      setError("");

      await axios.post(`${apiUrl}/api/v1/auth/reset-password`, {
        token,
        newPassword: password,
      });

      setState("success");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "This reset link is invalid or has expired.",
      );
      setState("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F5] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
        {state === "form" && (
          <>
            <ShieldCheck size={48} className="mx-auto mb-4 text-[#071B3F]" />
            <h1 className="text-xl font-bold text-[#062B67] mb-2">Choose a new password</h1>
            <p className="text-sm text-gray-600 mb-6">
              Your new password must be at least 8 characters.
            </p>

            <form onSubmit={handleSubmit} className="text-left space-y-4">
              <PasswordField
                label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords don't match.</p>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full h-11 rounded-md bg-[#071B3F] text-white text-sm font-semibold hover:bg-[#0c2d66] transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle size={40} className="mx-auto mb-4 text-emerald-500" />
            <h1 className="text-xl font-bold text-[#062B67] mb-2">Password reset</h1>
            <p className="text-sm text-gray-600 mb-6">
              Your password has been changed. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full h-11 rounded-md bg-[#071B3F] text-white text-sm font-semibold hover:bg-[#0c2d66] transition cursor-pointer"
            >
              Continue to login
            </button>
          </>
        )}

        {(state === "error" || state === "missing_token") && (
          <>
            <XCircle size={40} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-bold text-[#062B67] mb-2">
              {state === "missing_token" ? "Missing reset link" : "Reset failed"}
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              {state === "missing_token"
                ? "This page needs a reset link from your email."
                : error}
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-xs font-semibold text-[#071B3F] hover:underline"
            >
              Request a new reset link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
