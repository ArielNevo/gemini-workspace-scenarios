import { describe, expect, it } from 'vitest';
import { scenarios, siteConfig, taxonomy } from '../../src/lib/content';
import {
  buildReason,
  makeLabeler,
  recommendRules,
  RuleBasedRecommender,
} from '../../src/lib/recommend/rule-based';
import { EMPTY_INPUT, type DiscoveryInput } from '../../src/lib/recommend/types';
import type { Scenario } from '../../src/lib/content/schema';

const label = makeLabeler(taxonomy);
const settings = siteConfig.recommend;
const run = (patch: Partial<DiscoveryInput>) =>
  recommendRules(scenarios, { ...EMPTY_INPUT, ...patch }, settings, label);
const ids = (patch: Partial<DiscoveryInput>) => run(patch).map((r) => r.scenario.id);

describe('RuleBasedRecommender', () => {
  it('returns at most 3 results', () => {
    expect(
      run({ tasks: ['read-documents', 'write', 'compare'], outputs: ['summary'] }).length,
    ).toBeLessThanOrEqual(3);
  });
  it('Noa: read procedures + prepare meetings + too much material → brief/meeting scenarios', () => {
    const r = ids({ tasks: ['read-documents', 'prepare-meetings'], difficulties: ['too-much-material'] });
    expect(r).toContain('brief-from-many-sources');
    expect(r.length).toBeGreaterThanOrEqual(2);
  });
  it('single task: compare + comparing → what-changed first', () => {
    expect(ids({ tasks: ['compare'], difficulties: ['comparing'], outputs: ['change-table'] })[0]).toBe(
      'what-changed-in-procedure',
    );
  });
  it('three tasks still produce results with reasons', () => {
    const r = run({ tasks: ['write', 'learn-teach', 'work-with-data'], outputs: ['draft'] });
    expect(r.length).toBeGreaterThan(0);
    r.forEach((x) => expect(x.reason).toMatch(/^הצענו את זה כי/));
  });
  it('write + wording + draft → plain language / rewrite', () => {
    const r = ids({ tasks: ['write'], difficulties: ['wording'], outputs: ['draft'] });
    expect(r).toEqual(expect.arrayContaining(['plain-language-for-public']));
  });
  it('rough notes + starting → bullets-to-draft first', () => {
    expect(
      ids({
        tasks: ['write'],
        difficulties: ['starting'],
        materials: ['rough-notes'],
        outputs: ['draft'],
      })[0],
    ).toBe('bullets-to-draft');
  });
  it('table data → understand-a-table', () => {
    expect(ids({ tasks: ['work-with-data'], materials: ['table'], outputs: ['summary'] })).toContain(
      'understand-a-table',
    );
  });
  it('action list output → summary-to-action-items', () => {
    expect(ids({ tasks: ['prepare-meetings'], outputs: ['action-list'] })[0]).toBe('summary-to-action-items');
  });
  it('no match (only frequency) → empty list', () => {
    expect(ids({ frequency: ['once'] })).toEqual([]);
  });
  it('empty input → empty list', () => {
    expect(ids({})).toEqual([]);
  });
  it('contradictory choice (none-yet material + compare) still returns sensible, threshold-passing results', () => {
    const r = run({ tasks: ['compare'], materials: ['none-yet'] });
    r.forEach((x) => expect(x.score).toBeGreaterThanOrEqual(settings.threshold));
  });
  it('missing role is fine and role adds only weight 1', () => {
    const without = run({ tasks: ['learn-teach'], outputs: ['learning-pack'] });
    const withRole = run({ tasks: ['learn-teach'], outputs: ['learning-pack'], roles: ['service'] });
    expect(without.length).toBeGreaterThan(0);
    expect(
      withRole[0]!.score - (without.find((x) => x.scenario.id === withRole[0]!.scenario.id)?.score ?? 0),
    ).toBeLessThanOrEqual(1);
  });
  it('materialClass never changes the ranking', () => {
    const base = { tasks: ['read-documents'], outputs: ['qa'] };
    expect(ids({ ...base, materialClass: 'protected' })).toEqual(ids({ ...base, materialClass: 'public' }));
  });
  it('ties break by priority then id (deterministic)', () => {
    const a = ids({ tasks: ['learn-teach'] });
    const b = ids({ tasks: ['learn-teach'] });
    expect(a).toEqual(b);
  });
  it('tie break prefers higher priority', () => {
    const mk = (id: string, priority: number): Scenario => ({
      ...scenarios[0]!,
      id,
      priority,
      tags: { tasks: ['write'], difficulties: ['wording'], materials: ['single-doc'], outputs: ['draft'] },
    });
    const r = recommendRules(
      [mk('a', 1), mk('b', 5)],
      { ...EMPTY_INPUT, tasks: ['write'], outputs: ['draft'] },
      settings,
      label,
    );
    expect(r[0]!.scenario.id).toBe('b');
  });
  it('diversity: replaces the third pick when all three share a family and a close alternative exists', () => {
    const mk = (id: string, family: Scenario['family'], tasks: string[]): Scenario => ({
      ...scenarios[0]!,
      id,
      family,
      priority: 3,
      tags: { tasks, difficulties: ['wording'], materials: ['single-doc'], outputs: ['draft'] },
    });
    const pool = [
      mk('w1', 'write', ['write']),
      mk('w2', 'write', ['write']),
      mk('w3', 'write', ['write']),
      mk('z1', 'learn', ['write']),
    ];
    const r = recommendRules(
      pool,
      { ...EMPTY_INPUT, tasks: ['write'], difficulties: ['wording'], outputs: ['draft'] },
      { ...settings, diversityGap: 4 },
      label,
    );
    expect(r.map((x) => x.scenario.family)).toContain('learn');
  });
  it('below-threshold scores produce no results', () => {
    expect(recommendRules(scenarios, { ...EMPTY_INPUT, roles: ['legal'] }, settings, label)).toEqual([]);
  });
  it('reason names the labels that actually matched', () => {
    const r = run({ tasks: ['read-documents'], difficulties: ['finding-info'], outputs: ['qa'] })[0]!;
    expect(r.reason).toContain('קריאת מסמכים ונהלים');
    expect(r.reason).toContain('קשה למצוא את המידע הנכון');
    expect(r.reason).not.toMatch(/%|\d/);
  });
  it('buildReason joins multiple labels with Hebrew "ו"', () => {
    expect(buildReason({ tasks: ['write', 'compare'] }, label)).toBe(
      'הצענו את זה כי ציינת "כתיבה וניסוח" ו"השוואת מסמכים".',
    );
  });
  it('class implements Recommender and exposes up to 8 candidates', async () => {
    const rec = new RuleBasedRecommender(scenarios, settings, label);
    const input = { ...EMPTY_INPUT, tasks: ['read-documents'] };
    await expect(rec.recommend(input)).resolves.toBeInstanceOf(Array);
    expect(rec.candidates(input).length).toBeLessThanOrEqual(8);
  });
});
