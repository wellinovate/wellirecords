import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeartPulse, Shield, Lock, QrCode, Users, Building2,
    FlaskConical, Pill, Wifi, ArrowRight, Star, Globe, Activity,
    Stethoscope, HandHeart, HeartHandshake, Watch, Library, Sparkles,
    BadgeCheck, Award
} from 'lucide-react';

const FEATURES = [
    { icon: Lock, title: 'Patient-Owned EHR', desc: 'Your records are encrypted and stored in your personal health vault. Only you decide who has access.' },
    { icon: Shield, title: 'Consent & Sharing Control', desc: 'Grant or revoke provider access in seconds. Set time limits, scopes, and purposes for every consent.' },
    { icon: QrCode, title: 'Emergency QR Card', desc: 'Share critical health data instantly in emergencies via a secure, time-limited QR code.' },
    { icon: Building2, title: 'Multi-Org Ecosystem', desc: 'Hospitals, labs, pharmacies, insurers — all connected to your single patient record.' },
    { icon: Activity, title: 'Full Audit Trail', desc: 'Every access to your records is logged. You see exactly who viewed what and when.' },
    { icon: Sparkles, title: 'AI Health Companion', desc: 'Chat with WelliMate to understand your lab results, track medications, and get personalised health insights — 24/7.', accent: true },
];

const PARTNER_TYPES = [
    { icon: Building2, type: 'Hospitals & Clinics' },
    { icon: FlaskConical, type: 'Diagnostic Labs' },
    { icon: Pill, type: 'Pharmacies' },
    { icon: Wifi, type: 'Telehealth Platforms' },
    { icon: Shield, type: 'Insurance Providers' },
    { icon: Watch, type: 'Wearable Vendors' },
    { icon: HeartHandshake, type: 'NGOs' },
    { icon: Library, type: 'Government Bodies' },
];

