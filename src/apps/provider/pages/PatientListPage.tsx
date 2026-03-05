import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { consentApi } from '@/shared/api/consentApi';
import { Search, QrCode, UserPlus, ArrowRight, Shield, Clock, Activity } from 'lucide-react';

const MOCK_PATIENTS = [
    { id: 'pat_001', name: 'Amara Okafor', dob: '1990-03-15', bloodType: 'B+', lastVisit: '2026-02-12', triageScore: 'High Risk', triageColor: '#ef4444' },
    { id: 'pat_002', name: 'Emeka Nwosu', dob: '1985-07-22', bloodType: 'O+', lastVisit: '2026-01-28', triageScore: 'Routine', triageColor: '#10b981' },
    { id: 'pat_003', name: 'Chioma Eze', dob: '1995-11-05', bloodType: 'A+', lastVisit: '2026-02-01', triageScore: 'Monitor', triageColor: '#f59e0b' },
];

export function PatientListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const grants = consentApi.getProviderGrants(user?.orgId ?? '');
    const [search, setSearch] = useState('');
    const [showScan, setShowScan] = useState(false);
    const [code, setCode] = useState('');

    const consentedPatients = MOCK_PATIENTS.filter(p => grants.some(g => g.patientId === p.id));
    const filtered = consentedPatients.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Patients</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Patients who have granted your organisation access</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowScan(true)} className="btn btn-provider-outline gap-2"><QrCode size={16} /> Scan QR / Enter Code</button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7ba3c8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input input-dark w-full max-w-md" style={{ paddingLeft: '2.5rem' }} placeholder="Search by name or patient code…" />
            </div>

            {/* Patient cards */}
            {filtered.length === 0 ? (
                <div className="card-provider p-12 text-center">
                    <Shield size={36} className="mx-auto mb-3" style={{ color: '#1e3a5f' }} />
                    <p className="font-semibold mb-1" style={{ color: '#7ba3c8' }}>No consented patients</p>
                    <p className="text-sm" style={{ color: '#3e5a78' }}>Scan a patient QR code or enter their patient code to request access</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(p => {
                        const grant = grants.find(g => g.patientId === p.id);
                        return (
                            <div key={p.id} onClick={() => navigate(`/provider/patients/${p.id}`)}
                                className="card-provider p-5 flex items-center gap-4 cursor-pointer group">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                                    style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>{p.name.charAt(0)}</div>
                                <div className="flex-1">
                                    <div className="font-bold" style={{ color: '#e2eaf4' }}>{p.name}</div>
                                    <div className="text-xs" style={{ color: '#7ba3c8' }}>
                                        DOB: {new Date(p.dob).toLocaleDateString()} · Blood: {p.bloodType} · Last visit: {new Date(p.lastVisit).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-semibold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${p.triageColor}20`, color: p.triageColor, border: `1px solid ${p.triageColor}40` }}>
                                            <Activity size={10} /> AI Triage: {p.triageScore}
                                        </span>
                                    </div>
                                    {grant && (
                                        <div className="flex gap-2 mt-1.5">
                                            <span className="badge badge-active">{grant.scope} access</span>
                                            <span className="badge badge-verified">{grant.purpose}</span>
                                            {grant.expiresAt && (
                                                <span className="badge badge-expired flex items-center gap-1"><Clock size={9} /> {new Date(grant.expiresAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" style={{ color: '#38bdf8' }} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Scan/Code modal */}
            {showScan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="card-provider w-full max-w-sm p-6 animate-fade-in-up">
                        <h3 className="font-bold text-lg mb-5" style={{ color: '#e2eaf4' }}>Add Patient</h3>
                        <div className="border-2 border-dashed rounded-xl p-8 mb-4 text-center cursor-pointer hover:border-sky-400 transition-colors"
                            style={{ borderColor: 'rgba(56,189,248,.3)' }}>
                            <QrCode size={36} className="mx-auto mb-2" style={{ color: '#38bdf8' }} />
                            <div className="text-sm" style={{ color: '#7ba3c8' }}>Tap to scan patient QR code</div>
                        </div>
                        <div className="text-center text-xs mb-3" style={{ color: '#3e5a78' }}>or enter patient code manually</div>
                        <input value={code} onChange={e => setCode(e.target.value)} className="input input-dark mb-3" placeholder="e.g. WR-PAT-001234" />
                        <div className="flex gap-2">
                            <button onClick={() => setShowScan(false)} className="btn btn-provider flex-1 justify-center">Request Access</button>
                            <button onClick={() => setShowScan(false)} className="btn btn-provider-outline px-4">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
