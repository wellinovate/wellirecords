export const RecordCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-gray-200 mb-3" />
          <div className="h-8 w-12 rounded bg-gray-200 mb-2" />
          <div className="h-3 w-16 rounded bg-gray-200" />
        </div>

        <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>

      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-3 w-10 rounded bg-gray-200" />
      </div>
    </div>
  );
};