import React, { useState } from 'react';
import {
    Fingerprint, AlertCircle, Clock, ShieldAlert,
    Download, Search, Filter, ShieldCheck, UserX,
    ChevronDown, ChevronRight, Play, X
} from 'lucide-react';

// --- Types & Mock Data ---

type ImpersonationStatus = 'Active' | 'Timeout' | 'Manual Logout' | 'Revoked';
type RiskLevel = 'Normal' | 'Warning' | 'Critical';

interface AuditAction {
    time: string;
    path: string;
    actionType: 'GET' | 'POST' | 'DELETE' | 'PUT';
    sensitive: boolean;
}

interface ImpersonationSession {
    id: string;
    adminName: string;
    targetName: string;
    targetRole: string;
    targetOrg: string;
    justification: string;
    ipAddress: string;
    startTime: string;
    durationMins: number; // For active sessions, current duration
    status: ImpersonationStatus;
    risk: RiskLevel;
    actions: AuditAction[];
}

const MOCK_SESSIONS: ImpersonationSession[] = [
    {
        id: 'IMP-8429-XB',
        adminName: 'Tolu Adeyemi (Super Admin)',
        targetName: 'Dr. Sarah Ndubuisi',
        targetRole: 'Clinician',
        targetOrg: 'Avon Medical Practice',
        justification: 'Investigating reported bug #441 where patient timeline fails to render clinical notes.',
        ipAddress: '197.210.64.12',
        startTime: 'Today, 14:05:00',
        durationMins: 12,
        status: 'Active',
        risk: 'Normal',
        actions: [
            { time: '14:05:01', path: '/provider/dashboard', actionType: 'GET', sensitive: false },
            { time: '14:06:22', path: '/provider/patients/PT-8812', actionType: 'GET', sensitive: false }
        ]
    },
    {
        id: 'IMP-8428-MC',
        adminName: 'Chidi Okonkwo (System Support)',
        targetName: 'Bayo Adewale',
        targetRole: 'Org Admin',
        targetOrg: 'CityLab Diagnostics',
        justification: 'Client locked out of billing interface, checking stripe integration keys.',
        ipAddress: '105.112.98.44',
        startTime: 'Yesterday, 09:12:00',
        durationMins: 45, // Warning: over 30 mins
        status: 'Manual Logout',
        risk: 'Critical', // They accessed billing keys
        actions: [
            { time: '09:12:05', path: '/admin', actionType: 'GET', sensitive: false },
            { time: '09:14:00', path: '/admin/settings/billing', actionType: 'GET', sensitive: true },
            { time: '09:18:22', path: '/api/v1/tenant/stripe-keys', actionType: 'GET', sensitive: true },
            { time: '09:57:00', path: '/auth/logout', actionType: 'POST', sensitive: false }
        ]
    },
    {
        id: 'IMP-8421-KL',
        adminName: 'System Maintenance (Automated)',
        targetName: 'Jane Doe',
        targetRole: 'Patient',
        targetOrg: 'Independent',
        justification: 'Automated GDPR compliance data anonymization check.',
        ipAddress: '10.0.4.122',
        startTime: 'Feb 28, 02:00:00',
        durationMins: 5,
        status: 'Manual Logout',
        risk: 'Normal',
        actions: [
            { time: '02:00:01', path: '/patient/profile', actionType: 'GET', sensitive: false },
            { time: '02:04:15', path: '/patient/settings/privacy', actionType: 'GET', sensitive: false }
        ]
    },
    {
        id: 'IMP-8409-PP',
        adminName: 'Tolu Adeyemi (Super Admin)',
        targetName: 'Mary Adebayo',
        targetRole: 'Patient',
        targetOrg: 'Independent',
        justification: 'Checking emergency card generation failure as reported on ZenDesk Z-4122.',
        ipAddress: '197.210.64.12',
        startTime: 'Feb 25, 11:30:00',
        durationMins: 8,
        status: 'Timeout',
        risk: 'Warning', // Accessed emergency card
        actions: [
            { time: '11:30:05', path: '/patient/dashboard', actionType: 'GET', sensitive: false },
            { time: '11:32:10', path: '/patient/emergency-card', actionType: 'GET', sensitive: true },
            { time: '11:36:00', path: '/api/v1/patient/generate-card-pdf', actionType: 'POST', sensitive: true }
        ]
    }
];

// --- Subcomponents ---

function NewImpersonationModal({ onClose }: { onClose: () => void }) {
    const [targetId, setTargetId] = useState('');
    const [justification, setJustification] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fade-in border mt-[-10vh]"
                style={{ background: '#0f172a', borderColor: 'var(--sa-border)' }}>
                <div className="flex justify-between items-start mb-6 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                            <Fingerprint className="text-indigo-400" size={20} /> Initiate Impersonation
                        </h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--sa-muted)' }}>This action is permanently logged and triggers an alert.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--sa-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: '#cbd5e1' }}>Target User ID / Email</label>
                        <input
                            type="text"
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className="w-full text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-1 focus:ring-indigo-500/50"
                            style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="e.g. PRV-2918 or doctor@clinic.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: '#cbd5e1' }}>Audit Justification (Mandatory)</label>
                        <textarea
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="w-full text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-1 focus:ring-indigo-500/50 min-h-[100px] resize-none"
                            style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="Provide the Zendesk ticket number or specific reason for assuming this identity..."
                        />
                    </div>
                </div>

                <div className="p-3 rounded-lg mb-6 text-[11px] flex gap-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
                    <p><strong>NDPR Notice:</strong> Operating as a user without their explicit consent for troubleshooting is a breach of privacy. Do not access clinical or financial records unnecessarily.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold transition-colors hover:bg-white/5" style={{ color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Cancel
                    </button>
                    <button
                        disabled={!targetId || justification.length < 10}
                        className="flex-1 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ background: '#4f46e5', color: '#fff' }}
                    >
                        <Play size={16} fill="currentColor" /> Begin Session
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- Main Page ---

