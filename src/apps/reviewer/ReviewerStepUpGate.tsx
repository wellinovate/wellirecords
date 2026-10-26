import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Copy, Download, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { MfaSetup, onStepUpLost, reviewerApi, ReviewerApiError, stepUp } from "@/shared/api/reviewerApi";
import { digitsOnly, groupSecret } from "@/shared/api/stepUp";

/**
 * Wraps the reviewer tools. Shows its children only when the reviewer has proved the second step in this tab:
 *  - never set up   -> set up an authenticator app, confirm one code, save recovery codes
 *  - set up         -> enter the six-digit code (or a recovery code)
 * Secrets and recovery codes are held in component state only. They are never written to storage or logged.
 */

type View = "loading" | "error" | "intro" | "scan" | "recovery" | "verify" | "ready";

const card = "w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl";
const input = "w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2.5 text-center text-lg tracking-widest text-slate-100 outline-none focus:border-sky-400";
const primary = "flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50";
const quiet = "text-sm text-sky-300 underline underline-offset-2 hover:text-sky-200";

const messageOf = (e: unknown) => (e instanceof ReviewerApiError ? e.message : "Something went wrong. Try again.");

export function ReviewerStepUpGate({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const viewRef = useRef<View>("loading");
  viewRef.current = view;

  const check = useCallback(async () => {
    setError(null);
    setView("loading");
    try {
      const s = await reviewerApi.mfaStatus();
      if (!s.enabled) setView("intro");
      else setView(stepUp.get() ? "ready" : "verify");
    } catch (e) {
      setError(messageOf(e));
      setView("error");
    }
  }, []);

  useEffect(() => { void check(); }, [check]);

  // A request elsewhere on the page said the second step is missing: ask again instead of showing a raw error.
  useEffect(() => onStepUpLost((c) => {
    if (viewRef.current === "recovery" || viewRef.current === "scan") return;
    setCode("");
    if (c === "mfa_enrol_required") void check();
    else { setError(null); setNotice("Enter your code again to continue."); setView("verify"); }
  }), [check]);

  const startSetup = async () => {
    setBusy(true); setError(null);
    try { setSetup(await reviewerApi.mfaSetup()); setCode(""); setView("scan"); }
    catch (e) {
      if (e instanceof ReviewerApiError && e.code === "mfa_already_enabled") { await check(); return; }
      setError(messageOf(e));
    } finally { setBusy(false); }
  };

  const confirmSetup = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await reviewerApi.mfaEnable(code);
      setCodes(r.recoveryCodes); setSaved(false); setSetup(null); setCode(""); setView("recovery");
    } catch (e) { setError(messageOf(e)); }
    finally { setBusy(false); }
  };

  const submitVerify = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await reviewerApi.mfaVerify(useRecovery ? { recoveryCode: recoveryInput.trim() } : { code });
      setCode(""); setRecoveryInput(""); setNotice(null);
      if (useRecovery && r.recoveryLeft <= 2) setNotice(`You have ${r.recoveryLeft} recovery code${r.recoveryLeft === 1 ? "" : "s"} left. Ask a compliance admin to reset your second step soon.`);
      setView("ready");
    } catch (e) { setError(messageOf(e)); setCode(""); }
    finally { setBusy(false); }
  };

  const copyCodes = async () => {
    try { await navigator.clipboard.writeText(codes.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setError("Could not copy. Select the codes and copy them by hand."); }
  };

  const downloadCodes = () => {
    const blob = new Blob([`WelliRecord reviewer recovery codes\nEach code works once.\n\n${codes.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wellirecord-recovery-codes.txt";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  if (view === "ready") {
    return (
      <>
        {notice && <div role="status" className="mx-auto mb-4 max-w-5xl rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">{notice}</div>}
        {children}
      </>
    );
  }

  const shell = (body: React.ReactNode) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className={card}>{body}</div>
    </div>
  );
  const errorBox = error && <p role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>;
  const noticeBox = notice && <p role="status" className="mt-3 text-sm text-slate-300">{notice}</p>;

  if (view === "loading") {
    return shell(<div className="flex items-center justify-center gap-3 py-6 text-slate-300"><Loader2 className="animate-spin" size={20} /> Checking your second step…</div>);
  }

  if (view === "error") {
    return shell(
      <>
        <h1 className="text-lg font-black text-slate-100">Could not load reviewer tools</h1>
        {errorBox}
        <button className={`${primary} mt-4`} onClick={() => void check()}>Try again</button>
      </>,
    );
  }

  if (view === "intro") {
    return shell(
      <>
        <ShieldCheck className="text-sky-400" size={28} />
        <h1 className="mt-3 text-lg font-black text-slate-100">Set up your second sign-in step</h1>
        <p className="mt-2 text-sm text-slate-300">Reviewer tools need a code from an authenticator app on your phone, on top of your password. This takes about two minutes.</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-300">
          <li>Install an authenticator app if you don't have one.</li>
          <li>Scan the code on the next screen.</li>
          <li>Enter the six digits it shows, then save your recovery codes.</li>
        </ol>
        {errorBox}
        <button className={`${primary} mt-5`} disabled={busy} onClick={startSetup}>{busy ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />} Start setup</button>
      </>,
    );
  }

  if (view === "scan" && setup) {
    return shell(
      <form onSubmit={confirmSetup}>
        <h1 className="text-lg font-black text-slate-100">Scan with your authenticator app</h1>
        <div className="mt-4 flex justify-center rounded-xl bg-white p-3"><QRCode value={setup.otpauthUrl} size={176} /></div>
        <p className="mt-3 text-xs text-slate-400">Can't scan? Enter this key by hand, with time-based codes switched on:</p>
        <p className="mt-1 select-all break-all rounded-lg bg-slate-950 px-3 py-2 text-center font-mono text-sm text-slate-100">{groupSecret(setup.secret)}</p>
        <label htmlFor="setup-code" className="mt-4 block text-sm font-semibold text-slate-200">Six-digit code from the app</label>
        <input id="setup-code" className={`${input} mt-1`} inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={(e) => setCode(digitsOnly(e.target.value))} placeholder="123456" />
        {errorBox}
        <button type="submit" className={`${primary} mt-4`} disabled={busy || code.length !== 6}>{busy && <Loader2 className="animate-spin" size={16} />} Confirm and turn on</button>
      </form>,
    );
  }

  if (view === "recovery") {
    return shell(
      <>
        <h1 className="text-lg font-black text-slate-100">Save your recovery codes</h1>
        <p className="mt-2 text-sm text-slate-300">Each code works once if you lose your phone. They are shown only now. Store them somewhere private, not in this browser.</p>
        <ul className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-950 p-3 font-mono text-sm text-slate-100">
          {codes.map((c) => <li key={c} className="select-all text-center">{c}</li>)}
        </ul>
        <div className="mt-3 flex gap-2">
          <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" onClick={copyCodes}><Copy size={14} /> {copied ? "Copied" : "Copy"}</button>
          <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" onClick={downloadCodes}><Download size={14} /> Download</button>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm text-slate-200">
          <input type="checkbox" className="mt-1" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
          I have saved these codes.
        </label>
        {errorBox}
        <button className={`${primary} mt-4`} disabled={!saved} onClick={() => { setCodes([]); setError(null); setView("ready"); }}>Continue to reviewer tools</button>
      </>,
    );
  }

  // verify
  return shell(
    <form onSubmit={submitVerify}>
      <ShieldCheck className="text-sky-400" size={28} />
      <h1 className="mt-3 text-lg font-black text-slate-100">Enter your code</h1>
      {useRecovery ? (
        <>
          <label htmlFor="recovery-code" className="mt-3 block text-sm font-semibold text-slate-200">Recovery code</label>
          <input id="recovery-code" className={`${input} mt-1 font-mono`} autoFocus autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={24} value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} placeholder="XXXXX-XXXXX" />
        </>
      ) : (
        <>
          <label htmlFor="verify-code" className="mt-3 block text-sm font-semibold text-slate-200">Six-digit code from your authenticator app</label>
          <input id="verify-code" className={`${input} mt-1`} inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={(e) => setCode(digitsOnly(e.target.value))} placeholder="123456" />
        </>
      )}
      {noticeBox}
      {errorBox}
      <button type="submit" className={`${primary} mt-4`} disabled={busy || (useRecovery ? recoveryInput.trim().length < 10 : code.length !== 6)}>{busy && <Loader2 className="animate-spin" size={16} />} Continue</button>
      <button type="button" className={`${quiet} mt-4 block w-full text-center`} onClick={() => { setUseRecovery((v) => !v); setError(null); setCode(""); setRecoveryInput(""); }}>
        {useRecovery ? "Use my authenticator app instead" : "Use a recovery code instead"}
      </button>
    </form>,
  );
}
