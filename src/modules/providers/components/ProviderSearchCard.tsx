import {
  Building2,
  MapPin,
  Stethoscope,
  Video,
  FlaskConical,
  Pill,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { ProviderSearchItem } from "../types";

type Props = {
  item: ProviderSearchItem;
  onSelect: (item: ProviderSearchItem) => void;
};

// ─── Shared Category Helper ──────────────────────────────────────────────────

export type FacilityCategoryKey = "hospital" | "pharmacy" | "laboratory" | "practice";

export function getProviderCategory(item: ProviderSearchItem): FacilityCategoryKey {
  const type = item.organizationType?.toLowerCase() || "";
  if (type === "pharmacy") return "pharmacy";
  if (type === "diagnostic" || type === "laboratory" || type === "lab") return "laboratory";
  if (type === "individaul_provider" || type === "telehealth") return "practice";
  return "hospital";
}

export const CATEGORY_THEMES = {
  hospital: {
    gradient: "from-[#0f172a] via-[#1e3a8a] to-[#1e40af]",
    badgeBg: "rgba(37, 99, 235, 0.12)",
    badgeBorder: "rgba(37, 99, 235, 0.25)",
    badgeColor: "#1d4ed8",
    badgeText: "Hospital & Clinic",
    sectionTitle: "Hospitals & Medical Centers",
    Icon: Building2,
    accentBg: "#dbeafe",
  },
  pharmacy: {
    gradient: "from-[#451a03] via-[#78350f] to-[#9a3412]",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    badgeBorder: "rgba(217, 119, 6, 0.25)",
    badgeColor: "#b45309",
    badgeText: "Licensed Pharmacy",
    sectionTitle: "Pharmacies & Retail Care",
    Icon: Pill,
    accentBg: "#fef3c7",
  },
  laboratory: {
    gradient: "from-[#042f2e] via-[#115e59] to-[#0f766e]",
    badgeBg: "rgba(13, 148, 136, 0.12)",
    badgeBorder: "rgba(13, 148, 136, 0.25)",
    badgeColor: "#0f766e",
    badgeText: "Diagnostic Lab",
    sectionTitle: "Diagnostic & Pathology Laboratories",
    Icon: FlaskConical,
    accentBg: "#ccfbf1",
  },
  practice: {
    gradient: "from-[#2e1065] via-[#4c1d95] to-[#581c87]",
    badgeBg: "rgba(124, 58, 237, 0.12)",
    badgeBorder: "rgba(124, 58, 237, 0.25)",
    badgeColor: "#6d28d9",
    badgeText: "Private Practice",
    sectionTitle: "Private Practices & Specialists",
    Icon: Stethoscope,
    accentBg: "#ede9fe",
  },
};

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function toTitleCase(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper === "CMD" || upper === "MD" || upper === "LTD" || upper === "CAC" || upper === "GRA" || upper === "FCT") {
        return upper;
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
  pharmacist: "Head Pharmacist",
  "head pharmacist": "Head Pharmacist",
  "lead pharmacist": "Lead Pharmacist",
  caregiver: "Registered Nurse",
  nurse: "Registered Nurse",
  "registered nurse": "Registered Nurse",
  clinician: "Attending Clinician",
  "attending clinician": "Attending Clinician",
  ophthalmologist: "Lead Ophthalmologist",
  "lead ophthalmologist": "Lead Ophthalmologist",
  doctor: "Attending Physician",
};

function formatProviderRole(role?: string | null, orgType?: string | null): string {
  if (!role || !role.trim()) {
    if (orgType === "diagnostic") return "Diagnostic Specialist";
    if (orgType === "pharmacy") return "Head Pharmacist";
    if (orgType === "individaul_provider") return "Attending Clinician";
    return "Medical Practitioner";
  }

  const normalizedKey = role.trim().toLowerCase();
  if (ROLE_DICTIONARY[normalizedKey]) {
    return ROLE_DICTIONARY[normalizedKey];
  }

  return toTitleCase(role);
}

export function ProviderSearchCard({ item, onSelect }: Props) {
  const [imgError, setImgError] = useState(false);
  const isIndividualProvider = item.organizationType === "individaul_provider";

  const rawTitle = item.organizationName || item.fullName || "Healthcare Provider";
  const title = toTitleCase(rawTitle);

  const contactName = item.fullName && item.fullName !== item.organizationName
    ? toTitleCase(item.fullName)
    : null;

  const formattedRole = formatProviderRole(item.specialty, item.organizationType);
  const categoryKey = getProviderCategory(item);
  const theme = CATEGORY_THEMES[categoryKey];
  const IconComponent = theme.Icon;

  const addressText =
    item.organization?.address ||
    item.address ||
    "Location details upon booking";

  const logoUrl = item.logo || item.avatar || item.profileImage;
  const hasCustomLogo = Boolean(logoUrl && !imgError);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300">
      {/* ── Category Gradient Header ── */}
      <div className={`relative h-28 w-full bg-gradient-to-r ${theme.gradient} p-3.5 flex flex-col justify-between overflow-hidden`}>
        {/* Decorative backdrop light */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Top Header Row: Category Badge & Availability */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur">
            <IconComponent size={13} style={{ color: theme.badgeColor }} />
            <span>{theme.badgeText}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Accepting Patients
          </span>
        </div>

        {/* Bottom Header Row: Emblem & Accreditation */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-xl bg-white p-1 shadow-md flex items-center justify-center border border-white/60">
              {hasCustomLogo ? (
                <img
                  src={logoUrl!}
                  alt={title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div
                  className="h-full w-full rounded-lg flex items-center justify-center"
                  style={{ background: theme.accentBg }}
                >
                  <IconComponent size={20} style={{ color: theme.badgeColor }} />
                </div>
              )}
            </div>
            <div className="text-white drop-shadow">
              <p className="text-[11px] font-semibold text-white/90">
                {isIndividualProvider ? "Private Practice" : "Accredited Facility"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* ── Card Body (One role instance, clean address, zero dead space) ── */}
      <div className="flex flex-1 flex-col justify-between p-4 bg-white">
        <div className="space-y-3">
          {/* Main Title & Subtitle */}
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors" title={title}>
              {title}
            </h3>

            {/* Exactly ONE role display on the whole card */}
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 line-clamp-1">
              {contactName ? (
                <>
                  <span className="font-semibold text-slate-700">{contactName}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600 font-medium">{formattedRole}</span>
                </>
              ) : (
                <span className="text-slate-600 font-medium">{formattedRole}</span>
              )}
            </p>
          </div>

          {/* Location Box (Address with MapPin) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-1.5 text-xs">
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              <span className="leading-snug text-slate-700 line-clamp-2" title={addressText}>
                {addressText}
              </span>
            </div>
          </div>

          {/* Actionable Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {item.telemedicineAvailable && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <Video size={11} /> Teleconsult Available
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
              <Sparkles size={11} className="text-amber-500" /> Instant Booking
            </span>
          </div>
        </div>

        {/* ── Prominent Action Button ── */}
        <div className="border-t border-slate-100 pt-3 mt-4">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
          >
            <Calendar size={14} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
}