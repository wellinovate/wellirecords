import { useCallback, useEffect, useState } from "react";
import {
  equipmentApi, equipmentError,
  type Analyzer, type AnalyzerEvent, type Reagent, type ReagentMovement, type EquipmentSummary,
} from "@/shared/api/labEquipmentApi";

const inputCls = "w-full bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500";
const btn = "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors";
const primary = `${btn} bg-sky-500 text-slate-950 border-sky-500 hover:bg-sky-400`;
const quiet = `${btn} bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700`;

const CAL: Record<string, { text: string; cls: string }> = {
  ok: { text: "Calibration current", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  due_soon: { text: "Calibration due soon", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  overdue: { text: "Calibration overdue", cls: "text-rose-300 border-rose-500/40 bg-rose-500/10" },
  unknown: { text: "No calibration date", cls: "text-slate-300 border-slate-600 bg-slate-800" },
};
const STOCK: Record<string, { text: string; cls: string }> = {
  ok: { text: "In stock", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  expiring: { text: "Expiring soon", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  low: { text: "Low stock", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  empty: { text: "Out of stock", cls: "text-rose-300 border-rose-500/40 bg-rose-500/10" },
  expired: { text: "Expired", cls: "text-rose-300 border-rose-500/40 bg-rose-500/10" },
};
const STATUS_TEXT: Record<string, string> = { active: "Active", maintenance: "In maintenance", out_of_service: "Out of service" };
const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "-");
const iso = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const Pill = ({ s, map }: { s: string; map: Record<string, { text: string; cls: string }> }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[s]?.cls || ""}`}>{map[s]?.text || s}</span>
);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[11px] text-slate-400">{label}<div className="mt-1">{children}</div></label>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-label={title}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- analyzers ----------
function AnalyzerForm({ initial, onSaved, onClose }: { initial?: Analyzer; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({
    name: initial?.name || "", manufacturer: initial?.manufacturer || "", model: initial?.model || "",
    serialNumber: initial?.serialNumber || "", department: initial?.department || "", location: initial?.location || "",
    status: initial?.status || "active", lastCalibrationAt: iso(initial?.lastCalibrationAt),
    calibrationIntervalDays: initial?.calibrationIntervalDays ? String(initial.calibrationIntervalDays) : "", notes: initial?.notes || "",
  });
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const save = async () => {
    setErr("");
    try {
      const body: any = { ...f, calibrationIntervalDays: f.calibrationIntervalDays };
      initial ? await equipmentApi.updateAnalyzer(initial._id, body) : await equipmentApi.createAnalyzer(body);
      onSaved();
    } catch (e) { setErr(equipmentError(e, "Could not save.")); }
  };
  return (
    <Modal title={initial ? "Edit analyzer" : "Add analyzer"} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name"><input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Department"><input className={inputCls} value={f.department} onChange={(e) => set("department", e.target.value)} placeholder="Haematology" /></Field>
        <Field label="Manufacturer"><input className={inputCls} value={f.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} /></Field>
        <Field label="Model"><input className={inputCls} value={f.model} onChange={(e) => set("model", e.target.value)} /></Field>
        <Field label="Serial number"><input className={inputCls} value={f.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} /></Field>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Status">
          <select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value)}>
            {Object.entries(STATUS_TEXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Calibration every (days)"><input className={inputCls} inputMode="numeric" value={f.calibrationIntervalDays} onChange={(e) => set("calibrationIntervalDays", e.target.value)} placeholder="180" /></Field>
        {!initial && <Field label="Last calibrated"><input type="date" className={inputCls} value={f.lastCalibrationAt} onChange={(e) => set("lastCalibrationAt", e.target.value)} /></Field>}
      </div>
      <Field label="Notes"><textarea rows={2} className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      {err && <p className="text-xs text-rose-300">{err}</p>}
      <div className="flex justify-end gap-2"><button className={quiet} onClick={onClose}>Cancel</button><button className={primary} onClick={save}>Save</button></div>
    </Modal>
  );
}

function AnalyzerLog({ a, onClose, onChanged }: { a: Analyzer; onClose: () => void; onChanged: () => void }) {
  const [events, setEvents] = useState<AnalyzerEvent[]>([]);
  const [f, setF] = useState({ type: "calibration", result: "pass", performedAt: new Date().toISOString().slice(0, 10), lotNumber: "", note: "" });
  const [err, setErr] = useState("");
  const load = () => equipmentApi.analyzerEvents(a._id).then(setEvents).catch(() => setEvents([]));
  useEffect(() => { load(); }, [a._id]);
  const add = async () => {
    setErr("");
    try {
      await equipmentApi.addEvent(a._id, { ...f, result: f.type === "qc" ? f.result : undefined });
      setF({ ...f, note: "", lotNumber: "" });
      await load();
      onChanged();
    } catch (e) { setErr(equipmentError(e, "Could not save.")); }
  };
  const label: Record<string, string> = { calibration: "Calibration", qc: "Quality control", maintenance: "Maintenance", note: "Note" };
  return (
    <Modal title={`${a.name}: calibration and QC log`} onClose={onClose}>
      <div className="grid sm:grid-cols-3 gap-2">
        <Field label="Entry">
          <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {Object.entries(label).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        {f.type === "qc" && (
          <Field label="Result"><select className={inputCls} value={f.result} onChange={(e) => setF({ ...f, result: e.target.value })}><option value="pass">Pass</option><option value="fail">Fail</option></select></Field>
        )}
        <Field label="Date"><input type="date" className={inputCls} value={f.performedAt} onChange={(e) => setF({ ...f, performedAt: e.target.value })} /></Field>
        {f.type === "qc" && <Field label="Control lot"><input className={inputCls} value={f.lotNumber} onChange={(e) => setF({ ...f, lotNumber: e.target.value })} /></Field>}
      </div>
      <Field label="Note"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
      {err && <p className="text-xs text-rose-300">{err}</p>}
      <button className={primary} onClick={add}>Add entry</button>
      <ul className="divide-y divide-slate-800 text-xs">
        {events.length === 0 && <li className="py-2 text-slate-500">No entries yet.</li>}
        {events.map((e) => (
          <li key={e._id} className="py-2 flex justify-between gap-3">
            <span className="text-slate-200">{label[e.type]}{e.result ? `: ${e.result}` : ""}{e.lotNumber ? ` (lot ${e.lotNumber})` : ""}{e.note ? ` - ${e.note}` : ""}</span>
            <span className="text-slate-500 whitespace-nowrap">{day(e.performedAt)} · {e.byName}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

// ---------- reagents ----------
function ReagentForm({ initial, analyzers, onSaved, onClose }: { initial?: Reagent; analyzers: Analyzer[]; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({
    name: initial?.name || "", catalogNumber: initial?.catalogNumber || "", lotNumber: initial?.lotNumber || "", supplier: initial?.supplier || "",
    analyzerId: initial?.analyzerId || "", quantity: "", unit: initial?.unit || "", reorderLevel: initial?.reorderLevel != null ? String(initial.reorderLevel) : "",
    expiresOn: iso(initial?.expiresOn), location: initial?.location || "",
  });
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const save = async () => {
    setErr("");
    try {
      const { quantity, ...rest } = f;
      initial ? await equipmentApi.updateReagent(initial._id, rest as any) : await equipmentApi.createReagent({ ...rest, quantity: Number(quantity || 0) } as any);
      onSaved();
    } catch (e) { setErr(equipmentError(e, "Could not save.")); }
  };
  return (
    <Modal title={initial ? "Edit reagent" : "Add reagent"} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name"><input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Catalogue number"><input className={inputCls} value={f.catalogNumber} onChange={(e) => set("catalogNumber", e.target.value)} /></Field>
        <Field label="Lot number"><input className={inputCls} value={f.lotNumber} onChange={(e) => set("lotNumber", e.target.value)} /></Field>
        <Field label="Supplier"><input className={inputCls} value={f.supplier} onChange={(e) => set("supplier", e.target.value)} /></Field>
        <Field label="Expiry date"><input type="date" className={inputCls} value={f.expiresOn} onChange={(e) => set("expiresOn", e.target.value)} /></Field>
        <Field label="Used on">
          <select className={inputCls} value={f.analyzerId} onChange={(e) => set("analyzerId", e.target.value)}>
            <option value="">Not linked</option>
            {analyzers.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </Field>
        {!initial && <Field label="Quantity in stock"><input className={inputCls} inputMode="decimal" value={f.quantity} onChange={(e) => set("quantity", e.target.value)} /></Field>}
        <Field label="Unit (kits, vials, mL)"><input className={inputCls} value={f.unit} onChange={(e) => set("unit", e.target.value)} /></Field>
        <Field label="Reorder at or below"><input className={inputCls} inputMode="decimal" value={f.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} /></Field>
        <Field label="Storage location"><input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Fridge 2" /></Field>
      </div>
      {initial && <p className="text-[11px] text-slate-500">Quantity changes through "Record stock" so every change is logged.</p>}
      {err && <p className="text-xs text-rose-300">{err}</p>}
      <div className="flex justify-end gap-2"><button className={quiet} onClick={onClose}>Cancel</button><button className={primary} onClick={save}>Save</button></div>
    </Modal>
  );
}

function StockModal({ r, onClose, onChanged }: { r: Reagent; onClose: () => void; onChanged: () => void }) {
  const [moves, setMoves] = useState<ReagentMovement[]>([]);
  const [f, setF] = useState({ reason: "used", quantity: "", note: "" });
  const [err, setErr] = useState("");
  const load = () => equipmentApi.movements(r._id).then(setMoves).catch(() => setMoves([]));
  useEffect(() => { load(); }, [r._id]);
  const add = async () => {
    setErr("");
    try {
      await equipmentApi.addMovement(r._id, { reason: f.reason, quantity: Number(f.quantity), note: f.note });
      setF({ ...f, quantity: "", note: "" });
      await load();
      onChanged();
    } catch (e) { setErr(equipmentError(e, "Could not save.")); }
  };
  const text: Record<string, string> = { received: "Received", used: "Used", wasted: "Wasted or spilled", adjustment: "Adjustment (recount)" };
  return (
    <Modal title={`${r.name}: stock`} onClose={onClose}>
      <p className="text-xs text-slate-400">In stock: <b className="text-white">{r.quantity} {r.unit}</b></p>
      <div className="grid sm:grid-cols-3 gap-2">
        <Field label="Reason"><select className={inputCls} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })}>{Object.entries(text).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label={f.reason === "adjustment" ? "Change (+ or -)" : "Quantity"}><input className={inputCls} inputMode="decimal" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
        <Field label={f.reason === "adjustment" ? "Why (required)" : "Note"}><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
      </div>
      {err && <p className="text-xs text-rose-300">{err}</p>}
      <button className={primary} onClick={add}>Record</button>
      <ul className="divide-y divide-slate-800 text-xs">
        {moves.length === 0 && <li className="py-2 text-slate-500">No movements yet.</li>}
        {moves.map((m) => (
          <li key={m._id} className="py-2 flex justify-between gap-3">
            <span className="text-slate-200">{text[m.reason] || m.reason}: {m.change > 0 ? "+" : ""}{m.change} (balance {m.balanceAfter}){m.note ? ` - ${m.note}` : ""}</span>
            <span className="text-slate-500 whitespace-nowrap">{day(m.createdAt)} · {m.byName}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

// ---------- tab ----------
export function LabEquipmentTab({ canWrite = true }: { canWrite?: boolean }) {
  const [analyzers, setAnalyzers] = useState<Analyzer[]>([]);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [summary, setSummary] = useState<EquipmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<null | { kind: "analyzer"; item?: Analyzer } | { kind: "log"; item: Analyzer } | { kind: "reagent"; item?: Reagent } | { kind: "stock"; item: Reagent }>(null);

  const load = useCallback(async () => {
    try {
      const [a, r, s] = await Promise.all([equipmentApi.analyzers(), equipmentApi.reagents(), equipmentApi.summary()]);
      setAnalyzers(a); setReagents(r); setSummary(s); setError("");
    } catch (e) { setError(equipmentError(e, "Could not load equipment.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const done = () => { setModal(null); load(); };
  const analyzerName = (id?: string | null) => analyzers.find((a) => a._id === id)?.name;
  const remove = async (kind: "analyzer" | "reagent", id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the list? Its log is kept.`)) return;
    try { kind === "analyzer" ? await equipmentApi.removeAnalyzer(id) : await equipmentApi.removeReagent(id); load(); }
    catch (e) { setError(equipmentError(e, "Could not remove.")); }
  };

  const chips = summary
    ? [
        { t: "Calibration overdue", n: summary.analyzers.overdue, bad: true },
        { t: "Calibration due soon", n: summary.analyzers.dueSoon },
        { t: "QC failed", n: summary.analyzers.qcFailed, bad: true },
        { t: "Reagents expired", n: summary.reagents.expired, bad: true },
        { t: "Expiring soon", n: summary.reagents.expiring },
        { t: "Low or empty", n: summary.reagents.low + summary.reagents.empty },
      ]
    : [];

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {chips.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {chips.map((c) => (
            <div key={c.t} className={`rounded-xl border p-3 ${c.n && c.bad ? "border-rose-500/40 bg-rose-500/10" : c.n ? "border-amber-500/30 bg-amber-500/10" : "border-slate-800 bg-[#0c192b]"}`}>
              <div className="text-2xl font-bold text-white">{c.n}</div>
              <div className="text-[11px] text-slate-400">{c.t}</div>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-[#0c192b] p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white">Analyzers</h2>
          {canWrite && <button className={primary} onClick={() => setModal({ kind: "analyzer" })}>Add analyzer</button>}
        </div>
        {loading ? <p className="text-xs text-slate-400">Loading...</p> : analyzers.length === 0 ? (
          <p className="text-xs text-slate-400">No analyzers on the register. Add each machine to track its calibration and quality control.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400"><tr>
                <th className="py-2 pr-3">Analyzer</th><th className="pr-3">Department</th><th className="pr-3">Status</th><th className="pr-3">Last calibrated</th><th className="pr-3">Next due</th><th className="pr-3">Last QC</th><th />
              </tr></thead>
              <tbody className="divide-y divide-slate-800">
                {analyzers.map((a) => (
                  <tr key={a._id} className="text-slate-200 align-top">
                    <td className="py-2 pr-3"><div className="font-semibold text-white">{a.name}</div><div className="text-slate-500">{[a.manufacturer, a.model, a.serialNumber && `S/N ${a.serialNumber}`].filter(Boolean).join(" · ")}</div></td>
                    <td className="pr-3">{a.department || "-"}</td>
                    <td className="pr-3">{STATUS_TEXT[a.status]}</td>
                    <td className="pr-3">{day(a.lastCalibrationAt)}</td>
                    <td className="pr-3"><div>{day(a.nextCalibrationDue)}</div><Pill s={a.calibrationStatus} map={CAL} /></td>
                    <td className="pr-3">{a.lastQcAt ? `${day(a.lastQcAt)} (${a.lastQcResult === "fail" ? "fail" : "pass"})` : "-"}</td>
                    <td className="py-2 whitespace-nowrap space-x-1.5 text-right">
                      <button className={quiet} onClick={() => setModal({ kind: "log", item: a })}>{canWrite ? "Log" : "View log"}</button>
                      {canWrite && <button className={quiet} onClick={() => setModal({ kind: "analyzer", item: a })}>Edit</button>}
                      {canWrite && <button className={quiet} onClick={() => remove("analyzer", a._id, a.name)}>Remove</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#0c192b] p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white">Reagents and consumables</h2>
          {canWrite && <button className={primary} onClick={() => setModal({ kind: "reagent" })}>Add reagent</button>}
        </div>
        {loading ? null : reagents.length === 0 ? (
          <p className="text-xs text-slate-400">No reagents on the list. Add each lot with its expiry date and a reorder level.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400"><tr>
                <th className="py-2 pr-3">Reagent</th><th className="pr-3">Lot</th><th className="pr-3">In stock</th><th className="pr-3">Expires</th><th className="pr-3">Used on</th><th className="pr-3">Status</th><th />
              </tr></thead>
              <tbody className="divide-y divide-slate-800">
                {reagents.map((r) => (
                  <tr key={r._id} className="text-slate-200 align-top">
                    <td className="py-2 pr-3"><div className="font-semibold text-white">{r.name}</div><div className="text-slate-500">{[r.supplier, r.location].filter(Boolean).join(" · ")}</div></td>
                    <td className="pr-3">{r.lotNumber || "-"}</td>
                    <td className="pr-3">{r.quantity} {r.unit}{r.reorderLevel != null ? <span className="text-slate-500"> (reorder at {r.reorderLevel})</span> : null}</td>
                    <td className="pr-3">{day(r.expiresOn)}</td>
                    <td className="pr-3">{analyzerName(r.analyzerId) || "-"}</td>
                    <td className="pr-3"><Pill s={r.stockStatus} map={STOCK} /></td>
                    <td className="py-2 whitespace-nowrap space-x-1.5 text-right">
                      <button className={quiet} onClick={() => setModal({ kind: "stock", item: r })}>{canWrite ? "Record stock" : "History"}</button>
                      {canWrite && <button className={quiet} onClick={() => setModal({ kind: "reagent", item: r })}>Edit</button>}
                      {canWrite && <button className={quiet} onClick={() => remove("reagent", r._id, r.name)}>Remove</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-[11px] text-slate-500">This is a register the laboratory keeps by hand. Nothing is read from the analyzers. Due dates come from the last calibration and the interval you set.</p>

      {modal?.kind === "analyzer" && <AnalyzerForm initial={modal.item} onSaved={done} onClose={() => setModal(null)} />}
      {modal?.kind === "log" && <AnalyzerLog a={modal.item} onClose={() => setModal(null)} onChanged={load} />}
      {modal?.kind === "reagent" && <ReagentForm initial={modal.item} analyzers={analyzers} onSaved={done} onClose={() => setModal(null)} />}
      {modal?.kind === "stock" && <StockModal r={modal.item} onClose={() => setModal(null)} onChanged={load} />}
    </div>
  );
}
