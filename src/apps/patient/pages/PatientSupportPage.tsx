import React, { useEffect, useState } from 'react';
import { supportApi, type SupportTicket, type TicketCategory } from '@/shared/api/supportApi';
import { MessageSquare, ChevronRight, HelpCircle, CheckCircle, Clock, Loader2, ArrowLeft, Send } from 'lucide-react';

const PATIENT_CATEGORIES: { value: TicketCategory; label: string }[] = [
    { value: 'records_issue', label: "Can't find my records" },
    { value: 'access_issue', label: 'Access / login problem' },
    { value: 'billing', label: 'Billing or payment' },
    { value: 'sync_issue', label: 'App sync problem' },
    { value: 'other', label: 'Something else' },
];

const STATUS_STYLE: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Clock },
    in_progress: { color: '#0d9488', label: 'In Progress', icon: MessageSquare },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    escalated: { color: '#ef4444', label: 'Escalated', icon: MessageSquare },
    closed: { color: '#6b7280', label: 'Closed', icon: CheckCircle },
};

const FAQS = [
    { q: "Why can't I see some of my records?", a: 'Your records are only visible if the healthcare provider has shared them through WelliRecord. Check your consents in the Data Sovereignty page.' },
    { q: 'How do I update my blood type?', a: 'Blood type must be confirmed by a verified lab result. Contact your provider to upload an updated result.' },
    { q: "How do I revoke a provider's access?", a: 'Go to Share & Consent → Revoke next to the provider you want to remove.' },
];

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
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: '#e2e8f0' }}>
                <button onClick={onBack} className="p-1 rounded-lg hover:bg-slate-100" style={{ color: '#64748b' }}>
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: '#1e293b' }}>{ticket.subject}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{ticket.ref}</div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {ticket.messages.map((m, i) => (
                    <div key={i} className={`flex gap-2.5 ${m.sender === 'support' ? '' : 'flex-row-reverse'}`}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: m.sender === 'support' ? 'rgba(13,148,136,0.12)' : '#f1f5f9', color: m.sender === 'support' ? '#0d9488' : '#475569' }}>
                            {m.senderName.charAt(0)}
                        </div>
                        <div className="flex-1 max-w-[80%] flex flex-col gap-1">
                            <div className="text-[11px]" style={{ color: '#94a3b8' }}>{m.senderName} · {new Date(m.sentAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="px-3 py-2 rounded-xl text-sm leading-relaxed"
                                style={{ background: m.sender === 'support' ? 'rgba(13,148,136,0.07)' : '#f8fafc', color: '#334155' }}>
                                {m.body}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {ticket.status !== 'closed' && (
                <div className="p-4 border-t space-y-2" style={{ borderColor: '#e2e8f0' }}>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
                        placeholder="Add a reply…"
                        className="w-full resize-none px-3 py-2 rounded-xl text-sm border"
                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                    {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
                    <button onClick={handleSend} disabled={!reply.trim() || sending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
                        style={{ background: '#0d9488' }}>
                        {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send
                    </button>
                </div>
            )}
        </div>
    );
}

export function PatientSupportPage() {
    const [tab, setTab] = useState<'submit' | 'my_tickets' | 'faq'>('submit');
    const [category, setCategory] = useState<TicketCategory | ''>('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitted, setSubmitted] = useState<SupportTicket | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

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
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900">Help & Support</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Submit an issue, check your tickets, or find an answer in our FAQ.</p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                {[{ key: 'submit', label: 'Submit Issue' }, { key: 'my_tickets', label: 'My Tickets' }, { key: 'faq', label: 'FAQ' }].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key as any); setActiveTicket(null); }}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? '#0d9488' : 'transparent', color: tab === t.key ? '#fff' : '#64748b' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'submit' && !submitted && (
                <div className="rounded-2xl p-6 border space-y-4" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">What type of issue?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PATIENT_CATEGORIES.map(c => (
                                <button key={c.value} onClick={() => setCategory(c.value)}
                                    className="text-sm font-semibold px-3 py-2.5 rounded-xl text-left transition-all"
                                    style={{ background: category === c.value ? 'rgba(13,148,136,0.08)' : '#f8fafc', border: `1px solid ${category === c.value ? '#0d9488' : '#e2e8f0'}`, color: category === c.value ? '#0d9488' : '#334155' }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Subject</label>
                        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue"
                            className="w-full px-3 py-2.5 rounded-xl text-sm border"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                            placeholder="Describe what happened… the more detail, the faster we can help."
                            className="w-full resize-none px-3 py-2.5 rounded-xl text-sm border"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                    </div>
                    {submitError && <p className="text-xs" style={{ color: '#ef4444' }}>{submitError}</p>}
                    
                    {(() => {
                        const isComplete = Boolean(category && subject.trim() && description.trim());
                        let label = "Submit Support Request";
                        let helper = "";

                        if (!category) {
                            label = "Select an Issue Type to Continue";
                            helper = "Select an issue category above to continue.";
                        } else if (!subject.trim()) {
                            label = "Enter a Subject to Continue";
                            helper = "Provide a brief summary of the issue.";
                        } else if (!description.trim()) {
                            label = "Add a Description to Continue";
                            helper = "Describe what happened so our team can assist you.";
                        }

                        return (
                            <div className="space-y-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isComplete || submitting}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                        isComplete
                                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 cursor-pointer active:scale-[0.99]"
                                            : "bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
                                    }`}
                                >
                                    {submitting && <Loader2 size={14} className="animate-spin" />}
                                    {label}
                                </button>
                                {helper && (
                                    <p className="text-[11px] text-center text-slate-500 font-medium">
                                        {helper}
                                    </p>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {tab === 'submit' && submitted && (
                <div className="rounded-2xl p-8 text-center border" style={{ background: '#f0fdfa', borderColor: 'rgba(13,148,136,0.2)' }}>
                    <CheckCircle size={36} className="mx-auto mb-3" style={{ color: '#0d9488' }} />
                    <div className="font-black text-lg" style={{ color: '#1e293b' }}>Request Submitted — {submitted.ref}</div>
                    <div className="text-sm mt-1" style={{ color: '#475569' }}>We'll respond as soon as we can. Check "My Tickets" to track progress.</div>
                    <button onClick={() => { setSubmitted(null); setCategory(''); setSubject(''); setDescription(''); setTab('my_tickets'); }}
                        className="mt-4 text-sm font-bold" style={{ color: '#0d9488' }}>View my tickets →</button>
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
                        <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: '#94a3b8' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading your tickets…
                        </div>
                    )}
                    {!loadingTickets && ticketsError && (
                        <div className="text-center py-10 text-sm" style={{ color: '#ef4444' }}>{ticketsError}</div>
                    )}
                    {!loadingTickets && !ticketsError && myTickets.length === 0 && (
                        <div className="text-center py-10 text-sm" style={{ color: '#94a3b8' }}>No support tickets yet.</div>
                    )}
                    {!loadingTickets && myTickets.map(t => {
                        const st = STATUS_STYLE[t.status];
                        const StIcon = st.icon;
                        return (
                            <button key={t._id} onClick={() => setActiveTicket(t)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left"
                                style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                                <StIcon size={15} style={{ color: st.color, flexShrink: 0 }} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>{t.subject}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                                        {t.ref} · {t.updatedAt && !isNaN(new Date(t.updatedAt).getTime()) ? new Date(t.updatedAt).toLocaleDateString('en-NG') : 'Recently'}
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
                                <ChevronRight size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                            </button>
                        );
                    })}
                </div>
            )}

            {tab === 'faq' && (
                <div className="space-y-3">
                    {FAQS.map((f, i) => (
                        <div key={i} className="rounded-2xl border overflow-hidden" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800">
                                <span className="flex items-center gap-2.5">
                                    <HelpCircle size={16} style={{ color: '#0d9488' }} />
                                    {f.q}
                                </span>
                                <ChevronRight size={15} className={`transition-transform ${openFaq === i ? 'rotate-90' : ''}`} style={{ color: '#94a3b8' }} />
                            </button>
                            {openFaq === i && (
                                <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                    {f.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
