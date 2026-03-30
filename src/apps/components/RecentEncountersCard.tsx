import React from "react";
import {
  CalendarDays,
  Droplets,
  Activity,
  TriangleAlert,
  ChevronRight,
  FileX2,
} from "lucide-react";

type EncounterItem = {
  id: string;
  date: string;
  title: string;
  encounterType: "outpatient" | "lab" | "emergency" | "cardiology";
  status: "completed" | "ongoing" | "attention";
  facility: string;
  provider?: string;
  summary: string;
};

type Props = {
  encounters: EncounterItem[];
  isLoading?: boolean;
  onViewAll: () => void;
  onViewDetails: (id: string) => void;
  onShare: (id: string) => void;
  onContinueCare: (id: string) => void;
};

const statusStyles = {
  completed: "bg-emerald-100 text-emerald-700",
  ongoing: "bg-amber-100 text-amber-700",
  attention: "bg-rose-100 text-rose-700",
};

const encounterIcons = {
  outpatient: CalendarDays,
  lab: Droplets,
  cardiology: Activity,
  emergency: TriangleAlert,
};

function EncounterSkeletonRow() {
  return (
    <div className="py-2 flex flex-col xl:flex-row bg-gray-100 xl:items-center gap-2 px-2 rounded-lg animate-pulse">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded-full bg-gray-200" />
          </div>

          <div className="h-3 w-32 rounded bg-gray-200 mb-2" />
          <div className="h-3 w-40 rounded bg-gray-200 mb-2" />
          <div className="h-3 w-full max-w-[260px] rounded bg-gray-200" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-8 w-24 rounded-xl bg-gray-200" />
        <div className="h-8 w-24 rounded-xl bg-gray-200" />
        <div className="h-8 w-24 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export function RecentEncountersCard({
  encounters,
  isLoading = false,
  onViewAll,
  onViewDetails,
  onShare,
  onContinueCare,
}: Props) {
  return (
    <div
      className={`flex-1 rounded-2xl border min-h-48 overflow-hidden ${
        !isLoading && encounters?.length === 0 ? "max-h-48" : ""
      } border-gray-200 bg-white py-3`}
    >
      <div className="flex items-center justify-between mb-2 px-4">
        <h2 className="text-[14px] font-bold text-gray-900">
          Recent Medical Visit
        </h2>

        {!isLoading && encounters?.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-sm font-semibold text-[#2F915C] hover:underline"
          >
            View All Encounters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="px-1 rounded-lg space-y-1">
          <EncounterSkeletonRow />
          <EncounterSkeletonRow />
          <EncounterSkeletonRow />
        </div>
      ) : encounters.length === 0 ? (
        <div className="px-4 py-1">
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-2 px-6">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-1">
              <FileX2 size={24} className="text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-900">
              No recent record
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Your recent encounters will appear here once they are available.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 px-1 rounded-lg space-y-1">
          {encounters.map((item) => {
            const Icon = encounterIcons[item.encounterType];
            const statusClass = statusStyles[item.status];

            return (
              <div
                key={item.id}
                className="py-2 flex flex-col xl:flex-row bg-gray-100 xl:items-center gap-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-1 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#2F915C]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <h3 className="text-[15px] font-semibold text-gray-900">
                        {item.title}
                      </h3>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                      >
                        {item.status === "attention"
                          ? "Attention Needed"
                          : item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      {item.provider ? `Visited ${item.provider}` : item.facility}
                    </div>

                    <div className="text-[10px] text-gray-500 mt-1">
                      {new Date(item.date).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      | {item.facility}
                    </div>

                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span className="truncate">{item.summary}</span>
                      <ChevronRight
                        size={14}
                        className="text-gray-400 flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onViewDetails(item.id)}
                    className="px-2 py-2 rounded-xl bg-[#148A90] text-white text-[10px] font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onShare(item.id)}
                    className="px-2 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-semibold text-gray-700"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => onContinueCare(item.id)}
                    className="px-2 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700"
                  >
                    Continue Care
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}