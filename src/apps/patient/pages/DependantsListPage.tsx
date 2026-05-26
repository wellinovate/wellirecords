import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { dependantApi } from '@/shared/api/dependantApi';
import {
  Baby, Plus, ShieldCheck, Activity, AlertCircle, ChevronRight,
  Syringe, Droplets, Dna, CalendarClock, Ruler, Weight,
  CalendarPlus, TriangleAlert, TrendingUp, Heart, Pill, Lock,
  Share2, QrCode, Zap, Watch, Smartphone, Wallet, Truck,
  Users, Clock, CheckCircle, XCircle, ArrowRight, Smartphone as Mobile,
  BarChart3, Sparkles, MapPin, Star, Shield,
} from 'lucide-react';
import { AddChildProfileModal } from '../components/AddChildProfileModal';
import { BookingModal, BookingProvider } from './BookingModal';

/** Returns the top-border color based on card alert status. */
function cardAccentColor(vacPending: number, hasAlerts: boolean): string {
  if (hasAlerts) return '#ef4444';
  if (vacPending > 0) return '#f59e0b';
  return '#10b981';
}

/**
 * WHO/IMCI pediatric milestone checkup schedule.
 * Returns the next recommended checkup date string based on age in years.
 */
function nextCheckupDate(dobString: string): { label: string; iso: string } {
  const dob = new Date(dobString);
  const today = new Date();
  const ageMonths =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth());

  // WHO milestone visit schedule (in months)
  const milestones = [1, 2, 4, 6, 9, 12, 15, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];
  const nextMilestone = milestones.find(m => m > ageMonths) ?? ageMonths + 12;

  const visitDate = new Date(dob);
  visitDate.setMonth(dob.getMonth() + nextMilestone);

  const label = visitDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const iso = visitDate.toISOString().split('T')[0];
  return { label, iso };
}

/**
 * Very rough WHO-based weight-for-age category.
 * Returns a short label + color for display.
 */
function growthCategory(ageMonths: number, weightKg: number, heightCm: number): {
  weightLabel: string;
  weightColor: string;
  heightLabel: string;
  heightColor: string;
} {
  // Rough median weight & height from WHO growth charts (50th percentile)
  // Values in kg / cm at key age-month points
  const refs: { months: number; weightP50: number; heightP50: number }[] = [
    { months: 0, weightP50: 3.3, heightP50: 49.9 },
    { months: 3, weightP50: 6.0, heightP50: 61.4 },
    { months: 6, weightP50: 7.9, heightP50: 67.6 },
    { months: 12, weightP50: 9.6, heightP50: 75.7 },
    { months: 24, weightP50: 12.2, heightP50: 87.8 },
    { months: 36, weightP50: 14.3, heightP50: 96.1 },
    { months: 48, weightP50: 16.3, heightP50: 103.3 },
    { months: 60, weightP50: 18.3, heightP50: 110.0 },
    { months: 72, weightP50: 20.5, heightP50: 116.0 },
    { months: 84, weightP50: 22.9, heightP50: 121.7 },
    { months: 96, weightP50: 25.4, heightP50: 127.3 },
  ];

  // Find the closest reference point
  const ref = refs.reduce((prev, curr) =>
    Math.abs(curr.months - ageMonths) < Math.abs(prev.months - ageMonths) ? curr : prev
  );

  const weightRatio = weightKg / ref.weightP50;
  const heightRatio = heightCm / ref.heightP50;

  function classify(ratio: number): { label: string; color: string } {
    if (ratio >= 0.93 && ratio <= 1.10) return { label: '~50th %ile', color: '#059669' };
    if (ratio > 1.10 && ratio <= 1.20) return { label: '75th+ %ile', color: '#0284c7' };
    if (ratio > 1.20) return { label: '90th+ %ile', color: '#7c3aed' };
    if (ratio < 0.93 && ratio >= 0.80) return { label: '25th %ile', color: '#d97706' };
    return { label: 'Below 10th', color: '#dc2626' };
  }

  const wc = classify(weightRatio);
  const hc = classify(heightRatio);
  return { weightLabel: wc.label, weightColor: wc.color, heightLabel: hc.label, heightColor: hc.color };
}

