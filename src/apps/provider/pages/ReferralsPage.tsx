import React from 'react';
import { GitBranch } from 'lucide-react';

// No backend endpoint for referrals exists (no referral model,
// routes, or organization directory), so this used to show fake
// referrals and let you "send" a referral to a fabricated org list —
// nothing was ever actually sent. Honest placeholder until that's built.
export function ReferralsPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Referrals</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Send and track patient referrals across organisations</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,.1)' }}>
                    <GitBranch size={26} style={{ color: '#6366f1' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Referrals aren't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Cross-organization referrals need a directory of connected facilities and a referral record on the backend — neither exists yet.
                </p>
            </div>
        </div>
    );
}
