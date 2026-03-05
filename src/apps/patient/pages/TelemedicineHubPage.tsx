import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { teleMedApi } from '@/shared/api/teleMedApi';
import {
    Video, Pill, Activity, Calendar, Clock, ChevronRight, Plus,
    Shield, CheckCircle, AlertTriangle, Zap, Wifi, Heart, Droplets,
    QrCode, Truck, FileText, Brain, Sparkles, X, Stethoscope,
    Mic, Monitor, Search, Baby, Bone, Ear, Scan, Syringe,
    Users
} from 'lucide-react';

/* ── Specialty Pills ─────────────────────────────────────────────────── */
const SPECIALTY_PILLS = [
    { id: 'all', label: 'All Doctors', icon: Users, color: '#1a6b42' },
    { id: 'gp', label: 'General Practice', icon: Stethoscope, color: '#1a6b42' },
    { id: 'card', label: 'Cardiology', icon: Heart, color: '#ef4444' },
    { id: 'paed', label: 'Paediatrics', icon: Baby, color: '#f59e0b' },
    { id: 'obgyn', label: 'Obs & Gynae', icon: Activity, color: '#8b5cf6' },
    { id: 'surg', label: 'General Surgery', icon: Syringe, color: '#64748b' },
    { id: 'neuro', label: 'Neurology', icon: Brain, color: '#6366f1' },
    { id: 'derm', label: 'Dermatology', icon: Scan, color: '#ec4899' },
    { id: 'psych', label: 'Psychiatry', icon: Brain, color: '#0ea5e9' },
    { id: 'ortho', label: 'Orthopaedics', icon: Bone, color: '#f97316' },
    { id: 'ent', label: 'ENT', icon: Ear, color: '#14b8a6' },
    { id: 'oph', label: 'Ophthalmology', icon: Scan, color: '#0d9488' },
    { id: 'uro', label: 'Urology', icon: Activity, color: '#7c3aed' },
];

/* ── Mock Doctor Data ─────────────────────────────────────────────────── */
const DOCTORS = [
    { id: 'd1', name: 'Dr. Sola Martins', specialty: 'General Practice', specialtyId: 'gp', initials: 'SM', avatarBg: '#1a6b42', experience: 11, nextSlot: 'Today, 2:00 PM', fee: '₦8,000', rating: 4.9, reviews: 214, verified: true, online: true },
    { id: 'd2', name: 'Dr. Fatima Aliyu', specialty: 'Cardiology', specialtyId: 'card', initials: 'FA', avatarBg: '#ef4444', experience: 17, nextSlot: 'Today, 4:30 PM', fee: '₦25,000', rating: 4.8, reviews: 189, verified: true, online: true },
    { id: 'd3', name: 'Dr. Chidi Obi', specialty: 'Paediatrics', specialtyId: 'paed', initials: 'CO', avatarBg: '#f59e0b', experience: 9, nextSlot: 'Tomorrow, 10:00 AM', fee: '₦15,000', rating: 4.9, reviews: 302, verified: true, online: false },
    { id: 'd4', name: 'Dr. Ngozi Okafor', specialty: 'Obs & Gynae', specialtyId: 'obgyn', initials: 'NO', avatarBg: '#8b5cf6', experience: 14, nextSlot: 'Today, 3:00 PM', fee: '₦20,000', rating: 4.7, reviews: 156, verified: true, online: true },
    { id: 'd5', name: 'Dr. Emeka Nwosu', specialty: 'General Practice', specialtyId: 'gp', initials: 'EN', avatarBg: '#059669', experience: 6, nextSlot: 'Today, 5:00 PM', fee: '₦8,000', rating: 4.6, reviews: 98, verified: true, online: true },
    { id: 'd6', name: 'Dr. Tunde Ifeanyi', specialty: 'Psychiatry', specialtyId: 'psych', initials: 'TI', avatarBg: '#0ea5e9', experience: 12, nextSlot: 'Tomorrow, 9:00 AM', fee: '₦22,000', rating: 4.8, reviews: 73, verified: true, online: false },
    { id: 'd7', name: 'Dr. Lara Adisa', specialty: 'Dermatology', specialtyId: 'derm', initials: 'LA', avatarBg: '#ec4899', experience: 8, nextSlot: 'Today, 6:00 PM', fee: '₦18,000', rating: 4.7, reviews: 127, verified: true, online: true },
    { id: 'd8', name: 'Dr. Yemi Adeyemi', specialty: 'Cardiology', specialtyId: 'card', initials: 'YA', avatarBg: '#dc2626', experience: 21, nextSlot: 'Tomorrow, 11:00 AM', fee: '₦28,000', rating: 5.0, reviews: 441, verified: true, online: false },
    { id: 'd9', name: 'Dr. Seun Lawal', specialty: 'Orthopaedics', specialtyId: 'ortho', initials: 'SL', avatarBg: '#f97316', experience: 15, nextSlot: 'Today, 3:30 PM', fee: '₦28,000', rating: 4.8, reviews: 88, verified: true, online: true },
    { id: 'd10', name: 'Dr. Aisha Bello', specialty: 'Obs & Gynae', specialtyId: 'obgyn', initials: 'AB', avatarBg: '#7c3aed', experience: 10, nextSlot: 'Tomorrow, 2:00 PM', fee: '₦20,000', rating: 4.6, reviews: 112, verified: true, online: false },
    { id: 'd11', name: 'Dr. Chukwu Obi', specialty: 'Neurology', specialtyId: 'neuro', initials: 'CB', avatarBg: '#6366f1', experience: 13, nextSlot: 'Tomorrow, 1:00 PM', fee: '₦30,000', rating: 4.9, reviews: 64, verified: true, online: false },
    { id: 'd12', name: 'Dr. Funmi Hassan', specialty: 'ENT', specialtyId: 'ent', initials: 'FH', avatarBg: '#14b8a6', experience: 7, nextSlot: 'Today, 4:00 PM', fee: '₦16,000', rating: 4.7, reviews: 91, verified: true, online: true },
];

