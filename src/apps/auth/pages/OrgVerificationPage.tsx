import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Upload, FileText, ArrowRight } from 'lucide-react';

const STEPS = [
    { icon: FileText, title: 'Details Submitted', desc: 'Your org information has been received.', done: true },
    { icon: Upload, title: 'Document Upload', desc: 'Upload CAC certificate or operating license.', done: false },
    { icon: Clock, title: 'Under Review', desc: 'Our compliance team will verify within 24-48 hrs.', done: false },
    { icon: CheckCircle, title: 'Approved & Active', desc: 'You will receive an email with login credentials.', done: false },
];

export function OrgVerificationPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(145deg, #050d1a 0%, #0c1e35 60%, #0f3050 100%)' }}>
            <div className="w-full max-w-lg">
                <div className="card-provider p-8 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(56,189,248,.12)', border: '2px solid rgba(56,189,248,.3)' }}>
                        <Clock size={28} style={{ color: '#38bdf8' }} />
                    </div>
                    <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#e2eaf4' }}>Organisation Verification</h2>
                    <p className="text-sm mb-8" style={{ color: '#7ba3c8' }}>
                        Thank you for registering. Please complete the verification steps below to activate your portal.
                    </p>

                    <div className="space-y-4 text-left mb-8">
                        {STEPS.map((step, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl"
                                style={{ background: step.done ? 'rgba(56,189,248,.08)' : 'rgba(255,255,255,.03)', border: `1px solid ${step.done ? 'rgba(56,189,248,.2)' : 'rgba(255,255,255,.05)'}` }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: step.done ? 'rgba(56,189,248,.2)' : 'rgba(255,255,255,.06)' }}>
                                    {step.done ? <CheckCircle size={16} style={{ color: '#38bdf8' }} /> : <step.icon size={16} style={{ color: '#7ba3c8' }} />}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm" style={{ color: step.done ? '#38bdf8' : '#e2eaf4' }}>{step.title}</div>
                                    <div className="text-xs" style={{ color: '#7ba3c8' }}>{step.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mock document upload area */}
                    <div className="border-2 border-dashed rounded-xl p-6 mb-6 cursor-pointer hover:border-sky-400 transition-colors"
                        style={{ borderColor: 'rgba(56,189,248,.3)', background: 'rgba(56,189,248,.04)' }}>
                        <Upload size={24} className="mx-auto mb-2" style={{ color: '#38bdf8' }} />
                        <p className="text-sm font-medium" style={{ color: '#e2eaf4' }}>Upload CAC Certificate / Operating License</p>
                        <p className="text-xs" style={{ color: '#7ba3c8' }}>PDF, JPG, PNG up to 10MB</p>
                    </div>

                    <button onClick={() => navigate('/auth/provider/login')} className="btn btn-provider-outline justify-center w-full">
                        Back to Login <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
