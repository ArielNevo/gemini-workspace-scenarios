import type { Scenario, SiteConfig, Taxonomy } from '../content/schema';
import {
  SCORED_CATEGORIES,
  type DiscoveryInput,
  type Recommendation,
  type Recommender,
  type ScoredCategory,
} from './types';

export type RecommendSettings = SiteConfig['recommend'];

function quoteList(labels: string[]): string {
  const q = labels.map((l) => `"${l}"`);
  if (q.length <= 1) return q.join('');
  return `${q.slice(0, -1).join(', ')} ו${q[q.length - 1]}`;
}

export function buildReason(
  matched: Recommendation['matched'],
  label: (cat: ScoredCategory, id: string) => string,
): string {
  const parts: string[] = [];
  const labels = (cat: ScoredCategory) => (matched[cat] ?? []).map((id) => label(cat, id));
  if (matched.tasks?.length) parts.push(`ציינת ${quoteList(labels('tasks'))}`);
  if (matched.difficulties?.length) parts.push(`הקושי הוא ${quoteList(labels('difficulties'))}`);
  if (matched.materials?.length) parts.push(`אתם עובדים עם ${quoteList(labels('materials'))}`);
  if (matched.outputs?.length) parts.push(`התוצר שאתם רוצים הוא ${quoteList(labels('outputs'))}`);
  if (matched.roles?.length) parts.push(`תחום הפעילות שלכם הוא ${quoteList(labels('roles'))}`);
  if (parts.length === 0) return '';
  const head = parts.slice(0, -1);
  const last = parts[parts.length - 1]!;
  return `הצענו את זה כי ${head.length ? `${head.join(', ')}, ו${last}` : last}.`;
}

export function scoreScenario(
  scenario: Scenario,
  input: DiscoveryInput,
  weights: RecommendSettings['weights'],
): { score: number; matched: Recommendation['matched'] } {
  let score = 0;
  const matched: Recommendation['matched'] = {};
  for (const cat of SCORED_CATEGORIES) {
    const wanted = new Set(input[cat]);
    const hits = (scenario.tags[cat] ?? []).filter((id) => wanted.has(id));
    if (hits.length) {
      matched[cat] = hits;
      score += hits.length * weights[cat];
    }
  }
  return { score, matched };
}

export function rankAll(
  scenarios: Scenario[],
  input: DiscoveryInput,
  settings: RecommendSettings,
  label: (cat: ScoredCategory, id: string) => string,
): Recommendation[] {
  return scenarios
    .map((scenario) => {
      const { score, matched } = scoreScenario(scenario, input, settings.weights);
      return { scenario, score, matched, reason: buildReason(matched, label) };
    })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.scenario.priority - a.scenario.priority ||
        a.scenario.id.localeCompare(b.scenario.id),
    );
}

/** Deterministic, in-browser rule engine (brief section 9.1). */
export function recommendRules(
  scenarios: Scenario[],
  input: DiscoveryInput,
  settings: RecommendSettings,
  label: (cat: ScoredCategory, id: string) => string,
): Recommendation[] {
  const ranked = rankAll(scenarios, input, settings, label).filter((r) => r.score >= settings.threshold);
  if (ranked.length === 0) return [];
  const top = ranked.slice(0, settings.maxResults);
  // Diversity: if all picks share one family, swap the last for a close runner-up from another family.
  if (top.length >= 3 && top.every((r) => r.scenario.family === top[0]!.scenario.family)) {
    const last = top[top.length - 1]!;
    const alt = ranked
      .slice(settings.maxResults)
      .find(
        (r) => r.scenario.family !== top[0]!.scenario.family && last.score - r.score < settings.diversityGap,
      );
    if (alt) top[top.length - 1] = alt;
  }
  return top;
}

export class RuleBasedRecommender implements Recommender {
  constructor(
    private readonly scenarios: Scenario[],
    private readonly settings: RecommendSettings,
    private readonly label: (cat: ScoredCategory, id: string) => string,
  ) {}

  recommend(input: DiscoveryInput): Promise<Recommendation[]> {
    return Promise.resolve(recommendRules(this.scenarios, input, this.settings, this.label));
  }

  /** Top-N candidates regardless of threshold, used as the closed list for the AI module. */
  candidates(input: DiscoveryInput, n = 8): Recommendation[] {
    return rankAll(this.scenarios, input, this.settings, this.label).slice(0, n);
  }
}

export function makeLabeler(taxonomy: Taxonomy) {
  const map = new Map<string, string>();
  for (const cat of SCORED_CATEGORIES)
    for (const item of taxonomy[cat]) map.set(`${cat}:${item.id}`, item.label);
  return (cat: ScoredCategory, id: string) => map.get(`${cat}:${id}`) ?? id;
}
