import type { SiteConfig } from './content/schema';

export interface AccessPayload {
  scenarios: { id: string; title: string }[];
  tags: { category: string; labels: string[] }[];
  date: string;
}

/** Plain-text payload built only from catalog ids and labels. No free text. */
export function payloadText(p: AccessPayload): string {
  const lines = [
    'בקשה להתנסות ב-Gemini',
    '',
    'השימושים שבחרתי:',
    ...p.scenarios.map((s) => `- ${s.title} (${s.id})`),
    '',
    'הבחירות שסימנתי:',
    ...p.tags.filter((t) => t.labels.length).map((t) => `- ${t.category}: ${t.labels.join(', ')}`),
    '',
    `תאריך: ${p.date}`,
  ];
  return lines.join('\n');
}

export type AccessRequest =
  | { mode: 'none' }
  | { mode: 'url'; href: string; text: string }
  | { mode: 'mailto'; href: string; text: string };

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1))}…`;
}

export function buildAccessRequest(
  config: SiteConfig['requestAccess'],
  payload: AccessPayload,
): AccessRequest {
  const text = truncate(payloadText(payload), config.prefill.maxChars);
  if (config.mode === 'url' && /^https:\/\//.test(config.url)) {
    let href = config.url;
    if (config.prefill.param) {
      const u = new URL(config.url);
      u.searchParams.set(config.prefill.param, text);
      href = u.toString();
    }
    return { mode: 'url', href, text };
  }
  if (config.mode === 'mailto' && config.mailto) {
    const q = new URLSearchParams({ subject: config.subject, body: text }).toString().replace(/\+/g, '%20');
    return { mode: 'mailto', href: `mailto:${config.mailto}?${q}`, text };
  }
  return { mode: 'none' };
}
