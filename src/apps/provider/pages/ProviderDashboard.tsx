import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FilePenLine,
  FlaskConical,
  Search,
  Users,
} from "lucide-react";

type WorklistItem = {
  id: string;
  time: string;
  patient: string;
  subtitle: string;
  status: "WAITING" | "READY" | "REVIEW NEEDED" | "DUE";
  marker: "yellow" | "blue";
  next?: boolean;
};

type ScheduleItem = {
  id: string;
  time: string;
  patient: string;
  subtitle: string;
  status: "CHECKED-IN" | "READY" | "NEXT" | "OVERDUE";
  marker: "green" | "blue" | "yellow" | "slate";
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  bold?: string;
};

const KPI_CARDS = [
  {
    label: "Waiting Patients",
    value: 12,
    subtext: "4 since 9:00 AM",
    tone: "blue",
    icon: Users,
  },
  {
    label: "Active Encounters",
    value: 5,
    subtext: "2 require notes",
    tone: "green",
    icon: Activity,
  },
  {
    label: "Pending Lab Results",
    value: 9,
    subtext: "3 are abnormal",
    tone: "purple",
    icon: FlaskConical,
  },
  {
    label: "Tasks Due",
    value: 7,
    subtext: "follow-ups, notes, consent",
    tone: "yellow",
    icon: ClipboardList,
  },
];

const WORKLIST_TABS = [
  { key: "waiting", label: "Waiting" },
  { key: "scheduled", label: "Scheduled" },
  { key: "pending", label: "1 Pending Consent" },
  { key: "review", label: "2 Review Needed" },
];

const WORKLIST_ITEMS: WorklistItem[] = [
  {
    id: "w1",
    time: "09:00",
    patient: "Ngozi Adeleke",
    subtitle: "Antenatal",
    status: "WAITING",
    marker: "yellow",
  },
  {
    id: "w2",
    time: "10:30",
    patient: "Emeka Nwosu",
    subtitle: "Rx, status",
    status: "READY",
    marker: "blue",
    next: true,
  },
  {
    id: "w3",
    time: "10:30",
    patient: "Amara Obi",
    subtitle: "Hypertension Review",
    status: "READY",
    marker: "blue",
  },
  {
    id: "w4",
    time: "14:00",
    patient: "Jane Smith",
    subtitle: "BP Check",
    status: "REVIEW NEEDED",
    marker: "blue",
  },
  {
    id: "w5",
    time: "16:00",
    patient: "Segun Adekunle",
    subtitle: "",
    status: "DUE",
    marker: "yellow",
  },
];

const NEEDS_ATTENTION = [
  "3 abnormal labs awaiting review",
  "2 encounter notes unsigned",
  "4 hypertensive patients overdue follow-up",
  "1 allergy conflict with a medication",
];

const QUICK_ACTIONS = [
  { label: "New\nEncounter", icon: FilePenLine, to: "/provider/encounters/new" },
  { label: "Search\nPatient", icon: Search, to: "/provider/patients" },
  { label: "Scan QR /\nEnter Code", icon: Users, to: "/provider/patients" },
  { label: "Order Lab", icon: ClipboardList, to: "/provider/orders/labs" },
];

const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: "s1",
    time: "09:00",
    patient: "Ngozi Adeleke",
    subtitle: "Antenatal",
    status: "CHECKED-IN",
    marker: "green",
  },
  {
    id: "s2",
    time: "10:30",
    patient: "Amara Obi",
    subtitle: "Hypertension Review",
    status: "READY",
    marker: "green",
  },
  {
    id: "s3",
    time: "12:00",
    patient: "Emeka Nwosu",
    subtitle: "Cardiac Follow-up",
    status: "NEXT",
    marker: "blue",
  },
  {
    id: "s4",
    time: "14:00",
    patient: "Jane Smith",
    subtitle: "",
    status: "OVERDUE",
    marker: "yellow",
  },
  {
    id: "s5",
    time: "16:00",
    patient: "Segun Adekunle",
    subtitle: "",
    status: "READY",
    marker: "slate",
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    title: "Encounter opened for John Doe",
    subtitle: "2 follow-up",
    bold: "John Doe",
  },
  {
    id: "a2",
    title: "Lab order submitted for Amara Obi",
    subtitle: "2 follow-up",
    bold: "Amara Obi",
  },
  {
    id: "a3",
    title: "Prescription drafted for Jane Smith",
    subtitle: "3 follow-up",
    bold: "Jane Smith",
  },
];

