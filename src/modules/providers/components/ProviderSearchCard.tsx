import { Building2, MapPin, Stethoscope, Video } from "lucide-react";
import type { ProviderSearchItem } from "../types";

type Props = {
  item: ProviderSearchItem;
  onSelect: (item: ProviderSearchItem) => void;
};

export function ProviderSearchCard({ item, onSelect }: Props) {
  const isIndividualProvider =
    item.organizationType === "individaul_provider";

  return (
    <div className="rounded-2xl border border-[#163761] bg-[#0b2447]/70 p-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {item.organizationName || "Unknown Provider"}
            </h3>

            {item.fullName ? (
              <p className="text-sm text-cyan-300">
                {isIndividualProvider
                  ? "Individual Provider"
                  : `Contact: ${item.fullName}`}
              </p>
            ) : null}
          </div>

          <div className="space-y-1 text-sm text-[#D7E6FA]">
            <p className="flex items-center gap-2">
              <Building2 size={14} className="text-[#9FB3CF]" />
              {item.organizationType}
            </p>

            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-[#9FB3CF]" />
              {item.organization?.address || "No address yet"}
            </p>

            {item.specialty ? (
              <p className="flex items-center gap-2">
                <Stethoscope size={14} className="text-[#9FB3CF]" />
                {item.specialty}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              {item.telemedicineAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">
                  <Video size={12} />
                  Telemedicine
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelect(item)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}