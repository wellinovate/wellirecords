import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    HeartPulse, User, Mail, Lock, ArrowLeft,
    Eye, EyeOff, Wallet, Shield, CheckCircle
} from 'lucide-react';

const STYLES = `
@keyframes pat-su-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}
`;
function StyleOnce({ css }: { css: string }) {
    const injected = useRef(false);
    useEffect(() => {
        if (injected.current) return;
        const tag = document.createElement('style');
        tag.textContent = css;
        document.head.appendChild(tag);
        injected.current = true;
    }, [css]);
    return null;
}

export function PatientSignupPage() {
    const navigate = useNavigate();
    const { signUpPatient } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileType, setProfileType] = useState('Personal');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isConnectingWeb3, setIsConnectingWeb3] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        signUpPatient(name, email);
        navigate('/patient/overview');
    };

    const handleWeb3Signup = () => {
        setIsConnectingWeb3(true);
        setTimeout(() => {
            setIsConnectingWeb3(false);
            signUpPatient('Web3 User', 'web3@patient.com');
            navigate('/patient/overview');
        }, 1500);
    };

    return (
        <>
            <StyleOnce css={STYLES} />
            <div className="min-h-screen flex" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>

                {/* ── Left brand panel ── */}
                <div
                    className="hidden lg:flex flex-col justify-between w-2/5 px-12 py-12 relative overflow-hidden"
                    style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}
                >
                    <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,.06), transparent 70%)' }} />
                    <div className="absolute bottom-[-60px] right-[-60px] w-[260px] h-[260px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(30,58,138,.04), transparent 70%)' }} />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-1 items-start mb-16">
                            <WelliRecordLogo height={36} theme="dark" />
                            <div className="text-xs font-bold tracking-widest uppercase mt-1 pl-1" style={{ color: '#0d9488' }}>Patient Portal</div>
                        </div>

                        <h2 className="font-black text-4xl leading-tight mb-4 tracking-tight" style={{ color: '#1e293b' }}>
                            Your health vault,<br />built for life.
                        </h2>
                        <p className="text-sm leading-relaxed mb-10" style={{ color: '#475569' }}>
                            Join thousands of patients who have taken control of their health records. Free forever — you own 100% of your data.
                        </p>

                        <div className="flex flex-col gap-5">
                            {[
                                { step: '01', title: 'Create your vault', desc: 'Takes 60 seconds, no credit card required.' },
                                { step: '02', title: 'Connect your records', desc: 'Import from hospitals, labs, and wearables.' },
                                { step: '03', title: 'Control who sees what', desc: 'Grant and revoke provider access anytime.' },
                            ].map(({ step, title, desc }) => (
                                <div key={step} className="flex items-start gap-4">
                                    <div className="text-xs font-black w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #ccfbf1' }}>
                                        {step}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold" style={{ color: '#1e293b' }}>{title}</div>
                                        <div className="text-xs" style={{ color: '#64748b' }}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-3 pt-8 border-t" style={{ borderColor: '#e2e8f0' }}>
                        {['HIPAA Ready', 'NDPR Compliant', 'E2E Encrypted'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
                                <CheckCircle size={12} style={{ color: '#0d9488' }} /> {b}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right form panel ── */}
                <div
                    className="flex-1 flex flex-col items-center justify-center px-6 py-12"
                    style={{ background: '#ffffff' }}
                >
                    <div className="w-full max-w-sm" style={{ animation: 'pat-su-up .5s ease both' }}>
                        <button
                            onClick={() => navigate('/auth')}
                            className="flex items-center gap-2 mb-8 text-sm font-semibold hover:opacity-70 transition-opacity"
                            style={{ color: '#4a6e58' }}
                        >
                            <ArrowLeft size={15} /> Back to portal selection
                        </button>

                        <div className="mb-8">
                            <h1 className="font-black text-3xl leading-tight mb-1" style={{ color: '#0f2818' }}>Create your vault</h1>
                            <p className="text-sm" style={{ color: '#4a6e58' }}>Free forever — you own your data 100%</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1a2e1e' }}>Profile type</label>
                                <div className="relative">
                                    <select
                                        value={profileType}
                                        onChange={e => setProfileType(e.target.value)}
                                        className="input input-light w-full appearance-none bg-white"
                                        style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                                    >
                                        <option value="Personal">Personal Profile</option>
                                        <option value="Child">Child (Dependants & Child Records)</option>
                                        <option value="Family">Family Profile</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9ca3af' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1a2e1e' }}>Full name</label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="input input-light" style={{ paddingLeft: '2.6rem' }} placeholder="Amara Okafor" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1a2e1e' }}>Email address</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input input-light" style={{ paddingLeft: '2.6rem' }} placeholder="you@email.com" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1a2e1e' }}>Create password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input input-light" style={{ paddingLeft: '2.6rem', paddingRight: '2.75rem' }} placeholder="Min. 8 characters" required minLength={8} />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Privacy note */}
                            <div className="rounded-xl p-3 flex gap-3 items-start" style={{ background: 'rgba(26,107,66,.07)', border: '1px solid rgba(26,107,66,.15)' }}>
                                <Shield size={15} style={{ color: '#1a6b42', flexShrink: 0, marginTop: 2 }} />
                                <p className="text-xs leading-relaxed" style={{ color: '#4a6e58' }}>
                                    By continuing, you agree to our Terms of Service and Privacy Policy. Your data is AES-256 encrypted and only you control access.
                                </p>
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-patient w-full justify-center" style={{ opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Creating vault…' : 'Create Health Vault →'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="divider-patient" />
                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs" style={{ color: '#9ca3af' }}>or Web3</span>
                        </div>

                        <button
                            onClick={handleWeb3Signup}
                            disabled={isConnectingWeb3}
                            className="btn w-full justify-center gap-2"
                            style={{ background: '#0e1726', color: '#fff', opacity: isConnectingWeb3 ? 0.7 : 1 }}
                        >
                            <Wallet size={15} /> {isConnectingWeb3 ? 'Connecting Wallet...' : 'Connect Web3 Wallet'}
                        </button>

                        <p className="mt-6 text-center text-sm" style={{ color: '#5a7a63' }}>
                            Already have an account?{' '}
                            <Link to="/auth/patient/login" className="font-bold hover:underline" style={{ color: '#1a6b42' }}>Sign in →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
