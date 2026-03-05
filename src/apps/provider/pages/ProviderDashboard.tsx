import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { consentApi } from '@/shared/api/consentApi';
import { vaultApi } from '@/shared/api/vaultApi';
import { orgApi } from '@/shared/api/orgApi';
import {
    Users, FlaskConical, FileEdit, Activity, ArrowRight, TrendingUp,
    Pill, GitBranch, ClipboardList, Lock, CheckCircle2, Shield,
    Clock, AlertTriangle, Calendar, CheckCircle, UserCheck, Hourglass,
    Info,
} from 'lucide-react';
import { useRBAC } from '@/shared/rbac/useRBAC';
import { Feature, ROLE_METADATA } from '@/shared/rbac/permissions';

// ─── Patient name lookup (avoids "Patient #001" placeholder names) ────────────
const PATIENT_NAMES: Record<string, { name: string; age: number; condition: string }> = {
    'pat_001': { name: 'Amara Obi', age: 34, condition: 'Hypertension + Diabetes' },
    'pat_1': { name: 'Jane Smith', age: 41, condition: 'Post-operative review' },
    'pat_002': { name: 'Emeka Nwosu', age: 52, condition: 'Cardiac Monitoring' },
    'pat_003': { name: 'Ngozi Adeleke', age: 27, condition: 'Antenatal Care' },
};

function getPatient(patientId: string) {
    return PATIENT_NAMES[patientId] ?? {
        name: `Patient ${patientId.replace('pat_', '#')}`,
        age: 0,
        condition: 'General consultation',
    };
}

// ─── High Risk tooltip explanation ───────────────────────────────────────────
const HIGH_RISK_REASONS: Record<string, string[]> = {
    'pat_001': ['Uncontrolled hypertension (BP > 160/100)', 'Missed Lisinopril × 4 days', 'HbA1c above target (8.2%)'],
};

// ─── Mock Today's Schedule ────────────────────────────────────────────────────
const TODAYS_SCHEDULE = [
    { time: '09:00', patientId: 'pat_003', type: 'Antenatal', consentStatus: 'active', done: true },
    { time: '10:30', patientId: 'pat_001', type: 'Hypertension Review', consentStatus: 'active', done: true },
    { time: '12:00', patientId: 'pat_002', type: 'Cardiac Follow-up', consentStatus: 'pending', done: false },
    { time: '14:00', patientId: 'pat_1', type: 'Post-op Check', consentStatus: 'active', done: false },
    { time: '15:30', patientId: 'pat_003', type: 'Growth Scan Review', consentStatus: 'active', done: false },
];