function cardTone(tone: "blue" | "green" | "purple" | "yellow") {
  switch (tone) {
    case "blue":
      return {
        bg: "bg-[#10294a]",
        icon: "text-[#4cb7ff]",
        sub: "text-[#7ed0ff]",
      };
    case "green":
      return {
        bg: "bg-[#0f2c28]",
        icon: "text-[#19d3a2]",
        sub: "text-[#f4b942]",
      };
    case "purple":
      return {
        bg: "bg-[#21153f]",
        icon: "text-[#b067ff]",
        sub: "text-[#ff6f91]",
      };
    default:
      return {
        bg: "bg-[#2c2412]",
        icon: "text-[#f3c14b]",
        sub: "text-[#f3c14b]",
      };
  }
}

function markerColor(color: "yellow" | "blue" | "green" | "slate") {
  switch (color) {
    case "yellow":
      return "bg-[#f0b53a]";
    case "blue":
      return "bg-[#3b82f6]";
    case "green":
      return "bg-[#10b981]";
    default:
      return "bg-[#516b8b]";
  }
}

function statusPill(status: WorklistItem["status"] | ScheduleItem["status"]) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide";
  switch (status) {
    case "WAITING":
      return `${base} bg-[#4a3513] text-[#f1be5f]`;
    case "READY":
      return `${base} bg-[#0f3a33] text-[#37d4a7]`;
    case "REVIEW NEEDED":
      return `${base} bg-[#4a3513] text-[#f1be5f]`;
    case "DUE":
      return `${base} bg-[#4a3513] text-[#f1be5f]`;
    case "CHECKED-IN":
      return `${base} bg-[#0f3a33] text-[#37d4a7]`;
    case "NEXT":
      return `${base} bg-[#16385e] text-[#59b9ff]`;
    case "OVERDUE":
      return `${base} bg-[#4a3513] text-[#f1be5f]`;
    default:
      return `${base} bg-[#16385e] text-[#59b9ff]`;
  }
}

