import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Plus, Link } from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'post_mortem';

interface Incident {
    id: string; ref: string; title: string; severity: Severity; status: IncidentStatus;
    systems: string[]; description: string; createdAt: string; resolvedAt?: string;
    timeline: { at: string; note: string }[];
}

const MOCK_INCIDENTS: Incident[] = [
    {
        id: 'inc001', ref: 'INC-001', title: 'WelliChain sync failure — Lab results queue blocked',
        severity: 'high', status: 'resolved',
        systems: ['Sync Service', 'Lab Results Pipeline'],
        description: 'Sync job for CityLab partition failed causing a backlog of 840 unsynced lab result payloads.',
        createdAt: '2026-03-03T01:44:00Z', resolvedAt: '2026-03-03T07:30:00Z',
        timeline: [
            { at: '01:44', note: 'Alert triggered: sync queue depth exceeded 500' },
            { at: '03:00', note: 'On-call engineer notified, investigation started' },
            { at: '05:15', note: 'Root cause identified: partition key collision in FIFO queue' },
            { at: '07:30', note: 'Fix deployed, backlog cleared. Incident resolved.' },
        ],
    },
    {
        id: 'inc002', ref: 'INC-002', title: 'Suspicious bulk export — CityLab lab_tech_004',
        severity: 'medium', status: 'investigating',
        systems: ['Audit System', 'Export API'],
        description: 'User exported 234 records in under 3 minutes. Pattern is 8× above baseline. Possible unauthorised data extraction.',
        createdAt: '2026-03-03T10:15:00Z',
        timeline: [
            { at: '10:15', note: 'Security alert raised by anomaly detection system' },
            { at: '11:00', note: 'Account temporarily suspended pending investigation' },
            { at: '12:30', note: 'Support agent reviewing consent logs and audit trail' },
        ],
    },
];

const SEV_STYLE: Record<Severity, { color: string; bg: string }> = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    high: { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    low: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

const ST_STYLE: Record<IncidentStatus, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: AlertTriangle },
    investigating: { color: '#38bdf8', label: 'Investigating', icon: Clock },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    post_mortem: { color: '#a78bfa', label: 'Post-mortem', icon: Link },
};

export function IncidentLogPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Incident Log</h1>
                    <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Create, track, and resolve platform incidents. Link to security alerts.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <Plus size={14} /> New Incident
                </button>
            </div>

            {showForm && (
                <div className="rounded-2xl p-5 space-y-3" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div className="text-sm font-bold" style={{ color: '#e5e7eb' }}>Create Incident</div>
                    <input placeholder="Incident title" className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    <div className="flex gap-3">
                        <select className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                            {(['critical', 'high', 'medium', 'low'] as Severity[]).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <input placeholder="Affected systems (comma-separated)" className="flex-1 px-3 py-2 rounded-xl text-sm"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    </div>
                    <textarea placeholder="Description of the incident…" rows={3} className="w-full resize-none px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Create Incident</button>
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {MOCK_INCIDENTS.map(inc => {
                    const sev = SEV_STYLE[inc.severity];
                    const st = ST_STYLE[inc.status];
                    const StIcon = st.icon;
                    return (
                        <div key={inc.id} className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: `1px solid ${sev.color}25` }}>
                            <div className="px-5 py-4 flex items-start gap-3 flex-wrap border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-xs font-mono" style={{ color: '#4b5563' }}>{inc.ref}</span>
                                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full capitalize" style={{ background: sev.bg, color: sev.color }}>{inc.severity}</span>
                                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${st.color}18`, color: st.color }}><StIcon size={9} /> {st.label}</span>
                                    </div>
                                    <div className="font-bold text-sm" style={{ color: '#e5e7eb' }}>{inc.title}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                        Affected: {inc.systems.join(', ')} · {new Date(inc.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        {inc.resolvedAt && ` → Resolved ${new Date(inc.resolvedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`}
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-3 grid md:grid-cols-2 gap-4">
                                <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{inc.description}</p>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#4b5563' }}>Timeline</div>
                                    <div className="space-y-1.5">
                                        {inc.timeline.map((t, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs">
                                                <span className="font-mono flex-shrink-0 mt-0.5" style={{ color: sev.color }}>{t.at}</span>
                                                <span style={{ color: '#6b7280' }}>{t.note}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
