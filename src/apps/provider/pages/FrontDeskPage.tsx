import React, { useState } from 'react';
import { UserPlus, Calendar, Search, Scan, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const MOCK_WALKINS = [
    { id: 'w001', name: 'James Adeleke', phone: '+234-802-000-0001', arrived: '08:15', reason: 'Consultation', registered: true },
    { id: 'w002', name: 'Amina Oladipo', phone: '', arrived: '08:34', reason: 'Lab pickup', registered: false },
    { id: 'w003', name: 'Chukwuemeka A.', phone: '+234-803-000-0002', arrived: '08:52', reason: 'Appointment', registered: true },
];

const MOCK_APPOINTMENTS = [
    { id: 'ap001', patient: 'Amara Okafor', time: '09:00', doctor: 'Dr. Fatima Aliyu', type: 'Follow-up', status: 'confirmed' },
    { id: 'ap002', patient: 'Ibrahim Musa', time: '09:30', doctor: 'Dr. Emeka Okonkwo', type: 'New patient', status: 'confirmed' },
    { id: 'ap003', patient: 'Ngozi Adewale', time: '10:00', doctor: 'Dr. Fatima Aliyu', type: 'Consultation', status: 'pending' },
    { id: 'ap004', patient: 'Umar Garba', time: '10:30', doctor: 'Dr. Emeka Okonkwo', type: 'Review', status: 'confirmed' },
];

export function FrontDeskPage() {
    const [tab, setTab] = useState<'walkins' | 'appointments' | 'scan'>('walkins');
    const [scanValue, setScanValue] = useState('');
    const [scanResult, setScanResult] = useState<null | { name: string; id: string }>(null);

    const handleScan = () => {
        if (scanValue.includes('WR')) setScanResult({ name: 'Amara Okafor', id: 'pat_001' });
        else setScanResult(null);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Front Desk</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Walk-in registration · Appointments · Document scanning</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {[{ key: 'walkins', label: 'Walk-ins' }, { key: 'appointments', label: "Today's Schedule" }, { key: 'scan', label: 'Scan / Lookup' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                            background: tab === t.key ? 'rgba(13,148,136,0.2)' : 'transparent',
                            color: tab === t.key ? '#0d9488' : '#64748b',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'walkins' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Walk-in Queue ({MOCK_WALKINS.length})</div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ background: 'rgba(13,148,136,0.15)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.25)' }}>
                            <UserPlus size={12} /> Register New Patient
                        </button>
                    </div>
                    {MOCK_WALKINS.map(w => (
                        <div key={w.id} className="flex items-center gap-4 px-5 py-4 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{ background: 'rgba(13,148,136,0.15)', color: '#0d9488' }}>{w.name.charAt(0)}</div>
                            <div className="flex-1">
                                <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{w.name}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                                    {w.phone || 'No phone recorded'} · Arrived {w.arrived} · {w.reason}
                                </div>
                            </div>
                            {w.registered
                                ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle size={10} /> Registered</span>
                                : <button className="text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}><UserPlus size={10} /> Register</button>
                            }
                        </div>
                    ))}
                </div>
            )}

            {tab === 'appointments' && (
                <div className="space-y-2">
                    <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
                        {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })} — {MOCK_APPOINTMENTS.length} appointments
                    </div>
                    {MOCK_APPOINTMENTS.map(a => (
                        <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-sm font-black w-12 flex-shrink-0" style={{ color: '#0d9488' }}>{a.time}</div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{a.patient}</div>
                                <div className="text-xs" style={{ color: '#64748b' }}>{a.doctor} · {a.type}</div>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                                style={{ background: a.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: a.status === 'confirmed' ? '#10b981' : '#f59e0b' }}>
                                {a.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'scan' && (
                <div className="max-w-md space-y-4">
                    <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(13,148,136,0.3)' }}>
                        <Scan size={36} className="mx-auto mb-3" style={{ color: '#0d9488', opacity: 0.6 }} />
                        <div className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Scan WelliRecord QR Code or enter Patient ID</div>
                        <div className="flex gap-2">
                            <input value={scanValue} onChange={e => setScanValue(e.target.value)} placeholder="WR-XXXXXX or scan QR…"
                                className="flex-1 rounded-xl px-3 py-2 text-sm"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
                            <button onClick={handleScan} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(13,148,136,0.2)', color: '#0d9488' }}>
                                Lookup
                            </button>
                        </div>
                    </div>
                    {scanResult && (
                        <div className="rounded-xl px-5 py-4 flex items-center justify-between" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <div>
                                <div className="font-bold" style={{ color: '#10b981' }}>✓ Patient Found</div>
                                <div className="text-sm" style={{ color: '#e2e8f0' }}>{scanResult.name} · ID: {scanResult.id}</div>
                            </div>
                            <ArrowRight size={18} style={{ color: '#10b981' }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
