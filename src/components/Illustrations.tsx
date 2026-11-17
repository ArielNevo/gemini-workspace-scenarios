import type { ReactElement } from 'react';
import type { Family } from '../lib/content';

/** Decorative hero art: documents turning into a guided path. Pure SVG + CSS animation, no network. */
export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 420 340" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ha-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-1)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
        <linearGradient id="ha-g2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent-3)" />
          <stop offset="1" stopColor="var(--accent-1)" />
        </linearGradient>
        <filter id="ha-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <circle cx="250" cy="150" r="110" fill="url(#ha-g1)" opacity="0.28" filter="url(#ha-soft)" />
      <circle cx="140" cy="230" r="80" fill="url(#ha-g2)" opacity="0.22" filter="url(#ha-soft)" />

      <g className="ha-doc ha-doc-3">
        <rect x="60" y="70" width="150" height="190" rx="16" fill="var(--surface)" stroke="var(--border)" />
        <rect x="82" y="100" width="90" height="10" rx="5" fill="var(--line)" />
        <rect x="82" y="122" width="106" height="8" rx="4" fill="var(--line)" />
        <rect x="82" y="140" width="70" height="8" rx="4" fill="var(--line)" />
      </g>
      <g className="ha-doc ha-doc-2">
        <rect x="110" y="50" width="150" height="190" rx="16" fill="var(--surface)" stroke="var(--border)" />
        <rect x="132" y="80" width="100" height="10" rx="5" fill="var(--line)" />
        <rect x="132" y="102" width="106" height="8" rx="4" fill="var(--line)" />
        <rect x="132" y="120" width="84" height="8" rx="4" fill="var(--line)" />
        <rect x="132" y="138" width="96" height="8" rx="4" fill="var(--line)" />
      </g>
      <g className="ha-doc ha-doc-1">
        <rect
          x="170"
          y="90"
          width="170"
          height="200"
          rx="18"
          fill="var(--surface)"
          stroke="url(#ha-g1)"
          strokeWidth="2.5"
        />
        <rect x="194" y="120" width="70" height="12" rx="6" fill="url(#ha-g1)" />
        <g className="ha-check">
          <circle cx="204" cy="160" r="9" fill="url(#ha-g2)" />
          <path d="M199 160l4 4 7-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <rect x="222" y="155" width="92" height="9" rx="4.5" fill="var(--line)" />
        </g>
        <g className="ha-check ha-check-2">
          <circle cx="204" cy="190" r="9" fill="url(#ha-g2)" />
          <path d="M199 190l4 4 7-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <rect x="222" y="185" width="78" height="9" rx="4.5" fill="var(--line)" />
        </g>
        <g className="ha-check ha-check-3">
          <circle cx="204" cy="220" r="9" fill="url(#ha-g2)" />
          <path d="M199 220l4 4 7-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <rect x="222" y="215" width="86" height="9" rx="4.5" fill="var(--line)" />
        </g>
      </g>
      <g className="ha-spark ha-spark-1">
        <path
          d="M340 60 C344 78 352 86 370 90 C352 94 344 102 340 120 C336 102 328 94 310 90 C328 86 336 78 340 60Z"
          fill="url(#ha-g1)"
        />
      </g>
      <g className="ha-spark ha-spark-2">
        <path
          d="M78 40 C80 50 84 54 94 56 C84 58 80 62 78 72 C76 62 72 58 62 56 C72 54 76 50 78 40Z"
          fill="url(#ha-g2)"
        />
      </g>
      <g className="ha-spark ha-spark-3">
        <path
          d="M372 250 C374 258 377 261 385 263 C377 265 374 268 372 276 C370 268 367 265 359 263 C367 261 370 258 372 250Z"
          fill="url(#ha-g1)"
        />
      </g>
    </svg>
  );
}

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
