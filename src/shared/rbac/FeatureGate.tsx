import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Feature } from './permissions';
import { useRBAC } from './useRBAC';

// ─── FeatureGate ─────────────────────────────────────────────────────────────
// Renders children if user has the required feature permission.
// Otherwise renders a locked overlay.

interface FeatureGateProps {
    feature: Feature;
    children: React.ReactNode;
    /** Custom fallback instead of the default locked overlay */
    fallback?: React.ReactNode;
    /** If true, blurs children instead of hiding them completely */
    blur?: boolean;
    /** Label to display inside the locked state (e.g. "Lab Orders") */
    featureLabel?: string;
    /** Small mode: compact inline lock badge instead of full overlay */
    compact?: boolean;
}

export function FeatureGate({
    feature,
    children,
    fallback,
    blur = false,
    featureLabel,
    compact = false,
}: FeatureGateProps) {
    const { can } = useRBAC();

    if (can(feature)) {
        return <>{children}</>;
    }

    if (fallback) return <>{fallback}</>;

    if (compact) {
        return (
            <div className="relative inline-flex items-center gap-1.5">
                <div className="opacity-40 pointer-events-none select-none">{children}</div>
                <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                    style={{ background: '#041e42', color: '#fff' }}
                >
                    <Lock size={8} /> Locked
                </span>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden">
            {/* Blurred children preview */}
            {blur && (
                <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.35 }}>
                    {children}
                </div>
            )}

            {/* Locked overlay */}
            <div
                className={`${blur ? 'absolute inset-0' : ''} flex flex-col items-center justify-center gap-4 rounded-2xl p-8 border`}
                style={{
                    background: blur ? 'rgba(4,30,66,0.7)' : 'rgba(4,30,66,0.05)',
                    borderColor: 'rgba(4,30,66,0.15)',
                    backdropFilter: blur ? 'blur(2px)' : undefined,
                    minHeight: blur ? undefined : 140,
                }}
            >
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #041e42 0%, #0c3870 100%)' }}
                >
                    <Lock size={22} color="#ffffff" />
                </div>
                <div className="text-center">
                    <div className="font-black text-base mb-1" style={{ color: blur ? '#ffffff' : '#041e42' }}>
                        {featureLabel ? `${featureLabel} — Access Restricted` : 'Access Restricted'}
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: blur ? 'rgba(255,255,255,0.75)' : '#64748b' }}>
                        Your role does not include this feature. Contact your administrator
                        or request access via consent.
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: blur ? '#ffffff' : '#041e42', color: blur ? '#041e42' : '#ffffff' }}
                >
                    Request Access <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── PremiumGate ─────────────────────────────────────────────────────────────
// Specific to patient portal premium features.

interface PremiumGateProps {
    featureKey: string;
    featureLabel: string;
    children: React.ReactNode;
    blur?: boolean;
}

export function PremiumGate({ featureKey, featureLabel, children, blur = true }: PremiumGateProps) {
    const { isPremium } = useRBAC();

    // In a real app you'd check if the patient has an active premium subscription.
    // For the demo all premium features show the upgrade CTA.
    const isLocked = isPremium(featureKey);

    if (!isLocked) return <>{children}</>;

    return (
        <div className="relative rounded-2xl overflow-hidden">
            {blur && (
                <div className="pointer-events-none select-none" style={{ filter: 'blur(5px)', opacity: 0.4 }}>
                    {children}
                </div>
            )}

            <div
                className={`${blur ? 'absolute inset-0' : ''} flex flex-col items-center justify-center gap-4 rounded-2xl p-8`}
                style={{
                    background: blur
                        ? 'linear-gradient(135deg, rgba(4,30,66,0.82) 0%, rgba(12,56,112,0.82) 100%)'
                        : 'linear-gradient(135deg, rgba(4,30,66,0.06) 0%, rgba(12,56,112,0.08) 100%)',
                    border: '1.5px solid rgba(4,30,66,0.18)',
                    backdropFilter: blur ? 'blur(4px)' : undefined,
                    minHeight: blur ? undefined : 160,
                }}
            >
                {/* Crown badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', boxShadow: '0 2px 12px rgba(212,175,55,0.4)' }}>
                    <Crown size={14} color="#fff" fill="#fff" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">WelliRecord Premium</span>
                </div>

                <div className="text-center">
                    <div className="font-black text-lg mb-1.5" style={{ color: blur ? '#ffffff' : '#041e42' }}>
                        {featureLabel}
                    </div>
                    <div className="text-sm leading-relaxed max-w-xs" style={{ color: blur ? 'rgba(255,255,255,0.75)' : '#64748b' }}>
                        Unlock this feature by upgrading to WelliRecord Premium — Nigeria's most trusted digital health experience.
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all"
                        style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#fff', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
                    >
                        <Crown size={14} fill="currentColor" /> Upgrade to Premium
                    </button>
                    <button
                        className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all"
                        style={{ borderColor: blur ? 'rgba(255,255,255,0.3)' : 'rgba(4,30,66,0.2)', color: blur ? '#ffffff' : '#041e42' }}
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
}
