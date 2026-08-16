import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportApi, type SupportTicket, type TicketStatus, type TicketPriority, SLA_HOURS } from '@/shared/api/supportApi';
import { MessageSquare, Clock, ChevronRight, User, Building2, Loader2 } from 'lucide-react';

const STATUS_STYLE: Record<TicketStatus, { color: string; bg: string; label: string }> = {
    open: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Open' },
    in_progress: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', label: 'In Progress' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Resolved' },
    closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Closed' },
    escalated: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Escalated' },
};

const PRIORITY_STYLE: Record<TicketPriority, { color: string; bg: string }> = {
    P1: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    P2: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    P3: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

function getSLAStatus(deadline: string | null): { label: string; color: string } | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return { label: 'SLA Breached', color: '#ef4444' };
    if (diff < 3600000) return { label: `< 1h left`, color: '#f59e0b' };
    const hours = Math.round(diff / 3600000);
    return { label: `${hours}h left`, color: '#10b981' };
}

const FILTERS: { key: string; label: string }[] = [
    { key: 'all', label: 'All Tickets' },
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'escalated', label: 'Escalated' },
    { key: 'resolved', label: 'Resolved' },
];

export function SupportDeskPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        supportApi.adminListTickets(filter !== 'all' ? { status: filter as TicketStatus } : undefined)
            .then(setTickets)
            .catch(() => setError("Couldn't load tickets right now."))
            .finally(() => setLoading(false));
    }, [filter]);

    const openCount = tickets.filter(t => t.status === 'open').length;
    const escalatedCount = tickets.filter(t => t.status === 'escalated').length;
    const inProgCount = tickets.filter(t => t.status === 'in_progress').length;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Support Desk</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Patient and provider issue tickets · SLA tracking</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Open Tickets', value: openCount, color: '#f59e0b' },
                    { label: 'In Progress', value: inProgCount, color: '#38bdf8' },
                    { label: 'Escalated', value: escalatedCount, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="p-4 rounded-xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-xs" style={{ color: '#6b7280' }}>{s.label}</div>
                        <div className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 text-xs" style={{ color: '#4b5563' }}>
                <span><span className="font-black" style={{ color: '#ef4444' }}>P1</span> = {SLA_HOURS.P1}h SLA</span>
                <span><span className="font-black" style={{ color: '#f59e0b' }}>P2</span> = {SLA_HOURS.P2}h SLA</span>
                <span><span className="font-black" style={{ color: '#9ca3af' }}>P3</span> = {SLA_HOURS.P3}h SLA</span>
                <span className="text-[#4b5563]">· Untriaged tickets have no priority yet</span>
            </div>

            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#111827' }}>
                {FILTERS.map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: filter === f.key ? '#f59e0b' : 'transparent', color: filter === f.key ? '#000' : '#6b7280' }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: '#4b5563' }}>
                    <Loader2 size={16} className="animate-spin" /> Loading tickets…
                </div>
            )}
            {!loading && error && (
                <div className="text-center py-12 text-sm" style={{ color: '#ef4444' }}>{error}</div>
            )}

            {!loading && !error && (
                <div className="space-y-2">
                    {tickets.map(t => {
                        const pr = t.priority ? PRIORITY_STYLE[t.priority] : { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
                        const st = STATUS_STYLE[t.status];
                        const sla = getSLAStatus(t.slaDeadline);
                        return (
                            <div key={t._id} onClick={() => navigate(`/admin/support/${t._id}`)}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 flex-wrap md:flex-nowrap"
                                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>

                                <span className="text-[11px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: pr.bg, color: pr.color }}>{t.priority ?? 'Untriaged'}</span>

                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: t.userType === 'patient' ? 'rgba(56,189,248,0.1)' : 'rgba(167,139,250,0.1)' }}>
                                    {t.userType === 'patient' ? <User size={13} style={{ color: '#38bdf8' }} /> : <Building2 size={13} style={{ color: '#a78bfa' }} />}
                                </div>

                                <div className="flex-1 min-w-0" style={{ minWidth: '140px' }}>
                                    <div className="font-semibold text-sm truncate" style={{ color: '#e5e7eb' }}>{t.subject}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                        {t.ref} · {t.submittedByName}{t.facility ? ` · ${t.facility}` : ''}
                                    </div>
                                </div>

                                {sla && (
                                    <div className="hidden md:flex text-[11px] font-bold items-center gap-1 flex-shrink-0" style={{ color: sla.color }}>
                                        <Clock size={11} /> {sla.label}
                                    </div>
                                )}

                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: st.bg, color: st.color }}>{st.label}</span>

                                <ChevronRight size={14} style={{ color: '#374151', flexShrink: 0 }} />
                            </div>
                        );
                    })}
                    {tickets.length === 0 && (
                        <div className="text-center py-12 text-sm" style={{ color: '#4b5563' }}>
                            No tickets in this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
