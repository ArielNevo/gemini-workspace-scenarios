import MiniSearch, { type Query, type SearchResult } from 'minisearch';
import type { Scenario, Taxonomy } from '../content/schema';
import { hebrewVariants, normalizeHebrew, STOPWORDS, tokenize } from '../hebrew';

interface Doc {
  id: string;
  title: string;
  userNeed: string;
  whatYouGet: string;
  tagLabels: string;
  tool: string;
}

const processTerm = (term: string) => hebrewVariants(normalizeHebrew(term));

export interface ScenarioSearch {
  search(query: string): string[];
}

/** Build a client-side Hebrew search index. Queries never leave the browser. */
export function createScenarioSearch(
  scenarios: Scenario[],
  taxonomy: Taxonomy,
  synonymGroups: string[][],
  toolLabels: Record<string, string>,
): ScenarioSearch {
  const labelOf = new Map<string, string>();
  for (const items of Object.values(taxonomy)) for (const i of items) labelOf.set(i.id, i.label);

  const ms = new MiniSearch<Doc>({
    fields: ['title', 'userNeed', 'whatYouGet', 'tagLabels', 'tool'],
    storeFields: ['id'],
    tokenize,
    processTerm,
    searchOptions: {
      boost: { title: 3, userNeed: 2, whatYouGet: 1.2 },
      prefix: (term) => term.length >= 3,
      fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
    },
  });
  ms.addAll(
    scenarios.map((s) => ({
      id: s.id,
      title: s.title,
      userNeed: s.userNeed,
      whatYouGet: s.whatYouGet,
      tagLabels: Object.values(s.tags)
        .flat()
        .map((id) => labelOf.get(id) ?? '')
        .join(' '),
      tool: toolLabels[s.tool] ?? s.tool,
    })),
  );

  // Synonym lookup over every variant of every group member.
  const synIndex = new Map<string, Set<string>>();
  for (const group of synonymGroups) {
    const words = group.flatMap((w) => tokenize(w));
    for (const w of words)
      for (const v of hebrewVariants(w)) {
        const set = synIndex.get(v) ?? new Set<string>();
        words.forEach((x) => set.add(x));
        synIndex.set(v, set);
      }
  }

  function expand(word: string): Query {
    const alts = new Set<string>([word]);
    for (const v of hebrewVariants(word)) synIndex.get(v)?.forEach((s) => alts.add(s));
    return { combineWith: 'OR', queries: [...alts] };
  }

  return {
    search(query: string): string[] {
      const words = tokenize(query);
      const content = words.filter((w) => !STOPWORDS.has(w));
      const terms = content.length ? content : words;
      if (terms.length === 0) return [];
      const run = (combineWith: 'AND' | 'OR'): SearchResult[] =>
        ms.search({ combineWith, queries: terms.map(expand) } as Query);
      let results = run('AND');
      if (results.length === 0) results = run('OR');
      return results.map((r) => String(r.id));
    },
  };
}
