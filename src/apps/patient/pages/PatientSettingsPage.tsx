import React, { useEffect, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  User,
  Bell,
  Watch,
  ShieldCheck,
  Save,
  CheckCircle,
  CreditCard,
  LogOut,
  Phone,
  Check,
  Lock,
  Mail,
  FileDown,
  AlertCircle,
  ArrowRight,
  FileText,
  Fingerprint,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { health_companion_image } from "@/assets";
import { fetchProfile } from "@/shared/utils/utilityFunction";
import { toast } from "react-toastify";

type SettingsTab = "profile" | "notifications" | "wearables" | "identity";

type GenderOption = "Male" | "Female" | "Other" | "";

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

type ProfileFormState = {
  avatar: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  gender: GenderOption;
  emergencyContacts: EmergencyContact[];
};

/* ── Google Fit proper SVG icon ─────────────────────────────────────────── */
function GoogleFitIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
        fill="#fff"
      />
      <path
        d="M17.5 8.5a5.5 5.5 0 0 0-5.5 5.5"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 15.5a5.5 5.5 0 0 0 5.5-5.5"
        stroke="#4285F4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.5 8.5a5.5 5.5 0 0 0 5.5 5.5"
        stroke="#34A853"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15.5 15.5a5.5 5.5 0 0 0-5.5-5.5"
        stroke="#FBBC05"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const WEARABLES = [
  {
    id: "apple_health",
    name: "Apple Health",
    icon: "🍎",
    connected: true,
    sharing: ["steps", "heart_rate", "sleep"],
  },
  { id: "fitbit", name: "Fitbit", icon: "⌚", connected: false, sharing: [] },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: null,
    connected: false,
    sharing: [],
  },
  { id: "oura", name: "Oura Ring", icon: "💍", connected: false, sharing: [] },
];

