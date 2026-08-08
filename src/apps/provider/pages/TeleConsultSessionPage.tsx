import React from 'react';
import { Video } from 'lucide-react';

// No backend telemedicine session module is connected here yet.
// The previous version pulled a mock session, intake, vitals, and
// SOAP note from teleMedApi's hardcoded data — nothing was a real
// patient encounter. Honest placeholder until a real integration is
// built.
export function TeleConsultSessionPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Consultation Session</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Live video consult and clinical documentation</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <Video size={26} style={{ color: '#0ea5e9' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Consultation sessions aren't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Live video, SOAP documentation, and session vitals need a real telemedicine backend — none exists yet.
                </p>
            </div>
        </div>
    );
}
