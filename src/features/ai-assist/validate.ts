export const REASON_MAX = 200;
const HEBREW = /[א-ת]/;
const FORBIDDEN = /%|\d+[.,]\d+|אחוז/;

export interface AiItem {
  scenarioId: string;
  reason: string;
}

/** Strict client-side validation of the model's structured output (brief section 11). */
export function validateAiResponse(raw: unknown, candidateIds: ReadonlySet<string>, max = 3): AiItem[] {
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!data || typeof data !== 'object') return [];
  const recs = (data as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(recs)) return [];
  const seen = new Set<string>();
  const out: AiItem[] = [];
  for (const item of recs) {
    if (!item || typeof item !== 'object') continue;
    const { scenarioId, reason } = item as Record<string, unknown>;
    if (typeof scenarioId !== 'string' || !candidateIds.has(scenarioId) || seen.has(scenarioId)) continue;
    if (typeof reason !== 'string') continue;
    const r = reason.trim();
    if (!r || r.length > REASON_MAX || !HEBREW.test(r) || FORBIDDEN.test(r)) continue;
    seen.add(scenarioId);
    out.push({ scenarioId, reason: r });
    if (out.length >= max) break;
  }
  return out;
}
