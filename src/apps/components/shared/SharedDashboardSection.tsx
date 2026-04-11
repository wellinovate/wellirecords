import { EncounterItem } from "@/shared/utils/utilityFunction";
import { DashboardAlertItem, DashboardAlerts } from "../DashboardAlerts";
import { RecentEncountersCard } from "../RecentEncountersCard";
import { SummaryRecordsGrid } from "../SummaryRecordsGrid";

type SharedDashboardSectionProps = {
  alerts: DashboardAlertItem[];
  recentEncounters: EncounterItem[];
  recordList: SummaryRecordItem[];
  loading?: boolean;
  routeBase: string;
  navigate: (to: string) => void;
  onShareEncounter?: (id: string) => void;
  onContinueCare?: (id: string) => void;
};

export function SharedDashboardSection({
  alerts,
  recentEncounters,
  recordList,
  loading,
  routeBase,
  navigate,
  onShareEncounter,
  onContinueCare,
}: SharedDashboardSectionProps) {
  console.log("🚀 ~ SharedDashboardSection ~ recentEncounters:", recentEncounters)
  return (
    <div className=" w-full ">
      <div className="flex lg:flex-row flex-col gap-4 w-full">
        <DashboardAlerts alerts={alerts} onNavigate={navigate} />

        <RecentEncountersCard
          encounters={recentEncounters}
          isLoading={loading}
          onViewAll={() => navigate(`${routeBase}/encounters`)}
          onViewDetails={(id) => navigate(`${routeBase}/encounters/${id}`)}
          onShare={onShareEncounter}
          onContinueCare={onContinueCare}
        />
      </div>

      <SummaryRecordsGrid
        loading={loading}
        records={recordList}
        onViewCategory={(category) =>
          navigate(`${routeBase}/records/${category}`)
        }
      />
    </div>
  );
}