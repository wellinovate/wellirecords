import React from 'react';
import { Shield } from 'lucide-react';

// No backend HMO/insurance module exists — eligibility checks,
// pre-authorization requests, and claims all previously ran against
// fabricated data, including a fake "Eligible"/"Expired" verdict that
// could mislead real billing decisions. Honest placeholder until a
// real insurance integration is built.
export function HMODeskPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-xl font-black" style={{ color: '#e2e8f0' }}>HMO / Insurance Desk</h1>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Eligibility checks · Pre-authorisation · Claims attachments</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(15,118,110,0.15)' }}>
                    <Shield size={26} style={{ color: '#0f766e' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>HMO & Insurance Integration coming soon</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Eligibility checks, pre-authorisation requests, and claims submission will be available once the insurance portal integration is complete.
                </p>
            </div>
        </div>
    );
}
