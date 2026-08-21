import React from 'react';
import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import { Link } from 'react-router-dom';
import { welliIcon } from '@/assets';

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
      <div className="flex items-center min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src={welliIcon}
              alt="WelliRecord"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col leading-tight">
              <span
                className="text-[#1e3a8a] font-black text-base sm:text-lg tracking-tight"
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Welli<span className="font-normal">Record</span>
                <sup className="text-[10px] font-normal align-super">™</sup>
              </span>
              <span className="text-[#1e3a8a] text-[7px] sm:text-[8px] font-bold tracking-[0.12em] uppercase opacity-70">
                One patient. One trusted record. Accessible when it matters.
              </span>
            </div>
          </Link>
        </div>
    </header>
  );
}

export default PreLoginHeader;
