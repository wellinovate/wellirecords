import React from "react";
import {
  HeartPulse,
  Pill,
  ShieldAlert,
  TestTube,
  Stethoscope,
  Syringe,
  Scissors,
} from "lucide-react";
import { RecordCardSkeleton } from "../patient/components/RecordCardSkeleton ";
import { Link } from "react-router-dom";

type RecordCategory = {
  category: string;
  recordCount: number;
  lastUpdatedAt: string | null;
  summaryMetric: Record<string, any>;
};

type Props = {
  loading: boolean;
  records: RecordCategory[];
  onViewCategory: (category: string) => void;
};

export function SummaryRecordsGrid({
  loading,
  records,
  onViewCategory,
}: Props) {
  return (
    <div>
      <h2 className="text-[22px] font-bold text-gray-900 mb-4">Health Record</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <RecordCardSkeleton key={index} />
            ))
          : records.map((item) => (
              <Link to="/patient/vault"
                key={item.category}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition cursor-pointer"
                // onClick={() => onViewCategory(item.category)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {formatLabel(item.category)}
                    </div>
                    <div className="text-3xl font-black text-gray-900 mt-1">
                      {item.recordCount}
                    </div>
                    <div className="text-sm text-gray-400">
                      {item.recordCount === 1 ? "record" : "records"}
                    </div>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-3">
                  {getCategorySummary(item)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-gray-400">
                    {item.lastUpdatedAt
                      ? `Updated ${new Date(item.lastUpdatedAt).toLocaleDateString()}`
                      : "No records yet"}
                  </div>

                  <button 
                    className="text-sm font-semibold text-[#2F915C]"
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   onViewCategory(item.category);
                    // }}
                  >
                    View
                  </button>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}

const formatLabel = (label: string) =>
  label.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c?.toUpperCase());

const getCategorySummary = (item: RecordCategory) => {
  const summary = item.summaryMetric || {};

  switch (item.category) {
    case "allergies":
      return item.recordCount > 0
        ? `Latest allergen: ${summary.latestAllergen || "N/A"}`
        : "No allergy records yet";

    case "medications":
      return item.recordCount > 0
        ? `Latest medication: ${summary.latestMedication || "N/A"}`
        : "No medication records yet";

    case "vitals":
      return item.recordCount > 0
        ? `Total vital entries: ${item.recordCount}`
        : "No vital records yet";

    case "lab_results":
      return item.recordCount > 0
        ? "Recent result available"
        : "No lab results yet";

    case "diagnoses":
      return item.recordCount > 0
        ? "Diagnosis records available"
        : "No diagnosis records yet";

    case "immunizations":
      return item.recordCount > 0
        ? "Immunization history available"
        : "No immunization records yet";

    case "procedures":
      return item.recordCount > 0
        ? "Procedure history available"
        : "No procedure records yet";

    default:
      return "No summary available";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "vitals":
      return <HeartPulse size={18} className="text-rose-500" />;
    case "medications":
      return <Pill size={18} className="text-blue-500" />;
    case "allergies":
      return <ShieldAlert size={18} className="text-amber-500" />;
    case "lab_results":
      return <TestTube size={18} className="text-violet-500" />;
    case "diagnoses":
      return <Stethoscope size={18} className="text-emerald-600" />;
    case "immunizations":
      return <Syringe size={18} className="text-teal-500" />;
    case "procedures":
      return <Scissors size={18} className="text-slate-500" />;
    default:
      return <HeartPulse size={18} className="text-gray-400" />;
  }
};