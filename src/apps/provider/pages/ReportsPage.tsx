import React, { useEffect, useState } from 'react';
import { BarChart2, Stethoscope, FlaskConical, Pill, CalendarX2, Loader2, AlertTriangle } from 'lucide-react';
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
} from 'recharts';
import { getReportsOverview, type ReportsOverview, type ReportsRange } from '@/shared/api/reportsApi';

const RANGES: { value: ReportsRange; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
];

const AXIS_COLOR = '#7ba3c8';
const GRID_COLOR = '#163761';

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent: string }) {
    return (
        <div className="card-provider p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}1a` }}>
                <Icon size={20} style={{ color: accent }} />
            </div>
            <div>
                <p className="text-xs" style={{ color: '#7ba3c8' }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: '#e2eaf4' }}>{value}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="card-provider p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: '#e2eaf4' }}>{title}</p>
            {children}
        </div>
    );
}

function EmptyChart({ label }: { label: string }) {
    return (
        <div className="h-[220px] flex items-center justify-center text-xs" style={{ color: '#4c6a8c' }}>
            {label}
        </div>
    );
}

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

    return (
        <div className="animate-fade-in">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Reports</h1>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>Clinical and operational performance reporting</p>
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
                <div className="card-provider p-10 flex flex-col items-center gap-2" style={{ color: '#7ba3c8' }}>
                    <Loader2 size={22} className="animate-spin" />
                    <span className="text-sm">Loading report data…</span>
                </div>
            )}

            {!loading && error && (
                <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={Stethoscope} label="Consultations" value={data.consultations.total} accent="#38bdf8" />
                        <StatCard icon={FlaskConical} label="Lab orders" value={data.labOrders.total} accent="#a78bfa" />
                        <StatCard icon={Pill} label="Prescriptions" value={data.prescriptions.total} accent="#34d399" />
                        <StatCard icon={CalendarX2} label="No-show rate" value={`${data.noShows.noShowRate}%`} accent="#f87171" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <ChartCard title="Consultation volume">
                            {data.consultations.byDay.length === 0 ? (
                                <EmptyChart label="No consultations recorded in this period." />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={data.consultations.byDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12 }} />
                                        <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        <ChartCard title="No-show tracking">
                            {data.noShows.byDay.length === 0 ? (
                                <EmptyChart label="No appointments scheduled in this period." />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.noShows.byDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12 }} />
                                        <Bar dataKey="total" fill="#163761" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="noShow" fill="#f87171" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        <ChartCard title="Lab orders by category">
                            {data.labOrders.byCategory.length === 0 ? (
                                <EmptyChart label="No lab orders recorded in this period." />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.labOrders.byCategory} layout="vertical" margin={{ left: 16 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis type="category" dataKey="category" tick={{ fill: AXIS_COLOR, fontSize: 10 }} width={90} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12 }} />
                                        <Bar dataKey="count" fill="#a78bfa" radius={[0, 3, 3, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        <ChartCard title="Top prescribed medications">
                            {data.prescriptions.topMedications.length === 0 ? (
                                <EmptyChart label="No prescriptions recorded in this period." />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.prescriptions.topMedications} layout="vertical" margin={{ left: 16 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                                        <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                                        <YAxis type="category" dataKey="medicationName" tick={{ fill: AXIS_COLOR, fontSize: 10 }} width={110} />
                                        <Tooltip contentStyle={{ background: '#0b2447', border: '1px solid #163761', fontSize: 12 }} />
                                        <Bar dataKey="count" fill="#34d399" radius={[0, 3, 3, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </div>

                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#4c6a8c' }}>
                        <BarChart2 size={12} />
                        Showing data from {new Date(data.range.from).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} to {new Date(data.range.to).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}, this facility only.
                    </p>
                </>
            )}
        </div>
    );
}
