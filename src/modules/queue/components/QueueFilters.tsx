type Props = {
  workflowStatus: string;
  source: string;
  onChange: (payload: { workflowStatus: string; source: string }) => void;
};

export const QueueFilters = ({ workflowStatus, source, onChange }: Props) => {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={workflowStatus}
        onChange={(e) => onChange({ workflowStatus: e.target.value, source })}
        className="rounded-xl border border-[#163761] bg-[#081b35] px-3 py-2 text-sm text-white outline-none"
      >
        <option value="">All Status</option>
        <option value="checked-in">Checked In</option>
        <option value="triage">Triage</option>
        <option value="waiting">Waiting</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="no-show">No Show</option>
      </select>

      <select
        value={source}
        onChange={(e) => onChange({ workflowStatus, source: e.target.value })}
        className="rounded-xl border border-[#163761] bg-[#081b35] px-3 py-2 text-sm text-white outline-none"
      >
        <option value="">All Sources</option>
        <option value="appointment">Appointment</option>
        <option value="walk-in">Walk-in</option>
      </select>
    </div>
  );
};
