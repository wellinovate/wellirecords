import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import {
    Mail, Lock, ArrowRight, Shield, Eye, EyeOff,
    Activity, Database, Globe, Zap, CheckCircle, AlertTriangle,
} from 'lucide-react';

const SA_FEATURES = [
    { icon: Shield, title: 'God-Mode Access', desc: 'Full platform authority — users, orgs, billing, security, and governance from one command centre.' },
    { icon: Globe, title: 'Platform-wide Oversight', desc: 'Monitor all patient, provider, and administrative activity across every registered organisation.' },
    { icon: Database, title: 'Data Governance', desc: 'Control consent policies, data retention rules, and NDPR/ISO 27001 compliance posture.' },
    { icon: Zap, title: 'Incident Response', desc: 'Receive real-time security alerts and act immediately with session termination or account locks.' },
];

const TRUST = ['SOC 2 Type II', 'ISO 27001', 'NDPR Compliant', 'Zero-Trust Architecture'];

const SA_STYLES = `
@keyframes sa-orb {
    0%,100% { transform: scale(1) translate(0,0); opacity: 0.6; }
    50% { transform: scale(1.08) translate(6px,-8px); opacity: 0.9; }
}
@keyframes sa-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
}
.sa-animate { animation: sa-fade-up 0.45s cubic-bezier(.4,0,.2,1) both; }
.sa-orb { animation: sa-orb 7s ease-in-out infinite; }
`;

