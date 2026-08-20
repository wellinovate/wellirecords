import React, { useEffect, useState } from 'react';
import {
    ShieldCheck, Loader2, Save, Plus, Trash2, Clock, CheckCircle2, XCircle, Banknote,
} from 'lucide-react';
import { fetchProfile } from '@/shared/utils/utilityFunction';
import { authApi } from '@/shared/api/authApi';
import { pharmacyClaimsApi, type PharmacyClaim, type ClaimStatus } from '@/shared/api/pharmacyClaimsApi';
import { HmoSearchPicker } from '@/apps/components/shared/HmoSearchPicker';

interface Dependent {
    name: string;
    relationship?: string | null;
    membershipId?: string | null;
}

interface InsuranceInfo {
    hmoName?: string | null;
    membershipId?: string | null;
    planName?: string | null;
    dependents?: Dependent[];
}

const STATUS_STYLE: Record<ClaimStatus, { color: string; bg: string; label: string; icon: React.ElementType }> = {
    submitted: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Submitted', icon: Clock },
    approved: { color: '#0d9488', bg: 'rgba(13,148,136,0.1)', label: 'Approved', icon: CheckCircle2 },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejected', icon: XCircle },
    paid: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Paid', icon: Banknote },
};

function formatCurrency(val: number) {
    const formatted = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(val || 0);
    return `₦${formatted}`;
}

