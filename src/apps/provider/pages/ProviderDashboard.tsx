import React from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardList,
  FileUp,
  Eye,
  Plus,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const alertItems = [
  "3 abnormal labs awaiting review",
  "2 encounter notes unsigned",
  "4 hypertensive patients overdue follow-up",
  "1 allergy conflict with medication",
];

const worklist = [
  {
    patientName: "John Doe",
    time: "09:30 AM",
    visitType: "Consultation",
    status: "Waiting",
  },
  {
    patientName: "Jane Smith",
    time: "05:00 AM",
    visitType: "Consultation",
    status: "Ready",
  },
  {
    patientName: "Mark Lee",
    time: "01:30 AM",
    visitType: "Consultation",
    status: "Critical",
  },
  {
    patientName: "Cheng Liu",
    time: "10:30 AM",
    visitType: "Consultation",
    status: "In Progress",
  },
];

const requests = [
  "John Doe — Lab access",
  "Mary Jane — Full record",
  "Clinic A — Emergency access",
];

const activities = [
  "Lab result uploaded for John Doe",
  "Access granted to CityLab Diagnostics",
  "Prescription added for Mary Jane",
  "Record shared with Reddington Hospital",
];

const summaryCards = [
  {
    title: "Waiting Patient",
    value: "13",
    dot: "bg-yellow-400",
    border: "border-yellow-300",
  },
  {
    title: "Active Encounters",
    value: "13",
    dot: "bg-blue-500",
    border: "border-blue-300",
  },
  {
    title: "Pending Labs",
    value: "13",
    dot: "bg-orange-400",
    border: "border-orange-300",
  },
  {
    title: "Task Due",
    value: "13",
    dot: "bg-red-500",
    border: "border-red-300",
  },
];

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-300 bg-white/55 shadow-[0_2px_10px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-800">
        {children}
      </h2>
      {right}
    </div>
  );
}

