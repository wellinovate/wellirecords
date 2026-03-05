import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, CheckCircle, XCircle, Clock, Users, ArrowRight, Layers } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { billingApi } from '@/shared/api/billingApi';

const MOCK_FACILITIES = [
    { id: 'org_hosp_001', name: 'Lagos Island General Hospital', type: 'hospital', tier: 'professional', staffCount: 18, verified: true, status: 'active', city: 'Lagos Island', branches: 3 },
    { id: 'org_hosp_002', name: 'Reddington Hospital', type: 'hospital', tier: 'enterprise', staffCount: 54, verified: false, status: 'active', city: 'Victoria Island', branches: 1 },
    { id: 'org_lab_001', name: 'CityLab Diagnostics', type: 'lab', tier: 'basic', staffCount: 5, verified: true, status: 'active', city: 'Ikeja', branches: 1 },
    { id: 'org_lab_002', name: 'MedPath Diagnostics', type: 'lab', tier: 'professional', staffCount: 9, verified: false, status: 'suspended', city: 'Yaba', branches: 2 },
    { id: 'org_ph_001', name: 'QuickCare Pharmacy', type: 'pharmacy', tier: 'basic', staffCount: 3, verified: false, status: 'active', city: 'Surulere', branches: 1 },
    { id: 'org_tel_001', name: 'WelliHealth Telecare', type: 'telehealth', tier: 'professional', staffCount: 12, verified: true, status: 'active', city: 'Remote', branches: 0 },
];

const TYPE_COLORS: Record<string, string> = {
    hospital: '#38bdf8', lab: '#a78bfa', pharmacy: '#34d399',
    telehealth: '#f472b6', clinic: '#fb923c', insurance: '#fbbf24',
};

const TIER_LABELS: Record<string, { label: string; color: string }> = {
    basic: { label: 'Basic', color: '#6b7280' },
    professional: { label: 'Professional', color: '#38bdf8' },
    enterprise: { label: 'Enterprise', color: '#f59e0b' },
};

export function FacilityRegistryPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const list = MOCK_FACILITIES.filter(f =>
        (typeFilter === 'all' || f.type === typeFilter) &&
        (search ? f.name.toLowerCase().includes(search.toLowerCase()) || f.city.toLowerCase().includes(search.toLowerCase()) : true)
    );

    const types = ['all', ...Array.from(new Set(MOCK_FACILITIES.map(f => f.type)))];

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Facility Registry</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{MOCK_FACILITIES.length} registered facilities · {MOCK_FACILITIES.filter(f => f.verified).length} verified</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city…"
                        className="w-full pl-8 pr-4 py-2 rounded-xl text-sm"
                        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
                </div>
                <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: '#111827' }}>
                    {types.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all"
                            style={{
                                background: typeFilter === t ? `${TYPE_COLORS[t] ?? '#f59e0b'}18` : 'transparent',
                                color: typeFilter === t ? (TYPE_COLORS[t] ?? '#f59e0b') : '#6b7280',
                            }}>
                            {t}
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
                                {['Facility', 'Type', 'City', 'Plan', 'Staff', 'Branches', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                            {list.map(f => {
                                const tier = TIER_LABELS[f.tier];
                                return (
                                    <tr key={f.id} className="hover:bg-white/4 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/admin/facilities/${f.id}`)}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: `${TYPE_COLORS[f.type] ?? '#6b7280'}18` }}>
                                                    <Building2 size={13} style={{ color: TYPE_COLORS[f.type] ?? '#6b7280' }} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold" style={{ color: '#e5e7eb' }}>{f.name}</div>
                                                    {f.verified
                                                        ? <div className="text-[10px] flex items-center gap-0.5" style={{ color: '#10b981' }}><CheckCircle size={9} /> Verified</div>
                                                        : <div className="text-[10px] flex items-center gap-0.5" style={{ color: '#f59e0b' }}><Clock size={9} /> Unverified</div>
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 capitalize text-xs font-semibold" style={{ color: TYPE_COLORS[f.type] ?? '#6b7280' }}>{f.type}</td>
                                        <td className="px-5 py-3.5 text-xs" style={{ color: '#9ca3af' }}>{f.city}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: `${tier.color}18`, color: tier.color }}>{tier.label}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs" style={{ color: '#9ca3af' }}>
                                            <div className="flex items-center gap-1"><Users size={11} /> {f.staffCount}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs" style={{ color: '#9ca3af' }}>
                                            <div className="flex items-center gap-1"><Layers size={11} /> {f.branches || '—'}</div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {f.status === 'active'
                                                ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Active</span>
                                                : <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Suspended</span>
                                            }
                                        </td>
                                        <td className="px-5 py-3.5"><ArrowRight size={14} style={{ color: '#374151' }} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
