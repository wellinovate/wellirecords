import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Plus, Link } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { useAuth } from '@/shared/auth/AuthProvider';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'post_mortem';

interface Incident {
    id: string; ref: string; title: string; severity: Severity; status: IncidentStatus;
    systems: string[]; description: string; createdAt: string; resolvedAt?: string;
    timeline: { at: string; note: string }[];
}

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
    const { user } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>(() => adminApi.getIncidents());
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState<Severity>('medium');
    const [systems, setSystems] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;
        const adminName = user?.fullName ?? user?.name ?? 'Super Admin';
        const systemsArr = systems.split(',').map(s => s.trim()).filter(Boolean);
        adminApi.createIncident(title, severity, systemsArr, description, adminName);
        
        // Reset states
        setTitle('');
        setSeverity('medium');
        setSystems('');
        setDescription('');
        setShowForm(false);

        // Reload data
        setIncidents(adminApi.getIncidents());
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Incident Log</h1>
                    <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Create, track, and resolve platform incidents. Link to security alerts.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <Plus size={14} /> New Incident
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="rounded-2xl p-5 space-y-3" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div className="text-sm font-bold" style={{ color: '#e5e7eb' }}>Create Incident</div>
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Incident title" className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    <div className="flex gap-3">
                        <select value={severity} onChange={e => setSeverity(e.target.value as Severity)} className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                            {(['critical', 'high', 'medium', 'low'] as Severity[]).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <input required value={systems} onChange={e => setSystems(e.target.value)} placeholder="Affected systems (comma-separated)" className="flex-1 px-3 py-2 rounded-xl text-sm"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    </div>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Description of the incident…" rows={3} className="w-full resize-none px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }} />
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Create Incident</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {incidents.map(inc => {
                    const sev = SEV_STYLE[inc.severity] || SEV_STYLE.low;
                    const st = ST_STYLE[inc.status] || ST_STYLE.open;
                    const StIcon = st.icon;
                    return (
                        <div key={inc.id} className="rounded-2xl overflow-hidden animate-fade-in" style={{ background: '#111827', border: `1px solid ${sev.color}25` }}>
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
