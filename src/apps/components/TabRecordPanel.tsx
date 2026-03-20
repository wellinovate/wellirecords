import { TAB_CONFIG } from "@/shared/utils/data";
import { Plus } from "lucide-react";

export function TabRecordPanel({
  tab,
  records,
  onAddRecord,
}: {
  tab: string;
  records: any[];
  onAddRecord: (tab: string) => void;
}) {
  const config = TAB_CONFIG[tab as keyof typeof TAB_CONFIG];

  return (
    <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#eef5ff]">
            {config?.title || tab}
          </h2>
          <p className="mt-1 text-sm text-[#7fa0c7]">
            Existing records under {tab.toLowerCase()}.
          </p>
        </div>

        {config?.actionLabel && (
          <button
            type="button"
            onClick={() => onAddRecord(tab)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#345f92] bg-[#102845] px-4 text-sm font-medium text-[#dbeafe]"
          >
            <Plus size={14} />
            {config.actionLabel}
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#29527f] bg-[#0b2140] px-4 py-10 text-center">
          <p className="text-base font-medium text-[#e8f1ff]">
            No {tab.toLowerCase()} records yet
          </p>
          <p className="mt-2 text-sm text-[#7fa0c7]">
            Click the button above to add the first record.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg bg-[#0d2443] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-[14px] font-semibold text-[#eef5ff]">
                  {item.title}
                </div>
                <div className="mt-1 text-[12px] text-[#7b9ac0]">
                  {item.subtitle}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#c8daf0]">{item.meta}</span>

                <button
                  type="button"
                  className="inline-flex h-8 items-center rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#e8f1ff] hover:bg-[#13345e]"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}