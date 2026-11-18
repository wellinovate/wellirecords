import test from "node:test";
import assert from "node:assert/strict";
import { buildLabReportHtml } from "./printLabReport.ts";

test("report escapes values and marks an unverified result as a draft", () => {
  const html = buildLabReportHtml({
    patientName: "<b>Ada</b>", testName: "FBC", status: "quality-control",
    results: [{ code: "hb", name: "Haemoglobin", type: "numeric", unit: "g/dL", value: 6.5, flag: "LL", refText: "13.0 - 17.0 g/dL" }],
  });
  assert.ok(!html.includes("<b>Ada</b>"));
  assert.ok(html.includes("&lt;b&gt;Ada"));
  assert.ok(html.includes("DRAFT"));
  assert.ok(html.includes("Critical low"));
});

test("a verified report has no draft banner", () => {
  const html = buildLabReportHtml({ patientName: "Ada", testName: "FBC", status: "verified", verifiedBy: "J. Doe", measuredValue: "x" });
  assert.ok(!html.includes("DRAFT"));
  assert.ok(html.includes("J. Doe"));
});
