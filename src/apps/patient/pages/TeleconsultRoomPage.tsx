import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teleMedApi } from '@/shared/api/teleMedApi';
import { vaultApi } from '@/shared/api/vaultApi';
import {
    Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare,
    Brain, FlaskConical, Pill, FileText, AlertTriangle,
    ShieldCheck, Activity, Stethoscope, ChevronRight,
    Maximize2, Settings, Clock, User
} from 'lucide-react';

export function TeleconsultRoomPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const session = teleMedApi.getSession(sessionId ?? '');
    const records = vaultApi.getRecords(user?.userId ?? 'pat_001');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [elapsed, setElapsed] = useState(0);
    const [scribeText, setScribeText] = useState('');
    const [noteStep, setNoteStep] = useState(0);

    // Simulate AI ambient scribe building a note in real time
    const SCRIBE_LINES = [
        'Patient: Amara Okafor. Session started.',
        'S: Patient reports recurring headaches and elevated home BP readings over the last 7 days.',
        'S: Currently on Lisinopril 5mg. No drug allergies.',
        'O: Vitals — BP 152/94. HR 84bpm. SpO₂ 98%. Afebrile.',
        'A: Suboptimally controlled essential hypertension. No hypertensive emergency features.',
        'P: Consider dose titration. Lab orders — Urea, Creatinine, Electrolytes. DASH diet reinforced.',
        '✓ SOAP note draft complete. Review and sign to publish to WelliRecord.',
    ];

    useEffect(() => {
        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (noteStep < SCRIBE_LINES.length) {
            const t = setTimeout(() => {
                setScribeText(prev => prev + (prev ? '\n' : '') + SCRIBE_LINES[noteStep]);
                setNoteStep(n => n + 1);
            }, 4000 + noteStep * 3500);
            return () => clearTimeout(t);
        }
    }, [noteStep]);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // Most relevant records
    const latestRecords = records.slice(0, 4);
    const allergies = ['Penicillin']; // from vault in production
    const conditions = ['Hypertension', 'Pre-Diabetes'];
    const meds = ['Lisinopril 5mg QD'];

    return (
        <div className="animate-fade-in h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full animate-pulse bg-red-500" />
                    <span className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>
                        Live Session — {session?.providerName ?? 'Clinician'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                        {formatTime(elapsed)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>E2E Encrypted</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* ── Video Area ── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Main video window */}
                    <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0a1628', aspectRatio: '16/9', minHeight: '240px' }}>
                        {/* Provider video mock */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-3 text-4xl font-black" style={{ background: 'rgba(56,189,248,.15)', color: '#38bdf8' }}>
                                    {session?.providerName?.charAt(0) ?? 'D'}
                                </div>
                                <div className="text-white font-bold">{session?.providerName ?? 'Dr. Fatima Aliyu'}</div>
                                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>{session?.providerSpecialty ?? 'Cardiology'}</div>
                            </div>
                        </div>
                        {/* Self-view pip */}
                        <div className="absolute bottom-4 right-4 w-28 h-20 rounded-xl border-2 border-white/20 flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                            <User size={28} style={{ color: 'rgba(255,255,255,.4)' }} />
                        </div>
                        {/* Scribe active badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(168,85,247,.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,.3)' }}>
                            <Brain size={12} className="animate-pulse" /> WelliMate™ Scribe Active
                        </div>
                        {!camOn && <div className="absolute inset-0 flex items-center justify-center bg-black/70"><VideoOff size={40} className="text-white/30" /></div>}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setMicOn(m => !m)}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: micOn ? 'rgba(26,107,66,.1)' : '#ef4444', border: '1px solid var(--pat-border)' }}>
                            {micOn ? <Mic size={20} style={{ color: '#1a6b42' }} /> : <MicOff size={20} className="text-white" />}
                        </button>
                        <button onClick={() => setCamOn(c => !c)}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: camOn ? 'rgba(26,107,66,.1)' : '#ef4444', border: '1px solid var(--pat-border)' }}>
                            {camOn ? <Video size={20} style={{ color: '#1a6b42' }} /> : <VideoOff size={20} className="text-white" />}
                        </button>
                        <button
                            onClick={() => navigate('/patient/telemedicine')}
                            className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-all hover:scale-110 shadow-lg">
                            <PhoneOff size={22} className="text-white" />
                        </button>
                        <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(26,107,66,.1)', border: '1px solid var(--pat-border)' }}>
                            <MessageSquare size={20} style={{ color: '#1a6b42' }} />
                        </button>
                        <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(26,107,66,.1)', border: '1px solid var(--pat-border)' }}>
                            <Maximize2 size={20} style={{ color: '#1a6b42' }} />
                        </button>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Order Lab', icon: FlaskConical, color: '#3b82f6' },
                            { label: 'Prescription', icon: Pill, color: '#8b5cf6' },
                            { label: 'Referral', icon: Stethoscope, color: '#0ea5e9' },
                            { label: 'Clinical Note', icon: FileText, color: '#1a6b42' },
                        ].map(a => (
                            <button key={a.label} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all hover:shadow-sm"
                                style={{ borderColor: a.color + '40', color: a.color, background: a.color + '08' }}>
                                <a.icon size={14} /> {a.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div className="space-y-4">
                    {/* AI Ambient Scribe */}
                    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--pat-border)', background: '#a855f710' }}>
                            <Brain size={15} style={{ color: '#a855f7' }} />
                            <span className="font-bold text-sm" style={{ color: '#a855f7' }}>WelliMate™ Ambient Scribe</span>
                        </div>
                        <div className="p-4 font-mono text-xs leading-relaxed min-h-36 whitespace-pre-line" style={{ color: 'var(--pat-text)' }}>
                            {scribeText || <span style={{ color: 'var(--pat-muted)' }}>Listening for consultation…</span>}
                            {noteStep < SCRIBE_LINES.length && scribeText && (
                                <span className="inline-block w-1.5 h-4 ml-1 animate-pulse align-middle" style={{ background: '#a855f7' }} />
                            )}
                        </div>
                    </div>

                    {/* Patient Medical Summary */}
                    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                            <Activity size={15} style={{ color: 'var(--pat-primary)' }} />
                            <span className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>My Health Summary</span>
                        </div>
                        <div className="p-4 space-y-3">
                            {allergies.length > 0 && (
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#ef4444' }}>Allergies</div>
                                    {allergies.map(a => (
                                        <span key={a} className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg mb-1" style={{ background: '#ef444415', color: '#ef4444' }}>
                                            <AlertTriangle size={10} /> {a}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--pat-muted)' }}>Conditions</div>
                                {conditions.map(c => (
                                    <div key={c} className="text-xs font-semibold px-2 py-1 rounded-lg mb-1" style={{ background: 'rgba(26,107,66,.08)', color: 'var(--pat-primary)' }}>{c}</div>
                                ))}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--pat-muted)' }}>Current Medications</div>
                                {meds.map(m => (
                                    <div key={m} className="text-xs px-2 py-1" style={{ color: 'var(--pat-muted)' }}>{m}</div>
                                ))}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--pat-muted)' }}>Recent Records</div>
                                {latestRecords.slice(0, 3).map(r => (
                                    <div key={r.id} className="flex items-center justify-between py-1">
                                        <span className="text-xs truncate" style={{ color: 'var(--pat-muted)' }}>{r.title}</span>
                                        <span className="text-[10px] font-semibold ml-2 flex-shrink-0" style={{ color: '#10b981' }}>{r.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
