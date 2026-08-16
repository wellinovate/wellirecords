import React, { useEffect, useState } from 'react';
import {
    Activity, Heart, Thermometer, Droplets, Wind,
    Mic, Check, Clock, Save, AlertTriangle, RefreshCw,
    User, Stethoscope, FileText,
} from 'lucide-react';
import { getQueueApi, saveTriageApi } from '@/modules/queue/api';
import type { QueueItem } from '@/modules/queue/types';

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
    emergency: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    urgent: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    normal: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

function patientName(item: QueueItem) {
    return typeof item.patientId === 'object' && item.patientId ? (item.patientId.fullName || 'Unknown patient') : 'Unknown patient';
}

function patientWrId(item: QueueItem) {
    return typeof item.patientId === 'object' && item.patientId ? item.patientId.wrId : null;
}

function arrivalTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

const formatErrorMessage = (err: any) => {
    // Log the raw technical error silently for developer diagnostics
    console.error('[Nurse Triage API Error]:', err);

    const status = err?.response?.status;
    const serverMessage = err?.response?.data?.message;
    const code = err?.response?.data?.code;

    if (code === 'ORG_NOT_VERIFIED') {
        return 'Facility verification is pending. Triage queue access requires verified status.';
    }
    if (status === 403 || code === 'PERMISSION_DENIED') {
        return 'You do not have clinical permission to access the triage queue.';
    }
    if (serverMessage && typeof serverMessage === 'string' && !serverMessage.toLowerCase().includes('status code')) {
        return serverMessage;
    }
    return "Couldn't load the triage queue — please try refreshing, or contact support if this continues.";
};

