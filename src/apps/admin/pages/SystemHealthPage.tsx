import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Activity, Database, Wifi, Bell, Clock } from 'lucide-react';

const SERVICES = [
    { name: 'API Gateway', status: 'ok', uptime: '99.97%', latencyP50: '42ms', latencyP95: '120ms', latencyP99: '340ms' },
    { name: 'WelliChain Sync', status: 'ok', uptime: '99.81%', latencyP50: '85ms', latencyP95: '380ms', latencyP99: '850ms' },
    { name: 'Database (Primary)', status: 'ok', uptime: '100%', latencyP50: '8ms', latencyP95: '28ms', latencyP99: '60ms' },
    { name: 'Database (Replica)', status: 'ok', uptime: '99.99%', latencyP50: '9ms', latencyP95: '32ms', latencyP99: '70ms' },
    { name: 'Notification Queue', status: 'warn', uptime: '99.60%', latencyP50: '200ms', latencyP95: '620ms', latencyP99: '1400ms' },
    { name: 'Lab Sync Pipeline', status: 'error', uptime: '98.20%', latencyP50: '—', latencyP95: '—', latencyP99: '—' },
    { name: 'Telemedicine (WebRTC)', status: 'ok', uptime: '99.90%', latencyP50: '55ms', latencyP95: '190ms', latencyP99: '410ms' },
];

const QUEUES = [
    { name: 'Verification Queue', depth: 11, warning: 20, critical: 50 },
    { name: 'Notification Queue', depth: 342, warning: 200, critical: 1000 },
    { name: 'Sync Backlog', depth: 840, warning: 300, critical: 500 },
    { name: 'Export Queue', depth: 2, warning: 50, critical: 200 },
];

const ERROR_RATE_HOURS = [0.1, 0.1, 0.15, 0.1, 0.2, 0.15, 0.3, 0.6, 1.2, 0.9, 0.8, 1.1, 1.3, 0.9, 0.7, 0.8, 1.0, 0.9, 0.7, 0.5, 0.3, 0.2, 0.1, 0.1];

function StatusPill({ status }: { status: string }) {
    const s = status === 'ok' ? { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Operational' }
        : status === 'warn' ? { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle, label: 'Degraded' }
            : { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle, label: 'Down' };
    const Icon = s.icon;
    return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: s.bg, color: s.color }}><Icon size={10} /> {s.label}</span>
    );
}

export function SystemHealthPage() {
    const maxErr = Math.max(...ERROR_RATE_HOURS);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>System Health</h1>
                    <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Real-time service status · Queue depths · Error rates · Last deploy</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Clock size={12} /> Last deploy: 2026-03-03 06:00 UTC
                </div>
            </div>

            {/* Service status */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-3 border-b text-xs font-bold" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>Service Status</div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {SERVICES.map(s => (
                        <div key={s.name} className="px-5 py-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                            <div>
                                <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{s.name}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>Uptime: {s.uptime}</div>
                            </div>
                            <StatusPill status={s.status} />
                            {[s.latencyP50, s.latencyP95, s.latencyP99].map((lat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-[10px]" style={{ color: '#4b5563' }}>p{[50, 95, 99][i]}</div>
                                    <div className="text-sm font-black" style={{ color: s.status === 'error' ? '#ef4444' : '#e5e7eb' }}>{lat}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Queue depths */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 space-y-3" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-bold" style={{ color: '#6b7280' }}>Queue Depths</div>
                    {QUEUES.map(q => {
                        const pct = Math.min(q.depth / q.critical * 100, 100);
                        const color = q.depth >= q.critical ? '#ef4444' : q.depth >= q.warning ? '#f59e0b' : '#10b981';
                        return (
                            <div key={q.name}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span style={{ color: '#9ca3af' }}>{q.name}</span>
                                    <span className="font-black" style={{ color }}>{q.depth.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Error rate mini-chart */}
                <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-bold mb-3" style={{ color: '#6b7280' }}>Error Rate % — Last 24h</div>
                    <div className="flex items-end gap-0.5 h-24">
                        {ERROR_RATE_HOURS.map((v, i) => (
                            <div key={i} className="flex-1 rounded-t transition-all" title={`${v}%`}
                                style={{ height: `${(v / maxErr) * 100}%`, background: v > 1 ? '#ef4444' : v > 0.5 ? '#f59e0b' : '#10b981', opacity: 0.8 }} />
                        ))}
                    </div>
                    <div className="flex justify-between text-[9px] mt-1" style={{ color: '#4b5563' }}>
                        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
