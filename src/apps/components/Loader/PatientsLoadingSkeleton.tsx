const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-[#123055]/60 ${className}`}
  />
);

export default function PatientsLoadingSkeleton() {
  return (
    <div className="min-h-[40vh] bg-[#06162d] px-5 py-5 text-white">
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-2xl border border-[#163761] bg-[#081b35] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          
          {/* Header */}
          <div className="border-b border-[#163761] px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row xl:items-start xl:justify-between">
              
              <div>
                <Skeleton className="h-8 w-40" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Search + filters */}
            <div className="mt-5 flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Table */}
          <div className="px-4 py-4">
            <div className="overflow-hidden rounded-xl border border-[#173a63] bg-[#0a1d39]">
              
              {/* Table Head */}
              <div className="grid grid-cols-8 gap-4 px-4 py-3 border-b border-[#173a63]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-20" />
                ))}
              </div>

              {/* Rows */}
              <div>
                {Array.from({ length: 8 }).map((_, row) => (
                  <div
                    key={row}
                    className="grid grid-cols-8 gap-4 px-4 py-4 border-b border-[#132f52]"
                  >
                    {/* Patient */}
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>

                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />

                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>

                    <Skeleton className="h-5 w-16 rounded-full" />

                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-10 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>

                    <Skeleton className="h-3 w-24" />

                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}