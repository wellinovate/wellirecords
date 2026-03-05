/**
 * WelliMate AI Widget
 * Voice-first, AI-enabled health companion for Nigeria & Africa.
 *
 * What WelliMate Solves:
 *  • Paper-based, fragmented, missing health records → auto voice-to-EHR
 *  • Clinician documentation overload → real-time transcription & SOAP
 *  • Language, literacy & access barriers → multi-language voice input
 *  • Telemedicine without documentation → structured call summaries
 *  • Rural/low-resource environments → offline-first, low-bandwidth
 *  • Ward rounds with missing files → portable voice-captured records
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { useWelliMate } from '@/shared/context/WelliMateContext';
import { WelliMateConnect } from './WelliMateConnect';
import {
    Mic, MicOff, X, ExternalLink, Crown, Sparkles, Send,
    Globe, Activity, Calendar, Pill, FileText, Stethoscope,
    ClipboardList, Languages, AlertTriangle, ShieldCheck,
    WifiOff, Wifi, Zap, Users, Radio, BookOpen, CheckCircle,
    MapPin, Phone, UserPlus
} from 'lucide-react';

// ─── Language Support ────────────────────────────────────────────────────────
const PATIENT_LANGS = ['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin', 'Fulfulde', 'French'];
const PROVIDER_LANGS = ['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin', 'French', 'Swahili'];

// ─── Patient Quick Actions ────────────────────────────────────────────────────
const PATIENT_ACTIONS = [
    {
        id: 'symptom', label: 'Symptom Check', icon: Activity, color: '#dc6027',
        response:
            `🎙️ I'm ready to listen. Speak in any language — English, Hausa, Yoruba, Igbo, or Pidgin.

Tell me how you are feeling: what started, when it began, how severe, and where in your body.

I will interpret your symptoms and recommend whether you need urgent care, a routine appointment, or can manage at home. No reading or writing required.`,
    },
    {
        id: 'med', label: 'Med Reminder', icon: Pill, color: '#d97706',
        response:
            `💊 Your active medications (from WelliRecord):

• **Artemether-Lumefantrine** — 6-dose course, next dose 8:00 PM
• **Metformin 500mg** — Twice daily, last taken 7:00 AM ✅
• **ORS Sachets** — As needed for hydration

⚠️ Missed doses affect treatment. Say "remind me" in any language and I'll alert you.`,
    },
    {
        id: 'appt', label: 'Book Appt', icon: Calendar, color: '#2563eb',
        response:
            `📅 Facilities near you (Lagos):

• **Mercy Outpatient Clinic** — Tomorrow 10:00 AM · 2.4 km · ₦15k est.
• **City General OPD** — Wed 9:00 AM · 5.1 km · NHIS accepted
• **WelliDoc Telemedicine** — Today 4:00 PM · Video Call · No travel

Which would you prefer? Say the name or tap. I'll confirm and add it to your WelliRecord.`,
    },
    {
        id: 'simplify', label: 'Explain My Results', icon: BookOpen, color: '#7c3aed',
        response:
            `📄 I can explain your lab results, prescriptions, or clinical notes in plain language — in English, Hausa, Yoruba, Igbo, or Pidgin.

No medical jargon. I'll tell you exactly what your doctor found, what it means, and what you should do next.

Tap the microphone and read out what's on your paper — or type it here.`,
    },
] as const;

// ─── Provider Quick Actions ───────────────────────────────────────────────────
const PROVIDER_ACTIONS = [
    {
        id: 'connect', label: 'Connect Patient', icon: UserPlus, color: '#22d3ee',
        response: '__CONNECT__', // handled specially
    },
    {
        id: 'round', label: 'Ward Round', icon: Radio, color: '#0ea5e9',
        response:
            `🏥 **Ward Round Mode** — No files needed. I am your portable record.

Speak your bedside findings as you walk the ward. I'll capture complaints, vitals, assessment, and plan for each patient — structured, secure, and instantly synced to WelliRecord.

Say *"Next patient, Bed 4"* to switch. Say *"End round"* to close.`,
    },
    {
        id: 'consult', label: 'Consultation', icon: Stethoscope, color: '#10b981',
        response:
            `🩺 **Consultation Mode** — Recording this interaction.

I'm listening to your one-on-one consultation. I'll produce a full SOAP note — no typing required. Supports English, Hausa, Yoruba, Igbo, and Pidgin.

If the patient speaks a different language from you, enable **Interpreter Mode** so I can bridge the gap in real time.`,
    },
    {
        id: 'interpret', label: 'Interpreter', icon: Languages, color: '#8b5cf6',
        response:
            `🌍 **Real-Time Interpretation Mode**

Select languages:
• **Provider speaks:** English
• **Patient speaks:** Hausa / Yoruba / Igbo / Pidgin

I'll relay each side's words in the other language — bridging language barriers in consultations, ward rounds, and telemedicine calls.

This is documented automatically to WelliRecord.`,
    },
    {
        id: 'telemedicine', label: 'Teleconsult', icon: Phone, color: '#06b6d4',
        response:
            `📲 **Telemedicine Documentation Mode**

I'll automatically capture and structure this telemedicine call into:
• Chief complaint
• History & background
• Clinical assessment
• Prescription or referral plan

The final note is sent to both the patient's WelliRecord and your facility system. No call goes undocumented.`,
    },
    {
        id: 'soap', label: 'SOAP Note', icon: ClipboardList, color: '#f59e0b',
        response:
            `📝 **SOAP Note Generation**

Tap the microphone and dictate your findings. I'll structure them as:

**S** · Patient complaint in their words
**O** · Vitals, exam, lab results
**A** · Diagnosis / differential
**P** · Treatment, prescriptions, referrals, follow-up

Review and tap ✅ **Approve** to save to WelliRecord.`,
    },
    {
        id: 'risk', label: 'Risk Screen', icon: AlertTriangle, color: '#ef4444',
        response:
            `🔍 **AI Clinical Risk Screening**

Screening for high-burden African disease patterns:
• Malaria / Typhoid fever indicators
• Sepsis early warning signs
• Hypertension & diabetes red flags
• Drug interaction alerts

Open a patient record to run a full personalised screen.`,
    },
] as const;

// ─── Simulated AI replies ─────────────────────────────────────────────────────

// PATIENT: Companion tone — reassuring, simple, action-focused
const PATIENT_VOICE_REPLY =
    `From what you described — evening fever, body aches, headache, and feeling weak — this pattern can be seen in **malaria**, which is common in Lagos.

⚠️ This is not a confirmed diagnosis. A quick test is needed.

**What you should do next:**
1️⃣ Visit a clinic today for a Rapid Diagnostic Test (RDT) — it takes about 15 minutes
2️⃣ Avoid taking leftover malaria drugs — treatment depends on your test result
3️⃣ Drink plenty of fluids and get some rest

📍 Nearest open clinic:
**Mercy Outpatient Clinic** · 2.4 km · Open Now

Tap **Book Appt** or call ahead.

🔐 I've securely saved your symptoms in your WelliRecord so any doctor can see them.

I'm here if you'd like help booking or tracking how you feel.`;

// PROVIDER: Clinical decision support — structured, precise, documentation-ready
const PROVIDER_VOICE_REPLY =
    `🔵 **WelliMate AI — Clinical Summary**

**Patient-Reported Symptoms (Voice Input):**
• Evening pyrexia
• Generalised body aches
• Headache
• Fatigue
• Duration: Since yesterday

**Preliminary Pattern Recognition:**
Symptom cluster is consistent with **acute uncomplicated malaria** (endemic region: Lagos).

**Recommended Next Steps:**
• Perform Malaria RDT immediately
• If positive → initiate ACT per national guideline
• If negative → evaluate for: Typhoid · Viral febrile illness · COVID/Influenza (if indicated)

**Risk Flags:**
No severe symptoms reported (no vomiting, no altered consciousness, no respiratory distress). Monitor for progression.

📊 This encounter summary has been auto-drafted for documentation.
You may edit before finalising.

🔐 Stored in patient WelliRecord (timestamped). Tap ✅ **Approve & Save** to finalise.`;

type Msg = { role: 'ai' | 'user'; text: string; time: string };
function tstamp() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// ─── Main Component ───────────────────────────────────────────────────────────
export function WelliMateWidget() {
    const { user } = useAuth();
    const { isWelliMateEnabled } = useWelliMate();

    const isProvider = user?.userType === 'ORG_USER';
    const firstName = user?.name?.split(' ')[0] ?? 'there';
    const langs = isProvider ? PROVIDER_LANGS : PATIENT_LANGS;
    const actions = isProvider ? PROVIDER_ACTIONS : PATIENT_ACTIONS;

    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [lang, setLang] = useState('English');
    const [input, setInput] = useState('');
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [listenSec, setListenSec] = useState(0);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [activeMode, setActiveMode] = useState<string | null>(null);
    const [showConnect, setShowConnect] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Design tokens
    const provGrad = 'linear-gradient(135deg,#07284f 0%,#135090 55%,#0ea5e9 100%)';
    const patGrad = 'linear-gradient(135deg,#052e16 0%,#14532d 55%,#16a34a 100%)';
    const grad = isProvider ? provGrad : patGrad;
    const acc = isProvider ? '#38bdf8' : '#22c55e';
    const accDim = isProvider ? 'rgba(56,189,248,.15)' : 'rgba(34,197,94,.15)';
    const surfBg = isProvider ? '#0b1a2d' : '#ffffff';
    const surf2 = isProvider ? '#0d2137' : '#f0fdf4';
    const bord = isProvider ? 'rgba(56,189,248,.18)' : 'rgba(34,197,94,.18)';
    const txt = isProvider ? '#cce4f7' : '#1a3a23';
    const muted = isProvider ? '#6b9cbf' : '#3d6b50';
    const aiBub = isProvider ? { bg: 'rgba(14,165,233,.12)', clr: '#bde0f4' } : { bg: '#dcfce7', clr: '#14532d' };

    const welcomeText = isProvider
        ? `Hello Dr. ${firstName}. How can I help you regarding your patient today?\n\nI am WelliMate — your clinical AI companion. I listen to ward rounds, bedside consultations, and telemedicine calls, then produce structured documentation ready for your review.\n\nSpeak naturally. I handle the rest — interpretation, transcription, SOAP notes, and WelliRecord sync.`
        : `Hello ${firstName}. How can I help you regarding your health today?\n\nI am WelliMate — your personal health companion. I understand English, Hausa, Yoruba, Igbo, and Pidgin. I hold your health records securely so they follow you to every clinic, hospital, or doctor — even if you lose your paper card.`;

    // Online/offline detection
    useEffect(() => {
        const on = () => setIsOffline(false);
        const off = () => setIsOffline(true);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    useEffect(() => {
        if (isOpen && msgs.length === 0) setMsgs([{ role: 'ai', text: welcomeText, time: tstamp() }]);
    }, [isOpen]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, isTyping]);

    useEffect(() => {
        if (isListening) {
            setListenSec(0);
            timerRef.current = setInterval(() => setListenSec(s => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isListening]);

    if (!isWelliMateEnabled) return null;

    const aiReply = (text: string, delay = 1600) => {
        setIsTyping(true);
        setTimeout(() => { setIsTyping(false); setMsgs(p => [...p, { role: 'ai', text, time: tstamp() }]); }, delay);
    };

    const handleSend = () => {
        const t = input.trim();
        if (!t) return;
        setMsgs(p => [...p, { role: 'user', text: t, time: tstamp() }]);
        setInput('');
        aiReply(isProvider
            ? `Input received and logged.\n\nFor structured clinical documentation, tap the microphone to dictate — I will produce a SOAP note, risk summary, or referral draft ready for your review.\n\n📊 All entries are auto-drafted for documentation and stored in the patient's WelliRecord (timestamped).`
            : `Thank you for sharing that. I've noted what you said.\n\nFor a full assessment, tap **Symptom Check** and speak to me in any language — English, Hausa, Yoruba, Igbo, or Pidgin. No reading or writing required.\n\n🔐 Your health record is always safe with WelliMate.`);
    };

    const handleAction = (action: typeof actions[number]) => {
        if (action.response === '__CONNECT__') {
            setShowConnect(true);
            return;
        }
        setActiveMode(action.id);
        setMsgs(p => [...p, { role: 'user', text: action.label, time: tstamp() }]);
        aiReply(action.response);
    };

    const toggleListen = () => {
        if (isListening) {
            setIsListening(false);
            setActiveMode(null);
            const sample = isProvider
                ? `🎤 "Patient in Bed 12, 34-year-old male, three-day fever, chills, headache. Temperature 38.7, BP 110 over 70. Malaria RDT positive. Starting artemether-lumefantrine."`
                : `🎤 "Since yesterday I dey feel say my body dey hot for night, head dey pain me, and I weak well well."`;
            setMsgs(p => [...p, { role: 'user', text: sample, time: tstamp() }]);
            aiReply(isProvider ? PROVIDER_VOICE_REPLY : PATIENT_VOICE_REPLY, 2000);
        } else {
            setIsListening(true);
            setMsgs(p => [...p, {
                role: 'ai',
                text: `🎙️ Listening in **${lang}**...\n\nSpeak naturally — describe symptoms, findings, or ask a question. I'll capture everything. Say "stop" or tap again when done.`,
                time: tstamp()
            }]);
        }
    };

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // Render **bold** markdown in text
    function renderText(text: string) {
        return text.split('\n').map((line, i, arr) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <React.Fragment key={i}>
                    {parts.map((part, j) => j % 2 === 1 ? <strong key={j} style={{ fontWeight: 700 }}>{part}</strong> : part)}
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            );
        });
    }

    const colsCount = isProvider ? 3 : 4;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" style={{ fontFamily: 'Inter,system-ui,sans-serif' }}>

            {/* ════════════ CONNECT PANEL (providers only) ════════════ */}
            {isOpen && isProvider && showConnect && (
                <WelliMateConnect onClose={() => setShowConnect(false)} />
            )}

            {/* ════════════ MAIN PANEL ════════════ */}
            {isOpen && !showConnect && (
                <div
                    className="mb-3 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        width: 'clamp(310px,90vw,420px)',
                        height: 640,
                        background: surfBg,
                        border: `1.5px solid ${bord}`,
                        animation: 'slideUpFade .22s cubic-bezier(.22,1,.36,1)',
                    }}
                >
                    {/* ── Header ── */}
                    <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0 text-white" style={{ background: grad }}>
                        {/* Pulse orb */}
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full animate-ping bg-white/15"
                                style={{ animationDuration: '2.2s' }} />
                            <div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Mic size={18} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-[13px] tracking-tight">WelliMate AI</span>
                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full">
                                    <Crown size={8} /> PRO
                                </span>
                                {isOffline ? (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-orange-400/20 text-orange-200 font-bold px-1.5 py-0.5 rounded-full border border-orange-400/30">
                                        <WifiOff size={8} /> Offline Mode
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-green-400/20 text-green-200 font-bold px-1.5 py-0.5 rounded-full">
                                        <Wifi size={8} /> Synced
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] opacity-65 mt-0.5 truncate">
                                {isProvider
                                    ? 'Clinical AI · Decision Support · Documentation'
                                    : 'Your Health Companion · Private & Secure'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a href="https://www.wellimate.com/" target="_blank" rel="noopener noreferrer"
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 whitespace-nowrap">
                                <ExternalLink size={9} /> Profile
                            </a>
                            <button onClick={() => setIsOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* ── Offline notice ── */}
                    {isOffline && (
                        <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0"
                            style={{ background: 'rgba(251,146,60,.1)', borderBottom: '1px solid rgba(251,146,60,.2)' }}>
                            <Zap size={12} className="text-orange-400 flex-shrink-0" />
                            <p className="text-[10px] font-semibold text-orange-300 leading-tight">
                                Offline — voice capture continues. Records sync automatically when connection returns.
                            </p>
                        </div>
                    )}

                    {/* ── Language selector ── */}
                    <div className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0 overflow-x-auto"
                        style={{ background: isProvider ? 'rgba(14,165,233,.06)' : 'rgba(34,197,94,.06)', borderBottom: `1px solid ${bord}`, scrollbarWidth: 'none' }}>
                        <Globe size={11} style={{ color: muted, flexShrink: 0 }} />
                        {langs.map(l => (
                            <button key={l} onClick={() => setLang(l)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap flex-shrink-0"
                                style={{
                                    background: lang === l ? acc : 'transparent',
                                    color: lang === l ? '#fff' : muted,
                                    border: `1px solid ${lang === l ? acc : 'transparent'}`,
                                }}>
                                {l}
                            </button>
                        ))}
                    </div>

                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: surf2 }}>
                        {msgs.map((m, i) => (
                            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {m.role === 'ai' && (
                                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 flex-none"
                                        style={{ background: grad }}>
                                        <Sparkles size={12} color="#fff" />
                                    </div>
                                )}
                                <div className="max-w-[82%]">
                                    <div className="px-3 py-2.5 text-[11.5px] leading-relaxed"
                                        style={m.role === 'ai'
                                            ? { background: aiBub.bg, color: aiBub.clr, borderRadius: '4px 16px 16px 16px' }
                                            : { background: acc, color: '#fff', borderRadius: '16px 4px 16px 16px' }
                                        }>
                                        {renderText(m.text)}
                                    </div>
                                    <div className="text-[9px] mt-0.5 px-1" style={{ color: muted }}>{m.time}</div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-2 items-end">
                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: grad }}>
                                    <Sparkles size={12} color="#fff" />
                                </div>
                                <div className="px-3 py-2.5 rounded-2xl flex items-center gap-1" style={{ background: aiBub.bg, borderRadius: '4px 16px 16px 16px' }}>
                                    {[0, 1, 2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: acc, animationDelay: `${d * .15}s` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* ── Quick actions ── */}
                    <div className="px-3 pt-2.5 pb-2 flex-shrink-0" style={{ background: surfBg, borderTop: `1px solid ${bord}` }}>
                        {/* Provider: Connect Patient — featured row */}
                        {isProvider && (
                            <button
                                onClick={() => handleAction(PROVIDER_ACTIONS[0])}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 transition-all hover:scale-[1.02] active:scale-95"
                                style={{ background: 'rgba(34,211,238,0.12)', border: '1.5px solid rgba(34,211,238,0.35)' }}
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,211,238,0.2)' }}>
                                    <UserPlus size={15} color="#22d3ee" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[11px] font-black" style={{ color: '#22d3ee' }}>Connect Patient</p>
                                    <p className="text-[9px]" style={{ color: '#6b9cbf' }}>Link WelliMate ID · Interpret · Auto-document to WelliRecord</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                            </button>
                        )}
                        {/* Grid of remaining actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: isProvider ? 'repeat(3,1fr)' : 'repeat(4,1fr)', gap: 6 }}>
                            {actions.filter(a => a.id !== 'connect').map(a => (
                                <button key={a.id} onClick={() => handleAction(a)}
                                    className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all hover:scale-105 active:scale-95"
                                    style={{
                                        border: `1px solid ${a.color}35`,
                                        background: activeMode === a.id ? `${a.color}25` : `${a.color}0f`,
                                    }}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}22` }}>
                                        {activeMode === a.id
                                            ? <CheckCircle size={13} color={a.color} />
                                            : <a.icon size={13} color={a.color} />}
                                    </div>
                                    <span className="text-[9px] font-bold text-center leading-tight" style={{ color: a.color }}>
                                        {a.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Listening waveform ── */}
                    {isListening && (
                        <div className="mx-3 mb-2 px-3 py-2 rounded-xl flex items-center gap-3 flex-shrink-0"
                            style={{ background: 'rgba(239,68,68,.08)', border: '1.5px solid rgba(239,68,68,.3)' }}>
                            <div className="flex gap-0.5 items-end h-5 flex-shrink-0">
                                {[2, 4, 7, 5, 9, 6, 8, 3, 6, 5].map((h, i) => (
                                    <div key={i} className="w-[3px] rounded-full bg-red-500 animate-bounce"
                                        style={{ height: h * 2.2, animationDelay: `${i * 0.07}s`, animationDuration: '.6s' }} />
                                ))}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-red-400">Listening · {lang}</p>
                                <p className="text-[9px] text-red-300 opacity-80">Recording {fmt(listenSec)} · Tap mic to stop</p>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-red-400 flex-shrink-0">{fmt(listenSec)}</div>
                        </div>
                    )}

                    {/* ── Input + Voice ── */}
                    <div className="px-3 pb-3 pt-1 flex-shrink-0" style={{ background: surfBg }}>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center rounded-xl border px-3 py-2 gap-2"
                                style={{ borderColor: bord, background: surf2 }}>
                                <input
                                    type="text" value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder={isListening
                                        ? `Recording in ${lang}...`
                                        : isProvider
                                            ? 'Dictate or type clinical notes...'
                                            : 'Ask in any language...'}
                                    className="flex-1 bg-transparent text-[12px] outline-none"
                                    style={{ color: txt }}
                                />
                                <button onClick={handleSend} style={{ color: acc, opacity: input.trim() ? 1 : 0.3 }}>
                                    <Send size={14} />
                                </button>
                            </div>
                            {/* ── Voice button ── */}
                            <button
                                onClick={toggleListen}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                                title={isListening ? 'Stop recording' : `Speak in ${lang}`}
                                style={{
                                    background: isListening
                                        ? 'linear-gradient(135deg,#b91c1c,#ef4444)'
                                        : grad,
                                    color: '#fff',
                                    boxShadow: isListening
                                        ? '0 0 0 5px rgba(239,68,68,.25),0 8px 24px rgba(0,0,0,.3)'
                                        : `0 0 0 4px ${accDim},0 8px 24px rgba(0,0,0,.25)`,
                                }}>
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        </div>

                        {/* Footer strip */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5" style={{ color: muted }}>
                                <ShieldCheck size={10} />
                                <span className="text-[9px] font-medium">
                                    {isProvider
                                        ? 'HIPAA-grade clinical encryption · WelliRecord EHR'
                                        : 'End-to-end encrypted · Patient-owned · WelliRecord'}
                                </span>
                            </div>
                            <a href="https://www.wellimate.com/" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-[9px] font-bold hover:underline whitespace-nowrap"
                                style={{ color: acc }}>
                                {isProvider ? 'wellimate.com' : 'Full features'} <ExternalLink size={8} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════ FAB ════════════ */}
            {!isOpen && (
                <div className="relative group">
                    {/* Ambient pulse */}
                    <div className="absolute inset-0 rounded-full animate-ping opacity-25"
                        style={{ background: acc, animationDuration: '2.8s' }} />
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
                        style={{ background: grad, boxShadow: `0 8px 28px ${accDim}` }}
                        aria-label="Open WelliMate AI"
                    >
                        <Mic size={24} />
                        {/* PRO crown */}
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow border-2 border-white">
                            <Crown size={9} color="#92400e" />
                        </span>
                        {/* Online/offline dot */}
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white"
                            style={{ background: isOffline ? '#f97316' : '#22c55e' }} />
                    </button>

                    {/* Rich tooltip */}
                    <div className="absolute right-full mr-3 bottom-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-3.5 py-3 min-w-[200px]">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Sparkles size={12} color={acc} />
                                <span className="font-black text-sm text-white">WelliMate AI</span>
                                <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full ml-0.5">PRO</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed mb-2">Voice-first health companion for Nigeria &amp; Africa</p>
                            <div className="space-y-1">
                                {isProvider ? (
                                    <>
                                        <div className="text-[10px] text-gray-300 flex items-center gap-1.5"><Radio size={9} color={acc} /> Ward rounds, no files needed</div>
                                        <div className="text-[10px] text-gray-300 flex items-center gap-1.5"><Languages size={9} color={acc} /> Real-time interpretation</div>
                                        <div className="text-[10px] text-gray-300 flex items-center gap-1.5"><Phone size={9} color={acc} /> Telemedicine documentation</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-[10px] text-gray-300 flex items-center gap-1.5"><Globe size={9} color={acc} /> Hausa, Yoruba, Igbo, Pidgin</div>
                                        <div className="text-[10px] text-gray-300 flex items-center gap-1.5"><ShieldCheck size={9} color={acc} /> Records follow you everywhere</div>
                                        <div className="text-[10px] text-gray-300 flex items-center gap-1.5"><Zap size={9} color={acc} /> Works offline too</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
