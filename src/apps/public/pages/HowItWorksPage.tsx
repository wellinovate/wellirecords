import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowLeft, UserPlus, Building2, Shield, Eye, ArrowRight } from 'lucide-react';

const STEPS = [
    { step: '01', icon: UserPlus, title: 'Create Your Vault', desc: 'Sign up as a patient with email or Web3 wallet. Your encrypted health vault is created instantly — free forever.', portal: 'Patient' },
    { step: '02', icon: Building2, title: 'Providers Join', desc: 'Hospitals, labs, and other providers register and verify their organisation. Patient access requires patient consent.', portal: 'Provider' },
    { step: '03', icon: Shield, title: 'You Grant Consent', desc: 'When you book an appointment or visit a provider, you choose exactly what they can see and for how long.', portal: 'Patient' },
    { step: '04', icon: Eye, title: 'Provider Views Records', desc: 'With consent, providers securely access your relevant records. Every access is logged in your audit trail.', portal: 'Provider' },
    { step: '05', icon: ArrowRight, title: 'Records Contributed Back', desc: 'Labs publish results, doctors add notes, pharmacies confirm dispense — all contribute back to YOUR vault.', portal: 'Both' },
];

export function HowItWorksPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen" style={{ background: '#050d1a', color: '#e2eaf4' }}>
            <div className="px-8 py-8"><button onClick={() => navigate('/home')} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: '#7ba3c8' }}><ArrowLeft size={16} /> Back to Home</button></div>
            <div className="max-w-3xl mx-auto px-8 pb-20">
                <h1 className="font-display font-black text-5xl text-center mb-4">How WelliRecord Works</h1>
                <p className="text-center mb-16" style={{ color: '#7ba3c8' }}>A consent-first health record platform built around patient ownership.</p>
                <div className="space-y-6">
                    {STEPS.map((s, i) => (
                        <div key={i} className="card-provider p-6 flex items-start gap-6">
                            <div className="font-display font-black text-4xl flex-shrink-0" style={{ color: 'rgba(56,189,248,.2)' }}>{s.step}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,.1)' }}>
                                        <s.icon size={17} style={{ color: '#38bdf8' }} />
                                    </div>
                                    <h3 className="font-bold text-lg" style={{ color: '#e2eaf4' }}>{s.title}</h3>
                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                                        style={{ background: s.portal === 'Patient' ? 'rgba(26,107,66,.1)' : s.portal === 'Provider' ? 'rgba(56,189,248,.1)' : 'rgba(168,85,247,.1)', color: s.portal === 'Patient' ? '#34d399' : s.portal === 'Provider' ? '#38bdf8' : '#a855f7' }}>
                                        {s.portal}
                                    </span>
                                </div>
                                <p style={{ color: '#7ba3c8' }}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 justify-center mt-12">
                    <button onClick={() => navigate('/auth/patient/signup')} className="btn btn-lg btn-patient">Start as Patient</button>
                    <button onClick={() => navigate('/auth/provider/signup')} className="btn btn-lg btn-provider-outline">Register as Provider</button>
                </div>
            </div>
        </div>
    );
}
