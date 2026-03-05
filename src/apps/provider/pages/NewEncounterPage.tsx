import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    ArrowLeft, Save, CheckCircle, Wand2, Mic, MicOff, ChevronDown,
    ChevronUp, Pill, AlertTriangle, FileText, Search, X, Sparkles,
    Clock, Activity,
} from 'lucide-react';
import { vaultApi } from '@/shared/api/vaultApi';

// ─── Patient registry ───────────────────────────────────────────────────────
const PATIENTS = [
    { id: 'pat_001', name: 'Amara Okafor', age: 34 },
    { id: 'pat_002', name: 'Emeka Nwosu', age: 52 },
];

// ─── ICD-10 suggestions ─────────────────────────────────────────────────────
const ICD10_DB = [
    { code: 'I10', label: 'Essential (primary) hypertension' },
    { code: 'I11.9', label: 'Hypertensive heart disease without heart failure' },
    { code: 'E11.9', label: 'Type 2 diabetes mellitus without complications' },
    { code: 'E11.65', label: 'Type 2 diabetes mellitus with hyperglycaemia' },
    { code: 'J06.9', label: 'Acute upper respiratory infection, unspecified' },
    { code: 'J18.9', label: 'Pneumonia, unspecified organism' },
    { code: 'K21.0', label: 'Gastro-oesophageal reflux disease with oesophagitis' },
    { code: 'N39.0', label: 'Urinary tract infection, site not specified' },
    { code: 'A09', label: 'Gastroenteritis and colitis of unspecified origin' },
    { code: 'Z34.00', label: 'Encounter for supervision of normal pregnancy' },
    { code: 'O26.89', label: 'Other specified pregnancy-related conditions' },
    { code: 'R51', label: 'Headache' },
    { code: 'R00.0', label: 'Tachycardia, unspecified' },
    { code: 'R55', label: 'Syncope and collapse' },
    { code: 'M54.5', label: 'Low back pain' },
    { code: 'J45.909', label: 'Unspecified asthma, uncomplicated' },
];

// ─── AI-generated SOAP mock ─────────────────────────────────────────────────
const AI_SOAP = {
    subjective: 'Patient presents with a 3-day history of persistent frontal headache (7/10), rated worse in the morning. Reports poor medication adherence over the past 4 days — missed Lisinopril doses. No visual changes, no nausea.',
    objective: 'BP: 162/98 mmHg (elevated). HR: 84 bpm, regular. Temp: 36.7 °C. SpO₂: 98% on room air. Neurological exam unremarkable. Fundoscopy: no papilloedema.',
    assessment: 'Essential (primary) hypertension [I10] — uncontrolled, likely medication non-adherence. Differential: hypertensive urgency (no end-organ damage signs present).',
    plan: 'Resume Lisinopril 10mg OD. Counsel on medication adherence — dispense Pill Pack. HBPM (Home BP Monitoring) diary for 2 weeks. Repeat BP check in 1 week. Consider adding Amlodipine 5mg if BP remains > 150/90 at follow-up.',
};

// ─── Mic dictation button ───────────────────────────────────────────────────
function DictateButton({ fieldKey, onDictate }: { fieldKey: string; onDictate: (key: string, text: string) => void }) {
    const [recording, setRecording] = useState(false);
    const timerRef = useRef<any>(null);

    const toggle = () => {
        if (recording) {
            clearTimeout(timerRef.current);
            setRecording(false);
        } else {
            setRecording(true);
            // Simulate 2s dictation → append mock text
            timerRef.current = setTimeout(() => {
                const mockText: Record<string, string> = {
                    subjective: 'Patient reports worsening headache since yesterday, BP readings at home around 160 over 100.',
                    objective: 'On examination: BP 158/96. Heart sounds dual, no murmur. No pedal oedema.',
                    assessment: 'Hypertension, uncontrolled. Consider white-coat effect ruled out given home readings.',
                    plan: 'Continue Lisinopril. Add Amlodipine 5mg. Review in 2 weeks.',
                };
                onDictate(fieldKey, mockText[fieldKey] ?? '');
                setRecording(false);
            }, 2000);
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            title={recording ? 'Stop dictating' : 'Dictate this section'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
            style={{
                background: recording ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.08)',
                color: recording ? '#ef4444' : '#38bdf8',
                border: `1px solid ${recording ? 'rgba(239,68,68,0.3)' : 'rgba(56,189,248,0.2)'}`,
                animation: recording ? 'none' : undefined,
            }}
        >
            {recording ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" /><MicOff size={12} /> Stop</>
            ) : (
                <><Mic size={12} /> Dictate</>
            )}
        </button>
    );
}

