import { usePatientSearch } from "@/shared/hooks/usePatientSearch";

type Props = {
  open?: boolean;
  enabled?: boolean;
  searchPatientRequest: (
    value: string,
    identifierType: "wrId" | "email" | "phone",
    signal?: AbortSignal
  ) => Promise<any>;
  onSelect: (patient: {
    id: string;
    name: string;
    avatar?: string;
    raw: any;
  }) => void;
};

export const PatientSearchPicker = ({
  open = true,
  enabled = true,
  searchPatientRequest,
  onSelect,
}: Props) => {
  const {
    query,
    setQuery,
    searchLoading,
    searchError,
    searchResult,
    selectedPatient,
  } = usePatientSearch({
    open,
    enabled,
    searchPatientRequest,
  });
    console.log("🚀 ~ PatientSearchPicker ~ searchResult:", searchResult)

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by WR ID, email, or phone"
        className="w-full rounded-xl border border-[#163761] bg-[#0b2447] px-3 py-2 outline-none"
      />

      <div className="rounded-xl border border-dashed border-[#29527f] p-3">
        {searchLoading && <p className="text-sm text-[#8fb0d5]">Searching...</p>}

        {!searchLoading && searchError && (
          <p className="text-sm text-red-400">{searchError}</p>
        )}

        {!searchLoading && !searchError && !searchResult && !selectedPatient && (
          <p className="text-sm text-[#8fb0d5]">
            Enter a valid WelliRecord ID, email, or phone number
          </p>
        )}

        {searchResult && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={searchResult.avatar || "/avatar.png"}
                alt={searchResult.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-white">{searchResult.fullName}</p>
                <p className="text-xs text-[#8fb0d5]">
                  {searchResult.wrId || "No WR ID"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onSelect({
                  id: searchResult.patientIdentityId,
                  name: searchResult.fullName,
                  avatar: searchResult.avatar,
                  raw: searchResult,
                })
              }
              className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
            >
              Select
            </button>
          </div>
        )}
      </div>
    </div>
  );
};