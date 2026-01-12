import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  Crown,
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
  UserCircle,
  Video,
} from "lucide-react";
import React, { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { AppView } from "../types";

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
  isPremium: boolean;
  hasAccess: boolean;
  daysRemaining: number;
  onUpgrade: () => void;
  onSignOut: () => void;
}

export const Layout: React.FC<Props> = ({
  currentView,
  onChangeView,
  children,
  isPremium,
  hasAccess,
  daysRemaining,
  onUpgrade,
  onSignOut,
}) => {
  const {
    address, // string | undefined  → e.g. '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    isConnected, // boolean             → true if wallet is connected
    isDisconnected, // boolean
  } = useAccount();
  const { disconnect } = useDisconnect()

  useEffect(() => {
    console.log("isConnected changed:", "isConnected");
    disconnectWallet();
  }, [!isConnected]);

  const navItems = [
    {
      id: AppView.DASHBOARD,
      label: "Dashboard",
      icon: LayoutDashboard,
      locked: false,
    },
    {
      id: AppView.TELEMED,
      label: "Telehealth",
      icon: Video,
      locked: !hasAccess,
    },
    {
      id: AppView.INTEGRATION,
      label: "Ecosystem",
      icon: Network,
      locked: !hasAccess,
    },
    { id: AppView.TIMELINE, label: "Timeline", icon: Calendar, locked: false },
    { id: AppView.RECORDS, label: "My Records", icon: FileText, locked: false },
    {
      id: AppView.METRICS,
      label: "Health Metrics",
      icon: Activity,
      locked: !hasAccess,
    },
    {
      id: AppView.UPLOAD,
      label: "Upload Data",
      icon: UploadCloud,
      locked: false,
    },
    {
      id: AppView.LIVE_ASSISTANT,
      label: "Welli Voice",
      icon: Mic,
      locked: !hasAccess,
    },
    {
      id: AppView.CHAT,
      label: "AI Health Chat",
      icon: MessageSquareText,
      locked: !hasAccess,
    },
    {
      id: AppView.FIND_CARE,
      label: "Find Care",
      icon: MapPin,
      locked: !hasAccess,
    },
    {
      id: AppView.PORTABILITY,
      label: "Portability",
      icon: ShieldCheck,
      locked: !hasAccess,
    },
  ];

  const disconnectWallet = () => {
    if (!isConnected) {
      onSignOut();
    }
  }

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div className="flex h-screen bg-slate-950 font-sans selection:bg-blue-900/50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col flex-shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative shrink-0 text-blue-500">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-lg"
              >
                {/* Softer Shield/Cross Hybrid */}
                <path
                  d="M50 95C50 95 85 78.4 85 45V18L50 5L15 18V45C15 78.4 50 95 50 95Z"
                  fill="url(#logo-gradient)"
                />
                {/* Medical Cross centered */}
                <path
                  d="M50 25V65M30 45H70"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="15"
                    y1="5"
                    x2="85"
                    y2="95"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2563eb" /> {/* Blue-600 */}
                    <stop offset="1" stopColor="#0ea5e9" /> {/* Sky-500 */}
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
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm group relative ${
                currentView === item.id
                  ? "bg-blue-900/30 text-blue-400 shadow-sm border border-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={currentView === item.id ? "stroke-[2.5px]" : ""}
                />
                {item.label}
              </div>
              {item.locked && (
                <Lock
                  size={14}
                  className="text-slate-600 group-hover:text-amber-500 transition-colors"
                />
              )}
            </button>
          ))}
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
                  daysRemaining <= 3
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {hasAccess ? "Extend Access" : "Unlock Features"}
              </button>
            </div>
          )}

          {/* Blockchain Status Indicator */}
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
            onClick={() => onChangeView(AppView.PROFILE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentView === AppView.PROFILE
                ? "bg-blue-900/30 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Settings size={20} /> Settings
          </button>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => disconnect()}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 text-sm font-medium transition-colors hover:bg-red-900/10 rounded-xl"
              >
                <LogOut size={20} /> Disconnect
              </button>
            </div>
          ) : (
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 shrink-0 text-blue-500">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M50 95C50 95 85 78.4 85 45V18L50 5L15 18V45C15 78.4 50 95 50 95Z"
                  fill="currentColor"
                />
                <path
                  d="M50 25V65M30 45H70"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-100">
              WelliRecord
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-400 text-sm font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {!isPremium && hasAccess && (
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-bold text-indigo-400">
                  {daysRemaining} Days Left in Trial
                </span>
              </div>
            )}
            {!hasAccess && (
              <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-xs font-bold text-red-500">
                  Subscription Required
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div class="inline-block">
              {/* <div>Logo</div> */}
              <ConnectButton
                showBalance={true}
                chainStatus="icon"
                accountStatus="address"
              />
            </div>
            {isPremium && (
              <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                <Crown
                  size={14}
                  className="text-yellow-500"
                  fill="currentColor"
                />
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">
                  Premium
                </span>
              </div>
            )}
            <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div
              onClick={() => onChangeView(AppView.PROFILE)}
              className="flex items-center gap-3 pl-4 border-l border-slate-800 cursor-pointer group"
            >
              <div className="text-right hidden md:block leading-tight">
                <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  Jane Doe
                </p>
                <p className="text-[10px] text-slate-500 font-mono tracking-wide">
                  ID: #8921-22A
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full border-2 border-slate-800 shadow-sm ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all flex items-center justify-center text-white">
                <UserCircle size={24} className="opacity-80" />
              </div>
            </div>
          </div>
        </header>

        {/* View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-between px-6 py-2 z-50 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        {[
          AppView.DASHBOARD,
          AppView.LIVE_ASSISTANT,
          AppView.TELEMED,
          AppView.CHAT,
        ].map((view) => {
          const item = navItems.find((n) => n.id === view);
          if (!item) return null;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors relative ${
                currentView === item.id
                  ? "text-blue-400 bg-blue-900/20"
                  : "text-slate-500"
              }`}
            >
              {item.locked && (
                <div className="absolute top-1 right-1 bg-slate-900 rounded-full p-0.5 border border-slate-700">
                  <Lock size={8} className="text-amber-500" />
                </div>
              )}
              <item.icon size={24} />
              <span className="text-[10px] font-medium">
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => onChangeView(AppView.RECORDS)}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
            currentView === AppView.RECORDS
              ? "text-blue-400 bg-blue-900/20"
              : "text-slate-500"
          }`}
        >
          <FileText size={24} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
};
