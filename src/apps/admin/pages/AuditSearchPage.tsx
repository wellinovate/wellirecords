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

// No backend audit-log endpoint exists yet — this used to show
// fabricated events, including a fake "break-glass" emergency-access
// entry and a fake admin deletion, which is exactly the kind of
// content a real compliance/security tool should never invent.
const MOCK_AUDIT_EVENTS: Array<{ id: string; ts: string; actor: string; actorId: string; patient: string | null; action: string; detail: string; ip: string; facility: string | null }> = [];

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
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                                        No audit log events found. Real-time audit log streaming will be active once the backend event emitter is enabled.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(e => {
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