// Mock pediatric provider for the quick-book CTA
const PEDIATRIC_PROVIDER: BookingProvider = {
  name: 'Dr. Sarah Jenkins',
  specialty: 'Paediatrics',
  rating: '4.9',
  distance: '1.2 km',
  estimatedCost: '₦12,000',
  availability: {},
};

// Mock health data
const MOCK_HEALTH_METRICS = {
  totalFamilyMembers: 3,
  upcomingAppointments: 2,
  vaccinationsDue: 1,
  aiWellnessScore: 87,
  wellnessScoreTrend: 'up' as const,
};

const MOCK_ACCESS_RECORDS = [
  {
    id: 'access_1',
    name: 'Dr. Adebayo',
    role: 'Pediatrician',
    accessExpiresIn: '24 hrs',
    lastAccessed: '2 hours ago',
  },
  {
    id: 'access_2',
    name: 'Babcock Hospital',
    role: 'Hospital System',
    accessExpiresIn: 'Permanent',
    lastAccessed: '1 day ago',
  },
];

const MOCK_MEDICAL_ACTIVITY = [
  { type: 'vaccination', title: 'Yellow Fever Vaccination', date: '2024-05-20', icon: Syringe, status: 'completed' },
  { type: 'visit', title: 'Pediatric Checkup', date: '2024-05-15', icon: Activity, status: 'completed' },
  { type: 'lab', title: 'Lab Results Uploaded', date: '2024-05-10', icon: BarChart3, status: 'completed' },
  { type: 'prescription', title: 'Prescription Created', date: '2024-05-05', icon: Pill, status: 'pending' },
];

const MOCK_EMERGENCY_INFO = {
  bloodGroup: 'O+',
  genotype: 'AA',
  emergencyContact: 'Adekunle Awobodu',
  emergencyPhone: '+234 803 456 7890',
  preferredHospital: 'Babcock Hospital',
  chronicConditions: ['Mild Asthma'],
  allergies: ['Penicillin', 'Shellfish'],
};

const MOCK_ECOSYSTEM = [
  {
    id: 'wellibit',
    name: 'WelliBit Wearable',
    icon: Watch,
    status: 'synced',
    lastSync: '2 hours ago',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'welbio',
    name: 'WelliBio Lab',
    icon: Smartphone,
    status: 'connected',
    lastSync: '1 day ago',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'wallet',
    name: 'WelliWallet',
    icon: Wallet,
    status: 'active',
    balance: '₦5,250',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'track',
    name: 'WelliTrack',
    icon: Truck,
    status: 'active',
    deliveries: '2 in progress',
    color: 'from-orange-500 to-amber-500',
  },
];

