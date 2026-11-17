import type { Scenario } from '../content/schema';

export const SCORED_CATEGORIES = [
  'tasks',
  'outputs',
  'materials',
  'difficulties',
  'roles',
  'frequency',
] as const;
export type ScoredCategory = (typeof SCORED_CATEGORIES)[number];

export interface DiscoveryInput {
  tasks: string[];
  roles: string[];
  difficulties: string[];
  materials: string[];
  outputs: string[];
  frequency: string[];
  /** General material class. Never used for ranking, only for the caution note. */
  materialClass?: string;
}

export const EMPTY_INPUT: DiscoveryInput = {
  tasks: [],
  roles: [],
  difficulties: [],
  materials: [],
  outputs: [],
  frequency: [],
};

export interface Recommendation {
  scenario: Scenario;
  score: number;
  matched: Partial<Record<ScoredCategory, string[]>>;
  reason: string;
  /** True when the reason was phrased by the optional AI module. */
  aiReason?: boolean;
}

export interface Recommender {
  recommend(input: DiscoveryInput): Promise<Recommendation[]>;
}
