import { siteConfig } from '../lib/content';
import { ExternalLink } from './ExternalLink';

/** Routes the user to the CDO for consultation. Shown where a human decision is likely needed. */
export function ConsultCard({ reason, compact = false }: { reason?: string; compact?: boolean }) {
  const c = siteConfig.consult;
  if (!c.name) return null;
  return (
    <aside className={`consult${compact ? ' consult-compact' : ''}`} aria-label="התייעצות">
      <div className="consult-avatar" aria-hidden="true">
        {c.name
          .split(' ')
          .map((w) => w[0])
          .join('')}
      </div>
      <div className="consult-body">
        <p className="consult-title">
          <strong>להתייעצות: {c.name}</strong>, {c.role}
        </p>
        <p>{reason ?? c.note}</p>
        {c.url && (
          <p>
            <ExternalLink href={c.url}>פנייה דרך טופס הבקשה</ExternalLink>
            <span className="muted small"> (ציינו בטופס שמדובר בבקשת התייעצות)</span>
          </p>
        )}
      </div>
    </aside>
  );
}
