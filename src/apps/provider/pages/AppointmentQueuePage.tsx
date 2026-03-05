import React, { useState } from 'react';
import { CheckCircle, Clock, UserCheck, X, UserPlus, AlertTriangle } from 'lucide-react';

type QueueStatus = 'scheduled' | 'checked_in' | 'waiting' | 'in_progress' | 'done' | 'no_show';

interface QueueItem {
    id: string; patient: string; time: string; doctor: string;
    type: string; status: QueueStatus; waitMins?: number;
}

const MOCK_QUEUE: QueueItem[] = [
    { id: 'q001', patient: 'Amara Okafor', time: '09:00', doctor: 'Dr. Fatima Aliyu', type: 'Follow-up', status: 'done', waitMins: 0 },
    { id: 'q002', patient: 'Emeka Nwosu', time: '09:30', doctor: 'Dr. Emeka Okonkwo', type: 'New Patient', status: 'in_progress', waitMins: 8 },
    { id: 'q003', patient: 'Ngozi Adewale', time: '10:00', doctor: 'Dr. Fatima Aliyu', type: 'Consultation', status: 'waiting', waitMins: 22 },
    { id: 'q004', patient: 'Ibrahim Musa', time: '10:30', doctor: 'Dr. Emeka Okonkwo', type: 'Review', status: 'checked_in', waitMins: 5 },
    { id: 'q005', patient: 'Fatima Garba', time: '11:00', doctor: 'Dr. Fatima Aliyu', type: 'Follow-up', status: 'scheduled' },
    { id: 'q006', patient: 'Chidi Okpara', time: '11:30', doctor: 'Dr. Bashir Umar', type: 'Consultation', status: 'no_show' },
];

const STATUS_CFG: Record<QueueStatus, { color: string; bg: string; icon: React.ElementType; label: string; next?: QueueStatus }> = {
    scheduled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: Clock, label: 'Scheduled', next: 'checked_in' },
    checked_in: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', icon: UserCheck, label: 'Checked In', next: 'waiting' },
    waiting: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock, label: 'Waiting', next: 'in_progress' },
    in_progress: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: UserCheck, label: 'In Progress', next: 'done' },
    done: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Done' },
    no_show: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: X, label: 'No Show' },
};

const NEXT_LABELS: Partial<Record<QueueStatus, string>> = {
    scheduled: 'Check In', checked_in: 'Mark Waiting', waiting: 'Start', in_progress: 'Complete',
};

export function AppointmentQueuePage() {
    const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE);

    const advance = (id: string) => {
        setQueue(q => q.map(item => {
            if (item.id !== id) return item;
            const next = STATUS_CFG[item.status].next;
            return next ? { ...item, status: next } : item;
        }));
    };

    const stats = {
        total: queue.length,
        done: queue.filter(q => q.status === 'done').length,
        inProg: queue.filter(q => q.status === 'in_progress').length,
        waiting: queue.filter(q => q.status === 'waiting').length,
        noShow: queue.filter(q => q.status === 'no_show').length,
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Today's Queue</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
                        {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })} — {stats.total} appointments
                    </p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(13,148,136,0.15)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.25)' }}>
                    <UserPlus size={14} /> Add Walk-in
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Done', value: stats.done, color: '#10b981' },
                    { label: 'In Progress', value: stats.inProg, color: '#a78bfa' },
                    { label: 'Waiting', value: stats.waiting, color: '#f59e0b' },
                    { label: 'No-Show', value: stats.noShow, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}20` }}>
                        <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: '#4b5563' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Queue table */}
            <div className="space-y-2">
                {queue.map(item => {
                    const st = STATUS_CFG[item.status];
                    const StIcon = st.icon;
                    const nextLabel = NEXT_LABELS[item.status];
                    return (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all flex-wrap"
                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.status === 'in_progress' ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                            {/* Time */}
                            <div className="text-sm font-black w-12 flex-shrink-0" style={{ color: '#94a3b8' }}>{item.time}</div>
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{ background: st.bg, color: st.color }}>{item.patient.charAt(0)}</div>
                            {/* Info */}
                            <div className="flex-1 min-w-0" style={{ minWidth: '120px' }}>
                                <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{item.patient}</div>
                                <div className="text-xs" style={{ color: '#4b5563' }}>{item.doctor} · {item.type}</div>
                            </div>
                            {/* Wait time — hidden on smallest screens */}
                            {item.waitMins !== undefined && item.status !== 'done' && item.status !== 'no_show' && (
                                <div className="hidden sm:flex items-center gap-1 text-xs flex-shrink-0" style={{ color: item.waitMins > 15 ? '#f59e0b' : '#6b7280' }}>
                                    {item.waitMins > 15 && <AlertTriangle size={11} />}
                                    {item.waitMins}m
                                </div>
                            )}
                            {/* Status badge */}
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: st.bg, color: st.color }}>
                                <StIcon size={10} /> {st.label}
                            </span>
                            {/* Advance button */}
                            {nextLabel && (
                                <button onClick={() => advance(item.id)}
                                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all hover:-translate-y-0.5"
                                    style={{ background: 'rgba(13,148,136,0.15)', color: '#0d9488' }}>
                                    {nextLabel}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