// ─── Role-aware stat definitions ──────────────────────────────────────────────
const ROLE_STATS: Record<string, Array<{
    label: string;
    getValue: (data: any) => number;
    icon: any;
    color: string;
    bg: string;
    feature: Feature;
    to: string;
}>> = {
    provider_admin: [
        { label: 'Consented Patients', getValue: (d) => d.grants.length, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,.1)', feature: 'view_patients', to: '/provider/patients' },
        { label: 'Pending Lab Orders', getValue: (d) => d.pendingLabs, icon: FlaskConical, color: '#a855f7', bg: 'rgba(168,85,247,.1)', feature: 'lab_orders', to: '/provider/orders/labs' },
        { label: "Today's Encounters", getValue: (d) => d.encounters.length, icon: FileEdit, color: '#10b981', bg: 'rgba(16,185,129,.1)', feature: 'new_encounter', to: '/provider/encounters/new' },
        { label: 'Active Prescriptions', getValue: (d) => d.activeRx, icon: Pill, color: '#f59e0b', bg: 'rgba(245,158,11,.1)', feature: 'prescriptions', to: '/provider/prescriptions' },
    ],
    clinician: [
        { label: 'My Patients Today', getValue: (d) => d.grants.length, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,.1)', feature: 'view_patients', to: '/provider/patients' },
        { label: "Today's Encounters", getValue: (d) => d.encounters.length, icon: FileEdit, color: '#10b981', bg: 'rgba(16,185,129,.1)', feature: 'new_encounter', to: '/provider/encounters/new' },
        { label: 'Lab Orders Waiting', getValue: (d) => d.pendingLabs, icon: FlaskConical, color: '#a855f7', bg: 'rgba(168,85,247,.1)', feature: 'lab_orders', to: '/provider/orders/labs' },
        { label: 'Active Referrals', getValue: (d) => 2, icon: GitBranch, color: '#06b6d4', bg: 'rgba(6,182,212,.1)', feature: 'referrals', to: '/provider/referrals' },
    ],
    lab_tech: [
        { label: 'Patients with Orders', getValue: (d) => d.grants.length, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,.1)', feature: 'view_patients', to: '/provider/patients' },
        { label: 'Pending Lab Orders', getValue: (d) => d.pendingLabs, icon: ClipboardList, color: '#f59e0b', bg: 'rgba(245,158,11,.1)', feature: 'lab_orders', to: '/provider/orders/labs' },
        { label: 'Completed Today', getValue: (d) => Math.max(0, d.encounters.length - d.pendingLabs), icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,.1)', feature: 'lab_orders', to: '/provider/orders/labs' },
        { label: 'Results Published', getValue: (d) => d.activeRx, icon: Activity, color: '#a855f7', bg: 'rgba(168,85,247,.1)', feature: 'write_back_vault', to: '/provider/patients' },
    ],
    pharmacist: [
        { label: 'Patients', getValue: (d) => d.grants.length, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,.1)', feature: 'view_patients', to: '/provider/patients' },
        { label: 'Active Prescriptions', getValue: (d) => d.activeRx, icon: Pill, color: '#f59e0b', bg: 'rgba(245,158,11,.1)', feature: 'prescriptions', to: '/provider/prescriptions' },
        { label: 'Pending Dispense', getValue: (d) => d.pendingLabs, icon: ClipboardList, color: '#a855f7', bg: 'rgba(168,85,247,.1)', feature: 'prescriptions', to: '/provider/prescriptions' },
        { label: 'Dispensed Today', getValue: (d) => 1, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,.1)', feature: 'write_back_vault', to: '/provider/prescriptions' },
    ],
    insurer: [
        { label: 'Enrolled Members', getValue: (d) => d.grants.length, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,.1)', feature: 'view_patients', to: '/provider/patients' },
        { label: 'Claims This Month', getValue: (d) => 14, icon: ClipboardList, color: '#f59e0b', bg: 'rgba(245,158,11,.1)', feature: 'view_claims', to: '/provider/patients' },
        { label: 'Approved Claims', getValue: (d) => 11, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,.1)', feature: 'view_claims', to: '/provider/patients' },
        { label: 'Pending Review', getValue: (d) => 3, icon: Activity, color: '#dc2626', bg: 'rgba(220,38,38,.1)', feature: 'view_claims', to: '/provider/patients' },
    ],
};
const DEFAULT_STATS = ROLE_STATS.provider_admin;
function getStatsForRole(role: string) { return ROLE_STATS[role] ?? DEFAULT_STATS; }

// ─── Feature permission row ───────────────────────────────────────────────────
function AccessRow({ permitted, label }: { permitted: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2 py-1">
            {permitted
                ? <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                : <Lock size={14} style={{ color: '#475569', flexShrink: 0 }} />
            }
            <span className="text-xs" style={{ color: permitted ? '#e2eaf4' : '#475569' }}>
                {label}
            </span>
        </div>
    );
}

