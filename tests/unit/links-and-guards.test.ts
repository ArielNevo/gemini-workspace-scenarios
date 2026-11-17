import { describe, expect, it } from 'vitest';
import { buildAccessRequest, payloadText, type AccessPayload } from '../../src/lib/access-request';
import { decodeSelection, encodeSelection } from '../../src/lib/share';
import { checkFreeText } from '../../src/lib/free-text-guard';
import { hostAllowed, lintText } from '../../scripts/content-lint';
import { siteConfig, taxonomy } from '../../src/lib/content';
import { EMPTY_INPUT } from '../../src/lib/recommend/types';

const payload: AccessPayload = {
  scenarios: [{ id: 'bullets-to-draft', title: 'יש לי נקודות, אבל קשה לי להתחיל מסמך' }],
  tags: [{ category: 'משימות', labels: ['כתיבה וניסוח'] }],
  date: '2026-11-17',
};
const base = siteConfig.requestAccess;

describe('access request', () => {
  it('mode none → no link', () => {
    expect(buildAccessRequest({ ...base, mode: 'none' }, payload)).toEqual({ mode: 'none' });
  });
  it('mode url with prefill param', () => {
    const r = buildAccessRequest(
      {
        ...base,
        mode: 'url',
        url: 'https://forms.example.test/x',
        prefill: { param: 'entry.1', maxChars: 1500 },
      },
      payload,
    );
    expect(r.mode).toBe('url');
    if (r.mode === 'url') expect(new URL(r.href).searchParams.get('entry.1')).toContain('bullets-to-draft');
  });
  it('mode url rejects non-https', () => {
    expect(buildAccessRequest({ ...base, mode: 'url', url: 'javascript:alert(1)' }, payload).mode).toBe(
      'none',
    );
  });
  it('mode mailto builds subject and body', () => {
    const r = buildAccessRequest({ ...base, mode: 'mailto', mailto: 'requests@example.test' }, payload);
    expect(r.mode === 'mailto' && r.href.startsWith('mailto:requests@example.test?subject=')).toBe(true);
    if (r.mode === 'mailto') expect(decodeURIComponent(r.href)).toContain('תאריך: 2026-11-17');
  });
  it('payload is truncated to maxChars', () => {
    const r = buildAccessRequest(
      { ...base, mode: 'mailto', mailto: 'a@example.test', prefill: { param: '', maxChars: 20 } },
      payload,
    );
    expect(r.mode !== 'none' && r.text.length).toBe(20);
  });
  it('payload contains only catalog ids/labels and a date', () => {
    expect(payloadText(payload).split('\n')).toEqual([
      'בקשה להתנסות ב-Gemini',
      '',
      'השימושים שבחרתי:',
      '- יש לי נקודות, אבל קשה לי להתחיל מסמך (bullets-to-draft)',
      '',
      'הבחירות שסימנתי:',
      '- משימות: כתיבה וניסוח',
      '',
      'תאריך: 2026-11-17',
    ]);
  });
});

describe('share link', () => {
  it('round-trips tag ids and drops unknown ids', () => {
    const q = encodeSelection({ ...EMPTY_INPUT, tasks: ['write'], materialClass: 'public' });
    expect(decodeSelection(q, taxonomy)).toMatchObject({ tasks: ['write'], materialClass: 'public' });
    expect(decodeSelection('tasks=write,<script>', taxonomy)!.tasks).toEqual(['write']);
  });
  it('ignores unrelated query strings', () => {
    expect(decodeSelection('foo=bar', taxonomy)).toBeNull();
  });
});

describe('free-text guard (future infrastructure)', () => {
  it('blocks email, phone, 9-digit id, url, length and missing confirmation', () => {
    expect(checkFreeText('כתבו אליי: a@b.co', true).reasons).toContain('email');
    expect(checkFreeText('טלפון 050-1234567', true).reasons).toContain('phone');
    expect(checkFreeText('מספר 123456789', true).reasons).toContain('id-number');
    expect(checkFreeText('ראו www.example.test', true).reasons).toContain('url');
    expect(checkFreeText('א'.repeat(201), true).reasons).toContain('too-long');
    expect(checkFreeText('נושא כללי', false).reasons).toContain('not-confirmed');
    expect(checkFreeText('השוואת נהלים', true).ok).toBe(true);
  });
});

describe('content-lint rules', () => {
  const domains = ['google.com', 'gov.il'];
  it('flags emails, phones, 9 digits and foreign URLs', () => {
    expect(lintText('x a@b.com', domains, [])).toHaveLength(1);
    expect(lintText('050-123-4567', domains, []).join()).toContain('phone');
    expect(lintText('012345678', domains, []).join()).toContain('9-digit');
    expect(lintText('https://evil.example.com/x', domains, []).join()).toContain('URL not allowed');
  });
  it('allows subdomains of allowed domains and dates', () => {
    expect(hostAllowed('https://support.google.com/x', domains)).toBe(true);
    expect(hostAllowed('https://notgoogle.com', domains)).toBe(false);
    expect(lintText('נבדק ב-2026-11-17', domains, [])).toEqual([]);
  });
  it('forbidden terms come only from the environment list', () => {
    expect(lintText('מילה סודית', domains, ['סודית'])).toHaveLength(1);
    expect(lintText('מילה סודית', domains, [])).toEqual([]);
  });
});
