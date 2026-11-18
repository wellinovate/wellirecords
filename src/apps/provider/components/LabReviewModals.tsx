import { useState } from "react";
import { reviewLabOrder, setLabPatientNote, type LabOrder } from "@/shared/api/labOrdersApi";

const inputCls = "w-full bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500";
const FLAG: Record<string, string> = { H: "High", L: "Low", HH: "Critical high", LL: "Critical low", A: "Abnormal" };
const ISSUE: Record<string, string> = {
  sample_quality: "Sample quality",
  recollection_needed: "A new sample is needed",
  preparation: "Preparation (fasting, timing, medicines)",
  other: "Other",
};

function Shell({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-label={title}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 rounded-2xl border border-slate-700 bg-[#0c192b] shadow-2xl space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            {sub && <p className="text-xs text-sky-400">{sub}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PatientNoteModal({ order, onClose, onSaved }: { order: any; onClose: () => void; onSaved: (o: LabOrder) => void }) {
  const [text, setText] = useState<string>(order.patientNote?.text || "");
  const [issueType, setIssueType] = useState<string>(order.patientNote?.issueType || "other");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const withdrawn = order.approval?.status === "approved";
  const save = async () => {
    setErr("");
    setBusy(true);
    try {
      onSaved(await setLabPatientNote(order.id, text, issueType));
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Could not save the note.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell title="Note for the patient" sub={`${order.testName} · ${order.patientName}`} onClose={onClose}>
      <p className="text-xs text-slate-400">
        The patient reads this with their result. Write in plain words and say what they should do. Do not put results, diagnoses or names of other people in it.
      </p>
      <select className={inputCls} value={issueType} onChange={(e) => setIssueType(e.target.value)} aria-label="Type of note">
        {Object.entries(ISSUE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <textarea
        rows={4}
        maxLength={600}
        className={inputCls}
        placeholder="For example: Your sample was slightly haemolysed. Please come back for a new sample, no fasting needed."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="text-[11px] text-slate-500 text-right">{text.length}/600</div>
      {withdrawn && <p className="text-xs text-amber-300">This result is already approved. Changing the note means the senior has to approve it again.</p>}
      {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
      <div className="flex justify-between gap-2">
        <span className="text-[11px] text-slate-500">{order.patientNote ? `Last saved by ${order.patientNote.byName}` : ""}</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700" onClick={onClose}>Cancel</button>
          <button disabled={busy} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 disabled:opacity-50" onClick={save}>
            {text.trim() ? "Save note" : order.patientNote ? "Remove note" : "Save"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

export function ReviewModal({ order, onClose, onDone }: { order: any; onClose: () => void; onDone: (o: LabOrder, decision: "approve" | "return") => void }) {
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const rows: any[] = order.results || [];
  const act = async (decision: "approve" | "return") => {
    setErr("");
    if (decision === "return" && comment.trim().length < 5) return setErr("Say what needs correcting.");
    setBusy(true);
    try {
      onDone(await reviewLabOrder(order.id, decision, comment.trim()), decision);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Could not save your decision.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell title="Senior review" sub={`${order.testName} · ${order.patientName}`} onClose={onClose}>
      <p className="text-xs text-slate-400">
        Entered by {order.enteredByName || "-"}. Verified by {order.verifiedBy || "-"}{order.selfVerified ? " (the same person entered and verified it)" : ""}. Approve to allow release to the patient, or return it to the bench with what needs correcting.
      </p>

      {order.isCritical && <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">This result has a critical value.</div>}

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 bg-[#081220]"><tr><th className="p-2">Test</th><th className="p-2">Result</th><th className="p-2">Flag</th><th className="p-2">Reference</th></tr></thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((r) => (
                <tr key={r.code} className={r.critical ? "bg-rose-500/10" : r.abnormal ? "bg-amber-500/5" : ""}>
                  <td className="p-2 text-slate-200">{r.name}</td>
                  <td className="p-2 text-white font-semibold">{r.type === "sensitivity" ? (r.rows || []).map((x: any) => `${x.antibiotic} ${x.result}`).join("; ") : `${r.value ?? ""} ${r.unit || ""}`}</td>
                  <td className="p-2 text-amber-300">{r.flag ? FLAG[r.flag] || "" : ""}</td>
                  <td className="p-2 text-slate-400">{r.refText || ""}{r.rangeSource === "lab" ? " (lab range)" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 p-3 text-xs space-y-1">
          <div><b className="text-slate-300">Result (free text):</b> <span className="text-white">{order.measuredValue || "none"}</span></div>
          {order.normalRange && <div><b className="text-slate-300">Reference:</b> <span className="text-slate-300">{order.normalRange}</span></div>}
        </div>
      )}

      {(order.deltaFlags || []).length > 0 && (
        <p className="text-xs text-amber-200"><b>Large change from the previous result:</b> {(order.deltaFlags || []).map((d: any) => `${d.name} ${d.previous} to ${d.current} ${d.unit}`).join("; ")}</p>
      )}
      {order.interpretation && <p className="text-xs text-slate-300"><b>Interpretation:</b> {order.interpretation}</p>}
      <div className="rounded-lg border border-slate-800 p-2.5 text-xs">
        <b className="text-slate-300">Note for the patient:</b>{" "}
        <span className="text-slate-200">{order.patientNote ? `${order.patientNote.text} (${order.patientNote.byName})` : "None"}</span>
      </div>
      {(order.reviewLog || []).length > 0 && (
        <ul className="text-[11px] text-slate-400 space-y-0.5">
          {(order.reviewLog || []).map((l: any, i: number) => (
            <li key={i}>{new Date(l.at).toLocaleString()} · {l.byName}: {l.decision === "approve" ? "approved" : l.decision === "return" ? "returned" : "approval withdrawn"}{l.comment ? ` - ${l.comment}` : ""}</li>
          ))}
        </ul>
      )}

      <textarea rows={3} maxLength={1000} className={inputCls} placeholder="Your comment. Required if you return it." value={comment} onChange={(e) => setComment(e.target.value)} />
      {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700" onClick={onClose}>Cancel</button>
        <button disabled={busy} className="px-4 py-1.5 rounded-lg text-xs font-bold text-rose-200 border border-rose-500/50 hover:bg-rose-500/10 disabled:opacity-50" onClick={() => act("return")}>Return for correction</button>
        <button disabled={busy || (rows.length === 0 && !order.measuredValue)} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 disabled:opacity-50" onClick={() => act("approve")}>Approve</button>
      </div>
    </Shell>
  );
}
