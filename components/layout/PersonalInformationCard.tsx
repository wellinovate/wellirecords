// src/components/profile/PersonalInformationCard.tsx
import React, { useEffect, useState } from "react";
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
} from "lucide-react";

export interface ProfileUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Props {
  user: ProfileUser | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEditing?: boolean;
  onChange?: (updated: ProfileUser) => void;
}

type FormState = {
  name: string;
  memberId: string;
  email: string;
  phone: string;
  address: string;
};

export const PersonalInformationCard: React.FC<Props> = ({
  user,
  loading,
  error,
  onRetry,
  isEditing = false,
  onChange,
}) => {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    memberId: "",
    email: "",
    phone: "",
    address: "",
  });

  // Sync user → formData
  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name ?? "",
      memberId: user.id ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user.address ?? "",
    });
  }, [user]);

  // Notify parent when form changes
  useEffect(() => {
    if (!onChange) return;
    onChange({
      id: formData.memberId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });
  }, [formData, onChange]);

  const personalFields = [
    {
      key: "name",
      label: "Full Name",
      type: "text",
      Icon: User,
      disabledWhenNotEditing: true,
    },
    {
      key: "memberId",
      label: "Member ID",
      type: "text",
      Icon: Shield,
      alwaysDisabled: true,
      mono: true,
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      Icon: Mail,
      disabledWhenNotEditing: true,
    },
    {
      key: "phone",
      label: "Phone Number",
      type: "tel",
      Icon: Phone,
      disabledWhenNotEditing: true,
    },
  ] as const;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      

      {loading && (
        <div className="text-slate-400 text-sm mb-4">Loading profile…</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm flex items-center gap-2 mb-4">
          <AlertTriangle size={16} /> {error}
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-2 text-blue-400 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {personalFields.map((f) => {
          const value = (formData as any)[f.key] ?? "";
          const disabled =
            f.alwaysDisabled || (f.disabledWhenNotEditing && !isEditing);

          return (
            <div key={f.key} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                {f.label}
              </label>

              <div className="relative">
                <f.Icon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />

                <input
                  type={f.type}
                  disabled={disabled}
                  value={value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [f.key]: e.target.value,
                    }))
                  }
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 outline-none disabled:opacity-50 ${
                    f.mono
                      ? "text-slate-400 font-mono cursor-not-allowed"
                      : "text-slate-200"
                  }`}
                />
              </div>
            </div>
          );
        })}

        {/* Address */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Address
          </label>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              disabled={!isEditing}
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
