import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import {
    ArrowRight,
    Building2,
    CheckCircle,
    Database, Eye,
    FileText,
    HeartPulse,
    Lock,
    Settings,
    Shield,
    Users,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PATIENT_FEATURES = [
    { icon: Lock, text: 'AES-256 encrypted health vault — every record, every provider' },
    { icon: Shield, text: 'Granular consent control — you approve every access individually' },
    { icon: Zap, text: 'Emergency QR card + AI health companion in your pocket' },
];

const PROVIDER_FEATURES = [
    { icon: Building2, text: 'Org verification — your credentials and licence, validated' },
    { icon: FileText, text: 'Consent-gated access — see only what patients approve' },
    { icon: Users, text: 'Multi-role teams under one organisation account' },
];

const ADMIN_FEATURES = [
    { icon: Database, text: 'Verification queue — approve facilities and clinicians' },
    { icon: Eye, text: 'Platform-wide audit logs and security alerts' },
    { icon: Settings, text: 'Subscription plans, billing, and notification templates' },
];

const TRUST_PATIENT = ['HIPAA Ready', 'NDPR Compliant', 'E2E Encrypted'];
const TRUST_PROVIDER = ['SOC 2 Ready', 'ISO 27001', 'Patient-first Access'];
const TRUST_ADMIN = ['Internal Access Only', 'Full Audit Trail', 'RBAC Enforced'];

export function AuthGatewayPage() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: '#ffffff',
                fontFamily: '"Inter", system-ui, sans-serif',
            }}
        >
            {/* ── Top nav ── */}
            <nav className="flex items-center justify-between px-8 py-5 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <WelliRecordLogo height={44} theme="dark" tagline />
                </div>
                <a
                    href="/home"
                    className="text-sm font-semibold hover:text-teal-600 transition-colors"
                    style={{ color: '#475569' }}
                >
                    Learn more →
                </a>
            </nav>

            {/* ── Hero ── */}
            <div className="flex flex-col items-center text-center px-6 pt-10 pb-8 animate-fade-in-up">
                <p className="text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full"
                    style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #ccfbf1' }}>
                    Secure · Consent-first · Patient-owned
                </p>
                <h1 className="font-black text-4xl md:text-5xl leading-tight mb-3 tracking-tight"
                    style={{ color: '#1e293b', fontFamily: '"Bricolage Grotesque", Inter, sans-serif' }}>
                    Who are you here as?
                </h1>
                <p className="text-base max-w-sm leading-relaxed" style={{ color: '#475569' }}>
                    Choose your role to go straight to the right portal.
                </p>
            </div>

            {/* ── Role cards ── */}
            <div className="flex-1 flex items-start justify-center px-4 pb-14">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {/* ── Patient Card ── */}
                    <div
                        className="rounded-3xl flex flex-col overflow-hidden animate-fade-in-up transition-all hover:-translate-y-1"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        }}
                    >
                        <div className="px-7 pt-7 pb-5 flex-1">
                            {/* Icon + label */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#f0fdfa' }}>
                                    <HeartPulse size={22} style={{ color: '#0d9488' }} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#0d9488' }}>Patient Portal</div>
                                    <h2 className="font-black text-2xl leading-tight" style={{ color: '#1e293b' }}>I'm a Patient</h2>
                                </div>
                            </div>

                            <p className="text-sm leading-relaxed mb-6" style={{ color: '#475569' }}>
                                Access your encrypted health vault, manage who sees your records, book appointments, and get AI-assisted care — on your terms.
                            </p>

                            {/* Feature list */}
                            <div className="space-y-3 mb-6">
                                {PATIENT_FEATURES.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <Icon size={13} style={{ color: '#64748b' }} />
                                        </div>
                                        <span className="text-xs leading-relaxed" style={{ color: '#475569' }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="px-7 pb-5 flex flex-col gap-2.5">
                            <button
                                onClick={() => navigate('/auth/patient/login')}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
                                style={{ background: '#0d9488' }}
                            >
                                Sign In <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={() => navigate('/auth/patient/signup')}
                                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:bg-slate-50"
                                style={{ color: '#0d9488', background: '#ffffff', border: '1.5px solid #0d9488' }}
                            >
                                Create Health Vault
                            </button>
                        </div>

                        {/* Trust strip */}
                        <div className="px-7 py-3.5 flex items-center justify-center gap-5 flex-wrap border-t"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                            {TRUST_PATIENT.map(t => (
                                <div key={t} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#64748b' }}>
                                    <CheckCircle size={12} style={{ color: '#0d9488' }} /> {t}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Provider Card ── */}
                    <div
                        className="rounded-3xl flex flex-col overflow-hidden animate-fade-in-up transition-all hover:-translate-y-1"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        }}
                    >
                        <div className="px-7 pt-7 pb-5 flex-1">
                            {/* Icon + label */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#eff6ff' }}>
                                    <Building2 size={22} style={{ color: '#1e3a8a' }} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#1e3a8a' }}>Provider Portal</div>
                                    <h2 className="font-black text-2xl leading-tight" style={{ color: '#1e293b' }}>I'm a Provider</h2>
                                </div>
                            </div>

                            <p className="text-sm leading-relaxed mb-6" style={{ color: '#475569' }}>
                                Connect your healthcare organisation to patient-owned records — hospital, lab, pharmacy, insurer, or government body.
                            </p>

                            {/* Feature list */}
                            <div className="space-y-3 mb-6">
                                {PROVIDER_FEATURES.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <Icon size={13} style={{ color: '#64748b' }} />
                                        </div>
                                        <span className="text-xs leading-relaxed" style={{ color: '#475569' }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="px-7 pb-5 flex flex-col gap-2.5">
                            <button
                                onClick={() => navigate('/auth/provider/login')}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
                                style={{ background: '#1e3a8a' }}
                            >
                                Sign In <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={() => navigate('/auth/provider/signup')}
                                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:bg-slate-50"
                                style={{ color: '#1e3a8a', background: '#ffffff', border: '1.5px solid #1e3a8a' }}
                            >
                                Register Organisation
                            </button>
                        </div>

                        {/* Trust strip */}
                        <div className="px-7 py-3.5 flex items-center justify-center gap-5 flex-wrap border-t"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                            {TRUST_PROVIDER.map(t => (
                                <div key={t} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#64748b' }}>
                                    <CheckCircle size={12} style={{ color: '#1e3a8a' }} /> {t}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── WelliRecord Ops Card ── */}
                    <div
                        className="rounded-3xl flex flex-col overflow-hidden animate-fade-in-up transition-all hover:-translate-y-1 md:col-span-2 xl:col-span-1"
                        style={{
                            background: '#0c1222',
                            border: '1px solid rgba(245,158,11,0.25)',
                            boxShadow: '0 4px 20px rgba(245,158,11,0.07)',
                        }}
                    >
                        <div className="px-7 pt-7 pb-5 flex-1">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(245,158,11,0.12)' }}>
                                    <Settings size={22} style={{ color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#f59e0b' }}>WelliRecord Ops</div>
                                    <h2 className="font-black text-2xl leading-tight" style={{ color: '#e5e7eb' }}>I'm WelliRecord Staff</h2>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed mb-6" style={{ color: '#9ca3af' }}>
                                Internal operations portal — verification, governance, billing, security, and platform administration.
                            </p>
                            <div className="space-y-3 mb-6">
                                {ADMIN_FEATURES.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                            <Icon size={13} style={{ color: '#f59e0b' }} />
                                        </div>
                                        <span className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-7 pb-5 flex flex-col gap-2.5">
                            <button
                                onClick={() => navigate('/auth/provider/login')}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
                                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                            >
                                Staff Sign In <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={() => navigate('/auth/super-admin/login')}
                                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/5"
                                style={{ color: '#8b5cf6', background: 'transparent', border: '1.5px solid rgba(139,92,246,0.3)' }}
                            >
                                Super Admin Portal
                            </button>
                        </div>
                        <div className="px-7 py-3.5 flex items-center justify-center gap-5 flex-wrap border-t"
                            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(245,158,11,0.12)' }}>
                            {TRUST_ADMIN.map(t => (
                                <div key={t} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#4b5563' }}>
                                    <CheckCircle size={12} style={{ color: '#f59e0b' }} /> {t}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="w-full mt-auto border-t px-8 py-12" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">

                    {/* Brand & Copyright */}
                    <div className="flex flex-col gap-4 max-w-xs cursor-default">
                        <WelliRecordLogo height={28} theme="dark" />
                        <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                            Your health, secured. Everywhere.<br />
                            <span className="font-semibold mt-1 inline-block" style={{ color: '#475569' }}>Powered by Wellinovate LTD.</span>
                        </p>
                    </div>

                    {/* Links row */}
                    <div className="flex gap-12 md:gap-20 flex-wrap">
                        {/* Company */}
                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-bold tracking-widest uppercase cursor-default" style={{ color: '#1e293b' }}>Company</h4>
                            <a href="#" className="text-xs font-semibold hover:text-teal-600 transition-colors" style={{ color: '#64748b' }}>Vision</a>
                            <a href="#" className="text-xs font-semibold hover:text-teal-600 transition-colors" style={{ color: '#64748b' }}>About Us</a>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-bold tracking-widest uppercase cursor-default" style={{ color: '#1e293b' }}>Contact</h4>
                            <a href="mailto:inquiry@wellirecord.com" className="text-xs font-semibold hover:text-teal-600 transition-colors" style={{ color: '#64748b' }}>inquiry@wellirecord.com</a>
                            <a href="tel:+2348053355506" className="text-xs font-semibold hover:text-teal-600 transition-colors" style={{ color: '#64748b' }}>+234 805 335 5506</a>
                        </div>

                        {/* Legal */}
                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-bold tracking-widest uppercase cursor-default" style={{ color: '#1e293b' }}>Legal</h4>
                            <a href="#" className="text-xs font-semibold hover:text-teal-600 transition-colors" style={{ color: '#64748b' }}>Terms of Service</a>
                            <a href="#" className="text-xs font-semibold hover:text-teal-600 transition-colors" style={{ color: '#64748b' }}>Privacy Policy</a>
                        </div>
                    </div>

                </div>
            </footer>
        </div>
    );
}
