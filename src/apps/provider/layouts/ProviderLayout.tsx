import {  logos } from "@/assets";
import { orgApi } from "@/shared/api/orgApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useWelliMate } from "@/shared/context/WelliMateContext";
import { useNetwork } from "@/shared/hooks/useNetwork";
import { ROLE_METADATA } from "@/shared/rbac/permissions";
import { useRBAC } from "@/shared/rbac/useRBAC";
import { WelliMateWidget } from "@/shared/ui/WelliMateWidget";
import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import {
  Activity,
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Crown,
  FileEdit,
  FlaskConical,
  GitBranch,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Pill,
  ScrollText,
  Settings2,
  Sparkles,
  Stethoscope,
  UserCog,
  Users,
  Video,
  WifiOff,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const ALL_NAV = [
  {
    to: "/provider/overview",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["*"],
  },
  { to: "/provider/patients", label: "Patients", icon: Users, roles: ["*"] },

  { to: "/provider/queue", label: "Queue", icon: CalendarClock, roles: ["*"] },
  {
    to: "/provider/prescriptions",
    label: "Prescriptions",
    icon: Pill,
    // roles: ["clinician", "pharmacist", "provider_admin"],
    roles: ["*"]
  },
  {
    to: "/provider/encounters/new",
    label: "New Encounter",
    icon: FileEdit,
    // roles: ["clinician", "provider_admin", "telehealth_provider"],
    roles: ["*"],
  },
  {
    to: "/provider/orders/labs",
    label: "Lab Orders",
    icon: FlaskConical,
    // roles: ["clinician", "lab_tech", "provider_admin"],
    roles: ["*"]
  },
  
  
  {
    to: "/provider/telemedicine",
    label: "Telemedicine",
    icon: Video,
    roles: ["clinician", "provider_admin", "telehealth_provider"],
    // roles: ["*"]
  },
  {
    to: "/provider/referrals",
    label: "Referrals",
    icon: GitBranch,
    roles: ["clinician", "provider_admin"],
    // roles: ["*"]
  },
  {
    to: "/provider/nursing",
    label: "Nursing",
    icon: Stethoscope,
    roles: ["nurse", "provider_admin"],
  },
  {
    to: "/provider/reports",
    label: "Reports",
    icon: Activity,
    roles: ["provider_admin", "clinician"],
  },
  {
    to: "/provider/team",
    label: "Team",
    icon: UserCog,
    roles: ["provider_admin"],
  },
  {
    to: "/provider/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
    roles: ["provider_admin", "government"],
  },
  {
    to: "/provider/integrations/api-keys",
    label: "Integrations",
    icon: Settings2,
    roles: ["provider_admin"],
  },
  {
    to: "/provider/public-health",
    label: "Public Health",
    icon: Activity,
    roles: ["provider_admin", "government", "ngo"],
  },
  { to: "/provider/support", label: "Support", icon: LifeBuoy, roles: ["*"] },
];

const BOTTOM_NAV = [
  { to: "/provider/overview", label: "Home", icon: LayoutDashboard },
  { to: "/provider/patients", label: "Patients", icon: Users },
  { to: "/provider/queue", label: "Queue", icon: CalendarClock },
  { to: "/provider/messages", label: "Messages", icon: MessageSquare },
];

export function ProviderLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const org = user?.orgId ? orgApi.getById(user.orgId) : undefined;
  const orgs = orgApi.getAll();
  const [showOrgDrop, setShowOrgDrop] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOnline } = useNetwork();
  const { isWelliMateEnabled, setWelliMateEnabled } = useWelliMate();
  const { can, roleMetadata, primaryRole } = useRBAC();

  const [syncTime, setSyncTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setSyncTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const syncLabel = syncTime.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };
  const navTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const navWithAccess = ALL_NAV.map((item) => ({
    ...item,
    hasAccess:
      item.roles.includes("*") ||
      (user?.roles && item.roles.some((r) => user.roles!.includes(r as any))),
  }));

  const roleLabel = (role?: string) =>
    role?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";
  const meta = primaryRole ? ROLE_METADATA[primaryRole] : null;

  return (
    <div
      className="flex h-screen portal-provider"
      style={{ overflow: "hidden" }}
    >
      {/* ─── Slide-over Drawer (mobile) ─── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="relative flex flex-col w-72 max-w-[85vw] h-full animate-slide-in-left"
            style={{
              background: "var(--prov-surface)",
              borderRight: "1px solid var(--prov-border)",
            }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--prov-border)" }}
            >
              <WelliRecordLogo height={28} theme="light" />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10"
              >
                <X size={18} style={{ color: "#7ba3c8" }} />
              </button>
            </div>
            {/* Org + role */}
            <div
              className="px-3 py-3 border-b"
              style={{ borderColor: "var(--prov-border)" }}
            >
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2 hover:bg-white/5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    background: "var(--prov-surface2)",
                    border: "1px solid var(--prov-border)",
                  }}
                >
                  {orgApi.getOrgTypeIcon(org?.type ?? "hospital")}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-semibold truncate"
                    style={{ color: "#e2eaf4" }}
                  >
                    {org?.name ?? "Unknown Org"}
                  </div>
                  <div className="text-[10px]" style={{ color: "#7ba3c8" }}>
                    {orgApi.getOrgTypeLabel(org?.type ?? "hospital")}
                  </div>
                </div>
              </div>
              {meta && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase"
                  style={{ background: meta.color, color: meta.textColor }}
                >
                  {meta.label}
                </span>
              )}
            </div>
            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
              {navWithAccess.map((item) => {
                const active = location.pathname.startsWith(item.to);
                const locked = !item.hasAccess;
                return (
                  <button
                    key={item.to}
                    onClick={() => !locked && navTo(item.to)}
                    className={`sidebar-item sidebar-item-provider w-full ${active && !locked ? "active" : ""}`}
                    style={
                      locked ? { opacity: 0.38, cursor: "not-allowed" } : {}
                    }
                  >
                    <item.icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {locked ? (
                      <Lock size={12} style={{ color: "#7ba3c8" }} />
                    ) : active ? (
                      <ChevronRight size={14} />
                    ) : null}
                  </button>
                );
              })}
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-xl mt-2 cursor-pointer"
                style={{
                  background: "rgba(56,189,248,0.08)",
                  border: "1px solid rgba(56,189,248,0.18)",
                }}
                onClick={() => setWelliMateEnabled(!isWelliMateEnabled)}
              >
                <HeartPulse size={18} style={{ color: "#38bdf8" }} />
                <span
                  className="flex-1 text-sm font-semibold"
                  style={{ color: "#e2eaf4" }}
                >
                  WelliMate AI
                </span>
                <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                  <Crown size={8} /> PRO
                </span>
              </div>
            </nav>
            <div
              className="p-3 border-t space-y-0.5"
              style={{ borderColor: "var(--prov-border)" }}
            >
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2"
                style={{
                  background: "rgba(56,189,248,.06)",
                  border: "1px solid rgba(56,189,248,.1)",
                }}
              >
                <img
                  src={user?.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-semibold truncate"
                    style={{ color: "#e2eaf4" }}
                  >
                    {user?.name}
                  </div>
                  <div
                    className="text-[10px] truncate"
                    style={{ color: "#7ba3c8" }}
                  >
                    {user?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="sidebar-item w-full"
                style={{ color: "#f87171" }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Desktop / Tablet Sidebar ─── */}
      <aside
        className="sidebar-provider hidden md:flex flex-col w-16 lg:w-64 flex-shrink-0 z-20"
        style={{ boxShadow: "2px 0 30px rgba(0,0,0,.3)" }}
      >
        {/* Logo */}
        <div
          className="p-3 lg:p-5 border-b flex items-center justify-center lg:justify-start"
          style={{ borderColor: "var(--prov-border)" }}
        >
          <Link
            to="/"
            className="flex h-14 w-72 overflow-hidden items-center justify-center rounded-md  text-white shadow-sm cursor-pointer"
          >
            <img
              src={logos}
              alt="wellirecord"
              className=" w-full h- full object-cover"
            />
          </Link>
          <div
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white font-black"
          >
            
          </div>
          <div
            className="ml-2 hidden lg:block text-[10px] font-bold border border-blue-800 px-2 rounded-lg tracking-widest uppercase"
          >
            Provider Portal
          </div>
        </div>
        {/* Org Switcher */}
        <div
          className="px-2 lg:px-4 py-2 lg:py-3 border-b relative"
          style={{ borderColor: "var(--prov-border)" }}
        >
          <button
            onClick={() => setShowOrgDrop((p) => !p)}
            className="flex items-center gap-2 p-2 lg:p-2.5 rounded-xl w-full text-left hover:bg-white/5 justify-center lg:justify-start"
          >
            <div
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: "var(--prov-surface2)",
                border: "1px solid var(--prov-border)",
              }}
            >
              {orgApi.getOrgTypeIcon(org?.type ?? "hospital")}
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <div
                className="text-xs font-semibold truncate"
                style={{ color: "#e2eaf4" }}
              >
                {org?.name ?? "Unknown Org"}
              </div>
              <div className="text-[10px]" style={{ color: "#7ba3c8" }}>
                {orgApi.getOrgTypeLabel(org?.type ?? "hospital")}
              </div>
            </div>
            <ChevronDown
              size={14}
              style={{ color: "#7ba3c8" }}
              className="hidden lg:block"
            />
          </button>
          {showOrgDrop && (
            <div
              className="absolute left-2 right-2 top-full mt-1 rounded-xl z-40 shadow-2xl overflow-hidden"
              style={{
                background: "var(--prov-surface)",
                border: "1px solid var(--prov-border)",
              }}
            >
              {orgs.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setShowOrgDrop(false)}
                  className="flex items-center gap-2 px-3 py-2.5 w-full text-left text-sm hover:bg-white/5 border-b last:border-0"
                  style={{
                    borderColor: "var(--prov-border)",
                    color: "#e2eaf4",
                  }}
                >
                  <span>{orgApi.getOrgTypeIcon(o.type)}</span>
                  <span>{o.name}</span>
                  {o.id === user?.orgId && (
                    <span className="ml-auto badge badge-active text-xs">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Role badge */}
        <div
          className="px-2 lg:px-4 py-2 border-b hidden lg:block"
          style={{ borderColor: "var(--prov-border)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider"
              style={{
                background: meta?.color ?? "#041e42",
                color: meta?.textColor ?? "#fff",
              }}
            >
              {meta?.label ?? roleLabel(user?.roles?.[0])}
            </span>
            <span className="text-[10px] truncate" style={{ color: "#7ba3c8" }}>
              {meta?.description?.split(".")[0]}
            </span>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-2 lg:px-3 py-2 space-y-0.5 overflow-y-auto">
          {navWithAccess.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const locked = !item.hasAccess;
            return (
              <button
                key={item.to}
                onClick={() => !locked && navigate(item.to)}
                title={item.label}
                className={`sidebar-item sidebar-item-provider w-full ${active && !locked ? "active" : ""} justify-center lg:justify-start`}
                style={locked ? { opacity: 0.38, cursor: "not-allowed" } : {}}
              >
                <item.icon size={18} />
                <span className="hidden lg:block flex-1 text-left">
                  {item.label}
                </span>
                {locked ? (
                  <Lock
                    size={12}
                    style={{ color: "#7ba3c8" }}
                    className="hidden lg:block"
                  />
                ) : active ? (
                  <ChevronRight size={14} className="hidden lg:block" />
                ) : null}
              </button>
            );
          })}
          <div
            className="flex items-center gap-3 px-2 lg:px-3 py-2 rounded-xl mt-2 cursor-pointer justify-center lg:justify-start"
            style={{
              background: "rgba(56,189,248,0.08)",
              border: "1px solid rgba(56,189,248,0.18)",
            }}
            onClick={() => setWelliMateEnabled(!isWelliMateEnabled)}
          >
            <HeartPulse size={18} style={{ color: "#38bdf8" }} />
            <span
              className="hidden lg:block flex-1 text-sm font-semibold"
              style={{ color: "#e2eaf4" }}
            >
              WelliMate AI
            </span>
            <span className="hidden lg:flex items-center gap-0.5 text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full uppercase">
              <Crown size={8} /> PRO
            </span>
          </div>
        </nav>
        <div
          className="p-2 lg:p-3 border-t space-y-0.5"
          style={{ borderColor: "var(--prov-border)" }}
        >
          <div
            className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl mb-2"
            style={{
              background: "rgba(56,189,248,.06)",
              border: "1px solid rgba(56,189,248,.1)",
            }}
          >
            <img
              src={user?.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-semibold truncate"
                style={{ color: "#e2eaf4" }}
              >
                {user?.name}
              </div>
              <div
                className="text-[10px] truncate"
                style={{ color: "#7ba3c8" }}
              >
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="sidebar-item w-full justify-center lg:justify-start"
            style={{ color: "#f87171" }}
          >
            <LogOut size={18} />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0"
          style={{
            borderColor: "var(--prov-border)",
            background: "var(--prov-surface)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10"
            >
              <Menu size={20} style={{ color: "#7ba3c8" }} />
            </button>
            <div
              className="hidden md:block text-sm font-semibold capitalize"
              style={{ color: "#7ba3c8" }}
            >
              {location.pathname
                .split("/")
                .filter(Boolean)
                .slice(1)
                .join(" / ")
                .replace(/-/g, " ")}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setWelliMateEnabled(!isWelliMateEnabled)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{
                background: isWelliMateEnabled
                  ? "rgba(56,189,248,0.1)"
                  : "rgba(255,255,255,0.05)",
                color: isWelliMateEnabled ? "#38bdf8" : "#7ba3c8",
                borderColor: isWelliMateEnabled
                  ? "rgba(56,189,248,0.3)"
                  : "rgba(255,255,255,0.05)",
              }}
            >
              <span className="relative flex h-2 w-2">
                {isWelliMateEnabled && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ background: "#38bdf8" }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{
                    background: isWelliMateEnabled ? "#38bdf8" : "#4b5563",
                  }}
                />
              </span>
              <Sparkles size={12} />
              <span className="hidden sm:inline">
                {isWelliMateEnabled ? "WelliMate On" : "WelliMate"}
              </span>
            </button>
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Synced {syncLabel}
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 relative">
              <Bell size={18} style={{ color: "#7ba3c8" }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400" />
            </button>
          </div>
        </header>
        {/* Offline Banner */}
        {!isOnline && (
          <div
            className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0 animate-fade-in"
            style={{ color: "#f59e0b" }}
          >
            <WifiOff size={14} />
            <span className="text-xs md:text-sm font-semibold text-center">
              Provider portal is offline. Running in read-only/cached mode.
            </span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 pb-20 md:pb-6">
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t"
        style={{
          background: "var(--prov-surface)",
          borderColor: "var(--prov-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={{ color: active ? "var(--prov-accent)" : "#4b5563" }}
            >
              <item.icon
                size={active ? 22 : 20}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
          style={{ color: "#4b5563" }}
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      <WelliMateWidget />
    </div>
  );
}
