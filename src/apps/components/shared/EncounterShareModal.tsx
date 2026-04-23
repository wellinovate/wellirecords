import React from "react";
import {
  Building2,
  Users,
  Link2,
  QrCode,
  FileDown,
  X,
  ShieldCheck,
  Clock3,
} from "lucide-react";

type ShareOption =
  | "provider"
  | "caregiver"
  | "secure-link"
  | "qr-code"
  | "pdf";

type Props = {
  open: boolean;
  encounterId?: string | null;
  onClose: () => void;
  onSelect: (option: ShareOption, encounterId: string) => void;
};

const options: {
  key: ShareOption;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "provider",
    title: "Provider / Hospital",
    description: "Grant secure access to a doctor, clinic, or hospital.",
    icon: Building2,
  },
  {
    key: "caregiver",
    title: "Family / Caregiver",
    description: "Share with a trusted person helping manage care.",
    icon: Users,
  },
  {
    key: "secure-link",
    title: "Temporary secure link",
    description: "Generate a private time-limited access link.",
    icon: Link2,
  },
  {
    key: "qr-code",
    title: "QR access code",
    description: "Create a scannable code for quick clinical access.",
    icon: QrCode,
  },
  {
    key: "pdf",
    title: "Download summary PDF",
    description: "Export a summary file for offline or external use.",
    icon: FileDown,
  },
];

export default function EncounterShareModal({
  open,
  encounterId,
  onClose,
  onSelect,
}: Props) {
  if (!open || !encounterId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Share securely
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Choose how you want to share this medical encounter.
            </p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {options.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key, encounterId)}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={18} />
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  {item.title}
                </div>
                <div className="mt-1 text-xs leading-5 text-gray-500">
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
          <Clock3 size={14} />
          All shared access should be time-bound and revocable.
        </div>
      </div>
    </div>
  );
}