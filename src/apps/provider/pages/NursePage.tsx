import React, { useState } from 'react';
import {
    Activity, Heart, Thermometer, Droplets, Wind,
    Mic, Check, Clock, AlertCircle, Plus, Save,
} from 'lucide-react';
import { vaultApi } from '@/shared/api/vaultApi';

const MOCK_TRIAGE_QUEUE = [
    { id: 'q001', name: 'Emeka Nwosu', arrival: '08:05', chief: 'Chest pain', priority: 'high', age: 41 },
    { id: 'q002', name: 'Ngozi Adewale', arrival: '08:22', chief: 'Fever / cough', priority: 'medium', age: 28 },
    { id: 'q003', name: 'Umar Garba', arrival: '08:47', chief: 'Routine BP check', priority: 'low', age: 65 },
];

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

export function NursePage() {
    const [selected, setSelected] = useState(MOCK_TRIAGE_QUEUE[0]);
    const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '' });
    const [note, setNote] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Nursing Station</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Triage queue · Vitals entry · Medication administration</p>
            </div>

            <div className="flex gap-6 h-full">
                {/* Triage queue */}
                <div className="w-64 flex-shrink-0">
                    <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>Triage Queue ({MOCK_TRIAGE_QUEUE.length})</div>
                    <div className="space-y-2">
                        {MOCK_TRIAGE_QUEUE.map(p => {
                            const pr = PRIORITY_STYLE[p.priority];
                            return (
                                <div key={p.id} onClick={() => { setSelected(p); setSaved(false); }}
                                    className={`p-3 rounded-xl cursor-pointer transition-all ${selected.id === p.id ? 'ring-1' : ''}`}
                                    style={{
                                        background: selected.id === p.id ? pr.bg : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${selected.id === p.id ? pr.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                    }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-xs" style={{ color: '#e2e8f0' }}>{p.name}</div>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase"
                                            style={{ background: pr.bg, color: pr.color }}>{p.priority}</span>
                                    </div>
                                    <div className="text-[11px]" style={{ color: '#64748b' }}>Age {p.age} · {p.chief}</div>
                                    <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#475569' }}>
                                        <Clock size={9} /> Arrived {p.arrival}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Vitals entry */}
                <div className="flex-1 space-y-4">
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-bold" style={{ color: '#e2e8f0' }}>{selected.name}</div>
                                <div className="text-xs" style={{ color: '#64748b' }}>Age {selected.age} · CC: {selected.chief}</div>
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

                        {/* Triage note */}
                        <div className="mb-3">
                            <div className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                <Mic size={11} /> Triage Note
                            </div>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                                placeholder="Describe patient appearance, chief complaint, relevant history…"
                                className="w-full resize-none rounded-xl p-3 text-sm"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e2e8f0' }} />
                        </div>
                        <button onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(13,148,136,0.2)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.3)' }}>
                            <Save size={15} /> Save Vitals & Triage Note
                        </button>
                    </div>

                    {/* Med admin placeholder */}
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-sm font-bold mb-1" style={{ color: '#94a3b8' }}>Medication Administration Record</div>
                        <div className="text-xs" style={{ color: '#475569' }}>No active medication orders for {selected.name}. Records will appear here after a clinician creates a prescription.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
