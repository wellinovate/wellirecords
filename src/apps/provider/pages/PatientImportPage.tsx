import React, { useState, useCallback, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload, Users, CheckCircle, AlertCircle, Clock, BarChart3,
  Search, Filter, ChevronDown, X, RefreshCw, FileSpreadsheet,
  UserCheck, UserX, Link2, Mail, Phone, Calendar, MessageSquare,
  ArrowUpRight, Zap, TrendingUp, Download, Copy, Check, ExternalLink,
  Shield, AlertTriangle
} from "lucide-react";
import {
  importLocalCustomers,
  getLocalCustomers,
  getLocalCustomerStats,
  confirmMatch,
  dismissMatch,
  sendInvitation,
  bulkSendInvitations,
  type LocalCustomer,
  type ImportResult,
  type LocalCustomerStats,
} from "@/shared/api/localCustomersApi";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#060d18",
  surface:  "#0b1628",
  card:     "#0f1e35",
  border:   "#1a2d4a",
  text:     "#e2eaf5",
  muted:    "#6b82a0",
  accent:   "#3b82f6",
  success:  "#10b981",
  warning:  "#f59e0b",
  purple:   "#8b5cf6",
  danger:   "#ef4444",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function MatchBadge({ status }: { status: LocalCustomer["matchStatus"] }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    matched:        { label: "Linked",         color: "#10b981", bg: "rgba(16,185,129,.12)" },
    possible_match: { label: "Possible Match",  color: "#8b5cf6", bg: "rgba(139,92,246,.12)" },
    new:            { label: "Not Registered",  color: "#6b82a0", bg: "rgba(107,130,160,.10)" },
    pending:        { label: "Pending",         color: "#f59e0b", bg: "rgba(245,158,11,.10)"  },
    failed:         { label: "Error",           color: "#ef4444", bg: "rgba(239,68,68,.12)"   },
  };
  const c = cfg[status] ?? cfg.new;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

function InviteBadge({ status }: { status: LocalCustomer["invitationStatus"] }) {
  const cfg: Record<string, { label: string; color: string }> = {
    not_sent:   { label: "Not Invited",   color: "#6b82a0" },
    sent:       { label: "Invited",       color: "#3b82f6" },
    opened:     { label: "Opened",        color: "#f59e0b" },
    registered: { label: "Registered",   color: "#10b981" },
    linked:     { label: "Linked",        color: "#10b981" },
    expired:    { label: "Expired",       color: "#ef4444" },
  };
  const c = cfg[status] ?? cfg.not_sent;
  return <span className="text-xs font-medium" style={{ color: c.color }}>{c.label}</span>;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.muted }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tabular-nums" style={{ color: T.text }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: T.muted }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────
