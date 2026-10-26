import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, RefreshCw } from "lucide-react";
import { CaseRow, reviewerApi, ReviewerApiError, stepUp } from "@/shared/api/reviewerApi";

/**
 * Open provider verification cases. Read-only for now: assigning, checking, requesting evidence, approving and
 * rejecting are served by the API but have no screens yet.
 */

const label = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const dateOf = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); };

export function ReviewerQueuePage() {
  const [rows, setRows] = useState<CaseRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"all" | "me" | "unassigned">("all");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await reviewerApi.cases({ state: "open", assigned: scope === "all" ? undefined : scope })); }
    catch (e) {
      // A lost second step is handled by the gate, which swaps this page for the code prompt.
      if (!(e instanceof ReviewerApiError && e.status === 403 && (e.code === "mfa_required" || e.code === "mfa_enrol_required"))) {
        setError(e instanceof ReviewerApiError ? e.message : "Could not load the queue.");
      }
    } finally { setLoading(false); }
  }, [scope]);

  useEffect(() => { void load(); }, [load]);

  const lock = () => { stepUp.clear(); window.location.reload(); };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Provider verification</h1>
            <p className="mt-1 text-sm text-slate-400">Open cases, oldest first. Case actions are not on this page yet.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void load()} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800" disabled={loading}><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button>
            <button onClick={lock} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"><Lock size={14} /> Lock</button>
          </div>
        </div>

        <div className="mt-5 flex gap-2" role="tablist" aria-label="Case filter">
          {([["all", "All open"], ["me", "Assigned to me"], ["unassigned", "Unassigned"]] as const).map(([k, t]) => (
            <button key={k} role="tab" aria-selected={scope === k} onClick={() => setScope(k)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${scope === k ? "bg-sky-500 text-slate-950" : "border border-slate-600 text-slate-300 hover:bg-slate-800"}`}>{t}</button>
          ))}
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

        {loading && !rows ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-slate-300"><Loader2 className="animate-spin" size={18} /> Loading cases…</div>
        ) : rows && rows.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400">No open cases.</p>
        ) : rows ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2">Provider</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Case</th><th className="px-3 py-2">Submitted</th><th className="px-3 py-2">Age</th><th className="px-3 py-2">Checks</th><th className="px-3 py-2">Evidence</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60">
                    <td className="px-3 py-2 font-semibold">{r.name}{r.assignedReviewer ? "" : <span className="ml-2 text-xs font-normal text-amber-300">unassigned</span>}</td>
                    <td className="px-3 py-2">{label(r.category)}</td>
                    <td className="px-3 py-2">{label(r.status)}</td>
                    <td className="px-3 py-2">{label(r.kind)}</td>
                    <td className="px-3 py-2">{dateOf(r.submittedAt)}</td>
                    <td className="px-3 py-2">{r.ageDays} d</td>
                    <td className="px-3 py-2">{r.checks}</td>
                    <td className="px-3 py-2">{r.awaitingEvidence ? "Waiting on provider" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
