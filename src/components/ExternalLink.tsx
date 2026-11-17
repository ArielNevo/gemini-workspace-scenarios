import type { ReactNode } from 'react';

/** External links: no referrer, no opener, and a visible + spoken "leaves the site" cue. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="external">
      {children}
      <span aria-hidden="true" className="external-icon">
        ↗
      </span>
      <span className="visually-hidden"> (קישור חיצוני, נפתח בחלון חדש)</span>
    </a>
  );
}
