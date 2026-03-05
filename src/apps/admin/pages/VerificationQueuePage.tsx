import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/shared/api/adminApi';
import { VerificationRequest } from '@/shared/types/types';
import {
    ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle,
    MessageSquare, Building2, User, FlaskConical, ArrowRight, Search,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
        pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Pending', icon: Clock },
        approved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Approved', icon: CheckCircle },
        rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Rejected', icon: XCircle },
        flagged: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', label: 'Flagged', icon: AlertTriangle },
        more_info_requested: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)', label: 'More Info Req.', icon: MessageSquare },
    };
    const s = map[status] ?? map.pending;
    const Icon = s.icon;
    return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            <Icon size={11} /> {s.label}
        </span>
    );
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    facility: Building2, clinician: User, patient: User,
};

const TABS = [
    { key: undefined as undefined | string, label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'more_info_requested', label: 'More Info' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
];

export function VerificationQueuePage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState('');

    const all = adminApi.getVerifications();
    const list = all.filter(v =>
        (tab ? v.status === tab : true) &&
        (search ? v.submittedByName.toLowerCase().includes(search.toLowerCase()) : true)
    );

    const countByStatus = (s: string) => all.filter(v => v.status === s).length;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Verification Queue</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Review and approve facility, clinician, and patient onboarding requests.</p>
            </div>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-3">
                {[
                    { label: 'Pending', count: countByStatus('pending'), color: '#f59e0b' },
                    { label: 'More Info', count: countByStatus('more_info_requested'), color: '#38bdf8' },
                    { label: 'Approved', count: countByStatus('approved'), color: '#10b981' },
                    { label: 'Rejected', count: countByStatus('rejected'), color: '#ef4444' },
                ].map(c => (
                    <div key={c.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
                        style={{ background: '#111827', border: `1px solid ${c.color}22`, color: c.color }}>
                        {c.count} {c.label}
                    </div>
                ))}
            </div>

            {/* Tabs + search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111827' }}>
                    {TABS.map(t => (
                        <button key={String(t.key)} onClick={() => setTab(t.key)}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                            style={{
                                background: tab === t.key ? 'rgba(245,158,11,0.15)' : 'transparent',
                                color: tab === t.key ? '#f59e0b' : '#6b7280',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name…"
                        className="w-full pl-8 pr-4 py-2 rounded-xl text-sm"
                        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
                </div>
            </div>

            {/* List */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.1)' }}>
                {list.length === 0 ? (
                    <div className="py-16 text-center" style={{ color: '#4b5563' }}>
                        <ShieldCheck size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">No verifications match this filter</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        {list.map((v: VerificationRequest) => {
                            const Icon = TYPE_ICONS[v.type] ?? User;
                            return (
                                <div key={v.id}
                                    onClick={() => navigate(`/admin/verifications/${v.id}`)}
                                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/4 transition-colors">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(245,158,11,0.1)' }}>
                                        <Icon size={18} style={{ color: '#f59e0b' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm" style={{ color: '#e5e7eb' }}>{v.submittedByName}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize"
                                                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                                                {v.type}
                                            </span>
                                        </div>
                                        <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                            {v.documents.length} document{v.documents.length !== 1 ? 's' : ''} ·{' '}
                                            Submitted {new Date(v.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {v.specialty && ` · ${v.specialty}`}
                                            {v.facilityType && ` · ${v.facilityType}`}
                                        </div>
                                    </div>
                                    <StatusBadge status={v.status} />
                                    <ArrowRight size={15} style={{ color: '#374151', flexShrink: 0 }} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
