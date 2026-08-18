import { useMemo, useState } from "react";
import {
  Loader2,
  Search,
  X,
  MapPin,
  Stethoscope,
  Building2,
  Heart,
  Brain,
  Eye,
  Baby,
  Activity,
  Pill,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useProviderSearch } from "@/modules/providers/hooks";
import {
  ProviderSearchCard,
  getProviderCategory,
  CATEGORY_THEMES,
  FacilityCategoryKey,
} from "@/modules/providers/components/ProviderSearchCard";
import { BookAppointmentModal } from "@/modules/appointments/components/BookAppointmentModal";
import { useAppointments } from "@/modules/appointments/hooks";
import type { ProviderSearchItem } from "@/modules/providers/types";

// ─── Specialty filter chips ──────────────────────────────────────────────────

const SPECIALTIES = [
  { id: "all", label: "All Specialties", icon: Building2 },
  { id: "general", label: "General", icon: Stethoscope },
  { id: "cardiology", label: "Cardiology", icon: Heart },
  { id: "neurology", label: "Neurology", icon: Brain },
  { id: "ophthalmology", label: "Eye Care", icon: Eye },
  { id: "pediatrics", label: "Pediatrics", icon: Baby },
  { id: "psychiatry", label: "Mental Health", icon: Activity },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
];

// ─── Facility Categories with matching color shorthand ───────────────────────

const FACILITY_CATEGORIES: {
  id: "all" | FacilityCategoryKey;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: "all",
    label: "All Facilities",
    icon: Building2,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.25)",
  },
  {
    id: "hospital",
    label: "Hospitals & Clinics",
    icon: Building2,
    color: "#1d4ed8",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.25)",
  },
  {
    id: "pharmacy",
    label: "Pharmacies",
    icon: Pill,
    color: "#b45309",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.25)",
  },
  {
    id: "laboratory",
    label: "Laboratories",
    icon: FlaskConical,
    color: "#0f766e",
    bg: "rgba(13,148,136,0.08)",
    border: "rgba(13,148,136,0.25)",
  },
  {
    id: "practice",
    label: "Private Practices",
    icon: Stethoscope,
    color: "#6d28d9",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.25)",
  },
];

const ORDERED_SECTION_KEYS: FacilityCategoryKey[] = [
  "hospital",
  "pharmacy",
  "laboratory",
  "practice",
];

