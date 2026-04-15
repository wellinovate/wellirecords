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
    <div className="min-h-screen bg-transparent px-2 py-5 text-white">
      <div className="mx-auto max-w-[1480px] space-y-5">
        <div className="rounded-2xl border border-[#163761] bg-[#081b35]/40 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h1 className="text-3xl font-semibold text-gray-50">Find Care</h1>
          <p className="mt-1 text-sm text-[#9FB3CF]">
            Search hospitals and providers, then book an appointment.
          </p>

          <div className="relative mt-5">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9FB3CF]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospital, clinic, doctor, or specialty"
              className="w-full rounded-2xl border border-[#163761] bg-[#0b2447] py-3 pl-10 pr-4 text-white outline-none placeholder:text-[#7f95b3]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#163761] bg-[#081b35]/40 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={28} />
            </div>
          ) : items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <ProviderSearchCard
                  key={item._id}
                  item={item}
                  onSelect={handleSelectProvider}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#163761] px-6 py-14 text-center">
              <p className="text-base font-medium text-slate-100">
                No providers found yet
              </p>
              <p className="mt-2 text-sm text-[#9FB3CF]">
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
          organizationName={selectedProvider.organization?.name || "Unknown Hospital"}
          providerId={selectedProvider._id}
          providerName={selectedProvider.fullName || "Unknown Provider"}
        />
      )}
    </div>
  );
}