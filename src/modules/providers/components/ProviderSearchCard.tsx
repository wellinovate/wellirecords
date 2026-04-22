import { Building2, MapPin, Stethoscope, Video } from "lucide-react";
import type { ProviderSearchItem } from "../types";
import { health_companion_image, hopistal } from "@/assets";

type Props = {
  item: ProviderSearchItem;
  onSelect: (item: ProviderSearchItem) => void;
};

export function ProviderSearchCard({ item, onSelect }: Props) {
  const isIndividualProvider =
    item.organizationType === "individaul_provider";

  const imageSrc =
    item.avatar ||
    item.profileImage ||
    "/images/doctors/default-doctor.jpg";

  const title = item.fullName || item.organizationName || "Unknown Provider";

  const subtitle = isIndividualProvider
    ? "Independent Provider"
    : item.organizationName || "Healthcare Provider";

  return (
    <div className="group overflow-hidden rounded-[28px] border border-[#D9E6F7] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
      <div className="flex h-full flex-col cursor-pointer">
        {/* Top image section */}
        <div className="relative h-[100px] w-full overflow-hidden bg-[#EEF4FF]">
          <img
            // src={imageSrc}
            src={health_companion_image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute left-4 top-4">
            <span className="inline-flex shrink-0 items-center rounded-full bg-[#ECFDF3] px-3 py-1 text-[11px] font-semibold text-[#1D8348] shadow-sm">
              Available
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col px-1 py-3">
          {/* Centered heading like the reference image */}
          <div className="text-center w-full px-3 flex items-center justify-between">
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#163761]">
              {title}
            </h3>

            <p className=" flex items-center gap-1  max-w-[260px] text-[16px] font-bold leading-8 text-[#4F6480]">
              <Building2
                size={16}
                className="mt-0.5 shrink-0 text-[#4F8FEF]"
              />
              {subtitle}
            </p>
          </div>

          {/* Existing content kept, just reorganized */}
          <div className="mt- space-y- rounded-[20px] border border-[#E7EEF8] bg-[#F8FBFF] p-2">
            <div className="flex items-start gap-2 text-sm text-[#5B6B7A]">
              <Stethoscope
                size={16}
                className="mt-0.5 shrink-0 text-[#4F8FEF]"
              />
              <span className="leading-6">
                {item.specialty || item.organizationType || "General Practice"}
              </span>
            </div>
            
            <div className="flex items-start gap-2 text-sm text-[#5B6B7A]">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#4F8FEF]" />
              <span className="leading-6">
                {item.organization?.address ||
                  item.address ||
                  "Location unavailable"}
              </span>
            </div>


            
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
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

          <div className="mt-2 pt-">
            <button
              onClick={() => onSelect(item)}
              className="w-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition hover:brightness-105"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}