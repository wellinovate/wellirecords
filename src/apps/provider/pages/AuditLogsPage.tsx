import React from 'react';
import { ScrollText } from 'lucide-react';

// This page used to call consentApi.getProviderGrants(...), a
// function that doesn't exist anywhere on consentApi — a guaranteed
// crash on every render. Even a real fix isn't just "add the
// function": the backend's access-grant endpoints explicitly reject
// any request that isn't the patient themselves (403 "Only the
// patient can..."), so there's no way for a provider to fetch this
// data at all without new backend work. Honest placeholder instead.
export function AuditLogsPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Audit Logs</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Complete immutable access log for your organisation</p>
            </div>

            <div className="card-provider p-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                    <ScrollText size={26} style={{ color: '#38bdf8' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#e2eaf4' }}>Provider-side audit logs aren't available yet</p>
                <p className="text-xs max-w-sm" style={{ color: '#7ba3c8' }}>
                    Access-grant records are currently visible only to the patient who owns them — a provider-facing view needs new backend support that doesn't exist yet.
                </p>
            </div>
        </div>
    );
}