export function NursePage() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<QueueItem | null>(null);
    const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '', resp: '' });
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadQueue = () => {
        setLoading(true);
        setError(null);
        getQueueApi()
            .then((res: any) => {
                const items: QueueItem[] = Array.isArray(res?.data) ? res.data : (res?.items ?? []);
                setQueue(items);
                if (items.length > 0) {
                    setSelected((prev) => {
                        if (prev) {
                            const found = items.find(i => i._id === prev._id);
                            if (found) return found;
                        }
                        return items[0];
                    });
                } else {
                    setSelected(null);
                }
            })
            .catch((err: any) => {
                setError(formatErrorMessage(err));
                setSelected(null);
            })
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
            resp: (selected.vitals as any)?.respiratoryRate != null ? String((selected.vitals as any).respiratoryRate) : '',
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
                    respiratoryRate: vitals.resp ? Number(vitals.resp) : null,
                },
            });
            setSaved(true);
            loadQueue();
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            console.error('[Save Vitals Error]:', err);
            const serverMessage = err?.response?.data?.message;
            setSaveError(serverMessage || "Couldn't save vitals — please check the values and try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="section-header font-display flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                        <Activity size={22} className="text-teal-400" /> Nurse Triage Workspace
                    </h1>
                    <p className="text-xs mt-1" style={{ color: '#7ba3c8' }}>
                        Live patient queue, vital signs intake, and clinical triage documentation
                    </p>
                </div>
                <button
                    onClick={loadQueue}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all text-slate-300 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : 'text-teal-400'} />
                    <span>Refresh Queue</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Triage Queue */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Triage Queue ({queue.length})
                        </div>
                        {queue.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                Live
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-6 text-center space-y-2 rounded-2xl border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.1)' }}>
                            <RefreshCw size={18} className="mx-auto text-teal-400 animate-spin" />
                            <p className="text-xs text-slate-400">Loading patient queue…</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-2xl border space-y-2.5" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
                            </div>
                            <button
                                onClick={loadQueue}
                                className="w-full py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300 transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="p-6 text-center rounded-2xl border space-y-2" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)' }}>
                            <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center bg-teal-500/10 text-teal-400">
                                <User size={18} />
                            </div>
                            <p className="text-xs font-bold text-slate-200">No patients waiting</p>
                            <p className="text-[11px] leading-relaxed text-slate-400">
                                Checked-in walk-in arrivals and scheduled visits will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                            {queue.map(p => {
                                const pr = PRIORITY_STYLE[p.priority] ?? PRIORITY_STYLE.normal;
                                const isSelected = selected?._id === p._id;
                                const wrId = patientWrId(p);
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => setSelected(p)}
                                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'ring-1 ring-teal-400' : 'hover:border-slate-700'}`}
                                        style={{
                                            background: isSelected ? '#0d223f' : '#0a192f',
                                            borderColor: isSelected ? '#14b8a6' : 'rgba(56,189,248,.12)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1 gap-2">
                                            <span className="font-bold text-xs truncate text-slate-100">{patientName(p)}</span>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0"
                                                style={{ background: pr.bg, color: pr.color }}>{p.priority}</span>
                                        </div>
                                        {wrId && (
                                            <div className="text-[10px] text-sky-400 font-mono mb-1">{wrId}</div>
                                        )}
                                        <div className="text-xs text-slate-400 truncate">{p.chiefComplaint || 'No chief complaint recorded'}</div>
                                        <div className="text-[10px] mt-1.5 flex items-center gap-1 text-slate-500">
                                            <Clock size={10} /> Arrived {arrivalTime(p.checkedInAt || (p as any).createdAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Side: Vitals & Triage Documentation */}
                <div className="flex-1 space-y-4">
                    {loading ? (
                        <div className="rounded-2xl p-10 text-center border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.1)' }}>
                            <RefreshCw size={22} className="mx-auto text-teal-400 animate-spin mb-2" />
                            <p className="text-xs text-slate-400">Loading workspace…</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-3 border" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.18)' }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <AlertTriangle size={22} />
                            </div>
                            <h3 className="font-bold text-sm text-slate-100">Queue Unavailable</h3>
                            <p className="text-xs max-w-sm leading-relaxed text-slate-400">
                                Patient vitals and triage notes cannot be recorded while the patient queue is disconnected.
                            </p>
                            <button
                                onClick={loadQueue}
                                className="mt-1 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-all"
                            >
                                Retry Loading Queue
                            </button>
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-3 border" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.1)' }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                <Activity size={22} />
                            </div>
                            <h3 className="font-bold text-sm text-slate-100">No Patients in Triage Queue</h3>
                            <p className="text-xs max-w-md leading-relaxed text-slate-400">
                                When reception front-desk checks in walk-ins or scheduled patient appointments, they will appear in the queue ready for vital signs and triage notes.
                            </p>
                        </div>
                    ) : !selected ? (
                        <div className="rounded-2xl p-8 text-center border text-xs" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.1)', color: '#7ba3c8' }}>
                            Select a patient from the queue on the left to record vitals and triage notes.
                        </div>
                    ) : (
                        <>
                            {/* Selected Patient Vitals Card */}
                            <div className="rounded-2xl p-5 border space-y-5" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.15)' }}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-base text-slate-100">{patientName(selected)}</h2>
                                            {patientWrId(selected) && (
                                                <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                                    {patientWrId(selected)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs mt-0.5 text-slate-400">
                                            Chief Complaint: <span className="text-slate-200">{selected.chiefComplaint || 'Not recorded at check-in'}</span>
                                        </p>
                                    </div>
                                    {saved && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <Check size={13} /> Vitals Saved to Record
                                        </div>
                                    )}
                                </div>

                                {/* Vital Signs Input Grid */}
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                        <Stethoscope size={14} className="text-teal-400" /> Vital Signs Intake
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {[
                                            { key: 'bp', label: 'Blood Pressure', icon: Activity, unit: 'mmHg', placeholder: '120/80' },
                                            { key: 'pulse', label: 'Pulse', icon: Heart, unit: 'bpm', placeholder: '72' },
                                            { key: 'temp', label: 'Temperature', icon: Thermometer, unit: '°C', placeholder: '36.6' },
                                            { key: 'spo2', label: 'SpO₂', icon: Droplets, unit: '%', placeholder: '98' },
                                            { key: 'resp', label: 'Resp Rate', icon: Wind, unit: '/min', placeholder: '16' },
                                            { key: 'weight', label: 'Weight', icon: Wind, unit: 'kg', placeholder: '70' },
                                        ].map(f => {
                                            const Icon = f.icon;
                                            return (
                                                <div key={f.key} className="rounded-xl p-3 border" style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761' }}>
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Icon size={12} className="text-teal-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 truncate">{f.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            value={(vitals as any)[f.key]}
                                                            onChange={e => setVitals(v => ({ ...v, [f.key]: e.target.value }))}
                                                            placeholder={f.placeholder}
                                                            className="w-full bg-transparent text-sm font-bold text-slate-100 outline-none"
                                                        />
                                                        <span className="text-[10px] text-slate-500 shrink-0">{f.unit}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Triage Clinical Note */}
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                        <FileText size={13} className="text-teal-400" /> Triage Clinical Note
                                    </div>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        rows={3}
                                        placeholder="Describe patient appearance, symptom onset, relevant allergies, or priority flags for the doctor…"
                                        className="w-full resize-none rounded-xl p-3 text-xs outline-none border"
                                        style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761', color: '#e2eaf4' }}
                                    />
                                </div>

                                {saveError && (
                                    <div className="p-3 rounded-xl border flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border-rose-500/20">
                                        <AlertTriangle size={14} /> {saveError}
                                    </div>
                                )}

                                <div className="flex items-center justify-end pt-1">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 shadow-lg"
                                    >
                                        <Save size={14} /> {saving ? 'Saving Vitals…' : 'Save Vitals & Triage Note'}
                                    </button>
                                </div>
                            </div>

                            {/* MAR Reference Card */}
                            <div className="rounded-2xl p-5 border space-y-1.5" style={{ background: '#0a192f', borderColor: 'rgba(56,189,248,.08)' }}>
                                <div className="text-xs font-bold text-slate-300">Medication Administration Record (MAR)</div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Active prescription orders and administration schedules for {patientName(selected)} will appear here once signed by an attending clinician.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NursePage;
