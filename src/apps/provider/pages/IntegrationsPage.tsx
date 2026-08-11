import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { getMyOrganization, MyOrganization } from '@/shared/api/organizationApi';
import { apiKeysApi, ApiKeySummary } from '@/shared/api/apiKeysApi';
import { Settings2, Plus, Copy, Trash2, CheckCircle, X, Loader2, KeyRound } from 'lucide-react';

export function IntegrationsPage() {
    const { user } = useAuth();
    const [org, setOrg] = useState<MyOrganization | null>(null);
    const [keys, setKeys] = useState<ApiKeySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [scopes, setScopes] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const scopeOptions = ['fhir:read', 'fhir:write', 'labs:read', 'labs:write', 'claims:read', 'claims:write', 'analytics:read'];

    const fetchKeys = () => {
        setLoading(true);
        apiKeysApi.list()
            .then(setKeys)
            .catch((err) => console.warn('Could not load API keys:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchKeys();
        getMyOrganization().then(setOrg).catch(() => {});
    }, []);

    const copy = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const createKey = async () => {
        setCreating(true);
        setCreateError(null);
        try {
            const created = await apiKeysApi.create({ label, scopes });
            setNewKey(created.key);
            fetchKeys();
        } catch (err: any) {
            setCreateError(err?.response?.data?.message || "Couldn't create the key — try again.");
        } finally {
            setCreating(false);
        }
    };

    const revoke = async (keyId: string) => {
        setRevokingId(keyId);
        try {
            await apiKeysApi.revoke(keyId);
            fetchKeys();
        } catch (err) {
            console.warn('Could not revoke key:', err);
        } finally {
            setRevokingId(null);
        }
    };

    const closeModal = () => {
        setShowNew(false);
        setLabel('');
        setScopes([]);
        setNewKey(null);
        setCreateError(null);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>API Keys & Integrations</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Manage API keys for FHIR, HL7, and custom integrations</p>
                </div>
                <button onClick={() => setShowNew(true)} className="btn btn-provider gap-2"><Plus size={16} /> Generate API Key</button>
            </div>

            {/* FHIR endpoint info */}
            <div className="card-provider p-5 mb-6">
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>FHIR R4 Base URL</div>
                <div className="flex items-center gap-3 p-3 rounded-xl font-mono text-sm"
                    style={{ background: 'rgba(56,189,248,.05)', border: '1px solid rgba(56,189,248,.15)', color: '#38bdf8' }}>
                    <span className="flex-1">https://api.welli.ng/fhir/r4/{org?._id ?? 'org_id'}</span>
                    <button onClick={() => copy(`https://api.welli.ng/fhir/r4/${org?._id}`, 'fhir')} className="text-xs font-bold hover:opacity-80">
                        {copied === 'fhir' ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            {/* No real ecosystem partner connections exist yet — the previous
                version showed five hardcoded partners (NHIS, CityLab, etc.)
                all marked "Active Sync" regardless of whether anything was
                actually connected. */}
            <div className="card-provider p-6 mb-8 text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: '#e2eaf4' }}>No ecosystem partners connected yet</p>
                <p className="text-xs max-w-md mx-auto" style={{ color: '#7ba3c8' }}>
                    Insurance, lab, pharmacy, and telemedicine partner connections aren't available yet. Generate an API key below for direct FHIR integration in the meantime.
                </p>
            </div>

            {/* API Keys table */}
            <div className="card-provider overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--prov-border)' }}>
                    <h2 className="font-bold" style={{ color: '#e2eaf4' }}>API Keys ({keys.length})</h2>
                </div>
                {loading ? (
                    <div className="p-10 text-center"><Loader2 size={20} className="mx-auto animate-spin" style={{ color: '#7ba3c8' }} /></div>
                ) : keys.length === 0 ? (
                    <div className="p-10 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No API keys yet</p></div>
                ) : (
                    <table className="welli-table">
                        <thead><tr><th>Label</th><th>Key</th><th>Scopes</th><th>Last Used</th><th></th></tr></thead>
                        <tbody>
                            {keys.map(k => (
                                <tr key={k.id}>
                                    <td className="font-semibold text-sm" style={{ color: '#e2eaf4' }}>{k.label}</td>
                                    <td>
                                        <div className="flex items-center gap-2 font-mono text-xs" style={{ color: '#7ba3c8' }}>
                                            <KeyRound size={12} />
                                            <span>{k.keyPrefix}••••••••••••</span>
                                        </div>
                                    </td>
                                    <td><div className="flex gap-1 flex-wrap">{k.scopes.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(56,189,248,.08)', color: '#38bdf8' }}>{s}</span>)}</div></td>
                                    <td className="text-xs" style={{ color: '#7ba3c8' }}>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <button onClick={() => revoke(k.id)} disabled={revokingId === k.id}
                                            className="btn btn-sm btn-danger opacity-60 hover:opacity-100 disabled:opacity-30">
                                            {revokingId === k.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="card-provider w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>Generate New API Key</h3>
                            <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                        </div>
                        <div className="space-y-4">
                            {newKey ? (
                                <>
                                    <p className="text-xs" style={{ color: '#7ba3c8' }}>Copy this now — it won't be shown again.</p>
                                    <div className="flex items-center gap-2 p-3 rounded-xl font-mono text-xs break-all"
                                        style={{ background: 'rgba(56,189,248,.05)', border: '1px solid rgba(56,189,248,.2)', color: '#38bdf8' }}>
                                        <span className="flex-1">{newKey}</span>
                                        <button onClick={() => copy(newKey, 'new')} className="flex-shrink-0 hover:opacity-80">
                                            {copied === 'new' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <button onClick={closeModal} className="btn btn-provider w-full justify-center">Done</button>
                                </>
                            ) : (
                                <>
                                    <div><label className="block text-sm font-medium mb-1" style={{ color: '#e2eaf4' }}>Key Label</label><input value={label} onChange={e => setLabel(e.target.value)} className="input input-dark" placeholder="e.g. FHIR Integration" /></div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#e2eaf4' }}>Permissions / Scopes</label>
                                        <div className="flex flex-wrap gap-2">
                                            {scopeOptions.map(s => (
                                                <button key={s} onClick={() => setScopes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                                                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                                    style={{ background: scopes.includes(s) ? '#38bdf8' : 'rgba(56,189,248,.08)', color: scopes.includes(s) ? '#050d1a' : '#7ba3c8', border: `1px solid ${scopes.includes(s) ? '#38bdf8' : 'rgba(56,189,248,.2)'}` }}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={createKey} disabled={!label || creating} className="btn btn-provider w-full justify-center gap-2 disabled:opacity-40">
                                        {creating ? <Loader2 size={16} className="animate-spin" /> : <Settings2 size={16} />}
                                        {creating ? 'Generating…' : 'Generate Key'}
                                    </button>
                                    {createError && <p className="text-xs text-center" style={{ color: '#f87171' }}>{createError}</p>}
                                    <p className="text-[11px] text-center" style={{ color: '#3e5a78' }}>⚠️ Copy the key immediately — it will only be shown once.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
