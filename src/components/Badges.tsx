import type { Scenario, Tool } from '../lib/content';
import { t, TOOL_LABELS, TOOL_SHORT } from '../lib/content';
import { ExternalLink } from './ExternalLink';

export function ToolName({ tool, full = true }: { tool: Tool; full?: boolean }) {
  const label = full ? TOOL_LABELS[tool] : TOOL_SHORT[tool];
  // Wrap Latin product names so they do not flip inside RTL text.
  return <bdi>{label}</bdi>;
}

export function ToolBadge({ tool }: { tool: Tool }) {
  return (
    <span className={`badge badge-tool badge-${tool}`}>
      <span className="visually-hidden">כלי: </span>
      <ToolName tool={tool} full={false} />
    </span>
  );
}

export function DraftBadge({ status }: { status: Scenario['status'] }) {
  if (status !== 'draft') return null;
  return <span className="badge badge-draft">{t('status.draft')}</span>;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
export { formatDate };

export function StatusBadge({ scenario }: { scenario: Scenario }) {
  const c = scenario.capability;
  const pkg =
    c.includedInOrgPackage === 'yes'
      ? 'כלול בחבילה שתוקצה לכם: כן'
      : c.includedInOrgPackage === 'no'
        ? 'כלול בחבילה שתוקצה לכם: לא'
        : t('status.package');
  return (
    <section className="status-badge" aria-labelledby={`status-${scenario.id}`}>
      <h3 id={`status-${scenario.id}`}>מה ידוע על היכולת</h3>
      <ul>
        <li>
          {c.googleDocumented ? (
            <>
              קיים אצל <bdi>Google</bdi>: כן, נבדק ב-{formatDate(c.checkedOn)} (
              <ExternalLink href={c.sourceUrl}>מקור</ExternalLink>)
            </>
          ) : (
            <>
              קיים אצל <bdi>Google</bdi>: טרם אומת במקור רשמי (
              <ExternalLink href={c.sourceUrl}>מקור לבדיקה</ExternalLink>)
            </>
          )}
        </li>
        <li>{pkg}</li>
        <li>{c.verifiedInOrg ? 'נבדק בארגון: כן' : t('status.orgNotYet')}</li>
      </ul>
      <p className="muted">{t('status.why')}</p>
    </section>
  );
}

export function HebrewNote({ scenario }: { scenario: Scenario }) {
  const h = scenario.hebrewSupport;
  if (h.status === 'unknown' && !h.note) return null;
  const date = formatDate(h.checkedOn);
  const lead =
    h.status === 'listed'
      ? `לפי רשימת השפות של Google ב-${date}, העברית מופיעה. כדאי לבדוק בעת ההתנסות.`
      : h.status === 'not-listed'
        ? `לפי רשימת השפות של Google ב-${date}, העברית לא מופיעה. כדאי לבדוק בעת ההתנסות.`
        : `תמיכה בעברית: טרם אומתה (נבדק ב-${date}). כדאי לבדוק בעת ההתנסות.`;
  return (
    <div className="hebrew-note">
      <h3>עברית</h3>
      <p>{lead}</p>
      {h.note && <p>{h.note}</p>}
    </div>
  );
}
