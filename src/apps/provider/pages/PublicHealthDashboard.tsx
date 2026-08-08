import React from 'react';
import { Activity } from 'lucide-react';

// No backend public health surveillance endpoints exist yet. The
// previous version showed hardcoded disease case counts (malaria,
// hypertension, respiratory infections, diabetes) with fabricated
// trend percentages, presented as real facility surveillance data.
// Honest placeholder until real aggregation is built.
export function PublicHealthDashboard() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Public Health Surveillance</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Disease burden tracking across your facility</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <Activity size={26} style={{ color: '#ef4444' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Surveillance data isn't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Disease case tracking and trend reporting need a real diagnosis aggregation endpoint on the backend — none exists yet.
                </p>
            </div>
        </div>
    );
}
