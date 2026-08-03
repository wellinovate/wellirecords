import React from 'react';
import { Users } from 'lucide-react';

// No backend endpoint exists for a platform-wide patient registry
// (only org-scoped patient lists exist for providers). The previous
// version's summary cards (14,872 total, 312 premium, 2,103
// unverified) were hardcoded and didn't even match the 6-row mock
// table directly above them. Honest placeholder until a real
// superadmin-scoped patients endpoint is built.
export function PatientRegistryPage() {
    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-black" style={{ color: '#e5e7eb' }}>Patient Registry</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Platform-wide patient registry</p>
            </div>

            <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-3" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                    <Users size={26} style={{ color: '#38bdf8' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>Platform-wide patient registry isn't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#6b7280' }}>
                    This needs a superadmin-scoped endpoint across all organizations — only per-organization patient lists exist on the backend today.
                </p>
            </div>
        </div>
    );
}
