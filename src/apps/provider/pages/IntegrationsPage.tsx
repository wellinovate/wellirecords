import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { orgApi } from '@/shared/api/orgApi';
import { Settings2, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle, X, Shield, FlaskConical, Pill, Activity, MapPin } from 'lucide-react';

export function IntegrationsPage() {
    const { user } = useAuth();
    const org = user?.orgId ? orgApi.getById(user.orgId) : undefined;
    const [showNew, setShowNew] = useState(false);
    const [revealed, setRevealed] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [scopes, setScopes] = useState<string[]>([]);
    const [created, setCreated] = useState(false);

    const scopeOptions = ['fhir:read', 'fhir:write', 'labs:read', 'labs:write', 'claims:read', 'claims:write', 'analytics:read'];

    const copy = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const createKey = () => {
        setCreated(true);
        setTimeout(() => { setCreated(false); setShowNew(false); setLabel(''); setScopes([]); }, 2000);
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
                    <span className="flex-1">https://api.welli.ng/fhir/r4/{org?.id ?? 'org_id'}</span>
                    <button onClick={() => copy(`https://api.welli.ng/fhir/r4/${org?.id}`, 'fhir')} className="text-xs font-bold hover:opacity-80">
                        {copied === 'fhir' ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            {/* Connected Ecosystem Partners */}
            <div className="mb-8">
                <h2 className="font-bold mb-4" style={{ color: '#e2eaf4' }}>Active Ecosystem Connections</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { name: 'National Health Insurance Scheme', type: 'Insurance', status: 'Active Sync', icon: Shield, color: '#38bdf8' },
                        { name: 'CityLab Diagnostics', type: 'Laboratory', status: 'Bi-directional', icon: FlaskConical, color: '#a855f7' },
                        { name: 'HealthPlus Pharmacy', type: 'Pharmacy', status: 'Write-only (Rx)', icon: Pill, color: '#10b981' },
                        { name: 'WelliCare Telehealth', type: 'Telemedicine', status: 'Active Sync', icon: Activity, color: '#f59e0b' },
                        { name: 'WHO Disease Surveillance', type: 'NGO / Public Health', status: 'Anonymized Read', icon: MapPin, color: '#ef4444' },
                    ].map(p => (
                        <div key={p.name} className="card-provider p-4 flex items-start gap-4 hover:border-sky-400 transition-colors cursor-pointer" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--prov-border)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20` }}>
                                <p.icon size={20} style={{ color: p.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate" style={{ color: '#e2eaf4' }}>{p.name}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>{p.type}</div>
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(56,189,248,.08)', color: '#38bdf8' }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" /> {p.status}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                        style={{ borderColor: 'rgba(56,189,248,.4)', minHeight: '100px' }} onClick={() => setShowNew(true)}>
                        <Plus size={20} className="mb-2" style={{ color: '#38bdf8' }} />
                        <div className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Connect New Partner</div>
                        <div className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>via FHIR or API Key</div>
                    </div>
                </div>
            </div>

            {/* API Keys table */}
            <div className="card-provider overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--prov-border)' }}>
                    <h2 className="font-bold" style={{ color: '#e2eaf4' }}>API Keys ({org?.apiKeys?.length ?? 0})</h2>
                </div>
                {org?.apiKeys?.length === 0 ? (
                    <div className="p-10 text-center"><p className="text-sm" style={{ color: '#7ba3c8' }}>No API keys yet</p></div>
                ) : (
                    <table className="welli-table">
                        <thead><tr><th>Label</th><th>Key</th><th>Scopes</th><th>Last Used</th><th></th></tr></thead>
                        <tbody>
                            {org?.apiKeys?.map(k => (
                                <tr key={k.id}>
                                    <td className="font-semibold text-sm" style={{ color: '#e2eaf4' }}>{k.label}</td>
                                    <td>
                                        <div className="flex items-center gap-2 font-mono text-xs" style={{ color: '#7ba3c8' }}>
                                            <span>{revealed === k.id ? k.key : k.key.slice(0, 14) + '•••••••••'}</span>
                                            <button onClick={() => setRevealed(r => r === k.id ? null : k.id)} className="hover:opacity-70">
                                                {revealed === k.id ? <EyeOff size={13} /> : <Eye size={13} />}
                                            </button>
                                            <button onClick={() => copy(k.key, k.id)} className="hover:opacity-70">
                                                {copied === k.id ? <CheckCircle size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td><div className="flex gap-1 flex-wrap">{k.scopes.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(56,189,248,.08)', color: '#38bdf8' }}>{s}</span>)}</div></td>
                                    <td className="text-xs" style={{ color: '#7ba3c8' }}>{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}</td>
                                    <td><button className="btn btn-sm btn-danger opacity-60 hover:opacity-100"><Trash2 size={13} /></button></td>
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
                            <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><X size={16} style={{ color: '#7ba3c8' }} /></button>
                        </div>
                        <div className="space-y-4">
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
                            <button onClick={createKey} className="btn btn-provider w-full justify-center gap-2">
                                {created ? <><CheckCircle size={16} /> Key Created!</> : <><Settings2 size={16} /> Generate Key</>}
                            </button>
                            <p className="text-[11px] text-center" style={{ color: '#3e5a78' }}>⚠️ Copy the key immediately — it will only be shown once.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
