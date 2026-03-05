import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { vaultApi } from '@/shared/api/vaultApi';
import { GitBranch, Plus, X, CheckCircle, ArrowRight } from 'lucide-react';
import { orgApi } from '@/shared/api/orgApi';

const STATUS_BADGE: Record<string, string> = { sent: 'badge-pending', accepted: 'badge-active', declined: 'badge-revoked', completed: 'badge-verified' };

export function ReferralsPage() {
    const { user } = useAuth();
    const referrals = vaultApi.getReferrals(user?.orgId ?? '');
    const [showNew, setShowNew] = useState(false);

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Referrals</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Send and track patient referrals across organisations</p>
                </div>
                <button onClick={() => setShowNew(true)} className="btn btn-provider gap-2"><Plus size={16} /> New Referral</button>
            </div>

            <div className="space-y-4">
                {referrals.length === 0
                    ? <div className="card-provider p-10 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No referrals yet</p></div>
                    : referrals.map(r => (
                        <div key={r.id} className="card-provider p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(99,102,241,.1)' }}><GitBranch size={18} style={{ color: '#6366f1' }} /></div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold" style={{ color: '#e2eaf4' }}>{r.patientName}</span>
                                        <ArrowRight size={14} style={{ color: '#7ba3c8' }} />
                                        <span className="font-semibold" style={{ color: '#38bdf8' }}>{r.toOrgName}</span>
                                    </div>
                                    <div className="text-sm mt-1" style={{ color: '#7ba3c8' }}>{r.reason}</div>
                                    <div className="text-xs mt-1" style={{ color: '#3e5a78' }}>
                                        From: {r.fromProviderName} · {new Date(r.date).toLocaleDateString()}
                                        {r.consentGrantId && <span className="ml-2 text-emerald-500">· Consent Linked</span>}
                                    </div>
                                    {r.notes && <p className="text-xs italic mt-1.5" style={{ color: '#3e5a78' }}>{r.notes}</p>}
                                </div>
                                <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                            </div>
                        </div>
                    ))}
            </div>

            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="card-provider w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>New Referral</h3>
                            <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Patient</label><select className="input input-dark"><option>Amara Okafor</option><option>Emeka Nwosu</option></select></div>
                            <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Refer To</label>
                                <select className="input input-dark">{orgApi.getAll().map(o => <option key={o.id} value={o.id}>{o.name} ({orgApi.getOrgTypeLabel(o.type)})</option>)}</select>
                            </div>
                            <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Reason for Referral</label><textarea className="input input-dark w-full resize-none" rows={3} placeholder="Describe the reason for this referral…" /></div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Attach Consent Grant</label>
                                <select className="input input-dark"><option value="">None (patient must approve separately)</option><option value="grant_001">Grant — Lagos General — Full — Active</option></select>
                            </div>
                            <button onClick={() => setShowNew(false)} className="btn btn-provider w-full justify-center">Send Referral</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
