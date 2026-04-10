import { health_companion_image, logos } from "@/assets";
import { useAuth } from "@/shared/auth/AuthProvider";
import { useWelliMate } from "@/shared/context/WelliMateContext";
import { useNetwork } from "@/shared/hooks/useNetwork";
import { WelliMateWidget } from "@/shared/ui/WelliMateWidget";
import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import {
  Activity,
  Baby,
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  Crown,
  ExternalLink,
  FolderHeart,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Pill,
  QrCode,
  Settings,
  Shield,
  Video,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const patientNav = [
  {
    to: "/patient/overview",
    label: "Overview",
    icon: LayoutDashboard,
    premium: true,
  },

  {
    to: "/patient/vault",
    label: "Health Record",
    icon: FolderHeart,
    premium: true,
  },
  {
    to: "/patient/journeys",
    label: "Health History",
    // label: "Health History/Journeys",
    icon: Activity,
    premium: true,
  },
  {
    to: "/patient/medications",
    label: "Medications",
    icon: Pill,
    premium: true,
  },
  {
    to: "/patient/family",
    label: "Family & Dependants",
    icon: Baby,
    premium: true,
  },

  {
    to: "/patient/appointments",
    label: "Appointments",
    icon: Calendar,
    premium: false,
  },
  // {
  //   to: "/patient/consents",
  //   label: "My Consents",
  //   icon: Shield,
  //   premium: false,
  // },

  // {
  //   to: "/patient/find-care",
  //   label: "Find Care",
  //   icon: MapPin,
  //   premium: false,
  // },

  {
    to: "/patient/telemedicine",
    label: "Telemedicine",
    icon: Video,
    premium: false,
  },
  {
    to: "/patient/messages",
    label: "Messages",
    icon: MessageSquare,
    premium: false,
  },
  // {
  //   to: "/patient/emergency-card",
  //   label: "Emergency Card",
  //   icon: QrCode,
  //   premium: false,
  // },
  {
    to: "/patient/billing",
    label: "Billing",
    icon: CreditCard,
    premium: true,
  },
  { to: "/patient/support", label: "Support", icon: LifeBuoy, premium: true },
];

// Bottom nav — 4 primary tabs + "more" button
const BOTTOM_NAV = [
  { to: "/patient/overview", label: "Home", icon: LayoutDashboard },
  { to: "/patient/vault", label: "Vault", icon: FolderHeart },
  { to: "/patient/appointments", label: "Appts", icon: Calendar },
  { to: "/patient/messages", label: "Messages", icon: MessageSquare },
];

export function PatientLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetwork();
  const { isWelliMateEnabled, setWelliMateEnabled } = useWelliMate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };
  const navTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className="flex h-screen portal-patient"
      style={{ overflow: "hidden" }}
    >
      {/* ─── Slide-over Drawer (mobile) ─── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <aside
            className="relative flex flex-col w-72 max-w-[85vw] h-full animate-slide-in-left"
            style={{ background: "#DAE5F7", borderRight: "1px solid #e2e8f0" }}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <Link
                to="/"
                className="flex h-14 w-44  overflow-hidden items-center justify-center rounded-md  text-white shadow-sm cursor-pointer"
              >
                <img
                  src={logos}
                  alt="wellirecord"
                  className=" w-full h- full object-cover"
                />
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X size={18} style={{ color: "#64748b" }} />
              </button>
            </div>
            {/* User */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: "2px solid #e2e8f0" }}
              />
              <div className="min-w-0">
                <div
                  className="font-bold text-sm truncate"
                  style={{ color: "#1a2e1e" }}
                >
                  {user?.name}
                </div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <Crown size={9} /> Patient
                </div>
              </div>
            </div>
            {/* Nav list */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {patientNav.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <button
                    key={item.to}
                    onClick={() => navTo(item.to)}
                    className={`sidebar-item sidebar-item-patient w-full ${active ? "active" : ""} ${
                      !item.premium
                        ? "opacity-60 grayscale text-gray-400 cursor-not-allowed"
                        : "text-gray-800 font-semibold"
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <ChevronRight size={14} />}
                  </button>
                );
              })}
              {/* WelliMate */}
              {/* <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2 cursor-pointer"
                style={{ background: "#f0fdfa", border: "1px solid #ccfbf1" }}
                onClick={() => setWelliMateEnabled(!isWelliMateEnabled)}
              >
                <HeartPulse size={18} style={{ color: "#0d9488" }} />
                <span
                  className="flex-1 text-sm font-semibold"
                  style={{ color: "#1e3a8a" }}
                >
                  WelliMate AI
                </span>
                <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                  <Crown size={8} /> PRO
                </span>
              </div> */}
            </nav>
            <div className="p-3 border-t border-slate-200 space-y-0.5">
              <button
                onClick={() => navTo("/patient/settings")}
                className={`sidebar-item sidebar-item-patient w-full ${location.pathname === "/patient/settings" ? "active" : ""}`}
              >
                <Settings size={18} /> Settings
              </button>
              <button
                onClick={handleSignOut}
                className="sidebar-item w-full text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Desktop / Tablet Sidebar ─── */}
      <aside className="sidebar-patient hidden md:flex flex-col w-16 lg:w-64 z-20 flex-shrink-0 border bg-[#DAE5F7] border-r-2 border-gray-100">
        {/* Logo */}
        <div className="p-3 lg:p- b border-b border-slate-200 fle items-center justify-center lg:justify-start">
          <Link
            to="/"
            className="flex h-14 w-44 mx-auto overflow-hidden items-center justify-center rounded-md  text-white shadow-sm cursor-pointer"
          >
            <img
              src={logos}
              alt="wellirecord"
              className=" w-full h- full object-cover"
            />
          </Link>
        </div>

        {/* Avatar */}
        <div className="px-2 w-full lg:px-0 py-3 lg:py-4 border-b border-slate-200 flex justify-center lg:justify-start ">
          <div
            // onClick={() => navigate("/patient/family")}
            className="flex items-center gap-3 p-2 lg:p-3 rounded-xl  border border-slate-200 cursor-pointer hover:border-emerald-500/30 transition-all w-full bg-[#1e3a8a]"
          >
            <div className=" hidden mx-auto w-full text-center lg:block text-[14px] font-bold tracki uppercase text-white bg-[#1e3a8a] py-2 px-4 rounded-lg ">
              Patient Portal
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 lg:p-3  space-y-0.5 overflow-y-auto">
          {patientNav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                disabled={!item.premium}
                title={item.label}
                className={`sidebar-item sidebar-item-patient w-full ${active ? "active" : ""} justify-center lg:justify-start ${
                  !item.premium
                    ? "opacity-60 grayscale text-gray-400 cursor-not-allowed"
                    : "text-gray-800 font-semibold"
                }`}
              >
                <item.icon size={18} />
                {!item.premium && (
                  <Lock size={14} className="ml-2 text-gray-400" />
                )}
                <span className="hidden lg:block flex-1 text-left">
                  {item.label}
                </span>
                {active && (
                  <ChevronRight size={14} className="hidden lg:block" />
                )}
              </button>
            );
          })}
          {/* <div
            className="flex items-center gap-3 px-2 lg:px-3 py-2.5 rounded-xl mt-2 cursor-pointer justify-center lg:justify-start"
            style={{ background: "#f0fdfa", border: "1px solid #ccfbf1" }}
            onClick={() => setWelliMateEnabled(!isWelliMateEnabled)}
          >
            <HeartPulse size={18} style={{ color: "#0d9488" }} />
            <span
              className="hidden lg:block flex-1 text-sm font-semibold"
              style={{ color: "#1e3a8a" }}
            >
              WelliMate AI
            </span>
            <span className="hidden lg:flex items-center gap-0.5 text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full uppercase">
              <Crown size={8} /> PRO
            </span>
          </div>
          <a
            href="https://www.wellimate.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-semibold hover:bg-teal-50"
            style={{ color: "#0d9488" }}
          >
            <ExternalLink size={12} /> Link profile at wellimate.com{" "}
            <ChevronRight size={10} className="ml-auto" />
          </a> */}
        </nav>
        <div className="p-2 lg:p-3 border-t border-slate-200 space-y-0.5">
          <button
            onClick={() => navigate("/patient/settings")}
            title="Settings"
            className={`sidebar-item sidebar-item-patient w-full justify-center lg:justify-start ${location.pathname === "/patient/settings" ? "active" : ""}`}
          >
            <Settings size={18} />
            <span className="hidden lg:block">Settings</span>
          </button>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="sidebar-item w-full text-red-500 hover:bg-red-50 justify-center lg:justify-start"
          >
            <LogOut size={18} />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#e2e9f3] min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-slate-50 flex-shrink-0 bg-[#DAE5F7] ">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100"
            >
              <Menu size={20} style={{ color: "#1e293b" }} />
            </button>
            <div className="md:hidden">
              <Link
                to="/"
                className="flex h-10 w-28  overflow-hidden items-center justify-center rounded-md  text-white shadow-sm cursor-pointer"
              >
                <img
                  src={logos}
                  alt="wellirecord"
                  className=" w-full h- full object-cover"
                />
              </Link>
            </div>
            {/* Desktop: page title */}
            <div
              className="hidden md:block text-sm font-semibold capitalize"
              style={{ color: "#1e293b" }}
            >
              {location.pathname.split("/").pop()?.replace(/-/g, " ")}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* WelliMate toggle — hidden on smallest mobile */}
            {/* <button
              onClick={() => setWelliMateEnabled(!isWelliMateEnabled)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{
                background: isWelliMateEnabled ? "#f0fdfa" : "#f8fafc",
                color: isWelliMateEnabled ? "#0d9488" : "#64748b",
                borderColor: isWelliMateEnabled ? "#ccfbf1" : "#e2e8f0",
              }}
            >
              <span className="relative flex h-2 w-2">
                {isWelliMateEnabled && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ background: "#0d9488" }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{
                    background: isWelliMateEnabled ? "#0d9488" : "#cbd5e1",
                  }}
                />
              </span>
              <span className="hidden sm:inline">
                {isWelliMateEnabled ? "WelliMate On" : "WelliMate"}
              </span>
            </button> */}

            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 relative">
              <Bell size={18} style={{ color: "#041E42" }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-800"
                type="button"
              >
                <img
                  src={user?.avatar || health_companion_image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white shadow-lg border border-gray-100 z-50 overflow-hidden animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/patient/settings");
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/patient/billing");
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Billing
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0 animate-fade-in text-amber-700">
            <WifiOff size={14} />
            <span className="text-xs md:text-sm font-semibold text-center">
              You are offline. Changes will sync when connection is restored.
            </span>
          </div>
        )}

        {/* Page content — pb accounts for mobile bottom nav */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 pb-20 md:pb-6">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t"
        style={{
          background: "#fff",
          borderColor: "#e2e8f0",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{ color: active ? "#0d9488" : "#94a3b8" }}
            >
              <item.icon
                size={active ? 22 : 20}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
          style={{ color: "#94a3b8" }}
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      <WelliMateWidget />
    </div>
  );
}