export function SuperAdminImpersonations() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleRow = (id: string) => {
        const next = new Set(expandedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRows(next);
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: '#e2e8f0' }}>
                        <Fingerprint className="text-indigo-400" size={28} />
                        Impersonation Audit Log
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>NDPR/HIPAA compliance log of all assumed identities and actions taken.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-slate-800 border"
                        style={{ color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Download size={16} /> Export Compliance PDF
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-indigo-500"
                        style={{ background: '#4f46e5', color: '#fff' }}>
                        <Play size={16} fill="currentColor" /> Start Impersonation
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl flex items-center gap-4" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><ShieldCheck size={24} /></div>
                    <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--sa-muted)' }}>Active Sessions Now</div>
                        <div className="text-2xl font-black text-white">1</div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl flex items-center gap-4" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><Fingerprint size={24} /></div>
                    <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--sa-muted)' }}>Sessions (Last 7 Days)</div>
                        <div className="text-2xl font-black text-white">24</div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl flex items-center gap-4" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-400"><ShieldAlert size={24} /></div>
                    <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--sa-muted)' }}>Flagged Sessions (Risk)</div>
                        <div className="text-2xl font-black text-white">3</div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="rounded-2xl flex flex-col overflow-hidden" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                {/* Control Bar */}
                <div className="p-4 flex items-center gap-4 justify-between border-b" style={{ borderColor: 'var(--sa-border)' }}>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--sa-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by Session ID, Admin User, or Target..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-sm rounded-xl pl-10 pr-4 py-2 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                            style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border"
                        style={{ background: '#080e20', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Filter size={16} /> Filters
                    </button>
                </div>

                {/* Audit Grid */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr style={{ background: 'rgba(8, 14, 32, 0.4)' }}>
                                <th className="p-4 w-10"></th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Session / Justification</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Admin Origin</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Target Assumed</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--sa-muted)' }}>Duration & Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {MOCK_SESSIONS.map((session) => {
                                const isExpanded = expandedRows.has(session.id);

                                // Risk Styling
                                let rowBg = 'transparent';
                                let riskBadge = null;
                                if (session.risk === 'Critical') {
                                    rowBg = 'rgba(239,68,68,0.03)';
                                    riskBadge = <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-500 border border-red-500/30 ml-2">Sensitive Data</span>;
                                } else if (session.risk === 'Warning') {
                                    rowBg = 'rgba(245,158,11,0.03)';
                                    riskBadge = <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30 ml-2">Warning</span>;
                                } else if (session.durationMins > 30) {
                                    riskBadge = <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30 ml-2">&gt;30m Runtime</span>;
                                }

                                return (
                                    <React.Fragment key={session.id}>
                                        <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            style={{ background: rowBg }}
                                            onClick={() => toggleRow(session.id)}>
                                            <td className="p-4 text-center">
                                                {isExpanded ? <ChevronDown size={16} className="text-indigo-400" /> : <ChevronRight size={16} style={{ color: 'var(--sa-muted)' }} />}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-xs font-bold mb-1 flex items-center" style={{ color: '#e2e8f0' }}>
                                                    {session.id} {riskBadge}
                                                </div>
                                                <div className="text-[11px] leading-tight max-w-[250px] truncate group-hover:whitespace-normal group-hover:text-clip" style={{ color: 'var(--sa-muted)' }}>
                                                    "{session.justification}"
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold" style={{ color: '#e2e8f0' }}>{session.adminName}</div>
                                                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--sa-muted)' }}>IP: {session.ipAddress}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold" style={{ color: '#e2e8f0' }}>{session.targetName}</div>
                                                <div className="text-[10px] mt-0.5" style={{ color: 'var(--sa-muted)' }}>
                                                    <span className="font-semibold text-indigo-300">{session.targetRole}</span> • {session.targetOrg}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs" style={{ color: '#e2e8f0' }}>{session.startTime}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className="text-[11px] font-bold" style={{ color: session.durationMins > 30 ? '#f59e0b' : '#10b981' }}>
                                                        {session.durationMins} mins
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                                    style={{ color: session.status === 'Active' ? '#10b981' : 'var(--sa-muted)' }}>
                                                    {session.status === 'Active' ? <Clock size={10} className="animate-pulse" /> : <UserX size={10} />}
                                                    {session.status}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* EXPANDED ROW: Action Log */}
                                        {isExpanded && (
                                            <tr style={{ background: '#080e20' }}>
                                                <td colSpan={5} className="p-0 border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                    <div className="p-4 ml-10 border-l-2" style={{ borderColor: session.risk === 'Critical' ? '#ef4444' : 'var(--sa-accent-dim)' }}>
                                                        <h4 className="text-[10px] uppercase tracking-widest font-black mb-3" style={{ color: 'var(--sa-muted)' }}>HTTP Action Audit Trail</h4>
                                                        <div className="space-y-2 font-mono text-xs">
                                                            {session.actions.map((act, i) => (
                                                                <div key={i} className="flex items-start gap-4">
                                                                    <span style={{ color: '#6b7280' }}>[{act.time}]</span>
                                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${act.actionType === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                                        {act.actionType}
                                                                    </span>
                                                                    <span style={{ color: act.sensitive ? '#f87171' : '#e2e8f0' }}>
                                                                        {act.path}
                                                                        {act.sensitive && <AlertCircle size={10} className="inline ml-2 text-red-500" />}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Impersonation specific entry modal */}
            {isMenuOpen && <NewImpersonationModal onClose={() => setIsMenuOpen(false)} />}

        </div>
    );
}

