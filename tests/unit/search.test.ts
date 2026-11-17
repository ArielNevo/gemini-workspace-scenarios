import { describe, expect, it } from 'vitest';
import { createScenarioSearch } from '../../src/lib/search';
import { scenarios, synonymGroups, taxonomy, TOOL_LABELS } from '../../src/lib/content';

const search = createScenarioSearch(scenarios, taxonomy, synonymGroups, TOOL_LABELS);
const top = (q: string, n = 3) => search.search(q).slice(0, n);

describe('scenario search (Hebrew)', () => {
  it('"להשוות נוהל" finds what-changed and compare-two-positions', () => {
    const r = top('להשוות נוהל', 5);
    expect(r).toContain('what-changed-in-procedure');
    expect(r).toContain('compare-two-positions');
  });
  it('"מה השתנה" finds what-changed-in-procedure', () => {
    expect(top('מה השתנה')).toContain('what-changed-in-procedure');
  });
  it('"ניסוח לציבור" finds plain-language-for-public', () => {
    expect(top('ניסוח לציבור')).toContain('plain-language-for-public');
  });
  it('unknown term returns an empty list without throwing', () => {
    expect(search.search('קסטרולפוגיה')).toEqual([]);
  });
  it('empty or punctuation-only query returns []', () => {
    expect(search.search('')).toEqual([]);
    expect(search.search('  ?!  ')).toEqual([]);
  });
  it('ignores niqqud in the query', () => {
    expect(top('טַבְלָה')).toContain('understand-a-table');
  });
  it('final-letter forms match (נהלים / נהלימ)', () => {
    expect(top('נהלים', 5)).toContain('find-answer-in-procedures');
  });
  it('prefix letters are handled ("בטבלה")', () => {
    expect(top('בטבלה', 5)).toContain('understand-a-table');
  });
  it('synonym: "ישיבה" finds prepare-for-meeting', () => {
    expect(top('ישיבה', 5)).toContain('prepare-for-meeting');
  });
  it('synonym: "הדרכה" finds training-from-procedures', () => {
    expect(top('הדרכה', 5)).toContain('training-from-procedures');
  });
  it('"משימות מסיכום" finds summary-to-action-items', () => {
    expect(top('משימות מסיכום')).toContain('summary-to-action-items');
  });
  it('"האזנה" finds listen-to-material', () => {
    expect(top('האזנה')).toContain('listen-to-material');
  });
  it('"מילון מושגים" finds glossary-and-map', () => {
    expect(top('מילון מושגים')).toContain('glossary-and-map');
  });
  it('Latin tool name search works case-insensitively', () => {
    expect(search.search('NOTEBOOK').length).toBeGreaterThan(5);
  });
  it('falls back to OR when AND has no hit', () => {
    expect(search.search('טבלה קסטרולפוגיה').length).toBeGreaterThan(0);
  });
});
