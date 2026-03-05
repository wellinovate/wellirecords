import React, { useState, useEffect } from 'react';
import {
    X, ChevronLeft, ChevronRight, MapPin, Video, Check,
    Star, Clock, Calendar, User, Stethoscope, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/shared/auth/AuthProvider';

// ─── Types ───────────────────────────────────────────────────────────
export interface BookingProvider {
    name: string;
    specialty: string;
    rating: string;
    distance: string;
    estimatedCost: string;
    availability: Record<string, string[]>; // "YYYY-MM-DD" → available slot strings "HH:MM"
}

interface BookingModalProps {
    provider: BookingProvider;
    onClose: () => void;
}

// ─── Mock provider availability (in a real app this comes from API) ──
const UNAVAILABLE_SLOTS = ['10:00', '14:30', '16:00'];

// ─── Helpers ─────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

function toISO(y: number, m: number, d: number): string {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatDDMMYYYY(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

/** Generate all 30-min slots from 08:00-17:30 */
const ALL_SLOTS = Array.from({ length: 20 }, (_, i) => {
    const totalMins = 8 * 60 + i * 30;
    return `${pad(Math.floor(totalMins / 60))}:${pad(totalMins % 60)}`;
});

// ─── Calendar component ───────────────────────────────────────────────
function CalendarPicker({
    selectedDate,
    onChange,
}: {
    selectedDate: string | null;
    onChange: (iso: string) => void;
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

    // Mock: weekends in the month are "unavailable provider days"
    function isProviderUnavailable(day: number): boolean {
        const dow = new Date(viewYear, viewMonth, day).getDay();
        return dow === 0; // Sundays only
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    }

    // Prevent navigating before current month
    const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth();

    return (
        <div className="select-none">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={prevMonth}
                    disabled={isPrevDisabled}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: 'var(--pat-surface2)' }}
                >
                    <ChevronLeft size={16} style={{ color: 'var(--pat-text)' }} />
                </button>
                <span className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'var(--pat-surface2)' }}
                >
                    <ChevronRight size={16} style={{ color: 'var(--pat-text)' }} />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-black uppercase tracking-wider py-1"
                        style={{ color: 'var(--pat-muted)' }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const iso = toISO(viewYear, viewMonth, day);
                    const isPast = iso < todayISO;
                    const isUnavail = isProviderUnavailable(day);
                    const isSelected = selectedDate === iso;
                    const isToday = iso === todayISO;
                    const disabled = isPast || isUnavail;

                    return (
                        <button
                            key={day}
                            disabled={disabled}
                            onClick={() => !disabled && onChange(iso)}
                            className="h-9 w-full rounded-lg text-sm font-semibold transition-all flex items-center justify-center relative"
                            style={{
                                background: isSelected
                                    ? 'var(--pat-primary)'
                                    : isToday && !isSelected
                                        ? 'rgba(4,30,66,0.08)'
                                        : 'transparent',
                                color: isSelected
                                    ? '#fff'
                                    : disabled
                                        ? 'var(--pat-muted)'
                                        : 'var(--pat-text)',
                                opacity: disabled ? 0.35 : 1,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                fontWeight: isToday ? 800 : 600,
                            }}
                        >
                            {day}
                            {isToday && !isSelected && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                    style={{ background: 'var(--pat-primary)' }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-[10px]"
                style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-muted)' }}>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--pat-primary)' }} />
                    Selected
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block opacity-30" style={{ background: 'var(--pat-muted)' }} />
                    Unavailable
                </span>
            </div>
        </div>
    );
}

// ─── Time Slot Grid ───────────────────────────────────────────────────
function TimeSlotGrid({
    selectedTime,
    onChange,
}: {
    selectedTime: string | null;
    onChange: (slot: string) => void;
}) {
    return (
        <div>
            <div className="grid grid-cols-4 gap-1.5">
                {ALL_SLOTS.map(slot => {
                    const isUnavail = UNAVAILABLE_SLOTS.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                        <button
                            key={slot}
                            disabled={isUnavail}
                            onClick={() => !isUnavail && onChange(slot)}
                            title={isUnavail ? 'Not available' : `Book at ${slot}`}
                            className="py-2 px-1 rounded-lg text-xs font-bold transition-all relative"
                            style={{
                                background: isSelected
                                    ? 'var(--pat-primary)'
                                    : isUnavail
                                        ? 'var(--pat-surface2)'
                                        : 'transparent',
                                color: isSelected
                                    ? '#fff'
                                    : isUnavail
                                        ? 'var(--pat-muted)'
                                        : 'var(--pat-text)',
                                border: isSelected
                                    ? '1.5px solid var(--pat-primary)'
                                    : isUnavail
                                        ? '1.5px solid transparent'
                                        : '1.5px solid var(--pat-border)',
                                opacity: isUnavail ? 0.45 : 1,
                                cursor: isUnavail ? 'not-allowed' : 'pointer',
                                textDecoration: isUnavail ? 'line-through' : 'none',
                            }}
                        >
                            {slot}
                        </button>
                    );
                })}
            </div>
            <p className="text-[10px] mt-2" style={{ color: 'var(--pat-muted)' }}>
                Crossed-out slots are already booked. All times are WAT (Lagos).
            </p>
        </div>
    );
}