function StatusText({ status }) {
  const styles = {
    Waiting: "text-amber-500",
    Ready: "text-emerald-600",
    Critical: "text-red-500",
    "In Progress": "text-blue-500",
  };

  return (
    <span className={`text-[13px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function SummaryCard({ title, value, dot, border }) {
  return (
    <div
      className={`rounded-xl border-2 ${border} bg-white px-4 py-3 shadow-sm min-h-[84px]`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-[15px] font-semibold text-slate-700">{title}</p>
      </div>
      <p className="text-[34px] font-bold leading-none text-slate-800">
        {value}
      </p>
    </div>
  );
}

function QuickAction({ icon: Icon, label }) {
  return (
    <button className="flex h-[86px] w-[108px] flex-col items-center justify-center rounded-xl border border-slate-300 bg-slate-50 transition hover:bg-white">
      <div className="mb-2 rounded-full bg-white p-2.5 shadow-sm">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <span className="text-center text-[12px] font-medium leading-4 text-slate-700">
        {label}
      </span>
    </button>
  );
}

export function ProviderDashboard() {
  return (
    <div className="min-h-screen bg-[#dfe8f3] p-4 md:p-6">
      <div className="mx-auto max-w-[1440px] space-y-5 rounded-[22px] border border-slate-300 bg-[#dfe8f3] p-1">
        <div className="grid grid-cols-2 gap-3">

        <Card className="p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-800">
              Needs Attention
            </h1>
          </div>

          <div className="space-y-4 pl-1">
            {alertItems.map((item) => (
              <button
                key={item}
                className="flex items-center gap-2 text-left text-[14px] text-slate-700 hover:text-slate-900"
              >
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>{item}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          <button className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-slate-700 hover:text-slate-900">
            Review All <ArrowRight className="h-4 w-4" />
          </button>
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle
              right={
                <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                  <span>Recent Activity</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-2 text-slate-800">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{" "}
                    Live
                  </span>
                </div>
              }
            >
              <span className="sr-only">Recent Activity</span>
            </SectionTitle>
          </div>

          <p className="mb-4 text-[12px] text-slate-500">
            Live updates across your system
          </p>

          <div className="space-y-4">
            {activities.map((item, index) => (
              <div key={item} className="flex gap-3 text-[13px] text-slate-600">
                <div className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100">
                  {index === 0 && <Eye className="h-2.5 w-2.5" />}
                  {index === 1 && <Check className="h-2.5 w-2.5" />}
                  {index === 2 && <ClipboardList className="h-2.5 w-2.5" />}
                  {index === 3 && <ChevronRight className="h-2.5 w-2.5" />}
                </div>
                <div>
                  <p>{item}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {index === 0 && "10 mins ago"}
                    {index === 1 && "25 mins ago"}
                    {index === 2 && "1 hour ago"}
                    {index === 3 && "2 hours ago"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>

         <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </div>


        <Card className="p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.65fr_0.7fr]">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2">
                <div>
                  <SectionTitle>Today’s Worklist</SectionTitle>
                  <div className="-mt-2 flex gap-5 text-[12px] text-slate-500">
                    <span>12 patients</span>
                    <span>5 waiting</span>
                    <span>3 ready</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
                <table className="w-full text-left">
                  <thead className="bg-[#dbe4ef] text-[12px] font-semibold text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Patient Name</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Visit Type</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worklist.map((item, index) => (
                      <tr
                        key={item.patientName}
                        className={
                          index !== worklist.length - 1
                            ? "border-b border-slate-200"
                            : ""
                        }
                      >
                        <td className="px-3 py-3 text-[13px] text-slate-700">
                          {item.patientName}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-slate-600">
                          {item.time}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-slate-600">
                          {item.visitType}
                        </td>
                        <td className="px-3 py-3">
                          <StatusText status={item.status} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button className="rounded border border-slate-400 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
                              View
                            </button>
                            <button className="rounded bg-emerald-600 px-3 py-1 text-[12px] font-semibold text-white hover:bg-emerald-700">
                              Start
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl bg-white/35 p-3">
              <h3 className="mb-4 text-[18px] font-semibold text-slate-800">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={Plus} label="New Encounter" />
                <QuickAction icon={ShieldCheck} label="Request Access" />
                <QuickAction icon={QrCode} label="Search Patient QR" />
                <QuickAction icon={FileUp} label="Lab Order" />
              </div>
            </div>
          </div>
        </Card>

       
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <SectionTitle>Access Control</SectionTitle>
            <div className="grid grid-cols-[1fr_auto] items-start gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <h4 className="text-[18px] font-semibold text-slate-800">
                    Pending Requests
                  </h4>
                </div>
                <ul className="space-y-2 pl-4 text-[13px] text-slate-600">
                  {requests.map((item) => (
                    <li key={item} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-slate-700">
                  View All <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="pr-3 text-[44px] font-bold leading-none text-slate-800">
                07
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle
                right={
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                    <span>Recent Activity</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-2 text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{" "}
                      Live
                    </span>
                  </div>
                }
              >
                <span className="sr-only">Recent Activity</span>
              </SectionTitle>
            </div>

            <p className="mb-4 text-[12px] text-slate-500">
              Live updates across your system
            </p>

            <div className="space-y-4">
              {activities.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-3 text-[13px] text-slate-600"
                >
                  <div className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100">
                    {index === 0 && <Eye className="h-2.5 w-2.5" />}
                    {index === 1 && <Check className="h-2.5 w-2.5" />}
                    {index === 2 && <ClipboardList className="h-2.5 w-2.5" />}
                    {index === 3 && <ChevronRight className="h-2.5 w-2.5" />}
                  </div>
                  <div>
                    <p>{item}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {index === 0 && "10 mins ago"}
                      {index === 1 && "25 mins ago"}
                      {index === 2 && "1 hour ago"}
                      {index === 3 && "2 hours ago"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
