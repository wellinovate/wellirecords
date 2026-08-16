import React, { useEffect, useState } from 'react';
import {
    BarChart2,
    Stethoscope,
    FlaskConical,
    Pill,
    CalendarX2,
    Loader2,
    AlertTriangle,
    Inbox,
    TrendingDown,
    CheckCircle2,
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { getReportsOverview, type ReportsOverview, type ReportsRange } from '@/shared/api/reportsApi';

const RANGES: { value: ReportsRange; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
];

const AXIS_COLOR = '#7ba3c8';
const GRID_COLOR = '#163761';

/* ─── Meaning-Based Stat Card ────────────────────────────────────────── */
function StatCard({
    icon: Icon,
    label,
    value,
    badge,
    badgeType = 'neutral',
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    badge?: string;
    badgeType?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
    const badgeColors = {
        neutral: 'bg-slate-800/60 text-slate-300 border-slate-700',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    const iconColors = {
        neutral: 'bg-sky-500/10 text-sky-400',
        success: 'bg-emerald-500/10 text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-400',
        danger: 'bg-rose-500/10 text-rose-400',
    };

    return (
        <div className="card-provider p-5 flex items-center justify-between border" style={{ borderColor: '#163761' }}>
            <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[badgeType]}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs font-semibold" style={{ color: '#7ba3c8' }}>{label}</p>
                    <p className="text-2xl font-bold mt-0.5" style={{ color: '#e2eaf4' }}>{value}</p>
                </div>
            </div>
            {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColors[badgeType]}`}>
                    {badge}
                </span>
            )}
        </div>
    );
}

/* ─── Unified Chart Panel Wrapper ────────────────────────────────────── */
function ChartCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="card-provider p-5 flex flex-col justify-between border min-h-[320px]" style={{ borderColor: '#163761' }}>
            <div className="mb-4">
                <h3 className="text-sm font-bold" style={{ color: '#e2eaf4' }}>{title}</h3>
                {subtitle && (
                    <p className="text-[11px] mt-0.5" style={{ color: '#7ba3c8' }}>
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
                {children}
            </div>
        </div>
    );
}

/* ─── Standardized Empty State Component ─────────────────────────────── */
function EmptyChartState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div
            className="h-[210px] rounded-xl border border-dashed flex flex-col items-center justify-center p-6 text-center"
            style={{ borderColor: 'rgba(56,189,248,0.12)', background: 'rgba(7,24,48,0.3)' }}
        >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5 bg-slate-800/60 text-slate-400">
                <Icon size={18} />
            </div>
            <p className="text-xs font-bold text-slate-300">{title}</p>
            <p className="text-[11px] mt-1 max-w-xs leading-relaxed" style={{ color: '#7ba3c8' }}>
                {description}
            </p>
        </div>
    );
}

/* ─── Main Reports Page ──────────────────────────────────────────────── */
export function ReportsPage() {
    const [range, setRange] = useState<ReportsRange>('30d');
    const [data, setData] = useState<ReportsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorCode, setErrorCode] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        setErrorCode('');
        getReportsOverview(range)
            .then(setData)
            .catch((err: any) => {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    'Could not load reports right now.',
                );
                setErrorCode(err?.response?.data?.code || '');
            })
            .finally(() => setLoading(false));
    }, [range]);

    // Determine no-show rate status
    const noShowRate = data?.noShows.noShowRate ?? 0;
    const noShowBadgeType: 'success' | 'warning' | 'danger' =
        noShowRate === 0 ? 'success' : noShowRate <= 15 ? 'warning' : 'danger';
    const noShowBadgeText =
        noShowRate === 0 ? 'Optimal (0%)' : `${noShowRate}% missed`;

    return (
        <div className="animate-fade-in w-full max-w-7xl pb-12">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Reports & Analytics</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>
                        Clinical throughput, appointment attendance, and diagnostic volume metrics
                    </p>
                </div>

                <div className="flex gap-1 rounded-lg p-1" style={{ background: 'rgba(7,24,48,0.5)', border: '1px solid #163761' }}>
                    {RANGES.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                            style={{
                                background: range === r.value ? '#38bdf8' : 'transparent',
                                color: range === r.value ? '#04101f' : '#7ba3c8',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="card-provider p-16 flex flex-col items-center gap-3 text-center border" style={{ borderColor: '#163761' }}>
                    <Loader2 size={24} className="animate-spin text-sky-400" />
                    <span className="text-xs font-semibold" style={{ color: '#7ba3c8' }}>Aggregating facility metrics…</span>
                </div>
            )}

            {!loading && error && (
                <div className="card-provider p-10 text-center flex flex-col items-center gap-3 border" style={{ borderColor: '#163761' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)' }}>
                        <AlertTriangle size={26} style={{ color: '#f87171' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>
                        {errorCode === 'ORG_NOT_VERIFIED'
                            ? 'Verification required'
                            : errorCode === 'PERMISSION_DENIED'
                                ? "You don't have access to reports"
                                : "Couldn't load reports"}
                    </p>
                    <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>{error}</p>
                </div>
            )}

            {!loading && !error && data && (
                <>
                    {/* Stat Cards with Meaning-Mapped Colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            icon={Stethoscope}
                            label="Consultations Logged"
                            value={data.consultations.total}
                            badge="Clinical"
                            badgeType="neutral"
                        />
                        <StatCard
                            icon={FlaskConical}
                            label="Lab Orders Dispatched"
                            value={data.labOrders.total}
                            badge="Diagnostic"
                            badgeType="neutral"
                        />
                        <StatCard
                            icon={Pill}
                            label="Prescriptions Issued"
                            value={data.prescriptions.total}
                            badge="Pharmacy"
                            badgeType="neutral"
                        />
                        <StatCard
                            icon={CalendarX2}
                            label="No-Show Rate"
                            value={`${noShowRate}%`}
                            badge={noShowBadgeText}
                            badgeType={noShowBadgeType}
                        />
                    </div>

                    {/* Chart Grid with Unified Structure */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
                        {/* 1. Consultation Volume */}
                        <ChartCard
                            title="Consultation Volume"
                            subtitle="Daily clinical encounters completed across all departments"
                        >
                            {data.consultations.byDay.length === 0 ? (
                                <EmptyChartState
                                    icon={Stethoscope}
                                    title="No Consultations Recorded"
                                    description="Clinical encounters and physician notes created in this period will graph daily volume here."
                                />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={data.consultations.byDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12, borderRadius: 8 }} />
                                        <Legend wrapperStyle={{ fontSize: 11, color: '#7ba3c8', paddingTop: 8 }} />
                                        <Line type="monotone" name="Completed Encounters" dataKey="count" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: '#38bdf8' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* 2. No-Show & Attendance Tracking */}
                        <ChartCard
                            title="Attendance vs. No-Shows"
                            subtitle="Comparison of total booked visits against recorded patient no-shows"
                        >
                            {data.noShows.byDay.length === 0 ? (
                                <EmptyChartState
                                    icon={CalendarX2}
                                    title="No Appointments Scheduled"
                                    description="Appointment slots and patient attendance status during this timeframe will appear here."
                                />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.noShows.byDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12, borderRadius: 8 }}
                                            formatter={(val: any, name: string) => [val, name]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 11, color: '#7ba3c8', paddingTop: 8 }} />
                                        <Bar dataKey="total" name="Total Scheduled Visits" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="noShow" name="No-Shows (Missed)" fill="#f87171" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* 3. Lab Orders by Category */}
                        <ChartCard
                            title="Lab Orders by Category"
                            subtitle="Diagnostic test requests categorized by laboratory specialty"
                        >
                            {data.labOrders.byCategory.length === 0 ? (
                                <EmptyChartState
                                    icon={FlaskConical}
                                    title="No Lab Orders Dispatched"
                                    description="Laboratory panels requested by clinicians in this timeframe will break down by category here."
                                />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.labOrders.byCategory} layout="vertical" margin={{ left: 16 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis type="category" dataKey="category" tick={{ fill: AXIS_COLOR, fontSize: 10 }} width={90} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12, borderRadius: 8 }} />
                                        <Bar dataKey="count" name="Test Orders" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* 4. Top Prescribed Medications */}
                        <ChartCard
                            title="Top Prescribed Medications"
                            subtitle="Most frequently prescribed clinical pharmaceuticals"
                        >
                            {data.prescriptions.topMedications.length === 0 ? (
                                <EmptyChartState
                                    icon={Pill}
                                    title="No Prescriptions Recorded"
                                    description="Medications prescribed by doctors in this timeframe will rank by frequency here."
                                />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.prescriptions.topMedications} layout="vertical" margin={{ left: 16 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis type="category" dataKey="medicationName" tick={{ fill: AXIS_COLOR, fontSize: 10 }} width={110} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12, borderRadius: 8 }} />
                                        <Bar dataKey="count" name="Prescriptions" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </div>

                    {/* Footer Info */}
                    <div className="p-3.5 rounded-xl border flex items-center justify-between flex-wrap gap-2 text-xs" style={{ background: 'rgba(7,24,48,0.4)', borderColor: '#163761' }}>
                        <div className="flex items-center gap-2" style={{ color: '#7ba3c8' }}>
                            <BarChart2 size={14} className="text-sky-400" />
                            <span>
                                Reporting period: <strong className="text-slate-200">{new Date(data.range.from).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</strong> to <strong className="text-slate-200">{new Date(data.range.to).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> (Facility-scoped metrics)
                            </span>
                        </div>
                        <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Live Aggregation
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
