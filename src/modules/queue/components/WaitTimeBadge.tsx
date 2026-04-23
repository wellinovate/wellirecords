import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

type Props = {
  from?: string | Date | null;
};

function getWaitLabel(from?: string | Date | null) {
  if (!from) return "—";

  const start = new Date(from).getTime();

  if (Number.isNaN(start)) return "—";

  const diffMs = Date.now() - start;
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

function getWaitTone(from?: string | Date | null) {
  if (!from) return "border-[#274d7e] bg-[#102a4d] text-[#D7E6FA]";

  const start = new Date(from).getTime();
  if (Number.isNaN(start)) return "border-[#274d7e] bg-[#102a4d] text-[#D7E6FA]";

  const totalMinutes = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60)));

  if (totalMinutes >= 120) {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (totalMinutes >= 60) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }

  return "border-[#274d7e] bg-[#102a4d] text-[#D7E6FA]";
}

export function WaitTimeBadge({ from }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((v) => v + 1);
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const label = useMemo(() => getWaitLabel(from), [from]);
  const tone = useMemo(() => getWaitTone(from), [from]);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${tone}`}
    >
      <Clock3 size={12} />
      Wait: {label}
    </span>
  );
}