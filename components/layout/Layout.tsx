// src/components/layout/Layout.tsx
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Link as LinkIcon,
  Lock,
  LogOut,
  MapPin,
  MessageSquareText,
  Mic,
  Network,
  Settings,
  ShieldCheck,
  UploadCloud,
  Video,
} from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { Navbar } from "../ui/Navbar/Navbar";

interface Props {
  isPremium: boolean;
  hasAccess: boolean;
  daysRemaining: number;
  onUpgrade: () => void;
  onSignOut: () => void;
}

type SidebarItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  locked: boolean;
};

export const Layout: React.FC<Props> = ({
  isPremium,
  hasAccess,
  daysRemaining,
  onUpgrade,
  onSignOut,
}) => {
  const onboardStatus = localStorage.getItem("welli_onboarded");
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!onboardStatus) {
      // if they aren't onboarded, sign them out / redirect
      onSignOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardStatus]);

  const sidebarItems: SidebarItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, locked: false },
    { to: "/telemed", label: "Telehealth", icon: Video, locked: !hasAccess },
    { to: "/integration", label: "Ecosystem", icon: Network, locked: !hasAccess },
    { to: "/timeline", label: "Timeline", icon: Calendar, locked: false },
    { to: "/records", label: "My Records", icon: FileText, locked: false },
    { to: "/metrics", label: "Health Metrics", icon: Activity, locked: !hasAccess },
    { to: "/upload", label: "Upload Data", icon: UploadCloud, locked: false },
    { to: "/live-assistant", label: "Welli Voice", icon: Mic, locked: !hasAccess },
    { to: "/chat", label: "AI Health Chat", icon: MessageSquareText, locked: !hasAccess },
    { to: "/find-care", label: "Find Care", icon: MapPin, locked: !hasAccess },
    { to: "/portability", label: "Portability", icon: ShieldCheck, locked: !hasAccess },
  ];

  const go = (item: SidebarItem) => {
    if (item.locked) {
      onUpgrade();
      return;
    }
    navigate(item.to);
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans selection:bg-blue-900/50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col flex-shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative shrink-0 text-blue-500">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                <path d="M50 95C50 95 85 78.4 85 45V18L50 5L15 18V45C15 78.4 50 95 50 95Z" fill="url(#logo-gradient)" />
                <path d="M50 25V65M30 45H70" stroke="white" strokeWidth="8" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-gradient" x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563eb" />
                    <stop offset="1" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight leading-none">
              WelliRecord
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => go(item)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm group relative ${
                  active
                    ? "bg-blue-900/30 text-blue-400 shadow-sm border border-blue-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={active ? "stroke-[2.5px]" : ""} />
                  {item.label}
                </div>
                {item.locked && (
                  <Lock size={14} className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {!isPremium && (
            <div
              className={`mb-4 border rounded-xl p-4 text-center transition-all ${
                daysRemaining <= 3
                  ? "bg-red-900/20 border-red-500/30"
                  : "bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${
                    daysRemaining <= 3 ? "bg-red-500" : "bg-indigo-500"
                  }`}
                >
                  {hasAccess ? <Clock size={16} /> : <Lock size={16} />}
                </div>
                {hasAccess && (
                  <span className="text-[10px] font-mono font-bold bg-slate-900/50 px-2 py-1 rounded text-slate-300">
                    {daysRemaining} DAYS
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-200 text-sm mb-1 text-left">
                {hasAccess ? "Free Trial Active" : "Trial Expired"}
              </h4>
              <p className="text-[10px] text-slate-400 mb-3 leading-tight text-left">
                {hasAccess
                  ? "Full access to AI & Portability features enabled."
                  : "Premium features are locked. Please upgrade."}
              </p>

              <button
                onClick={onUpgrade}
                className={`w-full py-2 text-white rounded-lg text-xs font-bold transition-colors ${
                  daysRemaining <= 3 ? "bg-red-600 hover:bg-red-500" : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {hasAccess ? "Extend Access" : "Unlock Features"}
              </button>
            </div>
          )}

          <div className="px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2 text-slate-400">
              <LinkIcon size={12} />
              <span>WelliChain</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Synced
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === "/profile"
                ? "bg-blue-900/30 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Settings size={20} /> Settings
          </button>

          {/* Wallet logout only if wallet is connected */}
          {onboardStatus && isConnected && (
            <button
              onClick={() => {disconnect(), onSignOut()}}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 text-sm font-medium transition-colors hover:bg-red-900/10 rounded-xl"
            >
              <LogOut size={20} /> Disconnect
            </button>
          )}

          {/* Email logout only if wallet NOT connected */}
          {onboardStatus && !isConnected && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 text-sm font-medium transition-colors hover:bg-red-900/10 rounded-xl"
            >
              <LogOut size={20} /> Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar
          isPremium={isPremium}
          hasAccess={hasAccess}
          daysRemaining={daysRemaining}
      
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
