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
} from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useProviderSearch } from "@/modules/providers/hooks";
import { ProviderSearchCard } from "@/modules/providers/components/ProviderSearchCard";
import { BookAppointmentModal } from "@/modules/appointments/components/BookAppointmentModal";
import { useAppointments } from "@/modules/appointments/hooks";
import type { ProviderSearchItem } from "@/modules/providers/types";

// ─── Filter chips ─────────────────────────────────────────────────────────────

const SPECIALTIES = [
  { id: "all",          label: "All",           icon: Building2 },
  { id: "general",     label: "General",        icon: Stethoscope },
  { id: "cardiology",  label: "Cardiology",     icon: Heart },
  { id: "neurology",   label: "Neurology",      icon: Brain },
  { id: "ophthalmology", label: "Eye Care",     icon: Eye },
  { id: "pediatrics",  label: "Pediatrics",     icon: Baby },
  { id: "psychiatry",  label: "Mental Health",  icon: Activity },
  { id: "pharmacy",    label: "Pharmacy",       icon: Pill },
];

const FACILITY_TYPES = [
  { id: "all",         label: "All Facilities" },
  { id: "hospital",    label: "Hospital" },
  { id: "clinic",      label: "Clinic" },
  { id: "pharmacy",    label: "Pharmacy" },
  { id: "laboratory",  label: "Laboratory" },
];

export function FindCarePage() {
  const { user } = useAuth();
  const patientId = user?.userId || (user as any)?.sub;

  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedFacilityType, setSelectedFacilityType] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState<ProviderSearchItem | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const searchParams = useMemo(() => {
    const params: Record<string, any> = { page: 1, limit: 20 };
    // Build search query incorporating specialty filter
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

  return (
    <div className="animate-fade-in pb-10">
      {/* ── Hero search header ── */}
      <div
        className="rounded-3xl p-6 mb-6"
        style={{
          background: "linear-gradient(135deg, #0a1f3a 0%, #0d3358 60%, #1a5276 100%)",
          border: "1px solid rgba(14,165,233,0.15)",
          boxShadow: "0 8px 32px rgba(14,165,233,0.10)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <MapPin size={20} style={{ color: "#38bdf8" }} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Find Care</h1>
        </div>
        <p className="text-sm mb-5" style={{ color: "#7ba3c8" }}>
          Search hospitals, clinics, and specialists — then book instantly.
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
            placeholder="Search hospital, clinic, doctor, or specialty..."
            className="w-full rounded-2xl py-3.5 pl-11 pr-10 text-sm outline-none transition"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "#7ba3c8" }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Specialty filter chips ── */}
      <div className="mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2 min-w-max">
          {SPECIALTIES.map(({ id, label, icon: Icon }) => {
            const active = selectedSpecialty === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedSpecialty(id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                style={
                  active
                    ? {
                        background: "rgba(13,148,136,0.15)",
                        border: "1px solid rgba(13,148,136,0.35)",
                        color: "#0d9488",
                      }
                    : {
                        background: "var(--pat-surface, #fff)",
                        border: "1px solid var(--pat-border, #e2e8f0)",
                        color: "var(--pat-muted, #64748b)",
                      }
                }
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Facility type + active filter indicator ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {FACILITY_TYPES.map(({ id, label }) => {
            const active = selectedFacilityType === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedFacilityType(id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  active
                    ? {
                        background: "rgba(37,99,235,0.12)",
                        border: "1px solid rgba(37,99,235,0.25)",
                        color: "#2563eb",
                      }
                    : {
                        background: "var(--pat-surface2, #f1f5f9)",
                        color: "var(--pat-muted, #64748b)",
                        border: "1px solid transparent",
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "#dc2626" }}
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Results grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" size={28} style={{ color: "#2563eb" }} />
          <span className="ml-3 text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
            Searching providers...
          </span>
        </div>
      ) : items.length ? (
        <>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--pat-muted, #64748b)" }}>
            {items.length} provider{items.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ProviderSearchCard
                key={item._id}
                item={item}
                onSelect={handleSelectProvider}
              />
            ))}
          </div>
        </>
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
            {hasActiveFilters ? "No providers match your filters" : "No providers found yet"}
          </p>
          <p className="text-sm" style={{ color: "var(--pat-muted, #64748b)" }}>
            {hasActiveFilters
              ? "Try a different specialty or clear your filters."
              : "Try searching by doctor name, specialty, hospital, or clinic."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(13,148,136,0.12)", color: "#0d9488" }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Booking modal ── */}
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