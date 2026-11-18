export interface ChartPoint { x: number; y: number; z: number; status: string }

/** Maps z scores to SVG coordinates for a Levey-Jennings chart (mean in the middle, +-3 SD at the edges). */
export function qcChartPoints(runs: { z: number; status: string }[], width = 560, height = 220, pad = 24): ChartPoint[] {
  const n = runs.length;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  return runs.map((r, i) => {
    const clamped = Math.max(-3.5, Math.min(3.5, r.z));
    return {
      x: pad + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW),
      y: pad + innerH / 2 - (clamped / 3.5) * (innerH / 2),
      z: r.z,
      status: r.status,
    };
  });
}

export const sdLineY = (sd: number, height = 220, pad = 24) => pad + (height - pad * 2) / 2 - (sd / 3.5) * ((height - pad * 2) / 2);
