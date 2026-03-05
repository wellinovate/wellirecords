import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi } from '@/shared/api/supportApi';
import {
    ArrowLeft, Send, AlertTriangle, CheckCircle, Info, Activity,
    Shield, Wifi, Monitor, StickyNote, ChevronDown,
} from 'lucide-react';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
    open: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    in_progress: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    escalated: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const SYNC_STYLE: Record<string, { color: string; label: string }> = {
    ok: { color: '#10b981', label: 'Synced' },
    stale: { color: '#f59e0b', label: 'Stale' },
    error: { color: '#ef4444', label: 'Error' },
};

export function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const ticket = supportApi.getTicketById(id ?? '');
    const debug = supportApi.getTroubleshootingData(id ?? '');
    const templates = supportApi.getResolutionTemplates();

    const [reply, setReply] = useState('');
    const [note, setNote] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [panel, setPanel] = useState<'activity' | 'consent' | 'sync' | 'devices'>('activity');

    if (!ticket) return (
        <div className="p-8 text-center" style={{ color: '#6b7280' }}>Ticket not found.</div>
    );

    const st = STATUS_STYLE[ticket.status];

    const PANEL_TABS = [
        { key: 'activity', label: 'User Activity', icon: Activity },
        { key: 'consent', label: 'Consent Logs', icon: Shield },
        { key: 'sync', label: 'Sync Status', icon: Wifi },
        { key: 'devices', label: 'Devices', icon: Monitor },
    ] as const;

    return (
        <div className="animate-fade-in space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin/support')}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#6b7280' }}>
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono" style={{ color: '#4b5563' }}>{ticket.ref}</span>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: st.bg, color: st.color }}>{ticket.status.replace('_', ' ')}</span>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: ticket.priority === 'P1' ? 'rgba(239,68,68,0.15)' : ticket.priority === 'P2' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)', color: ticket.priority === 'P1' ? '#ef4444' : ticket.priority === 'P2' ? '#f59e0b' : '#9ca3af' }}>
                            {ticket.priority}
                        </span>
                    </div>
                    <h1 className="font-black text-lg mt-0.5" style={{ color: '#e5e7eb' }}>{ticket.subject}</h1>
                    <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        Submitted by <span style={{ color: '#9ca3af' }}>{ticket.submittedBy}</span>
                        {ticket.facility && ` · ${ticket.facility}`}
                        {ticket.assignee && ` · Assigned to ${ticket.assignee}`}
                    </div>
                </div>
                {/* Status control */}
                <select className="text-xs font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: '#111827', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {['open', 'in_progress', 'resolved', 'closed', 'escalated'].map(s => (
                        <option key={s} value={s} selected={ticket.status === s}>{s.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 min-h-0">
                {/* Left: Thread + reply */}
                <div className="flex-1 space-y-4 min-w-0">
                    {/* Thread */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="px-4 py-3 border-b text-xs font-bold" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>
                            Conversation thread
                        </div>
                        <div className="p-4 space-y-4">
                            {ticket.messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'support' ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                                        style={{ background: msg.sender === 'support' ? 'rgba(245,158,11,0.15)' : 'rgba(56,189,248,0.15)', color: msg.sender === 'support' ? '#f59e0b' : '#38bdf8' }}>
                                        {msg.senderName.charAt(0)}
                                    </div>
                                    <div className={`flex-1 max-w-[80%] ${msg.sender === 'support' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div className="text-[11px]" style={{ color: '#4b5563' }}>{msg.senderName} · {new Date(msg.sentAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="px-3 py-2 rounded-xl text-sm leading-relaxed"
                                            style={{ background: msg.sender === 'support' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)', color: '#d1d5db' }}>
                                            {msg.body}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reply box */}
                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.1)' }}>
                        <div className="flex items-center justify-between text-xs font-bold" style={{ color: '#6b7280' }}>
                            <span>Reply to {ticket.submittedBy}</span>
                            <button onClick={() => setShowTemplates(!showTemplates)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                                Templates <ChevronDown size={11} />
                            </button>
                        </div>
                        {showTemplates && (
                            <div className="space-y-1">
                                {templates.map(t => (
                                    <button key={t.id} onClick={() => { setReply(t.body); setShowTemplates(false); }}
                                        className="w-full text-left text-xs px-3 py-2 rounded-lg"
                                        style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                            placeholder="Type your reply…"
                            className="w-full resize-none rounded-xl p-3 text-sm"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <Send size={12} /> Send Reply
                        </button>
                    </div>

                    {/* Internal notes */}
                    <div className="rounded-2xl p-4 space-y-2" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#4b5563' }}>
                            <StickyNote size={12} /> Internal Notes (not visible to user)
                        </div>
                        {ticket.internalNotes.map((n, i) => (
                            <div key={i} className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.05)', color: '#9ca3af', borderLeft: '3px solid rgba(245,158,11,0.3)' }}>
                                {n}
                            </div>
                        ))}
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                            placeholder="Add an internal note…"
                            className="w-full resize-none rounded-xl p-2.5 text-xs"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }} />
                    </div>
                </div>

                {/* Right: Live troubleshooting panel */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>Live Troubleshooting</div>
                        </div>
                        {/* Sub-tabs */}
                        <div className="flex border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {PANEL_TABS.map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setPanel(key)}
                                    className="flex-1 px-2 py-2 text-[10px] font-bold flex flex-col items-center gap-0.5 transition-colors whitespace-nowrap"
                                    style={{ color: panel === key ? '#f59e0b' : '#4b5563', borderBottom: panel === key ? '2px solid #f59e0b' : '2px solid transparent' }}>
                                    <Icon size={12} />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                            {panel === 'activity' && debug.userActivity.map((a, i) => (
                                <div key={i} className="text-xs space-y-0.5">
                                    <div className="font-semibold" style={{ color: '#e5e7eb' }}>{a.action}</div>
                                    <div style={{ color: '#4b5563' }}>{new Date(a.at).toLocaleTimeString('en-NG')} {a.detail && `· ${a.detail}`}</div>
                                    {i < debug.userActivity.length - 1 && <hr style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                                </div>
                            ))}
                            {panel === 'consent' && debug.consentLogs.map((c, i) => (
                                <div key={i} className="text-xs space-y-0.5">
                                    <div className="font-semibold" style={{ color: c.event.includes('revoked') ? '#ef4444' : '#10b981' }}>{c.event}</div>
                                    <div style={{ color: '#4b5563' }}>{c.provider} · {new Date(c.at).toLocaleDateString('en-NG')}</div>
                                    {i < debug.consentLogs.length - 1 && <hr style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                                </div>
                            ))}
                            {panel === 'sync' && debug.syncStatus.map((s, i) => {
                                const sty = SYNC_STYLE[s.status];
                                return (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span style={{ color: '#9ca3af' }}>{s.category}</span>
                                        <span className="font-bold" style={{ color: sty.color }}>{sty.label}</span>
                                    </div>
                                );
                            })}
                            {panel === 'devices' && debug.deviceHistory.map((d, i) => (
                                <div key={i} className="text-xs space-y-0.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold" style={{ color: '#e5e7eb' }}>{d.device}</span>
                                        {d.current && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Current</span>}
                                    </div>
                                    <div style={{ color: '#4b5563' }}>{d.location} · {new Date(d.lastSeen).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                    {i < debug.deviceHistory.length - 1 && <hr style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                                </div>
                            ))}
                            {(panel === 'activity' && debug.userActivity.length === 0) && (
                                <div className="text-xs text-center py-4" style={{ color: '#4b5563' }}>No data available for this ticket.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
