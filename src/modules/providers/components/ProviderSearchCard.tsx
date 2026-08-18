import {
  Building2,
  Copy,
  Check,
  MapPin,
  Stethoscope,
  Video,
  FlaskConical,
  Pill,
  Eye,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useState, type MouseEvent } from "react";
import type { ProviderSearchItem } from "../types";
import {
  hopistal,
  pharmacies,
  diagonize,
  telehealth,
  doctorsignup,
} from "@/assets";

type Props = {
  item: ProviderSearchItem;
  onSelect: (item: ProviderSearchItem) => void;
};

// ─── Helpers for normalization ───────────────────────────────────────────────

function toTitleCase(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.toUpperCase() === "CMD" || word.toUpperCase() === "MD") {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

const ROLE_DICTIONARY: Record<string, string> = {
  cmd: "Chief Medical Director (CMD)",
  "chief medical director": "Chief Medical Director (CMD)",
  "medical director": "Medical Director",
  "managing director": "Managing Director",
  pharmacist: "Lead Pharmacist",
  "head pharmacist": "Head Pharmacist",
  caregiver: "Registered Nurse",
  nurse: "Registered Nurse",
  "registered nurse": "Registered Nurse",
  clinician: "Attending Clinician",
  ophthalmologist: "Lead Ophthalmologist",
  "lead ophthalmologist": "Lead Ophthalmologist",
  doctor: "Attending Physician",
};

function formatProviderRole(role?: string | null, orgType?: string | null): string {
  if (!role || !role.trim()) {
    if (orgType === "diagnostic") return "Diagnostic Specialist";
    if (orgType === "pharmacy") return "Licensed Pharmacist";
    if (orgType === "individaul_provider") return "Attending Practitioner";
    return "Healthcare Provider";
  }

  const normalizedKey = role.trim().toLowerCase();
  if (ROLE_DICTIONARY[normalizedKey]) {
    return ROLE_DICTIONARY[normalizedKey];
  }

  return toTitleCase(role);
}

function getProviderVisuals(item: ProviderSearchItem) {
  const type = item.organizationType || "healthcare_provider";

  if (item.logo) {
    return {
      image: item.logo,
      isCustomLogo: true,
      badge: "Verified Facility",
      themeColor: "#2563eb",
      bgColor: "#eff6ff",
    };
  }

  if (item.avatar || item.profileImage) {
    return {
      image: item.avatar || item.profileImage,
      isCustomLogo: true,
      badge: "Verified Clinician",
      themeColor: "#0d9488",
      bgColor: "#f0fdf4",
    };
  }

  switch (type) {
    case "diagnostic":
      return {
        image: diagonize,
        isCustomLogo: false,
        badge: "Diagnostic Lab",
        themeColor: "#0d9488",
        bgColor: "#f0fdfa",
        Icon: FlaskConical,
      };
    case "pharmacy":
      return {
        image: pharmacies,
        isCustomLogo: false,
        badge: "Licensed Pharmacy",
        themeColor: "#d97706",
        bgColor: "#fffbeb",
        Icon: Pill,
      };
    case "individaul_provider":
      return {
        image: doctorsignup,
        isCustomLogo: false,
        badge: "Private Practice",
        themeColor: "#7c3aed",
        bgColor: "#faf5ff",
        Icon: Stethoscope,
      };
    case "telehealth":
      return {
        image: telehealth,
        isCustomLogo: false,
        badge: "Virtual Care",
        themeColor: "#0284c7",
        bgColor: "#f0f9ff",
        Icon: Video,
      };
    case "healthcare_provider":
    default:
      return {
        image: hopistal,
        isCustomLogo: false,
        badge: "Hospital & Clinic",
        themeColor: "#2563eb",
        bgColor: "#eff6ff",
        Icon: Building2,
      };
  }
}

export function ProviderSearchCard({ item, onSelect }: Props) {
  const [copied, setCopied] = useState(false);
  const isIndividualProvider = item.organizationType === "individaul_provider";

  const copyId = (e: MouseEvent) => {
    e.stopPropagation();
    if (!item.wrOrgId) return;
    navigator.clipboard.writeText(item.wrOrgId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rawTitle = item.organizationName || item.fullName || "Healthcare Provider";
  const title = toTitleCase(rawTitle);

  const contactName = item.fullName && item.fullName !== item.organizationName
    ? toTitleCase(item.fullName)
    : item.organizationName
    ? toTitleCase(item.organizationName)
    : "Provider";

  const formattedRole = formatProviderRole(item.specialty, item.organizationType);
  const visuals = getProviderVisuals(item);

  const addressText =
    item.organization?.address ||
    item.address ||
    "Location details upon booking";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#D9E6F7] bg-white shadow-[0_4px_20px_rgba(37,99,235,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(37,99,235,0.12)]">
      {/* ── Top Cover / Banner ── */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-[#0d2a4d] to-[#163e6e]">
        <img
          src={visuals.image}
          alt={title}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            visuals.isCustomLogo ? "object-contain p-4 bg-white/95 backdrop-blur" : "opacity-75"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md"
            style={{ background: "rgba(255,255,255,0.92)", color: visuals.themeColor }}
          >
            {visuals.Icon && <visuals.Icon size={12} />}
            {visuals.badge}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Accepting Patients
          </span>
        </div>

        {/* Bottom facility name overlay on image */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-sky-400 shrink-0" />
            <span className="text-[12px] font-semibold text-white/90 drop-shadow truncate">
              {isIndividualProvider ? "Private Practice" : "Accredited Facility"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div>
          {/* Main Title & Contact */}
          <div className="mb-2">
            <h3 className="text-lg font-bold tracking-tight text-[#163761] line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {contactName && contactName !== title && (
              <p className="text-xs font-semibold text-[#4F6480] flex items-center gap-1 mt-0.5">
                <span>{contactName}</span>
                <span className="text-slate-300">·</span>
                <span className="text-blue-600 font-medium">{formattedRole}</span>
              </p>
            )}
          </div>

          {/* Details Box */}
          <div className="space-y-2 rounded-xl border border-[#E7EEF8] bg-[#F8FBFF] p-3 text-xs">
            {/* Role / Specialty */}
            <div className="flex items-start gap-2 text-[#475569]">
              <Stethoscope size={15} className="mt-0.5 shrink-0 text-[#2563EB]" />
              <span className="font-medium text-[#1E293B] leading-relaxed">
                {formattedRole}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-[#475569]">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#0D9488]" />
              <span className="leading-relaxed line-clamp-2 text-[#334155]">
                {addressText}
              </span>
            </div>

            {/* WR-ID Copy Button */}
            {item.wrOrgId && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={copyId}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#D9E6F7] bg-white px-2.5 py-1.5 text-left transition hover:border-[#2563EB] hover:bg-blue-50/50"
                  title="Copy this ID to grant consent access from My Consents"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">ID:</span>
                    <span className="font-mono text-xs font-semibold text-[#1E3A8A] truncate">{item.wrOrgId}</span>
                  </div>
                  {copied ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
                      <Copy size={12} /> Copy
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
              {isIndividualProvider ? "Individual Provider" : "Facility Care"}
            </span>

            {item.telemedicineAvailable && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                <Video size={11} /> Telemedicine
              </span>
            )}

            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
              In-Person Care
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          >
            <Calendar size={14} />
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}