import React from 'react';
import { welliIcon } from '@/assets';

export function PreLoginHeader() {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '24px 32px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <a
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none'
        }}
      >
        <img
          src="/logo-mark.svg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = welliIcon;
          }}
          alt="WelliRecord"
          width={32}
          height={32}
          style={{ width: 32, height: 32, objectFit: 'contain' }}
        />
        <span style={{ fontWeight: 800, fontSize: 16, color: '#0B1E3D' }}>
          WelliRecord
        </span>
      </a>
    </header>
  );
}

export default PreLoginHeader;
