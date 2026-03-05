import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teleMedApi } from '@/shared/api/teleMedApi';
import { vaultApi } from '@/shared/api/vaultApi';
import {
    Video, VideoOff, Mic, MicOff, PhoneOff, Brain, FileText,
    Pill, FlaskConical, Stethoscope, ShieldCheck, AlertTriangle,
    Heart, Activity, ChevronRight, CheckCircle, Edit3, Send,
    Zap, BarChart2, BookOpen, Monitor, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

/* ─── Inline sparkline ───────────────────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
    const max = Math.max(...values), min = Math.min(...values);
    const range = max - min || 1;
    const w = 60, h = 24;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const ICD10_SUGGESTIONS = [
    { code: 'I10', desc: 'Essential Hypertension', match: 'high' },
    { code: 'I11.9', desc: 'Hypertensive Heart Disease', match: 'medium' },
    { code: 'E11.9', desc: 'Type 2 Diabetes Mellitus', match: 'medium' },
    { code: 'G44.309', desc: 'Post-traumatic Headache', match: 'low' },
];

const DIFFERENTIALS = [
    { dx: 'Hypertensive Urgency', probability: 72, color: '#ef4444' },
    { dx: 'White Coat Hypertension', probability: 15, color: '#f59e0b' },
    { dx: 'Medication Suboptimal Dosing', probability: 10, color: '#0ea5e9' },
    { dx: 'Secondary Hypertension', probability: 3, color: '#6b7280' },
];

export function TeleConsultSessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const session = teleMedApi.getSession(sessionId ?? 'sess_001');
    const records = vaultApi.getRecords(session?.patientId ?? 'pat_001');
    const intake = session?.intakeId ? teleMedApi.getIntake(session.intakeId) : null;

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [elapsed, setElapsed] = useState(0);
    const [soapTab, setSoapTab] = useState<'scribe' | 'soap' | 'icd' | 'dx'>('scribe');
    const [soap, setSoap] = useState(session?.soapNote ?? { subjective: '', objective: '', assessment: '', plan: '' });
    const [scribeLines, setScribeLines] = useState<string[]>([]);
    const [scribeIdx, setScribeIdx] = useState(0);

    const MOCK_SCRIBE = [
        'Provider: Dr. Fatima Aliyu | Patient: Amara Okafor | Specialty: Cardiology',
        'Patient reports persistent headaches and elevated home BP readings over the past 7 days.',
        'No chest pain. No dyspnea. No neurological deficits reported.',
        'Currently on Lisinopril 5mg once daily. No allergies.',
        'Home BP logs: range 145–158 / 90–98 mmHg over 5 days.',
        'Objective: Discussing medication adjustment and dietary compliance.',
        '⚡ Drug Note: Increasing Lisinopril may cause dry cough — counsel patient.',
        '✓ Draft SOAP note ready for review and signature.',
    ];

    useEffect(() => {
        const t = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (scribeIdx < MOCK_SCRIBE.length) {
            const t = setTimeout(() => {
                setScribeLines(p => [...p, MOCK_SCRIBE[scribeIdx]]);
                setScribeIdx(n => n + 1);
                if (scribeIdx === 5) {
                    setSoap({ subjective: 'Patient reports 7-day history of headaches and elevated home BP (145–158/90–98).', objective: 'Discussing medication adjustment. Home BP logs reviewed.', assessment: 'Suboptimally controlled essential hypertension (ICD-10: I10).', plan: 'Titrate Lisinopril to 10mg QD. Order Renal profile. DASH diet reinforcement. Tele-review in 4 weeks.' });
                }
            }, 3500 + scribeIdx * 3000);
            return () => clearTimeout(t);
        }
    }, [scribeIdx]);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="animate-fade-in h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full animate-pulse bg-red-500" />
                    <span className="font-bold text-sm" style={{ color: '#e2eaf4' }}>
                        Session — {session?.patientName ?? 'Patient'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>{formatTime(elapsed)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>E2E Encrypted</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                {/* ── Left: Patient Context ── */}
                <div className="lg:col-span-3 space-y-3">
                    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                        <div className="px-4 py-3 border-b font-bold text-xs uppercase tracking-widest flex items-center justify-between" style={{ borderColor: 'var(--prov-border)', color: '#7ba3c8' }}>
                            Patient Context
                            {/* Risk score chip */}
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,.15)', color: '#f87171' }}>Risk: HIGH</span>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Identity */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>
                                    {session?.patientName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm" style={{ color: '#e2eaf4' }}>{session?.patientName}</div>
                                    <div className="text-xs" style={{ color: '#7ba3c8' }}>F · 35 yrs · B+ · Lagos</div>
                                </div>
                            </div>

                            {/* Vital trend sparklines */}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#7ba3c8' }}>Vital Trends (7d)</div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'BP Systolic', values: [152, 148, 155, 150, 145, 148, 152], unit: 'mmHg', color: '#f87171', trend: 'up' },
                                        { label: 'Blood Glucose', values: [7.1, 7.4, 6.9, 7.2, 6.8, 7.0, 6.9], unit: 'mmol/L', color: '#fbbf24', trend: 'down' },
                                    ].map(v => (
                                        <div key={v.label} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,.03)' }}>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-bold" style={{ color: '#7ba3c8' }}>{v.label}</div>
                                                <div className="text-xs font-black" style={{ color: v.color }}>{v.values[v.values.length - 1]} <span className="text-[9px] font-normal opacity-60">{v.unit}</span></div>
                                            </div>
                                            <Sparkline values={v.values} color={v.color} />
                                            {v.trend === 'up' ? <TrendingUp size={12} style={{ color: '#f87171' }} /> : <TrendingDown size={12} style={{ color: '#34d399' }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alerts */}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#ef4444' }}>⚠ Allergies</div>
                                <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,.08)', color: '#ef4444' }}>Penicillin · Shellfish</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#7ba3c8' }}>Conditions</div>
                                {['Essential Hypertension (I10)', 'Pre-Diabetes (E11.65)'].map(c => (
                                    <div key={c} className="text-xs px-2 py-1 mb-1 rounded-lg font-mono" style={{ background: 'rgba(56,189,248,.08)', color: '#38bdf8' }}>{c}</div>
                                ))}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#7ba3c8' }}>Current Meds</div>
                                <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,.08)', color: '#c4b5fd' }}>Lisinopril 5mg QD</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#7ba3c8' }}>Recent Records</div>
                                {records.slice(0, 3).map(r => (
                                    <div key={r.id} className="flex items-center justify-between py-1 border-b border-white/5">
                                        <span className="text-[11px] truncate" style={{ color: '#64748b' }}>{r.title}</span>
                                        <span className="text-[10px] ml-2 flex-shrink-0 font-semibold" style={{ color: '#10b981' }}>✓</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pre-consult intake */}
                    {intake && (
                        <div className="rounded-2xl border p-4" style={{ background: 'rgba(168,85,247,.04)', borderColor: 'rgba(168,85,247,.3)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Brain size={13} style={{ color: '#a855f7' }} />
                                <span className="text-xs font-bold" style={{ color: '#a855f7' }}>AI Pre-Consult</span>
                                <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: '#f59e0b20', color: '#f59e0b' }}>{intake.urgencyScore}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: '#a78bfa' }}>{intake.aiSummary.substring(0, 160)}…</p>
                        </div>
                    )}
                </div>

                {/* ── Center: Video ── */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="relative rounded-2xl overflow-hidden" style={{ background: '#07111f', aspectRatio: '4/3' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-2" style={{ background: 'rgba(56,189,248,.12)', color: '#38bdf8' }}>
                                    {session?.patientName.charAt(0)}
                                </div>
                                <div className="text-white font-bold text-sm">{session?.patientName}</div>
                                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>Patient</div>
                            </div>
                        </div>
                        {/* Provider PiP */}
                        <div className="absolute bottom-3 right-3 w-24 h-18 rounded-xl border-2 border-white/10 overflow-hidden" style={{ background: '#1e3a5f', width: '96px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="text-white/40 text-xs">You</span>
                        </div>
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(168,85,247,.2)', color: '#c084fc' }}>
                            <Brain size={10} className="animate-pulse" /> WelliMate™ Active
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setMicOn(m => !m)}
                            title={micOn ? 'Mute mic' : 'Unmute mic'}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ background: micOn ? 'rgba(56,189,248,.1)' : '#ef4444' }}>
                            {micOn ? <Mic size={16} style={{ color: '#38bdf8' }} /> : <MicOff size={16} className="text-white" />}
                        </button>
                        <button onClick={() => setCamOn(v => !v)}
                            title={camOn ? 'Stop camera' : 'Start camera'}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ background: camOn ? 'rgba(56,189,248,.1)' : '#ef4444' }}>
                            {camOn ? <Video size={16} style={{ color: '#38bdf8' }} /> : <VideoOff size={16} className="text-white" />}
                        </button>
                        <button title="Share screen"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ background: 'rgba(56,189,248,.1)' }}>
                            <Monitor size={16} style={{ color: '#38bdf8' }} />
                        </button>
                        <button onClick={() => navigate('/provider/telemedicine')}
                            title="End call"
                            className="rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-all shadow-lg"
                            style={{ width: '48px', height: '48px' }}>
                            <PhoneOff size={18} className="text-white" />
                        </button>
                    </div>
                    {/* Quick actions */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Order Lab', icon: FlaskConical, color: '#3b82f6' },
                            { label: 'Prescribe', icon: Pill, color: '#a855f7' },
                            { label: 'Referral', icon: Stethoscope, color: '#0ea5e9' },
                            { label: 'Vital Alert', icon: Activity, color: '#f59e0b' },
                        ].map(a => (
                            <button key={a.label} className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all hover:shadow-md hover:-translate-y-0.5"
                                style={{ borderColor: a.color + '40', color: a.color, background: a.color + '08' }}>
                                <a.icon size={14} /> {a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Right: AI Co-Pilot ── */}
                <div className="lg:col-span-4 space-y-3">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--prov-border)' }}>
                        {[
                            { id: 'scribe', label: 'Scribe', icon: Edit3 },
                            { id: 'soap', label: 'SOAP', icon: FileText },
                            { id: 'icd', label: 'ICD-10', icon: BookOpen },
                            { id: 'dx', label: 'Differentials', icon: BarChart2 },
                        ].map(t => (
                            <button key={t.id} onClick={() => setSoapTab(t.id as any)}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                                style={{ background: soapTab === t.id ? '#a855f7' : 'transparent', color: soapTab === t.id ? '#fff' : '#7ba3c8' }}>
                                <t.icon size={11} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Scribe */}
                    {soapTab === 'scribe' && (
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(168,85,247,.04)', borderColor: 'rgba(168,85,247,.2)' }}>
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(168,85,247,.2)' }}>
                                <Brain size={13} style={{ color: '#a855f7' }} />
                                <span className="text-xs font-bold" style={{ color: '#a855f7' }}>Ambient Scribe</span>
                            </div>
                            <div className="p-4 font-mono text-[11px] leading-relaxed space-y-1.5 min-h-48" style={{ color: '#c4b5fd' }}>
                                {scribeLines.length === 0 && <span style={{ color: '#6b7280' }}>Listening…</span>}
                                {scribeLines.map((line, i) => (
                                    <div key={i} className={`${line.startsWith('⚡') ? 'text-amber-400' : line.startsWith('✓') ? 'text-emerald-400' : ''}`}>{line}</div>
                                ))}
                                {scribeIdx < MOCK_SCRIBE.length && scribeLines.length > 0 && (
                                    <span className="inline-block w-1.5 h-3.5 animate-pulse align-middle" style={{ background: '#a855f7' }} />
                                )}
                            </div>
                        </div>
                    )}

                    {/* SOAP Note editor */}
                    {soapTab === 'soap' && (
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                            <div className="px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--prov-border)', color: '#7ba3c8' }}>SOAP Note</div>
                            <div className="p-4 space-y-3">
                                {(['subjective', 'objective', 'assessment', 'plan'] as const).map(field => (
                                    <div key={field}>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#a855f7' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                        <textarea
                                            value={soap[field]}
                                            onChange={e => setSoap(prev => ({ ...prev, [field]: e.target.value }))}
                                            rows={field === 'plan' ? 3 : 2}
                                            className="w-full resize-none rounded-lg px-3 py-2 text-xs leading-relaxed"
                                            style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--prov-border)', color: '#e2eaf4', outline: 'none' }}
                                        />
                                    </div>
                                ))}
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs text-[#050d1a]" style={{ background: '#38bdf8' }}>
                                    <Send size={13} /> Finalise & Publish to WelliRecord
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ICD-10 */}
                    {soapTab === 'icd' && (
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                            <div className="px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--prov-border)', color: '#7ba3c8' }}>ICD-10 Suggestions</div>
                            <div className="p-3 space-y-2">
                                {ICD10_SUGGESTIONS.map(s => (
                                    <div key={s.code} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                        <div>
                                            <div className="font-mono text-xs font-bold" style={{ color: '#38bdf8' }}>{s.code}</div>
                                            <div className="text-xs mt-0.5" style={{ color: '#e2eaf4' }}>{s.desc}</div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.match === 'high' ? '#10b98120' : s.match === 'medium' ? '#f59e0b20' : '#ffffff10', color: s.match === 'high' ? '#10b981' : s.match === 'medium' ? '#f59e0b' : '#6b7280' }}>
                                            {s.match}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Differentials */}
                    {soapTab === 'dx' && (
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                            <div className="px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--prov-border)', color: '#7ba3c8' }}>Differential Diagnosis</div>
                            <div className="p-4 space-y-3">
                                {DIFFERENTIALS.map(d => (
                                    <div key={d.dx}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold" style={{ color: '#e2eaf4' }}>{d.dx}</span>
                                            <span className="text-xs font-black" style={{ color: d.color }}>{d.probability}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }}>
                                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${d.probability}%`, background: d.color }} />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-[10px] italic mt-2" style={{ color: '#6b7280' }}>AI-generated differential — requires clinical validation.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
