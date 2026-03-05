import React from 'react';
import { Lock, Shield, AlertTriangle, Eye, CheckCircle, Clock } from 'lucide-react';

const BREAK_GLASS_EVENTS = [
    { id: 'bg_001', provider: 'Dr. Fatima Aliyu', org: 'Lagos General', patient: 'Unknown Patient (Emergency)', reason: 'Unconscious patient, no ID — emergency access required to check for known allergies', accessedAt: '2026-03-02T21:44:00Z', endedAt: '2026-03-02T21:52:00Z', reviewStatus: 'reviewed', reviewNote: 'Justified — patient brought in unconscious. Access appropriate.' },
    { id: 'bg_002', provider: 'Dr. Emeka Okonkwo', org: 'Reddington Hospital', patient: 'Amara Okafor', reason: 'Patient unable to consent — presented with severe chest pain, emergency cardiac protocol', accessedAt: '2026-03-01T14:10:00Z', endedAt: '2026-03-01T14:38:00Z', reviewStatus: 'pending', reviewNote: '' },
];

const PENDING_ACCESS = [
    { id: 'ar_001', provider: 'Dr. Bashir Umar', org: 'ABUTH Hospital', patient: 'Ibrahim Musa', scope: 'labs', requestedAt: '2026-03-03T09:00:00Z', purpose: 'consultation', status: 'pending' },
    { id: 'ar_002', provider: 'CityLab Staff', org: 'CityLab Diagnostics', patient: 'Ngozi Adewale', scope: 'imaging', requestedAt: '2026-03-03T11:22:00Z', purpose: 'claim', status: 'pending' },
];

const REVIEW_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    reviewed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Reviewed' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending Review' },
};

export function ConsentGovernancePage() {
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Consent Governance</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Emergency ("break-glass") access events and cross-platform pending access requests.</p>
            </div>

            {/* Break-glass */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(239,68,68,0.12)' }}>
                    <Lock size={15} style={{ color: '#ef4444' }} />
                    <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>Break-Glass (Emergency Access) Events</h2>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                        {BREAK_GLASS_EVENTS.filter(e => e.reviewStatus === 'pending').length} pending review
                    </span>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {BREAK_GLASS_EVENTS.map(e => {
                        const rs = REVIEW_STYLES[e.reviewStatus];
                        return (
                            <div key={e.id} className="px-5 py-4 space-y-2">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <div className="font-semibold text-sm" style={{ color: '#e5e7eb' }}>
                                            <span style={{ color: '#ef4444' }}>{e.provider}</span> · {e.org}
                                        </div>
                                        <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                            Patient: {e.patient} · {new Date(e.accessedAt).toLocaleString('en-NG')} – {new Date(e.endedAt).toLocaleTimeString('en-NG')}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                                        style={{ background: rs.bg, color: rs.color }}>
                                        {rs.label}
                                    </span>
                                </div>
                                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', color: '#9ca3af', borderLeft: '3px solid rgba(239,68,68,0.3)' }}>
                                    <span className="font-semibold" style={{ color: '#6b7280' }}>Justification:</span> {e.reason}
                                </div>
                                {e.reviewNote && (
                                    <div className="text-xs" style={{ color: '#10b981' }}>
                                        <CheckCircle size={11} className="inline mr-1" /> {e.reviewNote}
                                    </div>
                                )}
                                {e.reviewStatus === 'pending' && (
                                    <div className="flex gap-2 mt-1">
                                        <button className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Mark Reviewed — Justified</button>
                                        <button className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Flag — Escalate</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pending cross-platform access requests */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(245,158,11,0.08)' }}>
                    <Shield size={15} style={{ color: '#f59e0b' }} />
                    <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>Pending Provider Access Requests</h2>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {PENDING_ACCESS.map(r => (
                        <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(245,158,11,0.1)' }}>
                                <Eye size={14} style={{ color: '#f59e0b' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>
                                    {r.provider} ({r.org}) → Patient: {r.patient}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                    Scope: <span className="font-bold capitalize" style={{ color: '#f59e0b' }}>{r.scope}</span> · Purpose: {r.purpose} ·{' '}
                                    {new Date(r.requestedAt).toLocaleString('en-NG')}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={13} style={{ color: '#f59e0b' }} />
                                <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>Awaiting patient</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
