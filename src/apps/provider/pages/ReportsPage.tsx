import React, { useState } from 'react';
import { BarChart2, Download, FileText } from 'lucide-react';

type ReportType = 'clinical' | 'operational';

const CLINICAL_DATA = [
    { label: 'Consultations', values: [42, 38, 51, 47, 55, 49, 62] },
    { label: 'Lab Orders', values: [18, 22, 28, 25, 30, 27, 35] },
    { label: 'Prescriptions', values: [30, 28, 36, 34, 40, 37, 44] },
];

const OPS_DATA = [
    { label: 'Appointments', values: [60, 55, 68, 72, 65, 78, 82] },
    { label: 'No-Shows', values: [8, 10, 7, 12, 9, 6, 8] },
    { label: 'Avg Wait (min)', values: [18, 22, 15, 25, 20, 17, 14] },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#0d9488', '#38bdf8', '#a78bfa'];

function MiniBarChart({ series }: { series: { label: string; values: number[] }[] }) {
    const allVals = series.flatMap(s => s.values);
    const maxVal = Math.max(...allVals);
    return (
        <div className="space-y-4">
            {series.map((s, si) => (
                <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[si] }} />
                            <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{s.label}</span>
                        </div>
                        <span className="text-xs font-black" style={{ color: '#e2e8f0' }}>
                            {s.values.reduce((a, b) => a + b, 0)} total
                        </span>
                    </div>
                    <div className="flex items-end gap-1 h-14">
                        {s.values.map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                <div className="w-full rounded-t-sm" style={{ height: `${(v / maxVal) * 100}%`, background: COLORS[si], opacity: 0.8 }} />
                                <span className="text-[8px]" style={{ color: '#4b5563' }}>{DAYS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ReportsPage() {
    const [type, setType] = useState<ReportType>('clinical');
    const [from, setFrom] = useState('2026-02-25');
    const [to, setTo] = useState('2026-03-03');

    const data = type === 'clinical' ? CLINICAL_DATA : OPS_DATA;

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>Reports</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Clinical and operational performance for your facility.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {([['clinical', 'Clinical'], ['operational', 'Operational']] as const).map(([k, l]) => (
                        <button key={k} onClick={() => setType(k)}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                            style={{ background: type === k ? 'rgba(13,148,136,0.2)' : 'transparent', color: type === k ? '#0d9488' : '#64748b' }}>
                            {l}
                        </button>
                    ))}
                </div>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }} />
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }} />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                    <Download size={14} /> Export CSV
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                    <FileText size={14} /> Export PDF
                </button>
            </div>

            {/* Chart */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-5">
                    <BarChart2 size={16} style={{ color: '#0d9488' }} />
                    <span className="font-bold text-sm" style={{ color: '#e2e8f0' }}>
                        {type === 'clinical' ? 'Clinical Activity' : 'Operational Metrics'} — Last 7 Days
                    </span>
                </div>
                <MiniBarChart series={data} />
            </div>

            {/* Summary table */}
            <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>Metric</th>
                            {DAYS.map(d => <th key={d} className="px-3 py-3 text-center text-[11px] font-bold uppercase" style={{ color: '#4b5563' }}>{d}</th>)}
                            <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        {data.map((s, si) => (
                            <tr key={s.label}>
                                <td className="px-4 py-3 text-xs font-semibold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[si] }} /> {s.label}
                                </td>
                                {s.values.map((v, i) => (
                                    <td key={i} className="px-3 py-3 text-center text-xs" style={{ color: '#9ca3af' }}>{v}</td>
                                ))}
                                <td className="px-4 py-3 text-right text-xs font-black" style={{ color: '#e2e8f0' }}>
                                    {s.values.reduce((a, b) => a + b, 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
