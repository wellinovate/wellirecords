import React from 'react';
import { Database, Clock, Archive, Trash2, CheckCircle } from 'lucide-react';

const POLICIES = [
    { category: 'Clinical Records (EHR)', retentionDays: 3650, archivalAfter: 1825, deletionPolicy: 'Manual review required', lastChanged: '2025-01-01', changedBy: 'data_governance@wellirecord.com' },
    { category: 'Consent Logs', retentionDays: 2190, archivalAfter: 1095, deletionPolicy: 'Auto-archive after 3 years', lastChanged: '2025-01-01', changedBy: 'data_governance@wellirecord.com' },
    { category: 'Audit Events', retentionDays: 2555, archivalAfter: 1825, deletionPolicy: 'Auto-archive, never delete', lastChanged: '2025-06-15', changedBy: 'security_admin@wellirecord.com' },
    { category: 'Impersonation Logs', retentionDays: 2555, archivalAfter: 730, deletionPolicy: 'Auto-archive, never delete', lastChanged: '2025-06-15', changedBy: 'security_admin@wellirecord.com' },
    { category: 'Session Data', retentionDays: 90, archivalAfter: 30, deletionPolicy: 'Auto-delete after 90 days', lastChanged: '2025-01-01', changedBy: 'data_governance@wellirecord.com' },
    { category: 'Notification Delivery Logs', retentionDays: 365, archivalAfter: 180, deletionPolicy: 'Auto-delete after 1 year', lastChanged: '2025-03-01', changedBy: 'finance_admin@wellirecord.com' },
];

export function DataRetentionPage() {
    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Data Retention Policies</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Retention periods and archival rules per data category. Changes require data_governance approval.</p>
            </div>

            <div className="grid gap-4">
                {POLICIES.map(p => (
                    <div key={p.category} className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(56,189,248,0.1)' }}>
                                    <Database size={14} style={{ color: '#38bdf8' }} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm" style={{ color: '#e5e7eb' }}>{p.category}</div>
                                    <div className="text-[11px] mt-0.5" style={{ color: '#4b5563' }}>Last changed: {p.lastChanged} by {p.changedBy}</div>
                                </div>
                            </div>
                            <button className="text-xs font-bold px-3 py-1.5 rounded-lg"
                                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                                Edit Policy
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex items-center gap-1 mb-1" style={{ color: '#4b5563' }}><Clock size={11} /> Retention</div>
                                <div className="font-black" style={{ color: '#38bdf8' }}>{p.retentionDays} days</div>
                                <div style={{ color: '#4b5563' }}>({Math.round(p.retentionDays / 365)} years)</div>
                            </div>
                            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex items-center gap-1 mb-1" style={{ color: '#4b5563' }}><Archive size={11} /> Archival after</div>
                                <div className="font-black" style={{ color: '#f59e0b' }}>{p.archivalAfter} days</div>
                                <div style={{ color: '#4b5563' }}>({Math.round(p.archivalAfter / 365 * 10) / 10}y)</div>
                            </div>
                            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex items-center gap-1 mb-1" style={{ color: '#4b5563' }}><Trash2 size={11} /> Deletion rule</div>
                                <div className="font-semibold leading-snug" style={{ color: '#9ca3af' }}>{p.deletionPolicy}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
