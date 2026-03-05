import React, { useState, useRef, useEffect } from 'react';
import {
    Calendar, Clock, Video, Building2, Plus, CheckCircle, X, MoreVertical,
    Brain, AlertCircle, FileText, Download, Filter, ChevronLeft, ChevronRight,
    RefreshCw, Users, Bell, Search,
} from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────────────── */
type AptType = 'in_person' | 'telehealth';
type AptStatus = 'upcoming' | 'completed' | 'cancelled';

interface Appointment {
    id: string;
    provider: string;
    org: string;
    specialty: string;
    type: AptType;
    date: string;
    time: string;
    status: AptStatus;
    notes: string;
    color: string;
    /** Shown 24h before as pre-visit checklist */
    checklist?: string[];
    /** AI-generated brief shown on the card */
    aiBrief?: string;
}

/* ─── Mock Data ───────────────────────────────────────────────────────── */
const MOCK: Appointment[] = [
    {
        id: 'apt_001',
        provider: 'Dr. Fatima Aliyu',
        org: 'Lagos General Hospital',
        specialty: 'Cardiology',
        type: 'in_person',
        date: '2026-03-05',
        time: '10:00 AM',
        status: 'upcoming',
        color: '#ef4444',
        notes: 'Follow-up for blood pressure management',
        checklist: [
            'Upload your last 7 days of blood pressure readings',
            'Bring your current medication list',
            'Fast for 4 hours before the appointment',
        ],
    },
    {
        id: 'apt_002',
        provider: 'Dr. Sola Martins',
        org: 'WelliHealth Telehealth',
        specialty: 'General Practice',
        type: 'telehealth',
        date: '2026-03-08',
        time: '2:00 PM',
        status: 'upcoming',
        color: '#1a6b42',
        notes: 'Virtual diabetes consultation',
        aiBrief: 'Your last HbA1c was 7.2 — your doctor will have this ready. Blood glucose trend over 30 days: slightly elevated (avg 8.4 mmol/L). Fasting reading from yesterday: 6.1 mmol/L (within target).',
    },
    {
        id: 'apt_003',
        provider: 'Dr. Fatima Aliyu',
        org: 'Lagos General Hospital',
        specialty: 'Cardiology',
        type: 'in_person',
        date: '2026-01-15',
        time: '9:00 AM',
        status: 'completed',
        color: '#ef4444',
        notes: 'Annual wellness visit',
    },
    {
        id: 'apt_004',
        provider: 'Dr. Emeka Nwosu',
        org: 'WelliHealth Telehealth',
        specialty: 'General Practice',
        type: 'telehealth',
        date: '2025-12-10',
        time: '11:00 AM',
        status: 'completed',
        color: '#1a6b42',
        notes: 'Flu symptoms check',
    },
    {
        id: 'apt_005',
        provider: 'Dr. Ngozi Okafor',
        org: 'City Women\'s Clinic',
        specialty: 'OB/GYN',
        type: 'in_person',
        date: '2025-11-04',
        time: '3:30 PM',
        status: 'completed',
        color: '#8b5cf6',
        notes: 'Routine prenatal check',
    },
    {
        id: 'apt_006',
        provider: 'Dr. Tunde Ifeanyi',
        org: 'MindBridge Clinic',
        specialty: 'Psychiatry',
        type: 'telehealth',
        date: '2025-10-22',
        time: '10:00 AM',
        status: 'cancelled',
        color: '#0ea5e9',
        notes: 'Therapy follow-up',
    },
];

