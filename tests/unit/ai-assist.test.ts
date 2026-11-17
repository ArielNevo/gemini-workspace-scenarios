import { describe, expect, it, vi } from 'vitest';
import { scenarios, siteConfig, taxonomy } from '../../src/lib/content';
import { makeLabeler, RuleBasedRecommender } from '../../src/lib/recommend/rule-based';
import { EMPTY_INPUT } from '../../src/lib/recommend/types';
import {
  GeminiAssistRecommender,
  MAX_PER_SESSION,
  MIN_INTERVAL_MS,
  type Generate,
} from '../../src/features/ai-assist/assist-recommender';
import { validateAiResponse } from '../../src/features/ai-assist/validate';

const label = makeLabeler(taxonomy);
const rules = new RuleBasedRecommender(scenarios, siteConfig.recommend, label);
const input = {
  ...EMPTY_INPUT,
  tasks: ['read-documents'],
  difficulties: ['too-much-material'],
  outputs: ['summary'],
};
const candidateIds = rules.candidates(input).map((c) => c.scenario.id);

function memSession() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}
function make(generate: Generate, opts: { now?: () => number; timeoutMs?: number } = {}) {
  return new GeminiAssistRecommender({
    generate,
    rules,
    label: (c, id) => label(c as never, id),
    session: memSession(),
    ...opts,
  });
}
const ok = JSON.stringify({
  recommendations: [
    { scenarioId: candidateIds[1], reason: 'מתאים כי ציינת שיש הרבה חומר לקרוא.' },
    { scenarioId: candidateIds[0], reason: 'עוזר להפיק סיכום ממסמכים ארוכים.' },
  ],
});

describe('validateAiResponse', () => {
  const ids = new Set(['a', 'b']);
  it('accepts valid items', () => {
    expect(
      validateAiResponse({ recommendations: [{ scenarioId: 'a', reason: 'נימוק קצר' }] }, ids),
    ).toHaveLength(1);
  });
  it('drops unknown ids, percentages, decimals, non-Hebrew and too-long reasons', () => {
    const r = validateAiResponse(
      {
        recommendations: [
          { scenarioId: 'zzz', reason: 'נימוק' },
          { scenarioId: 'a', reason: 'התאמה של 92%' },
          { scenarioId: 'a', reason: 'חיסכון של 2.5 שעות' },
          { scenarioId: 'a', reason: 'English only' },
          { scenarioId: 'b', reason: 'א'.repeat(201) },
        ],
      },
      ids,
    );
    expect(r).toEqual([]);
  });
  it('handles malformed JSON strings', () => {
    expect(validateAiResponse('{not json', ids)).toEqual([]);
  });
  it('dedupes ids and caps at 3', () => {
    const recs = ['a', 'a', 'b'].map((scenarioId) => ({ scenarioId, reason: 'טוב' }));
    expect(validateAiResponse({ recommendations: recs }, ids).map((x) => x.scenarioId)).toEqual(['a', 'b']);
  });
});

describe('GeminiAssistRecommender', () => {
  it('valid response → AI-ranked results marked aiReason', async () => {
    const out = await make(async () => ok).run(input);
    expect(out.usedAi).toBe(true);
    expect(out.recommendations[0]!.scenario.id).toBe(candidateIds[1]);
    expect(out.recommendations.every((r) => r.aiReason)).toBe(true);
  });
  it('sends only tag ids/labels and closed-list candidates', async () => {
    const gen = vi.fn<Generate>(async () => ok);
    await make(gen).run(input);
    const req = gen.mock.calls[0]![0];
    expect(Object.keys(req).sort()).toEqual(['candidates', 'selections']);
    expect(req.candidates.length).toBeLessThanOrEqual(8);
    req.selections.forEach((s) => expect(Object.keys(s).sort()).toEqual(['category', 'id', 'label']));
  });
  it('unknown scenarioId only → falls back to rules with notice', async () => {
    const out = await make(async () =>
      JSON.stringify({ recommendations: [{ scenarioId: 'nope', reason: 'נימוק' }] }),
    ).run(input);
    expect(out.usedAi).toBe(false);
    expect(out.fallbackNotice).toBe(true);
    expect(out.recommendations).toEqual(await rules.recommend(input));
  });
  it('malformed JSON → fallback', async () => {
    expect((await make(async () => '{{{').run(input)).usedAi).toBe(false);
  });
  it('429 / network / App Check error → fallback', async () => {
    const out = await make(async () => {
      throw Object.assign(new Error('quota'), { status: 429 });
    }).run(input);
    expect(out).toMatchObject({ usedAi: false, fallbackNotice: true });
  });
  it('timeout → fallback', async () => {
    const out = await make(() => new Promise<string>(() => {}), { timeoutMs: 20 }).run(input);
    expect(out).toMatchObject({ usedAi: false, fallbackNotice: true });
  });
  it('rate limit: a second uncached request within 10s falls back without calling the model', async () => {
    let t = 0;
    const gen = vi.fn<Generate>(async () => ok);
    const rec = make(gen, { now: () => t });
    await rec.run(input);
    t += MIN_INTERVAL_MS - 1;
    const out = await rec.run({ ...input, roles: ['legal'] });
    expect(gen).toHaveBeenCalledTimes(1);
    expect(out.usedAi).toBe(false);
  });
  it('session cache: identical selections reuse the cached answer', async () => {
    let t = 0;
    const gen = vi.fn<Generate>(async () => ok);
    const rec = make(gen, { now: () => t });
    await rec.run(input);
    t += 1;
    expect((await rec.run(input)).usedAi).toBe(true);
    expect(gen).toHaveBeenCalledTimes(1);
  });
  it(`session cap: at most ${MAX_PER_SESSION} model calls`, async () => {
    let t = 0;
    const gen = vi.fn<Generate>(async () => ok);
    const rec = make(gen, { now: () => t });
    for (let i = 0; i < MAX_PER_SESSION + 2; i++) {
      t += MIN_INTERVAL_MS + 1;
      await rec.run({ ...input, frequency: [String(i)] });
    }
    expect(gen).toHaveBeenCalledTimes(MAX_PER_SESSION);
  });
});

describe('flag off', () => {
  it('the default environment leaves the AI module disabled', () => {
    expect(import.meta.env.VITE_ENABLE_AI_ASSIST === 'true').toBe(false);
  });
});
