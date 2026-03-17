import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Shield,
  Stethoscope,
  Syringe,
} from "lucide-react";

const TABS = [
  "Overview",
  "Encounters",
  "Vitals",
  "Medications",
  "Allergies",
  "Diagnoses",
  "Lab Results",
  "Procedures",
  "Documents",
];

const MOCK_PATIENT = {
  id: "pat_001",
  name: "John Doe",
  code: "WR-10391",
  sex: "M",
  age: 43,
  bloodGroup: "O+",
  genotype: "AA",
  phone: "5065-123-4567",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
};

const ALERT_CHIPS = [
  { label: "Penicillin Allergy", value: "993 v", tone: "yellow" },
  { label: "Hypertension", value: "—", tone: "red" },
  { label: "Type 2 Diabetes", value: "5", tone: "purple" },
  { label: "Manage Access", value: "", tone: "slate", dropdown: true },
];

const CLINICAL_ALERTS = [
  {
    title: "Pregnals retrims",
    subtitle: "Recent infection scan findings",
    tone: "yellow",
  },
  {
    title: "Current Hypertension",
    subtitle: "Ongoing risk level",
    tone: "red",
  },
  {
    title: "Type 2 Diabetes",
    subtitle: "Early risk flagged",
    tone: "blue",
  },
];

const RECENT_TIMELINE = [
  {
    id: "tl_1",
    title: "Medication (Propranolol)",
    subtitle: "Medication • 10mg / 1 tab bd",
    doctor: "Dr. Patel",
  },
  {
    id: "tl_2",
    title: "Lab Result Processed",
    subtitle: "Medication fill Type A Result (L.O.C)",
    doctor: "Dr. Loe",
  },
  {
    id: "tl_3",
    title: "Rogeds Retical",
    subtitle: "Access point • Prior remote access, additional delegated",
    doctor: "Dr. Patel",
  },
];

const RECENT_VITALS = [
  { label: "BP", value: "101/105 mmHg", right: "102L" },
  { label: "HR", value: "68 bpm", right: "98 dc" },
  { label: "O2", value: "99 bp bpm", right: "43.2" },
  { label: "WT", value: "99 kg / bmi", right: "91 dx" },
];

const MINI_CARDS = [
  {
    title: "Last Vitals",
    tone: "blue",
    items: [
      "06S 1003 mcv",
      "Leaching",
    ],
    action: "View Snapshot",
    meta: "1 0 9 s x",
  },
  {
    title: "Active Medications",
    tone: "yellow",
    items: [
      "Enalapril two up 10 doses",
      "Metformin ur line os caused",
    ],
    action: "Prescribe Medication",
    meta: "5 x",
  },
  {
    title: "Recent Diagnoses",
    tone: "cyan",
    items: [
      "Flater",
      "Type 2 Diabetes",
    ],
    action: "View Full List",
    meta: "1 x",
  },
];

function toneClasses(
  tone: "yellow" | "red" | "purple" | "blue" | "slate" | "cyan",
) {
  switch (tone) {
    case "yellow":
      return "bg-amber-400/10 text-amber-300 border-amber-400/20";
    case "red":
      return "bg-rose-400/10 text-rose-300 border-rose-400/20";
    case "purple":
      return "bg-violet-400/10 text-violet-300 border-violet-400/20";
    case "blue":
      return "bg-sky-400/10 text-sky-300 border-sky-400/20";
    case "cyan":
      return "bg-cyan-400/10 text-cyan-300 border-cyan-400/20";
    default:
      return "bg-slate-400/10 text-slate-300 border-slate-400/20";
  }
}

function TopChip({
  label,
  value,
  tone,
  dropdown,
}: {
  label: string;
  value?: string;
  tone: "yellow" | "red" | "purple" | "blue" | "slate" | "cyan";
  dropdown?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${toneClasses(
        tone,
      )}`}
    >
      <span>{label}</span>
      {value ? <span className="text-[10px] opacity-80">{value}</span> : null}
      {dropdown ? <ChevronDown size={13} /> : null}
    </button>
  );
}

function SmallActionButton({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition ${
        active
          ? "border-[#35a8ff] bg-[#0c2c50] text-[#7fd0ff]"
          : "border-[#2d527b] bg-transparent text-[#dbeafe] hover:bg-[#102845]"
      }`}
    >
      {label}
    </button>
  );
}

