import React from 'react';

/**
 * WelliRecordLogo
 * ─────────────────────────────────────────────────────────────────────────────
 * Inline SVG logo component to replace the broken brand-logo.png.
 * Matches the official mark: navy shield + double-chevron + medical cross +
 * "WelliRecord" wordmark + optional tagline.
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
    const navy = theme === 'dark' ? '#1e3a8a' : '#ffffff';
    const white = theme === 'dark' ? '#ffffff' : '#1e3a8a';

    // ── Shield icon (viewBox 0 0 56 64) ──────────────────────────────────────
    const ShieldMark = () => (
        <svg
            viewBox="0 0 56 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: '100%', width: 'auto', flexShrink: 0 }}
        >
            {/* Shield body */}
            <path
                d="M28 2L4 12V30C4 44.5 14.5 57.2 28 62C41.5 57.2 52 44.5 52 30V12L28 2Z"
                fill={navy}
            />
            {/* Medical cross */}
            <rect x="24.5" y="10" width="7" height="7" rx="1" fill={white} opacity="0.9" />
            <rect x="22" y="12.5" width="12" height="2" rx="1" fill={white} opacity="0.9" />
            {/* Double chevron / W mark */}
            <path
                d="M14 28L22 38L28 32L34 38L42 28"
                stroke={white}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M14 36L22 46L28 40L34 46L42 36"
                stroke={white}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.6"
            />
        </svg>
    );

    // ── Wordmark ─────────────────────────────────────────────────────────────
    const Wordmark = () => (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span
                style={{
                    color: navy,
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
                        color: navy,
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
                    Your Health, Secured. Everywhere.
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
