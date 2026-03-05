import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ChevronRight, AlertTriangle, CheckCircle, Zap, X, Plus } from 'lucide-react';

const SYSTEMS = ['Cardiovascular', 'Respiratory', 'Neurological', 'Gastrointestinal', 'Musculoskeletal', 'Genitourinary', 'Dermatology', 'Mental Health', 'ENT', 'Eyes'];
const COMMON_SYMPTOMS = ['Fever', 'Headache', 'Fatigue', 'Chest Pain', 'Shortness of Breath', 'Nausea', 'Dizziness', 'Back Pain', 'Abdominal Pain', 'Joint Pain', 'Cough', 'Rash', 'Swelling', 'Palpitations', 'Weight Loss'];

type Severity = 'mild' | 'moderate' | 'severe';
type UrgencyLevel = 'Routine' | 'Priority' | 'Emergency';

interface SelectedSymptom { label: string; severity: Severity; }

const URGENCY_CONFIG: Record<UrgencyLevel, { color: string; bg: string; border: string; icon: any; description: string }> = {
    Routine: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle, description: 'Non-urgent — book within 3–5 days' },
    Priority: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle, description: 'See a clinician within 24 hours' },
    Emergency: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: Zap, description: 'Seek emergency care immediately or call emergency services' },
};

export function SmartSymptomIntakePage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [complaint, setComplaint] = useState('');
    const [symptoms, setSymptoms] = useState<SelectedSymptom[]>([]);
    const [duration, setDuration] = useState(3);
    const [system, setSystem] = useState('');
    const [notes, setNotes] = useState('');
    const [urgency, setUrgency] = useState<UrgencyLevel | null>(null);
    const [aiSummary, setAiSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleSymptom = (label: string) => {
        setSymptoms(prev =>
            prev.some(s => s.label === label)
                ? prev.filter(s => s.label !== label)
                : [...prev, { label, severity: 'moderate' }]
        );
    };

    const setSeverity = (label: string, severity: Severity) => {
        setSymptoms(prev => prev.map(s => s.label === label ? { ...s, severity } : s));
    };

    const runAI = () => {
        setLoading(true);
        setTimeout(() => {
            // Determine urgency based on symptom severity and count
            const hasSevere = symptoms.some(s => s.severity === 'severe');
            const hasManyModerate = symptoms.filter(s => s.severity === 'moderate').length >= 3;
            const hasRedFlags = ['Chest Pain', 'Shortness of Breath', 'Palpitations'].some(f => symptoms.some(s => s.label === f));

            let computedUrgency: UrgencyLevel = 'Routine';
            if (hasRedFlags || (hasSevere && hasManyModerate)) computedUrgency = 'Emergency';
            else if (hasSevere || hasManyModerate || duration >= 7) computedUrgency = 'Priority';

            const symptomList = symptoms.map(s => `${s.label} (${s.severity})`).join(', ');
            const summary = `Patient presents with a ${duration}-day history of ${complaint || 'unspecified symptoms'}. Affected system: ${system || 'unspecified'}. Reported symptoms: ${symptomList || 'none selected'}. ${notes ? `Additional notes: ${notes}.` : ''} Based on symptom profile, urgency is assessed as **${computedUrgency}**. ${computedUrgency === 'Priority' ? 'Medical review recommended within 24 hours.' : computedUrgency === 'Emergency' ? 'Immediate medical attention required.' : 'Schedule a routine consult at your convenience.'}`;

            setUrgency(computedUrgency);
            setAiSummary(summary);
            setLoading(false);
            setStep(4);
        }, 2200);
    };

    const steps = [
        { label: 'Chief Complaint', progress: 25 },
        { label: 'Symptoms', progress: 50 },
        { label: 'Details', progress: 75 },
        { label: 'AI Review', progress: 100 },
        { label: 'Result', progress: 100 },
    ];

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Brain size={20} style={{ color: '#a855f7' }} />
                    <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--pat-text)' }}>AI Symptom Check</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>
                    Before your consultation, tell us how you're feeling — your clinician will arrive pre-informed.
                </p>
            </div>

            {/* Progress bar */}
            {step < 4 && (
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: 'var(--pat-muted)' }}>
                        <span>Step {step + 1} of 4</span>
                        <span>{steps[step].label}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--pat-border)' }}>
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${steps[step].progress}%`, background: 'linear-gradient(to right, #1a6b42, #a855f7)' }} />
                    </div>
                </div>
            )}

            {/* Step 0 — Chief Complaint */}
            {step === 0 && (
                <div className="card-patient p-7 space-y-5 animate-fade-in">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--pat-text)' }}>What's your main concern today?</h2>
                    <textarea
                        value={complaint}
                        onChange={e => setComplaint(e.target.value)}
                        rows={4}
                        className="input input-light w-full resize-none"
                        placeholder="e.g. I've been having recurring headaches and my blood pressure readings have been high at home over the past week…"
                    />
                    <button
                        disabled={!complaint.trim()}
                        onClick={() => setStep(1)}
                        className="btn btn-patient w-full justify-center gap-2 disabled:opacity-40"
                    >
                        Continue <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Step 1 — Symptoms */}
            {step === 1 && (
                <div className="card-patient p-7 space-y-5 animate-fade-in">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--pat-text)' }}>Which symptoms are you experiencing?</h2>
                    <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>Select all that apply. You can adjust severity below.</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_SYMPTOMS.map(sym => {
                            const selected = symptoms.some(s => s.label === sym);
                            return (
                                <button key={sym} onClick={() => toggleSymptom(sym)}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                                    style={{
                                        background: selected ? '#1a6b42' : 'transparent',
                                        color: selected ? '#fff' : '#1a6b42',
                                        borderColor: '#1a6b42',
                                    }}>
                                    {sym}
                                </button>
                            );
                        })}
                    </div>
                    {symptoms.length > 0 && (
                        <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--pat-border)' }}>
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--pat-muted)' }}>Rate severity</div>
                            {symptoms.map(s => (
                                <div key={s.label} className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--pat-text)' }}>{s.label}</span>
                                    <div className="flex gap-1.5">
                                        {(['mild', 'moderate', 'severe'] as Severity[]).map(sev => (
                                            <button key={sev} onClick={() => setSeverity(s.label, sev)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all"
                                                style={{
                                                    background: s.severity === sev ? (sev === 'mild' ? '#10b981' : sev === 'moderate' ? '#f59e0b' : '#ef4444') : 'rgba(0,0,0,.04)',
                                                    color: s.severity === sev ? '#fff' : '#9ca3af',
                                                }}>
                                                {sev}
                                            </button>
                                        ))}
                                        <button onClick={() => toggleSymptom(s.label)} className="px-1 py-1 rounded-lg text-xs text-gray-400 hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={() => setStep(0)} className="btn btn-patient-outline flex-1 justify-center">Back</button>
                        <button disabled={symptoms.length === 0} onClick={() => setStep(2)} className="btn btn-patient flex-1 justify-center gap-2 disabled:opacity-40">
                            Continue <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 — Details */}
            {step === 2 && (
                <div className="card-patient p-7 space-y-5 animate-fade-in">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--pat-text)' }}>A little more detail</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--pat-text)' }}>How long have you had these symptoms?</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min={1} max={60} value={duration} onChange={e => setDuration(Number(e.target.value))} className="flex-1 accent-green-700" />
                                <span className="font-black text-lg w-20 text-center" style={{ color: 'var(--pat-primary)' }}>{duration} day{duration !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--pat-text)' }}>Primarily affected body system</label>
                            <div className="flex flex-wrap gap-2">
                                {SYSTEMS.map(s => (
                                    <button key={s} onClick={() => setSystem(s)}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                                        style={{ background: system === s ? '#1a6b42' : 'transparent', color: system === s ? '#fff' : '#1a6b42', borderColor: '#1a6b42' }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--pat-text)' }}>Anything else the doctor should know?</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input input-light w-full resize-none" placeholder="Relevant medications, history, allergies…" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="btn btn-patient-outline flex-1 justify-center">Back</button>
                        <button onClick={runAI} className="btn btn-patient flex-1 justify-center gap-2" style={{ background: 'linear-gradient(to right, #1a6b42, #a855f7)' }}>
                            <Brain size={16} /> Run AI Analysis
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 — AI Processing */}
            {step === 2 && loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}>
                    <div className="card-patient p-10 text-center max-w-sm mx-4 animate-fade-in-up">
                        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg,#1a6b42,#a855f7)' }}>
                            <Brain size={32} className="text-white animate-pulse" />
                        </div>
                        <div className="font-bold text-lg mb-2" style={{ color: 'var(--pat-text)' }}>WelliMate™ is analysing…</div>
                        <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>Reviewing symptom profile, duration, and medical history to generate your clinical summary.</p>
                    </div>
                </div>
            )}

            {/* Step 4 — Result */}
            {step === 4 && urgency && (
                <div className="space-y-5 animate-fade-in">
                    {/* Urgency card */}
                    {(() => {
                        const cfg = URGENCY_CONFIG[urgency];
                        return (
                            <div className="rounded-2xl border-2 p-6" style={{ background: cfg.bg, borderColor: cfg.border }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <cfg.icon size={24} style={{ color: cfg.color }} />
                                    <div>
                                        <div className="font-black text-xl" style={{ color: cfg.color }}>{urgency}</div>
                                        <div className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.description}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* AI Summary */}
                    <div className="card-patient p-6">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                            <Brain size={16} style={{ color: '#a855f7' }} />
                            <h3 className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>WelliMate™ Clinical Summary</h3>
                            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#a855f715', color: '#a855f7' }}>AI-Generated</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--pat-muted)' }}>{aiSummary}</p>
                        <p className="text-xs mt-4 italic" style={{ color: '#9ca3af' }}>This AI summary is not a diagnosis. It is shared with your clinician to help them prepare for your consultation.</p>
                    </div>

                    {/* Symptoms summary */}
                    <div className="card-patient p-5">
                        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--pat-muted)' }}>Reported Symptoms</div>
                        <div className="flex flex-wrap gap-2">
                            {symptoms.map(s => (
                                <span key={s.label} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: s.severity === 'severe' ? '#ef444415' : s.severity === 'moderate' ? '#f59e0b15' : '#10b98115', color: s.severity === 'severe' ? '#ef4444' : s.severity === 'moderate' ? '#b45309' : '#059669' }}>
                                    {s.label} · {s.severity}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => navigate('/patient/telemedicine')} className="btn btn-patient-outline flex-1 justify-center">
                            Back to Telemedicine
                        </button>
                        <button onClick={() => navigate('/patient/telemedicine')} className="btn btn-patient flex-1 justify-center gap-2">
                            <CheckCircle size={16} /> Save & Book Consult
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
