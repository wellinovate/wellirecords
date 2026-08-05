import React from 'react';
import { Building2 } from 'lucide-react';

// No backend endpoint exists for a platform-wide facility registry
// (subscription tier, staff count, branch count, verification status
// across all organizations). Honest placeholder until a real
// superadmin-scoped organizations endpoint is built.
export function FacilityRegistryPage() {
    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Facility Registry</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Platform-wide facility registry</p>
            </div>

            <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-3" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                    <Building2 size={26} style={{ color: '#38bdf8' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>Platform-wide facility registry isn't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#6b7280' }}>
                    Facility tier, staff count, branches, and verification status across all organizations need a superadmin-scoped endpoint — none exists yet.
                </p>
            </div>
        </div>
    );
}
