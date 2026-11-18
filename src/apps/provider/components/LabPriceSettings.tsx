import { useEffect, useMemo, useState } from "react";
import { getLabTestCatalog, type LabTestCatalogGroup } from "@/shared/api/labTestCatalogApi";
import { listLabPrices, saveLabPrice, removeLabPrice, type LabPriceRow } from "@/shared/api/labPricesApi";

const inputCls = "w-full bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500";

export function LabPriceSettings({ onClose, canEdit }: { onClose: () => void; canEdit: boolean }) {
  const [groups, setGroups] = useState<LabTestCatalogGroup[]>([]);
  const [rows, setRows] = useState<LabPriceRow[]>([]);
  const [pick, setPick] = useState("");
  const [custom, setCustom] = useState("");
  const [price, setPrice] = useState("");
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  const reload = () => listLabPrices().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    getLabTestCatalog().then(setGroups).catch(() => setGroups([]));
    reload();
  }, []);

  const tests = useMemo(() => groups.flatMap((g) => g.tests.map((t: any) => ({ key: t.key || "", name: t.name || t.testName }))).filter((t) => t.name), [groups]);
  const shown = rows.filter((r) => r.testName.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    setMsg("");
    const t = tests.find((x) => `${x.key}|${x.name}` === pick);
    const testName = t ? t.name : custom.trim();
    try {
      await saveLabPrice({ testName, testKey: t?.key || undefined, price: Number(price) });
      setPick(""); setCustom(""); setPrice("");
      await reload();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Could not save the price.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-label="Test prices">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-white">Test prices</h3>
            <p className="text-xs text-slate-400">A new request with no price uses the price listed here. A price typed on the request wins.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">✕</button>
        </div>

        {canEdit ? (
          <div className="rounded-xl border border-slate-800 p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select className={inputCls} aria-label="Test from the catalog" value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Test from the catalog</option>
                {tests.map((t) => <option key={`${t.key}|${t.name}`} value={`${t.key}|${t.name}`}>{t.name}</option>)}
              </select>
              <input className={inputCls} aria-label="Or type a test name" placeholder="Or type a test name" disabled={Boolean(pick)} value={custom} onChange={(e) => setCustom(e.target.value)} />
              <input className={inputCls} aria-label="Price in naira" inputMode="decimal" placeholder="Price (₦)" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            {msg && <p role="alert" className="text-xs text-rose-300">{msg}</p>}
            <div className="flex justify-end">
              <button onClick={save} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950">Save price</button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Only the organisation owner can change prices.</p>
        )}

        <input className={inputCls} placeholder="Search the list" aria-label="Search the list" value={q} onChange={(e) => setQ(e.target.value)} />
        {shown.length === 0 ? (
          <p className="text-xs text-slate-400">{rows.length === 0 ? "No prices saved yet." : "No match."}</p>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400"><tr><th className="py-1 pr-3">Test</th><th className="pr-3">Price</th><th /></tr></thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {shown.map((r) => (
                <tr key={r._id}>
                  <td className="py-1.5 pr-3">{r.testName}</td>
                  <td className="pr-3">₦{r.price.toLocaleString()}</td>
                  <td className="text-right">{canEdit && <button className="text-rose-300 hover:text-rose-200" onClick={() => removeLabPrice(r._id).then(reload)}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
