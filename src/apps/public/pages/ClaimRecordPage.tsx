import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getClaimInfo, claimRecord } from "@/shared/api/localCustomersApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import {
  Shield, CheckCircle2, Building2, User, ArrowRight,
  Sparkles, Lock, RefreshCw, AlertCircle, FileText, Activity
} from "lucide-react";

export function ClaimRecordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<{
    customer: { id: string; fullName: string; firstName?: string; phone?: string; email?: string };
    organization: { name: string; type: string };
    status: string;
    isClaimed: boolean;
  } | null>(null);

  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getClaimInfo(token)
      .then((res) => {
        setClaimInfo(res);
        if (res.isClaimed) {
          setClaimSuccess(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Invalid or expired invitation link.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleClaim = async () => {
    if (!token) return;
    setClaiming(true);
    setError(null);
    try {
      await claimRecord(token);
      setClaimSuccess(true);
      setTimeout(() => {
        navigate("/patient/overview");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to claim record. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071B3F] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <WelliRecordLogo className="h-10 text-white" />
        </div>

        {loading ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
            <RefreshCw size={28} className="animate-spin mx-auto text-emerald-400" />
            <p className="text-sm text-slate-300">Retrieving your health record invite…</p>
          </div>
        ) : error && !claimInfo ? (
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle size={36} className="mx-auto text-rose-400" />
            <h2 className="text-xl font-bold">Invitation Not Found</h2>
            <p className="text-sm text-slate-300">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition"
            >
              Go to Home Page
            </button>
          </div>
        ) : claimSuccess ? (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-5 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Record Successfully Claimed!</h2>
              <p className="text-sm text-slate-300 mt-2">
                Your medical history from <span className="font-semibold text-emerald-300">{claimInfo?.organization.name}</span> is now linked to your WelliRecord account.
              </p>
            </div>
            <p className="text-xs text-slate-400">Redirecting to your health dashboard…</p>
          </div>
        ) : claimInfo ? (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles size={14} />
              Complimentary Health Vault Access
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Claim Your Health Record
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                <strong className="text-emerald-300">{claimInfo.organization.name}</strong> has prepared your digital health records on WelliRecord.
              </p>
            </div>

            {/* Patient Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Patient Name</p>
                <p className="text-base font-bold text-white truncate">{claimInfo.customer.fullName}</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Included Benefits</p>
              {[
                "Prescriptions & Medication History",
                "Laboratory & Vision Test Results",
                "Encounters & Doctor Visit Records",
                "Lifetime Lifelong Health Vault",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                {error}
              </p>
            )}

            {/* Action Buttons */}
            {user ? (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                {claiming ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Claim Record Now</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/auth/patient/signup?claimToken=${token}`)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <span>Activate Free Account & Claim</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate(`/auth/login?claimToken=${token}`)}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
                >
                  Already have an account? Sign in to link
                </button>
              </div>
            )}

            <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Shield size={12} className="text-emerald-400" />
              <span>NDPA Compliant • Encrypted & Patient Owned</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ClaimRecordPage;