/* ─── Kebab Menu ─────────────────────────────────────────────────────── */
function KebabMenu({ aptId, onCancel }: { aptId: string; onCancel: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirmCancel(false);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    return (
        <div ref={ref} className="relative flex-shrink-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                aria-label="Appointment options">
                <MoreVertical size={16} style={{ color: '#6b7280' }} />
            </button>

            {open && !confirmCancel && (
                <div className="absolute right-0 top-9 z-20 w-52 rounded-xl shadow-xl overflow-hidden"
                    style={{ background: 'white', border: '1.5px solid #e5e7eb' }}>
                    {[
                        { icon: RefreshCw, label: 'Reschedule', color: '#1a6b42' },
                        { icon: Calendar, label: 'Add to Calendar', color: '#6366f1' },
                        { icon: Users, label: 'Share with Family Member', color: '#0ea5e9' },
                    ].map(item => (
                        <button key={item.label}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors text-left"
                            style={{ color: '#374151' }}>
                            <item.icon size={14} style={{ color: item.color }} />
                            {item.label}
                        </button>
                    ))}
                    <div className="h-px mx-4" style={{ background: '#f3f4f6' }} />
                    <button
                        onClick={() => setConfirmCancel(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-red-50 transition-colors text-left"
                        style={{ color: '#ef4444' }}>
                        <X size={14} />
                        Cancel Appointment
                    </button>
                </div>
            )}

            {/* Confirmation dialog */}
            {confirmCancel && (
                <div className="absolute right-0 top-9 z-20 w-64 rounded-xl shadow-xl p-4"
                    style={{ background: 'white', border: '1.5px solid #fecaca' }}>
                    <div className="flex items-start gap-2 mb-3">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-bold text-sm" style={{ color: '#1a2e1e' }}>Cancel this appointment?</div>
                            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>This cannot be undone. Your doctor's office will be notified.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setConfirmCancel(false); setOpen(false); }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold border"
                            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                            Keep it
                        </button>
                        <button
                            onClick={() => { onCancel(aptId); setOpen(false); setConfirmCancel(false); }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white"
                            style={{ background: '#ef4444' }}>
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Pre-Appointment Checklist Card ────────────────────────────────── */
function ChecklistCard({ apt }: { apt: Appointment }) {
    const [checked, setChecked] = useState<Record<number, boolean>>({});
    const done = (apt.checklist?.length ?? 0) > 0 && Object.values(checked).filter(Boolean).length === apt.checklist!.length;

    return (
        <div className="mt-4 rounded-xl p-4" style={{ background: '#fffbeb', border: '1.5px solid #fbbf24' }}>
            <div className="flex items-center gap-2 mb-3">
                <Bell size={14} style={{ color: '#d97706' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#92400e' }}>
                    Pre-Visit Checklist · Your appointment is soon
                </span>
                {done && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">All done ✓</span>}
            </div>
            <div className="space-y-2">
                {apt.checklist!.map((item, i) => (
                    <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox"
                            checked={!!checked[i]}
                            onChange={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
                            className="mt-0.5 accent-amber-500 w-3.5 h-3.5 flex-shrink-0" />
                        <span className={`text-xs leading-relaxed ${checked[i] ? 'line-through text-gray-400' : ''}`}
                            style={{ color: checked[i] ? undefined : '#78350f' }}>
                            {item}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

/* ─── AI Brief Card ─────────────────────────────────────────────────── */
function AIBrief({ text }: { text: string }) {
    return (
        <div className="mt-4 rounded-xl p-4" style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd' }}>
            <div className="flex items-center gap-2 mb-2">
                <Brain size={14} style={{ color: '#7c3aed' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#5b21b6' }}>
                    WelliAI Appointment Brief
                </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#4c1d95' }}>{text}</p>
        </div>
    );
}

/* ─── History Table ─────────────────────────────────────────────────── */
const PAGE_SIZE = 3;

function HistoryTable({ appointments }: { appointments: Appointment[] }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | AptType>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | AptStatus>('all');
    const [page, setPage] = useState(0);
    const [requestedIds, setRequestedIds] = useState<string[]>([]);

    const filtered = appointments.filter(a => {
        const matchSearch = a.provider.toLowerCase().includes(search.toLowerCase()) || a.specialty.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || a.type === typeFilter;
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const statusColor: Record<AptStatus, { bg: string; text: string; label: string }> = {
        completed: { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
        cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
        upcoming: { bg: '#dbeafe', text: '#1e40af', label: 'Upcoming' },
    };

    return (
        <div>
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-32">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search provider or specialty…"
                        className="input input-light w-full pl-8 text-xs py-2" />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={13} style={{ color: '#9ca3af' }} />
                    {(['all', 'telehealth', 'in_person'] as const).map(t => (
                        <button key={t}
                            onClick={() => { setTypeFilter(t); setPage(0); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: typeFilter === t ? '#1a6b42' : '#f3f4f6',
                                color: typeFilter === t ? '#fff' : '#6b7280',
                            }}>
                            {t === 'all' ? 'All Types' : t === 'telehealth' ? '📡 Telehealth' : '🏥 In-Person'}
                        </button>
                    ))}
                    {(['all', 'completed', 'cancelled'] as const).map(s => (
                        <button key={s}
                            onClick={() => { setStatusFilter(s); setPage(0); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: statusFilter === s ? '#1a2e1e' : '#f3f4f6',
                                color: statusFilter === s ? '#fff' : '#6b7280',
                            }}>
                            {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-10 text-sm" style={{ color: '#9ca3af' }}>No past appointments match your filters.</div>
            ) : (
                <>
                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                        {/* Table header */}
                        <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: '#f9fafb', color: '#9ca3af', borderBottom: '1px solid #e5e7eb' }}>
                            <div className="col-span-4">Provider</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Records</div>
                        </div>

                        {pageItems.map((apt, idx) => {
                            const s = statusColor[apt.status];
                            const requested = requestedIds.includes(apt.id);
                            return (
                                <div key={apt.id}
                                    className="grid grid-cols-12 px-4 py-3 items-center"
                                    style={{ borderTop: idx > 0 ? '1px solid #f3f4f6' : undefined, background: 'white' }}>
                                    {/* Provider */}
                                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black"
                                            style={{ background: apt.color }}>
                                            {apt.provider.split(' ').slice(-1)[0][0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold truncate" style={{ color: '#1a2e1e' }}>{apt.provider}</div>
                                            <div className="text-[10px] truncate" style={{ color: '#9ca3af' }}>{apt.specialty}</div>
                                        </div>
                                    </div>
                                    {/* Date */}
                                    <div className="col-span-2 text-xs" style={{ color: '#6b7280' }}>
                                        {new Date(apt.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    {/* Type */}
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-semibold">
                                            {apt.type === 'telehealth' ? '📡 Telehealth' : '🏥 In-Person'}
                                        </span>
                                    </div>
                                    {/* Status */}
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: s.bg, color: s.text }}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {/* Request Records */}
                                    <div className="col-span-2 flex justify-end">
                                        {apt.status === 'completed' && (
                                            <button
                                                onClick={() => setRequestedIds(ids => [...ids, apt.id])}
                                                disabled={requested}
                                                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-60"
                                                style={{
                                                    borderColor: requested ? '#86efac' : '#d1d5db',
                                                    color: requested ? '#16a34a' : '#6b7280',
                                                    background: requested ? '#f0fdf4' : 'white',
                                                }}>
                                                {requested
                                                    ? <><CheckCircle size={9} /> Sent</>
                                                    : <><Download size={9} /> Request Records</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px]" style={{ color: '#9ca3af' }}>
                                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center border disabled:opacity-40 transition-colors hover:bg-gray-50"
                                    style={{ borderColor: '#e5e7eb' }}>
                                    <ChevronLeft size={13} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i}
                                        onClick={() => setPage(i)}
                                        className="w-7 h-7 rounded-lg text-xs font-bold border transition-all"
                                        style={{
                                            borderColor: page === i ? '#1a6b42' : '#e5e7eb',
                                            background: page === i ? '#1a6b42' : 'white',
                                            color: page === i ? 'white' : '#6b7280',
                                        }}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center border disabled:opacity-40 transition-colors hover:bg-gray-50"
                                    style={{ borderColor: '#e5e7eb' }}>
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function AppointmentsPage() {
    const [appointments, setAppointments] = useState(MOCK);
    const [showBook, setShowBook] = useState(false);
    const [bookType, setBookType] = useState<'in_person' | 'telehealth'>('in_person');

    const upcoming = appointments.filter(a => a.status === 'upcoming');
    const history = appointments.filter(a => a.status !== 'upcoming');

    const cancelApt = (id: string) =>
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));

    // Simulate "24h before" for demo — treat apt_001 as within 24h
    const isWithin24h = (apt: Appointment) => apt.id === 'apt_001';

    return (
        <div className="animate-fade-in max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#1a2e1e' }}>Appointments</h1>
                    <p className="text-sm" style={{ color: '#5a7a63' }}>Manage your hospital and telehealth appointments</p>
                </div>
                <button onClick={() => setShowBook(true)} className="btn btn-patient gap-2">
                    <Plus size={16} /> Book Appointment
                </button>
            </div>

            {/* ── Upcoming Appointments ── */}
            <section className="mb-10">
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>
                    Upcoming ({upcoming.length})
                </h2>
                {upcoming.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: '#d1d5db' }}>
                        <Calendar size={28} className="mx-auto mb-3" style={{ color: '#d1d5db' }} />
                        <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>No upcoming appointments</p>
                        <button onClick={() => setShowBook(true)} className="mt-4 btn btn-patient gap-2 text-sm">
                            <Plus size={14} /> Book One Now
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {upcoming.map(apt => (
                            <div key={apt.id}
                                className="rounded-2xl overflow-hidden shadow-sm border"
                                style={{ background: 'white', borderColor: '#e5e7eb' }}>
                                {/* Colour accent bar */}
                                <div className="h-1 w-full" style={{ background: apt.color }} />

                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${apt.color}15` }}>
                                            {apt.type === 'telehealth'
                                                ? <Video size={22} style={{ color: apt.color }} />
                                                : <Building2 size={22} style={{ color: apt.color }} />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-base" style={{ color: '#1a2e1e' }}>{apt.provider}</div>
                                            <div className="text-xs font-medium" style={{ color: apt.color }}>{apt.specialty}</div>
                                            <div className="text-xs" style={{ color: '#9ca3af' }}>{apt.org}</div>
                                            <div className="flex items-center flex-wrap gap-3 mt-2">
                                                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#6b7280' }}>
                                                    <Calendar size={11} />
                                                    {new Date(apt.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#6b7280' }}>
                                                    <Clock size={11} /> {apt.time}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: `${apt.color}12`, color: apt.color }}>
                                                    {apt.type === 'telehealth' ? '📡 Telehealth' : '🏥 In-Person'}
                                                </span>
                                            </div>
                                            {apt.notes && (
                                                <p className="text-xs mt-1.5 italic" style={{ color: '#9ca3af' }}>{apt.notes}</p>
                                            )}
                                        </div>

                                        {/* Actions — horizontal row + kebab */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {apt.type === 'telehealth' && (
                                                <button
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                                                    style={{ background: apt.color }}>
                                                    <Video size={13} /> Join
                                                </button>
                                            )}
                                            {apt.type === 'in_person' && (
                                                <button
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border"
                                                    style={{ borderColor: apt.color, color: apt.color }}>
                                                    <FileText size={13} /> Directions
                                                </button>
                                            )}
                                            <KebabMenu aptId={apt.id} onCancel={cancelApt} />
                                        </div>
                                    </div>

                                    {/* Pre-visit checklist — 24h before */}
                                    {isWithin24h(apt) && apt.checklist && <ChecklistCard apt={apt} />}

                                    {/* AI Brief — telehealth cards */}
                                    {apt.aiBrief && <AIBrief text={apt.aiBrief} />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── History Table ── */}
            {history.length > 0 && (
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>
                        Appointment History ({history.length})
                    </h2>
                    <HistoryTable appointments={history} />
                </section>
            )}

            {/* ── Book Modal ── */}
            {showBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)' }}>
                    <div className="w-full max-w-md rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden"
                        style={{ background: 'white' }}>
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#1a6b42,#0ea5e9)' }} />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-display font-bold text-lg" style={{ color: '#1a2e1e' }}>Book Appointment</h3>
                                <button onClick={() => setShowBook(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1a2e1e' }}>Appointment Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { val: 'in_person' as const, label: '🏥 In-Person', color: '#1a6b42' },
                                            { val: 'telehealth' as const, label: '📡 Telehealth', color: '#6366f1' },
                                        ].map(t => (
                                            <button key={t.val}
                                                onClick={() => setBookType(t.val)}
                                                className="p-3 rounded-xl text-sm font-semibold border-2 transition-all"
                                                style={{
                                                    borderColor: bookType === t.val ? t.color : '#e5e7eb',
                                                    background: bookType === t.val ? `${t.color}08` : 'white',
                                                    color: bookType === t.val ? t.color : '#374151',
                                                }}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1a2e1e' }}>Provider</label>
                                    <select className="input input-light">
                                        <option>Dr. Fatima Aliyu — Lagos General Hospital</option>
                                        <option>Dr. Sola Martins — WelliHealth Telehealth</option>
                                        <option>Dr. Ngozi Okafor — City Women's Clinic</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1a2e1e' }}>Date</label>
                                        <input type="date" className="input input-light" min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1a2e1e' }}>Time</label>
                                        <select className="input input-light">
                                            <option>10:00 AM</option>
                                            <option>11:30 AM</option>
                                            <option>2:00 PM</option>
                                            <option>4:30 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowBook(false)}
                                    className="btn btn-patient w-full justify-center mt-2">
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
