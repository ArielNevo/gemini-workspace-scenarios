import { z } from 'zod';

export const ToolSchema = z.enum(['gemini', 'gemini-notebook', 'gemini-in-workspace-apps']);
export const FamilySchema = z.enum(['understand', 'compare', 'write', 'learn']);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');
const nonEmpty = z.string().trim().min(1);

export const ScenarioSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case id'),
    family: FamilySchema,
    title: nonEmpty,
    userNeed: nonEmpty,
    tool: ToolSchema,
    alternateTool: ToolSchema.optional(),
    whatYouGet: nonEmpty,
    tags: z.object({
      tasks: z.array(nonEmpty).min(1),
      difficulties: z.array(nonEmpty).min(1),
      materials: z.array(nonEmpty).min(1),
      outputs: z.array(nonEmpty).min(1),
      roles: z.array(nonEmpty).optional(),
      frequency: z.array(nonEmpty).optional(),
    }),
    priority: z.number().int().min(1).max(5),
    firstExperiment: z.object({
      materialSuggestion: nonEmpty,
      steps: z.array(nonEmpty).min(2).max(4),
      successCriteria: z.array(nonEmpty).min(1),
      timeBoxMinutes: z.number().int().positive().max(120),
    }),
    whatToVerify: z.array(nonEmpty).min(2),
    limitations: z.array(nonEmpty).min(1),
    demoId: z.string().optional(),
    capability: z.object({
      googleDocumented: z.boolean(),
      sourceUrl: z.string().url(),
      checkedOn: isoDate,
      includedInOrgPackage: z.enum(['unknown', 'yes', 'no']),
      verifiedInOrg: z.boolean(),
    }),
    hebrewSupport: z.object({
      status: z.enum(['listed', 'not-listed', 'unknown']),
      note: z.string().optional(),
      checkedOn: isoDate,
    }),
    status: z.enum(['draft', 'reviewed']),
  })
  .strict();

const SectionSchema = z.object({ id: nonEmpty, heading: z.string().optional(), text: nonEmpty });
const SourceDocSchema = z.object({ title: nonEmpty, sections: z.array(SectionSchema).min(1) });

const DemoBase = {
  id: z.string().regex(/^demo-[a-z0-9-]+$/),
  title: nonEmpty,
  intro: nonEmpty,
  provenance: z.enum(['illustrative', 'generated-and-verified']),
  generatedWith: z.string().optional(),
  generatedOn: isoDate.optional(),
  verifiedBy: z.string().optional(),
  toolCanDo: nonEmpty,
  needsReview: nonEmpty,
  relatedScenarios: z.array(nonEmpty).min(1),
};

export const DemoSchema = z.discriminatedUnion('kind', [
  z.object({
    ...DemoBase,
    kind: z.literal('versions'),
    versions: z.array(z.object({ id: nonEmpty, label: nonEmpty, text: nonEmpty })).min(2),
  }),
  z.object({
    ...DemoBase,
    kind: z.literal('brief'),
    source: SourceDocSchema,
    brief: z.object({
      title: nonEmpty,
      items: z.array(z.object({ text: nonEmpty, sourceSectionId: nonEmpty })).min(3),
    }),
  }),
  z.object({
    ...DemoBase,
    kind: z.literal('compare'),
    before: SourceDocSchema,
    after: SourceDocSchema,
    changes: z
      .array(
        z.object({
          id: nonEmpty,
          summary: nonEmpty,
          type: z.enum(['added', 'removed', 'changed']),
          beforeSectionId: z.string().optional(),
          afterSectionId: z.string().optional(),
        }),
      )
      .min(3),
  }),
  z.object({
    ...DemoBase,
    kind: z.literal('qa'),
    source: SourceDocSchema,
    questions: z
      .array(z.object({ id: nonEmpty, question: nonEmpty, answer: nonEmpty, sourceSectionId: nonEmpty }))
      .min(3),
  }),
  z.object({
    ...DemoBase,
    kind: z.literal('learn'),
    source: SourceDocSchema,
    glossary: z.array(z.object({ term: nonEmpty, definition: nonEmpty })).min(4),
    topicMap: z.array(z.object({ topic: nonEmpty, subtopics: z.array(nonEmpty).min(1) })).min(2),
    quiz: z
      .array(
        z.object({
          id: nonEmpty,
          question: nonEmpty,
          options: z.array(nonEmpty).min(2).max(4),
          correctIndex: z.number().int().min(0),
          explanation: nonEmpty,
        }),
      )
      .min(3),
  }),
  z.object({
    ...DemoBase,
    kind: z.literal('drafts'),
    bullets: z.array(nonEmpty).min(3),
    audiences: z.array(z.object({ id: nonEmpty, label: nonEmpty })).min(2),
    lengths: z.array(z.object({ id: nonEmpty, label: nonEmpty })).min(2),
    drafts: z.array(z.object({ audience: nonEmpty, length: nonEmpty, text: nonEmpty })).min(4),
  }),
]);

const TaxItem = z.object({ id: nonEmpty, label: nonEmpty });
export const TaxonomySchema = z.object({
  tasks: z.array(TaxItem),
  difficulties: z.array(TaxItem),
  materials: z.array(TaxItem),
  outputs: z.array(TaxItem),
  frequency: z.array(TaxItem),
  roles: z.array(TaxItem),
  materialClass: z.array(TaxItem),
});

export const SiteConfigSchema = z.object({
  siteTitle: nonEmpty,
  orgDisplayName: z.string(),
  logoPath: z.string(),
  disclaimer: nonEmpty,
  robots: z.string(),
  catalogUpdatedOn: isoDate,
  requestAccess: z.object({
    mode: z.enum(['none', 'url', 'mailto']),
    url: z.string(),
    mailto: z.string(),
    subject: z.string(),
    prefill: z.object({ param: z.string(), maxChars: z.number().int().positive() }),
  }),
  feedbackUrl: z.string(),
  orgGuidelinesUrl: z.string(),
  nationalGuideUrl: z.string(),
  recommend: z.object({
    weights: z.object({
      tasks: z.number(),
      outputs: z.number(),
      materials: z.number(),
      difficulties: z.number(),
      roles: z.number(),
      frequency: z.number(),
    }),
    threshold: z.number(),
    diversityGap: z.number(),
    maxResults: z.number().int().positive(),
  }),
});

export type Tool = z.infer<typeof ToolSchema>;
export type Family = z.infer<typeof FamilySchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type Demo = z.infer<typeof DemoSchema>;
export type Taxonomy = z.infer<typeof TaxonomySchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type TagCategory = keyof Scenario['tags'];
