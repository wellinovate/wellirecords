import React, { useEffect, useMemo, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, AlertCircleIcon, BellDotIcon, DotIcon, DropletsIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  QrCode,
  UserPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { SearchPatientResponse } from "@/shared/api/authApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { getPatients } from "@/shared/utils/utilityFunction";
import PatientsLoadingSkeleton from "../../components/Loader/PatientsLoadingSkeleton";
import { health_companion_image } from "@/assets";
import PatientsList from "@/apps/components/shared/PatientsList";

type PatientRow = {
  id: string;
  name: string;
  subtitle: string;
  code: string;
  ageSex: string;
  lastEncounter: {
    provider: string;
    date: string;
    subtext: string;
  };
  lastUpdated: string;
  access: {
    label: string;
    tone: "cyan" | "yellow" | "purple" | "blue";
  };
  alerts: {
    label: string;
    tone: "yellow" | "orange" | "purple" | "cyan";
  }[];
  assigned: string;
};

const MOCK_PATIENTS: PatientRow[] = [
  {
    id: "pat_001",
    name: "John Doe",
    subtitle: "Male age • records",
    code: "WR 29281",
    ageSex: "A10 A9",
    lastEncounter: {
      provider: "B. S9 Ehwado",
      date: "5 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "10 Mar 20098",
    access: { label: "Consent", tone: "cyan" },
    alerts: [{ label: "Allergies", tone: "yellow" }],
    assigned: "Br-Pedi",
  },
  {
    id: "pat_002",
    name: "Flea Elee",
    subtitle: "Medium risk | records",
    code: "WR 29223",
    ageSex: "M0 32",
    lastEncounter: {
      provider: "E. D. Horrelling",
      date: "5 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "10 Mar 20098",
    access: { label: "Confirmed", tone: "yellow" },
    alerts: [{ label: "Escort", tone: "cyan" }],
    assigned: "Bp-Pendi",
  },
];

const toneMap: Record<string, string> = {
  cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  yellow: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  purple: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  blue: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  orange: "bg-orange-400/10 text-orange-300 border-orange-400/20",
};

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "cyan" | "yellow" | "purple" | "blue" | "orange";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneMap[tone]}`}
    >
      {label}
    </span>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button
      className="inline-flex h-9 items-center gap-1 rounded-md border border-white/10 bg-[#0f2445] px-3 text-[12px] text-[#8fb0d5] hover:bg-[#12305b]"
      type="button"
    >
      <span>{label}</span>
      <ChevronDown size={13} />
    </button>
  );
}

type RegisterMode = "existing" | "new";
type IdentifierType = "wrId" | "email" | "phone" | "qr";

function detectIdentifierType(value: string): IdentifierType | null {
  const input = value.trim();

  if (!input) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{7,15}$/;
  const wrIdRegex = /^WR[-\s]?[A-Z0-9]+$/i;

  if (emailRegex.test(input)) return "email";
  if (phoneRegex.test(input.replace(/\s+/g, ""))) return "phone";
  if (wrIdRegex.test(input)) return "wrId";

  return null;
}

function RegisterPatientModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { linkPatientRequest, registerNewPatient, searchPatientRequest, user } =
    useAuth();

  const [mode, setMode] = useState<RegisterMode>("existing");
  const [existingQuery, setExistingQuery] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] =
    useState<SearchPatientResponse | null>(null);

  const [linkLoading, setLinkLoading] = useState(false);

  const [newPatientForm, setNewPatientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const identifierType = useMemo(
    () => detectIdentifierType(existingQuery),
    [existingQuery],
  );

  useEffect(() => {
    if (!open || mode !== "existing") return;

    const trimmed = existingQuery.trim();

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

        const result = await searchPatientRequest(
          trimmed,
          identifierType,
          controller.signal,
        );

        setSearchResult(result);
      } catch (error: any) {
        if (error?.name === "AbortError") return;

        setSearchResult(null);
        setSearchError(error?.message || "Patient not found");
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [existingQuery, identifierType, mode, open]);

  useEffect(() => {}, []);

  const handleCreateNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !(
        newPatientForm.firstName ||
        newPatientForm.lastName ||
        newPatientForm.phone ||
        newPatientForm.gender
      )
    )
      return;
    console.log("Create new patient under organisation", newPatientForm);

    const result = await registerNewPatient(newPatientForm);

    if (
      result === "Patient registered successfully" ||
      "Patient already exists, linked to organization"
    ) {
      onClose();
    }
  };

  const handleLinkExistingPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchResult?.patientIdentityId || searchResult.alreadyLinked) return;

    try {
      setLinkLoading(true);

      const result = await linkPatientRequest(
        searchResult.patientIdentityId,
        user?.account?.id,
      );

      console.log("Patient linked", result);
      onClose();
    } catch (error: any) {
      setSearchError(error?.message || "Failed to link patient");
    } finally {
      setLinkLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1d3f69] bg-[#081b35] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between border-b border-[#163761] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-[#edf5ff]">
              Register Patient
            </h2>
            <p className="mt-1 text-sm text-[#7fa3cb]">
              Add an existing WelliRecord user or create a new patient under
              your organisation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] text-[#9ab7d8] hover:bg-[#143258]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition ${
                mode === "existing"
                  ? "border border-[#3a6ea8] bg-[#12355f] text-white"
                  : "border border-white/10 bg-[#0f2445] text-[#8fb0d5] hover:bg-[#12305b]"
              }`}
            >
              Register Existing User
            </button>

            <button
              type="button"
              onClick={() => setMode("new")}
              className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition ${
                mode === "new"
                  ? "border border-[#3a6ea8] bg-[#12355f] text-white"
                  : "border border-white/10 bg-[#0f2445] text-[#8fb0d5] hover:bg-[#12305b]"
              }`}
            >
              Register New User
            </button>
          </div>

          {mode === "existing" ? (
            <form onSubmit={handleLinkExistingPatient} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                  Search existing patient
                </label>

                <input
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  placeholder="Enter WelliRecord ID, email, or phone"
                  className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
                />

                <p className="mt-2 text-xs text-[#6e8eb4]">
                  Search starts automatically after a short pause.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-[#29527f] bg-[#0b2140] p-4">
                {searchLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[#8fb0d5]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching patient...</span>
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

                      {searchResult.alreadyLinked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                          Already linked
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
                          Date of Birth
                        </p>
                        <p className="mt-1 text-sm text-[#dcecff]">
                          {searchResult.dateOfBirth || "—"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                        <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                          Gender
                        </p>
                        <p className="mt-1 text-sm text-[#dcecff]">
                          {searchResult.gender || "—"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                        <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                          Email
                        </p>
                        <p className="mt-1 text-sm text-[#dcecff]">
                          {searchResult.maskedEmail || "—"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#102849] p-3">
                        <p className="text-[11px] uppercase tracking-wide text-[#6e8eb4]">
                          Phone
                        </p>
                        <p className="mt-1 text-sm text-[#dcecff]">
                          {searchResult.maskedPhone || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#8fb0d5]">
                    Start typing a valid WelliRecord ID, email, or phone number
                    to search for an existing patient.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-[#0f2445] px-4 text-sm font-medium text-[#8fb0d5] hover:bg-[#12305b]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !searchResult ||
                    searchResult.alreadyLinked ||
                    linkLoading ||
                    searchLoading
                  }
                  className="inline-flex h-11 items-center justify-center rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {linkLoading ? "Linking..." : "Link Existing Patient"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateNewPatient} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                    First name
                  </label>
                  <input
                    value={newPatientForm.firstName}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                    Last name
                  </label>
                  <input
                    value={newPatientForm.lastName}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newPatientForm.email}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                    Phone
                  </label>
                  <input
                    value={newPatientForm.phone}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                    Gender
                  </label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#dcecff]">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={newPatientForm.dateOfBirth}
                    onChange={(e) =>
                      setNewPatientForm((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] px-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-[#0f2445] px-4 text-sm font-medium text-[#8fb0d5] hover:bg-[#12305b]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-[#2e6da5] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f]"
                >
                  Create Patient
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function PatientListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        setError("");

        const result = await getPatients({
          search,
          page,
          limit,
        });

        setPatients(result?.data?.patients);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [search, page, limit]);

  return (
    <>
      <div className="min-h-screen bg-[#06162d]/20 px-2 py-5 text-white">
        <div className="mx-auto max-w-[1480px]">
          <div className="rounded-2xl borde border-[#163761] bg-[#081b35]/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="border-b border-[#163761] px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row xl:items-start xl:justify-between">
                <div>
                  <div>
            <h1 className="text-3xl font-semibold text-gray-50">Patients List</h1>
            <p className="text-gray-300 mt-1">Manage and monitor all registered patients</p>
          </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px]">
                    <span className="text-[#d8e7fb]">
                      {patients?.length} Patients
                    </span>
                    <span className="text-[#2b527e]">•</span>
                    <span className="text-[#58b8ff]">0 due today</span>
                    <span className="text-[#2b527e]">•</span>
                    <span className="text-[#58b8ff]">0 pending review</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2e6da5] bg-transparent px-4 text-sm font-medium text-[#7fd0ff] hover:bg-[#0d2d52]"
                    type="button"
                  >
                    <UserPlus size={16} />
                    <span> Request Access (QR or Code)</span>
                    <QrCode size={16} />
                  </button>

                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[#365f8f] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f]"
                    type="button"
                  >
                    <UserPlus size={16} />
                    <span>Add Patient</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row xl:items-center">
                <div className="relative flex min-w-0 flex-1">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7fa3cb]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, id or patient..."
                    className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] pl-11 pr-4 text-sm text-[#dcecff] focus:border-[#3793e0] focus:outline-none"
                  />
                </div>

                <div className="md:eflex hidden flex-wrap gap-2">
                  <FilterButton label="Database" />
                  <FilterButton label="Views" />
                  <FilterButton label="Spaces" />
                  <FilterButton label="Flags" />
                  <FilterButton label="Sort" />

                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 bg-[#0f2445] px-3 text-[12px] text-[#8fb0d5] hover:bg-[#12305b]"
                  >
                    <SlidersHorizontal size={13} />
                  </button>
                </div>
                <Link
                  to="/provider/encounters/new"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[#365f8f] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f]"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20">
                    +
                  </span>
                  <span>New Encounter</span>
                </Link>
              </div>
            </div>
            {loading ? (
              <PatientsLoadingSkeleton />
            ) : (
              <div className="px-4 py-4">
                <div className="overflow-hidden rounded-xl border border-[#173a63] bg-[#0a1d39]">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-[#0d2342]  text-center font-semibold text-[#90adcf]">
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px]  text-[#90adcf] text-left">
                            Patient Name
                          </th>
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px]  text-[#90adcf]">
                            Patiet ID 
                          </th>
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px]  text-[#90adcf]">
                            Gender
                          </th>
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px]  text-[#90adcf]">
                            Phone
                          </th>
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px] font-medium text-[#90adcf]">
                            Address 
                          </th>
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px]  text-[#90adcf]">
                            Last Visit
                          </th>
                          <th className="border-b border-[#173a63] px-4 py-3 text-[12px]  text-[#90adcf]">
                            Assigned <br />
                            Doctor
                          </th>
                          
                          <th className="border-b border-[#173a63] px-4 py-3 text-[14px]  text-[#90adcf] text-center">
                            Alert
                          </th>
                          
                          <th className="border-b border-[#173a63] px-4 py-3 text-[12px]  text-[#90adcf]">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 text-center">
                        {patients?.map((patient, index) => (
                          <tr
                            key={patient.id}
                            onClick={() =>
                              navigate(
                                `/provider/patients/${patient?.patientId}`,
                              )
                            }
                            className={`cursor-pointer transition   hover:bg-[#102a4d] space-y-  divide-y-4 border-b-2  border-b-white divide-[#132f52]
                              `}
                            // ${index === 0 ? "divide-y-0" : ""}
                              >
                            <td className="px-4 py-4 align-middle text-left border-b-4 border-[#132f52]  ">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full   text-[5px] font-semibold text-[#e4e8ec]">
                                  <img src={patient?.avatar || health_companion_image} alt="" className="w-full h-full object-cover object-center" />
                                  
                                </div>

                                <div className="min-w-[150px]">
                                  <div className=" text-[14px] lg:text-[16px] font-semibold text-[#edf5ff]">
                                    <p>

                                    {patient?.fullName}
                                    </p>
                                    <p className="text-[12px]">

                                    {patient?.email}
                                    </p>
                                  </div>
                                  <div className="text-[11px] text-[#6f8eb3]">
                                    {patient?.subtitle}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                              {patient?.externalPatientId}
                            </td>

                            <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                              {patient?.gender || "Female"}
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                              {patient?.phone || "XXX-XXX-XXXX"}
                            </td>

                            <td className="px-4 py-3">
                              <div className=" text-[14px] text-[#e7edf5]">
                              Graham, California
                               
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <Badge
                                label={patient?.relationshipType}
                                tone={patient?.access?.tone}
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {patient?.alerts?.length > 0 ? (
                                  patient?.alerts?.map((alert, i) => (
                                    <Badge
                                      key={`${patient?.id}-alert-${i}`}
                                      label={alert?.label}
                                      tone={alert?.tone}
                                    />
                                  ))
                                ) : (
                                  <span className="text-[13px] text-center font-semibold text-[#f7fbff]">
                                  {patient?.encounterStatus?.provider || "Dr Enoch"}  
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                              {/* {patient?.assigned} */}
                              <BellDotIcon size={16} className="inline-block mr-1" />
                            </td>

                            <td className="font-extrabold text-[26px] text-[#58b8ff]">
                              ...
                              {/* <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/provider/patients/${patient?.patientId}`,
                                  );
                                }}
                                className="inline-flex h-8 items-center rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#e8f1ff] hover:bg-[#13345e]"
                              >
                                Open
                              </button> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {patients.length > 10 && (
                  <div className="flex flex-col gap-3 border-t border-[#173a63] bg-[#091a33] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-[12px] text-[#8aa6c7]">
                      110 of 1,284
                    </div>

                    <div className="flex items-center gap-1 text-[#90adcf]">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] hover:bg-[#143258]">
                        <ChevronsLeft size={14} />
                      </button>
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] hover:bg-[#143258]">
                        <ChevronLeft size={14} />
                      </button>

                      <button className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[#3a6ea8] bg-[#12355f] px-2 text-[12px] text-white">
                        1
                      </button>
                      <button className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] hover:bg-[#12355f]">
                        2
                      </button>
                      <button className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] hover:bg-[#12355f]">
                        3
                      </button>
                      <button className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] hover:bg-[#12355f]">
                        4
                      </button>
                      <button className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] hover:bg-[#12355f]">
                        5
                      </button>

                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] hover:bg-[#143258]">
                        <ChevronRight size={14} />
                      </button>
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0d2342] hover:bg-[#143258]">
                        <ChevronsRight size={14} />
                      </button>
                    </div>
                  </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
          {/* <PatientsList  /> */}
        
      </div>

      <RegisterPatientModal
        open={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  );
}
