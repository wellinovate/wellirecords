import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { teamApi, InviteInfo } from "@/shared/api/teamApi";
import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import {
  CheckCircle2, AlertCircle, RefreshCw, Lock, Sparkles, Phone,
} from "lucide-react";

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    teamApi.getInviteByToken(token)
      .then(setInvite)
      .catch((err) => {
        setError(err?.response?.data?.message || "Invalid or expired invite link.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token || password.length < 8 || phone.trim().length < 10) return;
    setAccepting(true);
    setError(null);
    try {
      await teamApi.acceptInvite(token, password, phone.trim());
      setSuccess(true);
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't accept the invite. Try again.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071B3F] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-6">
          <WelliRecordLogo className="h-10 text-white" />
        </div>

        {loading ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
            <RefreshCw size={28} className="animate-spin mx-auto text-sky-400" />
            <p className="text-sm text-slate-300">Checking your invite…</p>
          </div>
        ) : error && !invite ? (
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle size={36} className="mx-auto text-rose-400" />
            <h2 className="text-xl font-bold">Invite Not Found</h2>
            <p className="text-sm text-slate-300">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition"
            >
              Go to Home Page
            </button>
          </div>
        ) : success ? (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">You're in!</h2>
              <p className="text-sm text-slate-300 mt-2">Redirecting you to log in…</p>
            </div>
          </div>
        ) : invite ? (
          <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
              <Sparkles size={14} />
              Team Invitation
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome, {invite.fullName.split(" ")[0]}
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Set a password to accept your invitation as a <strong className="text-sky-300">{invite.membershipRole.replace("_", " ")}</strong>.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm font-semibold text-white">{invite.email}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-400">Create a password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-400">Phone number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Logging in sends a code to this number to verify it's you.</p>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              onClick={handleAccept}
              disabled={password.length < 8 || phone.trim().length < 10 || accepting}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition disabled:opacity-40"
            >
              {accepting ? "Accepting…" : "Accept Invitation"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
