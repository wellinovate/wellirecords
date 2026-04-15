import type { WorkflowStatus } from "../types";

const statusClasses: Record<WorkflowStatus, string> = {
  "checked-in": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  triage: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  waiting: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "in-progress": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  "no-show": "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const StatusBadge = ({ status }: { status: WorkflowStatus }) => {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
};
