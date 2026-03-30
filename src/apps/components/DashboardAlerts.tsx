import React from "react";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  ArrowRight,
  FileText,
} from "lucide-react";

type DashboardAlertItem = {
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

export function DashboardAlerts({ alerts, onNavigate }: Props) {
  return (
    <div className={`rounded-2xl ${alerts?.length === 0 ? "max-h-48": " "} flex-1 border bg-white py-2 px-5`}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-900">Alerts</h2>
        <span className="text-xs font-medium text-gray-400">
          {alerts.length} active
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-3">
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-2 px-6">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-1">
              <FileText size={20} className="text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-900">
              No alerts
            </h3>

            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              You're all caught up. No actions needed right now.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = alertStyles[alert.type];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className="rounded-2xl border p-4 flex items-start gap-3"
                style={{
                  background: config.bg,
                  borderColor: config.border,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#fff" }}
                >
                  <Icon size={18} style={{ color: config.iconColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {alert.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {alert.message}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(alert.ctaLink)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F915C]"
                >
                  {alert.ctaLabel}
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