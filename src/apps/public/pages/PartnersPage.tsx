import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { orgApi } from '@/shared/api/orgApi';

const PARTNER_EXAMPLES = [
    { type: 'Hospital / Clinic', icon: '🏥', desc: 'SOAP notes, lab orders, prescriptions, referrals, discharge summaries' },
    { type: 'Diagnostic Lab', icon: '🔬', desc: 'Lab order queue, result publishing, verification & digital signatures' },
    { type: 'Pharmacy', icon: '💊', desc: 'ePrescription inbox, dispense tracking, medication history write-back' },
    { type: 'Insurance', icon: '🛡️', desc: 'Claims submission, eligibility verification, evidence via consent' },
    { type: 'Telehealth', icon: '📡', desc: 'Session creation, pre-session consent linking, visit note export' },
    { type: 'Wearable Vendor', icon: '⌚', desc: 'OAuth device connection, data ingestion, patient-controlled sync' },
    { type: 'NGO', icon: '🤝', desc: 'Program enrollment, population analytics, subsidy linkage' },
    { type: 'Government / Ministry', icon: '🏛️', desc: 'Anonymized analytics dashboards, program management, subsidy tracking' },
];

export function PartnersPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen" style={{ background: '#050d1a', color: '#e2eaf4' }}>
            <div className="px-8 py-8"><button onClick={() => navigate('/home')} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: '#7ba3c8' }}><ArrowLeft size={16} /> Back</button></div>
            <div className="max-w-5xl mx-auto px-8 pb-20">
                <h1 className="font-display font-black text-5xl text-center mb-4">Partner Ecosystem</h1>
                <p className="text-center mb-12" style={{ color: '#7ba3c8' }}>WelliRecord connects every stakeholder in the healthcare journey — with patient consent at the centre.</p>
                <div className="grid md:grid-cols-2 gap-5 mb-16">
                    {PARTNER_EXAMPLES.map(p => (
                        <div key={p.type} className="card-provider p-6 flex items-start gap-5">
                            <div className="text-4xl">{p.icon}</div>
                            <div>
                                <h3 className="font-bold text-lg mb-1" style={{ color: '#e2eaf4' }}>{p.type}</h3>
                                <p className="text-sm" style={{ color: '#7ba3c8' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <button onClick={() => navigate('/auth/provider/signup')} className="btn btn-lg btn-provider gap-2">Register Your Organisation <ArrowRight size={18} /></button>
                </div>
            </div>
        </div>
    );
}
