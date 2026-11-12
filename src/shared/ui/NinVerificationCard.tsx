import React, { useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { ninApi, type NinStatus } from "@/shared/api/ninApi";

type Props = { onStatus?: (verified: boolean) => void };

// Confirms the patient's identity with their NIN. The server compares the name and date of birth on the NIN record
// with this profile. The NIN is not saved, and nothing from the NIN record is shown or stored.
export function NinVerificationCard({ onStatus }: Props) {
  const [status, setStatus] = useState<NinStatus | null>(null);
  const [loadError, setLoadError] = useState("");
  const [nin, setNin] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    ninApi
      .status()
      .then((s) => {
        if (!live) return;
        setStatus(s);
        onStatus?.(s.verified);
      })
      .catch((e) => live && setLoadError(e.message));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || nin.length !== 11 || !agreed) return;
    setBusy(true);
    setError("");
    try {
      const r = await ninApi.verify(nin);
      setNin("");
      setStatus({ verified: true, verifiedAt: r.verifiedAt, method: "nin_2am", available: true });
      onStatus?.(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-patient p-6 border-2 border-emerald-100">
      <h2 className="font-bold text-base mb-2 text-gray-900 flex items-center gap-2">
        <ShieldCheck size={20} className="text-emerald-600" /> Identity check with your NIN
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        Confirm that the name and date of birth on your WelliRecord profile match your National Identification Number
        (NIN). Your NIN is used for this check only and is not saved.
      </p>

      {loadError ? (
        <p className="text-sm text-red-600" role="alert">{loadError}</p>
      ) : !status ? (
        <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</p>
      ) : status.verified ? (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Check size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-800">Identity confirmed</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Your name and date of birth matched your NIN record
              {status.verifiedAt ? ` on ${new Date(status.verifiedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
            </p>
          </div>
        </div>
      ) : !status.available ? (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-4">
          The NIN check is not available yet. Please check back later.
        </p>
      ) : (
        <form onSubmit={submit} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
          <label htmlFor="nin" className="block text-sm font-semibold mb-2 text-gray-700">Your 11-digit NIN</label>
          <input
            id="nin"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="11 digits"
            className="input input-light w-full font-mono tracking-widest text-lg"
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
            disabled={busy}
          />
          <label className="mt-4 flex items-start gap-3 text-xs text-gray-600">
            <input type="checkbox" className="mt-0.5" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={busy} />
            <span>
              I agree that WelliRecord may check my NIN through its identity verification partner, 2AM Connect, and
              compare my name and date of birth with my profile. My NIN is not saved.
            </span>
          </label>
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={busy || nin.length !== 11 || !agreed} className="btn btn-patient mt-4 whitespace-nowrap disabled:opacity-50">
            {busy ? "Checking…" : "Check my NIN"}
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Your profile needs your full name and date of birth. If the check says they do not match, correct them in
            your profile first.
          </p>
        </form>
      )}
    </div>
  );
}
