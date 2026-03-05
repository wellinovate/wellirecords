import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { consentApi } from '@/shared/api/consentApi';
import { auditApi } from '@/shared/api/auditApi';
import { ConsentScope, ConsentDuration } from '@/shared/types/types';
import {
    Shield, ShieldAlert, ShieldCheck, CheckCircle, Clock, X, Plus, Eye, AlertTriangle,
    FileText, DownloadCloud, QrCode, Share2, Copy, FileJson, Link, Activity,
    Zap, Trash2, Lock, Unlock, Users, TrendingUp,
} from 'lucide-react';

/* ── Mock provider access history ──────────────────────────────────────── */
const PROVIDER_HISTORY = [
    {
        id: 'p1', name: 'Dr. Fatima Aliyu', org: 'Lagos Cardiology Centre',
        initials: 'FA', avatarBg: '#ef4444',
        lastAccess: '2026-03-03T09:15:00Z', recordsViewed: 7,
        scope: 'Full History', trustScore: 97, trustLabel: 'High Trust', trustColor: '#10b981',
        accessCount: 12, flagged: false,
    },
    {
        id: 'p2', name: 'Valley Imaging Center', org: 'Valley Diagnostics Ltd',
        initials: 'VI', avatarBg: '#f97316',
        lastAccess: '2026-03-02T02:00:00Z', recordsViewed: 3,
        scope: 'Imaging', trustScore: 61, trustLabel: 'Review Needed', trustColor: '#f97316',
        accessCount: 4, flagged: true,
    },
    {
        id: 'p3', name: 'Dr. Sola Martins', org: 'WelliRecord GP Network',
        initials: 'SM', avatarBg: '#1a6b42',
        lastAccess: '2026-03-01T14:30:00Z', recordsViewed: 5,
        scope: 'Labs Only', trustScore: 94, trustLabel: 'High Trust', trustColor: '#10b981',
        accessCount: 9, flagged: false,
    },
    {
        id: 'p4', name: 'Pharmalink Dispensary', org: 'Pharmalink Nigeria',
        initials: 'PL', avatarBg: '#a855f7',
        lastAccess: '2026-02-28T11:00:00Z', recordsViewed: 2,
        scope: 'Medications', trustScore: 82, trustLabel: 'Standard Trust', trustColor: '#f59e0b',
        accessCount: 3, flagged: false,
    },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

function TrustRing({ score, color }: { score: number; color: string }) {
    const r = 18, circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width={44} height={44} className="flex-shrink-0">
            <circle cx={22} cy={22} r={r} fill="none" stroke="var(--pat-border)" strokeWidth={4} />
            <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 22 22)" />
            <text x={22} y={26} textAnchor="middle" fontSize={10} fontWeight="bold" fill={color}>{score}</text>
        </svg>
    );
}

const SCOPE_OPTIONS: { value: ConsentScope; label: string }[] = [
    { value: 'full', label: 'Full History' },
    { value: 'labs', label: 'Labs Only' },
    { value: 'medications', label: 'Medications' },
    { value: 'imaging', label: 'Imaging' },
];

const DURATION_OPTIONS: { value: ConsentDuration; label: string; aiNote?: string }[] = [
    { value: '24h', label: '24 hours', aiNote: 'Recommended' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: 'permanent', label: 'Permanent' },
];

type ActiveTab = 'active' | 'requests' | 'audit' | 'export';

