import React from "react";
import {
  Activity,
  ChevronRight,
  DownloadCloud,
  FileText,
  Search,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

type RecordItem = {
  id: string;
  title: string;
  provider: string;
  date: string;
  status: string;
  type: string;
  summary: string;
  tags?: string[];
  journeyId?: string;
};

type JourneyItem = {
  id: string;
  title: string;
};

type RecordsTimelineSectionProps = {
  search: string;
  setSearch: (value: string) => void;
  activeType: string;
  setActiveType: (value: string) => void;
  filtered: RecordItem[];
  journeys: JourneyItem[];
  FILTER_TYPES: string[];
  TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>>;
  TYPE_COLORS: Record<string, string>;
  navigate: (path: string) => void;
  setWizardOpen: (open: boolean) => void;
};

export function RecordsTimelineSection({
  search,
  setSearch,
  activeType,
  setActiveType,
  filtered,
  journeys,
  FILTER_TYPES,
  TYPE_ICONS,
  TYPE_COLORS,
  navigate,
  setWizardOpen,
}: RecordsTimelineSectionProps) {
  const groupedRecords = filtered.reduce<Record<string, RecordItem[]>>((acc, rec) => {
    const date = new Date(rec.date);
    const monthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }

    acc[monthYear].push(rec);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9ca3af" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-light w-full"
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Search records, providers, tags…"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              type="button"
            >
              <X size={14} style={{ color: "#9ca3af" }} />
            </button>
          )}
        </div>

        <button type="button" className="btn btn-patient-outline gap-2 text-sm">
          <DownloadCloud size={15} /> Export WelliFile
        </button>

        <button
          type="button"
          className="btn btn-patient gap-2"
          onClick={() => setWizardOpen(true)}
        >
          <UploadCloud size={16} /> Upload Record
        </button>
      </div>

      {/* Type filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: activeType === t ? "#1a6b42" : "rgba(26,107,66,.06)",
              color: activeType === t ? "#fff" : "#1a6b42",
              border: `1px solid ${
                activeType === t ? "#1a6b42" : "rgba(26,107,66,.2)"
              }`,
            }}
          >
            {t}
          </button>
        ))}

        <span className="ml-auto self-center text-xs" style={{ color: "#9ca3af" }}>
          {filtered.length} records
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div
          className="absolute bottom-0 left-5 top-0 w-0.5"
          style={{ background: "var(--pat-border)" }}
        />

        <div className="space-y-4 pl-14">
          {filtered.length === 0 ? (
            <div className="card-patient p-8 text-center">
              <Search
                size={28}
                className="mx-auto mb-3"
                style={{ color: "#c8dfd0" }}
              />
              <p className="font-semibold" style={{ color: "#5a7a63" }}>
                No matching records
              </p>
              <p className="mt-1 text-sm" style={{ color: "#9ca3af" }}>
                Try a different search term or filter
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveType("All");
                }}
                type="button"
                className="btn btn-patient-outline mt-4 gap-1.5 text-sm"
              >
                <X size={13} /> Clear filters
              </button>
            </div>
          ) : (
            Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
              <div key={monthYear} className="relative mb-10 last:mb-0">
                <div
                  className="absolute -left-12 top-0 z-10 mt-2 whitespace-nowrap rounded-full border bg-white px-2 py-1 text-xs font-bold shadow-sm"
                  style={{
                    color: "#1a6b42",
                    borderColor: "var(--pat-border)",
                  }}
                >
                  {monthYear}
                </div>

                <div className="mt-10 space-y-6">
                  {monthRecords.map((rec) => {
                    const Icon = TYPE_ICONS[rec.type] ?? FileText;
                    const color = TYPE_COLORS[rec.type] ?? "#1a6b42";
                    const i = globalIndex++;

                    return (
                      <div
                        key={rec.id}
                        className="relative animate-fade-in-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div
                          className="absolute -left-9 top-4 z-10 h-4 w-4 rounded-full border-2 border-white shadow"
                          style={{ background: color }}
                        />

                        <div
                          className="card-patient cursor-pointer p-5 transition-shadow hover:shadow-md"
                          onClick={() =>
                            navigate(
                              `/patient/history/${encodeURIComponent(rec.type)}`
                            )
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                              style={{ background: `${color}15` }}
                            >
                              <Icon size={20} style={{ color }} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div
                                    className="font-bold"
                                    style={{ color: "#1a2e1e" }}
                                  >
                                    {rec.title}
                                  </div>
                                  <div
                                    className="mt-0.5 text-xs"
                                    style={{ color: "#5a7a63" }}
                                  >
                                    {rec.provider} ·{" "}
                                    {new Date(rec.date).toLocaleDateString("en-NG", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`badge ${
                                        rec.status === "Verified"
                                          ? "badge-active"
                                          : "badge-pending"
                                      }`}
                                    >
                                      {rec.status}
                                    </span>

                                    {rec.status === "Verified" && (
                                      <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                        <ShieldCheck size={12} />
                                        WelliChain Verified
                                      </span>
                                    )}
                                  </div>

                                  <span
                                    className="rounded-full px-2 py-0.5 text-xs"
                                    style={{
                                      background: `${color}12`,
                                      color,
                                    }}
                                  >
                                    {rec.type}
                                  </span>
                                </div>
                              </div>

                              <p
                                className="mt-3 text-sm leading-relaxed"
                                style={{ color: "#5a7a63" }}
                              >
                                {rec.summary}
                              </p>

                              {rec.journeyId &&
                                (() => {
                                  const journey = journeys.find(
                                    (j) => j.id === rec.journeyId
                                  );
                                  if (!journey) return null;

                                  return (
                                    <div
                                      className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold shadow-sm transition-shadow hover:shadow-md"
                                      style={{
                                        background:
                                          "linear-gradient(to right, #f0fdf4, #ecfdf5)",
                                        color: "#10b981",
                                        border: "1px solid #10b98155",
                                      }}
                                    >
                                      <Activity size={14} />
                                      Part of {journey.title}
                                      <ChevronRight
                                        size={14}
                                        className="ml-1 opacity-50"
                                      />
                                    </div>
                                  );
                                })()}

                              {rec.tags && rec.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                  {rec.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                                      style={{
                                        background: "rgba(26,107,66,.06)",
                                        color: "#1a6b42",
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}