import { getMinutesDiff } from "@/shared/utils/time";

export const WaitTimeBadge = ({ from }: { from?: string | null }) => {
  const mins = getMinutesDiff(from);

  let classes = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (mins >= 15) classes = "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (mins >= 30) classes = "bg-red-500/15 text-red-300 border-red-500/30";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}>
      {mins}m waiting
    </span>
  );
};
