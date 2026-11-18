import test from "node:test";
import assert from "node:assert/strict";
import { buildAuditTrail } from "./labAuditTrail.ts";

test("merges stages, entry, review and note in time order", () => {
  const t = buildAuditTrail({
    stageHistory: [
      { status: "collected", at: "2026-11-18T08:00:00Z", byName: "Ada" },
      { status: "verified", at: "2026-11-18T10:00:00Z", byName: "Bayo" },
    ],
    enteredAt: "2026-11-18T09:00:00Z",
    enteredByName: "Bayo",
    reviewLog: [{ decision: "approve", at: "2026-11-18T11:00:00Z", byName: "Dr Eze", comment: "OK" }],
    patientNote: { at: "2026-11-18T09:30:00Z", byName: "Ada", text: "Fast next time" },
  });
  assert.deepEqual(t.map((e) => e.what), [
    "Sample collected", "Result entered", "Note for the patient saved", "Result verified", "Approved by senior review",
  ]);
  assert.equal(t[4].who, "Dr Eze");
  assert.equal(t[4].detail, "OK");
});

test("handles an order with no history", () => {
  assert.deepEqual(buildAuditTrail({}), []);
  assert.deepEqual(buildAuditTrail({ stageHistory: [{ status: "x", at: "not a date" }] }), []);
});
