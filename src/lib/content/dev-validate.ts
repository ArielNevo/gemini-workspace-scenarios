import { ScenarioSchema } from './schema';
import { scenarios } from './index';

/** Development-only schema check; CI runs the full scripts/validate-content.ts. */
export function validateInDev(): void {
  for (const s of scenarios) {
    const r = ScenarioSchema.safeParse(s);
    if (!r.success) console.error(`[content] invalid scenario ${s.id}`, r.error.issues);
  }
}