// ─── ICD-10 Suggest ─────────────────────────────────────────────────────────
function ICD10Suggest({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const results = query.length >= 2
        ? ICD10_DB.filter(i =>
            i.label.toLowerCase().includes(query.toLowerCase()) ||
            i.code.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6)
        : [];

    const addCode = (item: typeof ICD10_DB[0]) => {
        const tag = `[${item.code}] ${item.label}`;
        onChange(value ? `${value}\n${tag}` : tag);
        setQuery('');
        setOpen(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                    style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}
                    onClick={() => setOpen(o => !o)}
                >
                    <Search size={11} /> ICD-10 lookup
                </div>
            </div>
            {open && (
                <div
                    className="rounded-xl p-3 mb-2 shadow-xl"
                    style={{ background: '#0f2744', border: '1px solid rgba(56,189,248,0.15)' }}
                >
                    <input
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search diagnosis (e.g. hypertension, J18…)"
                        className="input input-dark w-full text-sm mb-2"
                    />
                    {results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map(r => (
                                <button
                                    key={r.code}
                                    type="button"
                                    onClick={() => addCode(r)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                                        style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                                        {r.code}
                                    </span>
                                    <span className="text-xs" style={{ color: '#e2eaf4' }}>{r.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <p className="text-xs text-center py-2" style={{ color: '#475569' }}>No matches</p>
                    ) : (
                        <p className="text-xs text-center py-2" style={{ color: '#475569' }}>Type at least 2 characters to search</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Patient Context Panel ───────────────────────────────────────────────────
function PatientContextPanel({ patientId }: { patientId: string }) {
    const [open, setOpen] = useState(true);
    const records = vaultApi.getRecords(patientId);
    const encounters = vaultApi.getEncounters(patientId);

    const medications = records.filter(r => r.type === 'Prescription');
    const allergies = records.filter(r => r.type === 'Allergy');
    const lastVisit = encounters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return (
        <div className="card-provider overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                    <FileText size={15} style={{ color: '#38bdf8' }} />
                    Patient Context
                </h3>
                {open ? <ChevronUp size={16} style={{ color: '#7ba3c8' }} /> : <ChevronDown size={16} style={{ color: '#7ba3c8' }} />}
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-5">

                    {/* Allergies — always first, always critical */}
                    {allergies.length > 0 && (
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5"
                                style={{ color: '#ef4444' }}>
                                <AlertTriangle size={10} /> Allergies / Adverse Reactions
                            </div>
                            <div className="space-y-1.5">
                                {allergies.map(a => (
                                    <div key={a.id}
                                        className="flex items-start gap-2 px-3 py-2 rounded-lg"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                                        <div>
                                            <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>{a.title}</div>
                                            <div className="text-[10px] mt-0.5" style={{ color: '#7ba3c8' }}>{a.summary}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active medications */}
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5"
                            style={{ color: '#38bdf8' }}>
                            <Pill size={10} /> Active Medications
                        </div>
                        {medications.length === 0 ? (
                            <p className="text-xs" style={{ color: '#475569' }}>None on record</p>
                        ) : (
                            <div className="space-y-1.5">
                                {medications.map(m => (
                                    <div key={m.id}
                                        className="flex items-start gap-2 px-3 py-2 rounded-lg"
                                        style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.1)' }}>
                                        <Pill size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#38bdf8' }} />
                                        <div>
                                            <div className="text-xs font-bold" style={{ color: '#e2eaf4' }}>{m.title}</div>
                                            <div className="text-[10px] mt-0.5" style={{ color: '#7ba3c8' }}>{m.summary}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Last visit summary */}
                    {lastVisit && (
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5"
                                style={{ color: '#a855f7' }}>
                                <Clock size={10} /> Last Visit
                            </div>
                            <div
                                className="px-3 py-2.5 rounded-lg"
                                style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}
                            >
                                <div className="text-[10px] font-bold mb-1" style={{ color: '#c4b5fd' }}>
                                    {new Date(lastVisit.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} — {lastVisit.type.toUpperCase()}
                                </div>
                                <div className="text-[11px] leading-relaxed" style={{ color: '#7ba3c8' }}>
                                    <span className="font-semibold" style={{ color: '#e2eaf4' }}>S: </span>{lastVisit.soap?.subjective}<br />
                                    <span className="font-semibold" style={{ color: '#e2eaf4' }}>A: </span>{lastVisit.soap?.assessment}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function NewEncounterPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patient, setPatient] = useState('pat_001');
    const [type, setType] = useState<'soap' | 'telemed' | 'follow_up'>('soap');
    const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
    const [saved, setSaved] = useState(false);
    const [publishToVault, setPublishToVault] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiDone, setAiDone] = useState(false);

    const updateSoap = (key: string, value: string) =>
        setSoap(prev => ({ ...prev, [key]: value }));

    const appendDictation = (key: string, text: string) =>
        setSoap(prev => ({
            ...prev,
            [key]: prev[key as keyof typeof prev] ? `${prev[key as keyof typeof prev]}\n${text}` : text,
        }));

    const handleAutoGenerate = () => {
        setAiLoading(true);
        setTimeout(() => {
            setSoap(AI_SOAP);
            setAiLoading(false);
            setAiDone(true);
        }, 2000);
    };

    const saveDraft = () => {
        setSaved(true);
        setTimeout(() => { setSaved(false); navigate('/provider/overview'); }, 1500);
    };

    const SOAP_FIELDS = [
        { key: 'subjective', label: 'S — Subjective', sublabel: 'Chief complaint & patient-reported symptoms', placeholder: 'Patient reports…', rows: 4 },
        { key: 'objective', label: 'O — Objective', sublabel: 'Vitals, physical exam, lab results', placeholder: 'BP, HR, Temp, SpO₂, exam findings…', rows: 4 },
        { key: 'assessment', label: 'A — Assessment', sublabel: 'Diagnosis / differential diagnosis', placeholder: 'Working diagnosis or differential…', rows: 3, hasICD: true },
        { key: 'plan', label: 'P — Plan', sublabel: 'Treatment, medications, referrals, follow-up', placeholder: 'Treatment plan…', rows: 4 },
    ];

    return (
        <div className="animate-fade-in" style={{ maxWidth: 1100 }}>
            <button onClick={() => navigate('/provider/patients')}
                className="flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80"
                style={{ color: '#7ba3c8' }}>
                <ArrowLeft size={16} /> Back to Patients
            </button>

            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>New Encounter</h1>
                    <p className="text-sm mt-1" style={{ color: '#7ba3c8' }}>Document a patient visit, telehealth session, or follow-up</p>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                AI HERO BANNER — dominant CTA, not a corner button
            ═══════════════════════════════════════════════════════════════ */}
            <div className="card-provider p-5 mb-6 relative overflow-hidden"
                style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.06)' }}>
                {/* Glow blob */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={16} style={{ color: '#a855f7' }} />
                            <span className="font-black text-sm" style={{ color: '#e2eaf4' }}>WelliMate AI Documentation</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                                Beta
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#7ba3c8' }}>
                            Speak or type your consultation notes — WelliMate will structure them into SOAP format automatically.
                            Saves an average of <span style={{ color: '#e2eaf4', fontWeight: 700 }}>12 minutes per consultation.</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAutoGenerate}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg flex-shrink-0 disabled:opacity-60"
                        style={{ background: 'rgba(168,85,247,0.8)', color: '#fff', border: '1px solid rgba(168,85,247,0.6)' }}
                    >
                        {aiLoading ? (
                            <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating…</>
                        ) : aiDone ? (
                            <><CheckCircle size={15} /> Regenerate</>
                        ) : (
                            <><Wand2 size={15} /> Auto-Generate SOAP Note</>
                        )}
                    </button>
                </div>
            </div>

            {/* ══════════════════════ Two-column layout ══════════════════════ */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left — form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Patient & Type */}
                    <div className="card-provider p-5 grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#e2eaf4' }}>Patient</label>
                            <select value={patient} onChange={e => setPatient(e.target.value)} className="input input-dark">
                                {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}, {p.age} yrs</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#e2eaf4' }}>Encounter Type</label>
                            <select value={type} onChange={e => setType(e.target.value as any)} className="input input-dark">
                                <option value="soap">SOAP Note (In-Person)</option>
                                <option value="telemed">Telehealth Session</option>
                                <option value="follow_up">Follow-Up Visit</option>
                            </select>
                        </div>
                    </div>

                    {/* SOAP Note */}
                    <div className="card-provider p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold" style={{ color: '#e2eaf4' }}>SOAP Note</h2>
                            {aiDone && (
                                <div className="flex items-center gap-1.5 text-xs font-bold"
                                    style={{ color: '#a855f7' }}>
                                    <CheckCircle size={13} /> AI Generated · Review before saving
                                </div>
                            )}
                        </div>

                        {SOAP_FIELDS.map(f => (
                            <div key={f.key}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div>
                                        <label className="text-sm font-bold" style={{ color: '#38bdf8' }}>{f.label}</label>
                                        <span className="text-[11px] ml-2" style={{ color: '#475569' }}>{f.sublabel}</span>
                                    </div>
                                    <DictateButton fieldKey={f.key} onDictate={appendDictation} />
                                </div>
                                {/* ICD-10 lookup only on Assessment */}
                                {f.hasICD && (
                                    <ICD10Suggest
                                        value={soap.assessment}
                                        onChange={v => updateSoap('assessment', v)}
                                    />
                                )}
                                <textarea
                                    rows={f.rows}
                                    value={soap[f.key as keyof typeof soap]}
                                    onChange={e => updateSoap(f.key, e.target.value)}
                                    className="input input-dark w-full resize-none"
                                    placeholder={f.placeholder}
                                    style={{
                                        borderColor: aiDone ? 'rgba(168,85,247,0.2)' : undefined,
                                        background: aiDone && soap[f.key as keyof typeof soap] ? 'rgba(168,85,247,0.04)' : undefined,
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Publish toggle */}
                    <div className="card-provider p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="font-semibold text-sm" style={{ color: '#e2eaf4' }}>Publish to Patient Vault</div>
                            <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                                Patient will be notified and can view this encounter
                            </div>
                        </div>
                        <div
                            onClick={() => setPublishToVault(p => !p)}
                            style={{
                                width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
                                background: publishToVault ? '#0d9488' : '#334155',
                                position: 'relative', transition: 'background .2s',
                            }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: 3,
                                left: publishToVault ? 21 : 3, transition: 'left .2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                            }} />
                        </div>
                    </div>

                    {/* Actions — brand-matched colours, no jarring cyan */}
                    <div className="flex gap-3">
                        <button
                            onClick={saveDraft}
                            className="btn flex-1 justify-center gap-2 font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ background: '#0d9488', color: '#fff' }}
                        >
                            {saved
                                ? <><CheckCircle size={16} /> Saved!</>
                                : <><Save size={16} /> Save &amp; Complete Encounter</>
                            }
                        </button>
                        <button
                            className="btn px-5 font-bold transition-colors hover:bg-white/5"
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#7ba3c8' }}
                        >
                            Save Draft
                        </button>
                    </div>
                </div>

                {/* Right — Patient Context Panel */}
                <div className="space-y-4">
                    <PatientContextPanel patientId={patient} />

                    {/* Quick stats from vault */}
                    <div className="card-provider p-4">
                        <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                            <Activity size={14} style={{ color: '#38bdf8' }} />
                            Recent Vitals
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Blood Pressure', value: '162/98', unit: 'mmHg', status: 'high', lastSeen: 'Today' },
                                { label: 'Heart Rate', value: '84', unit: 'bpm', status: 'normal', lastSeen: 'Today' },
                                { label: 'Glucose', value: '108', unit: 'mg/dL', status: 'borderline', lastSeen: '20 Jan' },
                            ].map(v => (
                                <div key={v.label} className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] font-bold" style={{ color: '#7ba3c8' }}>{v.label}</div>
                                        <div className="text-xs" style={{ color: '#475569' }}>{v.lastSeen}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-sm" style={{
                                            color: v.status === 'high' ? '#ef4444' : v.status === 'borderline' ? '#f59e0b' : '#10b981',
                                        }}>
                                            {v.value}
                                        </span>
                                        <span className="text-[10px] ml-1" style={{ color: '#475569' }}>{v.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
