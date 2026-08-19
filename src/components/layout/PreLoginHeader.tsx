import React from 'react';
import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';

export function PreLoginHeader() {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '20px 32px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <a
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
        }}
      >
        <WelliRecordLogo height={34} theme="dark" />
      </a>
    </header>
  );
}

export default PreLoginHeader;
