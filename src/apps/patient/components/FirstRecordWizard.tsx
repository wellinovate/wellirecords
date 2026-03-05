import React, { useState, useCallback } from 'react';
import {
    X, ChevronRight, ChevronLeft, FlaskConical, Pill, ScanLine,
    Stethoscope, Syringe, FileText, AlertTriangle, Activity,
    UploadCloud, Camera, CheckCircle2, ShieldCheck, Sparkles, HardDrive,
} from 'lucide-react';

interface FirstRecordWizardProps {
    onClose: () => void;
}

const RECORD_TYPES = [
    { id: 'Lab Result', label: 'Lab Result', icon: FlaskConical, color: '#3b82f6', desc: 'Blood work, urinalysis, pathology' },
    { id: 'Prescription', label: 'Prescription', icon: Pill, color: '#8b5cf6', desc: 'Medications & refills' },
    { id: 'Imaging', label: 'Imaging', icon: ScanLine, color: '#ec4899', desc: 'X-ray, MRI, CT, ultrasound' },
    { id: 'Clinical Note', label: 'Clinical Note', icon: Stethoscope, color: '#1a6b42', desc: 'Doctor visit summaries & SOAP notes' },
    { id: 'Vaccination', label: 'Vaccination', icon: Syringe, color: '#f59e0b', desc: 'Immunisation records & travel shots' },
    { id: 'Chronic Condition', label: 'Chronic Condition', icon: Activity, color: '#ef4444', desc: 'Ongoing diagnoses & management' },
    { id: 'Allergy', label: 'Allergy', icon: AlertTriangle, color: '#f97316', desc: 'Drug, food & environmental allergies' },
    { id: 'Encounter', label: 'Other Document', icon: FileText, color: '#14b8a6', desc: 'Referrals, discharge letters, etc.' },
];

const STEPS = ['Welcome', 'Choose Type', 'Upload', 'Done'];

