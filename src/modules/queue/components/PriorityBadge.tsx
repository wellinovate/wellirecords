import type { QueuePriority } from "../types";

const priorityClasses: Record<QueuePriority, string> = {
  normal: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  urgent: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  emergency: "bg-red-500/15 text-red-300 border-red-500/30",
};

export const PriorityBadge = ({ priority }: { priority: QueuePriority }) => {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${priorityClasses[priority]}`}
    >
      {priority}
    </span>
  );
};
