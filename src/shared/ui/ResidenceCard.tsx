import React, { useEffect, useState } from "react";
import { STATE_NAMES } from "@/shared/data/nigeriaRegions";
import { residenceApi } from "@/shared/api/residenceApi";

type Props = { initialState?: string; initialLga?: string; initialLgaCode?: string; registeredIn?: string };

const NOT_LISTED = "__typed__";

// Where the person lives now. Changing it never changes their WelliID or the region they registered in.
export function ResidenceCard({ initialState = "", initialLga = "", initialLgaCode = "", registeredIn = "" }: Props) {
  const [saved, setSaved] = useState(initialState);
  const [value, setValue] = useState(initialState);
  const [lgaText, setLgaText] = useState(initialLga);
  const [lgaCode, setLgaCode] = useState(initialLgaCode);
  const [savedLga, setSavedLga] = useState(`${initialLgaCode}|${initialLga}`);
  const [lgaList, setLgaList] = useState<{ code: string; name: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!value) return;
    let live = true;
    residenceApi.lgas(value).then((l) => live && setLgaList(l));
    return () => {
      live = false;
    };
  }, [value]);

  const hasList = lgaList.length > 0;
  const showTyped = typing || !hasList;
  const changed = value !== "" && (value !== saved || `${lgaCode}|${lgaText}` !== savedLga);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await residenceApi.save(value, lgaText, lgaCode);
      setSaved(r.residenceState);
      setLgaCode(r.lgaCode);
      setSavedLga(`${r.lgaCode}|${r.residenceLga}`);
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
        onChange={(e) => {
          setValue(e.target.value);
          setLgaText("");
          setLgaCode("");
          setTyping(false);
        }}
        aria-label="State of residence"
      >
        <option value="">Select your state</option>
        {STATE_NAMES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {value && hasList && (
        <select
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={typing ? NOT_LISTED : lgaCode}
          onChange={(e) => {
            if (e.target.value === NOT_LISTED) {
              setTyping(true);
              setLgaCode("");
              return;
            }
            const hit = lgaList.find((l) => l.code === e.target.value);
            setTyping(false);
            setLgaCode(hit?.code || "");
            setLgaText(hit?.name || "");
          }}
          aria-label="Local government or area council"
        >
          <option value="">Local government or area council</option>
          {lgaList.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
          <option value={NOT_LISTED}>Not listed, type it</option>
        </select>
      )}
      {value && showTyped && (
        <input
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={lgaText}
          maxLength={60}
          onChange={(e) => {
            setLgaText(e.target.value);
            setLgaCode("");
          }}
          placeholder="Local government or area council (optional)"
          aria-label="Local government or area council, typed"
        />
      )}
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      {changed && (
        <button onClick={save} disabled={busy} className="mt-3 rounded-lg bg-[#041E42] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save"}
        </button>
      )}
    </section>
  );
}
