import type { Taxonomy } from './content/schema';
import { EMPTY_INPUT, SCORED_CATEGORIES, type DiscoveryInput } from './recommend/types';

const KEYS = [...SCORED_CATEGORIES, 'materialClass'] as const;

/** Encode tag ids only (never free text) into a query string for a share link. */
export function encodeSelection(input: DiscoveryInput): string {
  const params = new URLSearchParams();
  for (const cat of SCORED_CATEGORIES) if (input[cat].length) params.set(cat, input[cat].join(','));
  if (input.materialClass) params.set('materialClass', input.materialClass);
  return params.toString();
}

/** Decode and keep only ids that exist in the taxonomy. */
export function decodeSelection(query: string, taxonomy: Taxonomy): DiscoveryInput | null {
  const params = new URLSearchParams(query);
  if (!KEYS.some((k) => params.has(k))) return null;
  const out: DiscoveryInput = { ...EMPTY_INPUT };
  for (const cat of SCORED_CATEGORIES) {
    const valid = new Set(taxonomy[cat].map((i) => i.id));
    out[cat] = (params.get(cat) ?? '').split(',').filter((id) => valid.has(id));
  }
  const mc = params.get('materialClass');
  if (mc && taxonomy.materialClass.some((i) => i.id === mc)) out.materialClass = mc;
  return out;
}
