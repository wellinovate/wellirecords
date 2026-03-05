import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teleMedApi } from '@/shared/api/teleMedApi';
import {
    Video, Calendar, Clock, Heart, Activity, Droplets,
    AlertTriangle, CheckCircle, Users, Brain, ChevronRight,
    Stethoscope, Zap, FileText, Plus, Bell
} from 'lucide-react';

const SPECIALTY_COLORS: Record<string, string> = {
    'Cardiology': '#ef4444',
    'General Practice': '#1a6b42',
    'OB/GYN': '#8b5cf6',
    'Pediatrics': '#f59e0b',
    'Psychiatry': '#0ea5e9',
};

export function ProviderTelemedicinePage() {
    const navigate = useNavigate();
    const sessions = teleMedApi.getSessionsByProvider('prov_001');
    const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'waiting' || s.status === 'active');
    const past = sessions.filter(s => s.status === 'completed');
    const readings = teleMedApi.getMonitoringReadings('pat_001');
    const warnings = readings.filter(r => r.flag !== 'normal');

    const [alertDismissed, setAlertDismissed] = useState(false);

    return (
        <div className="animate-fade-in space-y-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--prov-border)' }}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="font-display font-bold text-2xl" style={{ color: '#e2eaf4' }}>Telemedicine</h1>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: '#a855f720', color: '#a855f7' }}>AI Co-Pilot</span>
                    </div>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Today's consultation queue and remote monitoring alerts</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm"
                    style={{ background: '#38bdf8' }}>
                    <Plus size={16} /> Schedule Session
                </button>
            </div>

            {/* Remote monitoring alert banner */}
            {!alertDismissed && warnings.length > 0 && (
                <div className="rounded-2xl p-4 flex items-start gap-4" style={{ background: 'rgba(245,158,11,.06)', border: '1.5px solid rgba(245,158,11,.25)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,.15)' }}>
                        <Bell size={20} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-sm mb-1" style={{ color: '#f59e0b' }}>Remote Monitoring Alert</div>
                        <div className="text-xs" style={{ color: '#fcd34d' }}>
                            {warnings.length} patient reading{warnings.length > 1 ? 's' : ''} outside normal range — {warnings.map(w => w.type.replace('_', ' ')).join(', ')}.
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>Amara Okafor — </span>
                            <span className="text-xs" style={{ color: '#fcd34d' }}>BP 152/96 · Glucose 108 mg/dL</span>
                        </div>
                    </div>
                    <button onClick={() => setAlertDismissed(true)} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,.12)', color: '#f59e0b' }}>Acknowledge</button>
                </div>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Today's Queue", value: upcoming.length, icon: Calendar, color: '#38bdf8' },
                    { label: 'Completed', value: past.length, icon: CheckCircle, color: '#10b981' },
                    { label: 'Prescriptions', value: 2, icon: FileText, color: '#a855f7' },
                    { label: 'Monitoring Alerts', value: warnings.length, icon: AlertTriangle, color: warnings.length > 0 ? '#f59e0b' : '#10b981' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}15` }}>
                            <stat.icon size={20} style={{ color: stat.color }} />
                        </div>
                        <div>
                            <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-xs" style={{ color: '#7ba3c8' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7ba3c8' }}>Upcoming Sessions</h2>
                    {upcoming.length === 0 && (
                        <div className="card-provider p-8 text-center">
                            <CheckCircle size={32} className="mx-auto mb-3" style={{ color: '#1e3a5f' }} />
                            <p className="text-sm" style={{ color: '#7ba3c8' }}>All sessions complete for today</p>
                        </div>
                    )}
                    {upcoming.map(s => {
                        const color = SPECIALTY_COLORS[s.providerSpecialty] ?? '#38bdf8';
                        const isActive = s.status === 'active';
                        const intake = s.intakeId ? teleMedApi.getIntake(s.intakeId) : null;
                        return (
                            <div key={s.id} className="card-provider overflow-hidden" style={{ borderColor: isActive ? '#38bdf8' : 'var(--prov-border)', borderWidth: isActive ? 2 : 1 }}>
                                <div className="h-1 w-full" style={{ background: isActive ? '#38bdf8' : color }} />
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl" style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8' }}>
                                                {s.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold" style={{ color: '#e2eaf4' }}>{s.patientName}</div>
                                                <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: '#7ba3c8' }}>
                                                    <span style={{ color }}>{s.providerSpecialty}</span> ·
                                                    <Calendar size={11} /> {new Date(s.scheduledAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                    <Clock size={11} /> {new Date(s.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {isActive && (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full animate-pulse" style={{ background: '#ef444420', color: '#ef4444' }}>
                                                    ● Live
                                                </span>
                                            )}
                                            <button
                                                onClick={() => navigate(`/provider/telemedicine/session/${s.id}`)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-[#050d1a]"
                                                style={{ background: '#38bdf8' }}>
                                                <Video size={13} /> {isActive ? 'Rejoin' : 'Start Session'}
                                            </button>
                                        </div>
                                    </div>
                                    {intake && (
                                        <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)' }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain size={13} style={{ color: '#a855f7' }} />
                                                <span className="text-xs font-bold" style={{ color: '#a855f7' }}>AI Pre-Consult Summary</span>
                                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: intake.urgencyScore === 'Emergency' ? '#ef444420' : intake.urgencyScore === 'Priority' ? '#f59e0b20' : '#10b98120', color: intake.urgencyScore === 'Emergency' ? '#ef4444' : intake.urgencyScore === 'Priority' ? '#f59e0b' : '#10b981' }}>
                                                    {intake.urgencyScore}
                                                </span>
                                            </div>
                                            <p className="text-xs leading-relaxed" style={{ color: '#c8dff0' }}>{intake.aiSummary.substring(0, 200)}…</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {past.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-3 mt-6" style={{ color: '#7ba3c8' }}>Completed Today</h2>
                            {past.map(s => (
                                <div key={s.id} className="card-provider p-4 flex items-center gap-3 mb-2 opacity-70">
                                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>{s.patientName}</div>
                                        <div className="text-xs" style={{ color: '#7ba3c8' }}>{s.providerSpecialty} · {s.durationMinutes} min</div>
                                    </div>
                                    {s.soapNote && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#a855f715', color: '#a855f7' }}>SOAP Filed</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Remote Monitoring Sidebar */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7ba3c8' }}>Remote Monitoring</h2>
                    {[
                        { label: 'Blood Pressure', icon: Heart, value: '152/96', unit: 'mmHg', flag: 'warning', color: '#f59e0b' },
                        { label: 'Blood Glucose', icon: Droplets, value: '108', unit: 'mg/dL', flag: 'warning', color: '#f59e0b' },
                        { label: 'O₂ Saturation', icon: Activity, value: '98', unit: '%', flag: 'normal', color: '#10b981' },
                        { label: 'Heart Rate', icon: Zap, value: '82', unit: 'bpm', flag: 'normal', color: '#10b981' },
                    ].map(r => (
                        <div key={r.label} className="card-provider p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${r.color}15` }}>
                                <r.icon size={16} style={{ color: r.color }} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs" style={{ color: '#7ba3c8' }}>{r.label}</div>
                                <div className="font-black text-lg" style={{ color: r.color }}>{r.value} <span className="text-xs font-semibold">{r.unit}</span></div>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                        </div>
                    ))}

                    {/* AI Co-Pilot promo card */}
                    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#1a1040,#2d1060)', border: '1px solid rgba(168,85,247,.3)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Brain size={18} style={{ color: '#c084fc' }} />
                            <span className="font-bold text-sm" style={{ color: '#e9d5ff' }}>WelliMate™ Co-Pilot</span>
                        </div>
                        <p className="text-xs leading-relaxed mb-4" style={{ color: '#a78bfa' }}>
                            AI ambient scribe, ICD-10 suggestions, and drug-interaction warnings — active during every session.
                        </p>
                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#c084fc' }}>
                            Active in next session <ChevronRight size={12} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
