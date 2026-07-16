import React, { useState } from 'react';
import { AlertTriangle, Lock, Eye, Clock, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { adminApi } from '@/shared/api/adminApi';
import { useAuth } from '@/shared/auth/AuthProvider';

const SEV: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: AlertTriangle },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: Eye },
    low: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)', icon: Wifi },
};

const STATUS_B: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    open: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle, label: 'Open' },
    investigating: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock, label: 'Investigating' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Resolved' },
    escalated: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: CheckCircle, label: 'Escalated' },
};

export function SecurityAlertsPage() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState(() => adminApi.getSecurityAlerts());

    const openCount = alerts.filter((a: any) => a.status === 'open').length;
    const invCount = alerts.filter((a: any) => a.status === 'investigating').length;

    const handleInvestigate = (id: string) => {
        adminApi.updateAlertStatus(id, 'investigating');
        setAlerts(adminApi.getSecurityAlerts());
    };

    const handleResolve = (id: string) => {
        adminApi.updateAlertStatus(id, 'resolved');
        setAlerts(adminApi.getSecurityAlerts());
    };

    const handleEscalate = (id: string) => {
        const adminName = user?.fullName ?? user?.name ?? 'Super Admin';
        adminApi.escalateAlert(id, adminName);
        setAlerts(adminApi.getSecurityAlerts());
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Security Alerts</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Suspicious activity, account lockouts, and anomaly detections.</p>
            </div>

            {/* Status chips */}
            <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    <AlertTriangle size={13} /> {openCount} Open
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                    <Clock size={13} /> {invCount} Investigating
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                    <CheckCircle size={13} /> {alerts.filter((a: any) => a.status === 'resolved').length} Resolved
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: '#111827', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
                    <CheckCircle size={13} /> {alerts.filter((a: any) => a.status === 'escalated').length} Escalated
                </div>
            </div>

            {/* Alert cards */}
            <div className="space-y-3">
                {alerts.map((a: any) => {
                    const sev = SEV[a.severity] || SEV.low;
                    const SevIcon = sev.icon;
                    const st = STATUS_B[a.status] || STATUS_B.open;
                    const StIcon = st.icon;
                    return (
                        <div key={a.id} className="rounded-2xl p-5"
                            style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                                <div className="flex items-center gap-2.5">
                                    <SevIcon size={16} style={{ color: sev.color, flexShrink: 0 }} />
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: '#e5e7eb' }}>{a.type}</div>
                                        <div className="text-xs" style={{ color: '#6b7280' }}>
                                            {new Date(a.occurredAt).toLocaleString('en-NG')} · IP: {a.ipAddress}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                                        style={{ background: `${sev.color}22`, color: sev.color }}>{a.severity}</span>
                                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: st.bg, color: st.color }}>
                                        <StIcon size={10} /> {st.label}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{a.detail}</p>
                            {a.status !== 'resolved' && a.status !== 'escalated' && (
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleResolve(a.id)} className="text-xs font-bold px-3 py-1 rounded-lg hover:opacity-90 active:scale-95 transition-all" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Mark Resolved</button>
                                    <button onClick={() => handleEscalate(a.id)} className="text-xs font-bold px-3 py-1 rounded-lg hover:opacity-90 active:scale-95 transition-all" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Escalate to incident</button>
                                    {a.status === 'open' && (
                                        <button onClick={() => handleInvestigate(a.id)} className="text-xs font-bold px-3 py-1 rounded-lg hover:opacity-90 active:scale-95 transition-all" style={{ background: 'rgba(107,114,128,0.1)', color: '#9ca3af' }}>Start Investigation</button>
                                    )}
                                </div>
                            )}
                            {a.status === 'escalated' && (
                                <div className="text-xs mt-3 text-[#a78bfa] font-bold flex items-center gap-1.5">
                                    <CheckCircle size={12} /> This alert has been escalated to the Incident Log and is tracked there.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
