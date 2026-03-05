import React, { useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { vaultApi } from '@/shared/api/vaultApi';
import { HealthRecord } from '@/shared/types/types';
import {
    Search, UploadCloud, FileText, FlaskConical, ScanLine, Pill,
    Syringe, Stethoscope, X, Tag, ShieldCheck, Activity, AlertTriangle,
    DownloadCloud, HardDrive, Sparkles, Lock, ChevronRight,
} from 'lucide-react';
import { FirstRecordWizard } from '@/apps/patient/components/FirstRecordWizard';

/* ─── Icon / colour maps ───────────────────────────────────────── */
const TYPE_ICONS: Record<string, any> = {
    'Lab Result': FlaskConical,
    'Prescription': Pill,
    'Imaging': ScanLine,
    'Clinical Note': Stethoscope,
    'Vaccination': Syringe,
    'Encounter': FileText,
    'Referral': FileText,
    'Chronic Condition': Activity,
    'Allergy': AlertTriangle,
};

const TYPE_COLORS: Record<string, string> = {
    'Lab Result': '#3b82f6',
    'Prescription': '#8b5cf6',
    'Imaging': '#ec4899',
    'Clinical Note': '#1a6b42',
    'Vaccination': '#f59e0b',
    'Encounter': '#14b8a6',
    'Referral': '#6366f1',
    'Chronic Condition': '#ef4444',
    'Allergy': '#f97316',
};

const FILTER_TYPES = [
    'All', 'Lab Result', 'Prescription', 'Imaging',
    'Clinical Note', 'Vaccination', 'Chronic Condition', 'Allergy',
];

/* ─── Record-type showcase for the onboarding empty state ─────── */
const SHOWCASE_TYPES = [
    { label: 'Lab Results', icon: FlaskConical, color: '#3b82f6', example: 'Blood work, urinalysis, HIV, HBA1C…' },
    { label: 'Prescriptions', icon: Pill, color: '#8b5cf6', example: 'Current meds, refills, dosages…' },
    { label: 'Imaging', icon: ScanLine, color: '#ec4899', example: 'X-ray, MRI, CT scan reports…' },
    { label: 'Clinical Notes', icon: Stethoscope, color: '#1a6b42', example: 'Visit summaries, SOAP notes…' },
    { label: 'Vaccinations', icon: Syringe, color: '#f59e0b', example: 'Yellow fever, COVID, travel shots…' },
    { label: 'Conditions', icon: Activity, color: '#ef4444', example: 'Hypertension, diabetes, asthma…' },
];

/* ─── Main page component ─────────────────────────────────────── */
export function HealthVaultPage() {
    const { user } = useAuth();
    const records = vaultApi.getRecords(user?.userId ?? '');
    const journeys = vaultApi.getJourneys(user?.userId ?? '');
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState('All');
    const [wizardOpen, setWizardOpen] = useState(false);

    const vaultIsEmpty = records.length === 0;

    const filtered = records.filter(r => {
        const matchType = activeType === 'All' || r.type === activeType;
        const q = search.toLowerCase();
        const matchSearch = !q || r.title.toLowerCase().includes(q)
            || r.provider.toLowerCase().includes(q)
            || r.summary.toLowerCase().includes(q);
        return matchType && matchSearch;
    });

    return (
        <div className="animate-fade-in">
            {wizardOpen && <FirstRecordWizard onClose={() => setWizardOpen(false)} />}

            {/* Page header */}
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#1a2e1e' }}>Health Story</h1>
                <p className="text-sm" style={{ color: '#5a7a63' }}>
                    The complete timeline of your health journey — encrypted and owned by you
                </p>
            </div>

            {/* ─── EMPTY-VAULT STATE (zero records at all) ─────────────── */}
            {vaultIsEmpty ? (
                <VaultOnboarding onAddRecord={() => setWizardOpen(true)} />
            ) : (
                <>
                    {/* Toolbar — only shown when vault has records */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: '#9ca3af' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input input-light w-full"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Search records, providers, tags…"
                            />
                            {search && (
                                <button onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X size={14} style={{ color: '#9ca3af' }} />
                                </button>
                            )}
                        </div>
                        {/* Export is demoted to outline style & only visible with records */}
                        <button className="btn btn-patient-outline gap-2 text-sm">
                            <DownloadCloud size={15} /> Export WelliFile
                        </button>
                        <button
                            className="btn btn-patient gap-2"
                            onClick={() => setWizardOpen(true)}
                        >
                            <UploadCloud size={16} /> Upload Record
                        </button>
                    </div>

                    {/* Type filter chips */}
                    <div className="flex gap-2 flex-wrap mb-6">
                        {FILTER_TYPES.map(t => (
                            <button key={t} onClick={() => setActiveType(t)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={{
                                    background: activeType === t ? '#1a6b42' : 'rgba(26,107,66,.06)',
                                    color: activeType === t ? '#fff' : '#1a6b42',
                                    border: `1px solid ${activeType === t ? '#1a6b42' : 'rgba(26,107,66,.2)'}`,
                                }}>
                                {t}
                            </button>
                        ))}
                        <span className="ml-auto text-xs self-center" style={{ color: '#9ca3af' }}>
                            {filtered.length} records
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5"
                            style={{ background: 'var(--pat-border)' }} />

                        <div className="space-y-4 pl-14">
                            {filtered.length === 0 ? (
                                /* Search/filter returned nothing — brief message */
                                <div className="card-patient p-8 text-center">
                                    <Search size={28} className="mx-auto mb-3" style={{ color: '#c8dfd0' }} />
                                    <p className="font-semibold" style={{ color: '#5a7a63' }}>No matching records</p>
                                    <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
                                        Try a different search term or filter
                                    </p>
                                    <button onClick={() => { setSearch(''); setActiveType('All'); }}
                                        className="btn btn-patient-outline mt-4 text-sm gap-1.5">
                                        <X size={13} /> Clear filters
                                    </button>
                                </div>
                            ) : (() => {
                                // Group records by Month Year
                                const groupedRecords: Record<string, typeof filtered> = {};
                                filtered.forEach(rec => {
                                    const date = new Date(rec.date);
                                    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                    if (!groupedRecords[monthYear]) {
                                        groupedRecords[monthYear] = [];
                                    }
                                    groupedRecords[monthYear].push(rec);
                                });

                                let globalIndex = 0;

                                return Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
                                    <div key={monthYear} className="mb-10 last:mb-0 relative">
                                        {/* Date Group Header */}
                                        <div className="absolute -left-12 top-0 mt-2 bg-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap z-10 shadow-sm border"
                                            style={{ color: '#1a6b42', borderColor: 'var(--pat-border)' }}>
                                            {monthYear}
                                        </div>

                                        <div className="space-y-6 mt-10">
                                            {monthRecords.map((rec) => {
                                                const Icon = TYPE_ICONS[rec.type] ?? FileText;
                                                const color = TYPE_COLORS[rec.type] ?? '#1a6b42';
                                                const i = globalIndex++;

                                                return (
                                                    <div key={rec.id} className="relative animate-fade-in-up"
                                                        style={{ animationDelay: `${i * 60}ms` }}>
                                                        {/* Timeline dot */}
                                                        <div className="absolute -left-9 top-4 w-4 h-4 rounded-full border-2 border-white shadow z-10"
                                                            style={{ background: color }} />

                                                        <div className="card-patient p-5 cursor-pointer hover:shadow-md transition-shadow">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                                    style={{ background: `${color}15` }}>
                                                                    <Icon size={20} style={{ color }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div>
                                                                            <div className="font-bold" style={{ color: '#1a2e1e' }}>{rec.title}</div>
                                                                            <div className="text-xs mt-0.5" style={{ color: '#5a7a63' }}>
                                                                                {rec.provider} · {new Date(rec.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`badge ${rec.status === 'Verified' ? 'badge-active' : 'badge-pending'}`}>
                                                                                    {rec.status}
                                                                                </span>
                                                                                {rec.status === 'Verified' && (
                                                                                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                                                        <ShieldCheck size={12} /> WelliChain Verified
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>
                                                                                {rec.type}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm mt-3 leading-relaxed" style={{ color: '#5a7a63' }}>
                                                                        {rec.summary}
                                                                    </p>
                                                                    {rec.journeyId && (() => {
                                                                        const journey = journeys.find(j => j.id === rec.journeyId);
                                                                        if (!journey) return null;
                                                                        return (
                                                                            <div className="mt-4 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg inline-flex shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                                                style={{ background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)', color: '#10b981', border: '1px solid #10b98155' }}>
                                                                                <Activity size={14} /> Part of {journey.title}
                                                                                <ChevronRight size={14} className="ml-1 opacity-50" />
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    {rec.tags && rec.tags.length > 0 && (
                                                                        <div className="flex gap-1.5 flex-wrap mt-4">
                                                                            {rec.tags.map(tag => (
                                                                                <span key={tag} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
                                                                                    style={{ background: 'rgba(26,107,66,.06)', color: '#1a6b42' }}>
                                                                                    {tag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Onboarding empty state sub-component ───────────────────── */
function VaultOnboarding({ onAddRecord }: { onAddRecord: () => void }) {
    return (
        <div className="animate-fade-in">
            {/* Hero card */}
            <div className="rounded-3xl overflow-hidden mb-6"
                style={{ background: 'linear-gradient(135deg,#0d3d22 0%,#1a6b42 60%,#2d9d63 100%)' }}>
                <div className="px-8 py-10 relative">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                        style={{ background: '#fff', transform: 'translate(30%,-30%)' }} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                        style={{ background: '#fff', transform: 'translate(-30%,30%)' }} />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <HardDrive size={24} color="#fff" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg leading-tight">Your Vault is Empty</div>
                                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Let's build your lifetime health record
                                </div>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Your <strong style={{ color: '#fff' }}>WelliFile</strong> is a portable, encrypted container that
                            holds every piece of your medical history in one place. Unlike hospital portals that lock your
                            data away, your WelliFile belongs <em>only to you</em>.
                        </p>

                        {/* Primary CTA */}
                        <button
                            onClick={onAddRecord}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                            style={{
                                background: '#fff',
                                color: '#1a6b42',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            }}
                        >
                            <UploadCloud size={18} />
                            Upload My First Record
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* "What to add" grid */}
            <div className="mb-6">
                <h2 className="font-bold text-sm mb-3" style={{ color: '#1a2e1e' }}>
                    What kinds of records can you store?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SHOWCASE_TYPES.map(({ label, icon: Icon, color, example }) => (
                        <div key={label} className="card-patient p-4 cursor-pointer hover:shadow-md transition-all"
                            onClick={onAddRecord}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: `${color}15` }}>
                                <Icon size={18} style={{ color }} />
                            </div>
                            <div className="font-semibold text-sm mb-1" style={{ color: '#1a2e1e' }}>{label}</div>
                            <div className="text-xs leading-tight" style={{ color: '#9ca3af' }}>{example}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { icon: Lock, color: '#1a6b42', title: 'End-to-end Encrypted', body: 'Only you hold the keys to your data' },
                    { icon: ShieldCheck, color: '#3b82f6', title: 'WelliChain Verified', body: 'Every record is tamper-proof on the blockchain' },
                    { icon: Sparkles, color: '#8b5cf6', title: 'Share in Seconds', body: 'Send any record to a provider via QR' },
                ].map(({ icon: Icon, color, title, body }) => (
                    <div key={title} className="flex items-start gap-3 p-4 rounded-2xl"
                        style={{ background: `${color}07`, border: `1px solid ${color}18` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${color}15` }}>
                            <Icon size={15} style={{ color }} />
                        </div>
                        <div>
                            <div className="font-bold text-xs mb-0.5" style={{ color: '#1a2e1e' }}>{title}</div>
                            <div className="text-xs leading-tight" style={{ color: '#6b7280' }}>{body}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