// ─── Main Modal ──────────────────────────────────────────────────────
export function BookingModal({ provider, onClose }: BookingModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [appointmentType, setAppointmentType] = useState<'in-person' | 'telehealth'>('in-person');
    const [notes, setNotes] = useState('');

    // Trap scroll behind modal
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const canProceed = selectedDate !== null && selectedTime !== null;

    const stepLabel = step === 1 ? 'Choose Date & Time' : step === 2 ? 'Review Booking' : 'Booking Confirmed';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,30,66,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                style={{ background: 'var(--pat-surface)', border: '1px solid var(--pat-border)' }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b flex-shrink-0"
                    style={{ borderColor: 'var(--pat-border)' }}>
                    <div className="flex items-center gap-3">
                        {step === 2 && (
                            <button onClick={() => setStep(1)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100">
                                <ArrowLeft size={16} style={{ color: 'var(--pat-muted)' }} />
                            </button>
                        )}
                        <div>
                            <h2 className="font-black text-base leading-tight" style={{ color: 'var(--pat-text)' }}>
                                {stepLabel}
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--pat-muted)' }}>
                                Step {step} of 3 &nbsp;·&nbsp; {provider.name}
                            </p>
                        </div>
                    </div>

                    {/* Step Dots */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3].map(s => (
                                <div key={s} className="rounded-full transition-all"
                                    style={{
                                        width: step === s ? 20 : 7,
                                        height: 7,
                                        background: s <= step ? 'var(--pat-primary)' : 'var(--pat-border)',
                                    }} />
                            ))}
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: 'var(--pat-surface2)' }}>
                            <X size={16} style={{ color: 'var(--pat-muted)' }} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="overflow-y-auto flex-1 px-6 py-5">

                    {/* ── STEP 1: Choose Date & Time ── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Provider summary */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border"
                                style={{ background: 'var(--pat-surface2)', borderColor: 'var(--pat-border)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0"
                                    style={{ background: 'var(--pat-primary)' }}>
                                    <Stethoscope size={20} color="#fff" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate" style={{ color: 'var(--pat-text)' }}>{provider.name}</div>
                                    <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>{provider.specialty}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                                            <Star size={11} fill="currentColor" /> {provider.rating}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--pat-muted)' }}>
                                            <MapPin size={10} /> {provider.distance}
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: 'var(--pat-primary)' }}>
                                            Est. {provider.estimatedCost}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Type */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-2 block"
                                    style={{ color: 'var(--pat-muted)' }}>
                                    Appointment Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { id: 'in-person', label: 'In-Person', icon: <MapPin size={15} />, desc: 'Visit the clinic' },
                                        { id: 'telehealth', label: 'Telehealth', icon: <Video size={15} />, desc: 'Video consultation' },
                                    ] as const).map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setAppointmentType(opt.id)}
                                            className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                                            style={{
                                                borderColor: appointmentType === opt.id ? 'var(--pat-primary)' : 'var(--pat-border)',
                                                background: appointmentType === opt.id ? 'rgba(4,30,66,0.06)' : 'transparent',
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: appointmentType === opt.id ? 'var(--pat-primary)' : 'var(--pat-surface2)',
                                                    color: appointmentType === opt.id ? '#fff' : 'var(--pat-muted)',
                                                }}>
                                                {opt.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>{opt.label}</div>
                                                <div className="text-[10px]" style={{ color: 'var(--pat-muted)' }}>{opt.desc}</div>
                                            </div>
                                            {appointmentType === opt.id && (
                                                <CheckCircle2 size={16} className="ml-auto flex-shrink-0" style={{ color: 'var(--pat-primary)' }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Calendar */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-3 block"
                                    style={{ color: 'var(--pat-muted)' }}>
                                    Select Date
                                </label>
                                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-surface2)' }}>
                                    <CalendarPicker selectedDate={selectedDate} onChange={setSelectedDate} />
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-3 block"
                                    style={{ color: 'var(--pat-muted)' }}>
                                    {selectedDate
                                        ? `Available Times — ${formatDDMMYYYY(selectedDate)}`
                                        : 'Select a date above to see available times'}
                                </label>
                                {selectedDate ? (
                                    <TimeSlotGrid selectedTime={selectedTime} onChange={setSelectedTime} />
                                ) : (
                                    <div className="flex items-center justify-center gap-2 py-8 rounded-xl border border-dashed"
                                        style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-muted)' }}>
                                        <Calendar size={18} />
                                        <span className="text-sm font-medium">Pick a date first</span>
                                    </div>
                                )}
                            </div>

                            {/* Notes (optional) */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-2 block"
                                    style={{ color: 'var(--pat-muted)' }}>
                                    Notes for the Provider <span className="font-normal">(optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="e.g. Recurring headaches for 2 weeks, allergic to penicillin..."
                                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none border transition-shadow focus:shadow-md"
                                    style={{
                                        background: 'var(--pat-surface2)',
                                        borderColor: 'var(--pat-border)',
                                        color: 'var(--pat-text)',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Review ── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-surface2)' }}>
                                <h3 className="text-xs font-black uppercase tracking-wider mb-4"
                                    style={{ color: 'var(--pat-muted)' }}>
                                    Booking Summary
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: <Stethoscope size={15} />, label: 'Provider', value: provider.name },
                                        { icon: <User size={15} />, label: 'Specialty', value: provider.specialty },
                                        { icon: <Calendar size={15} />, label: 'Date', value: selectedDate ? formatDDMMYYYY(selectedDate) : '' },
                                        { icon: <Clock size={15} />, label: 'Time', value: `${selectedTime} WAT` },
                                        {
                                            icon: appointmentType === 'in-person' ? <MapPin size={15} /> : <Video size={15} />,
                                            label: 'Type',
                                            value: appointmentType === 'in-person' ? 'In-Person Visit' : 'Telehealth (Video)'
                                        },
                                        { icon: <User size={15} />, label: 'Patient', value: user?.name ?? 'You' },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'rgba(4,30,66,0.08)', color: 'var(--pat-primary)' }}>
                                                {row.icon}
                                            </div>
                                            <span className="text-xs w-20 flex-shrink-0 font-bold" style={{ color: 'var(--pat-muted)' }}>{row.label}</span>
                                            <span className="text-sm font-semibold" style={{ color: 'var(--pat-text)' }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {notes && (
                                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--pat-border)' }}>
                                        <p className="text-xs font-bold mb-1" style={{ color: 'var(--pat-muted)' }}>Notes</p>
                                        <p className="text-sm" style={{ color: 'var(--pat-text)' }}>{notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Estimated Cost */}
                            <div className="flex items-center justify-between p-4 rounded-xl border-2"
                                style={{ borderColor: 'var(--pat-primary)', background: 'rgba(4,30,66,0.04)' }}>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--pat-muted)' }}>
                                        Estimated Cost
                                    </div>
                                    <div className="text-2xl font-black mt-0.5" style={{ color: 'var(--pat-primary)' }}>
                                        {provider.estimatedCost}
                                    </div>
                                </div>
                                <div className="text-xs text-right leading-relaxed" style={{ color: 'var(--pat-muted)' }}>
                                    HMO may cover<br />up to 100% of fees
                                </div>
                            </div>

                            <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--pat-muted)' }}>
                                By confirming, you agree to the clinic's cancellation policy. You can cancel up to 2 hours before your appointment at no charge.
                            </p>
                        </div>
                    )}

                    {/* ── STEP 3: Success ── */}
                    {step === 3 && (
                        <div className="flex flex-col items-center text-center py-6 space-y-5">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(4,30,66,0.1)' }}>
                                <Check size={36} strokeWidth={3} style={{ color: 'var(--pat-primary)' }} className="animate-bounce" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl mb-1" style={{ color: 'var(--pat-primary)' }}>
                                    Booking Confirmed!
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>
                                    Your appointment has been reserved.
                                </p>
                            </div>

                            <div className="w-full p-4 rounded-xl border text-left space-y-2"
                                style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-surface2)' }}>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--pat-muted)' }}>Provider</span>
                                    <span className="font-bold" style={{ color: 'var(--pat-text)' }}>{provider.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--pat-muted)' }}>Date & Time</span>
                                    <span className="font-bold" style={{ color: 'var(--pat-text)' }}>
                                        {selectedDate ? formatDDMMYYYY(selectedDate) : ''} at {selectedTime}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--pat-muted)' }}>Type</span>
                                    <span className="font-bold" style={{ color: 'var(--pat-text)' }}>
                                        {appointmentType === 'in-person' ? 'In-Person' : 'Telehealth'}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full p-3 rounded-xl text-xs font-medium"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
                                📱 A confirmation SMS will be sent to your registered number.
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    className="flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-colors"
                                    style={{ borderColor: 'var(--pat-primary)', color: 'var(--pat-primary)' }}
                                    onClick={() => {/* TODO: calendar integration */ }}
                                >
                                    Add to Calendar
                                </button>
                                <button
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                                    style={{ background: 'var(--pat-primary)' }}
                                    onClick={onClose}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer CTA (hidden on step 3) ── */}
                {step !== 3 && (
                    <div className="px-6 pb-5 pt-3 border-t flex-shrink-0"
                        style={{ borderColor: 'var(--pat-border)' }}>
                        <button
                            onClick={() => {
                                if (step === 1 && canProceed) setStep(2);
                                else if (step === 2) setStep(3);
                            }}
                            disabled={step === 1 && !canProceed}
                            className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all"
                            style={{
                                background: step === 1 && !canProceed
                                    ? 'var(--pat-muted)'
                                    : 'var(--pat-primary)',
                                cursor: step === 1 && !canProceed ? 'not-allowed' : 'pointer',
                                opacity: step === 1 && !canProceed ? 0.5 : 1,
                            }}
                        >
                            {step === 1 ? (canProceed ? 'Review Booking →' : 'Select a date and time to continue') : 'Confirm Booking'}
                        </button>
                        {step === 1 && !canProceed && (
                            <p className="text-center text-xs mt-2" style={{ color: 'var(--pat-muted)' }}>
                                Please choose a date and time slot above.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
