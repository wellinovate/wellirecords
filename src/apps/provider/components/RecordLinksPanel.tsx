import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Plus, RefreshCw, X } from "lucide-react";
import {
  LinkAuditRow,
  StaffLink,
  approveRecordLink,
  cancelRecordLink,
  getRecordLink,
  listRecordLinks,
  rejectRecordLink,
  reopenRecordLink,
  stageLinkItems,
} from "@/shared/api/recordLinksApi";

const LABEL: Record<string, string> = {
  awaiting_patient_verification: "Waiting for patient",
  awaiting_consent: "Waiting for consent",
  under_hospital_review: "Ready for your review",
  linking_in_progress: "Linking",
  linked: "Linked",
  action_required: "Needs action",
  cancelled: "Cancelled",
};
const FILTERS = ["", "under_hospital_review", "action_required", "awaiting_patient_verification", "awaiting_consent", "linked", "cancelled"];
const msg = (e: any, d: string) => e?.response?.data?.message || d;
const when = (v?: string | null) => (v ? new Date(v).toLocaleString() : "");

function Detail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [link, setLink] = useState<StaffLink | null>(null);
  const [audit, setAudit] = useState<LinkAuditRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"allergy" | "medication">("allergy");
  const [name, setName] = useState("");
  const [extra, setExtra] = useState({ allergyType: "drug", severity: "unknown", reaction: "", dosage: "", frequency: "", sourceRef: "" });

  const load = useCallback(async () => {
    try {
      const r = await getRecordLink(id);
      setLink(r.link);
      setAudit(r.audit);
    } catch (e) {
      setError(msg(e, "Could not load this link."));
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>, fallback: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
      onChanged();
    } catch (e) {
      setError(msg(e, fallback));
      await load();
    } finally {
      setBusy(false);
    }
  };

  const addItem = () =>
    act(async () => {
      if (!name.trim()) throw { response: { data: { message: "Enter a name." } } };
      await stageLinkItems(
        id,
        kind === "allergy"
          ? [{ kind, allergen: name, allergyType: extra.allergyType, severity: extra.severity, reaction: extra.reaction, sourceRef: extra.sourceRef }]
          : [{ kind, medicationName: name, dosage: extra.dosage, frequency: extra.frequency, sourceRef: extra.sourceRef }],
      );
      setName("");
      setExtra({ ...extra, reaction: "", dosage: "", frequency: "", sourceRef: "" });
    }, "Could not add the item.");

  const input = "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white";
  const btn = "px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50";
  const s = link?.status;
  const canStage = s && ["awaiting_patient_verification", "awaiting_consent", "under_hospital_review", "action_required"].includes(s);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg h-full overflow-y-auto bg-slate-950 border-l border-slate-800 p-5 space-y-5 text-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white">{link?.patientName || "Link"}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {error && <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}
        {!link ? (
          <RefreshCw className="animate-spin" size={18} />
        ) : (
          <>
            <div className="text-xs space-y-1">
              <p>Status: <strong>{LABEL[link.status] || link.status}</strong></p>
              {link.actionReason && <p className="text-amber-300">Reason: {link.actionReason}</p>}
              {link.verifiedAt && (
                <p>
                  Identity checked by {link.verifiedMethod === "dob" ? "date of birth" : "name only"} on {when(link.verifiedAt)}.
                  {link.verificationWeak && <span className="text-amber-300"> Name-only match is weak: confirm this is the right person before you approve.</span>}
                </p>
              )}
              {link.consentAt && <p>Consent {when(link.consentAt)} ({link.consentVersion}) for: {link.consentScopes.join(", ")}.</p>}
              <p>Items staged: {link.stagedCount}. Expires {when(link.expiresAt)}.</p>
              {s === "linked" && (
                <p>Transferred: {link.transferred.allergies} allergies, {link.transferred.medications} medications, {link.transferred.skipped} skipped.</p>
              )}
            </div>

            {s === "under_hospital_review" && (
              <div className="space-y-2 border border-slate-800 rounded-xl p-3">
                <p className="text-xs font-bold text-white">Release to the patient</p>
                <p className="text-[11px] text-slate-400">
                  Approving copies the staged items the patient consented to into their WelliRecord account. This cannot be undone from here.
                </p>
                <input className={input} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className={`${btn} bg-emerald-600 text-white`} disabled={busy} onClick={() => act(() => approveRecordLink(id, note), "Could not approve.")}>
                  Approve and release
                </button>
              </div>
            )}

            {canStage && (
              <div className="space-y-2 border border-slate-800 rounded-xl p-3">
                <p className="text-xs font-bold text-white">Add items from the hospital record</p>
                <div className="grid grid-cols-2 gap-2">
                  <select className={input} value={kind} onChange={(e) => setKind(e.target.value as any)}>
                    <option value="allergy">Allergy</option>
                    <option value="medication">Medication</option>
                  </select>
                  <input className={input} placeholder={kind === "allergy" ? "Allergen" : "Medication name"} value={name} onChange={(e) => setName(e.target.value)} />
                  {kind === "allergy" ? (
                    <>
                      <select className={input} value={extra.allergyType} onChange={(e) => setExtra({ ...extra, allergyType: e.target.value })}>
                        {["drug", "food", "environment", "insect", "other"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <select className={input} value={extra.severity} onChange={(e) => setExtra({ ...extra, severity: e.target.value })}>
                        {["unknown", "mild", "moderate", "severe", "life-threatening"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input className={`${input} col-span-2`} placeholder="Reaction" value={extra.reaction} onChange={(e) => setExtra({ ...extra, reaction: e.target.value })} />
                    </>
                  ) : (
                    <>
                      <input className={input} placeholder="Dosage as written" value={extra.dosage} onChange={(e) => setExtra({ ...extra, dosage: e.target.value })} />
                      <input className={input} placeholder="Frequency" value={extra.frequency} onChange={(e) => setExtra({ ...extra, frequency: e.target.value })} />
                    </>
                  )}
                  <input className={`${input} col-span-2`} placeholder="Hospital reference (optional)" value={extra.sourceRef} onChange={(e) => setExtra({ ...extra, sourceRef: e.target.value })} />
                </div>
                <button className={`${btn} bg-blue-600 text-white flex items-center gap-1`} disabled={busy} onClick={addItem}>
                  <Plus size={13} /> Add item
                </button>
                <p className="text-[11px] text-slate-400">Staged items stay hidden from the patient until you approve.</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {s === "action_required" && (
                <button className={`${btn} bg-blue-600 text-white`} disabled={busy} onClick={() => act(() => reopenRecordLink(id), "Could not reopen.")}>
                  Reopen for the patient
                </button>
              )}
              {s && !["linked", "cancelled", "linking_in_progress"].includes(s) && (
                <button className={`${btn} bg-slate-800 text-slate-200 border border-slate-700`} disabled={busy} onClick={() => confirm("Cancel this link?") && act(() => cancelRecordLink(id), "Could not cancel.")}>
                  Cancel link
                </button>
              )}
            </div>

            {s && ["awaiting_patient_verification", "awaiting_consent", "under_hospital_review"].includes(s) && (
              <div className="space-y-2">
                <input className={input} placeholder="Reason to stop and flag this link" value={reason} onChange={(e) => setReason(e.target.value)} />
                <button className={`${btn} bg-amber-600 text-white`} disabled={busy || !reason.trim()} onClick={() => act(() => rejectRecordLink(id, reason), "Could not flag.")}>
                  Flag as needs action
                </button>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-white mb-2">History</p>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {audit.map((a) => (
                  <li key={a._id}>
                    {when(a.at)} · {a.actorType} · {a.action.replace(/_/g, " ")}
                    {a.detail ? ` · ${a.detail}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function RecordLinksPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [links, setLinks] = useState<StaffLink[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await listRecordLinks({ status: status || undefined, limit: 50 });
      setLinks(r.links);
      setTotal(r.total);
    } catch (e) {
      setError(msg(e, "Could not load links."));
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl text-sm bg-slate-900 border border-slate-800 text-slate-200">
          {FILTERS.map((f) => <option key={f} value={f}>{f ? LABEL[f] : "All statuses"}</option>)}
        </select>
        <button onClick={load} aria-label="Refresh" className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <span className="text-xs text-slate-400">{total} link{total === 1 ? "" : "s"}</span>
      </div>
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
      <div className="rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-sm text-slate-200">
          <thead className="bg-slate-900 text-xs text-slate-400">
            <tr>{["Patient", "Status", "Checked by", "Items", "Updated"].map((h) => <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {links.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">No links yet. Start one from Imported Patients.</td></tr>
            )}
            {links.map((l) => (
              <tr key={l.id} onClick={() => setOpen(l.id)} className="cursor-pointer hover:bg-slate-900/60 border-t border-slate-800">
                <td className="px-4 py-3">
                  <div className="font-semibold">{l.patientName || "Patient"}</div>
                  {l.externalId && <div className="text-[11px] text-slate-400">{l.externalId}</div>}
                </td>
                <td className="px-4 py-3 text-xs">
                  {l.status === "linked" ? <span className="text-emerald-400 inline-flex items-center gap-1"><CheckCircle size={13} />Linked</span> : LABEL[l.status] || l.status}
                  {l.status === "action_required" && <AlertTriangle size={13} className="inline ml-1 text-amber-400" />}
                </td>
                <td className="px-4 py-3 text-xs">
                  {l.verifiedMethod ? (l.verifiedMethod === "dob" ? "Date of birth" : <span className="text-amber-300">Name only</span>) : "—"}
                </td>
                <td className="px-4 py-3 text-xs">{l.stagedCount}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{when(l.history?.[l.history.length - 1]?.at || l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <Detail id={open} onClose={() => setOpen(null)} onChanged={load} />}
    </div>
  );
}

export default RecordLinksPanel;
