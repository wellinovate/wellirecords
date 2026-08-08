import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dependantApi, DependantResponseData } from '@/shared/api/dependantApi';
import {
    ArrowLeft, Baby, Shield, QrCode,
    Syringe, Scale, HeartPulse, AlertCircle,
    ClipboardList, Loader2
} from 'lucide-react';

// ─── Reusable sub-components ───────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
            <div className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
                <Icon size={16} style={{ color: 'var(--pat-primary)' }} />
                <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--pat-primary)', letterSpacing: '0.08em' }}>{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--pat-border)' }}>
            <span className="text-sm" style={{ color: 'var(--pat-muted)' }}>{label}</span>
            <span className="text-sm font-semibold text-right ml-4" style={{ color: 'var(--pat-text)' }}>{value}</span>
        </div>
    );
}

function NotAvailableYet({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--pat-border)', background: 'var(--pat-bg)' }}>
            <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>{label} isn&apos;t available yet for family profiles.</p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

type TabId = 'medical' | 'vaccines' | 'growth' | 'emergency';

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
    { id: 'medical', icon: ClipboardList, label: 'Medical History' },
    { id: 'vaccines', icon: Syringe, label: 'Vaccinations' },
    { id: 'growth', icon: Scale, label: 'Growth Chart' },
    { id: 'emergency', icon: QrCode, label: 'Emergency Profile' },
];

export function ChildProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [child, setChild] = useState<DependantResponseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('medical');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        dependantApi.getDependant(id)
            .then((data) => setChild(data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--pat-primary)' }} />
            </div>
        );
    }

    if (notFound || !child) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
                <AlertCircle size={48} className="text-red-400" />
                <h2 className="text-xl font-bold" style={{ color: 'var(--pat-text)' }}>Child record not found</h2>
                <button
                    onClick={() => navigate('/patient/dependants')}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--pat-primary)' }}
                >
                    Back to Dependants
                </button>
            </div>
        );
    }

    const ageYears = new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear();
    const avatar = child.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(child.fullName)}&backgroundColor=b6e3f4&radius=12`;

    return (
        <div className="animate-fade-in pb-16 space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/patient/dependants')}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                    style={{ color: 'var(--pat-text)' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-display font-bold text-2xl leading-tight truncate" style={{ color: 'var(--pat-text)' }}>
                        {child.fullName}&apos;s Health Record
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--pat-muted)' }}>
                        <Shield size={13} style={{ color: 'var(--pat-primary)', flexShrink: 0 }} />
                        <span>WelliRecord ID: <strong style={{ color: 'var(--pat-text)' }}>{child.wrId || 'Pending'}</strong></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ───────── LEFT SIDEBAR ───────── */}
                <div className="space-y-6">
                    <SectionCard title="Child Profile" icon={Baby}>
                        <div className="flex flex-col items-center text-center mb-6 pb-6 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                            <div className="relative mb-4">
                                <img
                                    src={avatar}
                                    alt={child.fullName}
                                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4"
                                    style={{ borderColor: 'white' }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.fullName)}&background=041E42&color=fff&size=150`; }}
                                />
                                <div
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 shadow"
                                    style={{ background: 'var(--pat-primary)', borderColor: 'white' }}
                                >
                                    <Baby size={14} />
                                </div>
                            </div>
                            <h2 className="font-bold text-lg" style={{ color: 'var(--pat-text)' }}>{child.fullName}</h2>
                            <span className="mt-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(4,30,66,0.07)', color: 'var(--pat-primary)' }}>
                                {child.gender || 'Not set'} &bull; {ageYears} years old
                            </span>
                        </div>

                        <div className="space-y-0">
                            <InfoRow label="Date of Birth" value={new Date(child.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            <InfoRow
                                label="Blood Group"
                                value={child.bloodGroup ? `${child.bloodGroup} (self-reported)` : 'Not on file'}
                            />
                            <InfoRow
                                label="Genotype"
                                value={child.genotype ? `${child.genotype} (self-reported)` : 'Not on file'}
                            />
                        </div>
                        <p className="text-xs mt-4" style={{ color: 'var(--pat-muted)' }}>
                            Blood group and genotype are self-reported by the parent, not clinically verified.
                            Lab results take priority when they exist on file.
                        </p>
                    </SectionCard>
                </div>

                {/* ───────── MAIN CONTENT ───────── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors"
                                style={activeTab === tab.id
                                    ? { background: 'var(--pat-primary)', color: 'white' }
                                    : { background: 'var(--pat-bg)', color: 'var(--pat-muted)', border: '1px solid var(--pat-border)' }}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'medical' && (
                        <SectionCard title="Medical History" icon={ClipboardList}>
                            <NotAvailableYet label="Allergy, medication, and diagnosis records for family profiles" />
                        </SectionCard>
                    )}

                    {activeTab === 'vaccines' && (
                        <SectionCard title="Vaccinations" icon={Syringe}>
                            <NotAvailableYet label="Vaccination tracking" />
                        </SectionCard>
                    )}

                    {activeTab === 'growth' && (
                        <SectionCard title="Growth Chart" icon={Scale}>
                            <NotAvailableYet label="Growth tracking" />
                        </SectionCard>
                    )}

                    {activeTab === 'emergency' && (
                        <SectionCard title="Emergency Profile" icon={HeartPulse}>
                            <NotAvailableYet label="Emergency QR access for family profiles" />
                        </SectionCard>
                    )}
                </div>
            </div>
        </div>
    );
}
