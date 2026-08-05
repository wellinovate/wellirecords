import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, UserCheck, X } from 'lucide-react';
import {
    getAppointmentsApi,
    checkInAppointmentApi,
    markAppointmentNoShowApi,
    cancelAppointmentApi,
} from '@/modules/appointments/api';
import type { AppointmentItem } from '@/modules/appointments/types';

type Status = AppointmentItem['status'];

const STATUS_CFG: Record<Status, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    booked: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: Clock, label: 'Booked' },
    'checked-in': { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', icon: UserCheck, label: 'Checked In' },
    completed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Completed' },
    'no-show': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: X, label: 'No Show' },
    cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: X, label: 'Cancelled' },
};

function personName(v: AppointmentItem['patientId'] | AppointmentItem['providerId']) {
    if (!v) return 'Unknown';
    return typeof v === 'object' && v ? v.fullName : 'Unknown';
}

function timeOf(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

export function AppointmentQueuePage() {
    const [queue, setQueue] = useState<AppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actioning, setActioning] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        setError(null);
        const today = new Date();
        const dateFrom = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const dateTo = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        getAppointmentsApi({ dateFrom, dateTo, limit: 100 })
            .then((res: any) => setQueue(res?.items ?? []))
            .catch((err: any) => setError(err?.message || 'Failed to load today’s appointments'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const advance = async (item: AppointmentItem) => {
        setActioning(item._id);
        try {
            if (item.status === 'booked') {
                await checkInAppointmentApi(item._id);
            } else if (item.status === 'checked-in') {
                await cancelAppointmentApi(item._id);
            }
            load();
        } catch (err: any) {
            setError(err?.message || 'Failed to update appointment');
        } finally {
            setActioning(null);
        }
    };

    const handleNoShow = async (item: AppointmentItem) => {
        setActioning(item._id);
        try {
            await markAppointmentNoShowApi(item._id);
            load();
        } catch (err: any) {
            setError(err?.message || 'Failed to mark no-show');
        } finally {
            setActioning(null);
        }
    };

    const stats = {
        total: queue.length,
        completed: queue.filter(q => q.status === 'completed').length,
        checkedIn: queue.filter(q => q.status === 'checked-in').length,
        booked: queue.filter(q => q.status === 'booked').length,
        noShow: queue.filter(q => q.status === 'no-show').length,
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2e8f0' }}>Today's Patient Queue</h1>
                    <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                        {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })} — {stats.total} appointments
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Completed', value: stats.completed, color: '#10b981' },
                    { label: 'Checked In', value: stats.checkedIn, color: '#38bdf8' },
                    { label: 'Booked', value: stats.booked, color: '#6b7280' },
                    { label: 'No-Show', value: stats.noShow, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[11px] font-bold" style={{ color: '#64748b' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <p className="text-sm" style={{ color: '#94a3b8' }}>Loading today's appointments…</p>
            ) : error ? (
                <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            ) : queue.length === 0 ? (
                <p className="text-sm" style={{ color: '#94a3b8' }}>No appointments scheduled for today.</p>
            ) : (
                <div className="space-y-2">
                    {queue.map(item => {
                        const st = STATUS_CFG[item.status] ?? STATUS_CFG.booked;
                        const StIcon = st.icon;
                        const canAdvance = item.status === 'booked' || item.status === 'checked-in';
                        const canNoShow = item.status === 'booked' || item.status === 'checked-in';
                        const isBusy = actioning === item._id;
                        return (
                            <div key={item._id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all flex-wrap"
                                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.status === 'checked-in' ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                                <div className="text-sm font-black w-12 flex-shrink-0" style={{ color: '#94a3b8' }}>{timeOf(item.scheduledFor)}</div>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                    style={{ background: st.bg, color: st.color }}>{personName(item.patientId).charAt(0)}</div>
                                <div className="flex-1 min-w-0" style={{ minWidth: '120px' }}>
                                    <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{personName(item.patientId)}</div>
                                    <div className="text-xs" style={{ color: '#4b5563' }}>{personName(item.providerId)} · {item.reasonForVisit || 'No reason on file'}</div>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: st.bg, color: st.color }}>
                                    <StIcon size={10} /> {st.label}
                                </span>
                                {canAdvance && (
                                    <button onClick={() => advance(item)} disabled={isBusy}
                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                                        style={{ background: 'rgba(13,148,136,0.15)', color: '#0d9488' }}>
                                        {item.status === 'booked' ? 'Check In' : 'Complete'}
                                    </button>
                                )}
                                {canNoShow && (
                                    <button onClick={() => handleNoShow(item)} disabled={isBusy}
                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                        No Show
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
