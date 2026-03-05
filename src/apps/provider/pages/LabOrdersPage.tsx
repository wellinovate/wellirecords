import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { consentApi } from '@/shared/api/consentApi';
import { vaultApi } from '@/shared/api/vaultApi';
import { FlaskConical, Plus, CheckCircle, Clock, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { LabOrder } from '@/shared/types/types';

export function LabOrdersPage() {
    const { user } = useAuth();
    const grants = consentApi.getProviderGrants(user?.orgId ?? '');
    const hasWriteAccess = grants.some(g => ['full', 'labs'].includes(g.scope));
    const [orders, setOrders] = useState(() => vaultApi.getLabOrders(user?.orgId ?? ''));
    const [showNew, setShowNew] = useState(false);
    const [filter, setFilter] = useState<LabOrder['status'] | 'all'>('all');

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const statusIcon = (s: LabOrder['status']) => ({
        pending: <Clock size={14} style={{ color: '#f59e0b' }} />,
        in_progress: <AlertCircle size={14} style={{ color: '#38bdf8' }} />,
        complete: <CheckCircle size={14} style={{ color: '#10b981' }} />,
        cancelled: <X size={14} style={{ color: '#6b7280' }} />,
    }[s]);

    const statusBadge = (s: LabOrder['status']) => ({ pending: 'badge-warning', in_progress: 'badge-verified', complete: 'badge-active', cancelled: '' }[s]);

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Lab Orders</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Manage lab orders and view results</p>
                </div>
                <button
                    onClick={() => setShowNew(true)}
                    className="btn btn-provider gap-2"
                    disabled={!hasWriteAccess}
                    title={!hasWriteAccess ? "No active patients with lab-write consent scope" : ""}
                >
                    <Plus size={16} /> New Lab Order
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(['all', 'pending', 'in_progress', 'complete'] as const).map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                        style={{ background: filter === s ? '#38bdf8' : 'rgba(56,189,248,.06)', color: filter === s ? '#050d1a' : '#7ba3c8', border: `1px solid ${filter === s ? '#38bdf8' : 'rgba(56,189,248,.15)'}` }}>
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map(o => (
                    <div key={o.id} className="card-provider p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,.1)' }}>
                                    <FlaskConical size={18} style={{ color: '#a855f7' }} />
                                </div>
                                <div>
                                    <div className="font-bold" style={{ color: '#e2eaf4' }}>{o.patientName}</div>
                                    <div className="text-xs" style={{ color: '#7ba3c8' }}>Ordered by {o.orderedByName} · {new Date(o.date).toLocaleDateString()}</div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {o.tests.map(t => (
                                            <span key={t} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(168,85,247,.1)', color: '#a855f7' }}>{t}</span>
                                        ))}
                                    </div>
                                    {o.result && (
                                        <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(16,185,129,.06)', borderLeft: '3px solid rgba(16,185,129,.4)', color: '#7ba3c8' }}>
                                            {o.result}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1.5">
                                    {statusIcon(o.status)}
                                    <span className={`badge ${statusBadge(o.status)}`}>{o.status.replace('_', ' ')}</span>
                                </div>
                                {o.verified && (
                                    <span className="flex items-center gap-1 badge badge-active text-[10px]" style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.2)' }}>
                                        <ShieldCheck size={10} /> WelliChain Verified
                                    </span>
                                )}
                                {o.resultPublished && <span className="badge badge-verified text-[10px]">Published to Vault</span>}
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="card-provider p-10 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No orders matching this filter</p></div>
                )}
            </div>

            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="card-provider w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>New Lab Order</h3>
                            <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Patient</label>
                                <select className="input input-dark"><option>Amara Okafor</option><option>Emeka Nwosu</option></select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Tests Required</label>
                                <textarea className="input input-dark w-full resize-none" rows={3} placeholder="e.g. Full Blood Count, Urea & Electrolytes, HBA1C" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Lab Facility</label>
                                <select className="input input-dark"><option>CityLab Diagnostics</option><option>OneLab Nigeria</option></select>
                            </div>
                            <button onClick={() => setShowNew(false)} className="btn btn-provider w-full justify-center">Submit Lab Order</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
