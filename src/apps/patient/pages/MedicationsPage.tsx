import React, { useState } from 'react';
import { Pill, RefreshCw, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';

interface Medication {
    id: string; name: string; dose: string; frequency: string;
    prescribedBy: string; facility: string; startDate: string;
    endDate?: string; refillsLeft: number; status: 'active' | 'completed' | 'paused';
    interaction?: string;
}

const MOCK_MEDS: Medication[] = [
    { id: 'med001', name: 'Amlodipine', dose: '5mg', frequency: 'Once daily — morning', prescribedBy: 'Dr. Fatima Aliyu', facility: 'Lagos General', startDate: '2026-01-15', refillsLeft: 2, status: 'active' },
    { id: 'med002', name: 'Metformin', dose: '500mg', frequency: 'Twice daily with meals', prescribedBy: 'Dr. Emeka Okonkwo', facility: 'Reddington', startDate: '2025-11-01', refillsLeft: 0, status: 'active', interaction: 'Check with doctor before combining with new supplements.' },
    { id: 'med003', name: 'Vitamin D3', dose: '1000IU', frequency: 'Once daily', prescribedBy: 'Dr. Fatima Aliyu', facility: 'Lagos General', startDate: '2026-02-01', refillsLeft: 5, status: 'active' },
    { id: 'med004', name: 'Amoxicillin', dose: '500mg', frequency: 'Three times daily', prescribedBy: 'Dr. Bashir Umar', facility: 'ABUTH', startDate: '2025-10-01', endDate: '2025-10-07', refillsLeft: 0, status: 'completed' },
];

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
    active: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Active' },
    completed: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Completed' },
    paused: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Paused' },
};

export function MedicationsPage() {
    const [tab, setTab] = useState<'active' | 'history'>('active');
    const active = MOCK_MEDS.filter(m => m.status === 'active');
    const history = MOCK_MEDS.filter(m => m.status !== 'active');

    return (
        <div className="animate-fade-in max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>My Medications</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Active prescriptions, refills, and medication history.</p>
            </div>

            {/* Drug interaction warning */}
            {MOCK_MEDS.some(m => m.interaction) && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                    <div style={{ color: '#78350f' }}>
                        <strong>Interaction notice:</strong> {MOCK_MEDS.find(m => m.interaction)?.interaction}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                {[{ key: 'active', label: `Active (${active.length})` }, { key: 'history', label: 'History' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                        style={{ background: tab === t.key ? '#0d9488' : 'transparent', color: tab === t.key ? '#fff' : '#64748b' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {(tab === 'active' ? active : history).map(med => {
                    const st = STATUS_CFG[med.status];
                    return (
                        <div key={med.id} className="rounded-2xl p-5 border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(13,148,136,0.08)' }}>
                                        <Pill size={16} style={{ color: '#0d9488' }} />
                                    </div>
                                    <div>
                                        <div className="font-black text-base" style={{ color: '#1e293b' }}>{med.name}</div>
                                        <div className="text-sm" style={{ color: '#475569' }}>{med.dose} · {med.frequency}</div>
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: st.bg, color: st.color }}>{st.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div><span style={{ color: '#94a3b8' }}>Prescribed by: </span><span style={{ color: '#475569' }}>{med.prescribedBy}</span></div>
                                <div><span style={{ color: '#94a3b8' }}>Facility: </span><span style={{ color: '#475569' }}>{med.facility}</span></div>
                                <div><span style={{ color: '#94a3b8' }}>Started: </span><span style={{ color: '#475569' }}>{new Date(med.startDate).toLocaleDateString('en-NG')}</span></div>
                                {med.endDate && <div><span style={{ color: '#94a3b8' }}>Ended: </span><span style={{ color: '#475569' }}>{new Date(med.endDate).toLocaleDateString('en-NG')}</span></div>}
                            </div>
                            {med.status === 'active' && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs" style={{ color: med.refillsLeft === 0 ? '#ef4444' : '#64748b' }}>
                                        <RefreshCw size={11} />
                                        {med.refillsLeft === 0 ? 'No refills remaining' : `${med.refillsLeft} refill${med.refillsLeft !== 1 ? 's' : ''} remaining`}
                                    </div>
                                    <button className="text-xs font-bold px-3 py-1.5 rounded-xl"
                                        style={{ background: med.refillsLeft === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(13,148,136,0.1)', color: med.refillsLeft === 0 ? '#ef4444' : '#0d9488' }}>
                                        {med.refillsLeft === 0 ? 'Request Refill' : 'Request Refill'}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
