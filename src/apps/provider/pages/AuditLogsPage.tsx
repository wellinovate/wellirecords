import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { consentApi } from '@/shared/api/consentApi';
import { ScrollText, Search, Download, Eye, RefreshCw } from 'lucide-react';

export function AuditLogsPage() {
    const { user } = useAuth();
    // For provider: show all audit entries across consented patients
    const grants = consentApi.getProviderGrants(user?.orgId ?? '');
    const allLogs = grants.flatMap(g => g.accessLog).sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());
    const [search, setSearch] = useState('');
    const filtered = allLogs.filter(l => !search || l.accessedByName.toLowerCase().includes(search.toLowerCase()) || l.recordTitle?.toLowerCase().includes(search.toLowerCase()));

    const actionIcon = (a: string) => ({ view: <Eye size={14} />, update: <RefreshCw size={14} />, download: <Download size={14} />, print: <Download size={14} /> }[a] ?? <Eye size={14} />);
    const actionColor = (a: string) => ({ view: '#38bdf8', update: '#f59e0b', download: '#a855f7', print: '#6366f1' }[a] ?? '#38bdf8');

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Audit Logs</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Complete immutable access log for your organisation</p>
                </div>
                <button className="btn btn-provider-outline gap-2"><Download size={16} /> Export CSV</button>
            </div>

            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7ba3c8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input input-dark w-full max-w-md" style={{ paddingLeft: '2.5rem' }} placeholder="Search by provider or record…" />
            </div>

            <div className="card-provider overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <ScrollText size={32} className="mx-auto mb-3" style={{ color: '#1e3a5f' }} />
                        <p className="text-sm" style={{ color: '#7ba3c8' }}>No audit events to display</p>
                    </div>
                ) : (
                    <table className="welli-table">
                        <thead><tr><th>Action</th><th>Provider</th><th>Record</th><th>Organisation</th><th>Timestamp</th></tr></thead>
                        <tbody>
                            {filtered.map(entry => (
                                <tr key={entry.id}>
                                    <td>
                                        <span className="flex items-center gap-1.5 font-semibold text-xs capitalize"
                                            style={{ color: actionColor(entry.action) }}>
                                            {actionIcon(entry.action)} {entry.action}
                                        </span>
                                    </td>
                                    <td className="text-sm" style={{ color: '#e2eaf4' }}>{entry.accessedByName}</td>
                                    <td className="text-sm" style={{ color: '#7ba3c8' }}>{entry.recordTitle ?? 'EHR Record'}</td>
                                    <td className="text-sm" style={{ color: '#7ba3c8' }}>{entry.orgName}</td>
                                    <td className="text-xs" style={{ color: '#3e5a78' }}>{new Date(entry.accessedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