/* ── Doctor Marketplace Component ────────────────────────────────────── */
function SpecialtyDiscovery({ onBook, onSymptomCheck }: { onBook: (specialty: string) => void; onSymptomCheck: () => void }) {
    const [query, setQuery] = useState('');
    const [activeSpecialty, setActiveSpecialty] = useState('all');

    const filtered = useMemo(() => {
        let docs = DOCTORS;
        if (activeSpecialty !== 'all') docs = docs.filter(d => d.specialtyId === activeSpecialty);
        if (query.trim()) {
            const q = query.toLowerCase();
            docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q));
        }
        return docs;
    }, [query, activeSpecialty]);

    return (
        <div className="space-y-5">
            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--pat-muted)' }} />
                <input
                    type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by doctor name or symptom — e.g. 'chest pain', 'Dr. Fatima'…"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none"
                    style={{ background: 'var(--pat-surface)', borderColor: query ? 'var(--pat-primary)' : 'var(--pat-border)', color: 'var(--pat-text)' }}
                />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--pat-border)' }}>
                        <X size={12} style={{ color: 'var(--pat-muted)' }} />
                    </button>
                )}
            </div>

            {/* Specialty filter pills — horizontally scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' as any }}>
                {SPECIALTY_PILLS.map(sp => {
                    const Icon = sp.icon;
                    const active = activeSpecialty === sp.id;
                    return (
                        <button key={sp.id} onClick={() => setActiveSpecialty(sp.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border"
                            style={{ background: active ? sp.color : 'var(--pat-surface)', borderColor: active ? sp.color : 'var(--pat-border)', color: active ? '#fff' : 'var(--pat-muted)' }}
                        >
                            <Icon size={12} />{sp.label}
                        </button>
                    );
                })}
            </div>

            {/* Results count + AI triage */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--pat-muted)' }}>
                    {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} available
                </span>
                <button onClick={onSymptomCheck} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: '#a855f715', color: '#a855f7' }}>
                    <Brain size={12} /> Not sure? AI Triage
                </button>
            </div>

            {/* Doctor cards */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(doc => {
                        const pillColor = SPECIALTY_PILLS.find(p => p.id === doc.specialtyId)?.color ?? '#1a6b42';
                        return (
                            <div key={doc.id} className="rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                                {/* Avatar + identity */}
                                <div className="flex items-start gap-3">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white" style={{ background: `linear-gradient(135deg,${doc.avatarBg}cc,${doc.avatarBg})` }}>
                                            {doc.initials}
                                        </div>
                                        {doc.online && <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2" style={{ background: '#10b981', borderColor: 'var(--pat-surface)' }} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-sm truncate" style={{ color: 'var(--pat-text)' }}>{doc.name}</span>
                                            {doc.verified && <CheckCircle size={13} style={{ color: '#1a6b42', flexShrink: 0 }} />}
                                        </div>
                                        <div className="text-xs font-semibold mt-0.5" style={{ color: pillColor }}>{doc.specialty}</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs font-black" style={{ color: '#f59e0b' }}>{'★'.repeat(Math.floor(doc.rating))}</span>
                                            <span className="text-xs font-bold" style={{ color: 'var(--pat-text)' }}>{doc.rating}</span>
                                            <span className="text-xs" style={{ color: 'var(--pat-muted)' }}>({doc.reviews})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-xl px-3 py-2" style={{ background: 'var(--pat-bg)' }}>
                                        <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'var(--pat-muted)' }}>Experience</div>
                                        <div className="text-sm font-black" style={{ color: 'var(--pat-text)' }}>{doc.experience} yrs</div>
                                    </div>
                                    <div className="rounded-xl px-3 py-2" style={{ background: 'var(--pat-bg)' }}>
                                        <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'var(--pat-muted)' }}>Consult Fee</div>
                                        <div className="text-sm font-black" style={{ color: pillColor }}>{doc.fee}</div>
                                    </div>
                                </div>

                                {/* Next slot */}
                                <div className="flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2.5" style={{ background: `${pillColor}10`, color: pillColor }}>
                                    <Clock size={12} /> Next: {doc.nextSlot}
                                </div>

                                {/* Book CTA */}
                                <button onClick={() => onBook(doc.specialty)} className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ background: pillColor }}>
                                    Book Consultation
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border p-10 text-center" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                    <Brain size={28} className="mx-auto mb-3" style={{ color: 'var(--pat-muted)' }} />
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--pat-text)' }}>No doctors matched</p>
                    <p className="text-xs mb-4" style={{ color: 'var(--pat-muted)' }}>Clear the filter or let our AI route you to the right specialist.</p>
                    <button onClick={onSymptomCheck} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm mx-auto" style={{ background: 'var(--pat-primary)', color: '#fff' }}>
                        <Brain size={15} /> Run AI Symptom Check
                    </button>
                </div>
            )}
        </div>
    );
}



