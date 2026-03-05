import React from 'react';
import { Crown, Zap, ArrowRight, Star } from 'lucide-react';
import { FeatureTier } from '@/shared/rbac/permissions';

// ─── AccessTierBanner ─────────────────────────────────────────────────────────
// Renders a premium-locked inline section banner within patient portal pages.

interface AccessTierBannerProps {
    tier: FeatureTier;
    featureLabel: string;
    description: string;
    /** If true, renders only a compact chip badge (for sidebars) */
    compact?: boolean;
}

export function AccessTierBanner({ tier, featureLabel, description, compact = false }: AccessTierBannerProps) {
    if (tier === 'standard') return null;

    if (compact) {
        return (
            <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-auto flex-shrink-0"
                style={{
                    background: 'linear-gradient(135deg, #b8860b, #d4af37)',
                    color: '#fff',
                }}
            >
                <Crown size={7} fill="currentColor" /> Pro
            </span>
        );
    }

    return (
        <div
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-5"
            style={{
                background: 'linear-gradient(135deg, #0b1930 0%, #041e42 60%, #0c3870 100%)',
                border: '1.5px solid rgba(212,175,55,0.25)',
                boxShadow: '0 4px 24px rgba(4,30,66,0.3)',
            }}
        >
            {/* Gold shimmer accent */}
            <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                    transform: 'translate(30%, -30%)',
                }}
            />

            {/* Crown icon */}
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
            >
                <Crown size={22} color="#fff" fill="#fff" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37' }}
                    >
                        Premium Feature
                    </span>
                </div>
                <h3 className="font-black text-base text-white leading-tight mb-1">{featureLabel}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{description}</p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
                    style={{
                        background: 'linear-gradient(135deg, #b8860b, #d4af37)',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(212,175,55,0.35)',
                    }}
                >
                    <Star size={13} fill="currentColor" /> Upgrade
                </button>
            </div>
        </div>
    );
}

// ─── ProviderConsentBanner ───────────────────────────────────────────────────
// Shown in EHR viewer when a provider is viewing patient data under a consent grant.

import { ConsentScope } from '@/shared/types/types';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface ConsentScopeBannerProps {
    scope: ConsentScope;
    patientName: string;
    grantedBy: string;
    expiresAt: string | null;
    purpose: string;
    onRequestMoreAccess?: () => void;
}

export function ConsentScopeBanner({
    scope,
    patientName,
    grantedBy,
    expiresAt,
    purpose,
    onRequestMoreAccess,
}: ConsentScopeBannerProps) {
    const isExpiringSoon = expiresAt
        ? new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
        : false;

    const scopeLabel: Record<ConsentScope, string> = {
        full: 'Full Health Record',
        labs: 'Lab Results Only',
        medications: 'Prescriptions Only',
        imaging: 'Imaging Only',
        immunizations: 'Immunisation Records',
        clinical_notes: 'Clinical Notes Only',
        encounters: 'Encounter Records',
        custom: 'Custom Scope',
    };

    return (
        <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3.5 rounded-2xl mb-6"
            style={{
                background: scope === 'full'
                    ? 'linear-gradient(135deg, rgba(4,30,66,0.08) 0%, rgba(4,30,66,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%)',
                border: `1.5px solid ${scope === 'full' ? 'rgba(4,30,66,0.15)' : 'rgba(245,158,11,0.2)'}`,
            }}
        >
            {/* Icon */}
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: scope === 'full' ? 'rgba(4,30,66,0.1)' : 'rgba(245,158,11,0.12)',
                }}
            >
                <Shield size={18} style={{ color: scope === 'full' ? '#041e42' : '#d97706' }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: '#041e42' }}>
                        Viewing: {scopeLabel[scope]}
                    </span>
                    <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                            background: scope === 'full' ? 'rgba(4,30,66,0.1)' : 'rgba(245,158,11,0.15)',
                            color: scope === 'full' ? '#041e42' : '#92400e',
                        }}
                    >
                        {scope} consent
                    </span>
                    {isExpiringSoon && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"
                            style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                            <AlertTriangle size={9} /> Expiring Soon
                        </span>
                    )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    Granted by <strong>{patientName}</strong> for <em>{purpose}</em>
                    {expiresAt && ` · Expires ${new Date(expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
            </div>

            {/* Request More */}
            {onRequestMoreAccess && (
                <button
                    onClick={onRequestMoreAccess}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
                    style={{ background: 'rgba(4,30,66,0.08)', color: '#041e42', border: '1px solid rgba(4,30,66,0.15)' }}
                >
                    Request Full Access <ArrowRight size={11} />
                </button>
            )}
        </div>
    );
}
