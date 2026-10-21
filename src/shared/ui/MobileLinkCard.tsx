import React, { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { mobileLinkApi } from "@/shared/api/mobileLinkApi";

const show = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;

/** Links this website account to the same person's WelliRecord mobile app account. */
export function MobileLinkCard() {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mobileLinkApi.status().then((s) => setLinked(s.linked)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!code) return;
    const tick = () => {
      const s = Math.max(0, Math.round((new Date(code.expiresAt).getTime() - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) setCode(null);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [code]);

  // After the phone claims the code, show the card as linked.
  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => mobileLinkApi.status().then((s) => { if (s.linked) { setLinked(true); setCode(null); } }).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, [code]);

  const make = async () => {
    setBusy(true); setError("");
    try { setCode(await mobileLinkApi.makeCode()); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const unlink = async () => {
    if (!window.confirm("Unlink the mobile app? Website video visits and hospital record links will stop showing in the app. Nothing is deleted.")) return;
    setBusy(true); setError("");
    try { await mobileLinkApi.unlink(); setLinked(false); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone size={16} className="text-blue-600" />
        <h3 className="text-sm font-bold text-gray-900">Mobile app</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Link this account to the WelliRecord app. Video visits you book here then show in the app, and you can finish hospital record links there.
      </p>
      {linked === null ? null : linked ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-emerald-700">Linked to the mobile app</p>
          <button onClick={unlink} disabled={busy} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 disabled:opacity-60">Unlink</button>
        </div>
      ) : code ? (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">In the app, open Profile, then Website account, and type:</p>
          <p className="text-3xl font-extrabold tracking-[0.25em] text-gray-900">{show(code.code)}</p>
          <p className="text-xs text-gray-500">Expires in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}. Do not share it.</p>
        </div>
      ) : (
        <button onClick={make} disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Make a link code</button>
      )}
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
