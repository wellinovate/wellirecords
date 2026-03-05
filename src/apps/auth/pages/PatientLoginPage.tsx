import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    HeartPulse, Mail, Lock, ArrowLeft, ArrowRight,
    Shield, CheckCircle, Activity, Zap, Wallet, Eye, EyeOff
} from 'lucide-react';

const BRAND_FEATURES = [
    {
        icon: Shield,
        title: 'AES-256 Encryption',
        desc: 'Your records form a cryptographic zero-knowledge vault.',
    },
    {
        icon: Lock,
        title: 'Granular Consent',
        desc: 'You approve every single access to your medical history.',
    },
    {
        icon: Zap,
        title: 'Emergency Ready',
        desc: 'NFC medical ID card to instantly securely share vitals.',
    },
    {
        icon: Activity,
        title: 'AI Companion',
        desc: 'Chat with WelliMate to decode your lab results and notes.',
    }
];

const TRUST = ['HIPAA Ready', 'NDPR Compliant', 'E2E Encrypted', 'Patient-owned'];

export function PatientLoginPage() {
    const navigate = useNavigate();
    const { signIn, signInAsRole } = useAuth();
    const [email, setEmail] = useState('amara@patient.com');
    const [password, setPassword] = useState('password');
    const [profileType, setProfileType] = useState('Personal');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showWeb3, setShowWeb3] = useState(false);
    const [web3Loading, setWeb3Loading] = useState(false);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // --- Access Restrictions based on Profile Type ---
        if (profileType === 'Child') {
            setError('Restricted Access: Child records cannot log in independently. A parent or guardian must log in via a Personal or Family profile to access dependants.');
            return;
        }

        // Proceed with login...
        setLoading(true);
        setError('');
        const user = signIn(email, password);
        setLoading(false);
        if (!user) { setError('Invalid email or password. Try: amara@patient.com'); return; }
        if (!user.roles?.includes('patient')) { setError('This account is not a patient account.'); return; }

        // Pass the profile type to state so we know what mode they logged in as
        localStorage.setItem('activeProfileType', profileType);

        navigate('/patient/overview');
    };

    const handleWeb3 = () => {
        setWeb3Loading(true);
        setTimeout(() => {
            signInAsRole('patient');
            navigate('/patient/overview');
        }, 1400);
    };

    return (
        <div
            className="min-h-screen flex"
            style={{ fontFamily: '"Inter", system-ui, sans-serif', background: '#f8faf9' }}
        >
            {/* ── Left brand panel ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-5/12 px-12 py-10 relative overflow-hidden flex-shrink-0"
                style={{ background: '#f0fdfa', borderRight: '1px solid #ccfbf1' }}
            >
                {/* Decorative soft orbs */}
                <div className="absolute top-[-100px] left-[-60px] w-[360px] h-[360px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(13,148,136,.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(30,58,138,.04) 0%, transparent 70%)' }} />

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex flex-col gap-1 items-start mb-14">
                        <WelliRecordLogo height={40} theme="dark" />
                        <div className="text-[10px] font-bold tracking-widest uppercase mt-1 pl-1" style={{ color: '#0d9488' }}>Patient Portal</div>
                    </div>

                    <h2 className="font-black text-4xl leading-tight mb-3 tracking-tight" style={{ color: '#1e293b' }}>
                        Your health vault,<br />built for life.
                    </h2>
                    <p className="text-sm leading-relaxed mb-10" style={{ color: '#475569' }}>
                        Access your encrypted records, manage who sees your medical history, and get AI-assisted health insights — all on your terms.
                    </p>

                    {/* Feature list */}
                    <div className="flex flex-col gap-5">
                        {BRAND_FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#ffffff', border: '1px solid #ccfbf1' }}>
                                    <Icon size={16} style={{ color: '#0d9488' }} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold" style={{ color: '#1e293b' }}>{title}</div>
                                    <div className="text-xs leading-relaxed mt-0.5" style={{ color: '#64748b' }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust badges */}
                <div className="relative z-10 pt-8 border-t" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {TRUST.map(t => (
                            <div key={t} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
                                <CheckCircle size={12} style={{ color: '#0d9488' }} /> {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div
                className="flex-1 flex flex-col items-center justify-center px-6 py-12"
                style={{ background: '#ffffff' }}
            >
                <div className="w-full max-w-sm animate-fade-in-up">
                    {/* Back */}
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center gap-2 mb-8 text-sm font-semibold hover:opacity-70 transition-opacity"
                        style={{ color: '#5a7a63' }}
                    >
                        <ArrowLeft size={15} /> Back to portal selection
                    </button>

                    <div className="mb-7">
                        <h1 className="font-black text-3xl leading-tight mb-1" style={{ color: '#0f2818' }}>Welcome back</h1>
                        <p className="text-sm" style={{ color: '#4a6e58' }}>Sign in to your health vault</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-xl text-sm"
                            style={{ background: 'rgba(220,38,38,.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,.18)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1a2e1e' }}>Profile type</label>
                            <div className="relative">
                                <select
                                    value={profileType}
                                    onChange={e => setProfileType(e.target.value)}
                                    className="input input-light w-full appearance-none bg-white transition-all focus:ring-2 focus:ring-emerald-500/20"
                                    style={{ paddingLeft: '1rem', cursor: 'pointer', borderColor: 'rgba(26,107,66,.2)' }}
                                >
                                    <option value="Personal">Personal Profile</option>
                                    <option value="Child">Child (Dependants & Child Records)</option>
                                    <option value="Family" className="font-bold text-amber-700">Family Profile ✦ Premium</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9ca3af' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1a2e1e' }}>
                                Email address
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input input-light transition-all focus:ring-2 focus:ring-emerald-500/20"
                                    style={{ paddingLeft: '2.5rem', borderColor: 'rgba(26,107,66,.2)' }}
                                    placeholder="you@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-semibold" style={{ color: '#1a2e1e' }}>Password</label>
                                <span className="text-xs font-semibold cursor-pointer hover:underline" style={{ color: '#1a6b42' }}>
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input input-light"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                                    placeholder="Password"
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-patient w-full justify-center gap-2"
                            style={{ opacity: loading ? 0.7 : 1, marginTop: '6px' }}
                        >
                            {loading ? 'Signing in…' : 'Sign In to Health Vault'} {!loading && <ArrowRight size={15} />}
                        </button>
                    </form>

                    {/* Web3 — demoted to subtle secondary option */}
                    <div className="mt-5 text-center">
                        {!showWeb3 ? (
                            <button
                                onClick={() => setShowWeb3(true)}
                                className="text-xs hover:underline transition-opacity hover:opacity-80"
                                style={{ color: '#5a7a63' }}
                            >
                                Sign in with Web3 wallet instead
                            </button>
                        ) : (
                            <button
                                onClick={handleWeb3}
                                disabled={web3Loading}
                                className="btn w-full justify-center gap-2 text-sm"
                                style={{
                                    background: 'rgba(26,107,66,.06)',
                                    color: '#1a6b42',
                                    border: '1px solid rgba(26,107,66,.15)',
                                    opacity: web3Loading ? 0.7 : 1,
                                }}
                            >
                                <Wallet size={14} /> {web3Loading ? 'Connecting…' : 'Connect Web3 Wallet'}
                            </button>
                        )}
                    </div>

                    <p className="mt-6 text-center text-sm" style={{ color: '#5a7a63' }}>
                        No account yet?{' '}
                        <Link to="/auth/patient/signup" className="font-bold hover:underline" style={{ color: '#1a6b42' }}>
                            Create your health vault →
                        </Link>
                    </p>

                    {/* Dev-mode demo link — clearly scoped */}
                    {isLocalhost && (
                        <div className="mt-8 rounded-xl p-3 text-center"
                            style={{ background: 'rgba(26,107,66,.05)', border: '1px dashed rgba(26,107,66,.2)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5a7a63' }}>
                                Development only
                            </p>
                            <button
                                onClick={() => { signInAsRole('patient'); navigate('/patient/overview'); }}
                                className="text-xs font-semibold hover:underline"
                                style={{ color: '#1a6b42' }}
                            >
                                Skip to patient portal (demo account)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