export function LandingPage() {
    const navigate = useNavigate();
    const featuresRef = useRef<HTMLDivElement>(null);

    return (
        <div className="min-h-screen" style={{ background: '#ffffff', color: '#334155', fontFamily: '"Inter", system-ui, sans-serif' }}>
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-30 h-20 flex items-center justify-between px-6 md:px-12 bg-white/90 backdrop-blur border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <WelliRecordLogo height={44} theme="dark" />
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium hover:text-teal-600 transition-colors" style={{ color: '#475569' }}>Features</button>
                    <button onClick={() => navigate('/partners')} className="text-sm font-medium hover:text-teal-600 transition-colors" style={{ color: '#475569' }}>Partners</button>
                    <button onClick={() => navigate('/pricing')} className="text-sm font-medium hover:text-teal-600 transition-colors" style={{ color: '#475569' }}>Pricing</button>
                    <button onClick={() => navigate('/auth/patient/login')} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-slate-50 hidden sm:block" style={{ color: '#1e3a8a', border: '1px solid #e2e8f0' }}>Patient Login</button>
                    <button onClick={() => navigate('/auth/provider/login')} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 text-white shadow-sm" style={{ background: '#1e3a8a' }}>Provider Login</button>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-36 pb-20 px-8 text-center relative overflow-hidden bg-white">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(13,148,136,0.05) 0%, transparent 40%)' }} />
                <div className="relative max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold"
                        style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', color: '#0d9488' }}>
                        <Activity size={12} /> Now live in Nigeria · West Africa
                    </div>
                    <h1 className="font-display font-black text-5xl md:text-7xl leading-tight mb-6 tracking-tight" style={{ color: '#1e293b' }}>
                        Your Health.<br />
                        <span style={{ color: '#1e3a8a' }}>Your Records.</span><br />
                        <span style={{ color: '#0d9488' }}>Your Control.</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#475569' }}>
                        The first patient-owned EHR platform for Africa. Store, share, and protect your health records with consent-based access for every provider.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/auth')} className="btn btn-lg shadow-md transition-all hover:-translate-y-0.5" style={{ background: '#0d9488', color: '#fff', gap: '0.5rem', border: 'none' }}>
                            <HeartPulse size={18} /> Create Your Health Vault <ArrowRight size={18} />
                        </button>
                        <button onClick={() => navigate('/auth/provider/signup')} className="btn btn-lg transition-all hover:bg-slate-50" style={{ background: '#fff', color: '#1e3a8a', border: '1.5px solid #cbd5e1' }}>
                            Register Your Organisation
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Social Proof + Compliance Trust Strip ─────────────────────── */}
            <section className="py-12 px-8 border-y" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <div className="max-w-5xl mx-auto">
                    {/* Partner hospitals */}
                    <p className="text-center text-xs font-black uppercase tracking-widest mb-8" style={{ color: '#94a3b8' }}>
                        Trusted by leading healthcare institutions
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10">
                        {[
                            'Lagos General Hospital',
                            'CityLab Diagnostics',
                            'Reddington Hospital',
                            'Lagos Island General',
                            'AXA Mansard Health',
                            'Evercare Hospital',
                        ].map(name => (
                            <div key={name}
                                className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl"
                                style={{ color: '#475569', background: '#fff', border: '1px solid #e2e8f0' }}>
                                <Building2 size={14} style={{ color: '#1e3a8a' }} />
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Compliance badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                            { icon: Shield, label: 'NDPR Compliant', sub: 'Nigeria Data Protection' },
                            { icon: BadgeCheck, label: 'HIPAA Ready', sub: 'US Health Data Standard' },
                            { icon: Lock, label: 'ISO 27001', sub: 'Information Security' },
                            { icon: Award, label: 'HL7 FHIR R4', sub: 'Interoperability Standard' },
                            { icon: HeartPulse, label: '99.9% Uptime', sub: 'SLA Guaranteed' },
                        ].map(b => (
                            <div key={b.label}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                                style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                <b.icon size={16} style={{ color: '#1e3a8a' }} />
                                <div>
                                    <div className="text-xs font-black" style={{ color: '#1e3a8a' }}>{b.label}</div>
                                    <div className="text-[10px]" style={{ color: '#6366f1' }}>{b.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dual portal cards */}
            <section className="px-8 py-24 w-full" style={{ background: '#F0F4FF' }}>
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                    <div className="rounded-2xl p-8 text-left transition-all hover:-translate-y-1" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: '#eff6ff' }}>
                            <Building2 size={24} style={{ color: '#1e3a8a' }} />
                        </div>
                        <h2 className="font-display font-bold text-2xl mb-3" style={{ color: '#1e293b' }}>Provider Portal</h2>
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: '#475569' }}>Hospitals, labs, pharmacies, insurers, telehealth providers — access consented patient records and collaborate across the ecosystem.</p>
                        <ul className="space-y-3 text-sm mb-8" style={{ color: '#475569' }}>
                            {['Consent-scoped EHR access', 'SOAP notes & encounter docs', 'Lab orders & results', 'ePrescription & pharmacy write-back', 'FHIR R4 API integration'].map(f => (
                                <li key={f} className="flex items-center gap-3"><span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#dbeafe', color: '#1e3a8a' }}>✓</span> {f}</li>
                            ))}
                        </ul>
                        <button onClick={() => navigate('/auth/provider/login')} className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-800 text-white" style={{ background: '#1e3a8a' }}>Access Provider Portal <ArrowRight size={16} /></button>
                    </div>

                    <div className="rounded-2xl p-8 text-left transition-all hover:-translate-y-1" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: '#f0fdfa' }}>
                            <Lock size={24} style={{ color: '#0d9488' }} />
                        </div>
                        <h2 className="font-display font-bold text-2xl mb-3" style={{ color: '#1e293b' }}>Patient Portal</h2>
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: '#475569' }}>Your complete health history, securely stored, always accessible, and under your complete control.</p>
                        <ul className="space-y-3 text-sm mb-8" style={{ color: '#475569' }}>
                            {['Encrypted personal health vault', 'Consent & sharing centre', 'Emergency QR access card', 'Appointment booking', 'Wearables sync (Apple Health, Fitbit)'].map(f => (
                                <li key={f} className="flex items-center gap-3"><span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#ccfbf1', color: '#0d9488' }}>✓</span> {f}</li>
                            ))}
                        </ul>
                        <button onClick={() => navigate('/auth/patient/signup')} className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white shadow-sm" style={{ background: '#0d9488' }}>Create Health Vault <ArrowRight size={16} /></button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section ref={featuresRef} className="px-8 py-24 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="font-display font-black text-4xl text-center mb-4" style={{ color: '#1e293b' }}>Built for trust. Designed for Africa.</h2>
                    <p className="text-center text-lg mb-16 max-w-2xl mx-auto leading-relaxed" style={{ color: '#475569' }}>World-class healthcare infrastructure for every Nigerian patient and provider.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => {
                            const isAI = (f as any).accent;
                            return (
                                <div key={i}
                                    className="rounded-2xl p-8 bg-white transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden"
                                    style={{
                                        border: isAI ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                                        boxShadow: isAI ? '0 4px 24px rgba(99,102,241,0.08)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                                    }}>
                                    {isAI && (
                                        <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full"
                                            style={{ background: '#eef2ff', color: '#6366f1' }}>NEW</div>
                                    )}
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                        style={{ background: isAI ? '#eef2ff' : '#f0fdfa' }}>
                                        <f.icon size={24} style={{ color: isAI ? '#6366f1' : '#0d9488' }} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-3" style={{ color: '#1e293b' }}>{f.title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{f.desc}</p>
                                    {isAI && (
                                        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#6366f1' }}>
                                            <Sparkles size={12} /> Powered by WelliMate AI
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Partner ecosystem */}
            <section className="px-8 py-24" style={{ background: '#F0F4FF' }}>
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="font-display font-black text-4xl mb-4" style={{ color: '#1e293b' }}>One platform. Every stakeholder.</h2>
                    <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#475569' }}>A unified ecosystem connecting every touchpoint in the healthcare journey.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        {PARTNER_TYPES.map(p => (
                            <div key={p.type} className="p-6 text-center rounded-2xl flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md" style={{ border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div className="mb-5 w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#1e3a8a' }}>
                                    <p.icon size={32} style={{ color: '#ffffff' }} />
                                </div>
                                <div className="text-sm font-semibold" style={{ color: '#475569' }}>{p.type}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/auth/provider/signup')} className="mt-12 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg text-white" style={{ background: '#1e3a8a' }}>
                        Register Your Organisation →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-12 border-t" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <WelliRecordLogo height={28} theme="dark" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: '#64748b' }}>
                        <button onClick={() => navigate('/security')} className="hover:text-slate-900 transition-colors">Security</button>
                        <button onClick={() => navigate('/partners')} className="hover:text-slate-900 transition-colors">Partners</button>
                        <button onClick={() => navigate('/how-it-works')} className="hover:text-slate-900 transition-colors">How It Works</button>
                    </div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>© 2026 WelliRecord Ltd. Lagos, Nigeria.</div>
                </div>
            </footer>
        </div>
    );
}
