import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

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
  {
    id: "pat_003",
    name: "Servrot Code",
    subtitle: "Adult care",
    code: "WR 31231",
    ageSex: "M0 45",
    lastEncounter: {
      provider: "B. Q Men oca",
      date: "5 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "12 Mar 20098",
    access: { label: "Scrubib", tone: "purple" },
    alerts: [{ label: "Confirmed Lab", tone: "yellow" }],
    assigned: "22-Pendi",
  },
  {
    id: "pat_004",
    name: "Abao Leo",
    subtitle: "Follow updates",
    code: "WR 11897",
    ageSex: "A0 33",
    lastEncounter: {
      provider: "R. Q Ehm oca",
      date: "5 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "12 Mar 20098",
    access: { label: "Certified Lab", tone: "cyan" },
    alerts: [],
    assigned: "63-Pendi",
  },
  {
    id: "pat_005",
    name: "Cono Gofer",
    subtitle: "Follow notes",
    code: "WR 10281",
    ageSex: "M0 41",
    lastEncounter: {
      provider: "B. Q Main Odo",
      date: "5 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "07 Mar 20098",
    access: { label: "Confirmed Lab", tone: "yellow" },
    alerts: [],
    assigned: "03-Pqad",
  },
  {
    id: "pat_006",
    name: "Pano Reemo",
    subtitle: "Team follow-up",
    code: "WR 39293",
    ageSex: "M0 36",
    lastEncounter: {
      provider: "B. Q New Oco",
      date: "5 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "12 Mar 20098",
    access: { label: "Open", tone: "blue" },
    alerts: [],
    assigned: "83-Pqer",
  },
  {
    id: "pat_007",
    name: "Gtant Sonster",
    subtitle: "Team of clinicians",
    code: "WR 10231",
    ageSex: "A0 34",
    lastEncounter: {
      provider: "R. Q Main Odo",
      date: "2 months ago",
      subtext: "Outpatient visit",
    },
    lastUpdated: "10 Mar 20098",
    access: { label: "Confirmed Lab", tone: "yellow" },
    alerts: [],
    assigned: "Bq-Pendi",
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

export function PatientListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_PATIENTS;

    return MOCK_PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.assigned.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-[#06162d] px-5 py-5 text-white">
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-2xl border border-[#163761] bg-[#081b35] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#163761] px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-[#e9f1fb]">
                  Patients
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px]">
                  <span className="text-[#d8e7fb]">1,384 patients</span>
                  <span className="text-[#2b527e]">•</span>
                  <span className="text-[#58b8ff]">22 due today</span>
                  <span className="text-[#2b527e]">•</span>
                  <span className="text-[#58b8ff]">8 pending review</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2e6da5] bg-transparent px-4 text-sm font-medium text-[#7fd0ff] hover:bg-[#0d2d52]"
                  type="button"
                >
                  <QrCode size={16} />
                  <span>Scan QR / Enter Code</span>
                </button>

                <button
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2e6da5] bg-transparent px-4 text-sm font-medium text-[#7fd0ff] hover:bg-[#0d2d52]"
                  type="button"
                >
                  <UserPlus size={16} />
                  <span>Request Access</span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7fa3cb]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, id or patient..."
                  className="h-11 w-full rounded-md border border-[#1f4470] bg-[#102849] pl-11 pr-4 text-sm text-[#dcecff] placeholder:text-[#6e8eb4] focus:border-[#3793e0] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
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

                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[#365f8f] bg-[#17365d] px-4 text-sm font-medium text-[#dcecff] hover:bg-[#1a416f]"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20">
                    +
                  </span>
                  <span>New Encounter</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="overflow-hidden rounded-xl border border-[#173a63] bg-[#0a1d39]">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#0d2342] text-left">
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Patient
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        ID / Code
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Age / Sex
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Last Encounter
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Last Updated
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Access
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Alerts
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Assigned
                      </th>
                      <th className="border-b border-[#173a63] px-4 py-3 text-[12px] font-medium text-[#90adcf]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <tr
                        key={patient.id}
                        onClick={() => navigate(`/provider/patients/${patient.id}`)}
                        className={`cursor-pointer transition hover:bg-[#102a4d] ${
                          index !== filteredPatients.length - 1
                            ? "border-b border-[#132f52]"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8b08b] text-xs font-semibold text-[#11233d]">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>

                            <div className="min-w-[150px]">
                              <div className="text-[13px] font-semibold text-[#edf5ff]">
                                {patient.name}
                              </div>
                              <div className="text-[11px] text-[#6f8eb3]">
                                {patient.subtitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                          {patient.code}
                        </td>

                        <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                          {patient.ageSex}
                        </td>

                        <td className="px-4 py-3">
                          <div className="min-w-[140px]">
                            <div className="text-[12px] text-[#dce9fb]">
                              {patient.lastEncounter.provider}
                            </div>
                            <div className="text-[11px] text-[#6f8eb3]">
                              {patient.lastEncounter.date}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[12px] text-[#dce9fb]">
                          {patient.lastUpdated}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            label={patient.access.label}
                            tone={patient.access.tone}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {patient.alerts.length > 0 ? (
                              patient.alerts.map((alert, i) => (
                                <Badge
                                  key={`${patient.id}-alert-${i}`}
                                  label={alert.label}
                                  tone={alert.tone}
                                />
                              ))
                            ) : (
                              <span className="text-[11px] text-[#59779d]">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[12px] text-[#cdddf2]">
                          {patient.assigned}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/provider/patients/${patient.id}`);
                            }}
                            className="inline-flex h-8 items-center rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#e8f1ff] hover:bg-[#13345e]"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}