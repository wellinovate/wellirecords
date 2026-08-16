import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi, type SupportTicket, type ConsentActivityEvent, type TicketPriority, type TicketStatus } from '@/shared/api/supportApi';
import {
    ArrowLeft, Send, Shield, StickyNote, Loader2, UserPlus, UserMinus,
} from 'lucide-react';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
    open: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    in_progress: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    escalated: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
    P1: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    P2: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    P3: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

const STATUS_OPTIONS: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'escalated'];
const PRIORITY_OPTIONS: TicketPriority[] = ['P1', 'P2', 'P3'];

export function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [consentEvents, setConsentEvents] = useState<ConsentActivityEvent[]>([]);
    const [consentLoading, setConsentLoading] = useState(false);

    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [note, setNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [savingPriority, setSavingPriority] = useState(false);
    const [savingAssign, setSavingAssign] = useState(false);

    const load = () => {
        if (!id) return;
        setLoading(true);
        setLoadError('');
        supportApi.adminGetTicketById(id)
            .then(setTicket)
            .catch(() => setLoadError("Couldn't load this ticket."))
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    useEffect(() => {
        if (!id || !ticket || ticket.userType !== 'patient') return;
        setConsentLoading(true);
        supportApi.adminGetConsentActivity(id)
            .then(setConsentEvents)
            .catch(() => setConsentEvents([]))
            .finally(() => setConsentLoading(false));
    }, [id, ticket?.userType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: '#6b7280' }}>
                <Loader2 size={18} className="animate-spin" /> Loading ticket…
            </div>
        );
    }

    if (loadError || !ticket) {
        return (
            <div className="p-8 text-center" style={{ color: '#ef4444' }}>{loadError || 'Ticket not found.'}</div>
        );
    }

    const st = STATUS_STYLE[ticket.status];

    const handleStatusChange = async (status: TicketStatus) => {
        if (!id) return;
        setSavingStatus(true);
        try {
            const updated = await supportApi.adminUpdateStatus(id, status);
            setTicket(updated);
        } finally {
            setSavingStatus(false);
        }
    };

    const handlePriorityChange = async (priority: TicketPriority) => {
        if (!id) return;
        setSavingPriority(true);
        try {
            const updated = await supportApi.adminUpdatePriority(id, priority);
            setTicket(updated);
        } finally {
            setSavingPriority(false);
        }
    };

    const handleAssignToggle = async () => {
        if (!id) return;
        setSavingAssign(true);
        try {
            const updated = ticket.assigneeAccountId
                ? await supportApi.adminUnassign(id)
                : await supportApi.adminAssignToMe(id);
            setTicket(updated);
        } finally {
            setSavingAssign(false);
        }
    };

    const handleReply = async () => {
        if (!id || !reply.trim() || sendingReply) return;
        setSendingReply(true);
        try {
            const updated = await supportApi.adminReply(id, reply.trim());
            setTicket(updated);
            setReply('');
        } finally {
            setSendingReply(false);
        }
    };

    const handleAddNote = async () => {
        if (!id || !note.trim() || savingNote) return;
        setSavingNote(true);
        try {
            const updated = await supportApi.adminAddNote(id, note.trim());
            setTicket(updated);
            setNote('');
        } finally {
            setSavingNote(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => navigate('/admin/support')}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono" style={{ color: '#4b5563' }}>{ticket.ref}</span>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: st.bg, color: st.color }}>{ticket.status.replace('_', ' ')}</span>
                        {ticket.priority && (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: PRIORITY_STYLE[ticket.priority].bg, color: PRIORITY_STYLE[ticket.priority].color }}>
                                {ticket.priority}
                            </span>
                        )}
                    </div>
                    <h1 className="font-black text-lg mt-0.5" style={{ color: '#e5e7eb' }}>{ticket.subject}</h1>
                    <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        Submitted by <span style={{ color: '#9ca3af' }}>{ticket.submittedByName}</span>
                        {ticket.facility && ` · ${ticket.facility}`}
                        {ticket.assigneeName && ` · Assigned to ${ticket.assigneeName}`}
                    </div>
                </div>

                {/* Priority triage */}
                <select
                    value={ticket.priority ?? ''}
                    disabled={savingPriority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: '#111827', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="" disabled>Set priority</option>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                {/* Status control */}
                <select
                    value={ticket.status}
                    disabled={savingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: '#111827', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                </select>

                {/* Assign to me */}
                <button onClick={handleAssignToggle} disabled={savingAssign}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                    style={{ background: '#111827', color: ticket.assigneeAccountId ? '#ef4444' : '#38bdf8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {ticket.assigneeAccountId ? <UserMinus size={12} /> : <UserPlus size={12} />}
                    {ticket.assigneeAccountId ? 'Unassign' : 'Assign to me'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 min-h-0">
                <div className="flex-1 space-y-4 min-w-0">
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="px-4 py-3 border-b text-xs font-bold" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>
                            Conversation thread
                        </div>
                        <div className="p-4 space-y-4">
                            {ticket.messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.sender === 'support' ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                                        style={{ background: msg.sender === 'support' ? 'rgba(245,158,11,0.15)' : 'rgba(56,189,248,0.15)', color: msg.sender === 'support' ? '#f59e0b' : '#38bdf8' }}>
                                        {msg.senderName.charAt(0)}
                                    </div>
                                    <div className={`flex-1 max-w-[80%] flex flex-col gap-1 ${msg.sender === 'support' ? 'items-end' : 'items-start'}`}>
                                        <div className="text-[11px]" style={{ color: '#4b5563' }}>{msg.senderName} · {new Date(msg.sentAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="px-3.5 py-2.5 rounded-xl text-sm leading-relaxed"
                                            style={{ background: msg.sender === 'support' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', color: '#e5e7eb' }}>
                                            {msg.body}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.1)' }}>
                        <div className="text-xs font-bold" style={{ color: '#6b7280' }}>Reply to {ticket.submittedByName}</div>
                        <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                            placeholder="Type your reply…"
                            className="w-full resize-none rounded-xl p-3 text-sm"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
                        <button onClick={handleReply} disabled={!reply.trim() || sendingReply}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                            {sendingReply ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Send Reply
                        </button>
                    </div>

                    <div className="rounded-2xl p-4 space-y-2" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#4b5563' }}>
                            <StickyNote size={12} /> Internal Notes (not visible to user)
                        </div>
                        {ticket.internalNotes.map((n, i) => (
                            <div key={i} className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.05)', color: '#9ca3af', borderLeft: '3px solid rgba(245,158,11,0.3)' }}>
                                <div className="font-semibold mb-0.5" style={{ color: '#d1d5db' }}>{n.authorName} · {new Date(n.at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                {n.body}
                            </div>
                        ))}
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                            placeholder="Add an internal note…"
                            className="w-full resize-none rounded-xl p-2.5 text-xs"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }} />
                        <button onClick={handleAddNote} disabled={!note.trim() || savingNote}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                            {savingNote ? 'Saving…' : 'Add note'}
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <div className="px-4 py-3 border-b flex items-center gap-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <Shield size={12} style={{ color: '#ef4444' }} />
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>Consent Activity</div>
                        </div>
                        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                            {ticket.userType !== 'patient' && (
                                <div className="text-xs text-center py-4" style={{ color: '#4b5563' }}>
                                    Consent activity applies to patient-filed tickets only.
                                </div>
                            )}
                            {ticket.userType === 'patient' && consentLoading && (
                                <div className="flex items-center justify-center gap-2 py-4 text-xs" style={{ color: '#4b5563' }}>
                                    <Loader2 size={12} className="animate-spin" /> Loading…
                                </div>
                            )}
                            {ticket.userType === 'patient' && !consentLoading && consentEvents.length === 0 && (
                                <div className="text-xs text-center py-4" style={{ color: '#4b5563' }}>No consent activity on record.</div>
                            )}
                            {ticket.userType === 'patient' && !consentLoading && consentEvents.map((c, i) => (
                                <div key={i} className="text-xs space-y-0.5">
                                    <div className="font-semibold" style={{ color: c.event.includes('revoked') ? '#ef4444' : '#10b981' }}>{c.event}</div>
                                    <div style={{ color: '#4b5563' }}>{c.provider} · {new Date(c.at).toLocaleDateString('en-NG')}</div>
                                    {i < consentEvents.length - 1 && <hr style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
