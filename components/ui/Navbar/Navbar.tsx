"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Crown, UserCircle, AlertTriangle } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useFetchUser } from "@/hooks/useFetchUser";

export enum AppView {
  PROFILE = "PROFILE",
}

type UserDTO = {
  name?: string;
  id?: string;
};

export interface NavbarProps {
  isPremium: boolean;
  hasAccess: boolean;
  daysRemaining: number;
  onChangeView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isPremium,
  hasAccess,
  daysRemaining,
  onChangeView,
}) => {
  const { user, loading, error, refetch } = useFetchUser();
  const onboardStatus = localStorage.getItem("welli_onboarded");
  const { isConnected } = useAccount();
  // const [user, setUser] = useState<UserDTO>({ name: "Guest", id: "" });
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   let mounted = true;

    

  //   // fetchUser();

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
      {/* Mobile Logo */}
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
        <h2 className="text-lg font-semibold text-slate-100">WelliRecord</h2>
      </div>

      {/* Center Status */}
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

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {onboardStatus && isConnected && (
          <ConnectButton
            showBalance
            chainStatus="icon"
            accountStatus="address"
          />
        )}

        {isPremium && (
          <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
            <Crown size={14} className="text-yellow-500" fill="currentColor" />
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">
              Premium
            </span>
          </div>
        )}

        <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        {/* Profile */}
        <div
          onClick={() => onChangeView(AppView.PROFILE)}
          className="flex items-center gap-3 pl-4 border-l border-slate-800 cursor-pointer group"
        >
          <div className="text-right hidden md:block leading-tight">
            <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
              {user?.name ?? "Jane Doe"}
            </p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wide">
              ID: {user?.id ?? "#8921-22A"}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full border-2 border-slate-800 shadow-sm ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all flex items-center justify-center text-white">
            <UserCircle size={24} className="opacity-80" />
          </div>
        </div>
      </div>
    </header>
  );
};
