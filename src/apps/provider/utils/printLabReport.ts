import type { LabResultRow, DeltaFlag } from "@/shared/api/labOrdersApi";

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FLAG: Record<string, string> = { H: "High", L: "Low", HH: "Critical high", LL: "Critical low", A: "Abnormal", N: "" };

export interface ReportOrder {
  patientName: string;
  patientWrId?: string;
  testName: string;
  barcode?: string;
  sampleType?: string;
  doctor?: string;
  createdAt?: string;
  enteredByName?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approval?: { byName: string; at: string; comment?: string };
  patientNote?: { text: string };
  transmittedAt?: string;
  interpretation?: string;
  measuredValue?: string;
  normalRange?: string;
  results?: LabResultRow[];
  deltaFlags?: DeltaFlag[];
  status?: string;
}

const fmt = (d?: string) => (d ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "");

export function buildLabReportHtml(o: ReportOrder, orgName = ""): string {
  const rows = (o.results || [])
    .map((r) => {
      if (r.type === "sensitivity") {
        const list = (r.rows || []).map((x) => `${esc(x.antibiotic)}: <b>${esc(x.result)}</b>`).join(" &middot; ");
        return `<tr><td>${esc(r.name)}</td><td colspan="3">${list || "Not entered"}</td></tr>`;
      }
      const flag = r.flag ? FLAG[r.flag] ?? r.flag : "";
      const cls = r.flag === "HH" || r.flag === "LL" ? "crit" : flag ? "abn" : "";
      return `<tr class="${cls}"><td>${esc(r.name)}</td><td><b>${esc(r.value)}</b> ${esc(r.unit)}</td><td>${esc(flag)}</td><td>${esc(r.refText || "")}</td></tr>`;
    })
    .join("");

  const table = rows
    ? `<table><thead><tr><th>Test</th><th>Result</th><th>Flag</th><th>Reference</th></tr></thead><tbody>${rows}</tbody></table>`
    : `<p><b>Result:</b> ${esc(o.measuredValue)}</p><p><b>Reference:</b> ${esc(o.normalRange)}</p>`;

  const deltas = (o.deltaFlags || []).length
    ? `<p class="note"><b>Change from the previous result:</b> ${(o.deltaFlags || [])
        .map((d) => `${esc(d.name)} ${esc(d.previous)} to ${esc(d.current)} ${esc(d.unit)} (${esc(new Date(d.previousDate).toLocaleDateString("en-NG"))})`)
        .join("; ")}</p>`
    : "";

  const unverified = o.status && !["verified", "released", "delivered"].includes(o.status)
    ? `<p class="warn">DRAFT. This result has not been verified.</p>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lab report ${esc(o.patientName)}</title><style>
    body{font-family:Arial,sans-serif;color:#111;margin:14mm;font-size:12px}
    h1{font-size:18px;margin:0}h2{font-size:14px;margin:14px 0 6px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin:10px 0}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{border-bottom:1px solid #ccc;padding:5px 6px;text-align:left}th{background:#f2f2f2}
    tr.abn td{background:#fff6dd}tr.crit td{background:#fde2e2;font-weight:bold}
    .note{margin-top:10px}.warn{color:#b00020;font-weight:bold;margin:8px 0}
    .foot{margin-top:18px;font-size:10px;color:#555;border-top:1px solid #ccc;padding-top:6px}
    @media print{body{margin:10mm}}
  </style></head><body>
    <h1>${esc(orgName || "Laboratory report")}</h1>
    ${unverified}
    <div class="meta">
      <div><b>Patient:</b> ${esc(o.patientName)}</div><div><b>WelliID:</b> ${esc(o.patientWrId)}</div>
      <div><b>Test:</b> ${esc(o.testName)}</div><div><b>Sample:</b> ${esc(o.sampleType)} ${o.barcode ? "(" + esc(o.barcode) + ")" : ""}</div>
      <div><b>Requested by:</b> ${esc(o.doctor)}</div><div><b>Requested:</b> ${esc(fmt(o.createdAt))}</div>
    </div>
    ${table}${deltas}
    ${o.interpretation ? `<h2>Interpretation</h2><p>${esc(o.interpretation)}</p>` : ""}
    ${o.patientNote?.text ? `<h2>Note for the patient</h2><p>${esc(o.patientNote.text)}</p>` : ""}
    <div class="foot">
      Entered by ${esc(o.enteredByName || "-")}. Verified by ${esc(o.verifiedBy || "not yet verified")} ${esc(fmt(o.verifiedAt))}.${o.approval ? ` Approved by ${esc(o.approval.byName)} ${esc(fmt(o.approval.at))}.` : ""}${o.transmittedAt ? ` Released to the patient ${esc(fmt(o.transmittedAt))}.` : ""}<br>
      Reference ranges are those of the laboratory or the system defaults, which depend on the analyser and the population. A clinician interprets the result with the patient's history.
    </div>
  </body></html>`;
}

export function printLabReport(o: ReportOrder, orgName = ""): boolean {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return false;
  w.document.write(buildLabReportHtml(o, orgName));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  return true;
}
