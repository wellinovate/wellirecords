/**
 * WelliMate Connect
 * Provider → Patient connection for live interpretation + WelliRecord capture.
 * Use cases: Hospital Admission, Ward Round, Telemedicine, OPD Consultation
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    UserPlus, X, Mic, MicOff, Languages, ShieldCheck, CheckCircle,
    Loader, Link2, Hospital, Video, BedDouble, Stethoscope,
    ChevronRight, ArrowLeftRight, Globe, Sparkles, Crown, Save,
    AlertCircle, Clock
} from 'lucide-react';

// ─── Session types ────────────────────────────────────────────────────────────
const SESSION_TYPES = [
    { id: 'admission', label: 'Hospital Admission', icon: BedDouble, color: '#0ea5e9', desc: 'New or returning inpatient' },
    { id: 'telemedicine', label: 'Telemedicine', icon: Video, color: '#8b5cf6', desc: 'Remote video/audio consult' },
    { id: 'opd', label: 'OPD Consultation', icon: Stethoscope, color: '#10b981', desc: 'Outpatient department visit' },
    { id: 'ward', label: 'Ward Round', icon: Hospital, color: '#f59e0b', desc: 'Bedside clinical visit' },
];

const LANGUAGES = ['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin', 'Fulfulde', 'French', 'Swahili'];

// ─── Simulated transcripts ────────────────────────────────────────────────────
const PATIENT_UTTERANCES = [
    { lang: 'Hausa', original: 'Jikina yana ciwo, kai yana ciwo, ba son ci abinci.', translated: 'My body is in pain, I have a headache and I\'ve lost my appetite.' },
    { lang: 'Yoruba', original: 'Mo ní ìrora nínú ikun mi àti ìgbẹ́ gbuuru.', translated: 'I have stomach pain and diarrhoea since this morning.' },
    { lang: 'Igbo', original: 'Ahụ m ọjọọ, ọ na-ekpo ọkụ n\'ahụ m site n\'abalị.', translated: 'I feel unwell. I\'ve had fever since last night.' },
    { lang: 'Pidgin', original: 'My belle dey do me and I dey feel say my head full.', translated: 'I have abdominal discomfort and a feeling of fullness in my head.' },
];

type Phase = 'idle' | 'connect' | 'connected' | 'session' | 'saved';

type ConvLine = {
    speaker: 'patient' | 'provider' | 'ai';
    original: string;
    translated?: string;
    lang: string;
    time: string;
};

function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

interface Props { onClose: () => void }

export function WelliMateConnect({ onClose }: Props) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [welliId, setWelliId] = useState('');
    const [sessionType, setSessionType] = useState<string | null>(null);
    const [patientLang, setPatientLang] = useState('Hausa');
    const [providerLang] = useState('English');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectedPatient, setConnectedPatient] = useState<{ name: string; id: string; record: string } | null>(null);
    const [conv, setConv] = useState<ConvLine[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [listenSec, setListenSec] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv]);

    useEffect(() => {
        if (isListening) {
            setListenSec(0);
            timerRef.current = setInterval(() => setListenSec(s => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isListening]);

    const handleConnect = () => {
        if (!welliId.trim() || !sessionType) return;
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            setConnectedPatient({ name: 'Mock Patient', id: welliId || 'WM-2024-0049', record: 'WR-NGN-0049' });
            setPhase('connected');
        }, 1800);
    };

    const startSession = () => {
        const type = SESSION_TYPES.find(s => s.id === sessionType);
        setConv([{
            speaker: 'ai', lang: 'System',
            original: `🔗 WelliMate session started — ${type?.label}.\n\nPatient: ${connectedPatient?.name} · ${connectedPatient?.id}\nLanguages: ${patientLang} ↔ ${providerLang}\n\nI am listening and interpreting the conversation in real time. Everything said will be captured and saved to ${connectedPatient?.record}.\n\nSay "start" to begin clinical encounter.`,
            time: now()
        }]);
        setPhase('session');
    };

    const simulatePatientSpeech = () => {
        const utterance = PATIENT_UTTERANCES.find(u => u.lang === patientLang)
            ?? PATIENT_UTTERANCES[0];
        setConv(p => [...p,
        { speaker: 'patient', lang: patientLang, original: `🎤 "${utterance.original}"`, time: now() },
        ]);
        setTimeout(() => {
            setConv(p => [...p, {
                speaker: 'ai', lang: 'WelliMate',
                original: `🌍 **Interpreted to ${providerLang}:**\n"${utterance.translated}"`,
                time: now()
            }]);
        }, 1200);
    };

    const simulateProviderSpeech = () => {
        const lines = [
            { orig: '"How long have you had these symptoms?"', trans: `[Translated to ${patientLang}]: "${patientLang === 'Hausa' ? 'Tsawo nawa ne kuna da waɗannan alamu?' : patientLang === 'Yoruba' ? 'Iye melo ni awọn aami aiṣan wọnyi ti wa?' : patientLang === 'Igbo' ? 'Ole oge nke i nwere ihe ndi a?' : 'How long you don dey feel am so?'}"` }
        ];
        setConv(p => [...p,
        { speaker: 'provider', lang: providerLang, original: `🩺 ${lines[0].orig}`, time: now() },
        ]);
        setTimeout(() => {
            setConv(p => [...p, {
                speaker: 'ai', lang: 'WelliMate',
                original: `🌍 ${lines[0].trans}`,
                time: now()
            }]);
        }, 1000);
    };

    const handleToggleListen = () => {
        if (isListening) {
            setIsListening(false);
            simulatePatientSpeech();
        } else {
            setIsListening(true);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        const summaryNote = `**Session Summary — ${SESSION_TYPES.find(s => s.id === sessionType)?.label}**\nPatient: ${connectedPatient?.name} (${connectedPatient?.id})\nLanguages: ${patientLang} ↔ ${providerLang}\nExchange lines: ${conv.filter(c => c.speaker !== 'ai').length}\n\n**Auto-generated SOAP Note:**\nS: Patient reported symptoms in ${patientLang}. Interpreted in real time.\nO: Clinical findings captured via voice. Vitals pending entry.\nA: Differential pending provider review.\nP: To be completed by clinician. Record auto-saved to ${connectedPatient?.record}.`;

        setTimeout(() => {
            setIsSaving(false);
            setConv(p => [...p, {
                speaker: 'ai', lang: 'System',
                original: `✅ **Session saved to WelliRecord (${connectedPatient?.record})**\n\nThis conversation, interpretation, and SOAP note summary have been securely stored in the patient's health record.\n\nThe patient will see a summary in their WelliMate patient portal.`,
                time: now()
            }]);
            setPhase('saved');
        }, 2000);
    };

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    function renderText(text: string) {
        return text.split('\n').map((line, i, arr) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <React.Fragment key={i}>
                    {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            );
        });
    }

    const provGrad = 'linear-gradient(135deg,#07284f 0%,#135090 55%,#0ea5e9 100%)';

    return (
        <div
            className="mb-3 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{
                width: 'clamp(310px,90vw,440px)',
                height: 620,
                background: '#0b1a2d',
                border: '1.5px solid rgba(56,189,248,.25)',
                fontFamily: 'Inter,system-ui,sans-serif',
                animation: 'slideUpFade .22s cubic-bezier(.22,1,.36,1)',
            }}
        >
            {/* ── Header ── */}
            <div className="px-4 py-3 flex items-center gap-3 text-white flex-shrink-0" style={{ background: provGrad }}>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Link2 size={17} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-sm">Connect Patient</span>
                        <span className="text-[9px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Crown size={7} /> WelliMate PRO
                        </span>
                    </div>
                    <p className="text-[10px] opacity-65 mt-0.5">
                        Live interpretation · Auto-documentation · WelliRecord sync
                    </p>
                </div>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition-colors flex-shrink-0">
                    <X size={15} />
                </button>
            </div>

            {/* ════ PHASE: idle / connect ════ */}
            {(phase === 'idle' || phase === 'connect') && (
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.2)' }}>
                        <AlertCircle size={14} className="text-sky-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] leading-relaxed" style={{ color: '#9dcff5' }}>
                            Enter the patient's <strong>WelliMate ID</strong> to connect for live interpretation and automatic WelliRecord documentation during this session.
                        </p>
                    </div>

                    {/* WelliMate ID input */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b9cbf' }}>
                            Patient WelliMate ID or Phone
                        </label>
                        <input
                            type="text"
                            value={welliId}
                            onChange={e => setWelliId(e.target.value)}
                            placeholder="e.g. WM-2024-0049 or +234..."
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: '#0d2137', border: '1.5px solid rgba(56,189,248,.25)', color: '#cce4f7' }}
                        />
                    </div>

                    {/* Session type */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b9cbf' }}>
                            Session Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {SESSION_TYPES.map(s => (
                                <button key={s.id} onClick={() => setSessionType(s.id)}
                                    className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-95"
                                    style={{
                                        border: `1.5px solid ${sessionType === s.id ? s.color : 'rgba(56,189,248,.12)'}`,
                                        background: sessionType === s.id ? `${s.color}18` : '#0d2137',
                                    }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                                        <s.icon size={15} color={s.color} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold" style={{ color: '#cce4f7' }}>{s.label}</div>
                                        <div className="text-[9px]" style={{ color: '#6b9cbf' }}>{s.desc}</div>
                                    </div>
                                    {sessionType === s.id && <CheckCircle size={13} color={s.color} className="ml-auto flex-shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Patient language */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b9cbf' }}>
                            Patient's Language
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {LANGUAGES.map(l => (
                                <button key={l} onClick={() => setPatientLang(l)}
                                    className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                                    style={{
                                        background: patientLang === l ? '#38bdf8' : '#0d2137',
                                        color: patientLang === l ? '#fff' : '#6b9cbf',
                                        border: `1px solid ${patientLang === l ? '#38bdf8' : 'rgba(56,189,248,.15)'}`,
                                    }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] mt-1.5 flex items-center gap-1" style={{ color: '#4a7a9b' }}>
                            <ArrowLeftRight size={9} /> I will interpret between <strong style={{ color: '#38bdf8' }}>{patientLang}</strong> and <strong style={{ color: '#38bdf8' }}>English</strong> in real time
                        </p>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={!welliId.trim() || !sessionType || isConnecting}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg,#07284f,#0ea5e9)', color: '#fff' }}
                    >
                        {isConnecting ? (
                            <><Loader size={16} className="animate-spin" /> Connecting to WelliMate ID...</>
                        ) : (
                            <><UserPlus size={16} /> Request Patient Connection</>
                        )}
                    </button>
                </div>
            )}

            {/* ════ PHASE: connected (confirm & start) ════ */}
            {phase === 'connected' && connectedPatient && (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
                    <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,.08)', border: '1.5px solid rgba(34,197,94,.25)' }}>
                        <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                        <p className="font-black text-green-300 text-sm">Patient Connected</p>
                        <p className="text-[11px] mt-1" style={{ color: '#86efac' }}>
                            {connectedPatient.name} has accepted the WelliMate session request.
                        </p>
                    </div>

                    <div className="rounded-xl p-4 space-y-3" style={{ background: '#0d2137', border: '1px solid rgba(56,189,248,.15)' }}>
                        {[
                            ['Patient', `${connectedPatient.name} · ${connectedPatient.id}`],
                            ['WelliRecord', connectedPatient.record],
                            ['Session', SESSION_TYPES.find(s => s.id === sessionType)?.label ?? ''],
                            ['Languages', `${patientLang} ↔ English (real-time)`],
                            ['Documentation', 'Auto-capture + SOAP note generation'],
                        ].map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: '#6b9cbf' }}>{k}</span>
                                <span className="text-[11px] font-semibold text-right" style={{ color: '#cce4f7' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
                        <ShieldCheck size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] leading-relaxed" style={{ color: '#fcd34d' }}>
                            This session is end-to-end encrypted. All speech, interpretations, and clinical notes will be saved exclusively to this patient's WelliRecord. Only authorised providers can access.
                        </p>
                    </div>

                    <button onClick={startSession}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] mt-auto"
                        style={{ background: 'linear-gradient(135deg,#07284f,#0ea5e9)', color: '#fff' }}>
                        <Mic size={16} /> Begin Session
                    </button>
                </div>
            )}

            {/* ════ PHASE: session (live interpretation) ════ */}
            {phase === 'session' && (
                <>
                    {/* Session info bar */}
                    <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0" style={{ background: 'rgba(14,165,233,.07)', borderBottom: '1px solid rgba(14,165,233,.15)' }}>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                        <span className="text-[10px] font-bold" style={{ color: '#38bdf8' }}>
                            {connectedPatient?.name} · {SESSION_TYPES.find(s => s.id === sessionType)?.label}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-[9px]" style={{ color: '#6b9cbf' }}>
                            <Globe size={9} /> {patientLang} ↔ English
                        </span>
                    </div>

                    {/* Conversation */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5" style={{ background: '#0d2137' }}>
                        {conv.map((c, i) => (
                            <div key={i} className={`flex gap-2 ${c.speaker === 'provider' ? 'flex-row-reverse' : ''}`}>
                                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black mt-0.5"
                                    style={{
                                        background: c.speaker === 'ai' ? 'linear-gradient(135deg,#07284f,#0ea5e9)' : c.speaker === 'provider' ? '#0ea5e9' : '#6b9cbf',
                                        color: '#fff'
                                    }}>
                                    {c.speaker === 'ai' ? <Sparkles size={10} /> : c.speaker === 'provider' ? 'Dr' : 'Pt'}
                                </div>
                                <div className="max-w-[82%]">
                                    <div className="px-3 py-2 text-[11px] leading-relaxed"
                                        style={c.speaker === 'ai'
                                            ? { background: 'rgba(56,189,248,.1)', color: '#9dcff5', borderRadius: '4px 14px 14px 14px' }
                                            : c.speaker === 'provider'
                                                ? { background: '#0ea5e9', color: '#fff', borderRadius: '14px 4px 14px 14px' }
                                                : { background: '#1e3a5f', color: '#cce4f7', borderRadius: '4px 14px 14px 14px' }
                                        }>
                                        {renderText(c.original)}
                                    </div>
                                    <div className="text-[8px] mt-0.5 px-1" style={{ color: '#4a6a8a' }}>
                                        {c.speaker === 'ai' ? 'WelliMate' : c.speaker === 'provider' ? 'Provider' : `Patient · ${c.lang}`} · {c.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Waveform during listen */}
                    {isListening && (
                        <div className="mx-3 mb-1 px-3 py-2 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}>
                            <div className="flex gap-[2px] items-end h-4">
                                {[2, 5, 8, 4, 9, 6, 7, 3, 6, 4].map((h, i) => (
                                    <div key={i} className="w-[3px] rounded-full bg-red-500 animate-bounce"
                                        style={{ height: h * 2, animationDelay: `${i * .07}s`, animationDuration: '.6s' }} />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-red-400">Listening — Patient ({patientLang}) · {fmt(listenSec)}</p>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="px-3 py-3 flex-shrink-0 space-y-2" style={{ background: '#0b1a2d', borderTop: '1px solid rgba(56,189,248,.1)' }}>
                        <div className="flex gap-2">
                            {/* Patient voice */}
                            <button onClick={handleToggleListen}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                style={{
                                    background: isListening ? 'linear-gradient(135deg,#b91c1c,#ef4444)' : '#1e3a5f',
                                    color: isListening ? '#fff' : '#38bdf8',
                                    border: '1px solid rgba(56,189,248,.2)',
                                    boxShadow: isListening ? '0 0 0 3px rgba(239,68,68,.2)' : 'none',
                                }}>
                                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                {isListening ? `Stop · ${fmt(listenSec)}` : `Patient Speaks (${patientLang})`}
                            </button>
                            {/* Provider speaks */}
                            <button onClick={simulateProviderSpeech}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                style={{ background: '#0ea5e9', color: '#fff' }}>
                                <Stethoscope size={14} /> I Speak (Dr)
                            </button>
                        </div>
                        {/* Save */}
                        {phase !== 'saved' && (
                            <button onClick={handleSave} disabled={isSaving || conv.length < 2}
                                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                                style={{ background: 'rgba(34,197,94,.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,.25)' }}>
                                {isSaving ? <><Loader size={13} className="animate-spin" /> Saving to WelliRecord...</> : <><Save size={13} /> End Session & Save to WelliRecord</>}
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* ════ PHASE: saved ════ */}
            {phase === 'saved' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 overflow-y-auto">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,.15)', border: '2px solid rgba(34,197,94,.4)' }}>
                        <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <div>
                        <p className="font-black text-green-300 text-base">Session Saved</p>
                        <p className="text-[11px] mt-1" style={{ color: '#86efac' }}>
                            Conversation, interpretations, and SOAP note saved to <strong>{connectedPatient?.record}</strong>
                        </p>
                    </div>
                    <div className="w-full rounded-xl p-3 space-y-2 text-left" style={{ background: '#0d2137', border: '1px solid rgba(56,189,248,.12)' }}>
                        {[
                            ['Patient notified', 'Summary sent to patient\'s WelliMate app'],
                            ['WelliRecord updated', 'Full transcript + SOAP note attached'],
                            ['Interpretation logged', `${patientLang} ↔ English, ${conv.filter(c => c.speaker !== 'ai').length} exchanges`],
                        ].map(([k, v]) => (
                            <div key={k} className="flex items-start gap-2">
                                <CheckCircle size={11} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold" style={{ color: '#cce4f7' }}>{k}</p>
                                    <p className="text-[9px]" style={{ color: '#6b9cbf' }}>{v}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#07284f,#0ea5e9)', color: '#fff' }}>
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}
