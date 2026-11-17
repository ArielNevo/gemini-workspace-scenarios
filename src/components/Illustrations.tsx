import type { ReactElement } from 'react';
import type { Family } from '../lib/content';

const FAMILY_PATHS: Record<Family, ReactElement> = {
  understand: (
    <>
      <rect x="6" y="4" width="20" height="26" rx="4" />
      <path d="M11 11h10M11 16h8" />
      <circle cx="26" cy="26" r="6" />
      <path d="M30.5 30.5L35 35" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="7" width="14" height="22" rx="3" />
      <rect x="23" y="7" width="14" height="22" rx="3" />
      <path d="M14 34h12M22 31l4 3-4 3" />
    </>
  ),
  write: (
    <>
      <path d="M8 30l3-9L27 5l6 6-16 16z" />
      <path d="M23 9l6 6M6 35h28" />
    </>
  ),
  learn: (
    <>
      <path d="M3 14L20 6l17 8-17 8z" />
      <path d="M10 18v8c4 4 16 4 20 0v-8M35 15v10" />
    </>
  ),
};

export function FamilyIcon({ family }: { family: Family }) {
  return (
    <svg className={`family-icon family-${family}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {FAMILY_PATHS[family]}
      </g>
    </svg>
  );
}

export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg className={`sparkle ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1c1 6 4 10 11 11-7 1-10 5-11 11-1-6-4-10-11-11 7-1 10-5 11-11z" fill="currentColor" />
    </svg>
  );
}
