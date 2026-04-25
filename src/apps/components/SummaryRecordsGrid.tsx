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
  variant = "light",
}: Props) {
  const isDark = variant === "dark";
  return (
    <div>
      <h2
        className={`mb-4 text-[22px] font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Health Record
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <RecordCardSkeleton key={index} />
            ))
          : records.map((item) => {
              const accent = getCategoryAccent(item.category);

              return (
                <Link
                  to="/patient/vault"
                  key={item.category}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-[1px] hover:shadow-md ${
                    isDark
                      ? "border-[#163761] text-white"
                      : "border-gray-200 bg-white text-black"
                  }`}
                  style={
                    isDark
                      ? {
                          background:
                            "radial-gradient(circle at 72% 18%, rgba(116,167,255,0.08) 0%, rgba(116,167,255,0.02) 22%, transparent 40%), linear-gradient(180deg, #0B1730 0%, #091427 100%)",
                        }
                      : undefined
                  }
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-[5px] ${accent.border}`}
                  />

                  <div className="mb-4 flex items-start justify-between pl-2">
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isDark ? "text-[#9FB3CF]" : "text-gray-400"
                        }`}
                      >
                        {formatLabel(item.category)}
                      </div>

                      <div
                        className={`mt-1 text-3xl font-black ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.recordCount}
                      </div>

                      <div
                        className={`text-sm ${
                          isDark ? "text-[#9FB3CF]" : "text-gray-400"
                        }`}
                      >
                        {item.recordCount === 1 ? "record" : "records"}
                      </div>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                        isDark
                          ? "border-[#163761] bg-[#0b2447]"
                          : `${accent.softBg} border-transparent`
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                  </div>

                  <div
                    className={`mb-3 pl-2 text-sm ${
                      isDark ? "text-[#D7E6FA]" : "text-gray-700"
                    }`}
                  >
                    {getCategorySummary(item)}
                  </div>

                  <div className="flex items-center justify-between pl-2">
                    <div
                      className={`text-[11px] ${
                        isDark ? "text-[#9FB3CF]" : "text-gray-400"
                      }`}
                    >
                      {item.lastUpdatedAt
                        ? `Updated ${new Date(
                            item.lastUpdatedAt,
                          ).toLocaleDateString()}`
                        : "No records yet"}
                    </div>

                    <button
                      className={`text-sm font-semibold ${accent.text}`}
                      type="button"
                    >
                      View
                    </button>
                  </div>
                </Link>
              );
            })}
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

const getCategoryAccent = (category: string) => {
  switch (category) {
    case "vitals":
      return {
        border: "bg-blue-500",
        softBg: "bg-blue-50",
        text: "text-blue-600",
      };

    case "medications":
      return {
        border: "bg-violet-500",
        softBg: "bg-violet-50",
        text: "text-violet-600",
      };

    case "allergies":
      return {
        border: "bg-emerald-600",
        softBg: "bg-emerald-50",
        text: "text-emerald-700",
      };

    case "diagnoses":
      return {
        border: "bg-red-500",
        softBg: "bg-red-50",
        text: "text-red-600",
      };

    case "lab_results":
      return {
        border: "bg-blue-500",
        softBg: "bg-blue-50",
        text: "text-blue-600",
      };

    case "immunizations":
      return {
        border: "bg-red-400",
        softBg: "bg-red-50",
        text: "text-red-500",
      };

    case "procedures":
      return {
        border: "bg-pink-500",
        softBg: "bg-pink-50",
        text: "text-pink-600",
      };

    default:
      return {
        border: "bg-gray-300",
        softBg: "bg-gray-50",
        text: "text-gray-600",
      };
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "vitals":
      return <TestTube size={18} className="text-blue-500" />;

    case "medications":
      return <Pill size={18} className="text-violet-500" />;

    case "allergies":
      return <ShieldAlert size={18} className="text-emerald-600" />;

    case "lab_results":
      return <TestTube size={18} className="text-blue-500" />;

    case "diagnoses":
      return <HeartPulse size={18} className="text-red-500" />;

    case "immunizations":
      return <HeartPulse size={18} className="text-red-400" />;

    case "procedures":
      return <Scissors size={18} className="text-pink-500" />;

    default:
      return <HeartPulse size={18} className="text-gray-400" />;
  }
};