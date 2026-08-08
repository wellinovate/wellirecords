import React from 'react';
import { BarChart2 } from 'lucide-react';

// No backend reporting/analytics endpoints exist yet. The previous
// version showed hardcoded consultation, lab order, prescription, and
// no-show numbers as if they were real clinical and operational
// metrics — none of it reflected actual facility data. Honest
// placeholder until real reporting is built.
export function ReportsPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Reports</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Clinical and operational performance reporting</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                    <BarChart2 size={26} style={{ color: '#38bdf8' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Reports aren't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Consultation volume, lab order trends, prescriptions, and no-show tracking need real aggregation endpoints on the backend — none exist yet.
                </p>
            </div>
        </div>
    );
}
