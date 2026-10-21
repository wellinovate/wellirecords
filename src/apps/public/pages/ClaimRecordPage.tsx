import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, RefreshCw, Shield } from "lucide-react";
import {
  ClaimInfo,
  getLinkInfo,
  giveLinkConsent,
  sendLinkCode,
  verifyLinkCode,
} from "@/shared/api/recordLinksApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";

// Wording version must match CONSENT_VERSION on the server (draft-1). Draft: no legal review yet.
const SCOPE_TEXT: Record<string, { title: string; body: string; fixed?: boolean }> = {
  demographics: {
    title: "Basic details",
    body: "Your name, date of birth, sex and contact details as the hospital holds them.",
    fixed: true,
  },
  allergies: { title: "Allergies", body: "Allergies the hospital has recorded for you." },
  medications: { title: "Medications", body: "Medications the hospital has recorded for you." },
};

const errorText = (err: any, fallback: string) => err?.response?.data?.message || fallback;

export function ClaimRecordPage() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [info, setInfo] = useState<ClaimInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [scopes, setScopes] = useState<string[]>(["demographics"]);
  const [agreed, setAgreed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getLinkInfo(token);
      setInfo(res);
      setScopes((prev) => (prev.length > 1 ? prev : res.scopes));
    } catch {
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>, fallback: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setError(errorText(err, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async () => {
    await run(async () => {
      const r = await sendLinkCode(token);
      setSentTo(r.sentTo);
    }, "We could not send the code.");
  };

  const verify = async () => {
    const ok = await run(() => verifyLinkCode(token, code.trim()), "That code did not work.");
    if (ok) {
      setCode("");
      await load();
    } else {
      // A failed identity check moves the link to the hospital. Reload to show the right screen.
      await load();
    }
  };

  const consent = async () => {
    if (!info) return;
    const ok = await run(() => giveLinkConsent(token, info.consentVersion, scopes), "We could not record your consent.");
    if (ok) await load();
  };

  const toggle = (s: string) =>
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const card = "bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5";
  const primary =
    "w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center gap-2";
  const secondary =
    "w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700";

  const errorBox = error && (
    <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
      {error}
    </p>
  );

  const status = info?.status;
  let body: React.ReactNode = null;

  if (loading) {
    body = (
      <div className={`${card} text-center`}>
        <RefreshCw size={28} className="animate-spin mx-auto text-emerald-400" />
        <p className="text-sm text-slate-300">Checking your link…</p>
      </div>
    );
  } else if (missing || !info) {
    body = (
      <div className={`${card} text-center`}>
        <AlertCircle size={36} className="mx-auto text-rose-400" />
        <h2 className="text-xl font-bold">This link is not valid</h2>
        <p className="text-sm text-slate-300">
          It may have expired, or it was issued before our newer checks. Ask the hospital for a new link.
        </p>
        <button className={secondary} onClick={() => navigate("/")}>Go to home page</button>
      </div>
    );
  } else if (status === "linked") {
    body = (
      <div className={`${card} text-center`}>
        <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
        <h2 className="text-2xl font-bold">Your record is linked</h2>
        <p className="text-sm text-slate-300">
          {info.organization} has linked your record. Items added from the hospital are marked as imported and have not been confirmed by a clinician in WelliRecord. Review them in your health vault.
        </p>
        <button className={primary} onClick={() => navigate("/patient/overview")}>
          Go to my dashboard <ArrowRight size={16} />
        </button>
      </div>
    );
  } else if (status === "expired" || status === "cancelled") {
    body = (
      <div className={`${card} text-center`}>
        <AlertCircle size={36} className="mx-auto text-amber-400" />
        <h2 className="text-xl font-bold">{status === "expired" ? "This link has expired" : "This link was cancelled"}</h2>
        <p className="text-sm text-slate-300">Ask {info.organization} for a new link.</p>
      </div>
    );
  } else if (status === "action_required") {
    body = (
      <div className={`${card} text-center`}>
        <AlertCircle size={36} className="mx-auto text-amber-400" />
        <h2 className="text-xl font-bold">{info.organization} needs to check something</h2>
        <p className="text-sm text-slate-300">
          We could not finish linking this record. Nothing was shared. Contact {info.organization} and ask them to review your link.
        </p>
      </div>
    );
  } else if (status === "under_hospital_review" || status === "linking_in_progress") {
    body = (
      <div className={`${card} text-center`}>
        <Clock size={36} className="mx-auto text-emerald-400" />
        <h2 className="text-xl font-bold">Waiting for {info.organization}</h2>
        <p className="text-sm text-slate-300">
          Your consent is recorded. The hospital reviews and releases your record. We will notify you when it is done. You can close this page.
        </p>
      </div>
    );
  } else if (!user) {
    body = (
      <div className={card}>
        <div>
          <h1 className="text-2xl font-extrabold">Link your hospital record</h1>
          <p className="text-sm text-slate-300 mt-2">
            {info.firstName ? `${info.firstName}, ` : ""}
            <strong className="text-emerald-300">{info.organization}</strong> started linking your record to WelliRecord. Sign in or create an account to continue. You will confirm your identity and choose what to link.
          </p>
        </div>
        <button className={primary} onClick={() => navigate(`/auth/patient/signup?claimToken=${token}`)}>
          Create account <ArrowRight size={16} />
        </button>
        <button className={secondary} onClick={() => navigate(`/auth/login?claimToken=${token}`)}>
          I already have an account
        </button>
        <p className="text-[11px] text-slate-400 text-center">Creating an account does not give access to any record.</p>
      </div>
    );
  } else if (status === "awaiting_patient_verification") {
    body = (
      <div className={card}>
        <div>
          <h1 className="text-2xl font-extrabold">Confirm it is you</h1>
          <p className="text-sm text-slate-300 mt-2">
            We send a 6-digit code by SMS to the phone number {info.organization} has on file for you. We also check your details against the hospital record.
          </p>
        </div>
        {!sentTo ? (
          <button className={primary} disabled={busy} onClick={sendCode}>
            {busy ? <RefreshCw size={18} className="animate-spin" /> : "Send code"}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">Code sent to {sentTo}. It expires in 10 minutes.</p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              aria-label="6-digit code"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-center tracking-[0.4em] text-lg"
            />
            <button className={primary} disabled={busy || code.length !== 6} onClick={verify}>
              {busy ? <RefreshCw size={18} className="animate-spin" /> : "Verify"}
            </button>
            <button className={secondary} disabled={busy} onClick={sendCode}>Send a new code</button>
          </div>
        )}
        {errorBox}
        <p className="text-[11px] text-slate-400">
          If you no longer have that phone number, contact {info.organization} to update it.
        </p>
      </div>
    );
  } else if (status === "awaiting_consent") {
    body = (
      <div className={card}>
        <div>
          <h1 className="text-2xl font-extrabold">Choose what to link</h1>
          <p className="text-sm text-slate-300 mt-2">
            {info.organization} will copy the items you choose into your WelliRecord account after it reviews and releases them. Nothing is copied before that.
          </p>
        </div>
        <ul className="space-y-2">
          {info.scopes.map((s) => {
            const t = SCOPE_TEXT[s];
            if (!t) return null;
            return (
              <li key={s}>
                <label className="flex gap-3 items-start bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={scopes.includes(s)}
                    disabled={t.fixed}
                    onChange={() => toggle(s)}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{t.title}</span>
                    <span className="block text-xs text-slate-300">{t.body}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="text-xs text-slate-300 space-y-1.5">
          <p>Imported items keep their source ({info.organization}) and are marked as not yet confirmed by a clinician.</p>
          <p>You can withdraw before the hospital releases the record. Files and scans are not included.</p>
          <p>{info.organization} will know your account is linked to its record.</p>
        </div>
        <label className="flex gap-3 items-start text-xs text-slate-200">
          <input type="checkbox" className="mt-0.5" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I agree to {info.organization} sharing the items selected above into my WelliRecord account.</span>
        </label>
        {errorBox}
        <button className={primary} disabled={busy || !agreed || scopes.length === 0} onClick={consent}>
          {busy ? <RefreshCw size={18} className="animate-spin" /> : "Give consent"}
        </button>
      </div>
    );
  } else {
    body = (
      <div className={`${card} text-center`}>
        <p className="text-sm text-slate-300">This link is not ready yet. Check with {info.organization}.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071B3F] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-2">
          <WelliRecordLogo className="h-10 text-white" />
        </div>
        {body}
        <div className="text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Shield size={12} className="text-emerald-400" />
          <span>Your record stays yours. Every step is logged.</span>
        </div>
      </div>
    </div>
  );
}

export default ClaimRecordPage;
