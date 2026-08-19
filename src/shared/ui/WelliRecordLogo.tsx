import React from 'react';
import welliIconSrc from '@/assets/welli-icon.png';

/**
 * WelliShieldIcon
 * ─────────────────────────────────────────────────────────────────────────────
 * High-definition vector SVG of the official WelliRecord Shield mark:
 * - Solid brand shield contour
 * - Medical cross '+' in the upper right
 * - Dual upward-pointing security/health chevrons
 */
export function WelliShieldIcon({
  size = 40,
  fillColor = '#062B67',
  iconColor = '#ffffff',
  className = '',
  style = {},
}: {
  size?: number;
  fillColor?: string;
  iconColor?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {/* Shield Base */}
      <path
        d="M50 3.5C72 3.5 93 14.5 93 36.5C93 78.5 50 109 50 109C50 109 7 78.5 7 36.5C7 14.5 28 3.5 50 3.5Z"
        fill={fillColor}
      />
      {/* Medical Plus '+' */}
      <path
        d="M74 20.5H80V27.5H87V33.5H80V40.5H74V33.5H67V27.5H74V20.5Z"
        fill={iconColor}
      />
      {/* Outer Chevron */}
      <path
        d="M50 38.5L80.5 81H65.5L50 59.5L34.5 81H19.5L50 38.5Z"
        fill={iconColor}
      />
      {/* Inner Chevron */}
      <path
        d="M50 64L66 86H55.5L50 78L44.5 86H34L50 64Z"
        fill={iconColor}
      />
    </svg>
  );
}

/**
 * WelliRecordLogo
 * ─────────────────────────────────────────────────────────────────────────────
 * Official WelliRecord Brand Component:
 * - High-resolution SVG shield mark with PNG fallback option
 * - Pixel-perfect brand logotype: "WelliRecord™"
 * - Official brand tagline: "YOUR HEALTH, SECURED. EVERYWHERE."
 *
 * Props
 *  variant      'full'     – shield + wordmark (default)
 *               'icon'     – shield mark only
 *               'wordmark' – text only
 *  theme        'dark'     – navy on light/white background (default)
 *               'light'    – white on dark/navy background
 *  height       pixel height for the element (default 40)
 *  tagline      show "YOUR HEALTH, SECURED. EVERYWHERE." below (default false)
 *  taglineText  custom tagline text override
 *  useSvg       render crisp SVG shield (default true) vs raster PNG
 */
export interface WelliRecordLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'dark' | 'light';
  height?: number;
  tagline?: boolean;
  taglineText?: string;
  useSvg?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function WelliRecordLogo({
  variant = 'full',
  theme = 'dark',
  height = 40,
  tagline = false,
  taglineText = 'One patient. One trusted record. Accessible when it matters.',
  useSvg = true,
  className = '',
  style = {},
}: WelliRecordLogoProps) {
  const isDark = theme === 'dark';
  const wordmarkColor = isDark ? '#062B67' : '#ffffff';
  const shieldFill = isDark ? '#062B67' : '#38bdf8';
  const shieldInterior = isDark ? '#ffffff' : '#071B3F';
  const taglineColor = isDark ? '#1e3a8a' : 'rgba(255,255,255,0.75)';

  // ── Shield Icon (SVG with raster fallback) ─────────────────────────────────
  const ShieldMark = () => {
    if (useSvg) {
      return (
        <WelliShieldIcon
          size={height}
          fillColor={shieldFill}
          iconColor={shieldInterior}
        />
      );
    }

    return (
      <img
        src={welliIconSrc}
        alt="WelliRecord"
        style={{
          height: height,
          width: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
    );
  };

  // ── Wordmark ─────────────────────────────────────────────────────────────
  const Wordmark = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
        <span
          style={{
            color: wordmarkColor,
            fontFamily:
              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 800,
            fontSize: height * 0.64,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          WelliRecord
        </span>
        <span
          style={{
            color: wordmarkColor,
            fontFamily:
              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: height * 0.26,
            fontWeight: 700,
            marginLeft: 2,
            lineHeight: 1,
            verticalAlign: 'super',
          }}
        >
          ™
        </span>
      </div>

      {tagline && (
        <span
          style={{
            color: taglineColor,
            fontFamily:
              '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 600,
            fontSize: Math.max(9, height * 0.22),
            letterSpacing: '0.01em',
            marginTop: 4,
            whiteSpace: 'nowrap',
            opacity: 0.85,
          }}
        >
          {taglineText}
        </span>
      )}
    </div>
  );

  if (variant === 'icon') {
    return (
      <div
        className={className}
        style={{ height, display: 'inline-flex', alignItems: 'center', ...style }}
      >
        <ShieldMark />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div
        className={className}
        style={{ height, display: 'inline-flex', alignItems: 'center', ...style }}
      >
        <Wordmark />
      </div>
    );
  }

  // Full = shield + wordmark
  return (
    <div
      className={className}
      style={{
        height,
        display: 'inline-flex',
        alignItems: 'center',
        gap: height * 0.28,
        ...style,
      }}
    >
      <ShieldMark />
      <Wordmark />
    </div>
  );
}
