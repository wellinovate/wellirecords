import test from "node:test";
import assert from "node:assert/strict";
import { composeReason, reasonCategory, turnaroundByTest, stageWaits, rejectionBreakdown } from "./labTurnaround.ts";

const at = (m: number) => new Date(Date.UTC(2026, 10, 18, 8, m)).toISOString();

test("reasons are composed and read back", () => {
  assert.equal(composeReason("Haemolysed sample", " shaken in transit "), "Haemolysed sample: shaken in transit");
  assert.equal(composeReason("Clotted sample", ""), "Clotted sample");
  assert.equal(reasonCategory("Haemolysed sample: shaken"), "Haemolysed sample");
  assert.equal(reasonCategory("tube broke"), "Other");
  assert.equal(reasonCategory(undefined), "Other");
});

test("turnaround by test uses median, p90 and share over target", () => {
  const mk = (testName: string, mins: number) => ({ testName, status: "verified", createdAt: at(0), verifiedAt: at(mins) });
  const r = turnaroundByTest([mk("FBC", 30), mk("FBC", 50), mk("FBC", 90), mk("FBC", 40), mk("Malaria", 20), { testName: "FBC", status: "processing", createdAt: at(0) }]);
  const fbc = r.find((x) => x.testName === "FBC")!;
  assert.equal(fbc.count, 4);
  assert.equal(fbc.median, 40);
  assert.equal(fbc.p90, 90);
  assert.equal(fbc.overTarget, 25);
  assert.equal(r[0].testName, "FBC");
});

test("stage waits come from the stage history", () => {
  const w = stageWaits([
    { createdAt: at(0), stageHistory: [{ status: "collected", at: at(10) }, { status: "received", at: at(25) }, { status: "processing", at: at(30) }] },
    { createdAt: at(0), stageHistory: [{ status: "collected", at: at(20) }] },
  ]);
  assert.deepEqual(w.find((x) => x.stage === "Waiting for collection"), { stage: "Waiting for collection", avg: 15, n: 2 });
  assert.equal(w.find((x) => x.stage === "Transport to the lab")!.avg, 15);
});

test("rejections are counted by standard reason", () => {
  const b = rejectionBreakdown([
    { status: "rejected", rejectionReason: "Haemolysed sample: x" },
    { status: "rejected", rejectionReason: "Haemolysed sample" },
    { status: "rejected", rejectionReason: "dropped" },
    { status: "cancelled", rejectionReason: "Duplicate request" },
  ]);
  assert.deepEqual(b, [{ reason: "Haemolysed sample", count: 2 }, { reason: "Other", count: 1 }]);
});
