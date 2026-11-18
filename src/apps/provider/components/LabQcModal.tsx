import { useEffect, useState } from "react";
import { equipmentApi, type Analyzer, type QcRun, type QcGate } from "@/shared/api/labEquipmentApi";
import { qcChartPoints, sdLineY } from "@/apps/provider/utils/qcChart";

const inputCls = "w-full bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500";
const COLOR: Record<string, string> = { pass: "#34d399", warn: "#fbbf24", fail: "#f87171" };
const WORD: Record<string, string> = { pass: "Pass", warn: "Warning", fail: "Fail" };
const when = (d: string) => new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

export function LabQcModal({ analyzer, canWrite, onClose, onChanged }: { analyzer: Analyzer; canWrite: boolean; onClose: () => void; onChanged: () => void }) {
  const [runs, setRuns] = useState<QcRun[]>([]);
  const [gate, setGate] = useState<QcGate | null>(null);
  const [f, setF] = useState({ controlName: "", lotNumber: "", analyte: "", unit: "", value: "", mean: "", sd: "", note: "" });
  const [err, setErr] = useState("");
  const [advice, setAdvice] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState("");

  const load = () => equipmentApi.qcRuns(analyzer._id).then((r) => { setRuns(r.runs); setGate(r.gate); }).catch(() => { setRuns([]); });
  useEffect(() => { load(); }, [analyzer._id]);

  const series = Array.from(new Set(runs.map((r) => `${r.controlName} | ${r.analyte}`)));
  const shown = pick || series[series.length - 1] || "";
  const chartRuns = runs.filter((r) => `${r.controlName} | ${r.analyte}` === shown);
  const pts = qcChartPoints(chartRuns);

  const save = async () => {
    setErr(""); setAdvice([]); setBusy(true);
    try {
      const out = await equipmentApi.addQcRun(analyzer._id, f);
      setAdvice(out.explanation);
      setF({ ...f, value: "", note: "" });
      await load();
      onChanged();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Could not save the control result.");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-label="Quality control">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-white">Quality control · {analyzer.name}</h3>
            <p className="text-xs text-slate-400">Run a control sample, then enter the value and the target from the control insert.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">✕</button>
        </div>

        {gate?.blocked && (
          <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            <b>Failing:</b> {gate.failing.map((x) => `${x.controlName} (${x.analyte})`).join(", ")}. Results from this analyser cannot be verified until a control passes.
          </div>
        )}
        {gate && !gate.blocked && !gate.checkedToday && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">No control has been run in the last 24 hours.</div>
        )}

        {canWrite && (
          <div className="rounded-xl border border-slate-800 p-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input className={inputCls} placeholder="Control (Level 1)" value={f.controlName} onChange={(e) => setF({ ...f, controlName: e.target.value })} />
              <input className={inputCls} placeholder="Test (Glucose)" value={f.analyte} onChange={(e) => setF({ ...f, analyte: e.target.value })} />
              <input className={inputCls} placeholder="Unit" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
              <input className={inputCls} placeholder="Control lot" value={f.lotNumber} onChange={(e) => setF({ ...f, lotNumber: e.target.value })} />
              <input className={inputCls} inputMode="decimal" placeholder="Value measured" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
              <input className={inputCls} inputMode="decimal" placeholder="Target mean" value={f.mean} onChange={(e) => setF({ ...f, mean: e.target.value })} />
              <input className={inputCls} inputMode="decimal" placeholder="Target SD" value={f.sd} onChange={(e) => setF({ ...f, sd: e.target.value })} />
              <input className={inputCls} placeholder="Note (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
            </div>
            {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
            {advice.length > 0 && <p role="status" className="text-xs text-amber-200">{advice.join(" ")}</p>}
            <div className="flex justify-end">
              <button disabled={busy} onClick={save} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 disabled:opacity-50">Save control result</button>
            </div>
          </div>
        )}

        {series.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400" htmlFor="qc-series">Chart</label>
              <select id="qc-series" className={`${inputCls} max-w-xs`} value={shown} onChange={(e) => setPick(e.target.value)}>
                {series.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-slate-500">last 30 days</span>
            </div>
            <svg viewBox="0 0 560 220" className="w-full rounded-xl border border-slate-800 bg-[#081220]" role="img" aria-label="Levey-Jennings chart">
              {[-3, -2, -1, 0, 1, 2, 3].map((s) => (
                <g key={s}>
                  <line x1="24" x2="536" y1={sdLineY(s)} y2={sdLineY(s)} stroke={s === 0 ? "#64748b" : Math.abs(s) === 3 ? "#f87171" : Math.abs(s) === 2 ? "#fbbf24" : "#334155"} strokeDasharray={s === 0 ? "" : "4 4"} strokeWidth="1" />
                  <text x="4" y={sdLineY(s) + 3} fontSize="9" fill="#94a3b8">{s === 0 ? "mean" : `${s > 0 ? "+" : ""}${s}`}</text>
                </g>
              ))}
              <polyline fill="none" stroke="#475569" strokeWidth="1" points={pts.map((p) => `${p.x},${p.y}`).join(" ")} />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={COLOR[p.status]}><title>{`z ${p.z} · ${WORD[p.status]}`}</title></circle>
              ))}
            </svg>
          </div>
        )}

        {runs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400"><tr><th className="py-1 pr-3">When</th><th className="pr-3">Control</th><th className="pr-3">Test</th><th className="pr-3">Value</th><th className="pr-3">z</th><th className="pr-3">Result</th><th>By</th></tr></thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {[...runs].reverse().slice(0, 30).map((r) => (
                  <tr key={r._id}>
                    <td className="py-1 pr-3 whitespace-nowrap">{when(r.runAt)}</td>
                    <td className="pr-3">{r.controlName}</td>
                    <td className="pr-3">{r.analyte}</td>
                    <td className="pr-3">{r.value} {r.unit}</td>
                    <td className="pr-3">{r.z}</td>
                    <td className="pr-3" style={{ color: COLOR[r.status] }}>{WORD[r.status]}{r.violations.length ? ` (${r.violations.join(", ")})` : ""}</td>
                    <td>{r.byName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {runs.length === 0 && <p className="text-xs text-slate-400">No control results in the last 30 days.</p>}
      </div>
    </div>
  );
}
