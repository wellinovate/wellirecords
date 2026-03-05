import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Search, Brain, Paperclip, Image, FlaskConical, Pill,
    CheckCheck, Check, ChevronDown, X, Beaker, FileText, Sparkles,
    Phone, Video, MoreVertical, Microscope,
} from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────────────── */
type MsgStatus = 'sent' | 'delivered' | 'read';
type MsgType = 'text' | 'record-card' | 'lab-card' | 'refill-card';

interface RecordCard {
    title: string;
    value: string;
    date: string;
    icon: React.ReactNode;
    color: string;
}

interface Message {
    id: string;
    mine: boolean;
    text?: string;
    time: string;
    status?: MsgStatus;
    card?: RecordCard;
}

interface Thread {
    id: string;
    from: string;
    org: string;
    avatar: string;
    avatarBg: string;
    online: boolean;
    specialty: string;
    last: string;
    time: string;
    unread: number;
}

/* ─── Mock Data ───────────────────────────────────────────────────────── */
const THREADS: Thread[] = [
    { id: 't1', from: 'Dr. Fatima Aliyu', org: 'Lagos General Hospital', avatar: 'FA', avatarBg: '#ef4444', online: true, specialty: 'Cardiology', last: 'Your results look good! Please continue the Lisinopril.', time: '2h ago', unread: 2 },
    { id: 't2', from: 'CityLab Diagnostics', org: 'CityLab', avatar: 'CL', avatarBg: '#0ea5e9', online: false, specialty: 'Laboratory', last: 'Your thyroid panel is ready for review.', time: '1d ago', unread: 1 },
    { id: 't3', from: 'Dr. Sola Martins', org: 'WelliHealth Telehealth', avatar: 'SM', avatarBg: '#1a6b42', online: false, specialty: 'General Practice', last: 'Remember to log your blood glucose readings.', time: '2d ago', unread: 0 },
    { id: 't4', from: 'Dr. Ngozi Okafor', org: 'City Women\'s Clinic', avatar: 'NO', avatarBg: '#8b5cf6', online: false, specialty: 'OB/GYN', last: 'Next prenatal visit scheduled for March 20.', time: '3d ago', unread: 0 },
    { id: 't5', from: 'WelliPharmacy', org: 'WelliRecord Pharmacy Network', avatar: 'WP', avatarBg: '#14b8a6', online: true, specialty: 'Pharmacy', last: 'Your Lisinopril refill is ready for pickup.', time: '5d ago', unread: 0 },
];

const INITIAL_MSGS: Record<string, Message[]> = {
    t1: [
        { id: 'm1', mine: false, text: 'Good morning! I have reviewed your latest blood pressure readings from WelliRecord. The trend looks improved.', time: '9:00 AM', status: 'read' },
        { id: 'm2', mine: true, text: 'Good morning, Doctor! Yes, the Lisinopril dosage adjustment seems to be working. I\'ve been consistent with it.', time: '9:15 AM', status: 'read' },
        {
            id: 'm3', mine: false, time: '9:20 AM',
            card: { title: 'Blood Pressure Reading', value: '128/82 mmHg', date: 'Mar 2, 2026', color: '#ef4444', icon: <Beaker size={16} /> },
        },
        { id: 'm4', mine: false, text: 'This reading is within acceptable range. Please continue the Lisinopril 10mg and come in for a follow-up in 4 weeks. I\'ll add to your care plan now.', time: '9:32 AM' },
        { id: 'm5', mine: true, text: 'Understood, thank you! Should I also monitor my sodium intake?', time: '9:35 AM', status: 'read' },
        { id: 'm6', mine: false, text: 'Yes — aim for under 2g of sodium per day. I\'ve added a dietary note to your WelliRecord.', time: '9:40 AM' },
    ],
    t2: [
        { id: 'm1', mine: false, text: 'Your thyroid panel results are now available in your Health Vault.', time: 'Yesterday' },
        {
            id: 'm2', mine: false, time: 'Yesterday',
            card: { title: 'Thyroid Panel (TSH)', value: '2.4 mIU/L — Normal', date: 'Mar 2, 2026', color: '#0ea5e9', icon: <FlaskConical size={16} /> },
        },
        { id: 'm3', mine: false, text: 'All values are within the normal reference range. Your doctor has been notified. No action required at this time.', time: 'Yesterday' },
    ],
    t3: [
        { id: 'm1', mine: false, text: 'Hi! Just checking in before your next consultation. Have you been logging your blood glucose readings?', time: 'Mon' },
        { id: 'm2', mine: true, text: 'Yes, I\'ve been logging twice daily. The fasting readings have been improving.', time: 'Mon', status: 'read' },
        { id: 'm3', mine: false, text: 'That\'s great progress! Remember to log your post-meal readings too. See you on Thursday.', time: 'Mon' },
    ],
    t4: [
        { id: 'm1', mine: false, text: 'Just a reminder that your next prenatal visit is scheduled for March 20 at 11:00 AM.', time: 'Tue' },
        { id: 'm2', mine: true, text: 'Thank you! I\'ll be there. Should I take any tests beforehand?', time: 'Tue', status: 'delivered' },
        { id: 'm3', mine: false, text: 'Please do a urine test and bring your blood pressure log. I\'ve added a checklist to your WelliRecord.', time: 'Tue' },
    ],
    t5: [
        { id: 'm1', mine: false, text: 'Your Lisinopril 10mg refill (30 tablets) is ready for pickup at WelliPharmacy Victoria Island branch.', time: 'Thu' },
        { id: 'm2', mine: true, text: 'Great, I\'ll pick it up today after work. Thank you!', time: 'Thu', status: 'read' },
    ],
};