/* ── Modal Provider Data (richer than the page grid) ─────────────────── */
const MODAL_SPECIALTIES = [
    { id: 'gp', label: 'General Practice', color: '#1a6b42', fee: '₦8,000' },
    { id: 'card', label: 'Cardiology', color: '#ef4444', fee: '₦25,000' },
    { id: 'obgyn', label: 'OB/GYN', color: '#8b5cf6', fee: '₦20,000' },
    { id: 'paed', label: 'Paediatrics', color: '#f59e0b', fee: '₦15,000' },
    { id: 'psych', label: 'Psychiatry', color: '#0ea5e9', fee: '₦22,000' },
    { id: 'derm', label: 'Dermatology', color: '#ec4899', fee: '₦18,000' },
    { id: 'neuro', label: 'Neurology', color: '#6366f1', fee: '₦30,000' },
    { id: 'physio', label: 'Physiotherapy', color: '#14b8a6', fee: '₦12,000' },
];

const MODAL_PROVIDERS: Record<string, Array<{
    name: string; initials: string; avatarBg: string; rating: number; reviews: number;
    experience: number; fee: string; languages: string[]; nextSlot: string;
}>> = {
    'General Practice': [
        { name: 'Dr. Sola Martins', initials: 'SM', avatarBg: '#1a6b42', rating: 4.9, reviews: 214, experience: 11, fee: '₦8,000', languages: ['English', 'Yoruba'], nextSlot: 'Today, 2:00 PM' },
        { name: 'Dr. Emeka Nwosu', initials: 'EN', avatarBg: '#059669', rating: 4.6, reviews: 98, experience: 6, fee: '₦8,000', languages: ['English', 'Igbo'], nextSlot: 'Today, 5:00 PM' },
    ],
    'Cardiology': [
        { name: 'Dr. Fatima Aliyu', initials: 'FA', avatarBg: '#ef4444', rating: 4.8, reviews: 189, experience: 17, fee: '₦25,000', languages: ['English', 'Hausa'], nextSlot: 'Today, 4:30 PM' },
        { name: 'Dr. Yemi Adeyemi', initials: 'YA', avatarBg: '#dc2626', rating: 5.0, reviews: 441, experience: 21, fee: '₦28,000', languages: ['English', 'Yoruba'], nextSlot: 'Tomorrow, 11:00 AM' },
    ],
    'OB/GYN': [
        { name: 'Dr. Ngozi Okafor', initials: 'NO', avatarBg: '#8b5cf6', rating: 4.7, reviews: 156, experience: 14, fee: '₦20,000', languages: ['English', 'Igbo'], nextSlot: 'Today, 3:00 PM' },
        { name: 'Dr. Aisha Bello', initials: 'AB', avatarBg: '#7c3aed', rating: 4.6, reviews: 112, experience: 10, fee: '₦20,000', languages: ['English', 'Hausa'], nextSlot: 'Tomorrow, 2:00 PM' },
    ],
    'Paediatrics': [
        { name: 'Dr. Chidi Obi', initials: 'CO', avatarBg: '#f59e0b', rating: 4.9, reviews: 302, experience: 9, fee: '₦15,000', languages: ['English', 'Igbo'], nextSlot: 'Tomorrow, 10:00 AM' },
        { name: 'Dr. Funmi Hassan', initials: 'FH', avatarBg: '#d97706', rating: 4.7, reviews: 91, experience: 7, fee: '₦15,000', languages: ['English', 'Yoruba'], nextSlot: 'Today, 4:00 PM' },
    ],
    'Psychiatry': [
        { name: 'Dr. Tunde Ifeanyi', initials: 'TI', avatarBg: '#0ea5e9', rating: 4.8, reviews: 73, experience: 12, fee: '₦22,000', languages: ['English', 'Yoruba'], nextSlot: 'Tomorrow, 9:00 AM' },
    ],
    'Dermatology': [
        { name: 'Dr. Lara Adisa', initials: 'LA', avatarBg: '#ec4899', rating: 4.7, reviews: 127, experience: 8, fee: '₦18,000', languages: ['English', 'Yoruba'], nextSlot: 'Today, 6:00 PM' },
    ],
    'Neurology': [
        { name: 'Dr. Chukwu Obi', initials: 'CB', avatarBg: '#6366f1', rating: 4.9, reviews: 64, experience: 13, fee: '₦30,000', languages: ['English', 'Igbo'], nextSlot: 'Tomorrow, 1:00 PM' },
    ],
    'Physiotherapy': [
        { name: 'Dr. Seun Lawal', initials: 'SL', avatarBg: '#14b8a6', rating: 4.5, reviews: 52, experience: 5, fee: '₦12,000', languages: ['English', 'Yoruba'], nextSlot: 'Today, 3:30 PM' },
    ],
};

