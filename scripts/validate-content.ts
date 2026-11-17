/**
 * Validates all content against the Zod schemas plus cross-references:
 * unique ids, id === filename, every tag exists in the taxonomy, every demoId exists,
 * demo section references resolve, and relatedScenarios exist.
 */
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import {
  DemoSchema,
  ScenarioSchema,
  SiteConfigSchema,
  TaxonomySchema,
  UnitsSchema,
  WorkTopicsSchema,
} from '../src/lib/content/schema';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors: string[] = [];
const readJson = (p: string): unknown => JSON.parse(readFileSync(join(root, p), 'utf8'));

const taxonomy = TaxonomySchema.parse(readJson('content/taxonomy.json'));
SiteConfigSchema.parse(readJson('config/site.config.json'));
const copy = readJson('content/copy.he.json') as Record<string, unknown>;
for (const [k, v] of Object.entries(copy))
  if (typeof v !== 'string' || !v.trim()) errors.push(`copy: empty ${k}`);

const demoFiles = readdirSync(join(root, 'content/demos')).filter((f) => f.endsWith('.json'));
const demoIds = new Set<string>();
const demos = demoFiles.map((f) => {
  const r = DemoSchema.safeParse(readJson(`content/demos/${f}`));
  if (!r.success) {
    errors.push(`demo ${f}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    return null;
  }
  if (r.data.id !== basename(f, '.json')) errors.push(`demo ${f}: id does not match filename`);
  if (demoIds.has(r.data.id)) errors.push(`demo ${f}: duplicate id`);
  demoIds.add(r.data.id);
  if (
    r.data.provenance === 'generated-and-verified' &&
    !(r.data.generatedWith && r.data.generatedOn && r.data.verifiedBy)
  )
    errors.push(`demo ${f}: generated-and-verified requires generatedWith, generatedOn, verifiedBy`);
  const secIds = (doc: { sections: { id: string }[] }) => new Set(doc.sections.map((s) => s.id));
  const d = r.data;
  const need = (set: Set<string>, id: string | undefined, what: string) => {
    if (id !== undefined && !set.has(id)) errors.push(`demo ${f}: unknown ${what} section ${id}`);
  };
  if (d.kind === 'brief') d.brief.items.forEach((i) => need(secIds(d.source), i.sourceSectionId, 'source'));
  if (d.kind === 'qa') d.questions.forEach((q) => need(secIds(d.source), q.sourceSectionId, 'source'));
  if (d.kind === 'compare')
    d.changes.forEach((c) => {
      need(secIds(d.before), c.beforeSectionId, 'before');
      need(secIds(d.after), c.afterSectionId, 'after');
      if (!c.beforeSectionId && !c.afterSectionId) errors.push(`demo ${f}: change ${c.id} has no section`);
    });
  if (d.kind === 'learn')
    d.quiz.forEach((q) => {
      if (q.correctIndex >= q.options.length)
        errors.push(`demo ${f}: quiz ${q.id} correctIndex out of range`);
    });
  if (d.kind === 'drafts')
    for (const a of d.audiences)
      for (const l of d.lengths)
        if (!d.drafts.some((x) => x.audience === a.id && x.length === l.id))
          errors.push(`demo ${f}: missing draft ${a.id}/${l.id}`);
  return d;
});

const scenarioFiles = readdirSync(join(root, 'content/scenarios')).filter((f) => f.endsWith('.json'));
const scenarioIds = new Set<string>();
const tagSets = {
  tasks: new Set(taxonomy.tasks.map((i) => i.id)),
  difficulties: new Set(taxonomy.difficulties.map((i) => i.id)),
  materials: new Set(taxonomy.materials.map((i) => i.id)),
  outputs: new Set(taxonomy.outputs.map((i) => i.id)),
  roles: new Set(taxonomy.roles.map((i) => i.id)),
  frequency: new Set(taxonomy.frequency.map((i) => i.id)),
};
for (const f of scenarioFiles) {
  const r = ScenarioSchema.safeParse(readJson(`content/scenarios/${f}`));
  if (!r.success) {
    errors.push(`scenario ${f}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    continue;
  }
  const s = r.data;
  if (s.id !== basename(f, '.json')) errors.push(`scenario ${f}: id does not match filename`);
  if (scenarioIds.has(s.id)) errors.push(`scenario ${f}: duplicate id`);
  scenarioIds.add(s.id);
  for (const [cat, ids] of Object.entries(s.tags) as [keyof typeof tagSets, string[] | undefined][])
    for (const id of ids ?? [])
      if (!tagSets[cat].has(id)) errors.push(`scenario ${f}: unknown ${cat} tag "${id}"`);
  if (s.demoId && !demoIds.has(s.demoId)) errors.push(`scenario ${f}: demoId "${s.demoId}" not found`);
  if (s.alternateTool === s.tool) errors.push(`scenario ${f}: alternateTool equals tool`);
}
for (const d of demos)
  for (const id of d?.relatedScenarios ?? [])
    if (!scenarioIds.has(id)) errors.push(`demo ${d!.id}: related scenario "${id}" not found`);

const topics = WorkTopicsSchema.parse(readJson('content/work-topics.json')).topics;
const topicIds = new Set<string>();
for (const t of topics) {
  if (topicIds.has(t.id)) errors.push(`topic ${t.id}: duplicate id`);
  topicIds.add(t.id);
  for (const id of t.scenarios)
    if (!scenarioIds.has(id)) errors.push(`topic ${t.id}: scenario "${id}" not found`);
  for (const [cat, ids] of Object.entries(t.tags) as [keyof typeof tagSets, string[]][])
    for (const id of ids) if (!tagSets[cat].has(id)) errors.push(`topic ${t.id}: unknown ${cat} tag "${id}"`);
}
const units = UnitsSchema.parse(readJson('content/units.json'));
const unitIds = new Set<string>();
for (const c of units.clusters) {
  if (!tagSets.roles.has(c.role)) errors.push(`cluster ${c.id}: unknown role "${c.role}"`);
  for (const u of c.units) {
    if (unitIds.has(u.id)) errors.push(`unit ${u.id}: duplicate id`);
    unitIds.add(u.id);
    for (const t of u.topics) if (!topicIds.has(t)) errors.push(`unit ${u.id}: unknown topic "${t}"`);
  }
}
const usedTopics = new Set(units.clusters.flatMap((c) => c.units.flatMap((u) => u.topics)));
for (const t of topicIds)
  if (!usedTopics.has(t))
    console.warn(`note: topic ${t} is not linked to any unit (still offered under "other")`);

if (errors.length) {
  console.error(`Content validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Content OK: ${scenarioIds.size} scenarios, ${demoIds.size} demos, ${topicIds.size} topics, ${unitIds.size} units.`,
);