const AI_SUMMARIES: Record<string, { summary: string; actions: string[] }> = {
    t1: {
        summary: 'Conversation with Dr. Fatima Aliyu (Cardiologist) regarding blood pressure management. Patient reported improvement on Lisinopril 10mg. Latest BP reading was 128/82 mmHg — within acceptable range.',
        actions: ['Follow-up appointment in 4 weeks', 'Continue Lisinopril 10mg daily', 'Limit sodium intake to under 2g/day'],
    },
    t2: {
        summary: 'CityLab Diagnostics shared thyroid panel results (TSH: 2.4 mIU/L). All values are within normal range. No clinical action required.',
        actions: ['Results filed in Health Vault', 'Attending physician notified'],
    },
    t3: {
        summary: 'Dr. Sola Martins (GP) checking in on blood glucose logging ahead of a Thursday consultation. Patient confirms improved fasting readings.',
        actions: ['Log post-meal blood glucose readings', 'Consultation on Thursday'],
    },
    t4: {
        summary: 'Dr. Ngozi Okafor (OB/GYN) sent a reminder for the March 20 prenatal visit at 11:00 AM.',
        actions: ['Urine test before visit', 'Bring blood pressure log', 'Prenatal checklist added to WelliRecord'],
    },
    t5: {
        summary: 'WelliPharmacy confirmed Lisinopril 10mg refill (30 tablets) is ready at Victoria Island branch.',
        actions: ['Pickup at Victoria Island WelliPharmacy'],
    },
};

/* ─── Sub-components ─────────────────────────────────────────────────── */
function StatusIcon({ status }: { status?: MsgStatus }) {
    if (!status) return null;
    if (status === 'read') return <CheckCheck size={11} className="ml-1 inline-block" style={{ color: '#86efac' }} />;
    if (status === 'delivered') return <CheckCheck size={11} className="ml-1 inline-block opacity-50" />;
    return <Check size={11} className="ml-1 inline-block opacity-50" />;
}

