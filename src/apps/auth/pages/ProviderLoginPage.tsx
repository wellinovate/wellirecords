import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    Building2, Mail, Lock, ArrowLeft, ArrowRight,
    Shield, CheckCircle, Activity, Users, Wallet, ChevronDown, Check
} from 'lucide-react';
import { UserRole } from '@/shared/types/types';
import { ROLE_METADATA } from '@/shared/rbac/permissions';

const BRAND_FEATURES = [
    {
        icon: Building2,
        title: 'Org Verification',
        desc: 'Every provider undergoes identity and licence verification before gaining access.',
    },
    {
        icon: Shield,
        title: 'Consent-gated Access',
        desc: 'Records are only accessible with explicit patient approval — zero exceptions.',
    },
    {
        icon: Activity,
        title: 'Full Audit Trail',
        desc: 'Every record access is timestamped, logged, and traceable for compliance.',
    },
    {
        icon: Users,
        title: 'Multi-role Teams',
        desc: 'Clinicians, labs, pharmacists, and admins operating under one verified org.',
    },
];

const TRUST = ['SOC 2 Type II', 'ISO 27001', 'NDPR Compliant', 'Patient-first'];

export function ProviderLoginPage() {
    const navigate = useNavigate();
    const { signIn, signInAsRole } = useAuth();
    const [email, setEmail] = useState('fatima@lagosgeneral.ng');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showWeb3, setShowWeb3] = useState(false);
    const [web3Loading, setWeb3Loading] = useState(false);
    const [showRoleDrop, setShowRoleDrop] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('clinician');
    const roleDropRef = useRef<HTMLDivElement>(null);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roleDropRef.current && !roleDropRef.current.contains(event.target as Node)) {
                setShowRoleDrop(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDemoLogin = () => {
        signInAsRole(selectedRole);
        navigate('/provider/overview');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const user = signIn(email, password);
        setLoading(false);
        if (!user) { setError('Invalid credentials. Try: fatima@lagosgeneral.ng'); return; }
        if (user.userType === 'PATIENT') { setError('This is a patient account. Use the patient portal.'); return; }
        navigate('/provider/overview');
    };

    const handleWeb3 = () => {
        setWeb3Loading(true);
        setTimeout(() => {
            signInAsRole('clinician');
            navigate('/provider/overview');
        }, 1400);
    };

    return (
        <div
            className="min-h-screen flex"
            style={{ fontFamily: '"Inter", system-ui, sans-serif', background: '#fcfcfc' }}
        >
            {/* ── Left brand panel ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-5/12 px-12 py-10 relative overflow-hidden flex-shrink-0"
                style={{ background: '#f0f4ff', borderRight: '1px solid #dbeafe' }}
            >
                {/* Decorative soft orbs */}
                <div className="absolute top-[-100px] left-[-60px] w-[360px] h-[360px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(13,148,136,.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(30,58,138,.04) 0%, transparent 70%)' }} />

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex flex-col gap-1 items-start mb-14">
                        <WelliRecordLogo height={40} theme="light" />
                        <div className="text-[10px] font-bold tracking-widest uppercase mt-1 pl-1" style={{ color: '#1e3a8a' }}>Provider Portal</div>
                    </div>

                    <h2 className="font-black text-4xl leading-tight mb-3 tracking-tight" style={{ color: '#1e293b' }}>
                        Enterprise-grade<br />health access.
                    </h2>
                    <p className="text-sm leading-relaxed mb-10" style={{ color: '#475569' }}>
                        Connect your organisation to patient-owned records with consent gating, full audit trails, and regulatory compliance built in.
                    </p>

                    {/* Feature list */}
                    <div className="flex flex-col gap-5">
                        {BRAND_FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#ffffff', border: '1px solid #dbeafe' }}>
                                    <Icon size={16} style={{ color: '#1e3a8a' }} />
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
                                <CheckCircle size={12} style={{ color: '#1e3a8a' }} /> {t}
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
                        style={{ color: '#475569' }}
                    >
                        <ArrowLeft size={15} /> Back to portal selection
                    </button>

                    <div className="mb-7">
                        <h1 className="font-black text-3xl leading-tight mb-1" style={{ color: '#1e293b' }}>Provider Sign In</h1>
                        <p className="text-sm" style={{ color: '#64748b' }}>Organisation access portal</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-xl text-sm"
                            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1e293b' }}>
                                Organisation email
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input input-light bg-white border-slate-200"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="you@hospital.ng"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-semibold" style={{ color: '#1e293b' }}>Password</label>
                                <span className="text-xs font-semibold cursor-pointer hover:underline" style={{ color: '#1e3a8a' }}>
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input input-light bg-white border-slate-200"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
                            style={{ background: '#1e3a8a', opacity: loading ? 0.7 : 1, marginTop: '6px' }}
                        >
                            {loading ? 'Signing in…' : 'Sign In to Provider Portal'} {!loading && <ArrowRight size={15} />}
                        </button>
                    </form>

                    {/* Web3 — demoted to subtle secondary option */}
                    <div className="mt-5 text-center">
                        {!showWeb3 ? (
                            <button
                                onClick={() => setShowWeb3(true)}
                                className="text-xs hover:underline transition-opacity hover:opacity-80"
                                style={{ color: '#64748b' }}
                            >
                                Sign in with Web3 wallet instead
                            </button>
                        ) : (
                            <button
                                onClick={handleWeb3}
                                disabled={web3Loading}
                                className="w-full py-3 rounded-xl font-bold text-sm flex flex-row items-center justify-center gap-2 transition-all hover:bg-slate-50"
                                style={{
                                    color: '#1e3a8a',
                                    border: '1.5px solid #cbd5e1',
                                    opacity: web3Loading ? 0.7 : 1,
                                }}
                            >
                                <Wallet size={14} /> {web3Loading ? 'Connecting…' : 'Connect Org Wallet (Web3)'}
                            </button>
                        )}
                    </div>

                    <p className="mt-6 text-center text-sm" style={{ color: '#64748b' }}>
                        New organisation?{' '}
                        <Link to="/auth/provider/signup" className="font-bold hover:underline" style={{ color: '#1e3a8a' }}>
                            Register →
                        </Link>
                    </p>

                    {/* Dev-mode demo link — clearly scoped */}
                    {isLocalhost && (
                        <div className="mt-8 rounded-xl p-4 text-left relative"
                            style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#7ba3c8' }}>
                                    <Activity size={12} style={{ color: '#38bdf8' }} /> Development Mode
                                </p>
                            </div>

                            <p className="text-xs mb-3" style={{ color: '#7ba3c8' }}>Select a role below to bypass authentication and preview the provider portal.</p>

                            <div className="relative mb-3" ref={roleDropRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowRoleDrop(!showRoleDrop)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-semibold transition-colors focus:outline-none"
                                    style={{ background: '#0a1e38', color: '#e2eaf4', border: '1px solid rgba(56,189,248,.2)' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ROLE_METADATA[selectedRole]?.color || '#38bdf8' }} />
                                        {ROLE_METADATA[selectedRole]?.label || selectedRole}
                                    </div>
                                    <ChevronDown size={16} style={{ color: '#7ba3c8' }} />
                                </button>

                                {showRoleDrop && (
                                    <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50 shadow-2xl"
                                        style={{ background: '#071628', border: '1px solid rgba(56,189,248,.2)' }}>
                                        <div className="max-h-60 overflow-y-auto p-1 py-1.5 space-y-0.5">
                                            {(['provider_admin', 'clinician', 'lab_tech', 'pharmacist', 'insurer', 'telehealth'] as UserRole[]).map(role => {
                                                const meta = ROLE_METADATA[role];
                                                if (!meta) return null;
                                                return (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => { setSelectedRole(role); setShowRoleDrop(false); }}
                                                        className="w-full flex items-center justify-between p-2.5 rounded-md text-sm text-left hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/10"
                                                        style={{ color: selectedRole === role ? '#fff' : '#e2eaf4', background: selectedRole === role ? 'rgba(56,189,248,.1)' : 'transparent' }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                                                            <div>
                                                                <div className="font-semibold">{meta.label}</div>
                                                                <div className="text-[10px]" style={{ color: '#7ba3c8' }}>{meta.description?.split('.')[0]}</div>
                                                            </div>
                                                        </div>
                                                        {selectedRole === role && <Check size={14} style={{ color: '#38bdf8' }} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleDemoLogin}
                                className="w-full flex items-center justify-center p-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                                style={{ background: 'rgba(56,189,248,.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.2)' }}
                            >
                                Sign In as {ROLE_METADATA[selectedRole]?.label || selectedRole} <ArrowRight size={14} className="ml-1.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