function DropZone({ onRows }: { onRows: (rows: Record<string, any>[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    setParseError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
        if (rows.length === 0) {
          setParseError("The file appears to be empty.");
          return;
        }
        onRows(rows);
      } catch {
        setParseError("Could not parse file. Please use CSV or XLSX format.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onRows]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 p-12 transition-all"
      style={{
        borderColor: dragging ? T.accent : T.border,
        background: dragging ? `${T.accent}08` : T.surface,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
      />
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${T.accent}15` }}>
        <FileSpreadsheet size={32} color={T.accent} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold" style={{ color: T.text }}>
          {fileName ? fileName : "Drop your CSV or Excel file here"}
        </p>
        <p className="text-sm mt-1" style={{ color: T.muted }}>
          Supports .csv, .xlsx, .xls — up to 5,000 rows per import
        </p>
      </div>
      {parseError && (
        <p className="text-sm font-medium" style={{ color: T.danger }}>{parseError}</p>
      )}
      <button
        className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: `${T.accent}20`, color: T.accent }}
      >
        Browse Files
      </button>
    </div>
  );
}

// ─── Preview table ────────────────────────────────────────────────────────────
function PreviewTable({ rows }: { rows: Record<string, any>[] }) {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  const preview = rows.slice(0, 5);
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: T.border }}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: T.card }}>
              {keys.map((k) => (
                <th key={k} className="px-3 py-2.5 text-left font-semibold" style={{ color: T.muted }}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2" style={{ color: T.text }}>
                    {String(row[k] ?? "").slice(0, 40) || <span style={{ color: T.muted }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 5 && (
        <div className="px-3 py-2 text-xs" style={{ color: T.muted, background: T.card }}>
          + {rows.length - 5} more rows
        </div>
      )}
    </div>
  );
}

// ─── Import result card ───────────────────────────────────────────────────────
function ImportResultCard({ result, onDone }: { result: ImportResult; onDone: () => void }) {
  const items = [
    { label: "Matched to WelliRecord",  value: result.matched,       color: T.success, icon: UserCheck },
    { label: "Possible Matches",        value: result.possibleMatch, color: T.purple,  icon: AlertCircle },
    { label: "New (not yet registered)",value: result.new,           color: T.muted,   icon: Users },
    { label: "Duplicates Skipped",      value: result.duplicatesSkipped, color: T.warning, icon: RefreshCw },
    { label: "Errors",                  value: result.failed,        color: T.danger,  icon: X },
  ];
  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: T.card, border: `1px solid ${T.success}40` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${T.success}20` }}>
          <CheckCircle size={20} color={T.success} />
        </div>
        <div>
          <p className="font-bold" style={{ color: T.text }}>Import Complete</p>
          <p className="text-sm" style={{ color: T.muted }}>{result.processed.toLocaleString()} of {result.total.toLocaleString()} rows processed</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl p-3" style={{ background: T.surface }}>
            <p className="text-2xl font-bold tabular-nums" style={{ color: item.color }}>{item.value.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: T.muted }}>{item.label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onDone}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: T.accent, color: "#fff" }}
      >
        View Customer List →
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function PatientImportPage() {
  const [activeTab, setActiveTab] = useState<"import" | "customers" | "dashboard">("import");

  // Import tab state
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Customer list state
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [inviteFilter, setInviteFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dashboard state
  const [stats, setStats] = useState<LocalCustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals & Action State
  const [reviewCustomer, setReviewCustomer] = useState<LocalCustomer | null>(null);
  const [inviteModal, setInviteModal] = useState<{ customer: LocalCustomer; link: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bulkInviting, setBulkInviting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Load customers ──────────────────────────────────────────────────────────
  const loadCustomers = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await getLocalCustomers(page, 20, {
        matchStatus: matchFilter || undefined,
        invitationStatus: inviteFilter || undefined,
        search: search || undefined,
      });
      setCustomers(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (e) {
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [page, matchFilter, inviteFilter, search]);

  useEffect(() => {
    if (activeTab === "customers") loadCustomers();
  }, [activeTab, loadCustomers]);

  // ── Load stats ──────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await getLocalCustomerStats();
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") loadStats();
  }, [activeTab, loadStats]);

  // ── Handle import ───────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    try {
      const result = await importLocalCustomers(parsedRows);
      setImportResult(result);
      setParsedRows([]);
    } catch (e: any) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  // ── Handle match actions ────────────────────────────────────────────────────
  const handleConfirmMatch = async (customer: LocalCustomer, candidateUserId: string) => {
    try {
      const updated = await confirmMatch(customer._id, candidateUserId);
      setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setReviewCustomer(null);
      showNotification(`Successfully linked ${customer.fullName} to WelliRecord patient!`);
    } catch (e) { console.error(e); }
  };

  const handleDismissMatch = async (customer: LocalCustomer) => {
    try {
      const updated = await dismissMatch(customer._id);
      setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setReviewCustomer(null);
      showNotification(`Match dismissed for ${customer.fullName}. Marked as local record.`);
    } catch (e) { console.error(e); }
  };

  // ── Handle invitation actions ───────────────────────────────────────────────
  const handleSingleInvite = async (customer: LocalCustomer) => {
    try {
      const res = await sendInvitation(customer._id);
      setCustomers((prev) => prev.map((c) => (c._id === customer._id ? res.customer : c)));
      const fullUrl = `${window.location.origin}/join/${res.token}`;
      setInviteModal({ customer: res.customer, link: fullUrl });
    } catch (e) {
      console.error(e);
      showNotification("Failed to generate invitation.");
    }
  };

  const handleBulkInvite = async () => {
    setBulkInviting(true);
    try {
      const res = await bulkSendInvitations();
      showNotification(`Bulk invitations generated for ${res.totalInvited} patients!`);
      loadCustomers();
    } catch (e) {
      console.error(e);
      showNotification("Bulk invitation failed.");
    } finally {
      setBulkInviting(false);
    }
  };

  const tabs = [
    { id: "import" as const,     label: "Import",    icon: Upload },
    { id: "customers" as const,  label: "Customers", icon: Users },
    { id: "dashboard" as const,  label: "Dashboard", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ background: T.bg, color: T.text }}>
      {/* ── Toast Banner ───────────────────────────────────────────────────── */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl font-semibold text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${T.accent}20` }}>
            <Link2 size={20} color={T.accent} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: T.text }}>WelliBridge Connect</h1>
            <p className="text-sm" style={{ color: T.muted }}>Patient linking & migration engine</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: T.surface }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === id ? T.accent : "transparent",
              color: activeTab === id ? "#fff" : T.muted,
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Import Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "import" && (
        <div className="max-w-3xl space-y-5">
          {importResult ? (
            <ImportResultCard
              result={importResult}
              onDone={() => { setImportResult(null); setActiveTab("customers"); }}
            />
          ) : (
            <>
              {/* Supported fields info */}
              <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-sm font-semibold mb-3" style={{ color: T.text }}>Supported Columns</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs" style={{ color: T.muted }}>
                  {[
                    ["Full Name / Name", "Required"],
                    ["Phone / Mobile", "Required"],
                    ["Email", "Recommended"],
                    ["Customer ID", "Optional"],
                    ["Date of Birth", "Optional"],
                    ["Gender", "Optional"],
                    ["Address", "Optional"],
                    ["HMO", "Optional"],
                    ["Last Visit", "Optional"],
                  ].map(([field, req]) => (
                    <div key={field} className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: req === "Required" ? T.success : T.border }}
                      />
                      <span>{field}</span>
                      {req === "Required" && (
                        <span className="text-xs font-bold" style={{ color: T.success }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: T.muted }}>
                  Column names are flexible — use your own headers (e.g. "customer_id", "Customer ID", "customerId" all work).
                </p>
              </div>

              <DropZone onRows={(rows) => setParsedRows(rows)} />

              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: T.text }}>
                      Preview — {parsedRows.length.toLocaleString()} rows detected
                    </p>
                    <button onClick={() => setParsedRows([])} className="text-xs" style={{ color: T.muted }}>
                      Clear
                    </button>
                  </div>
                  <PreviewTable rows={parsedRows} />
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: importing ? `${T.accent}60` : T.accent,
                      color: "#fff",
                      cursor: importing ? "not-allowed" : "pointer",
                    }}
                  >
                    {importing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Running matching engine…</>
                    ) : (
                      <><Zap size={16} /> Import & Match {parsedRows.length.toLocaleString()} Customers</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Customers Tab ──────────────────────────────────────────────────── */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                <input
                  type="text"
                  placeholder="Search name, phone, email…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
                />
              </div>
              <select
                value={matchFilter}
                onChange={(e) => { setMatchFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl text-sm"
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
              >
                <option value="">All Match Statuses</option>
                <option value="matched">Linked</option>
                <option value="possible_match">Possible Match</option>
                <option value="new">Not Registered</option>
                <option value="failed">Error</option>
              </select>
              <select
                value={inviteFilter}
                onChange={(e) => { setInviteFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl text-sm"
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
              >
                <option value="">All Invitation Statuses</option>
                <option value="not_sent">Not Invited</option>
                <option value="sent">Invited</option>
                <option value="opened">Opened</option>
                <option value="registered">Registered</option>
                <option value="linked">Linked</option>
                <option value="expired">Expired</option>
              </select>
              <button
                onClick={loadCustomers}
                className="px-3 py-2 rounded-xl transition-colors"
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted }}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <button
              onClick={handleBulkInvite}
              disabled={bulkInviting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              {bulkInviting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Mail size={14} />
              )}
              <span>Bulk Invite All Uninvited</span>
            </button>
          </div>

          <p className="text-xs" style={{ color: T.muted }}>
            {totalCount.toLocaleString()} customers
          </p>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.card }}>
                    {["Customer", "Phone / Email", "Match Status", "Invitation", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: T.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-sm" style={{ color: T.muted }}>
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                        Loading…
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-sm" style={{ color: T.muted }}>
                        No customers found.{" "}
                        <button onClick={() => setActiveTab("import")} style={{ color: T.accent }}>
                          Import customers →
                        </button>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c._id} style={{ borderTop: `1px solid ${T.border}` }}>
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: T.text }}>{c.fullName}</p>
                          {c.externalId && (
                            <p className="text-xs" style={{ color: T.muted }}>ID: {c.externalId}</p>
                          )}
                          {c.hmo && (
                            <p className="text-xs" style={{ color: T.muted }}>HMO: {c.hmo}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.phone && (
                            <p className="text-xs flex items-center gap-1" style={{ color: T.muted }}>
                              <Phone size={11} /> {c.phone}
                            </p>
                          )}
                          {c.email && (
                            <p className="text-xs flex items-center gap-1" style={{ color: T.muted }}>
                              <Mail size={11} /> {c.email}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <MatchBadge status={c.matchStatus} />
                          {c.matchStatus === "possible_match" && c.matchCandidates.length > 0 && (
                            <p className="text-xs mt-1" style={{ color: T.purple }}>
                              {c.matchCandidates.length} candidate{c.matchCandidates.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <InviteBadge status={c.invitationStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Possible match review button */}
                            {c.matchStatus === "possible_match" && (
                              <button
                                onClick={() => setReviewCustomer(c)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                style={{ background: `${T.purple}20`, color: T.purple }}
                              >
                                <AlertCircle size={13} />
                                <span>Review Candidates</span>
                              </button>
                            )}

                            {/* Invite button */}
                            {c.invitationStatus !== "linked" && c.matchStatus !== "matched" && (
                              <button
                                onClick={() => handleSingleInvite(c)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                style={{ background: `${T.accent}20`, color: T.accent }}
                              >
                                <Mail size={13} />
                                <span>{c.invitationStatus === "sent" ? "Resend Link" : "Invite"}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: `1px solid ${T.border}`, background: T.card }}
              >
                <span className="text-xs" style={{ color: T.muted }}>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: T.surface, color: T.text }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: T.surface, color: T.text }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Dashboard Tab ──────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {statsLoading || !stats ? (
            <div className="py-24 text-center" style={{ color: T.muted }}>
              <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
              Loading stats…
            </div>
          ) : (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Imported"    value={stats.total}   icon={Users}      color={T.accent}   />
                <StatCard label="Linked to WelliRecord" value={stats.matched} icon={UserCheck} color={T.success} />
                <StatCard label="Possible Matches"  value={stats.possibleMatch} icon={AlertCircle} color={T.purple} />
                <StatCard label="Not Registered"    value={stats.new}     icon={UserX}      color={T.muted}    />
              </div>

              {/* Invitation funnel */}
              <div className="rounded-2xl p-6 space-y-4" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <div className="flex items-center justify-between">
                  <p className="font-bold" style={{ color: T.text }}>Invitation Funnel</p>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${T.success}20`, color: T.success }}
                  >
                    {stats.registrationRate}% conversion
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Not Yet Invited",   value: stats.invitations.notSent,   color: T.muted   },
                    { label: "Invited",            value: stats.invitations.sent,       color: T.accent  },
                    { label: "Opened Invitation",  value: stats.invitations.opened,     color: T.warning },
                    { label: "Registered",         value: stats.invitations.registered, color: T.success },
                    { label: "Fully Linked",       value: stats.invitations.linked,     color: T.success },
                    { label: "Expired",            value: stats.invitations.expired,    color: T.danger  },
                  ].map((item) => {
                    const pct = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs" style={{ color: T.muted }}>
                          <span>{item.label}</span>
                          <span style={{ color: T.text }}>{item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: T.border }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* This month */}
              <div className="rounded-2xl p-5" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${T.success}20` }}>
                    <TrendingUp size={20} color={T.success} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: T.text }}>
                      {stats.registeredThisMonth.toLocaleString()}
                    </p>
                    <p className="text-sm" style={{ color: T.muted }}>patients registered this month</p>
                  </div>
                </div>
              </div>

              {/* AI Adoption hint */}
              <div
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{ background: `${T.purple}10`, border: `1px solid ${T.purple}30` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${T.purple}20` }}>
                  <Zap size={18} color={T.purple} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: T.text }}>AI Adoption Tip</p>
                  <p className="text-sm mt-1" style={{ color: T.muted }}>
                    {stats.new > 0 ? (
                      <>
                        <strong style={{ color: T.text }}>{stats.new.toLocaleString()}</strong> customers are unregistered. Prioritize invitations for those who visited recently — they're most likely to register for digital lab results and prescriptions.
                      </>
                    ) : (
                      "All imported customers have been matched or linked. Import more customers to continue growing your digital patient base."
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MODAL 1: Side-by-Side Possible Match Review Modal ─────────────── */}
      {reviewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 space-y-6 animate-scale-up border"
            style={{ background: T.card, borderColor: `${T.purple}40` }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2.5">
                <AlertCircle size={20} className="text-purple-400" />
                <h3 className="font-bold text-lg text-white">Review Match Candidates</h3>
              </div>
              <button onClick={() => setReviewCustomer(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Local Customer */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Imported Record</span>
                <div>
                  <p className="text-base font-bold text-white">{reviewCustomer.fullName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Customer ID: {reviewCustomer.externalId || "—"}</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><span className="text-slate-400">Phone:</span> {reviewCustomer.phone || "—"}</p>
                  <p><span className="text-slate-400">Email:</span> {reviewCustomer.email || "—"}</p>
                  <p><span className="text-slate-400">DOB:</span> {reviewCustomer.dob ? new Date(reviewCustomer.dob).toLocaleDateString() : "—"}</p>
                  <p><span className="text-slate-400">HMO:</span> {reviewCustomer.hmo || "—"}</p>
                </div>
              </div>

              {/* Right Column: Candidate */}
              {reviewCustomer.matchCandidates.length > 0 ? (
                <div className="rounded-2xl p-4 space-y-3 border" style={{ background: `${T.purple}10`, borderColor: `${T.purple}40` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Best Candidate Match</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                      {reviewCustomer.matchCandidates[0].score}% Score
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono">User ID: {reviewCustomer.matchCandidates[0].userId}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reviewCustomer.matchCandidates[0].matchedOn.map((signal) => (
                        <span key={signal} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/30 text-purple-200">
                          Matched on: {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleConfirmMatch(reviewCustomer, String(reviewCustomer.matchCandidates[0].userId))}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck size={14} />
                      <span>Confirm & Link Record</span>
                    </button>
                    <button
                      onClick={() => handleDismissMatch(reviewCustomer)}
                      className="w-full py-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      Not a Match (Keep as Local Record)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-4 text-center text-sm text-slate-400 flex items-center justify-center" style={{ background: T.surface }}>
                  No candidate details available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Single Invitation Modal ─────────────────────────────── */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl p-6 space-y-5 animate-scale-up border"
            style={{ background: T.card, borderColor: `${T.accent}40` }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-blue-400" />
                <h3 className="font-bold text-base text-white">Patient Invitation Link</h3>
              </div>
              <button onClick={() => { setInviteModal(null); setCopiedLink(false); }} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Send this secure invitation link to <strong className="text-white">{inviteModal.customer.fullName}</strong> via WhatsApp, SMS, or Email to claim their record.
            </p>

            <div className="space-y-2">
              {/* WhatsApp Button */}
              {inviteModal.customer.phone && (
                <a
                  href={`https://wa.me/${inviteModal.customer.phone.replace(/\D/g, "").replace(/^0/, "234")}?text=${encodeURIComponent(
                    `Hello ${inviteModal.customer.firstName || inviteModal.customer.fullName}, your healthcare provider has prepared your digital health records on WelliRecord. Access your prescriptions, lab results, and lifelong health vault for FREE here: ${inviteModal.link}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare size={16} />
                  <span>Send via WhatsApp</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              )}

              {/* SMS Button */}
              {inviteModal.customer.phone && (
                <a
                  href={`sms:${inviteModal.customer.phone.replace(/\D/g, "")}?body=${encodeURIComponent(
                    `Hello ${inviteModal.customer.firstName || inviteModal.customer.fullName}, your healthcare provider has prepared your health records on WelliRecord. Claim free access here: ${inviteModal.link}`
                  )}`}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                >
                  <Phone size={16} />
                  <span>Send via Mobile SMS</span>
                </a>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[11px] font-mono text-emerald-400 break-all">{inviteModal.link}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteModal.link);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-full py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Invite Link</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => { setInviteModal(null); setCopiedLink(false); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
