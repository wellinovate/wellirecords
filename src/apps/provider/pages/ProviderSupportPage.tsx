import React from 'react';
import { HelpCircle } from 'lucide-react';

// No backend support-ticket endpoint exists yet. The previous
// version showed mock tickets from supportApi's hardcoded data as if
// they were real submitted issues. Honest placeholder until a real
// support system is built.
export function ProviderSupportPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Support</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Report issues and track resolution</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <HelpCircle size={26} style={{ color: '#f59e0b' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Support tickets aren't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Issue submission and ticket tracking need a real support backend — none exists yet.
                </p>
            </div>
        </div>
    );
}
