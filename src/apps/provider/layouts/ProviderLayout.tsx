import { health_companion_image, logos, welliIcon } from "@/assets";
import { NotificationBell } from "@/shared/ui/NotificationBell";
import { getMyOrganization, type MyOrganization } from "@/shared/api/organizationApi";import { orgApi } from "@/shared/api/orgApi";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useWelliMate } from "@/shared/context/WelliMateContext";
import { useNetwork } from "@/shared/hooks/useNetwork";
import { ROLE_METADATA } from "@/shared/rbac/permissions";
import { useRBAC } from "@/shared/rbac/useRBAC";
import { WelliMateWidget } from "@/shared/ui/WelliMateWidget";
import {
  Activity,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Eye,
  FlaskConical,
  GitBranch,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  ListOrdered,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Pill,
  Settings2,
  Stethoscope,
  UserCog,
  Users,
  Video,
  WifiOff,
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
  {
    to: "/provider/front-desk",
    label: "Front Desk",
    icon: ClipboardList,
    roles: ["*"],
  },
  {
    to: "/provider/appointments",
    label: "Appointments",
    icon: CalendarClock,
    roles: ["*"],
  },
  {
    to: "/provider/queue",
    label: "Queue",
    icon: ListOrdered,
    roles: ["*"],
  },
  { to: "/provider/patients", label: "Patients", icon: Users, roles: ["*"] },
  {
    to: "/provider/patients/import",
    label: "Patient Import & Sync",
    icon: Link2,
    roles: ["*"],
  },
  { to: "/provider/vision", label: "Vision", icon: Eye, roles: ["*"] },
  {
    to: "/provider/doctors",
    label: "Doctors",
    icon: Stethoscope,
    roles: ["*"],
  },

  {
    to: "/provider/nursing",
    label: "Nursing",
    icon: HeartPulse,
    // roles: ["nurse", "provider_admin"],
    roles: ["*"],
  },

  {
    to: "/provider/pharmacy",
    label: "Pharmacy & Prescriptions",
    icon: Pill,
    roles: ["*"],
  },
  // {
  //   to: "/provider/encounters/new",
  //   label: "New Encounter",
  //   icon: FileEdit,
  //   // roles: ["clinician", "provider_admin", "telehealth_provider"],
  //   roles: ["*"],
  // },
  {
    to: "/provider/orders/labs",
    label: "Lab Orders",
    icon: FlaskConical,
    // roles: ["clinician", "lab_tech", "provider_admin"],
    roles: ["*"],
  },

  {
    to: "/provider/telemedicine",
    label: "Telemedicine",
    icon: Video,
    roles: ["clinician", "provider_admin", "telehealth_provider"],
    badge: "Soon",
  },
  {
    to: "/provider/referrals",
    label: "Referrals",
    icon: GitBranch,
    roles: ["clinician", "provider_admin", "nurse", "frontdesk"],
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
    to: "/provider/settings",
    label: "Settings",
    icon: Settings2,
    roles: ["provider_admin"],
  },
  // {
  //   to: "/provider/audit-logs",
  //   label: "Audit Logs",
  //   icon: ScrollText,
  //   roles: ["provider_admin", "government"],
  // },
  // {
  //   to: "/provider/integrations/api-keys",
  //   label: "Integrations",
  //   icon: Settings2,
  //   roles: ["provider_admin"],
  // },
  // {
  //   to: "/provider/public-health",
  //   label: "Public Health",
  //   icon: Activity,
  //   roles: ["provider_admin", "government", "ngo"],
  // },
  { to: "/provider/support", label: "Support", icon: LifeBuoy, roles: ["*"] },
];

const BOTTOM_NAV = [
  { to: "/provider/overview", label: "Home", icon: LayoutDashboard },
  { to: "/provider/patients", label: "Patients", icon: Users },
  { to: "/provider/queue", label: "Queue", icon: CalendarClock },
  { to: "/provider/messages", label: "Messages", icon: MessageSquare },
];

