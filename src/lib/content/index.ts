import taxonomyJson from '../../../content/taxonomy.json';
import copyJson from '../../../content/copy.he.json';
import synonymsJson from '../../../content/synonyms.json';
import workTopicsJson from '../../../content/work-topics.json';
import unitsJson from '../../../content/units.json';
import siteConfigJson from '@site-config';
import type { Demo, Scenario, SiteConfig, Taxonomy, Tool, Family, Units, WorkTopic } from './schema';

export type { Demo, Scenario, SiteConfig, Taxonomy, Tool, Family, Units, WorkTopic };

const scenarioModules = import.meta.glob('../../../content/scenarios/*.json', {
  eager: true,
  import: 'default',
});
const demoLoaders = import.meta.glob('../../../content/demos/*.json', { import: 'default' });

export const scenarios: Scenario[] = Object.values(scenarioModules as Record<string, Scenario>).sort((a, b) =>
  a.id.localeCompare(b.id),
);
export const taxonomy = taxonomyJson as Taxonomy;
export const siteConfig = siteConfigJson as SiteConfig;
export const synonymGroups = (synonymsJson as { groups: string[][] }).groups;

export type CopyKey = keyof typeof copyJson;
export function t(key: CopyKey): string {
  return copyJson[key];
}

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export const demoIds: string[] = Object.keys(demoLoaders)
  .map((p) =>
    p
      .split('/')
      .pop()!
      .replace(/\.json$/, ''),
  )
  .sort();

export async function loadDemo(id: string): Promise<Demo | undefined> {
  const key = Object.keys(demoLoaders).find((p) => p.endsWith(`/${id}.json`));
  if (!key) return undefined;
  return (await demoLoaders[key]!()) as Demo;
}

type TaxCategory = keyof Taxonomy;
const labelIndex = new Map<string, string>();
for (const [cat, items] of Object.entries(taxonomy) as [TaxCategory, Taxonomy[TaxCategory]][]) {
  for (const item of items) labelIndex.set(`${cat}:${item.id}`, item.label);
}
export function tagLabel(category: TaxCategory, id: string): string {
  return labelIndex.get(`${category}:${id}`) ?? id;
}

export const TOOL_LABELS: Record<Tool, string> = {
  gemini: 'Gemini',
  'gemini-notebook': 'Gemini Notebook (לשעבר NotebookLM)',
  'gemini-in-workspace-apps': 'Gemini ביישומי Workspace',
};
export const TOOL_SHORT: Record<Tool, string> = {
  gemini: 'Gemini',
  'gemini-notebook': 'Gemini Notebook',
  'gemini-in-workspace-apps': 'Gemini ביישומי Workspace',
};
export const FAMILY_LABELS: Record<Family, string> = {
  understand: 'להבין חומר',
  compare: 'להשוות ולארגן',
  write: 'לכתוב ולנסח',
  learn: 'ללמוד וללמד',
};

export const workTopics = (workTopicsJson as { topics: WorkTopic[] }).topics;
export const units = unitsJson as Units;
export const allUnits = units.clusters.flatMap((c) => c.units.map((u) => ({ ...u, cluster: c })));
export type UnitWithCluster = (typeof allUnits)[number];
export function getUnit(id: string): UnitWithCluster | undefined {
  return allUnits.find((u) => u.id === id);
}
export function getTopic(id: string): WorkTopic | undefined {
  return workTopics.find((t) => t.id === id);
}
/** Topics offered for a unit; "other" (or unknown unit) gets every topic. */
export function topicsForUnit(unitId: string): WorkTopic[] {
  const u = getUnit(unitId);
  if (!u) return workTopics;
  return u.topics.map(getTopic).filter((t): t is WorkTopic => t !== undefined);
}
