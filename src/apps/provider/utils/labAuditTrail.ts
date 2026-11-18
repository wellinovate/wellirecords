export interface AuditEvent {
  at: string;
  who: string;
  what: string;
  detail?: string;
}

const STAGE_TEXT: Record<string, string> = {
  requested: "Order requested",
  collected: "Sample collected",
  received: "Sample received in the lab",
  processing: "Processing started",
  "quality-control": "Moved to quality control",
  verified: "Result verified",
  released: "Released to the patient",
  delivered: "Marked delivered",
  rejected: "Order rejected",
  cancelled: "Order cancelled",
};

const REVIEW_TEXT: Record<string, string> = {
  approve: "Approved by senior review",
  return: "Returned for correction",
  approval_withdrawn: "Approval withdrawn",
};

/** Everything that happened to a lab order, oldest first, from the fields the server already sends. */
export function buildAuditTrail(o: any): AuditEvent[] {
  const out: AuditEvent[] = [];
  for (const h of o?.stageHistory || []) {
    if (!h?.at) continue;
    out.push({ at: h.at, who: h.byName || "", what: STAGE_TEXT[h.status] || `Status: ${h.status}` });
  }
  if (o?.enteredAt) out.push({ at: o.enteredAt, who: o.enteredByName || "", what: "Result entered" });
  for (const r of o?.reviewLog || []) {
    if (!r?.at) continue;
    out.push({ at: r.at, who: r.byName || "", what: REVIEW_TEXT[r.decision] || String(r.decision), detail: r.comment || undefined });
  }
  if (o?.patientNote?.at) out.push({ at: o.patientNote.at, who: o.patientNote.byName || "", what: "Note for the patient saved", detail: o.patientNote.text });
  return out
    .filter((e) => !Number.isNaN(new Date(e.at).getTime()))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