// ─── High Risk Tooltip ────────────────────────────────────────────────────────
function HighRiskBadge({ patientId }: { patientId: string }) {
    const [show, setShow] = useState(false);
    const reasons = HIGH_RISK_REASONS[patientId];
    if (!reasons) return null;

    return (
        <div className="relative inline-flex items-center">
            <span
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-help"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                <AlertTriangle size={10} strokeWidth={2.5} />
                High Risk
                <Info size={9} className="opacity-60" />
            </span>
            {show && (
                <div
                    className="absolute bottom-full right-0 mb-2 w-60 rounded-xl p-3 text-left shadow-2xl z-50"
                    style={{ background: '#1e3a5f', border: '1px solid rgba(56,189,248,0.2)' }}
                >
                    <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#38bdf8' }}>
                        Risk Factors
                    </div>
                    <ul className="space-y-1.5">
                        {reasons.map(r => (
                            <li key={r} className="flex items-start gap-1.5 text-[11px]" style={{ color: '#e2eaf4' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1" />
                                {r}
                            </li>
                        ))}
                    </ul>
                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 rounded-sm"
                        style={{ background: '#1e3a5f', borderRight: '1px solid rgba(56,189,248,0.2)', borderBottom: '1px solid rgba(56,189,248,0.2)' }} />
                </div>
            )}
        </div>
    );
}

// ─── Today's Schedule ─────────────────────────────────────────────────────────
function TodaysSchedule({ onNavigate }: { onNavigate: (path: string) => void }) {
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return (
        <div className="card-provider p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                    <Calendar size={15} style={{ color: '#38bdf8' }} />
                    Today's Schedule
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                    {TODAYS_SCHEDULE.length} appointments
                </span>
            </div>

            <div className="relative pl-5 space-y-0">
                {/* Vertical timeline line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px"
                    style={{ background: 'rgba(56,189,248,0.15)' }} />

                {TODAYS_SCHEDULE.map((appt, i) => {
                    const patient = getPatient(appt.patientId);
                    const isPast = appt.done || appt.time < currentHHMM;
                    const isNext = !isPast && TODAYS_SCHEDULE.findIndex(a => !a.done && a.time >= currentHHMM) === i;
                    const consentActive = appt.consentStatus === 'active';

                    return (
                        <div
                            key={i}
                            onClick={() => consentActive && onNavigate(`/provider/patients/${appt.patientId}`)}
                            className="relative flex items-start gap-3 py-2.5 rounded-xl px-2 transition-colors"
                            style={{
                                cursor: consentActive ? 'pointer' : 'default',
                                background: isNext ? 'rgba(56,189,248,0.06)' : 'transparent',
                            }}
                        >
                            {/* Timeline dot */}
                            <div
                                className="absolute left-[-13px] top-[14px] w-2.5 h-2.5 rounded-full flex-shrink-0 border-2"
                                style={{
                                    background: isPast ? '#10b981' : isNext ? '#38bdf8' : '#1e3a5f',
                                    borderColor: isPast ? '#10b981' : isNext ? '#38bdf8' : 'rgba(56,189,248,0.3)',
                                    boxShadow: isNext ? '0 0 0 3px rgba(56,189,248,0.2)' : 'none',
                                }}
                            />

                            {/* Time */}
                            <div className="w-10 flex-shrink-0 text-[11px] font-bold pt-0.5"
                                style={{ color: isNext ? '#38bdf8' : isPast ? '#475569' : '#7ba3c8' }}>
                                {appt.time}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold truncate"
                                        style={{ color: isPast ? '#475569' : '#e2eaf4' }}>
                                        {patient.name}
                                    </span>
                                    {isNext && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse"
                                            style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                                            NEXT
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{appt.type}</div>
                            </div>

                            {/* Consent + done status */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {isPast ? (
                                    <CheckCircle size={13} style={{ color: '#10b981' }} />
                                ) : consentActive ? (
                                    <UserCheck size={13} style={{ color: '#38bdf8' }} />
                                ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                        <Hourglass size={9} className="inline mr-0.5" />
                                        Consent pending
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProviderDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { can, primaryRole, roleMetadata } = useRBAC();
    const org = user?.orgId ? orgApi.getById(user.orgId) : undefined;
    const grants = consentApi.getProviderGrants(user?.orgId ?? '');
    const labOrders = vaultApi.getLabOrders(user?.orgId ?? '');
    const prescriptions = vaultApi.getPrescriptions(user?.orgId ?? '');
    const encounters = vaultApi.getEncounters();

    const pendingLabs = labOrders.filter(l => l.status === 'pending').length;
    const activeRx = prescriptions.filter(p => p.status === 'active').length;

    // Consent queue counts
    const activeGrants = grants.filter(g => g.status === 'active');
    const pendingConsents = TODAYS_SCHEDULE.filter(a => a.consentStatus === 'pending').length;

    const statData = { grants, pendingLabs, encounters, activeRx };
    const STATS = getStatsForRole(primaryRole ?? 'clinician');
    const meta = primaryRole ? ROLE_METADATA[primaryRole] : null;

    return (
        <div className="animate-fade-in">
            {/* ── Header ── */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>
                        Welcome back, {user?.name?.split(' ').slice(-1)[0] ?? user?.name}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#7ba3c8' }}>
                        {org?.name} · {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                {meta && (
                    <div
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                        <span className="text-sm font-bold" style={{ color: '#e2eaf4' }}>{meta.label}</span>
                    </div>
                )}
            </div>

            {/* ── Stats — all same accent system (no arbitrary per-card colors) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STATS.map(s => (
                    <button
                        key={s.label}
                        onClick={() => can(s.feature) && navigate(s.to)}
                        disabled={!can(s.feature)}
                        className="card-provider p-5 stat-card text-left transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                                <s.icon size={20} style={{ color: s.color }} />
                            </div>
                            {can(s.feature)
                                ? <TrendingUp size={14} style={{ color: '#38bdf8', opacity: .5 }} />
                                : <Lock size={12} style={{ color: '#475569' }} />
                            }
                        </div>
                        <div className="text-3xl font-bold font-display" style={{ color: '#e2eaf4' }}>
                            {can(s.feature) ? s.getValue(statData) : '—'}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#7ba3c8' }}>{s.label}</div>
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Patient Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-provider p-6">
                        {/* Queue header with consent counter */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="font-bold" style={{ color: '#e2eaf4' }}>Consented Patient Queue</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold"
                                        style={{ color: '#10b981' }}>
                                        <CheckCircle size={11} />
                                        {activeGrants.length} access granted
                                    </span>
                                    {pendingConsents > 0 && (
                                        <span className="flex items-center gap-1.5 text-[11px] font-bold"
                                            style={{ color: '#f59e0b' }}>
                                            <Hourglass size={11} />
                                            {pendingConsents} pending consent
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => navigate('/provider/patients')}
                                className="text-xs font-semibold hover:underline" style={{ color: '#38bdf8' }}>
                                View all →
                            </button>
                        </div>

                        {grants.length === 0 ? (
                            <div className="text-center py-8">
                                <Users size={32} className="mx-auto mb-2" style={{ color: '#1e3a5f' }} />
                                <p className="text-sm" style={{ color: '#7ba3c8' }}>No consented patients yet</p>
                            </div>
                        ) : grants.map((g, i) => {
                            const patient = getPatient(g.patientId);
                            const isHighRisk = g.patientId === 'pat_001';
                            const initials = patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                            return (
                                <div key={g.grantId}
                                    className="flex items-center gap-4 p-3 rounded-xl mb-2 hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/provider/patients/${g.patientId}`)}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    {/* Avatar with initials */}
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                        style={{ background: 'rgba(56,189,248,.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.2)' }}>
                                        {initials}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm truncate" style={{ color: '#e2eaf4' }}>
                                                {patient.name}
                                            </span>
                                            <span className="text-[10px] font-medium" style={{ color: '#7ba3c8' }}>
                                                · {patient.age > 0 ? `${patient.age} yrs` : ''}
                                            </span>
                                        </div>
                                        <div className="text-xs truncate mt-0.5" style={{ color: '#7ba3c8' }}>
                                            {patient.condition} · {g.scope} access
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                                        <span className={`badge ${g.status === 'active' ? 'badge-active' : 'badge-expired'}`}>
                                            {g.status}
                                        </span>
                                        {/* High Risk badge with tooltip */}
                                        {isHighRisk && <HighRiskBadge patientId={g.patientId} />}
                                        {!isHighRisk && (
                                            <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#10b981' }}>
                                                <Activity size={10} /> Routine
                                            </div>
                                        )}
                                        {g.expiresAt && (
                                            <div className="text-[10px]" style={{ color: '#475569' }}>
                                                exp. {new Date(g.expiresAt).toLocaleDateString('en-NG')}
                                            </div>
                                        )}
                                    </div>
                                    <ArrowRight size={14} className="flex-shrink-0 ml-1" style={{ color: '#38bdf8', opacity: .4 }} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Today's Schedule */}
                    <TodaysSchedule onNavigate={navigate} />
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    {/* Your Access Level */}
                    <div className="card-provider p-5 border" style={{ borderColor: meta ? meta.color + '40' : 'var(--prov-border)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={16} style={{ color: meta?.color ?? '#38bdf8' }} />
                            <h2 className="font-bold text-sm" style={{ color: '#e2eaf4' }}>Your Access Level</h2>
                        </div>
                        {meta && (
                            <div className="px-3 py-2 rounded-lg mb-4 text-xs leading-relaxed"
                                style={{ background: meta.color + '18', color: '#b0c4de' }}>
                                {meta.description}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            <AccessRow permitted={can('view_patients')} label="View Patients" />
                            <AccessRow permitted={can('new_encounter')} label="Create Encounters" />
                            <AccessRow permitted={can('lab_orders')} label="Lab Orders" />
                            <AccessRow permitted={can('prescriptions')} label="Prescriptions" />
                            <AccessRow permitted={can('referrals')} label="Referrals" />
                            <AccessRow permitted={can('view_ehr_full')} label="Full EHR Access" />
                            <AccessRow permitted={can('write_back_vault')} label="Write-back to Vault" />
                            <AccessRow permitted={can('team_management')} label="Team Management" />
                            <AccessRow permitted={can('audit_logs')} label="Audit Logs" />
                            <AccessRow permitted={can('api_integrations')} label="API Integrations" />
                            <AccessRow permitted={can('public_health')} label="Public Health Data" />
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="card-provider p-5">
                        <h2 className="font-bold text-sm mb-4" style={{ color: '#e2eaf4' }}>Quick Actions</h2>
                        <div className="space-y-1.5">
                            {[
                                { label: 'New Encounter', to: '/provider/encounters/new', icon: FileEdit, feature: 'new_encounter' as Feature },
                                { label: 'Search Patients', to: '/provider/patients', icon: Users, feature: 'view_patients' as Feature },
                                { label: 'View Lab Orders', to: '/provider/orders/labs', icon: FlaskConical, feature: 'lab_orders' as Feature },
                                { label: 'Prescriptions', to: '/provider/prescriptions', icon: Pill, feature: 'prescriptions' as Feature },
                            ].map(a => {
                                const allowed = can(a.feature);
                                return (
                                    <button
                                        key={a.label}
                                        onClick={() => allowed && navigate(a.to)}
                                        disabled={!allowed}
                                        className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ color: '#7ba3c8' }}
                                    >
                                        <a.icon size={16} style={{ color: allowed ? '#38bdf8' : '#475569' }} />
                                        {a.label}
                                        {allowed
                                            ? <ArrowRight size={14} className="ml-auto" />
                                            : <Lock size={12} className="ml-auto" style={{ color: '#475569' }} />
                                        }
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
