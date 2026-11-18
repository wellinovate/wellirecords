import { useEffect, useMemo, useRef, useState } from "react";
import type { LabAnalyte, LabCatalogTest } from "@/shared/api/labTestCatalogApi";
import { previewLabOrderResult, type DeltaFlag, type LabResultRow, type ResultEntry } from "@/shared/api/labOrdersApi";

type Entry = { value?: string; unit?: string; rows?: { antibiotic: string; result: string }[] };

export interface StructuredResultState {
  entries: ResultEntry[];
  isCritical: boolean;
  errors: string[];
  hasValues: boolean;
}

const FLAG_STYLE: Record<string, string> = {
  H: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  L: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  A: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  HH: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  LL: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  N: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};
const FLAG_TEXT: Record<string, string> = { H: "High", L: "Low", HH: "Critical high", LL: "Critical low", A: "Abnormal", N: "Within range" };

const inputCls =
  "w-full bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500";

function FlagChip({ row }: { row?: LabResultRow }) {
  if (!row?.flag) return null;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${FLAG_STYLE[row.flag] || ""}`}>
      {FLAG_TEXT[row.flag] || row.flag}
    </span>
  );
}

function initialEntries(test: LabCatalogTest, rows?: LabResultRow[]): Record<string, Entry> {
  const out: Record<string, Entry> = {};
  for (const r of rows || []) {
    const a = test.analytes.find((x) => x.code === r.code);
    if (!a || a.type === "calculated") continue;
    out[r.code] = a.type === "sensitivity" ? { rows: r.rows || [] } : { value: r.value == null ? "" : String(r.value) };
  }
  return out;
}

export function StructuredResultForm({
  orderId,
  test,
  initial,
  onChange,
}: {
  orderId: string;
  test: LabCatalogTest;
  initial?: LabResultRow[];
  onChange: (s: StructuredResultState) => void;
}) {
  const [entries, setEntries] = useState<Record<string, Entry>>(() => initialEntries(test, initial));
  const [preview, setPreview] = useState<Record<string, LabResultRow>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [critical, setCritical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deltas, setDeltas] = useState<DeltaFlag[]>([]);
  const seq = useRef(0);

  const payload = useMemo<ResultEntry[]>(() => {
    const list: ResultEntry[] = [];
    for (const a of test.analytes) {
      if (a.type === "calculated") continue;
      const e = entries[a.code];
      if (!e) continue;
      if (a.type === "sensitivity") {
        if (e.rows?.length) list.push({ code: a.code, rows: e.rows });
      } else if (e.value !== undefined && e.value !== "") {
        list.push({ code: a.code, value: e.value, unit: e.unit });
      }
    }
    return list;
  }, [entries, test]);

  // Flags and calculated values come from the server, so what is shown is what will be saved.
  useEffect(() => {
    onChange({ entries: payload, isCritical: critical, errors, hasValues: payload.length > 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, critical, errors]);

  useEffect(() => {
    if (!payload.length) {
      setPreview({});
      setErrors([]);
      setCritical(false);
      setDeltas([]);
      return;
    }
    const mine = ++seq.current;
    setLoading(true);
    const t = setTimeout(() => {
      previewLabOrderResult(orderId, payload)
        .then((res) => {
          if (mine !== seq.current) return;
          setPreview(Object.fromEntries(res.results.map((r) => [r.code, r])));
          setErrors(res.errors);
          setCritical(res.isCritical);
          setDeltas(res.deltaFlags || []);
        })
        .catch((err: any) => {
          if (mine !== seq.current) return;
          setErrors([err?.response?.data?.message || "Could not check the values."]);
        })
        .finally(() => mine === seq.current && setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [payload, orderId]);

  const set = (code: string, patch: Entry) => setEntries((p) => ({ ...p, [code]: { ...p[code], ...patch } }));

  const renderAnalyte = (a: LabAnalyte) => {
    const row = preview[a.code];
    const e = entries[a.code] || {};
    const label = (
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-slate-300">{a.name}</span>
        <FlagChip row={row} />
      </div>
    );
    const ref = row?.refText || a.refNote ? <p className="text-[10px] text-slate-500 mt-0.5">{row?.refText || a.refNote}</p> : null;

    if (a.type === "calculated") {
      return (
        <div key={a.code} className="rounded-lg border border-slate-800 bg-[#081220]/60 p-2.5">
          {label}
          <div className="text-sm text-slate-200 min-h-[1.5rem]">
            {row?.value != null ? `${row.value} ${a.unit || ""}` : <span className="text-slate-500">Calculated from the values above</span>}
          </div>
          {ref}
        </div>
      );
    }
    if (a.type === "numeric") {
      const units = [a.unit || "", ...(a.altUnits || []).map((u) => u.unit)];
      return (
        <div key={a.code}>
          {label}
          <div className="flex gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={e.value ?? ""}
              onChange={(ev) => set(a.code, { value: ev.target.value })}
              className={inputCls}
              aria-label={a.name}
            />
            {units.length > 1 ? (
              <select value={e.unit || a.unit || ""} onChange={(ev) => set(a.code, { unit: ev.target.value })} className={`${inputCls} !w-28`}>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            ) : (
              a.unit ? <span className="self-center text-xs text-slate-400 whitespace-nowrap">{a.unit}</span> : null
            )}
          </div>
          {ref}
        </div>
      );
    }
    if (a.type === "choice") {
      return (
        <div key={a.code}>
          {label}
          <select value={e.value ?? ""} onChange={(ev) => set(a.code, { value: ev.target.value })} className={inputCls}>
            <option value="">Select</option>
            {(a.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (a.type === "text") {
      return (
        <div key={a.code}>
          {label}
          <input type="text" maxLength={500} value={e.value ?? ""} onChange={(ev) => set(a.code, { value: ev.target.value })} className={inputCls} />
        </div>
      );
    }
    // sensitivity
    const rows = e.rows || [];
    const used = new Set(rows.map((r) => r.antibiotic));
    return (
      <div key={a.code} className="sm:col-span-2 rounded-lg border border-slate-800 p-2.5">
        {label}
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={r.antibiotic} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-slate-200">{r.antibiotic}</span>
              <select
                value={r.result}
                onChange={(ev) => set(a.code, { rows: rows.map((x, j) => (j === i ? { ...x, result: ev.target.value } : x)) })}
                className={`${inputCls} !w-40`}
              >
                <option value="S">S (sensitive)</option>
                <option value="I">I (intermediate)</option>
                <option value="R">R (resistant)</option>
                <option value="NT">NT (not tested)</option>
              </select>
              <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => set(a.code, { rows: rows.filter((_, j) => j !== i) })}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <select
          value=""
          onChange={(ev) => ev.target.value && set(a.code, { rows: [...rows, { antibiotic: ev.target.value, result: "S" }] })}
          className={`${inputCls} mt-2`}
        >
          <option value="">Add an antibiotic</option>
          {(a.options || []).filter((o) => !used.has(o)).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {(test.specimen || test.fastingRequired || test.notes) && (
        <p className="text-[11px] text-slate-400">
          {[test.specimen && `Specimen: ${test.specimen}`, test.fastingRequired && "Fasting sample", test.notes].filter(Boolean).join(" · ")}
        </p>
      )}
      {critical && (
        <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
          Critical value. The requesting doctor needs to be told as soon as this is saved.
        </div>
      )}
      {deltas.length > 0 && (
        <div role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <b>Large change from the previous result.</b> Check the sample and the entry before saving.
          <ul className="mt-1 space-y-0.5">
            {deltas.map((d) => (
              <li key={d.code}>{d.name}: {d.previous} to {d.current} {d.unit} ({d.changePct}% change, {new Date(d.previousDate).toLocaleDateString()})</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">{test.analytes.map(renderAnalyte)}</div>
      {errors.length > 0 && (
        <ul className="text-xs text-rose-300 space-y-0.5">{errors.map((er) => <li key={er}>{er}</li>)}</ul>
      )}
      <p className="text-[10px] text-slate-500">
        {loading
          ? "Checking values..."
          : Object.values(preview).some((r) => r.rangeSource === "lab")
          ? "Flags use this laboratory's own ranges where set, and system default ranges elsewhere."
          : "Flags use default adult reference ranges that have not been reviewed by a clinician. Set your own under Reference ranges."}
      </p>
    </div>
  );
}
