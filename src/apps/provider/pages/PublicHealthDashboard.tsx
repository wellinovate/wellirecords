import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { orgApi } from '@/shared/api/orgApi';
import {
    Activity, AlertTriangle, MapPin, TrendingUp, Users,
    Droplets, Radar, DownloadCloud, ShieldCheck, Zap,
    Radio, Activity as Heartbeat, ChevronRight, BarChart2,
    ThermometerSun, Eye
} from 'lucide-react';

/* ─── Mock Maps (CSS Grid based) ─────────────────────────────────────── */
function HeatmapGrid() {
    return (
        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mt-6" style={{ background: '#07111f', border: '1px solid var(--prov-border)' }}>
            {/* Grid background */}
            <div className="absolute inset-0 z-0" style={{
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }} />

            {/* Pulsing hotspots */}
            <div className="absolute top-[30%] left-[25%] w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute top-[35%] left-[28%] w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="absolute w-full h-full rounded-full border border-red-400 animate-ping" />
            </div>

            <div className="absolute top-[60%] right-[30%] w-32 h-32 bg-amber-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[65%] right-[35%] w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="absolute w-full h-full rounded-full border border-amber-400 animate-ping" style={{ animationDelay: '1s' }} />
            </div>

            <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-emerald-500/10 rounded-full blur-lg" />

            {/* Overlay UI */}
            <div className="absolute top-3 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
                    style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8', backdropFilter: 'blur(4px)' }}>
                    <Radio size={12} className="animate-pulse" /> Live Telemetry Matrix
                </div>
            </div>

            <div className="absolute bottom-3 right-4 flex items-center gap-4 text-[10px] font-bold" style={{ color: '#7ba3c8' }}>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Outbreak Vector</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Elevated Risk</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Baseline</div>
            </div>

            {/* Scanning radar line */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, transparent, rgba(56,189,248,0.05), transparent)',
                height: '100%',
                animation: 'scan-vertical 4s linear infinite'
            }} />
            <style>{`
                @keyframes scan-vertical {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );
}

function MiniSparkline({ data, color }: { data: number[], color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 40},${16 - ((v - min) / range) * 16}`).join(' ');
    return (
        <svg width="40" height="16" className="flex-shrink-0" viewBox="0 0 40 16">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function PublicHealthDashboard() {
    const { user } = useAuth();
    const org = user?.orgId ? orgApi.getById(user.orgId) : undefined;

    // Live ticker effect
    const [tickerTick, setTickerTick] = useState(false);
    useEffect(() => {
        const int = setInterval(() => setTickerTick(v => !v), 8000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="animate-fade-in space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Radar size={22} style={{ color: '#38bdf8' }} className="animate-pulse" />
                        <h1 className="text-3xl font-black font-display tracking-tight" style={{ color: '#e2eaf4' }}>DeepSurveillance</h1>
                    </div>
                    <p className="text-sm" style={{ color: '#7ba3c8' }}>
                        Real-time epidemiological monitoring across {org?.name ?? 'connected'} network nodes.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.2)' }}>
                        <DownloadCloud size={14} /> Export Dataset
                    </button>
                    {org?.type === 'government' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>
                            <ShieldCheck size={14} /> Gov Authority Active
                        </div>
                    )}
                </div>
            </div>

            {/* ── Live Ticker Strip ── */}
            <div className="rounded-xl border flex items-center overflow-hidden h-10" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-amber-950 flex items-center gap-1.5 h-full z-10 shadow-lg">
                    <Zap size={12} fill="currentColor" /> Live Intel
                </div>
                <div className="flex-1 px-4 text-xs font-semibold whitespace-nowrap overflow-hidden relative" style={{ color: '#e2eaf4' }}>
                    <div className="absolute inset-y-0 left-4 animate-fade-in-up" key={tickerTick ? 't1' : 't2'}>
                        {tickerTick
                            ? <span><span className="text-red-400 font-bold">CRITICAL:</span> Anomalous spike in respiratory complaints localized to District 9. Initiating protocol review.</span>
                            : <span><span className="text-emerald-400 font-bold">UPDATE:</span> Supply chain payload [Artemisinin-12K] successfully arrived at central warehouse.</span>
                        }
                    </div>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Network Nodes Active', value: '1,248', desc: '+12 this week', icon: Globe, color: '#38bdf8' },
                    { label: 'Real-time Records Processed', value: '4.2M', desc: 'Zero-knowledge proofs', icon: ShieldCheck, color: '#10b981' },
                    { label: 'Outbreak Vectors Detected', value: '3', desc: 'Requires attention', icon: AlertTriangle, color: '#ef4444' },
                    { label: 'Population Health Index', value: '78.4', desc: 'Up 1.2 points vs baseline', icon: Heartbeat, color: '#a855f7' },
                ].map(s => (
                    <div key={s.label} className="card-provider p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                            <s.icon size={64} style={{ color: s.color }} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7ba3c8' }}>{s.label}</h3>
                            <div className="text-3xl font-black font-display mb-1" style={{ color: '#e2eaf4' }}>{s.value}</div>
                            <div className="text-[10px] font-semibold" style={{ color: s.color }}>{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <HeatmapGrid />

            {/* ── Data Panels ── */}
            <div className="grid lg:grid-cols-12 gap-6">

                {/* Prevalent Diagnoses (Left, 8 cols) */}
                <div className="lg:col-span-8 card-provider p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: '#7ba3c8' }}>Epidemiological Trends (30D)</h3>
                        <button className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,.05)', color: '#e2eaf4' }}>View All</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Uncomplicated Malaria', icd: 'B54', count: '14,203', trend: '+12%', trendUp: true, spark: [10, 12, 14, 18, 22, 20, 24], color: '#ef4444' },
                            { name: 'Essential Hypertension', icd: 'I10', count: '8,412', trend: '+2%', trendUp: true, spark: [15, 16, 15, 15, 16, 17, 16], color: '#f59e0b' },
                            { name: 'Upper Resp. Infection', icd: 'J06.9', count: '6,105', trend: '-8%', trendUp: false, spark: [20, 18, 15, 14, 12, 10, 8], color: '#10b981' },
                            { name: 'Type 2 Diabetes Mellitus', icd: 'E11', count: '4,890', trend: '+1%', trendUp: true, spark: [5, 5, 6, 5, 6, 5, 6], color: '#a855f7' }
                        ].map(d => (
                            <div key={d.name} className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[0.02] border border-transparent hover:border-white/5">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[10px] font-black"
                                    style={{ background: `${d.color}15`, color: d.color }}>
                                    {d.icd}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate" style={{ color: '#e2eaf4' }}>{d.name}</div>
                                    <div className="text-xs" style={{ color: '#7ba3c8' }}>{d.count} verified cases</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-black" style={{ color: d.trendUp ? (d.color === '#10b981' ? '#10b981' : '#ef4444') : '#10b981' }}>
                                            {d.trend}
                                        </div>
                                    </div>
                                    <MiniSparkline data={d.spark} color={d.color} />
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5">
                                        <ChevronRight size={14} style={{ color: '#7ba3c8' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supply Chain AI (Right, 4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="card-provider p-6 bg-gradient-to-br from-[#0a192f] to-[#07111f] border-amber-500/20">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                            <ThermometerSun size={18} style={{ color: '#f59e0b' }} className="animate-pulse" />
                            <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: '#f59e0b' }}>Supply AI Directives</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="relative pl-4 border-l-2 border-amber-500">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                <div className="font-bold text-sm mb-1" style={{ color: '#e2eaf4' }}>ACT Stock Deficit Risk</div>
                                <p className="text-xs leading-relaxed mb-2" style={{ color: '#7ba3c8' }}>
                                    Predictive models show high probability of stockout within 9 days due to compounding malaria cases in District 4.
                                </p>
                                <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: '#38bdf8' }}>
                                    Execute Reorder <ArrowRight size={10} />
                                </button>
                            </div>

                            <div className="relative pl-4 border-l-2 border-emerald-500">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="font-bold text-sm mb-1" style={{ color: '#e2eaf4' }}>Vaccine Cold-Chain Stable</div>
                                <p className="text-xs leading-relaxed" style={{ color: '#7ba3c8' }}>
                                    All 42 regional refrigeration nodes reporting optimal temperatures via IoT uplink. No action required.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full card-provider p-4 flex items-center justify-center gap-2 hover:bg-white/[0.03] transition-colors border-dashed text-sm font-bold" style={{ color: '#a855f7' }}>
                        <BarChart2 size={16} /> Open Full Analytical Studio
                    </button>
                </div>

            </div>
        </div>
    );
}

// Ensure icons used are exported or imported correctly
function Globe(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
}
function ArrowRight(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
