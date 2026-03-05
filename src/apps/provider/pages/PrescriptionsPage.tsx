import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { consentApi } from '@/shared/api/consentApi';
import { vaultApi } from '@/shared/api/vaultApi';
import { Pill, Plus, CheckCircle, X, Package, ShieldCheck } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-active', dispensed: 'badge-verified', cancelled: 'badge-revoked', expired: 'badge-expired',
};

export function PrescriptionsPage() {
    const { user } = useAuth();
    const grants = consentApi.getProviderGrants(user?.orgId ?? '');
    const hasWriteAccess = grants.some(g => ['full', 'medications'].includes(g.scope));
    const [rxList, setRxList] = useState(() => vaultApi.getPrescriptions(user?.orgId ?? ''));
    const [showNew, setShowNew] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    const filtered = filter === 'all' ? rxList : rxList.filter(r => r.status === filter);

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Prescriptions</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>ePrescriptions and medication tracking</p>
                </div>
                <button
                    onClick={() => setShowNew(true)}
                    className="btn btn-provider gap-2"
                    disabled={!hasWriteAccess}
                    title={!hasWriteAccess ? "No active patients with medication-write consent scope" : ""}
                >
                    <Plus size={16} /> New Prescription
                </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'active', 'dispensed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                        style={{ background: filter === s ? '#38bdf8' : 'rgba(56,189,248,.06)', color: filter === s ? '#050d1a' : '#7ba3c8', border: `1px solid ${filter === s ? '#38bdf8' : 'rgba(56,189,248,.15)'}` }}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map(rx => (
                    <div key={rx.id} className="card-provider p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,.1)' }}>
                                    <Pill size={18} style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg" style={{ color: '#e2eaf4' }}>{rx.drug}</div>
                                    <div className="text-sm" style={{ color: '#38bdf8' }}>{rx.dose} · {rx.frequency}</div>
                                    <div className="text-xs mt-1" style={{ color: '#7ba3c8' }}>For: {rx.patientName} · Duration: {rx.duration}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>Prescribed by: {rx.prescribedByName} · {new Date(rx.date).toLocaleDateString()}</div>
                                    {rx.notes && <p className="text-xs italic mt-1" style={{ color: '#3e5a78' }}>{rx.notes}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`badge ${STATUS_BADGE[rx.status]}`}>{rx.status}</span>
                                {rx.status === 'active' && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                                        <ShieldCheck size={10} /> WelliChain Verified
                                    </span>
                                )}
                                {rx.writeBackEnabled && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>
                                        <CheckCircle size={9} /> Write-back enabled
                                    </span>
                                )}
                                {rx.status === 'active' && (
                                    <button className="btn btn-sm gap-1" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}>
                                        <Package size={12} /> Mark Dispensed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="card-provider p-8 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No prescriptions found</p></div>}
            </div>

            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="card-provider w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>New Prescription</h3>
                            <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Patient</label><select className="input input-dark"><option>Amara Okafor</option><option>Emeka Nwosu</option></select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Drug Name</label><input className="input input-dark" placeholder="e.g. Metformin" /></div>
                                <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Dose</label><input className="input input-dark" placeholder="e.g. 500mg" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Frequency</label><select className="input input-dark"><option>Once daily</option><option>Twice daily</option><option>Three times daily</option></select></div>
                                <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Duration</label><select className="input input-dark"><option>7 days</option><option>14 days</option><option>30 days</option><option>90 days</option></select></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Notes (optional)</label><textarea className="input input-dark w-full resize-none" rows={2} placeholder="Additional instructions…" /></div>
                            <button onClick={() => setShowNew(false)} className="btn btn-provider w-full justify-center">Issue Prescription</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
