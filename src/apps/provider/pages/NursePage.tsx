import React, { useEffect, useState } from 'react';
import {
    Activity, Heart, Thermometer, Droplets, Wind,
    Mic, Check, Clock, Save,
} from 'lucide-react';
import { getQueueApi, saveTriageApi } from '@/modules/queue/api';
import type { QueueItem } from '@/modules/queue/types';

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
    emergency: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    urgent: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    normal: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

function patientName(item: QueueItem) {
    return typeof item.patientId === 'object' && item.patientId ? item.patientId.fullName : 'Unknown patient';
}

function arrivalTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

export function NursePage() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<QueueItem | null>(null);
    const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '' });
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadQueue = () => {
        setLoading(true);
        setError(null);
        getQueueApi()
            .then((res: any) => {
                const items: QueueItem[] = res?.items ?? [];
                setQueue(items);
                if (items.length > 0) setSelected((prev) => prev ?? items[0]);
            })
            .catch((err: any) => setError(err?.message || 'Failed to load the triage queue'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadQueue(); }, []);

    useEffect(() => {
        if (!selected) return;
        setVitals({
            bp: selected.vitals?.bloodPressure ?? '',
            pulse: selected.vitals?.pulse != null ? String(selected.vitals.pulse) : '',
            temp: selected.vitals?.temperature != null ? String(selected.vitals.temperature) : '',
            spo2: selected.vitals?.spo2 != null ? String(selected.vitals.spo2) : '',
            weight: selected.vitals?.weight != null ? String(selected.vitals.weight) : '',
        });
        setNote(selected.triageNotes ?? '');
        setSaved(false);
        setSaveError(null);
    }, [selected?._id]);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        setSaveError(null);
        try {
            await saveTriageApi(selected._id, {
                triageNotes: note || undefined,
                chiefComplaint: selected.chiefComplaint || undefined,
                vitals: {
                    bloodPressure: vitals.bp || null,
                    pulse: vitals.pulse ? Number(vitals.pulse) : null,
                    temperature: vitals.temp ? Number(vitals.temp) : null,
                    spo2: vitals.spo2 ? Number(vitals.spo2) : null,
                    weight: vitals.weight ? Number(vitals.weight) : null,
                },
            });
            setSaved(true);
            loadQueue();
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setSaveError(err?.message || 'Failed to save vitals');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2e8f0' }}>Nurse Triage Workspace</h1>
                    <p className="text-sm mt-1" style={{ color: '#64748b' }}>Vitals collection & triage queue</p>
                </div>
            </div>

            <div className="flex gap-6 h-full">
                {/* Triage queue */}
                <div className="w-64 flex-shrink-0">
                    <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
                        Triage Queue ({queue.length})
                    </div>
                    {loading ? (
                        <p className="text-xs" style={{ color: '#64748b' }}>Loading queue…</p>
                    ) : error ? (
                        <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
                    ) : queue.length === 0 ? (
                        <p className="text-xs" style={{ color: '#64748b' }}>No patients checked in today.</p>
                    ) : (
                        <div className="space-y-2">
                            {queue.map(p => {
                                const pr = PRIORITY_STYLE[p.priority] ?? PRIORITY_STYLE.normal;
                                const isSelected = selected?._id === p._id;
                                return (
                                    <div key={p._id} onClick={() => setSelected(p)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'ring-1' : ''}`}
                                        style={{
                                            background: isSelected ? pr.bg : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isSelected ? pr.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                        }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-xs" style={{ color: '#e2e8f0' }}>{patientName(p)}</div>
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase"
                                                style={{ background: pr.bg, color: pr.color }}>{p.priority}</span>
                                        </div>
                                        <div className="text-[11px]" style={{ color: '#64748b' }}>{p.chiefComplaint || 'No chief complaint on file'}</div>
                                        <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#475569' }}>
                                            <Clock size={9} /> Arrived {arrivalTime(p.checkedInAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Vitals entry */}
                <div className="flex-1 space-y-4">
                    {!selected ? (
                        <div className="rounded-2xl p-5 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b' }}>
                            Select a patient from the queue to record vitals.
                        </div>
                    ) : (
                        <>
                            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="font-bold" style={{ color: '#e2e8f0' }}>{patientName(selected)}</div>
                                        <div className="text-xs" style={{ color: '#64748b' }}>CC: {selected.chiefComplaint || 'Not recorded'}</div>
                                    </div>
                                    {saved && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                            <Check size={11} /> Vitals saved
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                                    {[
                                        { key: 'bp', label: 'Blood Pressure', icon: Activity, unit: 'mmHg', placeholder: '120/80' },
                                        { key: 'pulse', label: 'Pulse', icon: Heart, unit: 'bpm', placeholder: '72' },
                                        { key: 'temp', label: 'Temperature', icon: Thermometer, unit: '°C', placeholder: '36.6' },
                                        { key: 'spo2', label: 'SpO₂', icon: Droplets, unit: '%', placeholder: '98' },
                                        { key: 'weight', label: 'Weight', icon: Wind, unit: 'kg', placeholder: '70' },
                                    ].map(f => {
                                        const Icon = f.icon;
                                        return (
                                            <div key={f.key} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Icon size={12} style={{ color: '#0d9488' }} />
                                                    <span className="text-[10px] font-bold" style={{ color: '#64748b' }}>{f.label}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        value={(vitals as any)[f.key]}
                                                        onChange={e => setVitals(v => ({ ...v, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                        className="w-full bg-transparent text-sm font-bold outline-none"
                                                        style={{ color: '#e2e8f0' }}
                                                    />
                                                    <span className="text-[10px] flex-shrink-0" style={{ color: '#475569' }}>{f.unit}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mb-3">
                                    <div className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                        <Mic size={11} /> Triage Note
                                    </div>
                                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                                        placeholder="Describe patient appearance, chief complaint, relevant history…"
                                        className="w-full resize-none rounded-xl p-3 text-sm"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e2e8f0' }} />
                                </div>
                                {saveError && (
                                    <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{saveError}</p>
                                )}
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                                    style={{ background: 'rgba(13,148,136,0.2)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.3)' }}>
                                    <Save size={15} /> {saving ? 'Saving…' : 'Save Vitals & Triage Note'}
                                </button>
                            </div>

                            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="text-sm font-bold mb-1" style={{ color: '#94a3b8' }}>Medication Administration Record</div>
                                <div className="text-xs" style={{ color: '#475569' }}>No active medication orders for {patientName(selected)}. Records will appear here after a clinician creates a prescription.</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
