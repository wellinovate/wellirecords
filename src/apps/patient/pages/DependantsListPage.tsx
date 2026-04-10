import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { dependantApi } from '@/shared/api/dependantApi';
import {
  Baby, Plus, ShieldCheck, Activity, AlertCircle, ChevronRight,
  Syringe, Droplets, Dna, CalendarClock, Ruler, Weight,
  CalendarPlus, TriangleAlert,
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

export function FamilyManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const children = dependantApi.getChildrenByParent(user?.userId ?? 'pat_1');
  const children = [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingChild, setBookingChild] = useState<string | null>(null);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--pat-border)' }}>
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--pat-text)' }}>
            Family &amp; Dependants
          </h1>
          <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>
            Manage health profiles and medical histories for your children and elderly parents.
          </p>
        </div>
        <button
          // onClick={() => setIsModalOpen(true)}
          disabled={true} // Temporarily disable until modal form is ready
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-none"
          style={{ background: 'var(--pat-primary)' }}
        >
          <Plus size={16} />
          Add Family Member
        </button>
      </div>

      {children.length === 0 ? (
        /* ── Empty State ── */
        <div className="rounded-2xl border-2 border-dashed p-14 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-surface)' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'rgba(4,30,66,0.06)', color: 'var(--pat-primary)' }}>
            <Baby size={38} />
          </div>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--pat-text)' }}>No family profiles yet</h3>
          <p className="text-sm max-w-xs mx-auto mb-8" style={{ color: 'var(--pat-muted)' }}>
            Create a digital health record for a child or elderly parent to track their health history, vaccinations, and medical notes.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={true} // Temporarily disable until modal form is ready
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white mx-auto transition-opacity hover:opacity-90 cursor-none"
            style={{ background: 'var(--pat-primary)' }}
          >
            Add First Family Member
          </button>
        </div>
      ) : (
        /* ── Children Grid ── */
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
                      color: '#fff',
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
