import React, { useEffect, useState } from 'react';
import { supportApi, type SupportTicket, type TicketCategory } from '@/shared/api/supportApi';
import {
    HelpCircle,
    MessageSquare,
    ChevronRight,
    CheckCircle,
    Clock,
    Loader2,
    ArrowLeft,
    Send,
    FileText,
    KeyRound,
    RefreshCw,
    CreditCard,
    Code2,
    PhoneCall,
    ShieldCheck,
    ChevronDown,
    ExternalLink,
} from 'lucide-react';

const PROVIDER_CATEGORIES: { value: TicketCategory; label: string; icon: React.ElementType; desc: string }[] = [
    {
        value: 'records_issue',
        label: 'Patient Record / EHR',
        icon: FileText,
        desc: 'Missing charts, encounters, vitals or upload issues',
    },
    {
        value: 'sync_issue',
        label: 'Lab & Results Sync',
        icon: RefreshCw,
        desc: 'Lab orders, test status or delivery sync errors',
    },
    {
        value: 'access_issue',
        label: 'Staff Login & Access',
        icon: KeyRound,
        desc: 'Password resets, team permissions & role locks',
    },
    {
        value: 'billing',
        label: 'Billing & Subscriptions',
        icon: CreditCard,
        desc: 'Facility tier, invoice receipts or payment queries',
    },
    {
        value: 'other',
        label: 'General Facility Inquiry',
        icon: HelpCircle,
        desc: 'Operational questions, feedback or other topics',
    },
];

const STATUS_STYLE: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Clock },
    in_progress: { color: '#38bdf8', label: 'In Progress', icon: MessageSquare },
    resolved: { color: '#10b981', label: 'Resolved', icon: CheckCircle },
    escalated: { color: '#ef4444', label: 'Escalated', icon: MessageSquare },
    closed: { color: '#6b7280', label: 'Closed', icon: CheckCircle },
};

