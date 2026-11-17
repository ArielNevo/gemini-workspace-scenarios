import type { Scenario, WorkTopic } from '../content/schema';
import { EMPTY_INPUT, type DiscoveryInput, type Recommendation } from './types';

/** Curated suggestions for a work topic (quick path). Deterministic, no scoring needed. */
export function recommendForTopic(topic: WorkTopic, scenarios: Scenario[], max = 3): Recommendation[] {
  return topic.scenarios
    .map((id) => scenarios.find((s) => s.id === id))
    .filter((s): s is Scenario => s !== undefined)
    .slice(0, max)
    .map((scenario) => ({
      scenario,
      score: 0,
      matched: {},
      reason: `הצענו את זה כי ציינת שאתם עוסקים ב"${topic.label}".`,
    }));
}

/** Prefill for the detailed questionnaire when the user wants to go deeper. */
export function inputFromTopic(topic: WorkTopic, role?: string): DiscoveryInput {
  return {
    ...EMPTY_INPUT,
    tasks: topic.tags.tasks.slice(0, 3),
    difficulties: [...topic.tags.difficulties],
    materials: [...topic.tags.materials],
    outputs: [...topic.tags.outputs],
    roles: role ? [role] : [],
  };
}
