import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, CheckCircle, Wand2, Mic, ChevronDown,
    ChevronUp, Pill, AlertTriangle, FileText, Search,
    Clock, Activity, Info,
} from 'lucide-react';
import { getPatients } from '@/shared/utils/utilityFunction';
import { getPatientRecords, createRecord } from '@/shared/api/clinicalApi';

// ─── ICD-10 quick-reference ─────────────────────────────────────────────────
// A small curated list of common codes to speed up typing an assessment —
// not a full ICD-10 database.
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

type PatientOption = { patientId: string; fullName: string; dateOfBirth?: string | null };

function ageFromDob(dob?: string | null) {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
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
                        placeholder="Search common codes (e.g. hypertension, J18…)"
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
                        <p className="text-xs text-center py-2" style={{ color: '#475569' }}>No matches in this starter list</p>
                    ) : (
                        <p className="text-xs text-center py-2" style={{ color: '#475569' }}>Type at least 2 characters to search</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Patient Context Panel — real data only ─────────────────────────────────
function PatientContextPanel({ patientId }: { patientId: string }) {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allergies, setAllergies] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [lastVisit, setLastVisit] = useState<any | null>(null);

    useEffect(() => {
        if (!patientId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            getPatientRecords('allergies', patientId, { limit: 20 }).catch(() => null),
            getPatientRecords('medications', patientId, { limit: 20 }).catch(() => null),
            getPatientRecords('encounter', patientId, { limit: 1 }).catch(() => null),
        ]).then(([allergyRes, medRes, encounterRes]) => {
            if (cancelled) return;
            setAllergies(allergyRes?.data?.items ?? []);
            setMedications((medRes?.data?.items ?? []).filter((m: any) => m.medicationStatus === 'active'));
            setLastVisit(encounterRes?.data?.items?.[0] ?? null);
            if (!allergyRes && !medRes && !encounterRes) {
                setError('Could not load patient context');
            }
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });

        return () => { cancelled = true; };
    }, [patientId]);

    return (
        <div className="card-provider overflow-hidden">
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
                    {loading ? (
                        <div className="flex items-center gap-2 py-4">
                            <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#38bdf8', borderTopColor: 'transparent' }} />
                            <span className="text-xs" style={{ color: '#7ba3c8' }}>Loading patient context…</span>
                        </div>
                    ) : error ? (
                        <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
                    ) : (
                        <>
                            {/* Allergies — always first, always critical */}
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5"
                                    style={{ color: '#ef4444' }}>
                                    <AlertTriangle size={10} /> Allergies / Adverse Reactions
                                </div>
                                {allergies.length === 0 ? (
                                    <p className="text-xs" style={{ color: '#475569' }}>None on record</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {allergies.map(a => (
                                            <div key={a.id}
                                                className="flex items-start gap-2 px-3 py-2 rounded-lg"
                                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                                                <div>
                                                    <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>{a.allergen}</div>
                                                    <div className="text-[10px] mt-0.5" style={{ color: '#7ba3c8' }}>
                                                        {a.reaction || 'No reaction details on file'}
                                                        {a.severity && a.severity !== 'unknown' ? ` · ${a.severity}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

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
                                                    <div className="text-xs font-bold" style={{ color: '#e2eaf4' }}>
                                                        {m.medicationName}{m.dosage?.value ? ` ${m.dosage.value}${m.dosage.unit || ''}` : ''}
                                                    </div>
                                                    <div className="text-[10px] mt-0.5" style={{ color: '#7ba3c8' }}>
                                                        {[m.frequency, m.indication].filter(Boolean).join(' · ') || 'No details on file'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Last visit summary */}
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5"
                                    style={{ color: '#a855f7' }}>
                                    <Clock size={10} /> Last Visit
                                </div>
                                {!lastVisit ? (
                                    <p className="text-xs" style={{ color: '#475569' }}>No previous visits on record</p>
                                ) : (
                                    <div
                                        className="px-3 py-2.5 rounded-lg"
                                        style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}
                                    >
                                        <div className="text-[10px] font-bold mb-1" style={{ color: '#c4b5fd' }}>
                                            {new Date(lastVisit.startedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {lastVisit.encounterType ? ` — ${String(lastVisit.encounterType).toUpperCase()}` : ''}
                                        </div>
                                        <div className="text-[11px] leading-relaxed" style={{ color: '#7ba3c8' }}>
                                            {lastVisit.chiefComplaint && (
                                                <><span className="font-semibold" style={{ color: '#e2eaf4' }}>Chief complaint: </span>{lastVisit.chiefComplaint}<br /></>
                                            )}
                                            {lastVisit.notes ? (
                                                <><span className="font-semibold" style={{ color: '#e2eaf4' }}>Notes: </span>{lastVisit.notes}</>
                                            ) : !lastVisit.chiefComplaint ? (
                                                <span style={{ color: '#475569' }}>No notes on file for this visit</span>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Recent Vitals Panel — real data only ───────────────────────────────────
function RecentVitalsPanel({ patientId }: { patientId: string }) {
    const [loading, setLoading] = useState(true);
    const [vitals, setVitals] = useState<any | null>(null);

    useEffect(() => {
        if (!patientId) return;
        let cancelled = false;
        setLoading(true);
        getPatientRecords('vitals', patientId, { limit: 1 })
            .then((res: any) => {
                if (cancelled) return;
                setVitals(res?.data?.items?.[0] ?? null);
            })
            .catch(() => { if (!cancelled) setVitals(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [patientId]);

    const rows = vitals ? [
        vitals.bloodPressure?.systolic != null && vitals.bloodPressure?.diastolic != null
            ? { label: 'Blood Pressure', value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`, unit: 'mmHg' }
            : null,
        vitals.heartRate != null ? { label: 'Heart Rate', value: String(vitals.heartRate), unit: 'bpm' } : null,
        vitals.bloodGlucose?.value != null ? { label: 'Glucose', value: String(vitals.bloodGlucose.value), unit: vitals.bloodGlucose.unit || 'mg/dL' } : null,
        vitals.temperature?.value != null ? { label: 'Temperature', value: String(vitals.temperature.value), unit: `°${vitals.temperature.unit || 'C'}` } : null,
    ].filter(Boolean) as { label: string; value: string; unit: string }[] : [];

    return (
        <div className="card-provider p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                <Activity size={14} style={{ color: '#38bdf8' }} />
                Recent Vitals
            </h3>
            {loading ? (
                <p className="text-xs" style={{ color: '#7ba3c8' }}>Loading…</p>
            ) : rows.length === 0 ? (
                <p className="text-xs" style={{ color: '#475569' }}>No vitals on record</p>
            ) : (
                <div className="space-y-2">
                    {rows.map(v => (
                        <div key={v.label} className="flex items-center justify-between">
                            <div className="text-[11px] font-bold" style={{ color: '#7ba3c8' }}>{v.label}</div>
                            <div className="text-right">
                                <span className="font-black text-sm" style={{ color: '#e2eaf4' }}>{v.value}</span>
                                <span className="text-[10px] ml-1" style={{ color: '#475569' }}>{v.unit}</span>
                            </div>
                        </div>
                    ))}
                    <div className="text-[10px] pt-1" style={{ color: '#475569' }}>
                        Recorded {new Date(vitals.measuredAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function NewEncounterPage() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [patientSearch, setPatientSearch] = useState('');
    const [patient, setPatient] = useState('');
    const [type, setType] = useState<'soap' | 'telemed' | 'follow_up'>('soap');
    const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    useEffect(() => {
        setPatientsLoading(true);
        getPatients({ search: '', page: 1, limit: 50 })
            .then((res) => {
                const list = res?.patients ?? [];
                setPatients(list);
                if (list.length > 0) setPatient(list[0].patientId);
            })
            .catch(() => setPatients([]))
            .finally(() => setPatientsLoading(false));
    }, []);

    const filteredPatients = patientSearch.trim()
        ? patients.filter(p => p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()))
        : patients;

    const updateSoap = (key: string, value: string) =>
        setSoap(prev => ({ ...prev, [key]: value }));

    const save = async () => {
        if (!patient) return;
        setSaving(true);
        setSaveError(null);
        try {
            const notes = [
                soap.objective && `Objective: ${soap.objective}`,
                soap.assessment && `Assessment: ${soap.assessment}`,
                soap.plan && `Plan: ${soap.plan}`,
            ].filter(Boolean).join('\n\n');

            const encounterTypeMap: Record<string, string> = {
                soap: 'outpatient',
                telemed: 'telemedicine',
                follow_up: 'outpatient',
            };

            await createRecord('encounter', {
                patientId: patient,
                encounterType: encounterTypeMap[type],
                chiefComplaint: soap.subjective || undefined,
                notes: notes || undefined,
                status: 'completed',
            });

            setSaved(true);
            setTimeout(() => { setSaved(false); navigate('/provider/patients'); }, 1200);
        } catch (err: any) {
            setSaveError(err?.message || 'Failed to save encounter. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const SOAP_FIELDS = [
        { key: 'subjective', label: 'S — Subjective', sublabel: 'Chief complaint & patient-reported symptoms', placeholder: 'Patient reports…', rows: 4 },
        { key: 'objective', label: 'O — Objective', sublabel: 'Vitals, physical exam, lab results', placeholder: 'BP, HR, Temp, SpO₂, exam findings…', rows: 4 },
        { key: 'assessment', label: 'A — Assessment', sublabel: 'Diagnosis / differential diagnosis', placeholder: 'Working diagnosis or differential…', rows: 3, hasICD: true },
        { key: 'plan', label: 'P — Plan', sublabel: 'Treatment, medications, referrals, follow-up', placeholder: 'Treatment plan…', rows: 4 },
    ];

    return (
        <div className="animate-fade-in w-[90%] mx-auto">
            {toastMsg && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-xl">
                    <Info size={16} className="text-sky-400" />
                    {toastMsg}
                </div>
            )}

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

            <div className="card-provider p-5 mb-6 relative overflow-hidden"
                style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.06)' }}>
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Wand2 size={16} style={{ color: '#a855f7' }} />
                            <span className="font-black text-sm" style={{ color: '#e2eaf4' }}>WelliMate AI Documentation</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(148,163,184,0.2)', color: '#cbd5e1' }}>
                                Coming soon
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#7ba3c8' }}>
                            Structuring dictated or typed notes into SOAP format automatically isn't available yet.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => showToast('AI documentation — coming soon')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 opacity-60 cursor-not-allowed"
                        style={{ background: 'rgba(168,85,247,0.4)', color: '#fff', border: '1px solid rgba(168,85,247,0.3)' }}
                    >
                        <Wand2 size={15} /> Auto-Generate SOAP Note
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-provider p-5 grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#e2eaf4' }}>Patient</label>
                            {patientsLoading ? (
                                <div className="input input-dark flex items-center text-sm" style={{ color: '#7ba3c8' }}>Loading patients…</div>
                            ) : patients.length === 0 ? (
                                <div className="input input-dark flex items-center text-sm" style={{ color: '#ef4444' }}>No patients found for your organization</div>
                            ) : (
                                <>
                                    <input
                                        value={patientSearch}
                                        onChange={e => setPatientSearch(e.target.value)}
                                        placeholder="Search patient…"
                                        className="input input-dark w-full text-sm mb-1.5"
                                    />
                                    <select value={patient} onChange={e => setPatient(e.target.value)} className="input input-dark">
                                        {filteredPatients.map(p => {
                                            const age = ageFromDob(p.dateOfBirth);
                                            return (
                                                <option key={p.patientId} value={p.patientId}>
                                                    {p.fullName}{age != null ? `, ${age} yrs` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </>
                            )}
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

                    <div className="card-provider p-5 space-y-5">
                        <h2 className="font-bold" style={{ color: '#e2eaf4' }}>SOAP Note</h2>

                        {SOAP_FIELDS.map(f => (
                            <div key={f.key}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div>
                                        <label className="text-sm font-bold" style={{ color: '#38bdf8' }}>{f.label}</label>
                                        <span className="text-[11px] ml-2" style={{ color: '#475569' }}>{f.sublabel}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => showToast('Voice dictation — coming soon')}
                                        title="Dictation coming soon"
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed"
                                        style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}
                                    >
                                        <Mic size={12} /> Dictate
                                    </button>
                                </div>
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
                                />
                            </div>
                        ))}
                    </div>

                    <div className="card-provider p-4 flex items-start gap-3">
                        <Info size={16} style={{ color: '#7ba3c8', marginTop: 2 }} />
                        <div className="text-xs" style={{ color: '#7ba3c8' }}>
                            This encounter will be visible to the patient in their vault once saved. Per-encounter visibility control isn't available yet.
                        </div>
                    </div>

                    {saveError && (
                        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            {saveError}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={save}
                            disabled={saving || !patient}
                            className="btn flex-1 justify-center gap-2 font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                            style={{ background: '#0d9488', color: '#fff' }}
                        >
                            {saved
                                ? <><CheckCircle size={16} /> Saved!</>
                                : saving
                                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                                    : <><Save size={16} /> Save &amp; Complete Encounter</>
                            }
                        </button>
                        <button
                            onClick={() => showToast('Save as draft — coming soon')}
                            className="btn px-5 font-bold transition-colors hover:bg-white/5"
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#7ba3c8' }}
                        >
                            Save Draft
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {patient && <PatientContextPanel patientId={patient} />}
                    {patient && <RecentVitalsPanel patientId={patient} />}
                </div>
            </div>
        </div>
    );
}
