import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Droplets,
  Activity,
  TriangleAlert,
  ChevronRight,
  FileX2,
  Eye,
  Share2,
  ArrowRightCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import EncounterShareModal from "./shared/EncounterShareModal";

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

type ShareOption = "provider" | "caregiver" | "secure-link" | "qr-code" | "pdf";

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
  variant,
  onContinueCare,
}: Props) {
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(
    null,
  );

  const selectedEncounter = useMemo(
    () => encounters?.find((e) => e.id === selectedEncounterId),
    [encounters, selectedEncounterId],
  );

  const openShareModal = (id: string) => {
    setSelectedEncounterId(id);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setSelectedEncounterId(null);
  };

  const handleShareOption = (option: ShareOption, encounterId: string) => {
    const encounter = encounters.find((e) => e.id === encounterId);
    if (!encounter) return;

    switch (option) {
      case "provider":
        navigate(`/patient/journeys/${encounterId}/share/provider`);
        break;

      case "caregiver":
        navigate(`/patient/journeys/${encounterId}/share/caregiver`);
        break;

      case "secure-link":
        navigate(`/patient/journeys/${encounterId}/share/link`);
        break;

      case "qr-code":
        navigate(`/patient/journeys/${encounterId}/share/qr`);
        break;

      case "pdf":
        navigate(`/patient/journeys/${encounterId}/summary/pdf`);
        break;

      default:
        break;
    }

    onShare(encounterId);
    closeShareModal();
  };

  return (
    <>
      <div
        className={`flex-1 rounded-2xl border min-h-48 overflow-hidden ${
          !isLoading && encounters?.length === 0 ? "max-h-48" : ""
        }  bg-white py-3 ${
          variant === "dark"
            ? "border border-[#163761] text-white"
            : "border border-gray-200 bg-white text-black"
        } `}
        style={
          variant === "dark"
            ? {
                background:
                  "radial-gradient(circle at 72% 18%, rgba(116,167,255,0.08) 0%, rgba(116,167,255,0.02) 22%, transparent 40%), linear-gradient(180deg, #0B1730 0%, #091427 100%)",
                color: "#ffffff",
              }
            : { background: "#ffffff" }
        }
      >
        <div className="flex items-center justify-between mb-2 px-4">
          <h2 className="text-[14px] font-bold text-gray-900">
            Recent Medical Visit
          </h2>

          {!isLoading && encounters?.length > 0 && (
            <Link
              to="/patient/journeys"
              className="text-sm font-semibold text-[#2F915C] hover:underline"
            >
              View All Medical Treatment
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="px-1 rounded-lg space-y-1">
            <EncounterSkeletonRow />
            <EncounterSkeletonRow />
          </div>
        ) : encounters?.length === 0 ? (
          <div className="px-4 py-1">
            <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-2 px-6">
              <div
                className={`w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-1`}
              >
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
          <div
  className={`rounded-lg px-1 space-y-1 ${
    variant === "dark" ? "divide-y divide-[#163761]" : "divide-y divide-gray-100"
  }`}
>
            {encounters?.map((item) => {
              const Icon = encounterIcons[item?.encounterType];
              const statusClass = statusStyles[item?.status];

              return (
  <div
    key={item?.id}
    className={`flex flex-col gap-2 rounded-lg px-2 py-2 transition-colors xl:flex-row xl:items-center ${
      variant === "dark"
        ? "border border-[#163761] text-white hover:border-[#22528d]"
        : "border border-gray-200 bg-white text-black hover:bg-gray-50"
    }`}
    style={
      variant === "dark"
        ? {
            background:
              "radial-gradient(circle at 72% 18%, rgba(116,167,255,0.08) 0%, rgba(116,167,255,0.02) 22%, transparent 40%), linear-gradient(180deg, #0B1730 0%, #091427 100%)",
          }
        : undefined
    }
  >
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
          variant === "dark"
            ? "border border-[#163761] bg-[#0b2447]"
            : "bg-slate-50"
        }`}
      >
        <Icon size={18} className="text-[#2F915C]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className={`text-xs ${
              variant === "dark" ? "text-[#9FB3CF]" : "text-gray-500"
            }`}
          >
            {new Date(item?.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <h3
            className={`text-[15px] font-semibold ${
              variant === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {item?.title}
          </h3>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
          >
            {item?.status === "attention"
              ? "Attention Needed"
              : item?.status.charAt(0).toUpperCase() + item?.status.slice(1)}
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <div
              className={`text-xs ${
                variant === "dark" ? "text-[#D7E6FA]" : "text-gray-600"
              }`}
            >
              {item?.provider ? `Visited ${item?.provider}` : item?.facility}
            </div>

            <div
              className={`mt-1 text-[10px] ${
                variant === "dark" ? "text-[#9FB3CF]" : "text-gray-500"
              }`}
            >
              {new Date(item?.date).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              | {item?.facility}
            </div>

            <div
              className={`mt-1 flex items-center gap-1 text-xs ${
                variant === "dark" ? "text-[#9FB3CF]" : "text-gray-500"
              }`}
            >
              <span className="truncate">{item?.summary}</span>
              <ChevronRight
                size={14}
                className={`flex-shrink-0 ${
                  variant === "dark" ? "text-[#9FB3CF]" : "text-gray-400"
                }`}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => navigate("/patient/journeys")}
              title="View Details"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#148A90] text-white hover:brightness-95"
            >
              <Eye size={16} />
            </button>

            <button
              onClick={() => openShareModal(item?.id)}
              title="Share securely"
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                variant === "dark"
                  ? "border border-[#163761] bg-[#0b2447] text-[#D7E6FA] hover:bg-[#102a4d]"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={() => navigate("/patient/find-care")}
              title="Continue Care"
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                variant === "dark"
                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <ArrowRightCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
            })}
          </div>
        )}
      </div>

      <EncounterShareModal
        open={shareModalOpen}
        encounterId={selectedEncounterId}
        onClose={closeShareModal}
        onSelect={handleShareOption}
      />
    </>
  );
}