export function EHRViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");

  const patient = useMemo(() => {
    return {
      ...MOCK_PATIENT,
      id: id ?? MOCK_PATIENT.id,
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#06162d] px-5 py-5 text-white">
      <div className="mx-auto max-w-[1280px]">
        <button
          onClick={() => navigate("/provider/patients")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#86a8ce] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to patients
        </button>

        <div className="overflow-hidden rounded-2xl border border-[#173a63] bg-[#081b35] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <div className="border-b border-[#173a63] px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#eef5ff]">
                      {patient.name}
                    </h1>
                    <span className="text-[18px] text-[#9eb9da]">
                      {patient.code}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[#8fb0d5]">
                    <span>{patient.sex}</span>
                    <span>{patient.age} years</span>
                    <span className="rounded bg-[#14345c] px-2 py-0.5 text-[#dbeafe]">
                      {patient.bloodGroup}
                    </span>
                    <span className="rounded bg-[#113a2d] px-2 py-0.5 text-[#70e2b1]">
                      {patient.genotype}
                    </span>
                    <span>{patient.phone}</span>
                  </div>

                  <div className="mt-3">
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#7fd0ff]"
                      type="button"
                    >
                      <Shield size={14} />
                      Retention Access
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <SmallActionButton label="Meet Recurer" />
                <SmallActionButton label="Add Record" />
                <SmallActionButton label="Payment Access" active />
              </div>
            </div>

            {/* Alert chips row */}
            <div className="mt-4 flex flex-wrap gap-2">
              {ALERT_CHIPS.map((chip) => (
                <TopChip
                  key={chip.label}
                  label={chip.label}
                  value={chip.value}
                  tone={chip.tone as any}
                  dropdown={chip.dropdown}
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#173a63] px-5">
            <div className="flex flex-wrap gap-2 py-3">
              {TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-md px-4 py-2 text-[13px] font-medium transition ${
                    tab === item
                      ? "bg-[#12355f] text-white border border-[#3d72ab]"
                      : "text-[#a0bad8] hover:bg-[#0e294b]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {tab !== "Overview" ? (
              <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-10 text-center">
                <p className="text-lg font-medium text-[#e8f1ff]">{tab}</p>
                <p className="mt-2 text-sm text-[#7fa0c7]">
                  Dummy content for now. Keep Overview as the default chart landing page.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                    <div className="mb-4 text-[22px] font-semibold text-[#eef5ff]">
                      Active Clinical Alerts
                    </div>

                    <div className="space-y-3">
                      {CLINICAL_ALERTS.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-lg bg-[#0d2443] px-3 py-3"
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              {item.tone === "yellow" ? (
                                <AlertTriangle size={16} className="text-amber-300" />
                              ) : item.tone === "red" ? (
                                <HeartPulse size={16} className="text-rose-300" />
                              ) : (
                                <Stethoscope size={16} className="text-sky-300" />
                              )}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#eef5ff]">
                                {item.title}
                              </div>
                              <div className="mt-1 text-[11px] text-[#7b9ac0]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14365d] text-[#8bc7ff]"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                    <div className="mb-4 text-[22px] font-semibold text-[#eef5ff]">
                      Recent Vitals
                    </div>

                    <div className="space-y-3">
                      {RECENT_VITALS.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-lg bg-[#0d2443] px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded bg-[#12355f] px-1.5 py-0.5 text-[10px] font-semibold text-[#9ccfff]">
                              {item.label}
                            </div>
                            <span className="text-[13px] text-[#e8f1ff]">
                              {item.value}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7b9ac0]">
                            {item.right}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-[12px] text-[#7b9ac0]">
                      Polioutter →
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-[22px] font-semibold text-[#eef5ff]">
                        Recent Timeline
                      </div>

                      <button
                        type="button"
                        className="inline-flex h-8 items-center gap-2 rounded-md border border-[#345f92] bg-[#102845] px-3 text-[12px] font-medium text-[#dbeafe]"
                      >
                        <ClipboardList size={14} />
                        Start Chart
                      </button>
                    </div>

                    <div className="mb-3 text-[11px] text-[#6d8eb6]">+ 0019</div>

                    <div className="space-y-3">
                      {RECENT_TIMELINE.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-lg bg-[#0d2443] px-4 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1b3458] text-[#aac8eb]">
                              <FileText size={15} />
                            </div>

                            <div>
                              <div className="text-[14px] font-semibold text-[#eef5ff]">
                                {item.title}
                              </div>
                              <div className="mt-1 text-[12px] text-[#7b9ac0]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex min-w-[160px] items-center justify-end gap-4">
                            <span className="text-[12px] text-[#c8daf0]">
                              {item.doctor}
                            </span>

                            <button
                              type="button"
                              className="inline-flex h-8 items-center rounded-md border border-[#3f6ea5] bg-[#0c2342] px-3 text-[12px] font-medium text-[#e8f1ff] hover:bg-[#13345e]"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    {MINI_CARDS.map((card, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#173a63] bg-[#0a1d39] p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`rounded p-1 ${
                                card.tone === "blue"
                                  ? "bg-sky-400/10 text-sky-300"
                                  : card.tone === "yellow"
                                  ? "bg-amber-400/10 text-amber-300"
                                  : "bg-cyan-400/10 text-cyan-300"
                              }`}
                            >
                              {idx === 0 ? (
                                <HeartPulse size={14} />
                              ) : idx === 1 ? (
                                <Pill size={14} />
                              ) : (
                                <Stethoscope size={14} />
                              )}
                            </div>

                            <div className="text-[15px] font-semibold text-[#eef5ff]">
                              {card.title}
                            </div>
                          </div>

                          <span className="text-[11px] text-[#7b9ac0]">
                            {card.meta}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {card.items.map((item) => (
                            <div
                              key={item}
                              className="text-[12px] text-[#c9daf0]"
                            >
                              {item}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-[#345f92] bg-[#102845] px-3 text-[12px] font-medium text-[#7fd0ff]"
                        >
                          {card.action}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-[#345f92] bg-[#102845] px-4 text-sm font-medium text-[#dbeafe]"
                    >
                      <Plus size={14} />
                      Add Diagnent
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-[#345f92] bg-[#102845] px-4 text-sm font-medium text-[#dbeafe]"
                    >
                      <Eye size={14} />
                      Good Reported
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}