const TIME_SLOTS_WAIT = [
    { time: '09:00 AM', wait: '~5 min' }, { time: '10:00 AM', wait: '~12 min' },
    { time: '11:30 AM', wait: '~8 min' }, { time: '02:00 PM', wait: '~3 min' },
    { time: '03:30 PM', wait: '~20 min' }, { time: '04:00 PM', wait: '~7 min' },
];

function BookConsultModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);
    const [specialty, setSpecialty] = useState('');
    const [providerName, setProviderName] = useState('');
    const [mode, setMode] = useState<'video' | 'audio' | 'chat'>('video');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [consent, setConsent] = useState(false);
    const [done, setDone] = useState(false);

    const specialtyMeta = MODAL_SPECIALTIES.find(s => s.label === specialty);
    const accentColor = specialtyMeta?.color ?? 'var(--pat-primary)';
    const availableProviders = specialty ? (MODAL_PROVIDERS[specialty] ?? []) : [];
    const selectedProvider = availableProviders.find(p => p.name === providerName);
    const canConfirm = !!time && consent;

    const confirm = () => { setDone(true); setTimeout(onClose, 1800); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)' }}>
            <div className="rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up overflow-hidden" style={{ background: 'var(--pat-surface)' }}>
                {done ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5" style={{ background: '#10b98118' }}>
                            <CheckCircle size={38} style={{ color: '#10b981' }} />
                        </div>
                        <div className="font-display font-bold text-xl mb-1" style={{ color: 'var(--pat-text)' }}>Consultation Booked!</div>
                        <div className="text-sm mb-4" style={{ color: 'var(--pat-muted)' }}>A calendar invite and confirmation have been sent to your profile.</div>
                        <div className="flex items-center gap-2 justify-center text-xs font-semibold px-4 py-2 rounded-xl mx-auto w-fit" style={{ background: '#a855f712', color: '#a855f7' }}>
                            <Brain size={13} /> Your records will be shared securely with {providerName}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Accent top bar */}
                        <div className="h-1 w-full transition-all duration-500" style={{ background: accentColor }} />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                            <div>
                                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--pat-text)' }}>Book a Consultation</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--pat-muted)' }}>
                                    {step === 0 ? 'Step 1 of 3 — Choose specialty' : step === 1 ? 'Step 2 of 3 — Choose your doctor' : 'Step 3 of 3 — Schedule & confirm'}
                                </p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"><X size={16} /></button>
                        </div>

                        {/* Progress bar */}
                        <div className="px-6 pt-4">
                            <div className="h-1.5 rounded-full" style={{ background: 'var(--pat-border)' }}>
                                <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%`, background: accentColor }} />
                            </div>
                        </div>

                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

                            {/* ── Step 0: Specialty ── */}
                            {step === 0 && (
                                <div>
                                    <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--pat-text)' }}>What type of doctor do you need?</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {MODAL_SPECIALTIES.map(s => {
                                            const selected = specialty === s.label;
                                            return (
                                                <button key={s.id} onClick={() => { setSpecialty(s.label); setProviderName(''); }}
                                                    className="flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all"
                                                    style={{ borderColor: selected ? s.color : 'var(--pat-border)', background: selected ? `${s.color}10` : 'var(--pat-bg)' }}>
                                                    <div>
                                                        <div className="font-bold text-sm" style={{ color: selected ? s.color : 'var(--pat-text)' }}>{s.label}</div>
                                                        <div className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--pat-muted)' }}>from {s.fee}</div>
                                                    </div>
                                                    {selected && <CheckCircle size={16} style={{ color: s.color, flexShrink: 0 }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── Step 1: Provider ── */}
                            {step === 1 && (
                                <div>
                                    <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--pat-text)' }}>Choose your doctor</label>
                                    <div className="space-y-3">
                                        {availableProviders.map(p => {
                                            const selected = providerName === p.name;
                                            return (
                                                <button key={p.name} onClick={() => setProviderName(p.name)}
                                                    className="w-full text-left rounded-2xl border-2 p-4 transition-all"
                                                    style={{ borderColor: selected ? accentColor : 'var(--pat-border)', background: selected ? `${accentColor}08` : 'var(--pat-bg)' }}>
                                                    <div className="flex items-start gap-3">
                                                        {/* Avatar */}
                                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0"
                                                            style={{ background: `linear-gradient(135deg,${p.avatarBg}cc,${p.avatarBg})` }}>
                                                            {p.initials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <span className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>{p.name}</span>
                                                                <CheckCircle size={12} style={{ color: '#1a6b42' }} />
                                                            </div>
                                                            {/* Rating */}
                                                            <div className="flex items-center gap-1 mb-2">
                                                                <span className="text-xs font-black" style={{ color: '#f59e0b' }}>{'★'.repeat(Math.floor(p.rating))}</span>
                                                                <span className="text-xs font-bold" style={{ color: 'var(--pat-text)' }}>{p.rating}</span>
                                                                <span className="text-xs" style={{ color: 'var(--pat-muted)' }}>({p.reviews} reviews)</span>
                                                            </div>
                                                            {/* Stats row */}
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--pat-muted)' }}>
                                                                <span className="font-semibold">{p.experience} yrs exp</span>
                                                                <span className="font-bold" style={{ color: accentColor }}>{p.fee}</span>
                                                                <span>{p.languages.join(' · ')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-2 text-xs font-semibold" style={{ color: accentColor }}>
                                                                <Clock size={11} /> Next: {p.nextSlot}
                                                            </div>
                                                        </div>
                                                        {selected && <CheckCircle size={18} className="flex-shrink-0 mt-1" style={{ color: accentColor }} />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Mode + Date + Time + Consent ── */}
                            {step === 2 && (
                                <>
                                    {/* Mode */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--pat-text)' }}>Consultation mode</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ id: 'video', label: 'Video', icon: Video }, { id: 'audio', label: 'Audio', icon: Mic }, { id: 'chat', label: 'Chat', icon: Monitor }].map(m => (
                                                <button key={m.id} onClick={() => setMode(m.id as any)}
                                                    className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all"
                                                    style={{ borderColor: mode === m.id ? accentColor : 'var(--pat-border)', background: mode === m.id ? `${accentColor}10` : 'transparent', color: mode === m.id ? accentColor : 'var(--pat-muted)' }}>
                                                    <m.icon size={18} />{m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--pat-text)' }}>Preferred date</label>
                                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                            className="input input-light w-full" min={new Date().toISOString().split('T')[0]} />
                                    </div>

                                    {/* Time slots with wait times */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--pat-text)' }}>Available time slots</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {TIME_SLOTS_WAIT.map(slot => (
                                                <button key={slot.time} onClick={() => setTime(slot.time)}
                                                    className="py-2.5 px-2 rounded-xl border-2 text-center transition-all"
                                                    style={{ borderColor: time === slot.time ? accentColor : 'var(--pat-border)', background: time === slot.time ? `${accentColor}10` : 'transparent' }}>
                                                    <div className="text-xs font-bold" style={{ color: time === slot.time ? accentColor : 'var(--pat-text)' }}>{slot.time}</div>
                                                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--pat-muted)' }}>{slot.wait}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Booking summary */}
                                    {selectedProvider && (
                                        <div className="rounded-xl p-4 space-y-2" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25` }}>
                                            {[
                                                { label: 'Doctor', value: providerName },
                                                { label: 'Specialty', value: specialty },
                                                { label: 'Fee', value: selectedProvider.fee },
                                                { label: 'Mode', value: `${mode.charAt(0).toUpperCase() + mode.slice(1)} call` },
                                                { label: 'Date', value: date ? new Date(date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long' }) : '—' },
                                                { label: 'Time', value: time || '—' },
                                            ].map(r => (
                                                <div key={r.label} className="flex justify-between text-xs">
                                                    <span style={{ color: 'var(--pat-muted)' }}>{r.label}</span>
                                                    <span className="font-semibold" style={{ color: r.label === 'Fee' ? accentColor : 'var(--pat-text)' }}>{r.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* WelliRecord data consent */}
                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all" style={{ borderColor: consent ? '#a855f7' : 'var(--pat-border)', background: consent ? '#a855f710' : 'var(--pat-bg)' }}>
                                        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-purple-500 w-4 h-4 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold mb-0.5" style={{ color: consent ? '#a855f7' : 'var(--pat-text)' }}>
                                                Share my WelliRecord with {providerName || 'this doctor'}
                                            </div>
                                            <div className="text-[11px] leading-relaxed" style={{ color: 'var(--pat-muted)' }}>
                                                Your medical history, current medications, and past consultations will be shared securely — so your doctor arrives fully informed. You can revoke access at any time.
                                            </div>
                                        </div>
                                    </label>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 pb-6 pt-2">
                            {step > 0 && (
                                <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all"
                                    style={{ borderColor: 'var(--pat-border)', color: 'var(--pat-muted)' }}>
                                    Back
                                </button>
                            )}
                            {step < 2 ? (
                                <button onClick={() => setStep(s => s + 1)}
                                    disabled={step === 0 ? !specialty : !providerName}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all"
                                    style={{ background: accentColor }}>
                                    Continue
                                </button>
                            ) : (
                                <button onClick={confirm} disabled={!canConfirm}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all"
                                    style={{ background: canConfirm ? accentColor : 'var(--pat-border)' }}>
                                    {canConfirm ? 'Confirm Booking' : !time ? 'Select a time slot' : 'Confirm sharing to continue'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}





const TABS = ['Consultations', 'Prescriptions', 'Remote Monitoring'];

const SPECIALTY_COLORS: Record<string, string> = {
    'Cardiology': '#ef4444',
    'General Practice': '#1a6b42',
    'OB/GYN': '#8b5cf6',
    'Pediatrics': '#f59e0b',
    'Psychiatry': '#0ea5e9',
    'Dermatology': '#f97316',
    'Neurology': '#6366f1',
};

const MONITORING_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    blood_pressure: { label: 'Blood Pressure', icon: Heart, color: '#0ea5e9' },
    glucose: { label: 'Blood Glucose', icon: Droplets, color: '#0ea5e9' },
    spo2: { label: 'O₂ Saturation', icon: Activity, color: '#0ea5e9' },
    heart_rate: { label: 'Heart Rate', icon: Zap, color: '#0ea5e9' },
    weight: { label: 'Weight', icon: Activity, color: '#0ea5e9' },
    temperature: { label: 'Temperature', icon: Activity, color: '#0ea5e9' },
};

const PHARMACY_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Awaiting Pharmacy', color: '#f59e0b' },
    received: { label: 'Received', color: '#0ea5e9' },
    dispensed: { label: 'Dispensed', color: '#10b981' },
    delivered: { label: 'Delivered', color: '#1a6b42' },
};

export function TelemedicineHubPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('Consultations');
    const [showBookModal, setShowBookModal] = useState(false);

    // Always fall back to pat_001 so mock data is always visible
    const uid = user?.userId ?? 'pat_001';
    const sessions = teleMedApi.getSessions(uid);
    const prescriptions = teleMedApi.getPrescriptions(uid);
    const readings = teleMedApi.getMonitoringReadings(uid);

    const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'waiting');
    const past = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

    const latestByType = readings.reduce<Record<string, typeof readings[0]>>((acc, r) => {
        if (!acc[r.type] || new Date(r.takenAt) > new Date(acc[r.type].takenAt)) acc[r.type] = r;
        return acc;
    }, {});
    const warnCount = Object.values(latestByType).filter(r => r.flag !== 'normal').length;

    const hasAnyData = sessions.length > 0 || prescriptions.length > 0 || readings.length > 0;

    return (
        <>
            <div className="animate-fade-in space-y-8">
                {/* ── Header — single line, no duplicate CTAs ── */}
                <div className="pb-6 border-b" style={{ borderColor: 'var(--pat-border)' }}>
                    <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--pat-text)' }}>
                        Telemedicine
                    </h1>
                    <p className="text-sm flex items-center gap-2" style={{ color: 'var(--pat-muted)' }}>
                        Consult specialists, track vitals, manage prescriptions — all in your WelliRecord.
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#a855f720', color: '#a855f7' }}>
                            <Sparkles size={9} /> AI-Powered
                        </span>
                    </p>
                </div>

                {/* ── Onboarding hero OR Stats ── */}
                {!hasAnyData ? (
                    /* First-time empty state — rich hero */
                    <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#0d3d22 0%,#1a6b42 60%,#2d9d63 100%)' }}>
                        <div className="px-10 py-10 relative">
                            <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10" style={{ background: '#fff', transform: 'translate(30%,-30%)' }} />
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,.12)' }}>
                                    <Video size={28} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-display font-bold text-xl text-white mb-1">Book your first consultation</h2>
                                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,.75)' }}>
                                        Connect with GPs, specialists, and allied health professionals — all linked directly to your WelliRecord. No repeated history-taking. Your doctor arrives fully informed.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {/* PRIMARY: AI Symptom Check — white filled (smartest first step) */}
                                        <button
                                            onClick={() => navigate('/patient/telemedicine/intake')}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all"
                                            style={{ background: '#fff', color: '#1a6b42' }}
                                        >
                                            <Brain size={16} /> Run AI Symptom Check First
                                        </button>
                                        {/* SECONDARY: Book direct — subtle outline */}
                                        <button
                                            onClick={() => setShowBookModal(true)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                                            style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.9)', border: '1.5px solid rgba(255,255,255,.3)' }}
                                        >
                                            <Plus size={16} /> Book a Consult
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Stats — only shown when there is actual data */
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Upcoming', value: upcoming.length, icon: Calendar, teal: true },
                            { label: 'Completed', value: past.length, icon: CheckCircle, teal: true },
                            { label: 'Prescriptions', value: prescriptions.length, icon: Pill, teal: true },
                            { label: 'Vitals Alerts', value: warnCount, icon: AlertTriangle, teal: warnCount === 0 },
                        ].map(stat => {
                            const color = stat.teal ? '#0ea5e9' : '#f59e0b';
                            return (
                                <div key={stat.label} className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                                        <stat.icon size={20} style={{ color }} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black" style={{ color }}>{stat.value}</div>
                                        <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>{stat.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(26,107,66,.06)', border: '1px solid var(--pat-border)' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{ background: tab === t ? 'var(--pat-primary)' : 'transparent', color: tab === t ? '#fff' : 'var(--pat-muted)' }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* ── Consultations ── */}
                {tab === 'Consultations' && (
                    <div className="space-y-6">
                        {sessions.length === 0 ? (
                            <SpecialtyDiscovery
                                onBook={(specialty) => { setShowBookModal(true); }}
                                onSymptomCheck={() => navigate('/patient/telemedicine/intake')}
                            />
                        ) : (
                            <>
                                {upcoming.length > 0 && (
                                    <div>
                                        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--pat-muted)' }}>Upcoming Sessions</h2>
                                        <div className="space-y-4">
                                            {upcoming.map(s => {
                                                const color = SPECIALTY_COLORS[s.providerSpecialty] ?? '#1a6b42';
                                                const intake = s.intakeId ? teleMedApi.getIntake(s.intakeId) : null;
                                                return (
                                                    <div key={s.id} className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                                                        <div className="h-1 w-full" style={{ background: color }} />
                                                        <div className="p-5 flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                                                                <Video size={22} style={{ color }} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
                                                                        <div className="font-bold" style={{ color: 'var(--pat-text)' }}>{s.providerName}</div>
                                                                        <div className="text-xs mt-0.5 font-semibold" style={{ color }}>{s.providerSpecialty}</div>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#1a6b4215', color: '#1a6b42' }}>Scheduled</span>
                                                                </div>
                                                                <div className="flex items-center gap-4 mt-3 flex-wrap">
                                                                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--pat-muted)' }}>
                                                                        <Calendar size={12} /> {new Date(s.scheduledAt).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--pat-muted)' }}>
                                                                        <Clock size={12} /> {new Date(s.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                {intake && (
                                                                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex" style={{ background: '#a855f715', color: '#a855f7' }}>
                                                                        <Brain size={12} /> AI intake complete — clinician pre-informed
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                                <button onClick={() => navigate(`/patient/telemedicine/room/${s.id}`)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white" style={{ background: color }}>
                                                                    <Video size={13} /> Join
                                                                </button>
                                                                {!intake && (
                                                                    <button onClick={() => navigate('/patient/telemedicine/intake')}
                                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs border" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
                                                                        <Brain size={13} /> Pre-Check
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {past.length > 0 && (
                                    <div>
                                        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--pat-muted)' }}>Past Consultations</h2>
                                        <div className="space-y-3">
                                            {past.map(s => (
                                                <div key={s.id} className="rounded-2xl border p-4 flex items-center gap-4" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)', opacity: 0.85 }}>
                                                    <CheckCircle size={18} style={{ color: '#10b981' }} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-sm" style={{ color: 'var(--pat-text)' }}>{s.providerName} · <span style={{ color: SPECIALTY_COLORS[s.providerSpecialty] ?? '#1a6b42' }}>{s.providerSpecialty}</span></div>
                                                        <div className="text-xs mt-0.5" style={{ color: 'var(--pat-muted)' }}>
                                                            {new Date(s.scheduledAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} · {s.durationMinutes} min
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {s.soapNote && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#a855f715', color: '#a855f7' }}><FileText size={10} /> SOAP Note</span>}
                                                        <button className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--pat-primary)' }}>View <ChevronRight size={13} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── Prescriptions ── */}
                {tab === 'Prescriptions' && (
                    <div className="space-y-4">
                        {prescriptions.length === 0 ? (
                            <div className="rounded-2xl border p-10 text-center" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: 'rgba(14,165,233,.1)' }}>
                                    <Pill size={28} style={{ color: '#0ea5e9' }} />
                                </div>
                                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--pat-text)' }}>No prescriptions yet</h3>
                                <p className="text-sm" style={{ color: 'var(--pat-muted)' }}>Digital prescriptions from your telemedicine sessions will appear here — tamper-proof and QR-verified.</p>
                            </div>
                        ) : (
                            prescriptions.map(rx => {
                                const status = PHARMACY_LABELS[rx.pharmacyStatus];
                                return (
                                    <div key={rx.id} className="rounded-2xl border p-5 shadow-sm" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(14,165,233,.1)' }}>
                                                    <Pill size={20} style={{ color: '#0ea5e9' }} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg" style={{ color: 'var(--pat-text)' }}>{rx.drug} <span className="text-base font-semibold" style={{ color: 'var(--pat-muted)' }}>{rx.dose}</span></div>
                                                    <div className="text-xs mt-0.5" style={{ color: 'var(--pat-muted)' }}>{rx.frequency} · {rx.duration} · {rx.providerName}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${status.color}15`, color: status.color }}>{status.label}</span>
                                                {rx.insuranceCovered && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#10b98115', color: '#10b981' }}>
                                                        <Shield size={10} /> Insurance Covered
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed mb-4 px-1" style={{ color: 'var(--pat-muted)' }}>{rx.instructions}</p>
                                        {rx.drugInteractionWarning && (
                                            <div className="flex items-start gap-2 text-xs px-3 py-2.5 rounded-xl mb-4" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30', color: '#b45309' }}>
                                                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                                                <span><strong>Drug Note:</strong> {rx.drugInteractionWarning}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--pat-border)' }}>
                                            <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-lg" style={{ background: 'var(--pat-bg)', color: 'var(--pat-primary)', border: '1px solid var(--pat-border)' }}>
                                                <QrCode size={14} /> {rx.qrToken}
                                            </div>
                                            {rx.pharmacyName && (
                                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--pat-muted)' }}>
                                                    <Truck size={12} /> {rx.pharmacyName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ── Remote Monitoring ── */}
                {tab === 'Remote Monitoring' && (
                    <div className="space-y-6">
                        {readings.length === 0 ? (
                            <div className="rounded-2xl border p-10 text-center" style={{ background: 'var(--pat-surface)', borderColor: 'var(--pat-border)' }}>
                                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: 'rgba(14,165,233,.1)' }}>
                                    <Activity size={28} style={{ color: '#0ea5e9' }} />
                                </div>
                                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--pat-text)' }}>No devices connected yet</h3>
                                <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--pat-muted)' }}>Link your blood pressure monitor, glucometer, or smartwatch to track vitals automatically.</p>
                                <button className="btn btn-patient gap-2"><Plus size={15} /> Connect a Device</button>
                            </div>
                        ) : (
                            <>
                                {warnCount > 0 && (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}>
                                        <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                                        <span className="text-sm font-semibold" style={{ color: '#b45309' }}>{warnCount} reading{warnCount > 1 ? 's' : ''} outside normal range — share with your clinician</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(latestByType).map(([type, reading]) => {
                                        const cfg = MONITORING_CONFIG[type];
                                        if (!cfg) return null;
                                        const flagColor = reading.flag === 'critical' ? '#ef4444' : reading.flag === 'warning' ? '#f59e0b' : '#0ea5e9';
                                        const displayValue = type === 'blood_pressure' ? `${reading.value}/${reading.secondaryValue}` : `${reading.value}`;
                                        return (
                                            <div key={type} className="rounded-2xl border p-5 shadow-sm" style={{ background: 'var(--pat-surface)', borderColor: reading.flag !== 'normal' ? flagColor + '50' : 'var(--pat-border)' }}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${flagColor}15` }}>
                                                            <cfg.icon size={20} style={{ color: flagColor }} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm" style={{ color: 'var(--pat-text)' }}>{cfg.label}</div>
                                                            <div className="text-[10px] mt-0.5" style={{ color: 'var(--pat-muted)' }}>{reading.deviceName}</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: flagColor }} />
                                                </div>
                                                <div className="text-3xl font-black mb-1" style={{ color: flagColor }}>
                                                    {displayValue} <span className="text-sm font-semibold">{reading.unit}</span>
                                                </div>
                                                <div className="text-xs" style={{ color: 'var(--pat-muted)' }}>
                                                    {new Date(reading.takenAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} at {new Date(reading.takenAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {reading.flag !== 'normal' && (
                                                    <div className="mt-3 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: `${flagColor}12`, color: flagColor }}>
                                                        ⚠ {reading.flag === 'warning' ? 'Above normal range' : 'Critical — contact your doctor'}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="rounded-2xl border border-dashed p-6 text-center" style={{ borderColor: 'var(--pat-border)' }}>
                                    <Wifi size={24} className="mx-auto mb-3" style={{ color: 'var(--pat-muted)' }} />
                                    <div className="font-bold text-sm mb-1" style={{ color: 'var(--pat-text)' }}>Connect more devices</div>
                                    <div className="text-xs mb-4" style={{ color: 'var(--pat-muted)' }}>Link your BP monitor, glucometer, or smartwatch via WelliRecord Connect.</div>
                                    <button className="btn btn-patient-outline text-xs gap-2"><Plus size={13} /> Add Device</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            {showBookModal && <BookConsultModal onClose={() => setShowBookModal(false)} />}
        </>
    );
}