export function PatientInsurancePage() {
    const [tab, setTab] = useState<'profile' | 'claims'>('profile');

    const [insurance, setInsurance] = useState<InsuranceInfo>({ dependents: [] });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saved, setSaved] = useState(false);
    const [eligibilityNotice, setEligibilityNotice] = useState<{ hmo: string; memberId: string } | null>(null);

    const [claims, setClaims] = useState<PharmacyClaim[]>([]);
    const [loadingClaims, setLoadingClaims] = useState(false);
    const [claimsError, setClaimsError] = useState('');

    useEffect(() => {
        setLoadingProfile(true);
        fetchProfile()
            .then((data: any) => setInsurance(data?.insurance || { dependents: [] }))
            .catch(() => setInsurance({ dependents: [] }))
            .finally(() => setLoadingProfile(false));
    }, []);

    useEffect(() => {
        if (tab !== 'claims') return;
        setLoadingClaims(true);
        setClaimsError('');
        pharmacyClaimsApi.mine()
            .then(setClaims)
            .catch(() => setClaimsError("Couldn't load your claims right now."))
            .finally(() => setLoadingClaims(false));
    }, [tab]);

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        setSaved(false);
        try {
            await authApi.updateProfile({
                insurance: {
                    hmoName: insurance.hmoName || null,
                    membershipId: insurance.membershipId || null,
                    planName: insurance.planName || null,
                    dependents: insurance.dependents || [],
                },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setSaveError(err?.message || "Couldn't save — try again.");
        } finally {
            setSaving(false);
        }
    };

    const updateDependent = (index: number, field: keyof Dependent, value: string) => {
        setInsurance((prev) => {
            const next = [...(prev.dependents || [])];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, dependents: next };
        });
    };

    const addDependent = () => {
        setInsurance((prev) => ({ ...prev, dependents: [...(prev.dependents || []), { name: '' }] }));
    };

    const removeDependent = (index: number) => {
        setInsurance((prev) => ({ ...prev, dependents: (prev.dependents || []).filter((_, i) => i !== index) }));
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-black" style={{ color: '#1e293b' }}>Insurance</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Your HMO information and claims filed on your behalf by providers.
                </p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                {[{ key: 'profile', label: 'My Insurance' }, { key: 'claims', label: 'My Claims' }].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key as any)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: tab === t.key ? '#0d9488' : 'transparent', color: tab === t.key ? '#fff' : '#64748b' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'profile' && (
                <div className="space-y-4">
                    <p className="text-xs px-3 py-2 rounded-xl" style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid rgba(13,148,136,0.15)' }}>
                        This is information you provide — WelliRecord doesn't verify it against your HMO. Providers can see it to help with claims, but it isn't an eligibility check.
                    </p>

                    {loadingProfile ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: '#94a3b8' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading…
                        </div>
                    ) : (
                        <div className="space-y-4 rounded-2xl p-6 border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                            <div>
                                <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>
                                    HMO / Insurance Provider
                                </label>
                                <HmoSearchPicker
                                    value={insurance.hmoName || ''}
                                    onChange={(val) => {
                                        setInsurance((p) => ({ ...p, hmoName: val }));
                                        setEligibilityNotice(null);
                                    }}
                                    variant="light"
                                    placeholder="Search or select HMO..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold" style={{ color: '#475569' }}>Membership ID</label>
                                        {insurance.hmoName && insurance.membershipId && (
                                            <button
                                                type="button"
                                                onClick={() => setEligibilityNotice({ hmo: insurance.hmoName!, memberId: insurance.membershipId! })}
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:brightness-105"
                                                style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid rgba(13,148,136,0.2)' }}
                                            >
                                                <ShieldCheck size={11} /> Verify Eligibility
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        value={insurance.membershipId || ''}
                                        onChange={(e) => {
                                            setInsurance((p) => ({ ...p, membershipId: e.target.value }));
                                            setEligibilityNotice(null);
                                        }}
                                        placeholder="Enter membership number"
                                        className="w-full px-3 py-2.5 rounded-xl text-sm border"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1.5" style={{ color: '#475569' }}>Plan Tier</label>
                                    <input
                                        list="hmo-plan-tiers"
                                        value={insurance.planName || ''}
                                        onChange={(e) => setInsurance((p) => ({ ...p, planName: e.target.value }))}
                                        placeholder="Select or enter plan (e.g. Bronze, Silver, Gold)"
                                        className="w-full px-3 py-2.5 rounded-xl text-sm border"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }}
                                    />
                                    <datalist id="hmo-plan-tiers">
                                        <option value="Bronze / Basic (Tier 1)" />
                                        <option value="Silver / Standard (Tier 2)" />
                                        <option value="Gold / Executive (Tier 3)" />
                                        <option value="Platinum / Comprehensive" />
                                        <option value="Corporate / Enterprise" />
                                        <option value="Family Care Plan" />
                                        <option value="NHIA Formal Sector Plan" />
                                        <option value="NHIA Informal Sector (GIFSHIP)" />
                                    </datalist>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {['Tier 1 (Bronze)', 'Tier 2 (Silver)', 'Tier 3 (Gold)', 'Platinum', 'Corporate'].map((tier) => (
                                            <button
                                                key={tier}
                                                type="button"
                                                onClick={() => setInsurance((p) => ({ ...p, planName: tier }))}
                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all border cursor-pointer hover:border-teal-400"
                                                style={{
                                                    background: insurance.planName === tier ? '#f0fdfa' : '#f8fafc',
                                                    color: insurance.planName === tier ? '#0d9488' : '#64748b',
                                                    borderColor: insurance.planName === tier ? '#99f6e4' : '#e2e8f0',
                                                }}
                                            >
                                                {tier}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {eligibilityNotice && (
                                <div className="rounded-xl p-3.5 text-xs space-y-1.5 animate-fade-in" style={{ background: '#f0fdfa', border: '1px solid rgba(13,148,136,0.2)' }}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold flex items-center gap-1.5" style={{ color: '#0f766e' }}>
                                            <ShieldCheck size={14} /> NHIA Verification Gateway
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#d97706' }}>
                                            Standby / In Rollout
                                        </span>
                                    </div>
                                    <p style={{ color: '#334155' }}>
                                        Real-time automated eligibility checks for <strong>{eligibilityNotice.hmo}</strong> (Member ID: <code className="text-teal-700 font-semibold">{eligibilityNotice.memberId}</code>) will activate upon rollout of WelliRecord's direct NHIA gateway.
                                    </p>
                                    <p className="text-[11px]" style={{ color: '#64748b' }}>
                                        Providers can currently reference your self-reported HMO details when recording visit claims.
                                    </p>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold" style={{ color: '#475569' }}>Dependents on this plan</label>
                                    <button onClick={addDependent} className="text-xs font-bold flex items-center gap-1" style={{ color: '#0d9488' }}>
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                {(insurance.dependents || []).length === 0 && (
                                    <p className="text-xs" style={{ color: '#94a3b8' }}>No dependents added.</p>
                                )}
                                <div className="space-y-2">
                                    {(insurance.dependents || []).map((dep, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input value={dep.name} onChange={(e) => updateDependent(i, 'name', e.target.value)}
                                                placeholder="Name" className="flex-1 px-2.5 py-2 rounded-lg text-xs border"
                                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                                            <input value={dep.relationship || ''} onChange={(e) => updateDependent(i, 'relationship', e.target.value)}
                                                placeholder="Relationship" className="w-28 px-2.5 py-2 rounded-lg text-xs border"
                                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                                            <input value={dep.membershipId || ''} onChange={(e) => updateDependent(i, 'membershipId', e.target.value)}
                                                placeholder="Member ID" className="w-28 px-2.5 py-2 rounded-lg text-xs border"
                                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#1e293b' }} />
                                            <button onClick={() => removeDependent(i)} style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {saveError && <p className="text-xs" style={{ color: '#ef4444' }}>{saveError}</p>}
                            {saved && <p className="text-xs font-bold" style={{ color: '#0d9488' }}>Saved.</p>}
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                                style={{ background: '#0d9488' }}>
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === 'claims' && (
                <div className="space-y-2">
                    {loadingClaims && (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: '#94a3b8' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading your claims…
                        </div>
                    )}
                    {!loadingClaims && claimsError && (
                        <p className="text-sm py-6 text-center" style={{ color: '#ef4444' }}>{claimsError}</p>
                    )}
                    {!loadingClaims && !claimsError && claims.length === 0 && (
                        <div className="rounded-2xl p-8 text-center border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                            <ShieldCheck size={26} className="mx-auto mb-2" style={{ color: '#94a3b8' }} />
                            <p className="text-sm" style={{ color: '#64748b' }}>No claims have been filed on your behalf yet.</p>
                        </div>
                    )}
                    {!loadingClaims && !claimsError && claims.map((c) => {
                        const st = STATUS_STYLE[c.status];
                        const StIcon = st.icon;
                        return (
                            <div key={c._id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                                <StIcon size={15} style={{ color: st.color, flexShrink: 0 }} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>{c.hmoName}</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                                        {formatCurrency(c.claimAmount)} · {new Date(c.createdAt).toLocaleDateString('en-NG')}
                                        {c.rejectionReason ? ` · ${c.rejectionReason}` : ''}
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