export function FirstRecordWizard({ onClose }: FirstRecordWizardProps) {
    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setFileName(file.name);
        // Simulate processing delay then advance
        setTimeout(() => setStep(3), 800);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,24,14,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-lg animate-fade-in-up"
                style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 32px 80px rgba(26,107,66,0.18)',
                    overflow: 'hidden',
                }}
            >
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4"
                    style={{ borderBottom: '1px solid rgba(26,107,66,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(26,107,66,0.1)' }}>
                            <HardDrive size={16} style={{ color: '#1a6b42' }} />
                        </div>
                        <div>
                            <div className="font-bold text-sm" style={{ color: '#1a2e1e' }}>Add Your First Record</div>
                            <div className="text-xs" style={{ color: '#9ca3af' }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(0,0,0,0.05)' }}>
                        <X size={14} style={{ color: '#6b7280' }} />
                    </button>
                </div>

                {/* Step progress pills */}
                <div className="flex gap-1.5 px-6 py-3">
                    {STEPS.map((_, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= step ? '#1a6b42' : 'rgba(26,107,66,0.12)' }} />
                    ))}
                </div>

                {/* Body */}
                <div className="px-6 pb-6" style={{ minHeight: '320px' }}>

                    {/* ── Step 0: Welcome ── */}
                    {step === 0 && (
                        <div className="animate-fade-in">
                            <div className="text-center pt-4 pb-6">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#1a6b42,#2d9d63)' }}>
                                    <ShieldCheck size={32} color="#fff" />
                                </div>
                                <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#1a2e1e' }}>
                                    Welcome to Health Vault
                                </h2>
                                <p className="text-sm leading-relaxed" style={{ color: '#5a7a63' }}>
                                    Your <strong>WelliFile</strong> is a single, encrypted, portable container of
                                    your entire medical history — lab results, prescriptions, scans, and more.
                                    It belongs to you, not any hospital or clinic.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: ShieldCheck, text: 'End-to-end encrypted & stored securely on-device', color: '#1a6b42' },
                                    { icon: Sparkles, text: 'Share with any provider in seconds via QR code', color: '#8b5cf6' },
                                    { icon: HardDrive, text: 'Export as FHIR, PDF, or QR — you always own it', color: '#3b82f6' },
                                ].map(({ icon: Icon, text, color }) => (
                                    <div key={text} className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${color}15` }}>
                                            <Icon size={15} style={{ color }} />
                                        </div>
                                        <p className="text-sm" style={{ color: '#374151' }}>{text}</p>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setStep(1)}
                                className="btn btn-patient w-full mt-6 gap-2 justify-center">
                                Let's Add Your First Record <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ── Step 1: Choose Record Type ── */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="font-bold text-base mb-1 pt-2" style={{ color: '#1a2e1e' }}>What kind of record is it?</h2>
                            <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Choose the category that best describes your document.</p>

                            <div className="grid grid-cols-2 gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {RECORD_TYPES.map(({ id, label, icon: Icon, color, desc }) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedType(id)}
                                        className="text-left p-3 rounded-xl transition-all"
                                        style={{
                                            border: `2px solid ${selectedType === id ? color : 'rgba(0,0,0,0.08)'}`,
                                            background: selectedType === id ? `${color}0e` : '#fafafa',
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                                            style={{ background: `${color}18` }}>
                                            <Icon size={16} style={{ color }} />
                                        </div>
                                        <div className="font-semibold text-xs mb-0.5" style={{ color: '#1a2e1e' }}>{label}</div>
                                        <div className="text-[10px] leading-tight" style={{ color: '#9ca3af' }}>{desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setStep(0)}
                                    className="btn btn-patient-outline gap-1 flex-shrink-0">
                                    <ChevronLeft size={14} /> Back
                                </button>
                                <button onClick={() => selectedType && setStep(2)}
                                    className="btn btn-patient flex-1 gap-2 justify-center"
                                    style={{ opacity: selectedType ? 1 : 0.4, cursor: selectedType ? 'pointer' : 'not-allowed' }}>
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Upload ── */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="font-bold text-base mb-1 pt-2" style={{ color: '#1a2e1e' }}>Upload your document</h2>
                            <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
                                Accepted: PDF, JPG, PNG · Max 20 MB
                            </p>

                            {/* Drop zone */}
                            <label
                                htmlFor="wiz-file-input"
                                className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all"
                                style={{
                                    border: `2px dashed ${dragOver ? '#1a6b42' : 'rgba(26,107,66,0.25)'}`,
                                    background: dragOver ? 'rgba(26,107,66,0.06)' : 'rgba(26,107,66,0.02)',
                                    minHeight: '160px',
                                    padding: '24px',
                                }}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(26,107,66,0.1)' }}>
                                    <UploadCloud size={24} style={{ color: '#1a6b42' }} />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm" style={{ color: '#1a2e1e' }}>
                                        Drop file here or <span style={{ color: '#1a6b42' }}>browse</span>
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>PDF, JPG, PNG — up to 20 MB</p>
                                </div>
                                <input
                                    id="wiz-file-input"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={onFileInput}
                                />
                            </label>

                            <div className="flex items-center gap-2 my-3">
                                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
                                <span className="text-xs" style={{ color: '#9ca3af' }}>or</span>
                                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
                            </div>

                            <button className="btn btn-patient-outline w-full gap-2 justify-center text-sm">
                                <Camera size={15} /> Take a Photo with Camera
                            </button>

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setStep(1)}
                                    className="btn btn-patient-outline gap-1 flex-shrink-0">
                                    <ChevronLeft size={14} /> Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Success ── */}
                    {step === 3 && (
                        <div className="animate-fade-in text-center pt-4">
                            <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg,#1a6b42,#2d9d63)' }}>
                                <CheckCircle2 size={40} color="#fff" />
                            </div>

                            <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#1a2e1e' }}>
                                Record Added! 🎉
                            </h2>
                            <p className="text-sm leading-relaxed mb-2" style={{ color: '#5a7a63' }}>
                                {fileName ? <><strong>{fileName}</strong> has been</> : 'Your record has been'} securely
                                added to your Health Vault and verified on the WelliChain.
                            </p>

                            <div className="my-5 p-4 rounded-2xl text-left"
                                style={{ background: 'rgba(26,107,66,0.06)', border: '1px solid rgba(26,107,66,0.15)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={14} style={{ color: '#1a6b42' }} />
                                    <span className="font-semibold text-xs" style={{ color: '#1a6b42' }}>WelliChain Verified</span>
                                </div>
                                <p className="text-xs" style={{ color: '#5a7a63' }}>
                                    This record's hash is stored on the WelliChain ledger — tamper-proof and timestamped forever.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={onClose}
                                    className="btn btn-patient-outline flex-1 text-sm">
                                    View My Vault
                                </button>
                                <button onClick={() => { setStep(1); setSelectedType(null); setFileName(null); }}
                                    className="btn btn-patient flex-1 gap-1.5 text-sm">
                                    <UploadCloud size={14} /> Add Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
