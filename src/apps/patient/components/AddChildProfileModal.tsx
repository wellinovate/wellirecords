import React, { useState } from 'react';
import { X, Calendar, User, UserPlus, FileText } from 'lucide-react';

interface AddChildProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddChildProfileModal({ isOpen, onClose }: AddChildProfileModalProps) {
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1: Basic Info
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Male');

    // Step 2: EHR & Linking
    const [connectEHR, setConnectEHR] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app this would call the API
        alert(`Child Profile Created for ${firstName} ${lastName}`);
        onClose();
        setStep(1); // Reset
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderColor: 'rgba(26,107,66,.1)' }}>
                    <div>
                        <h2 className="font-bold text-lg" style={{ color: '#0f2818', fontFamily: '"Bricolage Grotesque", sans-serif' }}>
                            Add Child Profile
                        </h2>
                        <p className="text-xs font-medium" style={{ color: '#4a6e58' }}>
                            Step {step} of 2 &bull; {step === 1 ? 'Basic Details' : 'Health Records'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} style={{ color: '#4a6e58' }} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a2e1e' }}>First Name</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full rounded-xl border text-sm focus:outline-none focus:ring-2 bg-gray-50/50"
                                            style={{ padding: '0.65rem 0.75rem 0.65rem 2.25rem', borderColor: 'rgba(26,107,66,.15)' }}
                                            placeholder="Aiden"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a2e1e' }}>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full rounded-xl border text-sm focus:outline-none focus:ring-2 bg-gray-50/50"
                                        style={{ padding: '0.65rem 0.75rem', borderColor: 'rgba(26,107,66,.15)' }}
                                        placeholder="Smith"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a2e1e' }}>Date of Birth</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full rounded-xl border text-sm focus:outline-none focus:ring-2 bg-gray-50/50"
                                        style={{ padding: '0.65rem 0.75rem 0.65rem 2.25rem', borderColor: 'rgba(26,107,66,.15)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a2e1e' }}>Biological Sex</label>
                                <div className="grid grid-cols-2 text-sm">
                                    <button
                                        className={`py-2.5 border rounded-l-xl font-semibold transition-colors ${gender === 'Male' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 z-10 relative' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                        onClick={() => setGender('Male')}
                                    >
                                        Male
                                    </button>
                                    <button
                                        className={`py-2.5 border rounded-r-xl border-l-0 font-semibold transition-colors ${gender === 'Female' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 border-l px-[1px] -ml-[1px] z-10 relative' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                        onClick={() => setGender('Female')}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up">

                            {/* Option 1: Standalone */}
                            <label className={`block rounded-2xl border-2 p-4 cursor-pointer transition-all ${!connectEHR ? 'bg-emerald-50/50 border-emerald-500 shadow-sm' : 'bg-white border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-200'}`}>
                                <div className="flex gap-4">
                                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${!connectEHR ? 'border-emerald-500' : 'border-gray-300'}`}>
                                        {!connectEHR && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={!connectEHR} onChange={() => setConnectEHR(false)} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <UserPlus size={16} className={!connectEHR ? "text-emerald-700" : "text-gray-500"} />
                                            <h4 className="font-bold text-sm" style={{ color: '#0f2818' }}>Create Standalone Profile</h4>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: '#4a6e58' }}>
                                            Generates a blank health record. You can manually input vaccines, allergies, and growth data.
                                        </p>
                                    </div>
                                </div>
                            </label>

                            {/* Option 2: Connect EHR */}
                            <label className={`block rounded-2xl border-2 p-4 cursor-pointer transition-all ${connectEHR ? 'bg-emerald-50/50 border-emerald-500 shadow-sm' : 'bg-white border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-200'}`}>
                                <div className="flex gap-4">
                                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${connectEHR ? 'border-emerald-500' : 'border-gray-300'}`}>
                                        {connectEHR && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={connectEHR} onChange={() => setConnectEHR(true)} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText size={16} className={connectEHR ? "text-emerald-700" : "text-gray-500"} />
                                            <h4 className="font-bold text-sm" style={{ color: '#0f2818' }}>Link existing EHR Record</h4>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: '#4a6e58' }}>
                                            Import birth records and history from a hospital. Requires a Link Code from the pediatrician.
                                        </p>

                                        {connectEHR && (
                                            <div className="mt-4 pt-4 border-t border-emerald-500/10">
                                                <input
                                                    type="text"
                                                    className="w-full rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white"
                                                    style={{ padding: '0.65rem 0.75rem', borderColor: 'rgba(26,107,66,.25)' }}
                                                    placeholder="Enter 8-digit EHR Link Code"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50/50 sticky bottom-0" style={{ borderColor: 'rgba(26,107,66,.08)' }}>
                    <div className="flex gap-3">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white border hover:bg-gray-50 transition-colors"
                                style={{ color: '#4a6e58', borderColor: 'rgba(26,107,66,.2)' }}
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 1 ? () => setStep(2) : handleSubmit}
                            disabled={step === 1 && (!firstName || !lastName || !dob)}
                            className="flex-[2] py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #1a6b42, #248b57)', boxShadow: '0 4px 12px rgba(26,107,66,.2)' }}
                        >
                            {step === 1 ? 'Continue to Linking' : 'Create Profile'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