export function FindCarePage() {
  const { user } = useAuth();
  const patientId = user?.userId || (user as any)?.sub;

  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedFacilityType, setSelectedFacilityType] = useState<
    "all" | FacilityCategoryKey
  >("all");
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderSearchItem | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const searchParams = useMemo(() => {
    const params: Record<string, any> = { page: 1, limit: 50 };
    const parts: string[] = [];
    if (search.trim()) parts.push(search.trim());
    if (selectedSpecialty !== "all") parts.push(selectedSpecialty);
    if (parts.length) params.search = parts.join(" ");
    return params;
  }, [search, selectedSpecialty]);

  const appointmentParams = useMemo(() => {
    if (!patientId) return undefined;
    return { patientId, page: 1, limit: 10 };
  }, [patientId]);

  const { createAppointment } = useAppointments(appointmentParams, {
    enabled: Boolean(patientId),
  });

  const { items, loading } = useProviderSearch(searchParams);

  const handleSelectProvider = (item: ProviderSearchItem) => {
    setSelectedProvider(item);
    setBookingOpen(true);
  };

  const hasActiveFilters =
    selectedSpecialty !== "all" ||
    selectedFacilityType !== "all" ||
    search.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setSelectedSpecialty("all");
    setSelectedFacilityType("all");
  };

  // ─── Group results by facility category ───────────────────────────────────

  const groupedProviders = useMemo(() => {
    const groups: Record<FacilityCategoryKey, ProviderSearchItem[]> = {
      hospital: [],
      pharmacy: [],
      laboratory: [],
      practice: [],
    };

    for (const item of items) {
      const cat = getProviderCategory(item);
      if (groups[cat]) {
        groups[cat].push(item);
      } else {
        groups.hospital.push(item);
      }
    }

    return groups;
  }, [items]);

  // Determine which sections to show based on selected facility filter
  const visibleSections = useMemo(() => {
    if (selectedFacilityType === "all") {
      return ORDERED_SECTION_KEYS.filter(
        (key) => groupedProviders[key].length > 0
      );
    }
    return [selectedFacilityType].filter(
      (key) => groupedProviders[key]?.length > 0
    );
  }, [selectedFacilityType, groupedProviders]);

  const totalVisibleCount = useMemo(() => {
    return visibleSections.reduce(
      (acc, key) => acc + (groupedProviders[key]?.length || 0),
      0
    );
  }, [visibleSections, groupedProviders]);

  return (
    <div className="animate-fade-in pb-12">
      {/* ── Hero Search Header ── */}
      <div
        className="rounded-3xl p-6 mb-6"
        style={{
          background:
            "linear-gradient(135deg, #0a1f3a 0%, #0d3358 60%, #1a5276 100%)",
          border: "1px solid rgba(14,165,233,0.15)",
          boxShadow: "0 8px 32px rgba(14,165,233,0.10)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <MapPin size={20} style={{ color: "#38bdf8" }} />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Find Care
          </h1>
        </div>
        <p className="text-sm mb-5" style={{ color: "#7ba3c8" }}>
          Search accredited hospitals, diagnostic labs, pharmacies, and specialists — then book appointments instantly.
        </p>

        {/* Search bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "#7ba3c8" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital, clinic, diagnostic lab, pharmacy, or doctor..."
            className="w-full rounded-2xl py-3.5 pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-white"
              style={{ color: "#7ba3c8" }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Facility Type Filter Tabs (Color-coded Shorthand) ── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {FACILITY_CATEGORIES.map(({ id, label, icon: Icon, color, bg, border }) => {
            const active = selectedFacilityType === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedFacilityType(id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
                style={
                  active
                    ? {
                        background: bg,
                        border: `1.5px solid ${color}`,
                        color: color,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }
                    : {
                        background: "var(--pat-surface, #fff)",
                        border: "1px solid var(--pat-border, #e2e8f0)",
                        color: "var(--pat-muted, #64748b)",
                      }
                }
              >
                <Icon size={14} style={{ color: active ? color : "#64748b" }} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Specialty Filter Chips & Active Clear ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full" style={{ scrollbarWidth: "none" }}>
          {SPECIALTIES.map(({ id, label, icon: Icon }) => {
            const active = selectedSpecialty === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedSpecialty(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
                style={
                  active
                    ? {
                        background: "#0d9488",
                        color: "#fff",
                      }
                    : {
                        background: "var(--pat-surface2, #f1f5f9)",
                        color: "var(--pat-muted, #64748b)",
                        border: "1px solid transparent",
                      }
                }
              >
                <Icon size={11} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer ml-auto"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Categorized Results ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" size={28} style={{ color: "#2563eb" }} />
          <span className="ml-3 text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
            Searching accredited providers...
          </span>
        </div>
      ) : totalVisibleCount > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing {totalVisibleCount} provider{totalVisibleCount !== 1 ? "s" : ""} across {visibleSections.length} {visibleSections.length === 1 ? "category" : "categories"}
            </p>
          </div>

          {visibleSections.map((categoryKey) => {
            const theme = CATEGORY_THEMES[categoryKey];
            const sectionItems = groupedProviders[categoryKey];
            const SectionIcon = theme.Icon;

            return (
              <div key={categoryKey} className="space-y-4">
                {/* ── Section Header (Color-coded) ── */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-1.5 rounded-lg flex items-center justify-center"
                      style={{ background: theme.accentBg }}
                    >
                      <SectionIcon size={16} style={{ color: theme.badgeColor }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {theme.sectionTitle}
                      </h2>
                    </div>
                  </div>

                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                    style={{
                      background: theme.badgeBg,
                      borderColor: theme.badgeBorder,
                      color: theme.badgeColor,
                    }}
                  >
                    {sectionItems.length} {sectionItems.length === 1 ? "facility" : "facilities"}
                  </span>
                </div>

                {/* ── Section Provider Cards Grid ── */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {sectionItems.map((item) => (
                    <ProviderSearchCard
                      key={item._id}
                      item={item}
                      onSelect={handleSelectProvider}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-2xl p-14 text-center"
          style={{
            background: "var(--pat-surface, #fff)",
            border: "2px dashed var(--pat-border, #e2e8f0)",
          }}
        >
          <Search size={28} className="mx-auto mb-3" style={{ color: "var(--pat-muted, #64748b)" }} />
          <p className="text-base font-semibold mb-1" style={{ color: "var(--pat-text, #1e293b)" }}>
            {hasActiveFilters ? "No providers match your search" : "No providers found yet"}
          </p>
          <p className="text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
            {hasActiveFilters
              ? "Try selecting a different facility type, specialty, or clearing filters."
              : "Try searching by provider name, specialty, hospital, or clinic."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition"
              style={{ background: "rgba(13,148,136,0.12)", color: "#0d9488" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Booking Modal ── */}
      {selectedProvider && patientId && (
        <BookAppointmentModal
          open={bookingOpen}
          onClose={() => {
            setBookingOpen(false);
            setSelectedProvider(null);
          }}
          onSubmit={createAppointment}
          patientId={patientId}
          organizationId={selectedProvider.organization?._id || ""}
          organizationName={selectedProvider.organization?.name || "Unknown Hospital"}
          providerId={selectedProvider._id}
          providerName={selectedProvider.fullName || "Unknown Provider"}
        />
      )}
    </div>
  );
}