function RecordCardBubble({ card }: { card: RecordCard }) {
    return (
        <div className="max-w-xs rounded-2xl overflow-hidden border-l-4 shadow-sm"
            style={{ background: 'white', borderLeftColor: card.color, borderTop: `1px solid ${card.color}20`, borderRight: `1px solid ${card.color}20`, borderBottom: `1px solid ${card.color}20` }}>
            <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: card.color }}>{card.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: card.color }}>{card.title}</span>
                </div>
                <div className="font-black text-lg leading-tight" style={{ color: '#1a2e1e' }}>{card.value}</div>
                <div className="text-[10px] mt-1" style={{ color: '#9ca3af' }}>📅 {card.date} · Shared via WelliRecord</div>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#f3f4f6' }}>
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full"
                            style={{ background: '#9ca3af', animation: `bounce 1s infinite ${i * 0.2}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function AISummaryPanel({ threadId, onClose }: { threadId: string; onClose: () => void }) {
    const data = AI_SUMMARIES[threadId];
    if (!data) return null;
    return (
        <div className="border-b" style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderColor: '#c4b5fd' }}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <Brain size={16} style={{ color: '#7c3aed' }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#5b21b6' }}>WelliMate AI Summary</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#7c3aed', color: 'white' }}>LIVE</span>
                    </div>
                    <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-purple-100 flex items-center justify-center">
                        <X size={12} style={{ color: '#7c3aed' }} />
                    </button>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#4c1d95' }}>{data.summary}</p>
                {data.actions.length > 0 && (
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6d28d9' }}>Action Items</div>
                        <div className="space-y-1">
                            {data.actions.map((a, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#4c1d95' }}>
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black"
                                        style={{ background: '#7c3aed', color: 'white' }}>{i + 1}</div>
                                    {a}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ComposerToolbar({ onAttach }: { onAttach: (type: string) => void }) {
    const tools = [
        { icon: <Microscope size={15} />, label: 'Attach Record', sub: 'From Health Vault', key: 'record', color: '#1a6b42' },
        { icon: <FlaskConical size={15} />, label: 'Share Lab Result', sub: 'Latest results', key: 'lab', color: '#0ea5e9' },
        { icon: <Image size={15} />, label: 'Send Photo', sub: 'Wound / Rx photo', key: 'photo', color: '#f59e0b' },
        { icon: <Pill size={15} />, label: 'Request Refill', sub: 'Current medications', key: 'refill', color: '#8b5cf6' },
        { icon: <FileText size={15} />, label: 'Attach File', sub: 'PDF, DICOM…', key: 'file', color: '#6b7280' },
    ];
    return (
        <div className="flex items-center gap-1 px-3 py-2 border-b" style={{ borderColor: 'var(--pat-border)', background: '#fafafa' }}>
            {tools.map(t => (
                <button key={t.key}
                    onClick={() => onAttach(t.key)}
                    title={`${t.label} — ${t.sub}`}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white hover:shadow-sm"
                    style={{ color: '#6b7280' }}>
                    <span style={{ color: t.color }}>{t.icon}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                </button>
            ))}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function MessagesPage() {
    const [activeId, setActiveId] = useState('t1');
    const [allMsgs, setAllMsgs] = useState(INITIAL_MSGS);
    const [draft, setDraft] = useState('');
    const [showAI, setShowAI] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [search, setSearch] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activeThread = THREADS.find(t => t.id === activeId)!;
    const msgs = allMsgs[activeId] ?? [];

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, isTyping]);

    // Simulate typing indicator on thread switch
    useEffect(() => {
        if (activeId === 't1') {
            const t = setTimeout(() => setIsTyping(true), 1200);
            const t2 = setTimeout(() => setIsTyping(false), 4000);
            return () => { clearTimeout(t); clearTimeout(t2); };
        } else {
            setIsTyping(false);
        }
    }, [activeId]);

    const send = () => {
        if (!draft.trim()) return;
        const newMsg: Message = { id: `m${Date.now()}`, mine: true, text: draft, time: 'Just now', status: 'sent' };
        setAllMsgs(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newMsg] }));
        setDraft('');
        inputRef.current?.focus();
        // Simulate delivery
        setTimeout(() => {
            setAllMsgs(prev => ({
                ...prev,
                [activeId]: prev[activeId].map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m),
            }));
        }, 900);
        setTimeout(() => {
            setAllMsgs(prev => ({
                ...prev,
                [activeId]: prev[activeId].map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m),
            }));
        }, 2200);
    };

    const attachQuickCard = (type: string) => {
        const cardMap: Record<string, RecordCard> = {
            record: { title: 'WelliRecord Snapshot', value: 'Full Health Summary', date: 'Mar 3, 2026', color: '#1a6b42', icon: <Microscope size={16} /> },
            lab: { title: 'Latest Lab Result (HbA1c)', value: '7.2% — Borderline', date: 'Feb 28, 2026', color: '#0ea5e9', icon: <FlaskConical size={16} /> },
            refill: { title: 'Prescription Refill Request', value: 'Lisinopril 10mg × 30', date: 'Mar 3, 2026', color: '#8b5cf6', icon: <Pill size={16} /> },
        };
        if (cardMap[type]) {
            const newMsg: Message = { id: `m${Date.now()}`, mine: true, time: 'Just now', status: 'sent', card: cardMap[type] };
            setAllMsgs(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newMsg] }));
        }
    };

    const filteredThreads = THREADS.filter(t =>
        t.from.toLowerCase().includes(search.toLowerCase()) ||
        t.specialty.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 120px)', minHeight: 500 }}>
            {/* Page header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#1a2e1e' }}>Messages</h1>
                    <p className="text-sm" style={{ color: '#5a7a63' }}>Communicate securely with your care team</p>
                </div>
            </div>

            {/* Two-panel layout */}
            <div className="flex flex-1 overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: '#e5e7eb', background: 'white' }}>

                {/* ── Left: Thread list ── */}
                <div className="w-72 border-r flex flex-col flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
                    {/* Search */}
                    <div className="p-3 border-b" style={{ borderColor: '#e5e7eb' }}>
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="input input-light text-xs w-full" style={{ paddingLeft: '2rem' }}
                                placeholder="Search conversations…" />
                        </div>
                    </div>

                    {/* Threads */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredThreads.map(t => (
                            <button key={t.id} onClick={() => { setActiveId(t.id); setShowAI(false); }}
                                className="w-full flex items-start gap-3 px-4 py-3.5 text-left border-b transition-colors"
                                style={{ borderColor: '#f3f4f6', background: activeId === t.id ? 'rgba(26,107,66,.06)' : 'white' }}>
                                {/* Avatar + online dot */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white"
                                        style={{ background: t.avatarBg }}>{t.avatar}</div>
                                    {t.online && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                                            style={{ background: '#22c55e' }} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-xs truncate" style={{ color: '#1a2e1e' }}>{t.from}</span>
                                        <span className="text-[10px] flex-shrink-0" style={{ color: '#9ca3af' }}>{t.time}</span>
                                    </div>
                                    <div className="text-[10px] font-medium mb-0.5" style={{ color: '#9ca3af' }}>{t.specialty}</div>
                                    <div className="text-xs truncate" style={{ color: '#6b7280' }}>{t.last}</div>
                                </div>
                                {t.unread > 0 && (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-1"
                                        style={{ background: '#1a6b42' }}>{t.unread}</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Right: Chat area ── */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Thread header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0"
                        style={{ borderColor: '#e5e7eb' }}>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ background: activeThread.avatarBg }}>{activeThread.avatar}</div>
                                {activeThread.online && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                                        style={{ background: '#22c55e' }} />
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-sm" style={{ color: '#1a2e1e' }}>{activeThread.from}</div>
                                <div className="text-xs" style={{ color: '#9ca3af' }}>
                                    {activeThread.org} · {activeThread.online
                                        ? <span style={{ color: '#22c55e' }}>● Online</span>
                                        : 'Offline'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAI(a => !a)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                style={{ background: showAI ? '#7c3aed' : '#f5f3ff', color: showAI ? 'white' : '#7c3aed' }}>
                                <Brain size={13} />
                                <Sparkles size={11} />
                                AI Summary
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                                <Phone size={15} style={{ color: '#6b7280' }} />
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                                <Video size={15} style={{ color: '#6b7280' }} />
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                                <MoreVertical size={15} style={{ color: '#6b7280' }} />
                            </button>
                        </div>
                    </div>

                    {/* AI Summary Panel */}
                    {showAI && <AISummaryPanel threadId={activeId} onClose={() => setShowAI(false)} />}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: '#fafafa' }}>
                        {msgs.map(m => (
                            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                                {m.card ? (
                                    /* Record card message */
                                    <div className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'} gap-1`}>
                                        {!m.mine && (
                                            <span className="text-[10px] px-1" style={{ color: '#9ca3af' }}>{activeThread.from}</span>
                                        )}
                                        <RecordCardBubble card={m.card} />
                                        <div className="flex items-center gap-1 text-[10px] px-1" style={{ color: '#9ca3af' }}>
                                            {m.time}
                                            {m.mine && <StatusIcon status={m.status} />}
                                        </div>
                                    </div>
                                ) : (
                                    /* Text message */
                                    <div className={`flex flex-col max-w-sm ${m.mine ? 'items-end' : 'items-start'} gap-0.5`}>
                                        {!m.mine && (
                                            <span className="text-[10px] px-1" style={{ color: '#9ca3af' }}>{activeThread.from}</span>
                                        )}
                                        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                            style={{
                                                background: m.mine ? '#1a6b42' : 'white',
                                                color: m.mine ? '#fff' : '#1a2e1e',
                                                borderBottomRightRadius: m.mine ? 4 : undefined,
                                                borderBottomLeftRadius: !m.mine ? 4 : undefined,
                                                border: m.mine ? 'none' : '1px solid #e5e7eb',
                                            }}>
                                            {m.text}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] px-1" style={{ color: '#9ca3af' }}>
                                            {m.time}
                                            {m.mine && <StatusIcon status={m.status} />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] px-1" style={{ color: '#9ca3af' }}>
                                    {activeThread.from} is typing…
                                </span>
                                <TypingIndicator />
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Composer toolbar */}
                    <div className="flex-shrink-0 border-t" style={{ borderColor: '#e5e7eb' }}>
                        <ComposerToolbar onAttach={attachQuickCard} />

                        {/* Input row */}
                        <div className="flex items-center gap-2 px-3 py-3">
                            <input
                                ref={inputRef}
                                value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-green-500"
                                style={{ borderColor: '#e5e7eb', background: 'white', color: '#1a2e1e' }}
                                placeholder="Type a message… (Enter to send)" />
                            <button
                                onClick={send}
                                disabled={!draft.trim()}
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                                style={{ background: draft.trim() ? '#1a6b42' : '#e5e7eb' }}>
                                <Send size={16} style={{ color: draft.trim() ? 'white' : '#9ca3af' }} />
                            </button>
                        </div>

                        {/* HIPAA notice */}
                        <div className="px-4 pb-2 text-[10px] text-center" style={{ color: '#d1d5db' }}>
                            🔒 End-to-end encrypted · Logged to WelliChain · HIPAA-compliant
                        </div>
                    </div>
                </div>
            </div>

            {/* Bounce keyframe for typing dots */}
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}
