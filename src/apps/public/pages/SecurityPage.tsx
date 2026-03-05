import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, Eye, Server, Key, Globe } from 'lucide-react';

const PILLARS = [
    { icon: Lock, title: 'End-to-End Encryption', desc: 'All health records are encrypted at rest (AES-256) and in transit (TLS 1.3). Only the patient and explicitly consented parties can access data.' },
    { icon: Shield, title: 'NDPR & HIPAA Alignment', desc: 'Designed from day one to align with Nigerian Data Protection Regulation (NDPR) and international HIPAA standards.' },
    { icon: Eye, title: 'Immutable Audit Trails', desc: 'Every access event is permanently logged. Patients see exactly who accessed what and when — with full provenance.' },
    { icon: Key, title: 'Zero-Knowledge Architecture', desc: 'WelliRecord never has direct access to your PHI. Patient keys are managed client-side with optional on-chain identity via wallet.' },
    { icon: Server, title: 'Sovereign Data Hosting', desc: 'Data is hosted on NG-CERTs compliant infrastructure in Nigerian data centres for sovereign ownership.' },
    { icon: Globe, title: 'FHIR R4 Standards', desc: 'All records are stored in HL7 FHIR R4 format, ensuring portability and interoperability with any compliant system globally.' },
];

export function SecurityPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen" style={{ background: '#050d1a', color: '#e2eaf4' }}>
            <div className="px-8 py-8"><button onClick={() => navigate('/home')} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: '#7ba3c8' }}><ArrowLeft size={16} /> Back</button></div>
            <div className="max-w-5xl mx-auto px-8 pb-20">
                <h1 className="font-display font-black text-5xl text-center mb-4">Security & Privacy</h1>
                <p className="text-center mb-12" style={{ color: '#7ba3c8' }}>We take patient data security as a foundational principle, not an afterthought.</p>
                <div className="grid md:grid-cols-2 gap-5">
                    {PILLARS.map(p => (
                        <div key={p.title} className="card-provider p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(56,189,248,.1)' }}>
                                <p.icon size={20} style={{ color: '#38bdf8' }} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1" style={{ color: '#e2eaf4' }}>{p.title}</h3>
                                <p className="text-sm" style={{ color: '#7ba3c8' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 card-provider p-8 text-center">
                    <Shield size={40} className="mx-auto mb-4" style={{ color: '#38bdf8' }} />
                    <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#e2eaf4' }}>Bug Bounty Program</h2>
                    <p style={{ color: '#7ba3c8' }}>We run a responsible disclosure program. If you find a security vulnerability, report it to security@welli.ng and we will reward responsible researchers.</p>
                </div>
            </div>
        </div>
    );
}
