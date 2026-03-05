import React from 'react';
import { Monitor, MapPin, Clock, LogOut, Shield, Lock } from 'lucide-react';

const MOCK_SESSIONS = [
    { id: 's001', user: 'Dr. Fatima Aliyu', role: 'clinician', device: 'Chrome · macOS', ip: '41.203.10.5', location: 'Lagos, NG', lastActive: '2026-03-03T17:40:00Z', mfa: true, current: false },
    { id: 's002', user: 'Amara Okafor', role: 'patient', device: 'iOS App', ip: '102.89.3.4', location: 'Lagos, NG', lastActive: '2026-03-03T17:55:00Z', mfa: true, current: false },
    { id: 's003', user: 'prov_user_009', role: 'clinician', device: 'Firefox · Win', ip: '185.220.101.44', location: 'Unknown (Tor)', lastActive: '2026-03-03T13:47:00Z', mfa: false, current: false },
    { id: 's004', user: 'lab_tech_004', role: 'lab_staff', device: 'Chrome · Win', ip: '41.203.64.5', location: 'Ikeja, NG', lastActive: '2026-03-03T10:15:00Z', mfa: true, current: false },
    { id: 's005', user: 'super_admin', role: 'super_admin', device: 'Chrome · macOS', ip: '129.0.0.1', location: 'WelliHQ, NG', lastActive: '2026-03-03T17:57:00Z', mfa: true, current: true },
];

const MFA_ENFORCEMENT: Record<string, boolean> = { super_admin: true, verification_officer: true, security_admin: true, clinician: false, patient: false, lab_staff: false };

export function SessionControlsPage() {
    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Session Controls</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Active sessions across the platform · Force logout · MFA enforcement · Timeout rules</p>
            </div>

            {/* Policy row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: 'Idle Timeout', value: '30 min', icon: Clock, color: '#38bdf8' },
                    { label: 'Max Session Duration', value: '8 hours', icon: Clock, color: '#f59e0b' },
                    { label: 'MFA Required (admin)', value: 'Enforced', icon: Shield, color: '#10b981' },
                ].map(p => {
                    const Icon = p.icon;
                    return (
                        <div key={p.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#111827', border: `1px solid ${p.color}20` }}>
                            <Icon size={16} style={{ color: p.color }} />
                            <div>
                                <div className="text-xs" style={{ color: '#6b7280' }}>{p.label}</div>
                                <div className="font-black text-sm" style={{ color: p.color }}>{p.value}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Active sessions */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-xs font-bold" style={{ color: '#6b7280' }}>Active Sessions ({MOCK_SESSIONS.length})</div>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {MOCK_SESSIONS.map(s => (
                        <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{ background: s.current ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', color: s.current ? '#f59e0b' : '#6b7280' }}>
                                {s.user.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm" style={{ color: '#e5e7eb' }}>{s.user}</span>
                                    {s.current && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>YOU</span>}
                                </div>
                                <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: '#4b5563' }}>
                                    <span><Monitor size={9} className="inline mr-0.5" />{s.device}</span>
                                    <span><MapPin size={9} className="inline mr-0.5" />{s.location}</span>
                                    <span className="font-mono">{s.ip}</span>
                                    <span><Clock size={9} className="inline mr-0.5" />{new Date(s.lastActive).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: s.mfa ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.mfa ? '#10b981' : '#ef4444' }}>
                                    <Lock size={9} /> {s.mfa ? 'MFA' : 'No MFA'}
                                </span>
                                {!s.current && (
                                    <button className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                        <LogOut size={10} /> Force Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MFA policy table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-3.5 border-b text-xs font-bold" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>MFA Enforcement Policy per Role</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {Object.entries(MFA_ENFORCEMENT).map(([role, required]) => (
                        <div key={role} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-xs capitalize" style={{ color: '#9ca3af' }}>{role.replace('_', ' ')}</span>
                            <span className="text-[11px] font-bold flex items-center gap-1"
                                style={{ color: required ? '#10b981' : '#6b7280' }}>
                                <Lock size={9} /> {required ? 'Required' : 'Optional'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
