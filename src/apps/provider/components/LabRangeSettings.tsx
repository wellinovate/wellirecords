import { useEffect, useMemo, useState } from "react";
import { getLabTestCatalog, getLabCatalogTest, type LabCatalogTest, type LabTestCatalogGroup } from "@/shared/api/labTestCatalogApi";
import { listRangeOverrides, saveRangeOverride, removeRangeOverride, type LabRange, type LabRangeOverride } from "@/shared/api/labRangesApi";

const inputCls = "w-full bg-[#081220] border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none";
const blank = (): LabRange => ({ sex: "any", ageMin: 18, ageMax: 200, low: null, high: null, critLow: null, critHigh: null });
const toNum = (v: string) => (v.trim() === "" ? null : Number(v));

export function LabRangeSettings({ onClose, canEdit }: { onClose: () => void; canEdit: boolean }) {
  const [groups, setGroups] = useState<LabTestCatalogGroup[]>([]);
  const [overrides, setOverrides] = useState<LabRangeOverride[]>([]);
  const [testKey, setTestKey] = useState("");
  const [test, setTest] = useState<LabCatalogTest | null>(null);
  const [code, setCode] = useState("");
  const [ranges, setRanges] = useState<LabRange[]>([blank()]);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const reload = () => listRangeOverrides().then(setOverrides).catch(() => setOverrides([]));
  useEffect(() => {
    getLabTestCatalog().then(setGroups).catch(() => setGroups([]));
    reload();
  }, []);

  const structured = useMemo(() => groups.flatMap((g) => g.tests.filter((t) => t.structured && t.key).map((t) => ({ ...t, category: g.category }))), [groups]);

  useEffect(() => {
    setTest(null);
    setCode("");
    if (testKey) getLabCatalogTest(testKey).then(setTest).catch(() => setTest(null));
  }, [testKey]);

  const numeric = (test?.analytes || []).filter((a) => a.type === "numeric" || a.type === "calculated");
  const analyte: any = numeric.find((a) => a.code === code);
  const current = overrides.find((o) => o.testKey === testKey && o.code === code);

  useEffect(() => {
    if (!analyte) return;
    setRanges(current?.ranges?.length ? current.ranges : [blank()]);
    setReason(current?.reason || "");
    setMsg("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, overrides]);

  const upd = (i: number, patch: Partial<LabRange>) => setRanges((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const save = async () => {
    try {
      await saveRangeOverride(testKey, code, ranges, reason);
      setMsg("Saved. New results use these ranges.");
      reload();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Could not save.");
    }
  };
  const remove = async () => {
    try {
      await removeRangeOverride(testKey, code);
      setMsg("Back to the system default.");
      reload();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Could not remove.");
    }
  };

  const defaults: any[] = analyte?.ranges || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white">Reference ranges for this laboratory</h3>
            <p className="text-xs text-slate-400">Use the ranges that match your analyser and your patients. They replace the system defaults for this laboratory only. {canEdit ? "" : "Only the organisation owner can change them."}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">✕</button>
        </div>

        {overrides.length > 0 && (
          <p className="text-xs text-slate-400">{overrides.length} result field{overrides.length === 1 ? "" : "s"} use your own ranges.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <select className={inputCls} value={testKey} onChange={(e) => setTestKey(e.target.value)}>
            <option value="">Select a test</option>
            {structured.map((t) => <option key={t.key!} value={t.key!}>{t.name}</option>)}
          </select>
          <select className={inputCls} value={code} onChange={(e) => setCode(e.target.value)} disabled={!test}>
            <option value="">Select a result field</option>
            {numeric.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name}{overrides.some((o) => o.testKey === testKey && o.code === a.code) ? " (own range)" : ""}
              </option>
            ))}
          </select>
        </div>

        {analyte && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Enter limits in <b className="text-slate-200">{analyte.unit || "the field's unit"}</b>.
              Default: {defaults.length ? defaults.map((r) => r.text || `${r.sex !== "any" ? r.sex + " " : ""}${r.low ?? ""}${r.low != null && r.high != null ? " - " : ""}${r.high ?? ""}`).join("; ") : "none set"}.
            </p>
            {ranges.map((r, i) => (
              <div key={i} className="grid grid-cols-3 sm:grid-cols-7 gap-2 items-end">
                <label className="text-[10px] text-slate-400">Sex
                  <select className={inputCls} value={r.sex} onChange={(e) => upd(i, { sex: e.target.value as any })} disabled={!canEdit}>
                    <option value="any">Any</option><option value="M">Male</option><option value="F">Female</option>
                  </select>
                </label>
                {(["ageMin", "ageMax", "low", "high", "critLow", "critHigh"] as const).map((k) => (
                  <label key={k} className="text-[10px] text-slate-400">
                    {{ ageMin: "Age from", ageMax: "Age to", low: "Low", high: "High", critLow: "Critical low", critHigh: "Critical high" }[k]}
                    <input className={inputCls} inputMode="decimal" disabled={!canEdit} value={r[k] ?? ""} onChange={(e) => upd(i, { [k]: toNum(e.target.value) } as any)} />
                  </label>
                ))}
              </div>
            ))}
            {canEdit && (
              <>
                <div className="flex gap-3 text-xs">
                  <button type="button" className="text-sky-400 hover:text-sky-300" onClick={() => setRanges((p) => [...p, blank()])}>Add a range</button>
                  {ranges.length > 1 && <button type="button" className="text-slate-400 hover:text-white" onClick={() => setRanges((p) => p.slice(0, -1))}>Remove last</button>}
                </div>
                <input className={inputCls} placeholder="Source of these ranges (analyser, kit or reference)" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-3">
                  <button type="button" onClick={save} className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-slate-950">Save ranges</button>
                  {current && <button type="button" onClick={remove} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700">Use system default</button>}
                </div>
              </>
            )}
            {msg && <p className="text-xs text-sky-300">{msg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
