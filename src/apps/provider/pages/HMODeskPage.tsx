import React, { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';

const MOCK_MEMBERS = [
    { id: 'm001', name: 'Amara Okafor', hmoId: 'NHIS-001-001', plan: 'NHIS Formal Sector', status: 'active', dob: '1995-04-12', employer: 'GTBank Nigeria' },
    { id: 'm002', name: 'Emeka Nwosu', hmoId: 'AIICO-002-210', plan: 'AIICO Premier HMO', status: 'active', dob: '1983-08-22', employer: 'Self-employed' },
    { id: 'm003', name: 'Ngozi Adewale', hmoId: 'CORR-003-034', plan: 'Cornerstone Care', status: 'expired', dob: '1990-11-05', employer: 'Federal Civil Service' },
];

const MOCK_PREAUTHS = [
    { id: 'pa001', patient: 'Amara Okafor', procedure: 'Appendectomy', provider: 'Dr. Fatima Aliyu', estimatedCost: 450000, status: 'pending', requestedAt: '2026-03-03T09:00:00Z' },
    { id: 'pa002', patient: 'Emeka Nwosu', procedure: 'Cardiac Cath', provider: 'Dr. Emeka Okonkwo', estimatedCost: 1200000, status: 'approved', requestedAt: '2026-03-01T10:00:00Z' },
];

export function HMODeskPage() {
    const [search, setSearch] = useState('');
    const [lookup, setLookup] = useState<typeof MOCK_MEMBERS[0] | null>(null);
    const [tab, setTab] = useState<'eligibility' | 'preauth' | 'claims'>('eligibility');

    const handleLookup = () => {
        const found = MOCK_MEMBERS.find(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.hmoId.toLowerCase().includes(search.toLowerCase()));
        setLookup(found ?? null);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>HMO / Insurance Desk</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Eligibility checks · Pre-authorisation · Claims attachments</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {[{ key: 'eligibility', label: 'Eligibility' }, { key: 'preauth', label: 'Pre-Auth Requests' }, { key: 'claims', label: 'Claims' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? 'rgba(15,118,110,0.2)' : 'transparent', color: tab === t.key ? '#0f766e' : '#64748b' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'eligibility' && (
                <div className="space-y-4 max-w-2xl">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                                placeholder="Search by name or HMO ID…"
                                className="w-full pl-8 pr-4 py-2 rounded-xl text-sm"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
                        </div>
                        <button onClick={handleLookup} className="px-4 py-2 rounded-xl text-sm font-bold"
                            style={{ background: 'rgba(15,118,110,0.2)', color: '#0f766e' }}>
                            Check Eligibility
                        </button>
                    </div>

                    {lookup ? (
                        <div className="rounded-2xl p-5 space-y-3" style={{ background: lookup.status === 'active' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${lookup.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                            <div className="flex items-center justify-between">
                                <div className="font-bold" style={{ color: '#e2e8f0' }}>{lookup.name}</div>
                                {lookup.status === 'active'
                                    ? <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle size={11} /> Eligible</span>
                                    : <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><XCircle size={11} /> Expired</span>
                                }
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><div className="text-xs" style={{ color: '#475569' }}>HMO ID</div><div className="font-mono font-bold" style={{ color: '#0f766e' }}>{lookup.hmoId}</div></div>
                                <div><div className="text-xs" style={{ color: '#475569' }}>Plan</div><div style={{ color: '#94a3b8' }}>{lookup.plan}</div></div>
                                <div><div className="text-xs" style={{ color: '#475569' }}>Date of Birth</div><div style={{ color: '#94a3b8' }}>{new Date(lookup.dob).toLocaleDateString('en-NG')}</div></div>
                                <div><div className="text-xs" style={{ color: '#475569' }}>Employer</div><div style={{ color: '#94a3b8' }}>{lookup.employer}</div></div>
                            </div>
                            {lookup.status === 'expired' && (
                                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#ef4444' }}>
                                    <AlertCircle size={13} /> Coverage expired — patient must renew before services can be billed to HMO.
                                </div>
                            )}
                        </div>
                    ) : search && (
                        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}>
                            No member found with that name or HMO ID.
                        </div>
                    )}
                </div>
            )}

            {tab === 'preauth' && (
                <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Pre-Auth Requests</div>
                        <button className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(15,118,110,0.15)', color: '#0f766e' }}>New Request</button>
                    </div>
                    {MOCK_PREAUTHS.map(pa => (
                        <div key={pa.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{pa.procedure} — {pa.patient}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{pa.provider} · ₦{(pa.estimatedCost / 100).toLocaleString('en-NG')}</div>
                                    <div className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{new Date(pa.requestedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                                {pa.status === 'approved'
                                    ? <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle size={11} /> Approved</span>
                                    : <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Clock size={11} /> Pending HMO</span>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'claims' && (
                <div className="rounded-2xl p-8 text-center max-w-md" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}>
                    <FileText size={28} className="mx-auto mb-3" style={{ color: '#475569' }} />
                    <div className="text-sm font-semibold" style={{ color: '#64748b' }}>Claims module</div>
                    <div className="text-xs mt-1" style={{ color: '#475569' }}>Upload claim attachments (invoices, lab results, referral letters) and track submission status here.</div>
                    <button className="mt-4 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(15,118,110,0.15)', color: '#0f766e' }}>Upload Claim Documents</button>
                </div>
            )}
        </div>
    );
}
