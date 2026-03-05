import React from 'react';
import { AlertTriangle, Lock, Eye, Clock, CheckCircle, XCircle, Wifi } from 'lucide-react';

const ALERTS = [
    { id: 'sa_001', severity: 'high', type: 'Brute Force Attempt', detail: '14 failed login attempts for prov_user_009 from IP 185.220.101.44 (Tor exit node) — account temporarily locked.', occurredAt: '2026-03-03T13:47:00Z', status: 'open', ipAddress: '185.220.101.44' },
    { id: 'sa_002', severity: 'medium', type: 'Unusual Data Export', detail: 'User lab_tech_004 (CityLab) exported 234 records in 3 minutes — 8× above normal pattern. Possible bulk data pull.', occurredAt: '2026-03-03T10:15:00Z', status: 'investigating', ipAddress: '41.203.64.5' },
    { id: 'sa_003', severity: 'low', type: 'Login from New Country', detail: 'pat_001 (Amara Okafor) logged in from United Kingdom (IP: 5.62.12.100). First time from this location.', occurredAt: '2026-03-02T22:30:00Z', status: 'resolved', ipAddress: '5.62.12.100' },
    { id: 'sa_004', severity: 'medium', type: 'Account Lockout', detail: 'prov_admin_003 (Reddington) account locked after 5 failed 2FA attempts. Admin notified.', occurredAt: '2026-03-02T18:05:00Z', status: 'resolved', ipAddress: '196.12.45.90' },
];

const SEV: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: AlertTriangle },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: Eye },
    low: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)', icon: Wifi },
};

const STATUS_B: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    open: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle, label: 'Open' },
    investigating: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock, label: 'Investigating' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Resolved' },
};

export function SecurityAlertsPage() {
    const openCount = ALERTS.filter(a => a.status === 'open').length;
    const invCount = ALERTS.filter(a => a.status === 'investigating').length;

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
                    <CheckCircle size={13} /> {ALERTS.filter(a => a.status === 'resolved').length} Resolved
                </div>
            </div>

            {/* Alert cards */}
            <div className="space-y-3">
                {ALERTS.map(a => {
                    const sev = SEV[a.severity];
                    const SevIcon = sev.icon;
                    const st = STATUS_B[a.status];
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
                            {a.status !== 'resolved' && (
                                <div className="flex gap-2 mt-3">
                                    <button className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Mark Resolved</button>
                                    <button className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Escalate</button>
                                    {a.status === 'open' && (
                                        <button className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(107,114,128,0.1)', color: '#9ca3af' }}>Start Investigation</button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
