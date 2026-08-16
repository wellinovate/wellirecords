import React, { useEffect, useState } from 'react';
import { supportApi, type SupportTicket, type TicketCategory } from '@/shared/api/supportApi';
import { HelpCircle, MessageSquare, ChevronRight, CheckCircle, Clock, Loader2, ArrowLeft, Send } from 'lucide-react';

const PROVIDER_CATEGORIES: { value: TicketCategory; label: string }[] = [
    { value: 'records_issue', label: 'Patient record issue' },
    { value: 'access_issue', label: 'Access / login problem' },
    { value: 'sync_issue', label: 'Lab or record sync issue' },
    { value: 'integration', label: 'API / integration issue' },
    { value: 'billing', label: 'Billing or subscription' },
    { value: 'other', label: 'Something else' },
];

const STATUS_STYLE: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Clock },
    in_progress: { color: '#38bdf8', label: 'In Progress', icon: MessageSquare },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    escalated: { color: '#ef4444', label: 'Escalated', icon: MessageSquare },
    closed: { color: '#6b7280', label: 'Closed', icon: CheckCircle },
};

function TicketThread({ ticket, onBack, onReplied }: { ticket: SupportTicket; onBack: () => void; onReplied: (t: SupportTicket) => void }) {
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const st = STATUS_STYLE[ticket.status];

    const handleSend = async () => {
        if (!reply.trim() || sending) return;
        setSending(true);
        setError('');
        try {
            const updated = await supportApi.replyToOwnTicket(ticket._id, reply.trim());
            onReplied(updated);
            setReply('');
        } catch {
            setError("Couldn't send your reply — try again in a moment.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="card-provider overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: '#163761' }}>
                <button onClick={onBack} className="p-1 rounded-lg hover:bg-white/5" style={{ color: '#7ba3c8' }}>
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: '#e2eaf4' }}>{ticket.subject}</div>
                    <div className="text-xs" style={{ color: '#7ba3c8' }}>{ticket.ref}</div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {ticket.messages.map((m, i) => (
                    <div key={i} className={`flex gap-2.5 ${m.sender === 'support' ? '' : 'flex-row-reverse'}`}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: m.sender === 'support' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.06)', color: m.sender === 'support' ? '#38bdf8' : '#7ba3c8' }}>
                            {m.senderName.charAt(0)}
                        </div>
                        <div className="flex-1 max-w-[80%] flex flex-col gap-1">
                            <div className="text-[11px]" style={{ color: '#4c6a8c' }}>{m.senderName} · {new Date(m.sentAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="px-3 py-2 rounded-xl text-sm leading-relaxed"
                                style={{ background: m.sender === 'support' ? 'rgba(56,189,248,0.07)' : 'rgba(255,255,255,0.03)', color: '#dbe6f2' }}>
                                {m.body}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {ticket.status !== 'closed' && (
                <div className="p-4 border-t space-y-2" style={{ borderColor: '#163761' }}>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
                        placeholder="Add a reply…"
                        className="w-full resize-none px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                    {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
                    <button onClick={handleSend} disabled={!reply.trim() || sending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 disabled:opacity-40"
                        style={{ background: '#38bdf8' }}>
                        {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send
                    </button>
                </div>
            )}
        </div>
    );
}

export function ProviderSupportPage() {
    const [tab, setTab] = useState<'submit' | 'my_tickets'>('submit');
    const [category, setCategory] = useState<TicketCategory | ''>('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitted, setSubmitted] = useState<SupportTicket | null>(null);

    const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [ticketsError, setTicketsError] = useState('');
    const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

    const loadMyTickets = () => {
        setLoadingTickets(true);
        setTicketsError('');
        supportApi.getMyTickets()
            .then(setMyTickets)
            .catch(() => setTicketsError("Couldn't load your tickets right now."))
            .finally(() => setLoadingTickets(false));
    };

    useEffect(() => {
        if (tab === 'my_tickets') loadMyTickets();
    }, [tab]);

    const handleSubmit = async () => {
        if (!category || !subject.trim() || !description.trim() || submitting) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const ticket = await supportApi.createTicket({ category, subject: subject.trim(), description: description.trim() });
            setSubmitted(ticket);
        } catch {
            setSubmitError("Couldn't submit your request — try again in a moment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl">
            <div className="mb-6">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Support</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Report issues and track resolution</p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761' }}>
                {[{ key: 'submit', label: 'Submit Issue' }, { key: 'my_tickets', label: 'My Tickets' }].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key as any); setActiveTicket(null); }}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? '#38bdf8' : 'transparent', color: tab === t.key ? '#04101f' : '#7ba3c8' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'submit' && !submitted && (
                <div className="card-provider p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>What type of issue?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PROVIDER_CATEGORIES.map(c => (
                                <button key={c.value} onClick={() => setCategory(c.value)}
                                    className="text-sm font-semibold px-3 py-2.5 rounded-xl text-left transition-all"
                                    style={{ background: category === c.value ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${category === c.value ? '#38bdf8' : '#163761'}`, color: category === c.value ? '#38bdf8' : '#dbe6f2' }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Subject</label>
                        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue"
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                            placeholder="Describe what happened… the more detail, the faster we can help."
                            className="w-full resize-none px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }} />
                    </div>
                    {submitError && <p className="text-xs" style={{ color: '#f87171' }}>{submitError}</p>}
                    <button onClick={handleSubmit} disabled={!category || !subject.trim() || !description.trim() || submitting}
                        className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                        style={{ background: '#38bdf8' }}>
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        Submit Support Request
                    </button>
                </div>
            )}
            {tab === 'submit' && submitted && (
                <div className="card-provider p-8 text-center">
                    <CheckCircle size={36} className="mx-auto mb-3" style={{ color: '#34d399' }} />
                    <div className="font-black text-lg" style={{ color: '#e2eaf4' }}>Request Submitted — {submitted.ref}</div>
                    <div className="text-sm mt-1" style={{ color: '#7ba3c8' }}>We'll respond as soon as we can. Check "My Tickets" to track progress.</div>
                    <button onClick={() => { setSubmitted(null); setCategory(''); setSubject(''); setDescription(''); setTab('my_tickets'); }}
                        className="mt-4 text-sm font-bold" style={{ color: '#38bdf8' }}>View my tickets →</button>
                </div>
            )}

            {tab === 'my_tickets' && activeTicket && (
                <TicketThread
                    ticket={activeTicket}
                    onBack={() => setActiveTicket(null)}
                    onReplied={(t) => {
                        setActiveTicket(t);
                        setMyTickets((prev) => prev.map((x) => (x._id === t._id ? t : x)));
                    }}
                />
            )}

            {tab === 'my_tickets' && !activeTicket && (
                <div className="space-y-2">
                    {loadingTickets && (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: '#7ba3c8' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading your tickets…
                        </div>
                    )}
                    {!loadingTickets && ticketsError && (
                        <div className="text-center py-10 text-sm" style={{ color: '#f87171' }}>{ticketsError}</div>
                    )}
                    {!loadingTickets && !ticketsError && myTickets.length === 0 && (
                        <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                                <HelpCircle size={26} style={{ color: '#f59e0b' }} />
                            </div>
                            <p className="text-sm" style={{ color: '#7ba3c8' }}>No support tickets yet.</p>
                        </div>
                    )}
                    {!loadingTickets && myTickets.map(t => {
                        const st = STATUS_STYLE[t.status];
                        const StIcon = st.icon;
                        return (
                            <button key={t._id} onClick={() => setActiveTicket(t)}
                                className="card-provider w-full flex items-center gap-3 px-4 py-3.5 text-left"
                            >
                                <StIcon size={15} style={{ color: st.color, flexShrink: 0 }} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate" style={{ color: '#e2eaf4' }}>{t.subject}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>{t.ref} · {new Date(t.updatedAt).toLocaleDateString('en-NG')}</div>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
                                <ChevronRight size={14} style={{ color: '#4c6a8c', flexShrink: 0 }} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
