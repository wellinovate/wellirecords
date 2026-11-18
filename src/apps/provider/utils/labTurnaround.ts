export const REJECT_REASONS = [
  "Haemolysed sample",
  "Clotted sample",
  "Not enough sample",
  "Wrong tube or container",
  "Unlabelled or mislabelled",
  "Sample too old or delayed",
  "Leaked or contaminated",
  "Other",
];

export const CANCEL_REASONS = ["Patient did not come", "Duplicate request", "Cancelled by the requesting doctor", "Other"];

export const composeReason = (label: string, note: string) => (note.trim() ? `${label}: ${note.trim()}` : label).slice(0, 300);

/** The standard reason a stored reason text starts with, or "Other". */
export const reasonCategory = (reason?: string): string => {
  const r = (reason || "").trim().toLowerCase();
  for (const label of [...REJECT_REASONS, ...CANCEL_REASONS]) {
    if (label !== "Other" && r.startsWith(label.toLowerCase())) return label;
  }
  return "Other";
};

const MIN = 60000;
const pct = (sorted: number[], p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)] : null);

export interface TestTat {
  testName: string;
  count: number;
  median: number;
  p90: number;
  overTarget: number;
}

/** Minutes from the request to verification, by test. Orders with odd dates are left out. */
export function turnaroundByTest(orders: any[], targetMinutes = 60): TestTat[] {
  const byTest = new Map<string, number[]>();
  for (const o of orders) {
    if (!["verified", "released", "delivered"].includes(o.status)) continue;
    const start = new Date(o.createdAt || o.orderedAt || 0).getTime();
    const end = new Date(o.verifiedAt || 0).getTime();
    if (!(start > 0 && end > start)) continue;
    const mins = Math.round((end - start) / MIN);
    if (mins > 43200) continue;
    const key = o.testName || "Unnamed test";
    byTest.set(key, [...(byTest.get(key) || []), mins]);
  }
  return [...byTest.entries()]
    .map(([testName, vals]) => {
      const s = [...vals].sort((a, b) => a - b);
      return {
        testName,
        count: s.length,
        median: pct(s, 50) as number,
        p90: pct(s, 90) as number,
        overTarget: Math.round((s.filter((v) => v > targetMinutes).length / s.length) * 100),
      };
    })
    .sort((a, b) => b.count - a.count);
}

const STAGE_LABEL: Record<string, string> = {
  collected: "Waiting for collection",
  received: "Transport to the lab",
  processing: "Waiting to start",
  "quality-control": "Testing",
  verified: "Entry and verification",
};

/** Average minutes spent before each stage was reached, from the order's own stage history. */
export function stageWaits(orders: any[]): { stage: string; avg: number; n: number }[] {
  const sums = new Map<string, { total: number; n: number }>();
  for (const o of orders) {
    const hist = [...(o.stageHistory || [])].filter((h: any) => h?.at).sort((a: any, b: any) => +new Date(a.at) - +new Date(b.at));
    let prev = new Date(o.createdAt || o.orderedAt || hist[0]?.at || 0).getTime();
    for (const h of hist) {
      const t = new Date(h.at).getTime();
      const label = STAGE_LABEL[h.status];
      if (label && t >= prev && prev > 0) {
        const cur = sums.get(label) || { total: 0, n: 0 };
        const mins = (t - prev) / MIN;
        if (mins < 43200) sums.set(label, { total: cur.total + mins, n: cur.n + 1 });
      }
      prev = t;
    }
  }
  return Object.values(STAGE_LABEL)
    .filter((l) => sums.has(l))
    .map((stage) => ({ stage, avg: Math.round(sums.get(stage)!.total / sums.get(stage)!.n), n: sums.get(stage)!.n }));
}

export function rejectionBreakdown(orders: any[]): { reason: string; count: number }[] {
  const m = new Map<string, number>();
  for (const o of orders) {
    if (o.status !== "rejected") continue;
    const c = reasonCategory(o.rejectionReason);
    m.set(c, (m.get(c) || 0) + 1);
  }
  return [...m.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}