export function SuperAdminLoginPage() {
    const navigate = useNavigate();
    const { signIn, signInAsRole } = useAuth();

    const [email, setEmail] = useState('support@wellirecord.com');
    const [password, setPassword] = useState('Password@1');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            const user = signIn(email, password);
            setLoading(false);
            if (!user) {
                setError('Invalid credentials. Use: super@wellirecord.ng');
                return;
            }
            if (!user.roles?.includes('super_admin')) {
                setError('Access denied. This portal is restricted to Super Admins only.');
                return;
            }
            navigate('/super-admin/dashboard');
        }, 600);
    };

    // Dev bypass
    const handleDevLogin = async () => {
        setLoading(true);
        try {
            await signIn('support@wellirecord.com', 'Password@1');
            navigate('/super-admin/dashboard');
        } catch (err) {
            console.error("Dev login failed:", err);
            setError('Dev login failed. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{SA_STYLES}</style>
            <div
                className="min-h-screen flex"
                style={{ fontFamily: '"Inter", system-ui, sans-serif', background: '#060c1a' }}
            >
                {/* ── Left brand panel ── */}
                <div
                    className="hidden lg:flex flex-col justify-between w-5/12 px-12 py-10 relative overflow-hidden flex-shrink-0"
                    style={{ background: 'linear-gradient(160deg, #0a0f24 0%, #0d1233 60%, #0f0a2e 100%)', borderRight: '1px solid rgba(129,140,248,0.12)' }}
                >
                    {/* Animated orbs */}
                    <div className="sa-orb absolute top-[-80px] left-[-50px] w-[380px] h-[380px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(129,140,248,.18) 0%, transparent 65%)' }} />
                    <div className="sa-orb absolute bottom-[-100px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(167,139,250,.12) 0%, transparent 65%)', animationDelay: '3s' }} />
                    <div className="sa-orb absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)', animationDelay: '1.5s' }} />

                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex flex-col gap-1 items-start mb-12">
                            <WelliRecordLogo height={40} theme="light" />
                            <div
                                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase"
                                style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
                            >
                                ⚡ Super Admin Portal
                            </div>
                        </div>

                        <h2 className="font-black text-4xl leading-tight mb-3 tracking-tight" style={{ color: '#f1f5f9' }}>
                            Platform<br />Command Centre.
                        </h2>
                        <p className="text-sm leading-relaxed mb-10" style={{ color: '#94a3b8' }}>
                            Unrestricted access to every dimension of the WelliRecord platform — users, billing, security, governance, and real-time operations.
                        </p>

                        {/* Feature list */}
                        <div className="flex flex-col gap-5">
                            {SA_FEATURES.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}
                                    >
                                        <Icon size={16} style={{ color: '#818cf8' }} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold" style={{ color: '#e2e8f0' }}>{title}</div>
                                        <div className="text-xs leading-relaxed mt-0.5" style={{ color: '#64748b' }}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust + system status */}
                    <div className="relative z-10 pt-8 border-t" style={{ borderColor: 'rgba(129,140,248,0.12)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold" style={{ color: '#10b981' }}>All Systems Operational</span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                            {TRUST.map(t => (
                                <div key={t} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#475569' }}>
                                    <CheckCircle size={11} style={{ color: '#818cf8' }} /> {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right form panel ── */}
                <div
                    className="flex-1 flex flex-col items-center justify-center px-6 py-12"
                    style={{ background: '#080e20' }}
                >
                    <div className="w-full max-w-sm sa-animate">

                        {/* Header */}
                        <div className="mb-8">
                            {/* Mobile logo */}
                            <div className="lg:hidden mb-6 flex items-center gap-3">
                                <WelliRecordLogo height={32} theme="light" />
                                <div
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                                    style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)' }}
                                >
                                    ⚡ Super Admin
                                </div>
                            </div>

                            {/* Warning badge */}
                            <div
                                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6 text-xs font-semibold"
                                style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                            >
                                <AlertTriangle size={13} />
                                Restricted access — authorised personnel only
                            </div>

                            <h1 className="font-black text-3xl leading-tight mb-1" style={{ color: '#f1f5f9' }}>
                                Super Admin Sign In
                            </h1>
                            <p className="text-sm" style={{ color: '#475569' }}>WelliRecord internal operations portal</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="super@wellirecord.ng"
                                        className="w-full rounded-xl border text-sm focus:outline-none transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(129,140,248,0.2)',
                                            color: '#e2e8f0',
                                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        }}
                                        onFocus={e => (e.target.style.borderColor = 'rgba(129,140,248,0.6)')}
                                        onBlur={e => (e.target.style.borderColor = 'rgba(129,140,248,0.2)')}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Password</label>
                                    <span className="text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: '#818cf8' }}>
                                        Forgot password?
                                    </span>
                                </div>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        placeholder="Password"
                                        className="w-full rounded-xl border text-sm focus:outline-none transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(129,140,248,0.2)',
                                            color: '#e2e8f0',
                                            padding: '0.75rem 2.75rem 0.75rem 2.5rem',
                                        }}
                                        onFocus={e => (e.target.style.borderColor = 'rgba(129,140,248,0.6)')}
                                        onBlur={e => (e.target.style.borderColor = 'rgba(129,140,248,0.2)')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
                                        style={{ color: '#4b5563' }}
                                    >
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                id="sa-login-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
                                style={{
                                    marginTop: '8px',
                                    background: loading
                                        ? 'rgba(99,102,241,0.5)'
                                        : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                                    color: '#fff',
                                    boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.35)',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                                            style={{ display: 'inline-block' }}
                                        />
                                        Authenticating…
                                    </>
                                ) : (
                                    <>
                                        <Shield size={15} /> Access Command Centre <ArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            <span className="text-xs" style={{ color: '#374151' }}>or</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        {/* Back to auth gateway */}
                        <p className="text-center text-xs" style={{ color: '#374151' }}>
                            Not a super admin?{' '}
                            <button
                                onClick={() => navigate('/auth')}
                                className="font-bold hover:opacity-80 transition-opacity"
                                style={{ color: '#6366f1' }}
                            >
                                Return to portal selection →
                            </button>
                        </p>

                        {/* Dev shortcut */}
                        {isLocalhost && (
                            <div
                                className="mt-8 rounded-xl p-4"
                                style={{ background: 'rgba(99,102,241,0.05)', border: '1px dashed rgba(99,102,241,0.25)' }}
                            >
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Activity size={11} style={{ color: '#6366f1' }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>
                                        Dev Mode
                                    </span>
                                </div>
                                <p className="text-xs mb-3" style={{ color: '#4b5563' }}>
                                    Bypass authentication and jump straight into the Super Admin portal.
                                </p>
                                <button
                                    id="sa-dev-login-btn"
                                    type="button"
                                    onClick={handleDevLogin}
                                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                                >
                                    <Zap size={13} /> Login as Super Admin <ArrowRight size={13} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
