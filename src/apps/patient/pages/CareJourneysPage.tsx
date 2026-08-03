import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
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
                        <div className="font-bold text-lg mb-1" style={{ color: 'var(--pat-text)' }}>Journey Added</div>
                        <div className="text-sm" style={{ color: 'var(--pat-muted)' }}>Saved for this session — journey syncing isn't available yet, so this won't persist after you leave the page.</div>
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
    // No backend concept for care journeys exists yet — starts empty,
    // and anything created here is local to this browser session only
    // (see the note in NewJourneyModal below).
    const [journeys, setJourneys] = useState<any[]>([]);
    const [modalTemplate, setModalTemplate] = useState<typeof JOURNEY_TEMPLATES[0] | null>(null);
    const [showBlankModal, setShowBlankModal] = useState(false);

    const handleCreate = (title: string, description: string) => {
        const newJourney = {
            id: `j_${Date.now()}`,
            patientId: user?.sub ?? '',
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
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="section-header font-display" style={{ color: 'var(--pat-text)' }}>
                        Care Journeys
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--pat-muted)' }}>
                        Organise your health records into chronic care episodes, pregnancy tracking, or treatment plans
                    </p>
                </div>
                <button
                    onClick={() => setShowBlankModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                    <Plus size={16} /> Start Custom Journey
                </button>
            </div>

            {/* Active Journeys */}
            {journeys.length > 0 && (
                <div>
                    <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--pat-muted)' }}>
                        Active Journeys ({journeys.length})
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {journeys.map(j => (
                            <div key={j.id} className="card-patient p-6 space-y-4 hover:border-emerald-300 transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: '#10b98118', color: '#10b981' }}>
                                            Active
                                        </span>
                                        <h3 className="font-bold text-lg mt-2" style={{ color: 'var(--pat-text)' }}>{j.title}</h3>
                                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--pat-muted)' }}>{j.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Templates Section */}
            <div>
                <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--pat-muted)' }}>
                    Start From a Template
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {JOURNEY_TEMPLATES.map(t => {
                        const Icon = t.icon;
                        return (
                            <div
                                key={t.id}
                                onClick={() => setModalTemplate(t)}
                                className="card-patient p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between"
                                style={{ borderColor: t.border }}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: t.bg }}>
                                            <Icon size={20} style={{ color: t.color }} />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>
                                            {t.category}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-base mb-1 group-hover:text-emerald-700 transition-colors" style={{ color: 'var(--pat-text)' }}>
                                        {t.title}
                                    </h4>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--pat-muted)' }}>
                                        {t.description}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-1" style={{ color: t.color }}>
                                    Start journey <ChevronRight size={14} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            {modalTemplate && (
                <NewJourneyModal
                    template={modalTemplate}
                    onClose={() => setModalTemplate(null)}
                    onConfirm={handleCreate}
                />
            )}

            {showBlankModal && (
                <NewJourneyModal
                    template={null}
                    onClose={() => setShowBlankModal(false)}
                    onConfirm={handleCreate}
                />
            )}
        </div>
    );
}
