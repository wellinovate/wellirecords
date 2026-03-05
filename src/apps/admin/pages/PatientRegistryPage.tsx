import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Shield, ArrowRight, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const MOCK_PATIENTS = [
    { id: 'pat_001', name: 'Amara Okafor', phone: '+234-810-000-0001', state: 'Lagos', plan: 'premium', verified: true, records: 14, lastActive: '2026-03-03' },
    { id: 'pat_002', name: 'Emeka Nwosu', phone: '+234-810-000-0002', state: 'Abuja', plan: 'free', verified: true, records: 6, lastActive: '2026-03-02' },
    { id: 'pat_003', name: 'Ngozi Adewale', phone: '+234-810-000-0003', state: 'Kano', plan: 'free', verified: false, records: 2, lastActive: '2026-02-28' },
    { id: 'pat_004', name: 'Ibrahim Musa', phone: '+234-810-000-0004', state: 'Port Harcourt', plan: 'premium', verified: true, records: 21, lastActive: '2026-03-01' },
    { id: 'pat_005', name: 'Fatima Garba', phone: '+234-810-000-0005', state: 'Kaduna', plan: 'free', verified: false, records: 0, lastActive: '2026-02-15' },
    { id: 'pat_006', name: 'Chidi Okpara', phone: '+234-810-000-0006', state: 'Enugu', plan: 'premium', verified: true, records: 9, lastActive: '2026-03-03' },
];

export function PatientRegistryPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');

    const list = MOCK_PATIENTS.filter(p =>
        (planFilter === 'all' || p.plan === planFilter) &&
        (search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || p.state.toLowerCase().includes(search.toLowerCase()) : true)
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Patient Registry</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{MOCK_PATIENTS.length.toLocaleString()} registered patients · {MOCK_PATIENTS.filter(p => p.verified).length} identity-verified</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Patients', value: '14,872', color: '#38bdf8' },
                    { label: 'Premium Subscribers', value: '312', color: '#f59e0b' },
                    { label: 'Unverified', value: '2,103', color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl p-4" style={{ background: '#111827', border: `1px solid ${s.color}20` }}>
                        <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, state…"
                        className="w-full pl-8 pr-4 py-2 rounded-xl text-sm"
                        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
                </div>
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111827' }}>
                    {['all', 'free', 'premium'].map(f => (
                        <button key={f} onClick={() => setPlanFilter(f)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                            style={{
                                background: planFilter === f ? 'rgba(245,158,11,0.15)' : 'transparent',
                                color: planFilter === f ? '#f59e0b' : '#6b7280',
                            }}>
                            {f === 'all' ? 'All Plans' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {['Patient', 'Phone', 'State', 'Plan', 'Records', 'Last Active', 'Verified', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                            {list.map(p => (
                                <tr key={p.id} className="hover:bg-white/4 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/admin/patients/${p.id}`)}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                                                style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold" style={{ color: '#e5e7eb' }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#6b7280' }}>{p.phone}</td>
                                    <td className="px-5 py-3.5 text-xs" style={{ color: '#9ca3af' }}>{p.state}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                                            style={{ background: p.plan === 'premium' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.1)', color: p.plan === 'premium' ? '#f59e0b' : '#6b7280' }}>
                                            {p.plan}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: '#e5e7eb' }}>{p.records}</td>
                                    <td className="px-5 py-3.5 text-xs" style={{ color: '#6b7280' }}>
                                        {new Date(p.lastActive).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {p.verified
                                            ? <CheckCircle size={15} style={{ color: '#10b981' }} />
                                            : <AlertCircle size={15} style={{ color: '#f59e0b' }} />
                                        }
                                    </td>
                                    <td className="px-5 py-3.5"><ArrowRight size={14} style={{ color: '#374151' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