export function DataSovereigntyCenterPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<ActiveTab>('active');
    const [grants, setGrants] = useState(() => consentApi.getGrants(user?.userId ?? ''));
    const [requests] = useState(() => consentApi.getRequests(user?.userId ?? ''));
    const [audit] = useState(() => auditApi.getAuditLog(user?.userId ?? ''));
    const [showNew, setShowNew] = useState(false);
    const [newScope, setNewScope] = useState<ConsentScope>('labs');
    const [newDuration, setNewDuration] = useState<ConsentDuration>('24h');
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [emergencyExpiry] = useState('Expires in 24 hours after activation');
    const [exportFormat, setExportFormat] = useState<'fhir' | 'pdf'>('fhir');
    const [isExporting, setIsExporting] = useState(false);
    const [revokedIds, setRevokedIds] = useState<string[]>([]);

    const pendingReqs = requests.filter(r => r.status === 'pending');
    const visibleProviders = PROVIDER_HISTORY.filter(p => !revokedIds.includes(p.id));
    const flaggedCount = visibleProviders.filter(p => p.flagged).length;

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">

            {/* ─── Header & Universal ID ─── */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8 mt-2">
                <div className="flex-1">
                    <h1 className="section-header font-display mb-2 flex items-center gap-2" style={{ color: '#1a2e1e' }}>
                        Data Sovereignty Center <ShieldCheck size={28} style={{ color: '#1a6b42' }} />
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: '#5a7a63', maxWidth: 600 }}>
                        Complete control over who sees your health records. Every permission grant, access event, and revocation is cryptographically signed and logged on the WelliChain.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-6">
                        <button onClick={() => setShowNew(true)} className="btn btn-patient gap-2 py-2">
                            <Plus size={16} /> Grant New Access
                        </button>
                        <button onClick={() => setTab('export')} className="btn btn-patient-outline bg-white gap-2 py-2">
                            <DownloadCloud size={16} /> Export Records
                        </button>
                    </div>
                </div>

                {/* Universal ID Card */}
                <div className="card-patient p-5 flex items-start gap-4 flex-shrink-0 w-full lg:w-80"
                    style={{ background: 'linear-gradient(135deg, #1a2e1e, #1a6b42)' }}>
                    <div className="p-2 bg-white rounded-xl shadow-inner">
                        <QrCode size={56} style={{ color: '#1a2e1e' }} />
                    </div>
                    <div className="text-white flex-1">
                        <div className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">Universal ID</div>
                        <div className="font-mono text-lg font-bold tracking-wider mb-1">WR-8921-XKA9</div>
                        <div className="text-[10px] opacity-60 mb-3">Cryptographically verified · WelliChain</div>
                        <div className="flex gap-2">
                            <button className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                <Copy size={10} /> Copy ID
                            </button>
                            <button className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                <Share2 size={10} /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Emergency Access Card ─── */}
            <div className={`mb-8 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${emergencyMode
                ? 'border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.25)]'
                : 'border-gray-200'}`}>
                {/* Status stripe */}
                <div className={`h-1.5 w-full transition-colors duration-300 ${emergencyMode ? 'bg-red-500' : 'bg-gray-200'}`} />

                <div className={`p-5 transition-colors duration-300 ${emergencyMode ? 'bg-red-50' : 'bg-white'}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${emergencyMode ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                style={emergencyMode ? { animation: 'pulse 2s infinite' } : {}}>
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-bold text-base ${emergencyMode ? 'text-red-700' : 'text-gray-800'}`}>
                                        Emergency Access Mode
                                    </h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${emergencyMode
                                        ? 'bg-red-200 text-red-700'
                                        : 'bg-gray-100 text-gray-500'}`}>
                                        {emergencyMode ? 'ACTIVE — RED QR' : 'STANDBY'}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${emergencyMode ? 'text-red-700' : 'text-gray-600'}`} style={{ maxWidth: 520 }}>
                                    {emergencyMode
                                        ? `🔴 Any verified first responder can scan your QR to view emergency vitals & allergies — no login required. ${emergencyExpiry}.`
                                        : 'Turn on to allow any verified first responder to view your emergency vitals and allergy profile via QR scan — no internet login required. Automatically expires 24 hours after activation.'}
                                </p>
                                {!emergencyMode && (
                                    <p className="text-xs mt-2 text-gray-400">
                                        ℹ️ Use this if you're heading into surgery, travelling, or in an area with limited hospital access to your records.
                                    </p>
                                )}
                                {emergencyMode && (
                                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-red-600">
                                        <Clock size={12} /> Auto-expires in 24h · Accessible to: Verified first responders only
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Toggle */}
                        <button
                            onClick={() => setEmergencyMode(e => !e)}
                            className={`flex-shrink-0 w-14 h-7 rounded-full relative transition-all duration-300 focus:outline-none ${emergencyMode ? 'bg-red-500' : 'bg-gray-300'}`}
                            aria-label="Toggle emergency access">
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${emergencyMode ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Navigation Tabs ─── */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-full sm:w-fit overflow-x-auto"
                style={{ background: 'rgba(26,107,66,.06)', border: '1px solid rgba(26,107,66,.12)' }}>
                {(['active', 'requests', 'audit', 'export'] as ActiveTab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap"
                        style={{ background: tab === t ? '#1a6b42' : 'transparent', color: tab === t ? '#fff' : '#5a7a63' }}>
                        {t === 'requests' ? `Requests${pendingReqs.length > 0 ? ` (${pendingReqs.length})` : ''}` : t === 'active' ? 'Security Status' : t}
                    </button>
                ))}
            </div>

            {/* ─── Tab Content ─── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* ── Main Content (2/3) ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* ── Security Status Tab (was "active") ── */}
                    {tab === 'active' && (
                        <>
                            {/* Green security shield banner */}
                            <div className="rounded-2xl p-6 flex items-start gap-5" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac' }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#16a34a20' }}>
                                    <Shield size={30} style={{ color: '#16a34a' }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-base" style={{ color: '#14532d' }}>Your Data Is Protected</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800 uppercase tracking-wider">All Clear</span>
                                    </div>
                                    <p className="text-sm" style={{ color: '#166534' }}>
                                        {visibleProviders.length} authorised providers have access history. All access is logged, timestamped, and revocable by you at any time.
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {[
                                            { label: 'Active Providers', value: visibleProviders.length, color: '#16a34a' },
                                            { label: 'Records Viewed (30d)', value: 24, color: '#1a6b42' },
                                            { label: 'Flagged Access Events', value: flaggedCount, color: flaggedCount > 0 ? '#ef4444' : '#16a34a' },
                                        ].map(s => (
                                            <div key={s.label}>
                                                <div className="text-2xl font-black font-display" style={{ color: s.color }}>{s.value}</div>
                                                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#166534' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Flagged alert */}
                            {flaggedCount > 0 && (
                                <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: '#fff7ed', border: '1.5px solid #fb923c' }}>
                                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#ea580c' }} />
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: '#9a3412' }}>Unusual Access Detected</div>
                                        <p className="text-xs mt-0.5" style={{ color: '#c2410c' }}>
                                            <b>Valley Imaging Center</b> accessed your Clinical Notes at 2:00 AM — outside standard operating hours, from an IP outside your home region. Review or revoke below.
                                        </p>
                                        <button className="mt-2 text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: '#ea580c' }}>
                                            Review This Access →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Provider access history */}
                            <h2 className="font-bold text-base pt-2" style={{ color: '#1a2e1e' }}>Who Has Accessed Your Records</h2>
                            <div className="space-y-3">
                                {visibleProviders.map(prov => (
                                    <div key={prov.id}
                                        className="rounded-2xl border p-4 flex items-center gap-4 transition-all"
                                        style={{ background: 'white', borderColor: prov.flagged ? '#fb923c' : '#e5e7eb', borderLeftWidth: 4, borderLeftColor: prov.trustColor }}>
                                        {/* Avatar */}
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                                            style={{ background: `linear-gradient(135deg,${prov.avatarBg}cc,${prov.avatarBg})` }}>
                                            {prov.initials}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-sm" style={{ color: '#1a2e1e' }}>{prov.name}</span>
                                                {prov.flagged && <AlertTriangle size={12} className="text-orange-500" />}
                                            </div>
                                            <div className="text-xs" style={{ color: '#5a7a63' }}>{prov.org} · {prov.scope}</div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: '#9ca3af' }}>
                                                <span className="flex items-center gap-1"><Eye size={10} /> {prov.recordsViewed} records viewed</span>
                                                <span className="flex items-center gap-1"><Clock size={10} /> Last: {timeAgo(prov.lastAccess)}</span>
                                                <span className="flex items-center gap-1"><Activity size={10} /> {prov.accessCount} sessions</span>
                                            </div>
                                        </div>
                                        {/* Trust score */}
                                        <TrustRing score={prov.trustScore} color={prov.trustColor} />
                                        {/* Revoke */}
                                        <button
                                            onClick={() => setRevokedIds(arr => [...arr, prov.id])}
                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                                            <Trash2 size={12} /> Revoke
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {revokedIds.length > 0 && (
                                <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                                    <Lock size={14} /> {revokedIds.length} provider{revokedIds.length > 1 ? 's' : ''} revoked — access cryptographically invalidated on WelliChain.
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Audit Tab ── */}
                    {tab === 'audit' && (
                        <>
                            <h2 className="font-bold text-lg mb-4" style={{ color: '#1a2e1e' }}>AI Audit & Anomaly Detection</h2>

                            <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: '#fff1f2', border: '1.5px solid #fca5a5', animation: 'pulse 3s infinite' }}>
                                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-800 text-sm">Unusual Access Detected</h3>
                                    <p className="text-xs text-red-600 mt-1">Provider <b>Valley Imaging Center</b> accessed your Clinical Notes at 2:00 AM outside standard operating hours. Access was geolocated to an IP outside your home region.</p>
                                    <button className="mt-2 text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700">Audit & Revoke Connection</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {audit.map(entry => (
                                    <div key={entry.id} className="flex items-start gap-4 p-4 rounded-xl border bg-white" style={{ borderColor: '#e5e7eb' }}>
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Eye size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold" style={{ color: '#1a2e1e' }}>
                                                {entry.accessedByName} <span className="font-normal text-gray-500">accessed {entry.recordTitle || 'records'}</span>
                                            </div>
                                            <div className="text-xs mt-1" style={{ color: '#5a7a63' }}>
                                                {new Date(entry.accessedAt).toLocaleString()} · Authorized via Universal ID
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                                            0x{Math.random().toString(16).slice(2, 8)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── Export Tab ── */}
                    {tab === 'export' && (
                        <div className="card-patient p-8">
                            <h2 className="font-bold text-xl mb-2" style={{ color: '#1a2e1e' }}>Cross-Border Ready Data</h2>
                            <p className="text-sm text-gray-600 mb-6">Export your Life Record securely. All exports are cryptographically signed, ensuring your data is verifiable anywhere in the world.</p>
                            <div className="space-y-3 mb-6">
                                {[
                                    { id: 'fhir', label: 'FHIR Format (JSON)', desc: 'Universal standard for moving to a new digital hospital', icon: FileJson },
                                    { id: 'pdf', label: 'PDF + Structured JSON', desc: 'Readable summary with embedded raw data for physicians', icon: FileText },
                                ].map(f => (
                                    <label key={f.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="exportFmt" checked={exportFormat === f.id as any}
                                            onChange={() => setExportFormat(f.id as any)} className="accent-emerald-600" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">{f.label}</div>
                                            <div className="text-xs text-gray-500">{f.desc}</div>
                                        </div>
                                        <f.icon size={20} className="text-gray-400" />
                                    </label>
                                ))}
                            </div>
                            <button onClick={handleExport} disabled={isExporting}
                                className="btn w-full justify-center gap-2" style={{ background: '#1a2e1e', color: '#fff' }}>
                                {isExporting ? <span className="animate-pulse">Generating Cryptographic Signature…</span> : <><DownloadCloud size={16} /> Generate Export Bundle</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Sidebar (1/3) ── */}
                <div className="space-y-6">

                    {/* Access Statistics */}
                    <div className="card-patient p-6 border border-emerald-100">
                        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1a2e1e' }}>
                            <Activity size={18} style={{ color: '#1a6b42' }} /> Access Statistics
                            <span className="text-[10px] font-bold ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">30D</span>
                        </h3>
                        <div className="space-y-4">
                            {[
                                { value: 24, label: 'Records Viewed', color: '#1a2e1e' },
                                { value: 5, label: 'New Records Added', color: '#16a34a' },
                                { value: visibleProviders.length, label: 'Authorised Providers', color: '#1a6b42' },
                                { value: flaggedCount, label: 'Flagged Events', color: flaggedCount > 0 ? '#ef4444' : '#6b7280' },
                            ].map((s, i) => (
                                <React.Fragment key={s.label}>
                                    {i > 0 && <div className="w-full h-px bg-gray-100" />}
                                    <div>
                                        <div className="text-3xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* AI Provider Risk Scores — full cards */}
                    <div className="card-patient p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-1" style={{ color: '#1a2e1e' }}>
                            <ShieldCheck size={18} className="text-blue-500" /> AI Provider Risk Scores
                        </h3>
                        <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
                            WelliAI continuously monitors provider access patterns and assigns trust scores.
                        </p>
                        <div className="space-y-4">
                            {PROVIDER_HISTORY.map(prov => {
                                const revoked = revokedIds.includes(prov.id);
                                return (
                                    <div key={prov.id}
                                        className={`rounded-xl p-3 border transition-all ${revoked ? 'opacity-40' : ''}`}
                                        style={{ borderColor: prov.flagged ? '#fb923c' : '#e5e7eb', background: prov.flagged ? '#fff7ed' : 'white' }}>
                                        {/* Top row: avatar + name + score ring */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                                                style={{ background: prov.avatarBg }}>
                                                {prov.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-xs truncate" style={{ color: '#1a2e1e' }}>{prov.name}</div>
                                                <div className="text-[10px]" style={{ color: '#9ca3af' }}>{prov.scope}</div>
                                            </div>
                                            <TrustRing score={prov.trustScore} color={prov.trustColor} />
                                        </div>
                                        {/* Stats row */}
                                        <div className="flex items-center gap-2 text-[10px] mb-2" style={{ color: '#9ca3af' }}>
                                            <span className="flex items-center gap-0.5">
                                                <Clock size={9} /> {timeAgo(prov.lastAccess)}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-0.5">
                                                <Eye size={9} /> {prov.recordsViewed} records
                                            </span>
                                            {prov.flagged && (
                                                <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                                                    · <AlertTriangle size={9} /> Flagged
                                                </span>
                                            )}
                                        </div>
                                        {/* Trust label + revoke */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: `${prov.trustColor}18`, color: prov.trustColor }}>
                                                {prov.trustLabel}
                                            </span>
                                            {!revoked ? (
                                                <button
                                                    onClick={() => setRevokedIds(arr => [...arr, prov.id])}
                                                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                                    style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                                                    <Trash2 size={9} /> Revoke
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                                    <Lock size={9} /> Revoked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* ─── Fast Grant Modal ─── */}
            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="card-patient w-full max-w-md p-6 border-2 border-emerald-500 shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display font-bold text-lg" style={{ color: '#1a2e1e' }}>Smart Consent Controls</h3>
                            <button onClick={() => setShowNew(false)} className="hover:bg-gray-100 p-1 rounded-full"><X size={16} /></button>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-sm text-blue-800 flex items-start gap-2">
                            <Link size={16} className="mt-0.5 flex-shrink-0" />
                            <p>Generate a <b>One-Time Access Link</b>. The link automatically self-destructs 10 minutes after the first view.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Granular Access (Per Document Type)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SCOPE_OPTIONS.map(s => (
                                        <button key={s.value} onClick={() => setNewScope(s.value)}
                                            className={`p-2 rounded-lg text-xs font-semibold text-left transition-colors border ${newScope === s.value ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Auto-Expire Duration</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DURATION_OPTIONS.map(d => (
                                        <button key={d.value} onClick={() => setNewDuration(d.value)}
                                            className={`relative p-2 rounded-lg text-xs font-semibold transition-colors border ${newDuration === d.value ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                                            {d.label}
                                            {d.aiNote && <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow">{d.aiNote}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setShowNew(false)} className="btn btn-patient w-full justify-center mt-4">
                                Generate 10-Minute Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
