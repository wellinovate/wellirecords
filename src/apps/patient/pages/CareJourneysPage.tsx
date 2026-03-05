import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { vaultApi } from '@/shared/api/vaultApi';
import {
    Activity, ChevronRight, Heart, Baby, Stethoscope, AlertCircle,
    Pill, Plus, X, CheckCircle, Sparkles
} from 'lucide-react';

const JOURNEY_TEMPLATES = [
    { id: 'tpl_htn', title: 'Hypertension Management', category: 'Cardiovascular', description: 'Group your BP readings, Lisinopril prescriptions, and cardiology follow-ups.', icon: Heart, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    { id: 'tpl_dm', title: 'Diabetes Care', category: 'Metabolic', description: 'Track HbA1c labs, Metformin refills, dietary notes, and glucose trends over time.', icon: Activity, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    { id: 'tpl_malaria', title: 'Malaria Treatment', category: 'Infectious', description: 'Log RDT results, anti-malarial prescriptions, and follow-up treatment episodes.', icon: AlertCircle, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    { id: 'tpl_preg', title: 'Prenatal Health', category: 'Reproductive', description: 'Organise ante-natal visits, obstetric scans, maternal blood work, and delivery notes.', icon: Baby, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    { id: 'tpl_chronic', title: 'Chronic Medication', category: 'Medication', description: 'Track long-term prescriptions, dispensing history, and refill schedules.', icon: Pill, color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
    { id: 'tpl_specialist', title: 'Specialist Referral', category: 'Referral', description: 'Bundle all records for a referral — from the initial note to specialist follow-ups.', icon: Stethoscope, color: '#1a6b42', bg: '#f0fdf4', border: '#bbf7d0' },
];


interface NewJourneyModalProps {
    template: typeof JOURNEY_TEMPLATES[0] | null;
    onClose: () => void;
    onConfirm: (title: string, description: string) => void;
}

function NewJourneyModal({ template, onClose, onConfirm }: NewJourneyModalProps) {
    const [title, setTitle] = useState(template?.title ?? '');
    const [description, setDescription] = useState(template?.description ?? '');
    const [saved, setSaved] = useState(false);

    const handleConfirm = () => {
        if (!title.trim()) return;
        setSaved(true);
        setTimeout(() => { onConfirm(title, description); }, 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)' }}>
            <div className="rounded-3xl w-full max-w-md p-7 animate-fade-in-up shadow-2xl" style={{ background: 'var(--pat-surface)' }}>
                {saved ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: '#10b98120' }}>
                            <CheckCircle size={32} style={{ color: '#10b981' }} />
                        </div>
                        <div className="font-bold text-lg mb-1" style={{ color: 'var(--pat-text)' }}>Journey Created!</div>
                        <div className="text-sm" style={{ color: 'var(--pat-muted)' }}>Your journey is now active</div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                {template && (
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${template.color}18` }}>
                                        <template.icon size={20} style={{ color: template.color }} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-display font-bold text-lg" style={{ color: 'var(--pat-text)' }}>
                                        {template ? 'Start This Journey' : 'New Journey'}
                                    </h3>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--pat-muted)' }}>Customise and activate</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <X size={16} style={{ color: 'var(--pat-muted)' }} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--pat-text)' }}>Journey Name</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="input input-light w-full"
                                    placeholder="e.g. Hypertension Management"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--pat-text)' }}>Description <span className="font-normal text-xs" style={{ color: 'var(--pat-muted)' }}>(optional)</span></label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="input input-light w-full resize-none"
                                    placeholder="What will this journey track?"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.15)' }}>
                                <Sparkles size={12} style={{ color: '#a855f7' }} />
                                <span style={{ color: '#a855f7' }}>WelliMate™ will automatically tag matching records to this journey</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-sm border transition-colors" style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-muted)' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!title.trim()}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
                                style={{ background: template?.color ?? 'var(--pat-primary)' }}
                            >
                                Start Journey
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function CareJourneysPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [journeys, setJourneys] = useState(vaultApi.getJourneys(user?.userId ?? 'pat_001'));
    const [modalTemplate, setModalTemplate] = useState<typeof JOURNEY_TEMPLATES[0] | null>(null);
    const [showBlankModal, setShowBlankModal] = useState(false);

    const handleCreate = (title: string, description: string) => {
        const newJourney = {
            id: `j_${Date.now()}`,
            patientId: user?.userId ?? 'pat_001',
            title,
            description,
            status: 'active' as const,
            startDate: new Date().toISOString(),
            recordIds: [],
        };
        setJourneys(prev => [newJourney, ...prev]);
        setModalTemplate(null);
        setShowBlankModal(false);
    };

    return (
        <div className="animate-fade-in space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                <div>
                    <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--pat-text)' }}>Care Journeys</h1>
                    <p className="text-sm max-w-xl" style={{ color: 'var(--pat-muted)' }}>
                        Track your hypertension treatment, diabetes management, or pregnancy — all in one place.
                    </p>
                </div>
                <button
                    onClick={() => setShowBlankModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:-translate-y-0.5 transition-all"
                    style={{ background: 'var(--pat-primary)' }}
                >
                    <Plus size={16} /> New Journey
                </button>
            </div>

            {/* Active journeys */}
            {journeys.length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--pat-muted)' }}>Your Active Journeys</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {journeys.map(journey => (
                            <div
                                key={journey.id}
                                className="group rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden p-6 cursor-pointer"
                                style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}
                                onClick={() => navigate('/patient/vault')}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,107,66,.1)', color: 'var(--pat-primary)' }}>
                                            <Stethoscope size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base" style={{ color: 'var(--pat-text)' }}>{journey.title}</h3>
                                            <div className="text-xs mt-0.5" style={{ color: 'var(--pat-muted)' }}>
                                                Since {new Date(journey.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981' }}>
                                        {journey.status}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--pat-muted)' }}>{journey.description}</p>
                                <div className="flex items-center justify-end pt-4 border-t" style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-primary)' }}>
                                    <span className="text-xs font-semibold flex items-center gap-1.5 group-hover:underline">
                                        View in Health Vault <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state — compact inline prompt, not a full-height hero */}
            {journeys.length === 0 && (
                <div className="flex items-center gap-5 px-6 py-5 rounded-2xl" style={{ background: 'linear-gradient(135deg,#0d3d22,#1a6b42)', minHeight: 0 }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,.14)' }}>
                        <Activity size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm">No journeys yet</div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.7)' }}>Pick a template below or start a blank one — records get tagged automatically.</div>
                    </div>
                    <button
                        onClick={() => setShowBlankModal(true)}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all hover:-translate-y-0.5"
                        style={{ background: '#fff', color: '#1a6b42' }}
                    >
                        <Plus size={13} /> Blank Journey
                    </button>
                </div>
            )}

            {/* Templates — always shown */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--pat-muted)' }}>Start from a template</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        {['Cardiovascular', 'Metabolic', 'Infectious', 'Reproductive', 'Medication', 'Referral'].map(cat => (
                            <span key={cat} className="text-[10px] font-semibold" style={{ color: 'var(--pat-muted)' }}>
                                ● {cat}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {JOURNEY_TEMPLATES.map(t => (
                        <div
                            key={t.id}
                            className="group rounded-2xl border p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col"
                            style={{ background: t.bg, borderColor: t.border }}
                        >
                            <div className="flex items-start gap-3 mb-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}22` }}>
                                    <t.icon size={18} style={{ color: t.color }} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-sm leading-tight" style={{ color: '#1a2e1e' }}>{t.title}</div>
                                    <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: t.color }}>{t.category}</div>
                                </div>
                            </div>
                            <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: '#6b7280' }}>{t.description}</p>
                            <button
                                onClick={() => setModalTemplate(t)}
                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all hover:brightness-95"
                                style={{ background: t.color, color: '#fff' }}
                            >
                                Use this template <ChevronRight size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {(modalTemplate || showBlankModal) && (
                <NewJourneyModal
                    template={modalTemplate}
                    onClose={() => { setModalTemplate(null); setShowBlankModal(false); }}
                    onConfirm={handleCreate}
                />
            )}
        </div>
    );
}
