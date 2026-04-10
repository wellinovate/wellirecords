import { FirstRecordWizard } from "@/apps/patient/components/FirstRecordWizard";
import { getUsersRecords } from "@/shared/utils/utilityFunction";
import { ArrowLeft, Search, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Pill,
  Activity,
  Syringe,
  FlaskConical,
  AlertCircle,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { HealthHistoryLoader } from "./Loader/HealthHistoryLoader";

export function formatDate(value?: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
}

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!value && value !== 0) return null;

  return (
    <p className="text-sm text-[#7B8BA3]">
      <span className="font-medium text-[#8B9BB3]">{label}:</span> {value}
    </p>
  );
}

export function RecordShell({
  icon,
  title,
  subtitle,
  status,
  metaLeft,
  metaRight,
  footerLeft,
  actionLabel = "View Details",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: string;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  footerLeft?: React.ReactNode;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[#DDE3EA] bg-[#F9FAFB] px-5 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF7F1] text-[#2F915C]">
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-[22px] font-semibold leading-tight text-[#1F2A37] truncate">
            Lab Results
            </h3>
            {subtitle && (
              <p className="mt-1 text-base text-[#667085]">{subtitle}</p>
            )}
          </div>
        </div>

        {status && (
          <span className="shrink-0 rounded-full bg-[#E7F7EF] px-3 py-1 text-sm font-semibold text-[#22A06B]">
            {status}
          </span>
        )}
      </div>

      {(metaLeft || metaRight) && (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>{metaLeft}</div>
          <div>{metaRight}</div>
        </div>
      )}

      {children && <div className="mt-4 space-y-2">{children}</div>}

      {(footerLeft || actionLabel) && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#7B8BA3]">{footerLeft}</div>

          <button
            type="button"
            className="inline-flex items-center justify-center self-start rounded-full bg-[#E7F1EE] px-4 py-2 text-sm font-semibold text-[#138A72] transition hover:bg-[#dcebe6]"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}



export function LabResult({ labResults }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [record, setRecord] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return record.filter((item) => {
      const hasLabData = item.testName;

      if (!hasLabData) return false;
      if (!q) return true;

      return [
        item.testName,
        item.category,
        item.specimen,
        item.resultValue,
        item.unit,
        item.interpretation,
        item.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [search]);

  const renderRecordCard = (item: any) => {
    return (
      <RecordShell
        key={item.id}
        icon={<FlaskConical size={18} />}
        title={item.testName}
        subtitle={
          [item.resultValue, item.unit].filter(Boolean).join(" ") ||
          "Lab result"
        }
        status={item.interpretation || "Completed"}
        metaLeft={
          <>
            <InfoRow label="Resulted" value={formatDate(item.resultedAt)} />
            <InfoRow label="Category" value={item.category} />
          </>
        }
        metaRight={
          <>
            <InfoRow label="Specimen" value={item.specimen} />
            <InfoRow label="Interpretation" value={item.interpretation} />
          </>
        }
        footerLeft={item.notes || "Lab history entry"}
        actionLabel="View Result"
      />
    );
  };

  return (
    <div className="animate-fade-in">
      {wizardOpen && <FirstRecordWizard onClose={() => setWizardOpen(false)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="mb-4  top-10 left-20 z-50 bg-gray-100 px-5 rounded-lg"></div>
          <h1 className=" font-display text-xl font-bold">Lab Results</h1>
        </div>

        {/* <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9ca3af" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-light w-full"
            style={{ paddingLeft: "2.5rem" }}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </div> */}

        <button
          className="btn btn-patient gap-2"
          onClick={() => setWizardOpen(true)}
        >
          <UploadCloud size={16} />
          Upload New
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <HealthHistoryLoader title="Lab Results" />
        ) : filteredRecords.length === 0 ? (
          <div className="card-patient p-8 text-center">
            <p className="font-semibold" style={{ color: "#5a7a63" }}>
              No records found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredRecords.map((item) => renderRecordCard(item))}
          </div>
        )}
      </div>
    </div>
  );
}
