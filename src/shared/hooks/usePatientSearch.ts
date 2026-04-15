import { useEffect, useMemo, useState } from "react";

type IdentifierType = "wrId" | "email" | "phone" | null;

export type PatientSearchResult = {
  _id: string;
  fullName: string;
  wrId?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
  maskedEmail?: string;
  maskedPhone?: string;
  alreadyLinked?: boolean;
};

type UsePatientSearchParams = {
  open?: boolean;
  enabled?: boolean;
  debounceMs?: number;
  searchPatientRequest: (
    value: string,
    identifierType: Exclude<IdentifierType, null>,
    signal?: AbortSignal
  ) => Promise<PatientSearchResult>;
};

function detectIdentifierType(value: string): IdentifierType {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const wrIdRegex = /^WR-[A-Z0-9-]+$/i;
  const phoneRegex = /^\+?\d{10,15}$/;

  if (emailRegex.test(trimmed)) return "email";
  if (wrIdRegex.test(trimmed)) return "wrId";

  const normalizedPhone = trimmed.replace(/[\s\-()]/g, "");
  if (phoneRegex.test(normalizedPhone)) return "phone";

  return null;
}

export function usePatientSearch({
  open = true,
  enabled = true,
  debounceMs = 500,
  searchPatientRequest,
}: UsePatientSearchParams) {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<PatientSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  const identifierType = useMemo(() => detectIdentifierType(query), [query]);

  useEffect(() => {
    if (!open || !enabled) return;

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

        const normalizedValue =
          identifierType === "phone"
            ? trimmed.replace(/[\s\-()]/g, "")
            : trimmed;

        const result = await searchPatientRequest(
          normalizedValue,
          identifierType,
          controller.signal
        );

        setSearchResult(result);
      } catch (error: any) {
        if (error?.name === "AbortError") return;

        setSearchResult(null);
        setSearchError(error?.message || "Patient not found");
      } finally {
        setSearchLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, identifierType, open, enabled, debounceMs, searchPatientRequest]);

  const selectPatient = (patient?: PatientSearchResult | null) => {
    const chosen = patient || searchResult;
    if (!chosen) return;
    setSelectedPatient(chosen);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResult(null);
    setSearchError("");
    setSearchLoading(false);
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
  };

  return {
    query,
    setQuery,
    identifierType,
    searchResult,
    searchLoading,
    searchError,
    selectedPatient,
    setSelectedPatient,
    selectPatient,
    clearSearch,
    clearSelectedPatient,
  };
}