/* ── Verification Status Dashboard ─────────────────────────────────────── */
function VerificationDashboard({ ninVerified }: { ninVerified: boolean }) {
  const checks = [
    {
      label: "Email Address",
      done: true,
      icon: Mail,
      note: "Verified via confirmation link",
    },
    {
      label: "Phone Number",
      done: true,
      icon: Phone,
      note: "Verified via SMS OTP",
    },
    {
      label: "NIN (Government ID)",
      done: ninVerified,
      icon: Fingerprint,
      note: ninVerified
        ? "Linked to NIMC"
        : "Required for cross-border transfers",
    },
    {
      label: "Advanced Identity Signing",
      done: false,
      optional: true,
      icon: Lock,
      note: "Optional — cryptographic record protection",
    },
  ];
  const completed = checks.filter((c) => c.done).length;
  const pct = Math.round((completed / checks.length) * 100);
  const pctColor = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="card-patient p-6 mb-2">
      {/* Header + donut-style progress */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-base text-gray-900">
            Verification Status
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete all steps to maximise your trust level
          </p>
        </div>
        {/* Circular progress badge */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={pctColor}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black" style={{ color: pctColor }}>
              {pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {checks.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{
              background: c.done ? "rgba(16,185,129,0.04)" : "var(--pat-bg)",
              borderColor: c.done
                ? "rgba(16,185,129,0.2)"
                : "var(--pat-border)",
            }}
          >
            {/* Status indicator */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: c.done ? "#10b981" : "var(--pat-surface2)",
              }}
            >
              {c.done ? (
                <Check size={13} color="#fff" strokeWidth={3} />
              ) : (
                <c.icon size={13} style={{ color: "var(--pat-muted)" }} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {c.label}
                {(c as any).optional && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    Optional
                  </span>
                )}
              </div>
              <div className="text-[11px] mt-0.5 text-gray-500">{c.note}</div>
            </div>

            {/* Action */}
            {!c.done && (
              <span
                className="text-[11px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                style={{
                  background: "rgba(4,30,66,0.07)",
                  color: "var(--pat-primary)",
                }}
              >
                {(c as any).optional ? "Enable" : "Verify →"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Data Portability Section ─────────────────────────────────────────── */
function DataPortabilitySection() {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
    }, 2200);
  };

  return (
    <div className="card-patient p-6 hidden">
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(4,30,66,0.07)" }}
        >
          <FileDown size={18} style={{ color: "var(--pat-primary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base text-gray-900 mb-1">
            Data Portability
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Export a complete copy of your WelliRecord in{" "}
            <span className="font-bold text-gray-700">FHIR R4 format</span> —
            the international standard for health data exchange. Your export can
            be imported into any compatible hospital system or personal health
            app worldwide.
          </p>

          {/* Format chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {["FHIR R4 JSON", "PDF Summary", "CSV (Vitals)"].map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border"
                style={{
                  background: "var(--pat-bg)",
                  borderColor: "var(--pat-border)",
                  color: "var(--pat-text)",
                }}
              >
                <FileText size={11} />
                {f}
              </span>
            ))}
          </div>

          {exported ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
              <CheckCircle size={16} />
              Export ready — check your email for the secure download link
            </div>
          ) : (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--pat-primary)", color: "#fff" }}
            >
              {exporting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Preparing your export…
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  Request Full Export
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}

          <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
            <AlertCircle size={10} />
            Export is encrypted and delivered to your registered email within 5
            minutes. Required under NDPR Article 18.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PatientSettingsPage() {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);

  // Full name change flow
  const [nameEditing, setNameEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [nameRequested, setNameRequested] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProfileFormState>({
    avatar: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    dateOfBirth: "",
    phone: "",
    gender: "",
    emergencyContacts: [],
  });

  // NIN Verification Mock State
  const [ninStatus, setNinStatus] = useState<
    "unverified" | "sending" | "otp" | "verifying" | "verified"
  >("unverified");
  const [ninNumber, setNinNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const canEditPhone = !profile?.phone;
  const canEditGender = !profile?.gender;

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await fetchProfile();

      setProfile(data);

      setForm({
        avatar: data?.avatar || "",
        firstName: data?.firstName || "",
        middleName: data?.middleName || "",
        lastName: data?.lastName || "",
        fullName: data?.fullName || "",
        dateOfBirth: data?.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : "",
        phone: data?.phone || "",
        gender: data?.gender || "",
        emergencyContacts: Array.isArray(data?.emergencyContacts)
          ? data.emergencyContacts
          : [],
      });
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const hasChanges =
    JSON.stringify({
      avatar: profile?.avatar || "",
      firstName: profile?.firstName || "",
      middleName: profile?.middleName || "",
      lastName: profile?.lastName || "",
      fullName: profile?.fullName || "",
      dateOfBirth: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : "",
      phone: profile?.phone || "",
      gender: profile?.gender || "",
      emergencyContacts: Array.isArray(profile?.emergencyContacts)
        ? profile.emergencyContacts
        : [],
    }) !== JSON.stringify(form);

  const save = async () => {
    try {
      setSaving(true);

      const payload: any = {
        avatar: form.avatar || null,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || null,
        emergencyContacts: form.emergencyContacts.map((c) => ({
          name: c.name.trim(),
          relationship: c.relationship.trim(),
          phone: c.phone.trim(),
        })),
      };

      if (!profile?.phone && form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      if (!profile?.gender && form.gender) {
        payload.gender = form.gender;
      }

      const updated = await updateProfile(payload);

      setProfile(updated?.data || updated);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  const handleNinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ninStatus === "unverified") {
      setNinStatus("sending");
      setTimeout(() => setNinStatus("otp"), 1500);
    } else if (ninStatus === "otp") {
      setNinStatus("verifying");
      setTimeout(() => setNinStatus("verified"), 2000);
    }
  };

  const updateField =
    (key: keyof ProfileFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const updateEmergencyContact = (
    index: number,
    key: keyof EmergencyContact,
    value: string,
  ) => {
    setForm((prev) => {
      const updated = [...prev.emergencyContacts];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, emergencyContacts: updated };
    });
  };

  const addEmergencyContact = () => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: "", relationship: "", phone: "" },
      ],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  const TABS: {
    id: SettingsTab;
    label: string;
    icon: any;
    disabled?: boolean;
  }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell, disabled: true },
    { id: "wearables", label: "Wearables", icon: Watch, disabled: true },
    {
      id: "identity",
      label: "Identity & Security",
      icon: ShieldCheck,
      disabled: true,
    },
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10">
      {/* ─── Profile Header & Member Status ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 mt-2">
        <div className="relative flex-shrink-0">
          <img
            src={user?.avatar || health_companion_image}
            className="w-24 h-24 rounded-full object-cover shadow-sm bg-white"
            style={{ border: "4px solid var(--pat-surface2)" }}
          />
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
            <CheckCircle size={14} color="#fff" />
          </div>
        </div>

        <div className="flex-1">
          <h1
            className="section-header font-display mb-1"
            style={{ color: "#1a2e1e" }}
          >
            {user?.name}
          </h1>
          <div
            className="flex flex-wrap items-center gap-3 text-sm"
            style={{ color: "#5a7a63" }}
          >
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              Member since 2024
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Status:
              Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Plan: Premium ✨
            </span>
          </div>
        </div>

      <div className="flex w-full gap-2 md:w-auto">
  <Link
    to="/patient/billing"
    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 md:flex-none"
  >
    <CreditCard size={16} className="text-gray-500" />
    Billing
  </Link>

  <button
    onClick={handleSignOut}
    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 md:flex-none"
  >
    <LogOut size={16} />
    Sign Out
  </button>
</div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tab nav */}
        <div className="lg:col-span-1">
          <div className="card-patient p-2 space-y-1 sticky top-6">
            {TABS.map((t) => {
              const isDisabled = t.disabled;

              return (
                <button
                  key={t.id}
                  onClick={() => !isDisabled && setTab(t.id)}
                  disabled={isDisabled}
                  className={`sidebar-item sidebar-item-patient w-full 
            ${tab === t.id ? "active" : ""}
            ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
          `}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3 space-y-6">
          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <>
              {loadingProfile ? (
                <ProfileSkeleton />
              ) : (
               <>
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="mb-6 border-b border-gray-100 pb-2 text-base font-bold text-gray-900">
      Personal Information
    </h2>

    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Full Name
        </label>
        <input
          value={form.fullName}
          onChange={updateField("fullName")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter full name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Member ID
        </label>
        <input
          value={profile?.wrId || ""}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 outline-none"
          readOnly
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          First Name
        </label>
        <input
          value={form.firstName}
          onChange={updateField("firstName")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter first name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Middle Name
        </label>
        <input
          value={form.middleName}
          onChange={updateField("middleName")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter middle name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Last Name
        </label>
        <input
          value={form.lastName}
          onChange={updateField("lastName")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter last name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={updateField("dateOfBirth")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Email Address
        </label>
        <input
          value={profile?.email || ""}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 outline-none"
          type="email"
          readOnly
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Phone Number
        </label>

        <input
          value={canEditPhone ? form.phone : profile?.phone || ""}
          onChange={canEditPhone ? updateField("phone") : undefined}
          className={`w-full rounded-lg px-4 py-2.5 text-sm outline-none transition ${
            canEditPhone
              ? "border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              : "border border-gray-200 bg-gray-50 text-gray-500"
          }`}
          type="tel"
          readOnly={!canEditPhone}
          placeholder={canEditPhone ? "Enter phone number" : ""}
        />

        {!canEditPhone && (
          <p className="mt-1 text-[11px] text-gray-400">
            Phone number cannot be changed once set.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Gender
        </label>

        {canEditGender ? (
          <select
            value={form.gender}
            onChange={updateField("gender")}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        ) : (
          <>
            <input
              value={profile?.gender || ""}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 outline-none"
              readOnly
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Gender cannot be changed once set.
            </p>
          </>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Avatar URL
        </label>
        <input
          value={form.avatar}
          onChange={updateField("avatar")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Paste image URL"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-3 block text-sm font-semibold text-gray-700">
          Emergency Contacts
        </label>

        <div className="space-y-4">
          {form.emergencyContacts.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No emergency contacts added yet.
            </div>
          )}

          {form.emergencyContacts.map((contact, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3"
            >
              <input
                value={contact.name}
                onChange={(e) =>
                  updateEmergencyContact(index, "name", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Full name"
              />
              <input
                value={contact.relationship}
                onChange={(e) =>
                  updateEmergencyContact(index, "relationship", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Relationship"
              />
              <div className="flex gap-2">
                <input
                  value={contact.phone}
                  onChange={(e) =>
                    updateEmergencyContact(index, "phone", e.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Phone number"
                />
                <button
                  type="button"
                  onClick={() => removeEmergencyContact(index)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addEmergencyContact}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Add Emergency Contact
          </button>
        </div>
      </div>
    </div>
  </div>

  <div className="flex justify-end pt-0">
    <button
      onClick={save}
      disabled={!hasChanges || saving}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving ? (
        "Saving..."
      ) : saved ? (
        <>
          <CheckCircle size={16} /> Saved Successfully
        </>
      ) : (
        <>
          <Save size={16} /> Save Changes
        </>
      )}
    </button>
  </div>
</>
              )}

              <DataPortabilitySection />
            </>
          )}

          {/* ── IDENTITY TAB ── */}
          {tab === "identity" && (
            <div className="space-y-6">
              {/* Verification Status Dashboard */}
              <VerificationDashboard ninVerified={ninStatus === "verified"} />

              {/* NIN Verification Section */}
              <div className="card-patient p-6 border-2 border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50" />

                <h2 className="font-bold text-base mb-2 text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />{" "}
                  Government Identity Verification
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Verify your identity using your National Identification Number
                  (NIN). This is required for cross-border hospital transfers
                  and emergency access overrides.
                </p>

                {ninStatus === "verified" ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-800">
                        Identity Verified
                      </h3>
                      <p className="text-sm text-emerald-600 mt-1">
                        Your National Identification Number has been securely
                        verified and linked to your WelliRecord.
                      </p>
                      <div className="mt-3 text-xs font-mono bg-white px-2 py-1 rounded inline-block text-gray-500 border border-emerald-100 shadow-sm">
                        NIN: ** *** **** 892
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleNinSubmit}
                    className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm"
                  >
                    {ninStatus === "unverified" || ninStatus === "sending" ? (
                      <>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Enter your 11-digit NIN
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="e.g. 12345678901"
                            className="input input-light flex-1 font-mono tracking-widest text-lg"
                            value={ninNumber}
                            onChange={(e) =>
                              setNinNumber(
                                e.target.value.replace(/\D/g, "").slice(0, 11),
                              )
                            }
                            disabled={ninStatus === "sending"}
                            required
                            minLength={11}
                          />
                          <button
                            type="submit"
                            disabled={
                              ninNumber.length !== 11 || ninStatus === "sending"
                            }
                            className="btn btn-patient whitespace-nowrap"
                          >
                            {ninStatus === "sending"
                              ? "Sending OTP..."
                              : "Verify NIN"}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                          <Phone size={12} /> A one-time code will be sent to
                          the phone number registered with NIMC.
                        </p>
                      </>
                    ) : (
                      <div className="animate-fade-in text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Phone size={20} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Enter OTP Code
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                          We sent a 6-digit code to your NIMC registered phone
                          number ending in ****456.
                        </p>
                        <div className="max-w-[240px] mx-auto">
                          <input
                            type="text"
                            placeholder="000000"
                            className="input input-light text-center font-mono tracking-[0.5em] text-2xl mb-4"
                            value={otpCode}
                            onChange={(e) =>
                              setOtpCode(
                                e.target.value.replace(/\D/g, "").slice(0, 6),
                              )
                            }
                            disabled={ninStatus === "verifying"}
                          />
                          <button
                            type="submit"
                            disabled={
                              otpCode.length !== 6 || ninStatus === "verifying"
                            }
                            className="btn btn-patient w-full justify-center"
                          >
                            {ninStatus === "verifying"
                              ? "Verifying with NIMC..."
                              : "Confirm Identity"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Advanced Identity Verification (formerly "Blockchain Identity (Web3)") */}
              <div className="card-patient p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(4,30,66,0.07)" }}
                  >
                    <Lock size={16} style={{ color: "var(--pat-primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-base text-gray-900">
                        Advanced Identity Verification
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Optional
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Your records are{" "}
                      <span className="font-semibold text-gray-800">
                        cryptographically signed
                      </span>{" "}
                      — this means no one can alter them without your knowledge.
                      Enabling this adds an extra layer of tamper-proof
                      verification to every document in your vault.
                    </p>

                    {/* Plain-language benefit chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {[
                        { label: "Tamper-proof records", color: "#059669" },
                        {
                          label: "Verifiable by any hospital",
                          color: "var(--pat-primary)",
                        },
                        {
                          label: "No technical knowledge needed",
                          color: "#7c3aed",
                        },
                      ].map((b) => (
                        <span
                          key={b.label}
                          className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          style={{
                            background: `${b.color}12`,
                            color: b.color,
                            border: `1px solid ${b.color}25`,
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                          {b.label}
                        </span>
                      ))}
                    </div>

                    <button
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        background: "var(--pat-primary)",
                        color: "#fff",
                      }}
                    >
                      <Lock size={14} />
                      Enable Identity Signing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === "notifications" && (
            <div className="card-patient p-6 space-y-4">
              <h2 className="font-bold text-base mb-4 text-gray-900 border-b border-gray-100 pb-2">
                Notification Preferences
              </h2>
              {[
                {
                  label: "Lab Results Ready",
                  desc: "Get notified when new lab results are published",
                  on: true,
                },
                {
                  label: "Consent Requests",
                  desc: "When a provider requests access to your records",
                  on: true,
                },
                {
                  label: "Appointment Reminders",
                  desc: "24h before your appointments",
                  on: true,
                },
                {
                  label: "Emergency Mode Alerts",
                  desc: "When paramedics invoke emergency read access",
                  on: true,
                  critical: true,
                },
                {
                  label: "Medication Reminders",
                  desc: "Daily reminders for active prescriptions",
                  on: false,
                },
                {
                  label: "Access Audit Log",
                  desc: "Each time a provider views your records",
                  on: false,
                },
              ].map((n) => (
                <div
                  key={n.label}
                  className={`flex items-center justify-between p-4 rounded-xl border ${n.critical ? "bg-red-50 border-red-100" : "bg-white border-gray-100"}`}
                >
                  <div>
                    <div
                      className={`font-bold text-sm ${n.critical ? "text-red-800" : "text-gray-900"}`}
                    >
                      {n.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${n.critical ? "text-red-600" : "text-gray-500"}`}
                    >
                      {n.desc}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 42,
                      height: 24,
                      borderRadius: 12,
                      background: n.on
                        ? n.critical
                          ? "#ef4444"
                          : "#1a6b42"
                        : "#e5e7eb",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background .2s",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 3,
                        left: n.on ? 21 : 3,
                        transition: "left .2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── WEARABLES TAB ── */}
          {tab === "wearables" && (
            <div className="card-patient p-6 space-y-4">
              <h2 className="font-bold text-base mb-4 text-gray-900 border-b border-gray-100 pb-2">
                Connected Devices
              </h2>
              {WEARABLES.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl flex items-center gap-4 bg-white border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  {/* Icon — custom SVG for Google Fit, emoji for others */}
                  <div className="text-3xl w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                    {w.id === "google_fit" ? (
                      <GoogleFitIcon size={26} />
                    ) : (
                      w.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900">
                      {w.name}
                    </div>
                    {w.connected && w.sharing.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {w.sharing.map((s) => (
                          <span
                            key={s}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          >
                            {s.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    )}
                    {!w.connected && (
                      <div className="text-xs text-gray-500 mt-1">
                        Not connected
                      </div>
                    )}
                  </div>
                  <button
                    className={`btn btn-sm shadow-sm ${w.connected ? "bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600" : "btn-patient"}`}
                  >
                    {w.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ProfileSkeleton = () => {
  return (
    <>
      <div className="card-patient p-6 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-6 border-b pb-2" />

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>

          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>

          <div>
            <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>

          <div>
            <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>

          <div className="md:col-span-2">
            <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-0">
        <div className="h-11 w-36 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </>
  );
};
