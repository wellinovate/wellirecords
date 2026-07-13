import React from 'react';
import welliIconSrc from '@/assets/welli-icon.png';

/**
 * WelliRecordLogo
 * ─────────────────────────────────────────────────────────────────────────────
 * Composite logo component: official shield PNG + "WelliRecord" wordmark.
 *
 * Props
 *  variant   'full'     – shield + wordmark (default)
 *            'icon'     – shield mark only
 *            'wordmark' – text only
 *  theme     'dark'     – navy on white / transparent (default)
 *            'light'    – white on dark (sidebars, dark backgrounds)
 *  height    pixel height for the element (default 40)
 *  tagline   show "YOUR HEALTH, SECURED. EVERYWHERE." below (default false)
 */
export interface WelliRecordLogoProps {
    variant?: 'full' | 'icon' | 'wordmark';
    theme?: 'dark' | 'light';
    height?: number;
    tagline?: boolean;
    className?: string;
}

export function WelliRecordLogo({
    variant = 'full',
    theme = 'dark',
    height = 40,
    tagline = false,
    className = '',
}: WelliRecordLogoProps) {
    const wordmarkColor = theme === 'dark' ? '#1e3a8a' : '#ffffff';
    const taglineColor  = theme === 'dark' ? '#1e3a8a' : 'rgba(255,255,255,0.65)';

    // ── Shield PNG icon ───────────────────────────────────────────────────────
    const ShieldMark = () => (
        <img
            src={welliIconSrc}
            alt="WelliRecord"
            style={{ height: '100%', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />
    );

    // ── Wordmark ─────────────────────────────────────────────────────────────
    const Wordmark = () => (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span
                style={{
                    color: wordmarkColor,
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: height * 0.62,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                }}
            >
                Welli<span style={{ fontWeight: 400 }}>Record</span>
                <sup style={{ fontSize: height * 0.22, fontWeight: 400, verticalAlign: 'super' }}>™</sup>
            </span>
            {tagline && (
                <span
                    style={{
                        color: taglineColor,
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: height * 0.22,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        opacity: 0.65,
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                    }}
                >
                    One patient. One trusted record. Accessible when it matters.
                </span>
            )}
        </div>
    );

    if (variant === 'icon') {
        return (
            <div className={className} style={{ height, display: 'inline-flex', alignItems: 'center' }}>
                <ShieldMark />
            </div>
        );
    }

    if (variant === 'wordmark') {
        return (
            <div className={className} style={{ height, display: 'inline-flex', alignItems: 'center' }}>
                <Wordmark />
            </div>
        );
    }

    // Full = shield + wordmark
    return (
        <div
            className={className}
            style={{ height, display: 'inline-flex', alignItems: 'center', gap: height * 0.3 }}
        >
            <ShieldMark />
            <Wordmark />
        </div>
    );
}
