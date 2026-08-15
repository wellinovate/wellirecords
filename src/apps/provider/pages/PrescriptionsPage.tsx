import { Pill, Plus, X, ShieldCheck } from 'lucide-react';
import { getAllPatientMedications, getPatients, MedicationItem } from '@/shared/utils/utilityFunction';
import { createRecord } from '@/shared/api/clinicalApi';
import { consentApi, ProviderGrant } from '@/shared/api/consentApi';

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-active', completed: 'badge-verified', stopped: 'badge-revoked', 'on-hold': 'badge-expired',
};
const STATUS_FILTERS = ['all', 'active', 'completed', 'stopped', 'on-hold'];

export function PrescriptionsPage() {
    const [filter, setFilter] = useState<string>('all');
    const [medications, setMedications] = useState<MedicationItem[]>([]);
    const [loadingMedications, setLoadingMedications] = useState(false);
    const [medicationsError, setMedicationsError] = useState("");
    const [showNew, setShowNew] = useState(false);

    const loadMedications = async () => {
        try {
            setLoadingMedications(true);
            setMedicationsError("");
            const result = await getAllPatientMedications(1, 10);
            setMedications(result.items || []);
        } catch (err: any) {
            setMedicationsError(err.message || "Failed to load medications");
        } finally {
            setLoadingMedications(false);
        }
    };

    useEffect(() => {
        loadMedications();
    }, []);

    const filtered = filter === 'all' ? medications : medications.filter(r => r.medicationStatus === filter);

    return (
        <div className="animate-fade-in px-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Prescriptions &amp; Medications</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Manage active prescriptions and medication history</p>
                </div>
                <button
                    onClick={() => setShowNew(true)}
                    className="btn btn-provider gap-2"
                >
                    <Plus size={16} /> New Prescription
                </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {STATUS_FILTERS.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                        style={{ background: filter === s ? '#38bdf8' : 'rgba(56,189,248,.06)', color: filter === s ? '#050d1a' : '#7ba3c8', border: `1px solid ${filter === s ? '#38bdf8' : 'rgba(56,189,248,.15)'}` }}>
                        {s}
                    </button>
                ))}
            </div>

            {loadingMedications ? (
                <div className="card-provider p-8 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>Loading prescriptions…</p></div>
            ) : medicationsError ? (
                <div className="card-provider p-8 text-center"><p className="text-sm" style={{ color: '#ef4444' }}>{medicationsError}</p></div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(rx => (
                        <div key={rx.id} className="card-provider p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,.1)' }}>
                                        <Pill size={18} style={{ color: '#10b981' }} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg" style={{ color: '#e2eaf4' }}>{rx.medicationName}</div>
                                        <div className="text-sm" style={{ color: '#38bdf8' }}>
                                            {rx.dosage?.value ? `${rx.dosage.value}${rx.dosage.unit || ''}` : 'Dose not on file'} · {rx.frequency || 'Frequency not on file'}
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: '#7ba3c8' }}>
                                            Patient ID: {rx.patientId} · Duration: {rx.duration || 'N/A'}
                                        </div>
                                        <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                                            Prescribed by: {rx.prescribedByFullName || 'Not on file'} <br /> Date: {new Date(rx.createdAt).toLocaleDateString()}
                                        </div>
                                        {rx.notes && <p className="text-xs italic mt-1" style={{ color: '#3e5a78' }}>{rx.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`badge ${STATUS_BADGE[rx.medicationStatus || 'active']}`}>{rx.medicationStatus}</span>
                                    {rx.medicationStatus === 'active' && (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                                            <ShieldCheck size={10} /> WelliChain Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="card-provider p-8 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No prescriptions found</p></div>}
                </div>
            )}

            {showNew && (
                <NewPrescriptionModal
                    onClose={() => setShowNew(false)}
                    onCreated={() => { setShowNew(false); loadMedications(); }}
                />
            )}
        </div>
    );
}

function NewPrescriptionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [patients, setPatients] = useState<{ patientId: string; fullName: string }[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [patientId, setPatientId] = useState('');
    const [medicationName, setMedicationName] = useState('');
    const [doseValue, setDoseValue] = useState('');
    const [doseUnit, setDoseUnit] = useState('mg');
    const [frequency, setFrequency] = useState('Once daily');
    const [duration, setDuration] = useState('7 days');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Grants where this provider (or their org) is the grantee — shown
    // as a status hint only. The backend's requireWriteConsent
    // middleware is the actual boundary; this can only under- or
    // over-report status in the UI, never grant access it wouldn't
    // otherwise have.
    const [providerGrants, setProviderGrants] = useState<ProviderGrant[]>([]);

    useEffect(() => {
        consentApi.getMyGrantsAsProvider().then(setProviderGrants);
    }, []);

    const hasWriteConsent = (
        forPatientId: string | undefined | null,
        category: string,
    ): boolean | null => {
        if (!forPatientId) return null;
        const now = new Date();
        return providerGrants.some((g) => {
            const grantPatientId =
                typeof g.patientId === 'string' ? g.patientId : g.patientId?._id;
            if (grantPatientId !== forPatientId) return false;
            if (g.status !== 'active') return false;
            if (!g.permissions?.write) return false;
            if (g.expiresAt && new Date(g.expiresAt) <= now) return false;
            return (
                g.accessScope === 'full-record' ||
                (g.accessScope === 'category' && g.category === category)
            );
        });
    };

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
        if (!patientId || !medicationName.trim()) return;
        setSaving(true);
        setError(null);
        try {
            await createRecord('medications', {
                patientId,
                medicationName: medicationName.trim(),
                dosage: doseValue ? { value: Number(doseValue), unit: doseUnit } : undefined,
                frequency,
                duration,
                notes: notes || undefined,
                medicationStatus: 'active',
            });
            onCreated();
        } catch (err: any) {
            setError(err?.message || 'Failed to issue prescription');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
            <div className="card-provider w-full max-w-md p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>New Prescription</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Patient</label>
                        {patientsLoading ? (
                            <div className="input input-dark text-sm" style={{ color: '#7ba3c8' }}>Loading patients…</div>
                        ) : patients.length === 0 ? (
                            <div className="input input-dark text-sm" style={{ color: '#ef4444' }}>No patients found</div>
                        ) : (
                            <select className="input input-dark" value={patientId} onChange={e => setPatientId(e.target.value)}>
                                {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
                            </select>
                        )}
                    </div>

                    {patientId && hasWriteConsent(patientId, 'medications') === false && (
                        <div className="rounded-xl p-3" style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)' }}>
                            <p className="text-sm font-semibold" style={{ color: '#fbbf24' }}>No write consent on file</p>
                            <p className="mt-1 text-xs" style={{ color: 'rgba(251,191,36,.8)' }}>
                                This patient hasn't granted you write access to medication records.
                                Submitting will be rejected until they do — ask them to enable
                                "Allow write access" when granting you access in their app.
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Drug Name</label><input className="input input-dark" placeholder="e.g. Metformin" value={medicationName} onChange={e => setMedicationName(e.target.value)} /></div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Dose</label>
                            <div className="flex gap-1">
                                <input className="input input-dark" placeholder="500" value={doseValue} onChange={e => setDoseValue(e.target.value)} />
                                <input className="input input-dark w-16" placeholder="mg" value={doseUnit} onChange={e => setDoseUnit(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Frequency</label>
                            <select className="input input-dark" value={frequency} onChange={e => setFrequency(e.target.value)}>
                                <option>Once daily</option><option>Twice daily</option><option>Three times daily</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Duration</label>
                            <select className="input input-dark" value={duration} onChange={e => setDuration(e.target.value)}>
                                <option>7 days</option><option>14 days</option><option>30 days</option><option>90 days</option>
                            </select>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Notes (optional)</label><textarea className="input input-dark w-full resize-none" rows={2} placeholder="Additional instructions…" value={notes} onChange={e => setNotes(e.target.value)} /></div>
                    {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
                    <button onClick={submit} disabled={saving || !patientId || !medicationName.trim()} className="btn btn-provider w-full justify-center disabled:opacity-60">
                        {saving ? 'Issuing…' : 'Issue Prescription'}
                    </button>
                </div>
            </div>
        </div>
    );
}
