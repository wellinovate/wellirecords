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
  <div className="group overflow-hidden rounded-[24px] border border-[#D9E6F7] bg-gradient-to-br from-white via-[#FDFEFF] to-[#EEF4F p-4 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-[#D8E5F5]">
          <img
            src={
              item.avatar ||
              item.profileImage ||
              "/images/doctors/default-doctor.jpg"
            }
            alt={item.fullName || item.organizationName || "Provider"}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate text-[18px] font-semibold text-[#163761]">
                {item.fullName || item.organizationName || "Unknown Provider"}
              </h3>

              <p className="mt-0.5 text-sm text-[#7A8CA5]">
                {isIndividualProvider
                  ? "Independent Provider"
                  : item.organizationName || "Healthcare Provider"}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#1D8348]">
              Available
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
          <Stethoscope size={15} className="text-[#4F8FEF]" />
          <span className="truncate">
            {item.specialty || item.organizationType || "General Practice"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
          <MapPin size={15} className="text-[#4F8FEF]" />
          <span className="truncate">
            {item.organization?.address || item.address || "Location unavailable"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
          <Building2 size={15} className="text-[#4F8FEF]" />
          <span className="truncate">
            {item.organizationName || item.organization?.name || "Independent practice"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#315DA8]">
          {isIndividualProvider ? "Personal Practice" : "Facility Based"}
        </span>

        {item.telemedicineAvailable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EAFBF3] px-3 py-1 text-xs font-medium text-[#1D8348]">
            <Video size={12} />
            Telemedicine
          </span>
        )}

        {item.specialty && (
          <span className="rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-medium text-[#6B7280]">
            Specialist
          </span>
        )}
      </div>

      <div className="mt-5 border-t border-[#E7EEF8] pt-4">
        <button
          onClick={() => onSelect(item)}
          className="w-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition hover:brightness-105"
        >
          Book Appointment
        </button>
      </div>
    </div>
  </div>
);
}