import React, { useState } from 'react';
import { Search, Download, Eye, Edit2, Trash2, Share2, LogIn, Lock, Shield } from 'lucide-react';

const ACTION_COLORS: Record<string, { color: string; icon: React.ElementType }> = {
    view: { color: '#38bdf8', icon: Eye },
    edit: { color: '#f59e0b', icon: Edit2 },
    delete: { color: '#ef4444', icon: Trash2 },
    export: { color: '#a78bfa', icon: Download },
    share: { color: '#10b981', icon: Share2 },
    login: { color: '#6b7280', icon: LogIn },
    consent: { color: '#0d9488', icon: Shield },
    break_glass: { color: '#ef4444', icon: Lock },
};

const MOCK_AUDIT_EVENTS = [
    { id: 'ae001', ts: '2026-03-03T14:02:00Z', actor: 'Dr. Fatima Aliyu', actorId: 'prov_001', patient: 'Emeka Nwosu', action: 'view', detail: 'Viewed EHR record', ip: '41.203.10.5', facility: 'Lagos General' },
    { id: 'ae002', ts: '2026-03-03T13:47:00Z', actor: 'prov_user_009', actorId: 'prov_009', patient: null, action: 'login', detail: '14 failed login attempts — account locked', ip: '185.220.101.44', facility: 'Reddington' },
    { id: 'ae003', ts: '2026-03-03T13:15:00Z', actor: 'lab_tech_004', actorId: 'lab_004', patient: 'Amara Okafor', action: 'export', detail: 'Exported 234 records', ip: '41.203.64.5', facility: 'CityLab' },
    { id: 'ae004', ts: '2026-03-03T11:00:00Z', actor: 'Amara Okafor', actorId: 'pat_001', patient: 'Emeka Nwosu', action: 'consent', detail: 'Revoked consent for Lagos General', ip: '102.89.3.4', facility: null },
    { id: 'ae005', ts: '2026-03-02T21:44:00Z', actor: 'Dr. Fatima Aliyu', actorId: 'prov_001', patient: 'Unknown', action: 'break_glass', detail: 'Emergency break-glass access — unconscious patient', ip: '41.203.10.5', facility: 'Lagos General' },
    { id: 'ae006', ts: '2026-03-02T18:00:00Z', actor: 'Dr. Emeka Okonkwo', actorId: 'prov_002', patient: 'Ibrahim Musa', action: 'edit', detail: 'Updated clinical note', ip: '196.12.45.90', facility: 'Reddington' },
    { id: 'ae007', ts: '2026-03-01T10:00:00Z', actor: 'super_admin', actorId: 'admin_001', patient: null, action: 'delete', detail: 'Deleted test facility account', ip: '129.0.0.1', facility: null },
];

export function AuditSearchPage() {
    const [query, setQuery] = useState('');
    const [action, setAction] = useState('all');
    const [dateFrom, setFrom] = useState('');
    const [dateTo, setTo] = useState('');

    const filtered = MOCK_AUDIT_EVENTS.filter(e => {
        const q = query.toLowerCase();
        const matchQ = !q || e.actor.toLowerCase().includes(q) || (e.patient ?? '').toLowerCase().includes(q) || (e.facility ?? '').toLowerCase().includes(q) || e.detail.toLowerCase().includes(q);
        const matchA = action === 'all' || e.action === action;
        return matchQ && matchA;
    });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Audit Search</h1>
                    <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Search all platform events by user, patient, facility, or action type.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                    <Download size={13} /> Export CSV
                </button>
            </div>

            {/* Search & filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search actor, patient, facility…"
                        className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
                        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
                </div>
                <select value={action} onChange={e => setAction(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#9ca3af' }}>
                    <option value="all">All Actions</option>
                    {Object.keys(ACTION_COLORS).map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={e => setFrom(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#9ca3af' }} />
                <input type="date" value={dateTo} onChange={e => setTo(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#9ca3af' }} />
            </div>

            <div className="text-xs" style={{ color: '#4b5563' }}>{filtered.length} events found</div>

            {/* Results table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {['Timestamp', 'Actor', 'Patient', 'Action', 'Detail', 'IP', 'Facility'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                            {filtered.map(e => {
                                const ac = ACTION_COLORS[e.action] ?? { color: '#6b7280', icon: Eye };
                                const Icon = ac.icon;
                                return (
                                    <tr key={e.id} className="hover:bg-white/3 transition-colors">
                                        <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: '#6b7280' }}>
                                            {new Date(e.ts).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#e5e7eb' }}>{e.actor}</td>
                                        <td className="px-4 py-3 text-xs" style={{ color: '#9ca3af' }}>{e.patient ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-[11px] font-bold capitalize"
                                                style={{ color: ac.color }}>
                                                <Icon size={11} /> {e.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: '#9ca3af' }}>{e.detail}</td>
                                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#4b5563' }}>{e.ip}</td>
                                        <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>{e.facility ?? '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
