function RecordCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[22px] border border-[#DDE3EA] bg-[#F9FAFB] px-5 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#EAF1F6]" />

          <div className="min-w-0 space-y-2">
            <div className="h-5 w-40 rounded-md bg-[#E6EDF3]" />
            <div className="h-4 w-56 rounded-md bg-[#EDF2F7]" />
          </div>
        </div>

        <div className="h-7 w-20 rounded-full bg-[#E8F3EC]" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-md bg-[#EDF2F7]" />
          <div className="h-4 w-28 rounded-md bg-[#EDF2F7]" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-32 rounded-md bg-[#EDF2F7]" />
          <div className="h-4 w-24 rounded-md bg-[#EDF2F7]" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded-md bg-[#F1F5F9]" />
        <div className="h-4 w-4/5 rounded-md bg-[#F1F5F9]" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-44 rounded-md bg-[#EDF2F7]" />
        <div className="h-10 w-28 rounded-full bg-[#E7F1EE]" />
      </div>
    </div>
  );
}

export function HealthHistoryLoader({
  title,
  count = 6,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-[#DDE3EA] bg-gradient-to-r from-[#F8FBFA] to-[#F4F8FB] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF7F1]">
            <div className="h-5 w-5 rounded-full border-2 border-[#2F915C] border-t-transparent animate-spin" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1F2A37]">
              Loading {title.toLowerCase()}
            </p>
            <p className="text-sm text-[#6B7280]">
              Fetching patient records...
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: count }).map((_, index) => (
          <RecordCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}