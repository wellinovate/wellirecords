import React, { useState } from "react";
import { STATE_NAMES } from "@/shared/data/nigeriaRegions";
import { residenceApi } from "@/shared/api/residenceApi";

type Props = { initialState?: string; registeredIn?: string };

// Where the person lives now. Changing it never changes their WelliID or the region they registered in.
export function ResidenceCard({ initialState = "", registeredIn = "" }: Props) {
  const [saved, setSaved] = useState(initialState);
  const [value, setValue] = useState(initialState);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await residenceApi.save(value);
      setSaved(r.residenceState);
      setMsg({ ok: true, text: "Saved. Your WelliID did not change." });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-base font-bold text-gray-900">Where you live</h3>
      <p className="mt-1 text-sm text-gray-600">
        {registeredIn ? `Your WelliID was issued when you registered in ${registeredIn}. ` : ""}
        Moving does not change it.
      </p>
      <select
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="State of residence"
      >
        <option value="">Select your state</option>
        {STATE_NAMES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      {value && value !== saved && (
        <button onClick={save} disabled={busy} className="mt-3 rounded-lg bg-[#041E42] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save state"}
        </button>
      )}
    </section>
  );
}
