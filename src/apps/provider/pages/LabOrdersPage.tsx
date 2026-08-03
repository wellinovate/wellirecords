import React, { useEffect, useState } from 'react';
import { FlaskConical, Plus, CheckCircle, Clock, X, ShieldCheck } from 'lucide-react';
import { getAllPatientLabResults, getPatients, LabResultItem } from '@/shared/utils/utilityFunction';
import { createRecord } from '@/shared/api/clinicalApi';

const STATUS_FILTERS = ['all', 'unverified', 'patient-uploaded', 'provider-reviewed', 'lab-verified'];

export function LabOrdersPage() {
    const [labResults, setLabResults] = useState<LabResultItem[]>([]);
    const [loadingLabResults, setLoadingLabResults] = useState(false);
    const [labResultsError, setLabResultsError] = useState("");
    const [filter, setFilter] = useState<string>('all');
    const [showNew, setShowNew] = useState(false);

    const loadLabResults = async () => {
        try {
            setLoadingLabResults(true);
            setLabResultsError("");
            const result = await getAllPatientLabResults(1, 10);
            setLabResults(result.items || []);
        } catch (err: any) {
            setLabResultsError(err.message || "Failed to load lab results");
        } finally {
            setLoadingLabResults(false);
        }
    };

    useEffect(() => {
        loadLabResults();
    }, []);

    const filtered = filter === 'all' ? labResults : labResults.filter(o => o.verificationStatus === filter);

    return (
        <div className="animate-fade-in px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Lab Results</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Record and review patient lab results</p>
                </div>
                <button
                    onClick={() => setShowNew(true)}
                    className="btn btn-provider gap-2"
                >
                    <Plus size={16} /> Record Lab Result
                </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {STATUS_FILTERS.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                        style={{ background: filter === s ? '#38bdf8' : 'rgba(56,189,248,.06)', color: filter === s ? '#050d1a' : '#7ba3c8', border: `1px solid ${filter === s ? '#38bdf8' : 'rgba(56,189,248,.15)'}` }}>
                        {s.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {loadingLabResults ? (
                <div className="card-provider p-10 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>Loading lab results…</p></div>
            ) : labResultsError ? (
                <div className="card-provider p-10 text-center"><p className="text-sm" style={{ color: '#ef4444' }}>{labResultsError}</p></div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(o => (
                        <div key={o.id} className="card-provider p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,.1)' }}>
                                        <FlaskConical size={18} style={{ color: '#a855f7' }} />
                                    </div>
                                    <div>
                                        <div className="font-bold" style={{ color: '#e2eaf4' }}>{o.testName}</div>
                                        <div className="text-xs" style={{ color: '#7ba3c8' }}>
                                            Patient ID: {o.patientId} · {new Date(o.resultedAt || o.collectedAt || o.createdAt).toLocaleDateString()}
                                        </div>
                                        {o.resultValue && (
                                            <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(16,185,129,.06)', borderLeft: '3px solid rgba(16,185,129,.4)', color: '#7ba3c8' }}>
                                                {o.resultValue}{o.unit ? ` ${o.unit}` : ''}{o.interpretation ? ` — ${o.interpretation}` : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-1.5">
                                        {o.verificationStatus === 'lab-verified'
                                            ? <CheckCircle size={14} style={{ color: '#10b981' }} />
                                            : <Clock size={14} style={{ color: '#f59e0b' }} />}
                                        <span className="badge">{(o.verificationStatus || 'unverified').replace('-', ' ')}</span>
                                    </div>
                                    {o.verificationStatus === 'lab-verified' && (
                                        <span className="flex items-center gap-1 badge badge-active text-[10px]" style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.2)' }}>
                                            <ShieldCheck size={10} /> WelliChain Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="card-provider p-10 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No results matching this filter</p></div>
                    )}
                </div>
            )}

            {showNew && (
                <NewLabResultModal
                    onClose={() => setShowNew(false)}
                    onCreated={() => { setShowNew(false); loadLabResults(); }}
                />
            )}
        </div>
    );
}

function NewLabResultModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [patients, setPatients] = useState<{ patientId: string; fullName: string }[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [patientId, setPatientId] = useState('');
    const [testName, setTestName] = useState('');
    const [resultValue, setResultValue] = useState('');
    const [unit, setUnit] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPatients({ page: 1, limit: 50 })
            .then((res) => {
                const list = res?.patients ?? [];
                setPatients(list);
                if (list.length > 0) setPatientId(list[0].patientId);
            })
            .catch(() => setPatients([]))
            .finally(() => setPatientsLoading(false));
    }, []);

    const submit = async () => {
        if (!patientId || !testName.trim()) return;
        setSaving(true);
        setError(null);
        try {
            await createRecord('lab-results', {
                patientId,
                testName: testName.trim(),
                resultValue: resultValue || undefined,
                unit: unit || undefined,
                verificationStatus: resultValue ? 'provider-reviewed' : 'unverified',
            });
            onCreated();
        } catch (err: any) {
            setError(err?.message || 'Failed to record lab result');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
            <div className="card-provider w-full max-w-md p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>Record Lab Result</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Patient</label>
                        {patientsLoading ? (
                            <div className="input input-dark text-sm" style={{ color: '#7ba3c8' }}>Loading patients…</div>
                        ) : (
                            <select className="input input-dark" value={patientId} onChange={e => setPatientId(e.target.value)}>
                                {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Test Name</label>
                        <input className="input input-dark w-full" placeholder="e.g. Full Blood Count" value={testName} onChange={e => setTestName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Result (optional)</label><input className="input input-dark" placeholder="Leave blank if pending" value={resultValue} onChange={e => setResultValue(e.target.value)} /></div>
                        <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Unit</label><input className="input input-dark" placeholder="e.g. mg/dL" value={unit} onChange={e => setUnit(e.target.value)} /></div>
                    </div>
                    {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
                    <button onClick={submit} disabled={saving || !patientId || !testName.trim()} className="btn btn-provider w-full justify-center disabled:opacity-60">
                        {saving ? 'Saving…' : 'Save Lab Result'}
                    </button>
                </div>
            </div>
        </div>
    );
}
