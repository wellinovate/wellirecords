import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useProviderSearch } from "@/modules/providers/hooks";
import { ProviderSearchCard } from "@/modules/providers/components/ProviderSearchCard";
import { BookAppointmentModal } from "@/modules/appointments/components/BookAppointmentModal";
import { useAppointments } from "@/modules/appointments/hooks";
import type { ProviderSearchItem } from "@/modules/providers/types";

export function FindCarePage() {
  const { user } = useAuth();

  const patientId = user?.sub;

  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderSearchItem | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const searchParams = useMemo(
    () => ({
      search,
      page: 1,
      limit: 20,
    }),
    [search],
  );

  const { items, loading } = useProviderSearch(searchParams);

  const { createAppointment } = useAppointments(
    patientId
      ? {
          patientId,
          page: 1,
          limit: 10,
        }
      : undefined,
  );

  const handleSelectProvider = (item: ProviderSearchItem) => {
    setSelectedProvider(item);
    setBookingOpen(true);
  };

  return (
  <div className="min-h-screen bg-[linear-gradient(135deg,#DAE5F7_0%,#EEF4FF_45%,#FFFFFF_100%)] px-2 py-5 text-[#163761]">
    <div className="mx-auto max-w-[1480px] space-y-5">
      <div className="rounded-[28px] border border-[#D9E6F7] bg-gradient-to-r from-[#DCE9FB] via-[#EEF4FF] to-white px-6 py-6 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
        <h1 className="text-3xl font-semibold text-[#163761]">Find Care</h1>
        <p className="mt-1 text-sm text-[#6B85A3]">
          Search hospitals and providers, then book an appointment.
        </p>

        <div className="relative mt-5">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7EA6D9]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital, clinic, doctor, or specialty"
            className="w-full rounded-2xl border border-[#CFE0F8] bg-white/90 py-3 pl-11 pr-4 text-[#163761] outline-none placeholder:text-[#8AA1C1] shadow-sm transition focus:border-[#60A5FA] focus:ring-4 focus:ring-[#BFDBFE]/40"
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-[#D9E6F7] bg-white/60 p-5 shadow-[0_18px_50px_rgba(37,99,235,0.06)] backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#3B82F6]" size={28} />
          </div>
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <ProviderSearchCard
                key={item._id}
                item={item}
                onSelect={handleSelectProvider}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#C9D9F1] bg-white/70 px-6 py-14 text-center">
            <p className="text-base font-semibold text-[#163761]">
              No providers found yet
            </p>
            <p className="mt-2 text-sm text-[#6B85A3]">
              Try searching by doctor name, specialty, hospital, or clinic.
            </p>
          </div>
        )}
      </div>
    </div>

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
        organizationName={
          selectedProvider.organization?.name || "Unknown Hospital"
        }
        providerId={selectedProvider._id}
        providerName={selectedProvider.fullName || "Unknown Provider"}
      />
    )}
  </div>
);
}