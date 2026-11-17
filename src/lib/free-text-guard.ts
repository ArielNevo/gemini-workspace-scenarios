/**
 * Infrastructure for a FUTURE free-text field in the AI module (brief section 11).
 * Not wired into any UI in version 1. Exercised by unit tests only.
 */
export const FREE_TEXT_MAX = 200;

const PATTERNS: { id: string; re: RegExp }[] = [
  { id: 'email', re: /[^\s@]+@[^\s@]+\.[^\s@]+/ },
  { id: 'phone', re: /(?:\+?972[-\s]?|0)(?:[2-9]|5\d)[-\s]?\d{3}[-\s]?\d{4}/ },
  { id: 'id-number', re: /(?<!\d)\d{9}(?!\d)/ },
  { id: 'url', re: /(?:https?:\/\/|www\.)\S+/i },
];

export interface GuardResult {
  ok: boolean;
  reasons: string[];
}

export function checkFreeText(text: string, confirmedNoOrgData: boolean): GuardResult {
  const reasons: string[] = [];
  if (text.length > FREE_TEXT_MAX) reasons.push('too-long');
  for (const p of PATTERNS) if (p.re.test(text)) reasons.push(p.id);
  if (!confirmedNoOrgData) reasons.push('not-confirmed');
  return { ok: reasons.length === 0, reasons };
}