export function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("waiting");

  const worklistItems = useMemo(() => WORKLIST_ITEMS, []);

  return (
    <div className="min-h-screen bg-[#06162d] px-6 py-5 text-white">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#eaf2ff]">
            Overview
          </h1>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            const tone = cardTone(card.tone as any);

            return (
              <button
                key={card.label}
                type="button"
                className="rounded-2xl border border-[#173a63] bg-[#081b35] p-5 text-left shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition hover:border-[#24558b]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tone.bg}`}
                  >
                    <Icon size={22} className={tone.icon} />
                  </div>
                  <span className="text-[#2f4f74]">⌁</span>
                </div>

                <div className="text-[42px] font-semibold leading-none tracking-[-0.03em] text-[#eef5ff]">
                  {card.value}
                </div>
                <div className="mt-2 text-[16px] text-[#d5e2f2]">{card.label}</div>
                <div className={`mt-3 text-[14px] ${tone.sub}`}>{card.subtext}</div>
              </button>
            );
          })}

          <div className="rounded-2xl border border-[#173a63] bg-[#081b35] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
            <div className="h-full min-h-[170px] rounded-2xl bg-[linear-gradient(90deg,#143559_0%,#10294a_50%,#0a1f3d_100%)] p-5">
              <div className="mb-6 text-3xl text-[#6e8eb4]">—</div>
              <div className="text-[28px] font-medium text-[#7ecfff]">
                Ougoing vilanl
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Worklist */}
            <div className="rounded-[24px] border border-[#173a63] bg-[#081b35] shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <div className="border-b border-[#16345a] px-6 pt-5">
                <div className="flex items-center justify-between">
                  <div className="text-[20px] font-semibold text-[#eef5ff]">
                    Today&apos;s Worklist
                  </div>

                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#21466f] bg-[#0c2342] text-[#88abd2]">
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-7 text-[15px]">
                  {WORKLIST_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative pb-4 ${
                        activeTab === tab.key
                          ? "text-[#eaf2ff]"
                          : "text-[#8ca7c8]"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#59b9ff]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="mb-3 flex items-center justify-between text-[13px] text-[#708eb3]">
                  <div>✣ 310:3</div>
                  <div className="inline-flex items-center gap-2">
                    <span>Toot Tasis</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="space-y-1">
                  {worklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[24px_64px_minmax(0,1fr)_150px] items-center gap-4 rounded-xl px-2 py-4 transition hover:bg-[#0c2342]"
                    >
                      <div className="flex justify-center">
                        <span
                          className={`h-3 w-3 rounded-full ${markerColor(item.marker)}`}
                        />
                      </div>

                      <div className="text-[17px] font-medium text-[#b9cbe1]">
                        {item.time}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[18px] font-semibold text-[#eef5ff]">
                            {item.patient}
                          </span>
                          {item.next && (
                            <span className="inline-flex rounded-full bg-[#16385e] px-2 py-0.5 text-[11px] font-semibold text-[#59b9ff]">
                              NEXT
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[14px] text-[#6f8db2]">
                          {item.subtitle}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <span className="text-[#37577d]">◔</span>
                        <span className={statusPill(item.status)}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-[#6e8eb4]">
                  <button className="rounded-lg border border-[#21466f] bg-[#0c2342] px-3 py-2">
                    ‹
                  </button>
                  <button className="rounded-lg border border-[#21466f] bg-[#0c2342] px-3 py-2">
                    ‹
                  </button>
                  <span className="px-2 text-[15px] text-[#dce9fb]">1 - 4</span>
                  <button className="rounded-lg border border-[#21466f] bg-[#0c2342] px-3 py-2">
                    ›
                  </button>
                  <button className="rounded-lg border border-[#21466f] bg-[#0c2342] px-3 py-2">
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded-[24px] border border-[#173a63] bg-[#081b35] shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <div className="flex items-center justify-between px-6 pb-2 pt-5">
                <div className="inline-flex items-center gap-3 text-[20px] font-semibold text-[#eef5ff]">
                  <CalendarDays size={20} className="text-[#7fd0ff]" />
                  Today&apos;s Schedule
                </div>

                <div className="inline-flex items-center gap-3">
                  <span className="text-[16px] text-[#d7e5f8]">1:3 of 8</span>
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#21466f] bg-[#0c2342] text-[#88abd2]">
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-5 pt-2">
                <div className="relative">
                  <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[#153557]" />

                  <div className="space-y-2">
                    {SCHEDULE_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate("/provider/patients")}
                        className={`relative flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition hover:bg-[#0c2342] ${
                          item.status === "READY" ? "bg-[#0d2443]" : ""
                        }`}
                      >
                        <span
                          className={`absolute left-[6px] h-3 w-3 rounded-full ${markerColor(
                            item.marker,
                          )}`}
                        />

                        <div className="w-[58px] flex-shrink-0 text-[17px] font-medium text-[#b9cbe1]">
                          {item.time}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="truncate text-[18px] font-semibold text-[#eef5ff]">
                              {item.patient}
                            </span>
                            {item.status === "NEXT" && (
                              <span className="inline-flex rounded-full bg-[#16385e] px-2 py-0.5 text-[11px] font-semibold text-[#59b9ff]">
                                NEXT
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[14px] text-[#6f8db2]">
                            {item.subtitle}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={statusPill(item.status)}>{item.status}</span>
                          <CheckCircle2 size={17} className="text-[#24d3a3]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Needs attention */}
            <div className="rounded-[24px] border border-[#173a63] bg-[#081b35] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <div className="mb-6 inline-flex items-center gap-3 text-[20px] font-semibold text-[#eef5ff]">
                <AlertCircle size={20} className="text-[#ff6688]" />
                Needs Attention
              </div>

              <div className="space-y-5">
                {NEEDS_ATTENTION.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-[16px] text-[#dbe7f7]">
                    <span className="mt-1 text-[#ff8b7c]">◔</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#21466f] bg-[#0c2342] text-[16px] font-medium text-[#e9f2ff]">
                Review All
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="rounded-[24px] border border-[#173a63] bg-[#081b35] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <div className="mb-6 flex items-center justify-between">
                <div className="text-[20px] font-semibold text-[#eef5ff]">
                  Quick Actions
                </div>
                <button className="text-[15px] text-[#59b9ff]">View all →</button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.to)}
                      className="flex min-h-[124px] flex-col items-center justify-center rounded-2xl border border-[#21466f] bg-[#0c2342] px-3 py-4 text-center transition hover:bg-[#102b4a]"
                    >
                      <div className="mb-4 rounded-xl bg-[#10294a] p-3">
                        <Icon size={20} className="text-[#7fd0ff]" />
                      </div>
                      <div className="whitespace-pre-line text-[14px] font-medium leading-5 text-[#e8f1ff]">
                        {action.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-[24px] border border-[#173a63] bg-[#081b35] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <div className="mb-6 flex items-center justify-between">
                <div className="text-[20px] font-semibold text-[#eef5ff]">
                  Recent Activity
                </div>
                <button className="text-[15px] text-[#59b9ff]">View all activity →</button>
              </div>

              <div className="space-y-5">
                {RECENT_ACTIVITY.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="mt-1 rounded-full border border-[#2a4d75] p-2 text-[#8aaed5]">
                      <Users size={14} />
                    </div>

                    <div>
                      <div className="text-[16px] leading-6 text-[#dce8f8]">
                        {item.title.split(item.bold ?? "").map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && (
                              <span className="font-semibold text-[#eef5ff]">
                                {item.bold}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-1 text-[14px] text-[#6f8db2]">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}