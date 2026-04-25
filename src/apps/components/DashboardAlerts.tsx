import React from "react";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  ArrowRight,
  FileText,
} from "lucide-react";

export type DashboardAlertItem = {
  id: string;
  type: "warning" | "info" | "critical";
  title: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
};

type Props = {
  alerts: DashboardAlertItem[];
  onNavigate: (path: string) => void;
  className: string;
  variant?: "light" | "dark";
};


const alertStyles = {
  warning: {
    icon: AlertTriangle,
    bg: "rgba(245,158,11,.08)",
    border: "rgba(245,158,11,.22)",
    iconColor: "#d97706",
  },
  info: {
    icon: Bell,
    bg: "rgba(59,130,246,.08)",
    border: "rgba(59,130,246,.18)",
    iconColor: "#2563eb",
  },
  critical: {
    icon: ShieldAlert,
    bg: "rgba(239,68,68,.08)",
    border: "rgba(239,68,68,.18)",
    iconColor: "#dc2626",
  },
};

export function DashboardAlerts({ alerts, onNavigate, className,variant }: Props) {
return (
  <div
    className={`rounded-2xl ${
      alerts?.length === 0 ? "max-h-48" : ""
    } flex-1 py-2 px-5 ${
      variant === "dark"
        ? "border border-[#163761] text-white"
        : "border border-gray-200 bg-white text-black"
    } ${className ?? ""}`}
    style={
      variant === "dark"
        ? {
            background:
              "radial-gradient(circle at 72% 18%, rgba(116,167,255,0.08) 0%, rgba(116,167,255,0.02) 22%, transparent 40%), linear-gradient(180deg, #0B1730 0%, #091427 100%)",
          }
        : undefined
    }
  >
    <div className="mb-1 flex items-center justify-between">
      <h2
        className={`text-base font-bold ${
          variant === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Alerts
      </h2>

      <span
        className={`text-xs font-medium ${
          variant === "dark" ? "text-[#9FB3CF]" : "text-gray-400"
        }`}
      >
        {alerts?.length} active
      </span>
    </div>

    {alerts?.length === 0 ? (
      <div className="py-3">
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-2 text-center ${
            variant === "dark"
              ? "border-[#163761] bg-[#0b2447]/60"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div
            className={`mb-1 flex h-12 w-12 items-center justify-center rounded-xl border ${
              variant === "dark"
                ? "border-[#163761] bg-[#102a4d]"
                : "border-gray-200 bg-white"
            }`}
          >
            <FileText
              size={20}
              className={variant === "dark" ? "text-[#9FB3CF]" : "text-gray-400"}
            />
          </div>

          <h3
            className={`text-sm font-semibold ${
              variant === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            No alerts
          </h3>

          <p
            className={`mt-1 max-w-xs text-xs ${
              variant === "dark" ? "text-[#9FB3CF]" : "text-gray-500"
            }`}
          >
            You're all caught up. No actions needed right now.
          </p>
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = alertStyles[alert?.type];
          const Icon = config?.icon;

          return (
            <div
              key={alert?.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                variant === "dark"
                  ? "border-[#163761] bg-[#0b2447]/60"
                  : "border-gray-200"
              }`}
              style={
                variant === "dark"
                  ? undefined
                  : {
                      background: config?.bg,
                      borderColor: config?.border,
                    }
              }
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${
                  variant === "dark"
                    ? "border-[#163761] bg-[#102a4d]"
                    : "border-gray-100 bg-white"
                }`}
              >
                <Icon
                  size={18}
                  style={{ color: variant === "dark" ? "#9FB3CF" : config?.iconColor }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-semibold ${
                    variant === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {alert?.title}
                </div>

                <div
                  className={`mt-0.5 text-sm ${
                    variant === "dark" ? "text-[#9FB3CF]" : "text-gray-600"
                  }`}
                >
                  {alert?.message}
                </div>
              </div>

              <button
                onClick={() => onNavigate(alert.ctaLink)}
                className={`inline-flex items-center gap-1 text-sm font-semibold ${
                  variant === "dark" ? "text-emerald-300" : "text-[#2F915C]"
                }`}
              >
                {alert?.ctaLabel}
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}