export function FamilyManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const children = dependantApi.getChildrenByParent(user?.userId ?? 'pat_1');
  const children = [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingChild, setBookingChild] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  return (
    <div className="animate-fade-in space-y-8">
      {/* ─────────────────────────────────────────────────────────────────
          PAGE HEADER
          ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--pat-border)' }}>
        <div>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--pat-text)' }}>
            Family &amp; Dependants
          </h1>
          <p className="text-sm max-w-lg" style={{ color: 'var(--pat-muted)' }}>
            Manage secure health profiles, medical histories, emergency records, and AI-powered health insights for your loved ones.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap cursor-pointer"
          style={{ background: 'var(--pat-primary)', color: '#ffffff' }}
        >
          <Plus size={18} />
          Add Family Member
        </button>
      </div>

      {children.length === 0 ? (
        <>
          {/* ── Health Overview Cards (Empty State) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Members */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <Users size={24} style={{ color: '#3b82f6' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>0</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>Total Family Members</div>
            </div>

            {/* Appointments */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <CalendarClock size={24} style={{ color: '#8b5cf6' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>0</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>Upcoming Appointments</div>
            </div>

            {/* Vaccinations */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <Syringe size={24} style={{ color: '#22c55e' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>0</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>Vaccinations Due</div>
            </div>

            {/* AI Wellness Score */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                  <Heart size={24} style={{ color: '#ec4899' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>–</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>AI Wellness Score</div>
            </div>
          </div>

          {/* ── Empty State ── */}
          <div className="rounded-2xl border-2 border-dashed p-14 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-surface)' }}>
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'rgba(4,30,66,0.06)' }}>
              <Baby size={48} style={{ color: 'var(--pat-primary)' }} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--pat-text)' }}>No family profiles yet</h3>
            <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--pat-muted)' }}>
              Create secure digital health profiles for your children, parents, and dependants. Manage appointments, records, medications, and emergency information in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all border hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-text)' }}
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Child
                </span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all border hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-text)' }}
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Parent
                </span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────────────
              HEALTH OVERVIEW CARDS
              ───────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Members */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <Users size={24} style={{ color: '#3b82f6' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>{children.length}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>Total Family Members</div>
            </div>

            {/* Appointments */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <CalendarClock size={24} style={{ color: '#8b5cf6' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>{MOCK_HEALTH_METRICS.upcomingAppointments}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>Upcoming Appointments</div>
            </div>

            {/* Vaccinations Due */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <Syringe size={24} style={{ color: '#22c55e' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>{MOCK_HEALTH_METRICS.vaccinationsDue}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>Vaccinations Due</div>
            </div>

            {/* AI Wellness Score */}
            <div
              className="rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                  <Heart size={24} style={{ color: '#ec4899' }} />
                </div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--pat-text)' }}>{MOCK_HEALTH_METRICS.aiWellnessScore}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--pat-muted)' }}>AI Wellness Score</div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              FAMILY MEMBER CARDS GRID
              ───────────────────────────────────────────────────────────────── */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--pat-text)' }}>Family Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map(child => {
            const ageYears = new Date().getFullYear() - new Date(child.profile.dateOfBirth).getFullYear();
            const vacDone = child.vaccinations.filter(v => v.status === 'Completed').length;
            const vacPending = child.vaccinations.filter(v => v.status === 'Pending').length;
            const hasAlerts = child.medicalHistory.allergies.length > 0 || child.medicalHistory.chronicConditions.length > 0;
            const isASCarrier = child.profile.genotype === 'AS' || child.profile.genotype === 'SS';
            const accentColor = cardAccentColor(vacPending, hasAlerts);
            const nextCheckup = nextCheckupDate(child.profile.dateOfBirth);

            // Latest growth entry
            const latestGrowth = child.growth.length > 0
              ? child.growth[child.growth.length - 1]
              : null;
            const growthStats = latestGrowth
              ? growthCategory(latestGrowth.ageMonths, latestGrowth.weightKg, latestGrowth.heightCm)
              : null;

            return (
              <div
                key={child.id}
                className="group cursor-pointer rounded-2xl border shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
              >
                {/* Status-coded top border strip — thicker for emphasis */}
                <div className="h-2 w-full transition-all flex-shrink-0" style={{ background: accentColor }} />

                <div className="p-6 flex flex-col flex-1">
                  {/* ── Profile header ── */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={child.profile.avatar}
                        alt={child.profile.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2"
                        style={{ borderColor: 'var(--pat-border)' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(child.profile.fullName)}&background=1a6b42&color=fff&size=100&rounded=true`;
                        }}
                      />
                      {hasAlerts && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                          <AlertCircle size={10} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => navigate(`/patient/dependants/${child.id}`)}
                        className="font-display font-bold text-lg leading-snug truncate hover:underline cursor-pointer"
                        style={{ color: 'var(--pat-text)' }}
                      >
                        {child.profile.fullName}
                      </h3>
                      <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--pat-muted)' }}>
                        {child.profile.gender} &bull; {ageYears} years old
                      </div>

                      {/* Blood group + genotype tags */}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {/* Blood group */}
                        <span
                          className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(220,38,38,0.10)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.18)' }}
                          title="Blood Group"
                        >
                          <Droplets size={10} /> {child.profile.bloodGroup}
                        </span>

                        {/* ── AS/SS genotype: large, prominent amber pill ── */}
                        {isASCarrier ? (
                          <span
                            className="flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full"
                            style={{
                              background: 'rgba(245,158,11,0.15)',
                              color: '#92400e',
                              border: '1.5px solid rgba(245,158,11,0.45)',
                              letterSpacing: '0.01em',
                            }}
                            title="Sickle Cell Carrier — inform all providers"
                          >
                            <TriangleAlert size={13} strokeWidth={2.5} />
                            {child.profile.genotype} — Carrier
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(16,185,129,0.08)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}
                            title="Genotype"
                          >
                            <Dna size={10} /> {child.profile.genotype || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Growth Percentile Indicator ── */}
                  {latestGrowth && growthStats && (
                    <div
                      className="rounded-xl p-3 mb-4 border"
                      style={{ background: 'var(--pat-bg)', borderColor: 'var(--pat-border)' }}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'var(--pat-muted)' }}>
                        Latest Growth ({new Date(latestGrowth.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Weight */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${growthStats.weightColor}18` }}
                          >
                            <Weight size={13} style={{ color: growthStats.weightColor }} />
                          </div>
                          <div>
                            <div className="text-xs font-black" style={{ color: 'var(--pat-text)' }}>
                              {latestGrowth.weightKg} kg
                            </div>
                            <div className="text-[10px] font-bold" style={{ color: growthStats.weightColor }}>
                              {growthStats.weightLabel}
                            </div>
                          </div>
                        </div>
                        {/* Height */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${growthStats.heightColor}18` }}
                          >
                            <Ruler size={13} style={{ color: growthStats.heightColor }} />
                          </div>
                          <div>
                            <div className="text-xs font-black" style={{ color: 'var(--pat-text)' }}>
                              {latestGrowth.heightCm} cm
                            </div>
                            <div className="text-[10px] font-bold" style={{ color: growthStats.heightColor }}>
                              {growthStats.heightLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Stats row ── */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t" style={{ borderColor: 'var(--pat-border)' }}>
                    <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Syringe size={12} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600">{vacDone} Done</span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>Vaccines</div>
                    </div>
                    <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Activity size={12} style={{ color: 'var(--pat-primary)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--pat-primary)' }}>{child.growth.length}</span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>Checkups</div>
                    </div>
                  </div>

                  {/* ── Alert banners ── */}
                  <div className="space-y-2 mb-4">
                    {vacPending > 0 && (
                      <button
                        onClick={() => navigate(`/patient/dependants/${child.id}`)}
                        className="w-full flex items-center justify-between gap-2 text-xs font-semibold rounded-lg px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2">
                          <AlertCircle size={12} />
                          {vacPending} vaccine{vacPending > 1 ? 's' : ''} due soon
                        </span>
                        <ChevronRight size={12} className="flex-shrink-0" />
                      </button>
                    )}
                    {child.medicalHistory.allergies.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2 bg-red-50 text-red-700">
                        <AlertCircle size={12} />
                        Allergy: {child.medicalHistory.allergies[0]}{child.medicalHistory.allergies.length > 1 ? ` +${child.medicalHistory.allergies.length - 1} more` : ''}
                      </div>
                    )}
                    {isASCarrier && (
                      <div className="flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2"
                        style={{ background: 'rgba(245,158,11,0.10)', color: '#92400e', border: '1px solid rgba(245,158,11,0.25)' }}>
                        <Dna size={12} />
                        Sickle Cell Carrier — inform providers
                      </div>
                    )}
                    {!vacPending && !hasAlerts && !isASCarrier && (
                      <div className="flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2 bg-emerald-50 text-emerald-700">
                        <ShieldCheck size={12} />
                        All vaccinations up to date
                      </div>
                    )}
                  </div>

                  {/* ── Next Recommended Checkup ── */}
                  <div
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-4"
                    style={{ background: 'rgba(4,30,66,0.05)', border: '1px solid var(--pat-border)' }}
                  >
                    <CalendarClock size={15} style={{ color: 'var(--pat-primary)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--pat-muted)' }}>
                        Next WHO Checkup
                      </div>
                      <div className="text-xs font-bold truncate" style={{ color: 'var(--pat-text)' }}>
                        {nextCheckup.label}
                      </div>
                    </div>
                  </div>

                  {/* ── Book Appointment for Child CTA ── */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setBookingChild(child.id); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5 hover:shadow-md mb-4"
                    style={{
                      background: 'var(--pat-primary)',
                      color: '#ffffff',
                    }}
                  >
                    <CalendarPlus size={14} />
                    Book Appointment for {child.profile.fullName.split(' ')[0]}
                  </button>

                  {/* ── Footer ── */}
                  <div
                    onClick={() => navigate(`/patient/dependants/${child.id}`)}
                    className="flex items-center justify-between pt-4 border-t cursor-pointer mt-auto"
                    style={{ borderColor: 'var(--pat-border)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--pat-muted)' }}>
                      Updated: {new Date(child.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold group-hover:underline" style={{ color: 'var(--pat-primary)' }}>
                      View Record <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              AI HEALTH INSIGHTS PANEL
              ───────────────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                <Sparkles size={20} style={{ color: '#ec4899' }} />
              </div>
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--pat-text)' }}>AI Health Insights</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <Pill size={16} style={{ color: '#22c55e' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--pat-text)' }}>Medication Adherence</div>
                    <div className="text-xs mb-2" style={{ color: 'var(--pat-muted)' }}>Family adherence: 92% over last 30 days</div>
                    <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--pat-bg)' }}>
                      <div className="bg-emerald-500" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <Activity size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--pat-text)' }}>Activity & Sleep</div>
                    <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>
                      Average sleep: 8.2 hours/night • Activity: 85% goal met
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-amber-50" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1 text-amber-900">Abnormal Trend Detected</div>
                    <div className="text-xs text-amber-800">
                      Slight elevation in blood pressure readings over past week. Schedule a checkup.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              MEDICAL ACTIVITY TIMELINE
              ───────────────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <Clock size={20} style={{ color: '#3b82f6' }} />
              </div>
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--pat-text)' }}>Medical Activity Timeline</h2>
            </div>

            <div className="space-y-1">
              {MOCK_MEDICAL_ACTIVITY.map((activity, idx) => {
                const ActivityIcon = activity.icon;
                const isCompleted = activity.status === 'completed';
                return (
                  <div key={idx} className="flex gap-4 pb-4" style={{ borderBottom: idx < MOCK_MEDICAL_ACTIVITY.length - 1 ? '1px solid var(--pat-border)' : 'none' }}>
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(229, 231, 235, 0.5)',
                          borderColor: isCompleted ? '#10b981' : 'var(--pat-border)',
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                        ) : (
                          <Clock size={16} style={{ color: 'var(--pat-muted)' }} />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="font-semibold text-sm" style={{ color: 'var(--pat-text)' }}>
                        {activity.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--pat-muted)' }}>
                        {new Date(activity.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              EMERGENCY INFORMATION PANEL
              ───────────────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
          >
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <AlertCircle size={20} style={{ color: '#ef4444' }} />
                </div>
                <h2 className="font-display font-bold text-xl" style={{ color: 'var(--pat-text)' }}>Emergency Information</h2>
              </div>
              <button
                onClick={() => setShowEmergencyModal(!showEmergencyModal)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:shadow-md"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              >
                <QrCode size={14} />
                Generate QR Code
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blood Group */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--pat-muted)' }}>Blood Group</div>
                <div className="text-lg font-bold" style={{ color: 'var(--pat-text)' }}>{MOCK_EMERGENCY_INFO.bloodGroup}</div>
              </div>

              {/* Genotype */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--pat-muted)' }}>Genotype</div>
                <div className="text-lg font-bold" style={{ color: 'var(--pat-text)' }}>{MOCK_EMERGENCY_INFO.genotype}</div>
              </div>

              {/* Emergency Contact */}
              <div className="rounded-xl border p-4 sm:col-span-2" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--pat-muted)' }}>Emergency Contact</div>
                <div className="text-sm font-bold" style={{ color: 'var(--pat-text)' }}>{MOCK_EMERGENCY_INFO.emergencyContact}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--pat-muted)' }}>{MOCK_EMERGENCY_INFO.emergencyPhone}</div>
              </div>

              {/* Preferred Hospital */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--pat-muted)' }}>Preferred Hospital</div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: 'var(--pat-primary)' }} />
                  <div className="text-sm font-semibold" style={{ color: 'var(--pat-text)' }}>{MOCK_EMERGENCY_INFO.preferredHospital}</div>
                </div>
              </div>

              {/* Allergies Count */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--pat-muted)' }}>Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {MOCK_EMERGENCY_INFO.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--pat-primary)', color: '#fff' }}
              >
                <QrCode size={16} />
                Generate Emergency QR
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all border"
                style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-text)' }}
              >
                <Share2 size={16} />
                Share Emergency Access
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              ACCESS & PERMISSIONS SECTION
              ───────────────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <Lock size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--pat-text)' }}>Access &amp; Permissions</h2>
            </div>

            <div className="space-y-3">
              {MOCK_ACCESS_RECORDS.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: 'var(--pat-text)' }}>
                      {record.name}
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--pat-muted)' }}>
                      <span>{record.role}</span>
                      <span>•</span>
                      <span>Expires in {record.accessExpiresIn}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-md border"
                      style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-text)' }}
                    >
                      Extend
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-md text-red-600 border border-red-200 bg-red-50"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981' }}>
              <Shield size={16} style={{ color: '#10b981' }} />
              <span className="text-xs" style={{ color: '#047857' }}>
                All access records are blockchain-verified and auditable.
              </span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              CONNECTED ECOSYSTEM
              ───────────────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <Zap size={20} style={{ color: '#22c55e' }} />
              </div>
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--pat-text)' }}>Connected Ecosystem</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOCK_ECOSYSTEM.map((service) => {
                const ServiceIcon = service.icon;
                const isActive = service.status === 'connected' || service.status === 'synced' || service.status === 'active';
                return (
                  <div
                    key={service.id}
                    className="rounded-xl border p-4 hover:shadow-lg transition-all cursor-pointer group"
                    style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${service.color}`}>
                        <ServiceIcon size={18} />
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: isActive ? '#22c55e' : '#d1d5db' }}
                      />
                    </div>
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--pat-text)' }}>
                      {service.name}
                    </div>
                    <div className="text-xs mb-3" style={{ color: 'var(--pat-muted)' }}>
                      {service.lastSync && <span>Synced {service.lastSync}</span>}
                      {service.balance && <span>{service.balance}</span>}
                      {service.deliveries && <span>{service.deliveries}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--pat-primary)' }}>
                      View <ArrowRight size={12} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Add Family Member Modal */}
      <AddChildProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Book Appointment Modal (for child quick-book) */}
      {bookingChild && (
        <BookingModal
          provider={{
            ...PEDIATRIC_PROVIDER,
            name: (() => {
              const child = children.find(c => c.id === bookingChild);
              return child?.authorization?.primaryPediatrician ?? PEDIATRIC_PROVIDER.name;
            })(),
          }}
          onClose={() => setBookingChild(null)}
        />
      )}
    </div>
  );
}
