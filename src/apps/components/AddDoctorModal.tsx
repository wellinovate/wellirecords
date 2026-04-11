import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/shared/auth/AuthProvider";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

type IdentifierType = "wrId" | "email" | "phone";

type SearchDoctorResponse = {
  doctorIdentityId: string;
  fullName: string;
  wrId?: string;
  email?: string;
  phone?: string;
  maskedEmail?: string;
  maskedPhone?: string;
  specialty?: string;
  role?: string;
  department?: string;
  alreadyMember?: boolean;
};

function detectIdentifierType(value: string): IdentifierType | null {
  const input = value.trim();

  if (!input) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{7,15}$/;
  const wrIdRegex = /^WR-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

  if (emailRegex.test(input)) return "email";
  if (phoneRegex.test(input.replace(/\s+/g, ""))) return "phone";
  if (wrIdRegex.test(input)) return "wrId";

  return null;
}

type AddDoctorModalProps = {
  open: boolean;
  onClose: () => void;
  hospitalId: string;
  onDoctorAdded?: (doctor: SearchDoctorResponse) => void;
};

export default function AddDoctorModal({
  open,
  onClose,
  hospitalId,
  onDoctorAdded,
}: AddDoctorModalProps) {
    const {searchDoctorRequest, addDoctorRequest} = useAuth()
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<SearchDoctorResponse | null>(
    null,
  );
  console.log("🚀 ~ AddDoctorModal ~ searchResult:", searchResult)
  const [addLoading, setAddLoading] = useState(false);

  const identifierType = useMemo(() => detectIdentifierType(query), [query]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();

    if (!trimmed) {
      setSearchResult(null);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    if (!identifierType) {
      setSearchResult(null);
      setSearchError("Enter a valid WelliRecord ID, email, or phone number");
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

         const data = await searchDoctorRequest(
          trimmed,
          identifierType,
          controller.signal,
        );

        setSearchResult(data?.data || data);
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.name === "AbortError") return;

        setSearchResult(null);
        setSearchError(
          error?.response?.data?.message || "Doctor not found",
        );
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, identifierType, open, hospitalId]);

  const resetState = () => {
    setQuery("");
    setSearchLoading(false);
    setSearchError("");
    setSearchResult(null);
    setAddLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchResult?.doctorIdentityId || searchResult.alreadyMember) return;

    try {
      setAddLoading(true);

      const result = await addDoctorRequest(
        searchResult.doctorIdentityId,
      );
      console.log("🚀 ~ handleAddDoctor ~ result:", result)

      toast.success(`${searchResult.fullName} added to hospital membership`);
      onDoctorAdded?.(searchResult);
      handleClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to add doctor to membership",
      );
    } finally {
      setAddLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1d3f69] bg-[#081b35] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between border-b border-[#163761] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-[#edf5ff]">
              Add Doctor
            </h2>
            <p className="mt-1 text-sm text-[#7fa3cb]">
              Search for a doctor by WelliRecord ID, email, or phone and add
              them to your hospital membership.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] text-[#9ab7d8] hover:bg-[#143258]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                Search doctor
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e8eb4]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter WelliRecord ID, email, or phone"
                  className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] pl-10 pr-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-[#6e8eb4]">
                Search starts automatically after a short pause.
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-[#29527f] bg-[#0b2140] p-4">
              {searchLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#8fb0d5]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching doctor...</span>
                </div>
              ) : searchError ? (
                <div className="flex items-start gap-2 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              ) : searchResult ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-[#edf5ff]">
                        {searchResult.fullName}
                      </p>
                      <p className="mt-1 text-sm text-[#8fb0d5]">
                        {searchResult.wrId || "No WR ID"}
                      </p>
                    </div>

                    {searchResult.alreadyMember ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                        Already added
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Match found
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                        Specialty
                      </p>
                      <p className="mt-1 text-sm text-[#dcecff]">
                        {searchResult.specialty || "—"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                        Role
                      </p>
                      <p className="mt-1 text-sm text-[#dcecff]">
                        {searchResult.role || "—"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-[#dcecff]">
                        {searchResult.maskedEmail || searchResult.email || "—"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-[#dcecff]">
                        {searchResult.maskedPhone || searchResult.phone || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#8fb0d5]">
                  Start typing a valid WelliRecord ID, email, or phone number to
                  search for an existing doctor.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-[#0f2445] px-4 text-sm font-medium text-[#8fb0d5] hover:bg-[#12305b]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  !searchResult ||
                  searchResult.alreadyMember ||
                  addLoading ||
                  searchLoading
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add to Staff
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}