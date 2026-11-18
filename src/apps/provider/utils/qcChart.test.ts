import test from "node:test";
import assert from "node:assert/strict";
import { qcChartPoints, sdLineY } from "./qcChart.ts";

test("mean sits mid-height, high values go up, and values are clamped", () => {
  const mid = sdLineY(0);
  const pts = qcChartPoints([{ z: 0, status: "pass" }, { z: 2, status: "warn" }, { z: -9, status: "fail" }]);
  assert.equal(pts[0].y, mid);
  assert.ok(pts[1].y < mid);
  assert.ok(pts[2].y > mid);
  assert.ok(pts[2].y <= sdLineY(-3.5) + 0.001);
  assert.ok(pts[0].x < pts[2].x);
});

test("one point is centred", () => {
  assert.equal(qcChartPoints([{ z: 1, status: "pass" }], 560)[0].x, 280);
});
