import type { DiscoveryInput, Recommendation, Recommender } from '../../lib/recommend/types';
import type { RuleBasedRecommender } from '../../lib/recommend/rule-based';
import { validateAiResponse } from './validate';

export const SYSTEM_INSTRUCTION =
  'אתה עוזר שמדרג תרחישי שימוש מרשימה סגורה. השב רק בעברית. השתמש רק במזהים שניתנו. אל תמציא יכולות, אל תבטיח חיסכון ואל תיתן עצות על מה מותר להזין לכלי. כתוב נימוק קצר וענייני.';

export const TIMEOUT_MS = 8000;
export const MIN_INTERVAL_MS = 10_000;
export const MAX_PER_SESSION = 5;
const CACHE_PREFIX = 'gemini-discovery:ai-cache:';
const COUNT_KEY = 'gemini-discovery:ai-count';

/** The only thing sent to the model: tag ids + labels and closed-list candidates. Never free text. */
export interface AssistRequest {
  selections: { category: string; id: string; label: string }[];
  candidates: { id: string; title: string; userNeed: string; tool: string }[];
}
export type Generate = (req: AssistRequest, signal: AbortSignal) => Promise<string>;

export type AssistOutcome = { recommendations: Recommendation[]; usedAi: boolean; fallbackNotice: boolean };

export interface AssistDeps {
  generate: Generate;
  rules: RuleBasedRecommender;
  label: (category: string, id: string) => string;
  now?: () => number;
  session?: Pick<Storage, 'getItem' | 'setItem'> | null;
  timeoutMs?: number;
}

export function hashInput(input: DiscoveryInput): string {
  const s = JSON.stringify(input, Object.keys(input).sort());
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export class GeminiAssistRecommender implements Recommender {
  private lastCall = -Infinity;
  constructor(private readonly deps: AssistDeps) {}

  async recommend(input: DiscoveryInput): Promise<Recommendation[]> {
    return (await this.run(input)).recommendations;
  }

  async run(input: DiscoveryInput): Promise<AssistOutcome> {
    const { rules, generate, label } = this.deps;
    const now = this.deps.now ?? Date.now;
    const session = this.deps.session ?? null;
    const fallback = async (notice: boolean): Promise<AssistOutcome> => ({
      recommendations: await rules.recommend(input),
      usedAi: false,
      fallbackNotice: notice,
    });

    const candidates = rules.candidates(input, 8);
    if (candidates.length === 0) return fallback(false);
    const byId = new Map(candidates.map((c) => [c.scenario.id, c]));
    const key = CACHE_PREFIX + hashInput(input);

    let raw: string | null;
    try {
      raw = session?.getItem(key) ?? null;
    } catch {
      raw = null;
    }

    if (raw === null) {
      const count = Number(session?.getItem(COUNT_KEY) ?? '0');
      if (count >= MAX_PER_SESSION || now() - this.lastCall < MIN_INTERVAL_MS) return fallback(true);
      this.lastCall = now();
      session?.setItem(COUNT_KEY, String(count + 1));
      const req: AssistRequest = {
        selections: (
          ['tasks', 'difficulties', 'materials', 'outputs', 'roles', 'frequency'] as const
        ).flatMap((cat) => input[cat].map((id) => ({ category: cat, id, label: label(cat, id) }))),
        candidates: candidates.map((c) => ({
          id: c.scenario.id,
          title: c.scenario.title,
          userNeed: c.scenario.userNeed,
          tool: c.scenario.tool,
        })),
      };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.deps.timeoutMs ?? TIMEOUT_MS);
      try {
        raw = await Promise.race([
          generate(req, controller.signal),
          new Promise<never>((_, reject) =>
            controller.signal.addEventListener('abort', () => reject(new Error('timeout'))),
          ),
        ]);
      } catch {
        return fallback(true);
      } finally {
        clearTimeout(timer);
      }
    }

    const items = validateAiResponse(raw, new Set(byId.keys()));
    if (items.length < 1) return fallback(true);
    try {
      session?.setItem(key, raw);
    } catch {
      /* ignore quota */
    }
    return {
      recommendations: items.map((it) => ({
        ...byId.get(it.scenarioId)!,
        reason: it.reason,
        aiReason: true,
      })),
      usedAi: true,
      fallbackNotice: false,
    };
  }
}