const PROVIDER_FAQS = [
    {
        q: 'Why does a lab order or prescription say "No write consent on file"?',
        a: 'WelliRecord requires patients to grant write permissions before providers can add new records. Ask the patient to open their WelliRecord app, go to "Share & Consent", and check "Allow write access" for your facility.',
    },
    {
        q: 'How do I add doctors, nurses, or lab technicians to our facility?',
        a: 'Facility administrators can go to Team & Staff Settings to invite staff via email and assign role-based clinical scopes (e.g. Doctor, Nurse, Lab Tech).',
    },
    {
        q: 'How long does organization identity/license verification take?',
        a: 'Document verification by our clinical compliance team typically takes 24 to 48 business hours after CAC or operating license upload.',
    },
    {
        q: 'How can our facility link an existing patient without a WR-ID?',
        a: 'Use the Patient Search picker with their registered phone number or national ID to request a temporary access grant.',
    },
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
        <div className="card-provider overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: '#163761' }}>
                <button
                    type="button"
                    onClick={onBack}
                    className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: '#7ba3c8' }}
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: '#e2eaf4' }}>{ticket.subject}</div>
                    <div className="text-xs" style={{ color: '#7ba3c8' }}>{ticket.ref}</div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>
                    {st.label}
                </span>
            </div>

            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
                {ticket.messages.map((m, i) => (
                    <div key={i} className={`flex gap-2.5 ${m.sender === 'support' ? '' : 'flex-row-reverse'}`}>
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                                background: m.sender === 'support' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.06)',
                                color: m.sender === 'support' ? '#38bdf8' : '#7ba3c8',
                            }}
                        >
                            {m.senderName.charAt(0)}
                        </div>
                        <div className="flex-1 max-w-[85%] flex flex-col gap-1">
                            <div className="text-[11px]" style={{ color: '#4c6a8c' }}>
                                {m.senderName} · {new Date(m.sentAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div
                                className="px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                                style={{
                                    background: m.sender === 'support' ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)',
                                    color: '#dbe6f2',
                                    border: m.sender === 'support' ? '1px solid rgba(56,189,248,0.15)' : '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                {m.body}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {ticket.status !== 'closed' && (
                <div className="p-4 border-t space-y-2.5" style={{ borderColor: '#163761' }}>
                    <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={3}
                        placeholder="Add a follow-up reply or more clinical context…"
                        className="w-full resize-none px-3 py-2.5 rounded-xl text-sm outline-none transition-colors focus:border-sky-500"
                        style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }}
                    />
                    {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!reply.trim() || sending}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 disabled:opacity-40 transition-all"
                            style={{ background: '#38bdf8' }}
                        >
                            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send Message
                        </button>
                    </div>
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
    const [openFaq, setOpenFaq] = useState<number | null>(0);

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
            const ticket = await supportApi.createTicket({
                category,
                subject: subject.trim(),
                description: description.trim(),
            });
            setSubmitted(ticket);
        } catch {
            setSubmitError("Couldn't submit your request — please verify details and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl pb-10">
            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Provider Support Center</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>
                        Clinical and technical assistance for healthcare providers, administrators, and staff
                    </p>
                </div>

                <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761' }}>
                    {[{ key: 'submit', label: 'Submit Ticket' }, { key: 'my_tickets', label: 'Track Tickets' }].map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => { setTab(t.key as any); setActiveTicket(null); }}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{
                                background: tab === t.key ? '#38bdf8' : 'transparent',
                                color: tab === t.key ? '#04101f' : '#7ba3c8',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Content (Left, 7 or 8 cols on desktop) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    {tab === 'submit' && !submitted && (
                        <div className="card-provider p-6 md:p-7 space-y-6">
                            {/* Issue Category Picker */}
                            <div>
                                <label className="text-xs font-bold block mb-1" style={{ color: '#e2eaf4' }}>
                                    1. Select Issue Category <span className="text-rose-400">*</span>
                                </label>
                                <p className="text-xs mb-3" style={{ color: '#7ba3c8' }}>
                                    Choose the area that best matches what you need help with
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {PROVIDER_CATEGORIES.map((c) => {
                                        const Icon = c.icon;
                                        const isSelected = category === c.value;
                                        return (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => setCategory(c.value)}
                                                className="p-3.5 rounded-xl text-left transition-all flex items-start gap-3 outline-none"
                                                style={{
                                                    background: isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${isSelected ? '#38bdf8' : '#163761'}`,
                                                    color: isSelected ? '#38bdf8' : '#dbe6f2',
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{
                                                        background: isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                                                        color: isSelected ? '#38bdf8' : '#7ba3c8',
                                                    }}
                                                >
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold leading-tight">{c.label}</div>
                                                    <div className="text-[11px] mt-1 line-clamp-2" style={{ color: '#7ba3c8' }}>
                                                        {c.desc}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Subject Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold block" style={{ color: '#e2eaf4' }}>
                                        2. Subject / Brief Summary <span className="text-rose-400">*</span>
                                    </label>
                                    <span className="text-[11px]" style={{ color: '#4c6a8c' }}>Single-line summary</span>
                                </div>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Lab results for patient #WR-1042 not appearing in encounter view"
                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors focus:border-sky-500"
                                    style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }}
                                />
                            </div>

                            {/* Description Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold block" style={{ color: '#e2eaf4' }}>
                                        3. Detailed Description & Clinical Context <span className="text-rose-400">*</span>
                                    </label>
                                    <span className="text-[11px]" style={{ color: '#4c6a8c' }}>More detail = faster resolution</span>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    placeholder={`Please provide context:
• What action were you attempting? (e.g. issuing prescription, releasing lab results)
• Patient WR-ID / Name or Doctor Name (if applicable):
• Exact error message or behavior observed:`}
                                    className="w-full resize-none px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors focus:border-sky-500 font-sans"
                                    style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761', color: '#e2eaf4' }}
                                />
                            </div>

                            {submitError && (
                                <div className="rounded-xl p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300">
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!category || !subject.trim() || !description.trim() || submitting}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 hover:brightness-105 active:scale-[0.99]"
                                style={{ background: '#38bdf8' }}
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Submit Support Ticket
                            </button>
                        </div>
                    )}

                    {tab === 'submit' && submitted && (
                        <div className="card-provider p-10 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
                                <CheckCircle size={32} style={{ color: '#34d399' }} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-xl" style={{ color: '#e2eaf4' }}>
                                    Ticket Received — <span className="font-mono text-sky-400">{submitted.ref}</span>
                                </h3>
                                <p className="text-sm max-w-md mx-auto" style={{ color: '#7ba3c8' }}>
                                    Our support and clinical engineering team will review your ticket. You can track status and reply directly from "Track Tickets".
                                </p>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(null);
                                        setCategory('');
                                        setSubject('');
                                        setDescription('');
                                        setTab('my_tickets');
                                    }}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 transition-all hover:brightness-105"
                                    style={{ background: '#38bdf8' }}
                                >
                                    View in Track Tickets →
                                </button>
                            </div>
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
                        <div className="space-y-3">
                            {loadingTickets && (
                                <div className="card-provider p-12 flex items-center justify-center gap-2 text-sm" style={{ color: '#7ba3c8' }}>
                                    <Loader2 size={18} className="animate-spin" /> Loading facility tickets…
                                </div>
                            )}
                            {!loadingTickets && ticketsError && (
                                <div className="card-provider p-8 text-center text-sm" style={{ color: '#f87171' }}>{ticketsError}</div>
                            )}
                            {!loadingTickets && !ticketsError && myTickets.length === 0 && (
                                <div className="card-provider p-12 text-center flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                                        <HelpCircle size={26} style={{ color: '#38bdf8' }} />
                                    </div>
                                    <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>No tickets on record</p>
                                    <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                                        Your facility has no open or past support requests. Submit a new ticket if you run into any issues.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setTab('submit')}
                                        className="mt-2 text-xs font-bold px-4 py-2 rounded-xl text-slate-950"
                                        style={{ background: '#38bdf8' }}
                                    >
                                        Submit an Issue
                                    </button>
                                </div>
                            )}
                            {!loadingTickets && myTickets.map((t) => {
                                const st = STATUS_STYLE[t.status];
                                const StIcon = st.icon;
                                return (
                                    <button
                                        key={t._id}
                                        type="button"
                                        onClick={() => setActiveTicket(t)}
                                        className="card-provider w-full p-4 flex items-center gap-3 text-left transition-all hover:-translate-y-0.5 hover:border-sky-500/30"
                                    >
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${st.color}15`, color: st.color }}
                                        >
                                            <StIcon size={17} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate" style={{ color: '#e2eaf4' }}>{t.subject}</div>
                                            <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                                                <span className="font-mono">{t.ref}</span> · Updated {new Date(t.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}18` }}>
                                            {st.label}
                                        </span>
                                        <ChevronRight size={14} style={{ color: '#4c6a8c', flexShrink: 0 }} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar (Fills the viewport gracefully with FAQs, Dev Support & Direct Lines) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                    {/* Facility SLA & Status Card */}
                    <div className="card-provider p-5 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: '#163761' }}>
                            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#e2eaf4' }}>
                                <ShieldCheck size={16} className="text-emerald-400" />
                                <span>Support SLA & Response Times</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                                Live Desk
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                                <span className="block font-black text-amber-400">P1 Urgent</span>
                                <span className="text-[11px] text-slate-400">&lt; 4 Hours</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                                <span className="block font-black text-sky-400">P2 High</span>
                                <span className="text-[11px] text-slate-400">&lt; 24 Hours</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                                <span className="block font-black text-slate-400">P3 Routine</span>
                                <span className="text-[11px] text-slate-400">&lt; 72 Hours</span>
                            </div>
                        </div>
                    </div>

                    {/* Dedicated Developer & Integration Path */}
                    <div className="card-provider p-5 space-y-3" style={{ border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.03)' }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                                <Code2 size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold" style={{ color: '#e2eaf4' }}>Developer & API Integration</h4>
                                <p className="text-[11px]" style={{ color: '#a78bfa' }}>EMR, Webhooks & HL7 / FHIR</p>
                            </div>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#7ba3c8' }}>
                            Building custom software integrations, sync bridges, or automated lab interfaces with WelliRecord?
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setTab('submit');
                                setCategory('integration');
                                setSubject('API / Integration Support Request');
                            }}
                            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-purple-200 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>Open Integration Ticket</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    {/* Provider Quick Help FAQ */}
                    <div className="card-provider p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#e2eaf4' }}>
                            <HelpCircle size={15} style={{ color: '#38bdf8' }} />
                            <span>Facility Frequently Asked Questions</span>
                        </div>

                        <div className="space-y-2">
                            {PROVIDER_FAQS.map((faq, i) => (
                                <div key={i} className="rounded-xl border overflow-hidden transition-all" style={{ borderColor: '#163761', background: 'rgba(7,24,48,0.3)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full p-3 text-left text-xs font-semibold flex items-center justify-between gap-2"
                                        style={{ color: '#dbe6f2' }}
                                    >
                                        <span className="leading-snug">{faq.q}</span>
                                        <ChevronDown size={13} className={`flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-sky-400' : 'text-slate-500'}`} />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-3 pb-3 text-xs leading-relaxed border-t pt-2" style={{ borderColor: 'rgba(22,55,97,0.5)', color: '#7ba3c8' }}>
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Direct Clinical Hotline Contact */}
                    <div className="card-provider p-4 text-xs flex items-center gap-3" style={{ background: 'rgba(7,24,48,0.5)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-500/10 text-sky-400">
                            <PhoneCall size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#e2eaf4]">Direct Support Hotline</div>
                            <div className="text-[11px] text-[#7ba3c8]">Emergency & Clinical Escalations: <span className="text-white font-mono font-bold">+234 800-WELLI</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