// Copy for the verification lock modal, keyed by OrganizationProfile.verificationStatus.
const VERIFICATION_LOCK_COPY: Record<string, { title: string; desc: string }> = {
  not_submitted: {
    title: "Verification Required",
    desc: "Upload your CAC certificate or operating licence to start review and unlock full access.",
  },
  pending: {
    title: "Verification In Progress",
    desc: "Your documents are with our compliance team. This usually takes 24-48 hours.",
  },
  more_info_requested: {
    title: "More Information Needed",
    desc: "The reviewer requested additional documentation before your organisation can be approved.",
  },
  rejected: {
    title: "Verification Rejected",
    desc: "Your last submission was rejected. Review the note and re-upload a corrected document.",
  },
};

export function ProviderLayout() {
  const { user, signOut } = useAuth();
  // console.log("🚀 ~ ProviderLayout ~ user:", user);
  const navigate = useNavigate();
  const location = useLocation();
  const [org, setOrg] = useState<MyOrganization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    setOrgLoading(true);
    getMyOrganization()
      .then(setOrg)
      .catch(() => setOrg(null))
      .finally(() => setOrgLoading(false));
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOnline } = useNetwork();
  const { isWelliMateEnabled, setWelliMateEnabled } = useWelliMate();
  const { can, roleMetadata, primaryRole } = useRBAC();
  const [devBypass, setDevBypass] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("dev_bypass") === "true";
    if (fromUrl) {
      localStorage.setItem("dev_bypass", "true");
    }
    return fromUrl || localStorage.getItem("dev_bypass") === "true";
  });
  // Dev bypass is a debugging aid only — it must never be reachable in a
  // production build. import.meta.env.DEV is false in any deployed
  // (Vercel) build, so the button below simply doesn't render there.
  const isDev = import.meta.env.DEV;

  // Org identity/licence verification — gates on the organisation's
  // review status (org.verificationStatus), not the account's own email
  // verification (user.isVerified is a separate, already-enforced check
  // at login). While org is still loading, treat access as unlocked
  // rather than flashing the lock modal for every provider on load.
  const verificationStatus = org?.verificationStatus ?? "not_submitted";
  const isVerified = orgLoading || verificationStatus === "approved" || (isDev && devBypass);
  const isLocked = !isVerified;

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
    navigate("/auth/pre-login");
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
    <div className="flex h-screen portal-provider overflow-hidden">
      {/* ─── Desktop / Tablet Sidebar ─── */}
      <aside
        className="sidebar-provider hidden md:flex flex-col w-16 lg:w-64 flex-shrink-0 z-20"
        style={{
          background: "var(--prov-sidebar-bg)",
          borderRight: "1px solid var(--prov-border)",
        }}
      >
        {/* Logo */}
        <div className="px-3 py-4 border-b border-blue-950 flex flex-col items-center justify-center lg:items-start">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
            {/* Shield icon — always visible */}
            <img src={welliIcon} alt="WelliRecord" className="h-9 w-9 object-contain flex-shrink-0" />
            {/* Wordmark — only on lg+ sidebar */}
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-white font-black text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                Welli<span className="font-normal">Record</span><sup className="text-xs font-normal align-super">™</sup>
              </span>
              <span className="text-blue-200 text-[8px] font-bold tracking-[0.12em] uppercase opacity-70">One patient. One trusted record. Accessible when it matters.</span>
            </div>
          </Link>

          <div
            className="ml-2 lg:block text-[16px] font-bold border border-blue-800 rounded-lg tracking-widest uppercase mt-2 py-2 px-3 bg-[#01475C] text-white"
            // className="ml-2 lg:block text-[16px] font-bold rounded-lg tracking-widest uppercase mt-2 py-2 px-3 text-white"
            style={{
              background: "linear-gradient(180deg, #163B73 0%, #0F2F5E 100%)",
              border: "1px solid rgba(124, 164, 255, 0.30)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
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
            
            className="flex items-center gap-2 p-2 lg:p-2.5 rounded-xl w-full text-left hover:bg-white/5 justify-center lg:justify-start"
            // className="ml-2 lg:block text-[16px] font-bold rounded-lg tracking-widest uppercase mt-2 py-2 px-3 text-white"
            style={{
              background: "linear-gradient(180deg, #163B73 0%, #0F2F5E 100%)",
              border: "1px solid rgba(124, 164, 255, 0.30)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #1B2A55 0%, #162347 100%)",
                border: "1px solid rgba(126, 159, 255, 0.12)",
              }}
            >
              {org?.logo ? (
                <img src={org.logo} alt={org.organizationName} className="w-full h-full object-cover" />
              ) : (
                orgApi.getOrgTypeIcon(org?.organizationType ?? "hospital")
              )}
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <div
                className="text-xs font-semibold truncate"
                style={{ color: "#e2eaf4" }}
              >
                {org?.organizationName ?? "Unknown Org"}
              </div>
              <div className="text-[10px]" style={{ color: "#7ba3c8" }}>
                {orgApi.getOrgTypeLabel(org?.organizationType ?? "hospital")}
              </div>
            </div>
          </button>
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
            // const locked = !item.hasAccess;
            const locked = !item.hasAccess || isLocked;
            return (
              <button
                key={item.to}
                // onClick={() => !locked && navigate(item.to)}
                onClick={() => {
                  if (isLocked) return;
                  if (!locked) navigate(item.to);
                }}
                className={`sidebar-item sidebar-item-provider text-white w-full ${active && !locked ? "active" : ""} justify-center lg:justify-start`}
                // style={locked ? { opacity: 0.38, cursor: "not-allowed" } : {}}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(89,190,255,0.28) 0%, rgba(89,190,255,0.18) 45%, rgba(89,190,255,0.10) 100%)",
                  border: "1px solid rgba(120, 220, 255, 0.22)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
                }}
              >
                <item.icon size={18} />
                <span className="hidden lg:block flex-1 text-left">
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider ml-1 flex-shrink-0">
                    {item.badge}
                  </span>
                ) : locked ? (
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
          {/* <div
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
          </div> */}
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
              src={user?.avatar || health_companion_image}
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
            className="sidebar-item w-full justify-center lg:justify-start"
            style={{ color: "#f87171" }}
          >
            <LogOut size={18} />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        style={{
          background: `
      radial-gradient(circle at 15% 20%, rgba(120,170,255,0.18) 0%, rgba(120,170,255,0.06) 18%, transparent 40%),
      radial-gradient(circle at 80% 10%, rgba(90,140,255,0.10) 0%, transparent 30%),
      linear-gradient(180deg, #0B1730 0%, #081225 100%)
    `,
        }}
      >
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0"
          style={{
            borderColor: "rgba(120,150,255,0.08)",
            background: "transparent",
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
              {location.pathname === "/provider/patients/import"
                ? "Patients / Import & Sync"
                : location.pathname
                    .split("/")
                    .filter(Boolean)
                    .slice(1)
                    .join(" / ")
                    .replace(/-/g, " ")}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* <button
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
            </button> */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Synced {syncLabel}
            </div>
            <NotificationBell />
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

        <main
          className="relative overflow-y-auto"
          style={{
            background: "transparent",
          }}
        >
          <Outlet />

          {!isVerified && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div
                className="rounded-xl p-6 w-[340px] text-center shadow-xl"
                style={{
                  background:
                    "linear-gradient(180deg, #0F1C2E 0%, #0B162B 100%)",
                  border: "1px solid rgba(120,150,255,0.10)",
                  color: "#EAF2FF",
                }}
              >
                <Lock size={32} className="mx-auto mb-3 text-red-500" />

                <h2 className="text-lg font-bold mb-2 text-white">
                  {VERIFICATION_LOCK_COPY[verificationStatus]?.title ??
                    "Verification Required"}
                </h2>

                <p className="text-sm text-gray-300 mb-4">
                  {VERIFICATION_LOCK_COPY[verificationStatus]?.desc ??
                    "Your organisation's identity and licence verification is not complete yet. Finish verification to unlock full access."}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/auth/provider/verify-org")}
                    className="w-full bg-[#2F915C] hover:bg-[#25794c] text-white py-2 rounded-md font-semibold transition-colors"
                  >
                    {verificationStatus === "pending"
                      ? "Check Verification Status"
                      : "Complete Verification"}
                  </button>

                  {isDev && (
                    <button
                      onClick={() => {
                        localStorage.setItem("dev_bypass", "true");
                        setDevBypass(true);
                      }}
                      className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 py-2 rounded-md font-semibold text-xs border border-sky-500/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      ⚡ Enable Developer Bypass
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
