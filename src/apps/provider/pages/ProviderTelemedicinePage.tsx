import React from 'react';
import { Video } from 'lucide-react';

// No backend telemedicine session module is connected here yet.
// The previous version showed mock telemedicine sessions, symptom
// intakes, digital prescriptions, and remote monitoring readings from
// teleMedApi's hardcoded MOCK_* arrays — none reflected real patients
// or sessions. Honest placeholder until a real integration is built.
export function ProviderTelemedicinePage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Telemedicine</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Virtual consultations and remote patient monitoring</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <Video size={26} style={{ color: '#0ea5e9' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Telemedicine isn't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Virtual sessions, intake data, and remote monitoring need a real telemedicine backend — none exists yet.
                </p>
            </div>
        </div>
    );
}
