import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle, Wallet, Shield, Users, Activity } from 'lucide-react';

const STYLES = `
@keyframes prov-su-up {
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

const ORG_TYPES = [
    'Hospital / Clinic', 'Diagnostic Lab', 'Pharmacy', 'Telehealth Platform',
    'Insurance Provider', 'NGO', 'Government Ministry', 'Wearable Vendor',
];

export function ProviderSignupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isConnectingWeb3, setIsConnectingWeb3] = useState(false);

    const handleStep1 = (e: React.FormEvent) => { e.preventDefault(); setStep(2); };
    const handleStep2 = (e: React.FormEvent) => { e.preventDefault(); navigate('/auth/provider/verify-org'); };

    const handleWeb3Signup = () => {
        setIsConnectingWeb3(true);
        setTimeout(() => {
            setIsConnectingWeb3(false);
            navigate('/auth/provider/verify-org');
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
                    <div className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(30,58,138,.04), transparent 70%)' }} />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-1 items-start mb-16">
                            <WelliRecordLogo height={36} theme="light" />
                            <div className="text-xs font-bold tracking-widest uppercase mt-1 pl-1" style={{ color: '#1e3a8a' }}>Provider Portal</div>
                        </div>

                        <h2 className="font-black text-4xl leading-tight mb-4 tracking-tight" style={{ color: '#1e293b' }}>
                            Join the<br />health network.
                        </h2>
                        <p className="text-sm leading-relaxed mb-10" style={{ color: '#475569' }}>
                            Connect your organisation to patient-owned records. Trusted by hospitals, labs, pharmacies, and insurers across Africa.
                        </p>

                        <div className="flex flex-col gap-5">
                            {[
                                { icon: Building2, title: 'Register your org', desc: 'Tell us your organisation type and details.' },
                                { icon: Shield, title: 'Verify & get approved', desc: 'Our team reviews your licence and credentials.' },
                                { icon: Users, title: 'Invite your team', desc: 'Add clinicians, staff, or sub-departments.' },
                                { icon: Activity, title: 'Access patient records', desc: 'With explicit patient consent, always.' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                                        <Icon size={16} style={{ color: '#1e3a8a' }} />
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
                        {['SOC 2 Ready', 'ISO 27001', 'Consent-gated'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
                                <CheckCircle size={12} style={{ color: '#1e3a8a' }} /> {b}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right form panel ── */}
                <div
                    className="flex-1 flex flex-col items-center justify-center px-6 py-12"
                    style={{ background: '#ffffff' }}
                >
                    <div className="w-full max-w-sm" style={{ animation: 'prov-su-up .5s ease both' }}>
                        <button
                            onClick={() => navigate('/auth')}
                            className="flex items-center gap-2 mb-8 text-sm font-semibold hover:opacity-70 transition-opacity"
                            style={{ color: '#475569' }}
                        >
                            <ArrowLeft size={15} /> Back to portal selection
                        </button>

                        {/* Step progress */}
                        <div className="flex gap-2 mb-2">
                            {[1, 2].map(s => (
                                <div
                                    key={s}
                                    className="flex-1 h-1.5 rounded-full transition-all duration-500"
                                    style={{ background: s <= step ? '#1e3a8a' : '#e2e8f0' }}
                                />
                            ))}
                        </div>
                        <p className="text-xs mb-8" style={{ color: '#64748b' }}>
                            Step {step} of 2 — {step === 1 ? 'Organisation details' : 'Admin contact'}
                        </p>

                        {step === 1 ? (
                            <>
                                <div className="mb-8">
                                    <h1 className="font-black text-3xl leading-tight mb-1" style={{ color: '#1e293b' }}>Register Organisation</h1>
                                    <p className="text-sm" style={{ color: '#64748b' }}>Tell us about your organisation.</p>
                                </div>
                                <form onSubmit={handleStep1} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1e293b' }}>Organisation name</label>
                                        <input value={orgName} onChange={e => setOrgName(e.target.value)} className="input input-light bg-white border-slate-200 w-full" placeholder="Lagos General Hospital" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1e293b' }}>Organisation type</label>
                                        <select value={orgType} onChange={e => setOrgType(e.target.value)} className="input input-light bg-white border-slate-200 w-full" required>
                                            <option value="">Select type…</option>
                                            {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 shadow-sm" style={{ background: '#1e3a8a', marginTop: '12px' }}>Continue →</button>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h1 className="font-black text-3xl leading-tight mb-1" style={{ color: '#1e293b' }}>Admin Contact</h1>
                                    <p className="text-sm" style={{ color: '#64748b' }}>This person will manage the organisation account.</p>
                                </div>
                                <form onSubmit={handleStep2} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1e293b' }}>Full name</label>
                                        <input value={name} onChange={e => setName(e.target.value)} className="input input-light bg-white border-slate-200 w-full" placeholder="Dr. Fatima Aliyu" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1e293b' }}>Work email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input input-light bg-white border-slate-200 w-full" placeholder="you@org.ng" required />
                                    </div>

                                    {/* Compliance note */}
                                    <div className="rounded-xl p-3 flex gap-3 items-start" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <Shield size={14} style={{ color: '#1e3a8a', flexShrink: 0, marginTop: 2 }} />
                                        <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                                            Verification typically takes 1–2 business days. All provider access is consent-gated and fully audit-logged.
                                        </p>
                                    </div>

                                    <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 shadow-sm" style={{ background: '#1e3a8a', marginTop: '12px' }}>Submit for Verification →</button>
                                </form>
                            </>
                        )}

                        <div className="relative my-6">
                            <div className="border-t border-slate-200 w-full" />
                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs bg-white" style={{ color: '#94a3b8' }}>or</span>
                        </div>

                        <button
                            onClick={handleWeb3Signup}
                            disabled={isConnectingWeb3}
                            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
                            style={{ color: '#1e3a8a', border: '1.5px solid #cbd5e1', opacity: isConnectingWeb3 ? 0.7 : 1 }}
                        >
                            <Wallet size={15} /> {isConnectingWeb3 ? 'Connecting Wallet...' : 'Connect Org Wallet (Web3)'}
                        </button>

                        <p className="mt-5 text-center text-sm" style={{ color: '#64748b' }}>
                            Already registered?{' '}
                            <Link to="/auth/provider/login" className="font-bold hover:underline" style={{ color: '#1e3a8a' }}>Sign in →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
