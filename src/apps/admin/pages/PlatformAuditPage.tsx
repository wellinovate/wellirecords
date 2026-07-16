import React from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { Activity, Eye, User, Shield, Clock, AlertTriangle } from 'lucide-react';

export function PlatformAuditPage() {
    const impersonations = adminApi.getImpersonationLogs();
    const auditEvents = adminApi.getAuditEvents();

    const ACTION_COLORS: Record<string, string> = {
        view_ehr_full: '#38bdf8', impersonate_user: '#ef4444',
        upload_imaging: '#a78bfa', new_encounter: '#10b981',
        manage_appointments: '#f59e0b',
        escalate_alert: '#f59e0b', create_incident: '#ef4444',
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Platform Audit Log</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Cross-facility access events and admin actions. Immutable record.</p>
            </div>

            {/* Impersonation sessions */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
                    <Eye size={15} style={{ color: '#ef4444' }} />
                    <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>Impersonation Sessions</h2>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        {impersonations.length} sessions
                    </span>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {impersonations.map(log => (
                        <div key={log.id} className="px-5 py-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                                <div>
                                    <div className="font-semibold text-sm" style={{ color: '#e5e7eb' }}>
                                        <span style={{ color: '#ef4444' }}>{log.adminName}</span>{' '}
                                        impersonated <span style={{ color: '#f59e0b' }}>{log.targetUserName}</span>
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                        {new Date(log.startedAt).toLocaleString('en-NG')} – {log.endedAt ? new Date(log.endedAt).toLocaleTimeString('en-NG') : 'Active'} · IP: {log.ipAddress}
                                    </div>
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                    {log.targetUserRole}
                                </span>
                            </div>
                            <div className="text-xs mb-2" style={{ color: '#9ca3af' }}>
                                <span className="font-semibold" style={{ color: '#6b7280' }}>Reason:</span> {log.reason}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {log.actionsPerformed.map((a, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>{a}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* All events */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Activity size={15} style={{ color: '#38bdf8' }} />
                    <h2 className="font-bold text-sm" style={{ color: '#e5e7eb' }}>All Platform Events (Recent)</h2>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {auditEvents.map(e => (
                        <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 animate-fade-in">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${ACTION_COLORS[e.action] ?? '#6b7280'}18` }}>
                                <Activity size={14} style={{ color: ACTION_COLORS[e.action] ?? '#6b7280' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm" style={{ color: '#e5e7eb' }}>
                                    <span className="font-semibold">{e.actor}</span>
                                    {' · '}<span className="font-mono text-xs px-1.5 py-0.5 rounded"
                                        style={{ background: `${ACTION_COLORS[e.action] ?? '#6b7280'}18`, color: ACTION_COLORS[e.action] ?? '#6b7280' }}>
                                        {e.action}
                                    </span>
                                    {' · '}{e.target}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                                    {e.org} · {new Date(e.at).toLocaleString('en-NG')} · {e.ipAddress}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
