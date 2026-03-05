import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { consentApi } from '@/shared/api/consentApi';
import { vaultApi } from '@/shared/api/vaultApi';
import { FileText, FlaskConical, Pill, ScanLine, Syringe, Stethoscope, Lock, ArrowLeft, Plus, Eye, ShieldCheck, Activity } from 'lucide-react';
import { HealthRecord } from '@/shared/types/types';
import { ConsentScopeBanner } from '@/apps/patient/components/AccessTierBanner';

const TABS = ['Timeline', 'Journeys', 'Labs', 'Prescriptions', 'Imaging', 'Notes'];

const MOCK_PATIENTS: Record<string, { name: string; dob: string; bloodType: string; allergies: string[] }> = {
    pat_001: { name: 'Amara Okafor', dob: '1990-03-15', bloodType: 'B+', allergies: ['Penicillin'] },
    pat_002: { name: 'Emeka Nwosu', dob: '1985-07-22', bloodType: 'O+', allergies: ['Shellfish'] },
};

const TYPE_MAP: Record<string, string> = { Labs: 'Lab Result', Prescriptions: 'Prescription', Imaging: 'Imaging', Notes: 'Clinical Note' };

export function EHRViewerPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('Timeline');

    const grants = consentApi.getGrants(id ?? '').filter(g => g.orgId === user?.orgId && g.status === 'active');
    const grant = grants[0];
    const records = grant ? vaultApi.getRecords(id ?? '') : [];
    const journeys = grant ? vaultApi.getJourneys(id ?? '') : [];
    const patient = MOCK_PATIENTS[id ?? ''];

    const filtered = tab === 'Timeline' ? records : records.filter(r => r.type === TYPE_MAP[tab]);
    const hasAccess = (tabName: string) => {
        if (!grant) return false;
        if (grant.scope === 'full') return true;
        const scopeMap: Record<string, string> = { Labs: 'labs', Prescriptions: 'medications', Imaging: 'imaging', Notes: 'clinical_notes' };
        return grant.scope === scopeMap[tabName];
    };

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate('/provider/patients')} className="flex items-center gap-2 mb-6 text-sm" style={{ color: '#7ba3c8' }}>
                <ArrowLeft size={16} /> Back to patients
            </button>

            {/* Patient header */}
            <div className="card-provider p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl"
                            style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>{patient?.name.charAt(0)}</div>
                        <div>
                            <h1 className="font-display font-bold text-xl" style={{ color: '#e2eaf4' }}>{patient?.name ?? `Patient ${id}`}</h1>
                            <div className="text-sm" style={{ color: '#7ba3c8' }}>
                                DOB: {patient?.dob} · Blood Type: <strong style={{ color: '#ef4444' }}>{patient?.bloodType}</strong>
                            </div>
                            {patient?.allergies && <div className="mt-1 text-xs" style={{ color: '#f59e0b' }}>⚠️ Allergies: {patient.allergies.join(', ')}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => navigate('/provider/encounters/new')}
                            className="btn btn-provider btn-sm gap-1"
                            disabled={!grant || !['full', 'encounters', 'clinical_notes'].includes(grant.scope)}
                            title={!grant || !['full', 'encounters', 'clinical_notes'].includes(grant.scope) ? "Insufficient consent scope to write encounters" : ""}
                        >
                            <Plus size={13} /> New Encounter
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Consent Scope Banner ── */}
            {grant ? (
                <ConsentScopeBanner
                    scope={grant.scope}
                    patientName={patient?.name ?? `Patient ${id}`}
                    grantedBy={grant.providerName}
                    expiresAt={grant.expiresAt}
                    purpose={grant.purpose}
                    onRequestMoreAccess={() => { }}
                />
            ) : (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl mb-6"
                    style={{ background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.15)' }}>
                    <Lock size={16} style={{ color: '#dc2626' }} />
                    <span className="text-sm font-semibold" style={{ color: '#dc2626' }}>No active consent — patient has not granted access to their records.</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
                        style={{ background: 'rgba(56,189,248,.05)', border: '1px solid var(--prov-border)' }}>
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                style={{ background: tab === t ? '#38bdf8' : 'transparent', color: tab === t ? '#050d1a' : '#7ba3c8' }}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {!grant ? (
                        <div className="card-provider p-12 text-center">
                            <Lock size={36} className="mx-auto mb-3" style={{ color: '#1e3a5f' }} />
                            <p className="font-semibold" style={{ color: '#7ba3c8' }}>No active consent from this patient</p>
                            <p className="text-sm mt-1" style={{ color: '#3e5a78' }}>Request access to view their health records</p>
                            <button className="btn btn-provider mt-4 gap-2"><Eye size={16} /> Request Access</button>
                        </div>
                    ) : tab !== 'Timeline' && !hasAccess(tab) ? (
                        <div className="card-provider p-10 text-center">
                            <Lock size={28} className="mx-auto mb-2" style={{ color: '#1e3a5f' }} />
                            <p className="font-semibold" style={{ color: '#7ba3c8' }}>Access not granted for {tab}</p>
                            <p className="text-xs mt-1 mb-4" style={{ color: '#3e5a78' }}>Patient has granted {grant.scope} access only</p>
                            <button className="btn btn-provider-outline btn-sm">Request Extended Access</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.length === 0 ? (
                                <div className="card-provider p-8 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No records in this category</p></div>
                            ) : tab === 'Timeline' ? (
                                <div className="relative">
                                    <div className="absolute left-5 top-0 bottom-0 w-0.5"
                                        style={{ background: 'var(--prov-border)' }} />
                                    <div className="space-y-4 pl-14">
                                        {(() => {
                                            const groupedRecords: Record<string, typeof filtered> = {};
                                            filtered.forEach(rec => {
                                                const date = new Date(rec.date);
                                                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                                if (!groupedRecords[monthYear]) {
                                                    groupedRecords[monthYear] = [];
                                                }
                                                groupedRecords[monthYear].push(rec);
                                            });

                                            let globalIndex = 0;

                                            return Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
                                                <div key={monthYear} className="mb-10 last:mb-0 relative">
                                                    <div className="absolute -left-12 top-0 mt-2 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap z-10 shadow-sm border"
                                                        style={{ background: 'var(--prov-surface)', color: '#38bdf8', borderColor: 'var(--prov-border)' }}>
                                                        {monthYear}
                                                    </div>

                                                    <div className="space-y-4 mt-10">
                                                        {monthRecords.map((rec) => {
                                                            const i = globalIndex++;
                                                            return (
                                                                <div key={rec.id} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                                                                    <div className="absolute -left-9 top-4 w-4 h-4 rounded-full border-2 shadow z-10"
                                                                        style={{ background: '#38bdf8', borderColor: 'var(--prov-bg)' }} />
                                                                    <div className="card-provider p-5 flex items-start gap-4">
                                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(56,189,248,.1)' }}>
                                                                            <FileText size={18} style={{ color: '#38bdf8' }} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div>
                                                                                    <div className="font-bold" style={{ color: '#e2eaf4' }}>{rec.title}</div>
                                                                                    <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                                                                                        {rec.provider} · {new Date(rec.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col items-end gap-1">
                                                                                    <span className="badge badge-active">{rec.status}</span>
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>
                                                                                        {rec.type}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#7ba3c8' }}>{rec.summary}</p>
                                                                            {rec.journeyId && (() => {
                                                                                const journey = journeys.find(j => j.id === rec.journeyId);
                                                                                if (!journey) return null;
                                                                                return (
                                                                                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold px-2 py-1.5 rounded inline-flex shadow-sm cursor-pointer"
                                                                                        style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                                                                                        <Activity size={12} /> {journey.title}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            ) : tab === 'Journeys' ? (
                                <div className="space-y-4">
                                    {journeys.length === 0 ? (
                                        <div className="card-provider p-8 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No active care journeys</p></div>
                                    ) : (
                                        journeys.map(j => (
                                            <div key={j.id} className="card-provider p-6 mb-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>
                                                            <Activity size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>{j.title}</h3>
                                                            <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                                                                Started {new Date(j.startDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="badge badge-active" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981' }}>{j.status}</span>
                                                </div>
                                                <p className="text-sm text-[#7ba3c8] mb-4">{j.description}</p>
                                                <div className="pt-4 border-t border-white/5">
                                                    <button className="text-xs font-bold text-[#38bdf8] flex items-center gap-1 hover:underline">
                                                        <Plus size={12} /> Assign new record to {j.title}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                filtered.map(rec => (
                                    <div key={rec.id} className="card-provider p-5 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(56,189,248,.1)' }}>
                                            <FileText size={18} style={{ color: '#38bdf8' }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold" style={{ color: '#e2eaf4' }}>{rec.title}</div>
                                            <div className="text-xs" style={{ color: '#7ba3c8' }}>{rec.provider} · {new Date(rec.date).toLocaleDateString()}</div>
                                            <p className="text-sm mt-2" style={{ color: '#7ba3c8' }}>{rec.summary}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="badge badge-active">{rec.status}</span>
                                            {rec.status === 'Verified' && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                    style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                                                    <ShieldCheck size={10} /> WelliChain Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* AI Insights Sidebar */}
                {grant && (
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                        <div className="card-provider p-5">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                                <Activity size={18} style={{ color: '#a855f7' }} />
                                <h2 className="font-bold text-sm" style={{ color: '#e2eaf4' }}>AI Clinical Insights</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
                                    <div className="text-xs font-bold mb-1" style={{ color: '#ef4444' }}>High Risk: Hypertension</div>
                                    <div className="text-[10px] leading-relaxed" style={{ color: '#fca5a5' }}>BP consistently &gt; 140/90. Last recorded 145/92. Current regimen may be insufficient.</div>
                                </div>
                                <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.2)' }}>
                                    <div className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>Monitor: Pre-Diabetes</div>
                                    <div className="text-[10px] leading-relaxed" style={{ color: '#fcd34d' }}>HbA1c trending upwards (6.1%). Consider lifestyle intervention early.</div>
                                </div>
                                <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.2)' }}>
                                    <div className="text-xs font-bold mb-1" style={{ color: '#10b981' }}>Treatment Suggestion</div>
                                    <div className="text-[10px] leading-relaxed" style={{ color: '#6ee7b7' }}>Patient responds well to Lisinopril. No adverse reactions detected in WelliFile context.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
