import React, { useState } from 'react';
import { Upload, CheckCircle, Clock, Eye, FileImage, X, Plus } from 'lucide-react';

const MOCK_RADIOLOGY_ORDERS = [
    { id: 'ro_001', patient: 'Emeka Nwosu', age: 41, exam: 'Chest X-Ray', orderedBy: 'Dr. Fatima Aliyu', orderedAt: '2026-03-03T09:10:00Z', status: 'pending', urgency: 'urgent' },
    { id: 'ro_002', patient: 'Amara Okafor', age: 29, exam: 'Abdominal Ultrasound', orderedBy: 'Dr. Fatima Aliyu', orderedAt: '2026-03-03T10:30:00Z', status: 'pending', urgency: 'routine' },
    { id: 'ro_003', patient: 'Ibrahim Musa', age: 52, exam: 'Brain MRI', orderedBy: 'Dr. Emeka Okonkwo', orderedAt: '2026-03-02T15:00:00Z', status: 'complete', urgency: 'routine' },
];

export function RadiologyPage() {
    const [selected, setSelected] = useState(MOCK_RADIOLOGY_ORDERS[0]);
    const [report, setReport] = useState('');
    const [files, setFiles] = useState<string[]>([]);
    const [done, setDone] = useState<string[]>([]);

    const handleComplete = () => {
        setDone(d => [...d, selected.id]);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Radiology Worklist</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Upload reports and images · Confirm order completion</p>
            </div>

            <div className="flex gap-6">
                {/* Order list */}
                <div className="w-72 flex-shrink-0 space-y-2">
                    <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
                        Orders ({MOCK_RADIOLOGY_ORDERS.length})
                    </div>
                    {MOCK_RADIOLOGY_ORDERS.map(o => {
                        const isComplete = done.includes(o.id) || o.status === 'complete';
                        return (
                            <div key={o.id} onClick={() => setSelected(o)}
                                className="p-3.5 rounded-xl cursor-pointer transition-all"
                                style={{
                                    background: selected.id === o.id ? 'rgba(109,40,217,0.12)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selected.id === o.id ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                }}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="font-bold text-xs" style={{ color: '#e2e8f0' }}>{o.patient}</div>
                                    {isComplete
                                        ? <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                                        : <Clock size={13} style={{ color: o.urgency === 'urgent' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                                    }
                                </div>
                                <div className="text-[11px]" style={{ color: '#94a3b8' }}>{o.exam}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: '#475569' }}>
                                    {o.orderedBy} · {new Date(o.orderedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                </div>
                                <div className="mt-1.5">
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase"
                                        style={{ background: o.urgency === 'urgent' ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)', color: o.urgency === 'urgent' ? '#ef4444' : '#6b7280' }}>
                                        {o.urgency}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Upload panel */}
                <div className="flex-1 space-y-4">
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(109,40,217,0.15)' }}>
                        <div className="mb-4">
                            <div className="font-bold" style={{ color: '#e2e8f0' }}>{selected.exam}</div>
                            <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>Patient: {selected.patient}, age {selected.age} · Ordered by {selected.orderedBy}</div>
                        </div>

                        {/* Report */}
                        <div className="mb-4">
                            <div className="text-xs font-bold mb-1.5" style={{ color: '#64748b' }}>Radiologist's Report</div>
                            <textarea value={report} onChange={e => setReport(e.target.value)} rows={5}
                                placeholder={`Findings for ${selected.exam}:\n\nImpressions:\n\nRecommendation:`}
                                className="w-full resize-none rounded-xl p-3 text-sm leading-relaxed"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e2e8f0' }} />
                        </div>

                        {/* Image upload zone */}
                        <div className="mb-4 border-2 border-dashed rounded-xl p-6 text-center transition-colors"
                            style={{ borderColor: 'rgba(109,40,217,0.3)', background: 'rgba(109,40,217,0.04)' }}>
                            <FileImage size={28} className="mx-auto mb-2" style={{ color: '#7c3aed', opacity: 0.6 }} />
                            <div className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Drag & drop DICOM / images here</div>
                            <div className="text-xs mt-0.5" style={{ color: '#475569' }}>or <button className="underline" style={{ color: '#7c3aed' }} onClick={() => setFiles(f => [...f, `scan_${f.length + 1}.dcm`])}>browse files</button></div>
                        </div>

                        {/* Mock uploaded files */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                                        style={{ background: 'rgba(109,40,217,0.1)', color: '#a78bfa', border: '1px solid rgba(109,40,217,0.2)' }}>
                                        <FileImage size={11} /> {f}
                                        <button onClick={() => setFiles(fl => fl.filter((_, j) => j !== i))}><X size={10} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={handleComplete}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <CheckCircle size={15} /> Publish Report & Confirm
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
                                style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
                                Save Draft
                            </button>
                        </div>
                        {done.includes(selected.id) && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold" style={{ color: '#10b981' }}>
                                <CheckCircle size={13} /> Report published to patient vault.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
