import { useEffect, useState } from "react";
import {
  reviewRadiologyReport, setRadiologyNote, releaseRadiologyReport, type RadiologyOrder,
} from "@/shared/api/radiologyOrdersApi";

const inputCls = "w-full bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500";
const NOTE_TYPES: Record<string, string> = {
  preparation: "Preparation",
  repeat_needed: "A repeat scan is needed",
  follow_up: "Follow-up",
  other: "Other",
};
const msg = (e: any, fallback: string) => e?.response?.data?.message || fallback;

export function RadiologyReviewPanel({ order, canApprove, onChange }: { order: RadiologyOrder; canApprove: boolean; onChange: (o: RadiologyOrder) => void }) {
  const [note, setNote] = useState(order.patientNote?.text || "");
  const [noteType, setNoteType] = useState(order.patientNote?.issueType || "other");
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNote(order.patientNote?.text || "");
    setNoteType(order.patientNote?.issueType || "other");
    setComment(""); setErr(""); setInfo("");
  }, [order.id]);

  const released = Boolean(order.releasedAt);
  const written = order.status === "reported" && Boolean(order.report?.findings);
  const approved = order.review?.state === "approved";

  const run = async (fn: () => Promise<void>) => {
    setErr(""); setInfo(""); setBusy(true);
    try { await fn(); } catch (e) { setErr(msg(e, "That did not work. Try again.")); } finally { setBusy(false); }
  };

  const saveNote = () => run(async () => { onChange(await setRadiologyNote(order.id, note, noteType)); setInfo("Note saved."); });
  const decide = (d: "approve" | "return") => run(async () => {
    if (d === "return" && comment.trim().length < 5) throw { response: { data: { message: "Say what needs correcting." } } };
    onChange(await reviewRadiologyReport(order.id, d, comment.trim()));
    setComment("");
    setInfo(d === "approve" ? "Approved. It can now be released." : "Returned to the radiologist.");
  });
  const release = () => run(async () => {
    if (!window.confirm("Release this report to the patient? They will be notified and it cannot be taken back.")) return;
    const out = await releaseRadiologyReport(order.id);
    onChange(out.order);
    setInfo(`Released. In-app notice: ${out.dispatch.inApp}. Email: ${out.dispatch.email}.`);
  });

  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(16,185,129,0.2)" }}>
      <div className="text-xs font-black uppercase tracking-widest" style={{ color: "#64748b" }}>Senior review and release</div>

      {order.returnReason && !written && !released && (
        <div role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"><b>Returned by the senior reviewer:</b> {order.returnReason}</div>
      )}

      <p className="text-xs" style={{ color: "#cbd5e1" }}>
        {released
          ? `Released to the patient ${new Date(order.releasedAt as string).toLocaleString("en-NG")}.`
          : approved
            ? `Approved by ${order.review?.byName}${order.review?.comment ? `: ${order.review.comment}` : ""}. Ready to release.`
            : written
              ? "The report is written and waiting for senior review. The patient has not been told."
              : "Write the report first. It then goes to a senior for review."}
      </p>

      {!released && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold" style={{ color: "#94a3b8" }}>Note for the patient (optional)</div>
          <select className={inputCls} aria-label="Type of note" value={noteType} onChange={(e) => setNoteType(e.target.value)}>
            {Object.entries(NOTE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea rows={2} maxLength={600} className={inputCls} placeholder="Plain words, for example: Please bring your earlier scan films to your follow-up visit." value={note} onChange={(e) => setNote(e.target.value)} />
          {approved && note.trim() !== (order.patientNote?.text || "") && <p className="text-[11px] text-amber-300">Changing the note withdraws the approval. The senior has to approve again.</p>}
          <button disabled={busy} onClick={saveNote} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 disabled:opacity-50">{note.trim() ? "Save note" : order.patientNote ? "Remove note" : "Save"}</button>
        </div>
      )}

      {written && !approved && canApprove && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <textarea rows={2} maxLength={1000} className={inputCls} placeholder="Your comment. Required if you return it." value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => decide("return")} className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-200 border border-rose-500/50 disabled:opacity-50">Return for correction</button>
            <button disabled={busy} onClick={() => decide("approve")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 disabled:opacity-50">Approve</button>
          </div>
        </div>
      )}

      {written && approved && !released && (
        <button disabled={busy} onClick={release} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-slate-950 disabled:opacity-50">Release to patient</button>
      )}

      {(order.reviewLog || []).length > 0 && (
        <ul className="text-[11px] space-y-0.5" style={{ color: "#94a3b8" }}>
          {(order.reviewLog || []).map((l, i) => (
            <li key={i}>{new Date(l.at).toLocaleString("en-NG")} · {l.byName}: {l.decision === "approve" ? "approved" : l.decision === "return" ? "returned" : "approval withdrawn"}{l.comment ? ` - ${l.comment}` : ""}</li>
          ))}
        </ul>
      )}
      {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
      {info && <p role="status" className="text-xs text-emerald-300">{info}</p>}
    </div>
  );
}
