import type { QueueSource } from "../types";

export const SourceBadge = ({ source }: { source: QueueSource }) => {
  const classes =
    source === "appointment"
      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
      : "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}>
      {source}
    </span>
  );
};
