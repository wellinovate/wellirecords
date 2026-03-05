import React, { useState } from 'react';
import { ArrowRight, Search, Shield } from 'lucide-react';

const MOCK_CHANGES = [
    { id: 'pc001', changed: 'Dr. Fatima Aliyu', changedBy: 'facility_admin_001', facility: 'Lagos General', fromRole: 'clinician', toRole: 'clinician', note: 'Added lab_access feature flag', at: '2026-03-03T09:00:00Z', approver: 'super_admin' },
    { id: 'pc002', changed: 'lab_tech_004', changedBy: 'super_admin', facility: 'CityLab', fromRole: 'lab_staff', toRole: 'auditor', note: 'Temporary elevated access for audit', at: '2026-03-02T14:00:00Z', approver: 'super_admin' },
    { id: 'pc003', changed: 'Front Desk Staff 01', changedBy: 'facility_admin_003', facility: 'Reddington', fromRole: 'front_desk', toRole: 'nurse', note: 'Role reassignment after training completion', at: '2026-03-01T10:30:00Z', approver: 'verification_officer' },
    { id: 'pc004', changed: 'Ibrahim (Finance)', changedBy: 'super_admin', facility: 'WelliRecord HQ', fromRole: 'support_agent', toRole: 'finance_admin', note: 'Promotion', at: '2026-02-28T08:00:00Z', approver: 'super_admin' },
    { id: 'pc005', changed: 'Dr. Emeka Okonkwo', changedBy: 'facility_admin_002', facility: 'Reddington', fromRole: 'clinician', toRole: 'clinician', note: 'Suspended telemedicine access pending review', at: '2026-02-27T16:00:00Z', approver: 'security_admin' },
];

export function PermissionHistoryPage() {
    const [search, setSearch] = useState('');
    const filtered = MOCK_CHANGES.filter(c => !search || c.changed.toLowerCase().includes(search.toLowerCase()) || c.changedBy.toLowerCase().includes(search.toLowerCase()) || c.facility.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Permission Change History</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Every RBAC role modification, with approver and justification.</p>
            </div>

            <div className="relative max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user or facility…"
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', color: '#e5e7eb' }} />
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {['Timestamp', 'User Changed', 'Role Change', 'Facility', 'Changed By', 'Approver', 'Justification'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-white/3 transition-colors">
                                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: '#6b7280' }}>
                                        {new Date(c.at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#e5e7eb' }}>{c.changed}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{c.fromRole}</span>
                                            <ArrowRight size={10} style={{ color: '#4b5563' }} />
                                            <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>{c.toRole}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#9ca3af' }}>{c.facility}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>{c.changedBy}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#10b981' }}>
                                            <Shield size={10} /> {c.approver}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs max-w-xs" style={{ color: '#6b7280' }}>{c.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
