import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dependantApi } from '@/shared/api/dependantApi';
import {
    ArrowLeft, Baby, Shield, FileText, QrCode,
    Syringe, Scale, HeartPulse, UserCircle2, CheckCircle2,
    AlertCircle, Phone, Mail, MapPin, Calendar, Stethoscope,
    ClipboardList, Pill, History, Lock
} from 'lucide-react';

// ─── Reusable sub-components ───────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
            <div className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <Icon size={16} style={{ color: 'var(--pat-primary)' }} />
                <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--pat-primary)', letterSpacing: '0.08em' }}>{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--pat-border)' }}>
            <span className="text-sm" style={{ color: 'var(--pat-muted)' }}>{label}</span>
            <span className="text-sm font-semibold text-right ml-4" style={{ color: 'var(--pat-text)' }}>{value}</span>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

type TabId = 'medical' | 'vaccines' | 'growth' | 'emergency';

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
    { id: 'medical', icon: ClipboardList, label: 'Medical History' },
    { id: 'vaccines', icon: Syringe, label: 'Vaccinations' },
    { id: 'growth', icon: Scale, label: 'Growth Chart' },
    { id: 'emergency', icon: QrCode, label: 'Emergency Profile' },
];

export function ChildProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const child = dependantApi.getChildRecord(id!);
    const [activeTab, setActiveTab] = useState<TabId>('medical');

    if (!child) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
                <AlertCircle size={48} className="text-red-400" />
                <h2 className="text-xl font-bold" style={{ color: 'var(--pat-text)' }}>Child record not found</h2>
                <button
                    onClick={() => navigate('/patient/dependants')}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--pat-primary)' }}
                >
                    Back to Dependants
                </button>
            </div>
        );
    }

    const ageYears = new Date().getFullYear() - new Date(child.profile.dateOfBirth).getFullYear();

    return (
        <div className="animate-fade-in pb-16 space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/patient/dependants')}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                    style={{ color: 'var(--pat-text)' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-display font-bold text-2xl leading-tight truncate" style={{ color: 'var(--pat-text)' }}>
                        {child.profile.fullName}&apos;s Health Record
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--pat-muted)' }}>
                        <Shield size={13} style={{ color: 'var(--pat-primary)', flexShrink: 0 }} />
                        <span>Encrypted Digital Health Record</span>
                        <span className="opacity-40">•</span>
                        <span>ID: <strong style={{ color: 'var(--pat-text)' }}>{child.profile.nationalHealthId || 'Pending'}</strong></span>
                    </div>
                </div>
            </div>

            {/* ── Main Two-Column Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ───────── LEFT SIDEBAR ───────── */}
                <div className="space-y-6">

                    {/* SECTION 1: Child Profile & Birth Details */}
                    <SectionCard title="Child Profile" icon={Baby}>
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6 pb-6 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                            <div className="relative mb-4">
                                <img
                                    src={child.profile.avatar}
                                    alt={child.profile.fullName}
                                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4"
                                    style={{ borderColor: 'white' }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.profile.fullName)}&background=041E42&color=fff&size=150`; }}
                                />
                                <div
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 shadow"
                                    style={{ background: 'var(--pat-primary)', borderColor: 'white' }}
                                >
                                    <Baby size={14} />
                                </div>
                            </div>
                            <h2 className="font-bold text-lg" style={{ color: 'var(--pat-text)' }}>{child.profile.fullName}</h2>
                            <span className="mt-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(4,30,66,0.07)', color: 'var(--pat-primary)' }}>
                                {child.profile.gender} &bull; {ageYears} years old
                            </span>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-0 mb-6">
                            <InfoRow label="Date of Birth" value={new Date(child.profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            <InfoRow label="Blood Group" value={<span className="font-black text-base" style={{ color: '#dc2626' }}>{child.profile.bloodGroup}</span>} />
                            <InfoRow label="Genotype" value={child.profile.genotype || 'Unknown'} />
                            <InfoRow label="Health ID" value={child.profile.nationalHealthId || '—'} />
                        </div>

                        {/* Birth Details Sub-section */}
                        <div className="pt-4 border-t space-y-0" style={{ borderColor: 'var(--pat-border)' }}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--pat-primary)' }}>Birth Details</p>
                            <InfoRow label="Place of Birth" value={child.birthDetails.placeOfBirth} />
                            <InfoRow label="Delivery" value={child.birthDetails.deliveryType} />
                            <InfoRow label="Birth Weight" value={`${child.birthDetails.birthWeightKg} kg`} />
                            <InfoRow label="Birth Length" value={`${child.birthDetails.birthLengthCm} cm`} />
                            {child.birthDetails.complications && child.birthDetails.complications !== 'None' && (
                                <InfoRow label="Complications" value={child.birthDetails.complications} />
                            )}
                        </div>
                    </SectionCard>

                    {/* SECTION 2: Parent / Guardian Information */}
                    <SectionCard title="Parent / Guardian" icon={UserCircle2}>
                        <div className="space-y-4">
                            {child.guardians.map((g, i) => (
                                <div key={i} className="rounded-xl border p-4" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>{g.fullName}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: 'var(--pat-primary)', color: '#fff' }}>
                                            {g.isPrimary ? '★ ' : ''}{g.relationship}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs" style={{ color: 'var(--pat-muted)' }}>
                                        <div className="flex items-center gap-2"><Phone size={11} /> {g.phoneNumber}</div>
                                        <div className="flex items-center gap-2"><Mail size={11} /> {g.email}</div>
                                        {g.address && <div className="flex items-center gap-2"><MapPin size={11} /> {g.address}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* SECTION 7 & 8: Provider Authorization + Consent */}
                    <SectionCard title="Provider & Consent" icon={Lock}>
                        <div className="space-y-0 mb-5">
                            <InfoRow label="Primary Paediatrician" value={child.authorization.primaryPediatrician} />
                            <InfoRow label="Clinic" value={child.authorization.clinicName} />
                            <InfoRow label="License No." value={child.authorization.licenseNo} />
                            <InfoRow
                                label="Consent Date"
                                value={new Date(child.authorization.consentDate || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            />
                        </div>

                        {/* E-Signature Box */}
                        <div className="rounded-xl border-2 border-dashed p-5 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                            <div className="flex items-center justify-center gap-1.5 mb-3">
                                <Shield size={13} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Digital Consent Active</span>
                            </div>
                            <p className="text-xs italic mb-4" style={{ color: 'var(--pat-muted)' }}>
                                "I authorize WelliRecord to securely store and manage this child's digital health record on behalf of the named guardian."
                            </p>
                            <div className="text-2xl mb-1" style={{ fontFamily: '"Brush Script MT", cursive', color: 'var(--pat-text)' }}>
                                {child.guardians[0]?.fullName}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--pat-primary)' }}>
                                E-Signed &bull; {child.guardians[0]?.relationship}
                            </div>
                        </div>
                    </SectionCard>

                </div>

                {/* ───────── RIGHT PANEL: Tabbed Main Content ───────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Tab Navigation */}
                    <div className="flex gap-1.5 p-1.5 rounded-2xl border" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                        {TABS.map(t => {
                            const active = activeTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all"
                                    style={{
                                        background: active ? 'var(--pat-primary)' : 'transparent',
                                        color: active ? '#fff' : 'var(--pat-muted)',
                                        boxShadow: active ? '0 2px 8px rgba(4,30,66,0.18)' : 'none',
                                    }}
                                >
                                    <t.icon size={15} />
                                    <span className="hidden sm:inline">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── TAB 1: Medical History (Section 5) ── */}
                    {activeTab === 'medical' && (
                        <div className="space-y-5 animate-fade-in">
                            <SectionCard title="Known Allergies" icon={AlertCircle}>
                                {child.medicalHistory.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {child.medicalHistory.allergies.map(a => (
                                            <span key={a} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', borderColor: 'rgba(220,38,38,0.15)' }}>
                                                ⚠ {a}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>No known allergies recorded.</p>
                                )}
                            </SectionCard>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <SectionCard title="Chronic Conditions" icon={HeartPulse}>
                                    {child.medicalHistory.chronicConditions.length > 0 ? (
                                        <ul className="space-y-2">
                                            {child.medicalHistory.chronicConditions.map(c => (
                                                <li key={c} className="flex items-start gap-2 text-sm" style={{ color: 'var(--pat-text)' }}>
                                                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--pat-primary)' }} />
                                                    {c}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>None recorded.</p>
                                    )}
                                </SectionCard>

                                <SectionCard title="Current Medications" icon={Pill}>
                                    {child.medicalHistory.currentMedications.length > 0 ? (
                                        <ul className="space-y-2">
                                            {child.medicalHistory.currentMedications.map(m => (
                                                <li key={m} className="flex items-start gap-2 text-sm" style={{ color: 'var(--pat-text)' }}>
                                                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500" />
                                                    {m}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>None currently prescribed.</p>
                                    )}
                                </SectionCard>
                            </div>

                            <SectionCard title="Hospital Admissions & Surgeries" icon={History}>
                                {(child.medicalHistory.previousAdmissions.length > 0 || child.medicalHistory.surgeries.length > 0) ? (
                                    <div className="space-y-3">
                                        {child.medicalHistory.previousAdmissions.map(a => (
                                            <div key={a} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                                                <Calendar size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--pat-primary)' }} />
                                                <span className="text-sm" style={{ color: 'var(--pat-text)' }}>{a}</span>
                                            </div>
                                        ))}
                                        {child.medicalHistory.surgeries.map(s => (
                                            <div key={s} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                                                <Stethoscope size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--pat-primary)' }} />
                                                <span className="text-sm" style={{ color: 'var(--pat-text)' }}>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>No previous admissions or surgeries on record.</p>
                                )}
                            </SectionCard>
                        </div>
                    )}

                    {/* ── TAB 2: Vaccination Tracker (Section 3) ── */}
                    {activeTab === 'vaccines' && (
                        <div className="animate-fade-in">
                            <SectionCard title="Vaccination Record" icon={Syringe}>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex gap-3 text-xs font-semibold">
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                            <CheckCircle2 size={11} />
                                            Completed: {child.vaccinations.filter(v => v.status === 'Completed').length}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                                            <AlertCircle size={11} />
                                            Due: {child.vaccinations.filter(v => v.status === 'Pending').length}
                                        </span>
                                    </div>
                                    <button
                                        className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
                                        style={{ background: 'var(--pat-primary)' }}
                                    >
                                        + Log Dose
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--pat-border)' }}>
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr style={{ background: 'var(--pat-bg)', color: 'var(--pat-muted)' }}>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Vaccine</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Dose</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Date Given</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Next Due</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Facility</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--pat-border)' }}>
                                            {child.vaccinations.map(v => (
                                                <tr key={v.id} className="transition-colors hover:bg-gray-50/60">
                                                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--pat-text)' }}>{v.vaccineName}</td>
                                                    <td className="px-4 py-3.5" style={{ color: 'var(--pat-muted)' }}>Dose {v.doseNumber}</td>
                                                    <td className="px-4 py-3.5" style={{ color: 'var(--pat-muted)' }}>
                                                        {v.dateGiven ? new Date(v.dateGiven).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-medium" style={{ color: v.status === 'Pending' ? '#d97706' : 'var(--pat-muted)' }}>
                                                        {v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--pat-muted)' }}>{v.facility || '—'}</td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        {v.status === 'Completed' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                                <CheckCircle2 size={11} /> Done
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                                                                <AlertCircle size={11} /> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ── TAB 3: Growth Monitoring Chart (Section 4) ── */}
                    {activeTab === 'growth' && (
                        <div className="animate-fade-in">
                            <SectionCard title="Growth Monitoring Chart" icon={Scale}>
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>
                                        Anthropometric records with WHO percentile benchmarks.
                                    </p>
                                    <button
                                        className="px-4 py-2 rounded-lg text-xs font-bold border transition-colors hover:bg-gray-50"
                                        style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-primary)' }}
                                    >
                                        + Add Checkup
                                    </button>
                                </div>

                                {/* Summary Stats */}
                                {child.growth.length > 0 && (() => {
                                    const latest = child.growth[child.growth.length - 1];
                                    return (
                                        <div className="grid grid-cols-3 gap-3 mb-5">
                                            {[
                                                { label: 'Current Weight', value: `${latest.weightKg} kg`, color: 'var(--pat-primary)' },
                                                { label: 'Current Height', value: `${latest.heightCm} cm`, color: '#059669' },
                                                { label: 'Head Circ.', value: latest.headCircumferenceCm ? `${latest.headCircumferenceCm} cm` : '—', color: '#7c3aed' },
                                            ].map(stat => (
                                                <div key={stat.label} className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                                                    <div className="text-xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
                                                    <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}

                                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--pat-border)' }}>
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr style={{ background: 'var(--pat-bg)', color: 'var(--pat-muted)' }}>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Age</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Weight</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Height</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Head Circ.</th>
                                                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Doctor's Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--pat-border)' }}>
                                            {[...child.growth].reverse().map(g => (
                                                <tr key={g.id} className="transition-colors hover:bg-gray-50/60">
                                                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--pat-text)' }}>
                                                        {g.ageMonths < 12 ? `${g.ageMonths} mo` : `${Math.floor(g.ageMonths / 12)} yr${g.ageMonths > 12 ? ` ${g.ageMonths % 12}mo` : ''}`}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--pat-primary)' }}>{g.weightKg} kg</td>
                                                    <td className="px-4 py-3.5 font-semibold text-emerald-600">{g.heightCm} cm</td>
                                                    <td className="px-4 py-3.5" style={{ color: 'var(--pat-muted)' }}>
                                                        {g.headCircumferenceCm ? `${g.headCircumferenceCm} cm` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs max-w-[200px]" style={{ color: 'var(--pat-muted)' }}>
                                                        <span title={g.doctorNotes}>{g.doctorNotes || '—'}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ── TAB 4: Emergency Profile & Access (Sections 6 & 7) ── */}
                    {activeTab === 'emergency' && (
                        <div className="space-y-5 animate-fade-in">

                            {/* Critical Alerts Banner */}
                            {child.emergencyProfile.criticalAlerts.length > 0 && (
                                <div className="rounded-2xl border-2 p-5" style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.04)' }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle size={18} className="text-red-600" />
                                        <h3 className="font-bold text-red-700 uppercase tracking-wider text-xs">Critical Medical Alerts</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {child.emergencyProfile.criticalAlerts.map(a => (
                                            <div key={a} className="flex items-start gap-2 text-sm font-semibold text-red-800">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                                {a}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* QR Code Panel */}
                                <SectionCard title="Emergency QR Code" icon={QrCode}>
                                    <div className="flex flex-col items-center text-center">
                                        <p className="text-xs mb-5" style={{ color: 'var(--pat-muted)' }}>
                                            Show to paramedics or ER staff for read-only time-limited access to critical info.
                                        </p>
                                        {/* QR Code visual representation */}
                                        <div className="p-3 bg-white rounded-2xl border-2 shadow-sm mb-4" style={{ borderColor: 'var(--pat-border)' }}>
                                            <div
                                                className="w-44 h-44 rounded-xl flex items-center justify-center"
                                                style={{
                                                    backgroundImage: 'radial-gradient(circle, #041E42 2px, transparent 2.5px)',
                                                    backgroundSize: '11px 11px',
                                                    backgroundColor: '#f8fafc'
                                                }}
                                            >
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center border-2" style={{ borderColor: 'rgba(4,30,66,0.1)' }}>
                                                    <HeartPulse size={22} style={{ color: '#dc2626' }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono" style={{ color: 'var(--pat-muted)' }}>
                                            Token: {child.emergencyProfile.qrCodeToken}
                                        </div>
                                        <button
                                            className="mt-4 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                                            style={{ background: 'var(--pat-primary)' }}
                                        >
                                            Download QR Card
                                        </button>
                                    </div>
                                </SectionCard>

                                {/* Emergency Contact */}
                                <SectionCard title="Emergency Contact" icon={Phone}>
                                    <div className="space-y-0 mb-5">
                                        <InfoRow label="Name" value={child.emergencyProfile.contactName} />
                                        <InfoRow label="Relationship" value={child.emergencyProfile.contactRelationship} />
                                        <InfoRow label="Phone" value={child.emergencyProfile.contactPhone} />
                                    </div>
                                    <a
                                        href={`tel:${child.emergencyProfile.contactPhone}`}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                                        style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                                    >
                                        <Phone size={14} /> Call Emergency Contact
                                    </a>
                                </SectionCard>
                            </div>

                            {/* Security & Access Log */}
                            <SectionCard title="System Access & Security" icon={Lock}>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Two-Factor Auth', value: 'Enabled', color: '#059669', icon: Shield },
                                        { label: 'Data Encryption', value: 'AES-256', color: '#059669', icon: Lock },
                                        { label: 'Access Control', value: 'Role-Based', color: 'var(--pat-primary)', icon: UserCircle2 },
                                    ].map(item => (
                                        <div key={item.label} className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                                            <item.icon size={18} className="mx-auto mb-2" style={{ color: item.color }} />
                                            <div className="text-sm font-bold mb-0.5" style={{ color: item.color }}>{item.value}</div>
                                            <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs mt-4 text-center" style={{ color: 'var(--pat-muted)' }}>
                                    Last updated: {new Date(child.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </SectionCard>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
