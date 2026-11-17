# CLAUDE.md

Static Hebrew (RTL) site that helps employees without a license discover where Gemini and Gemini Notebook (formerly NotebookLM) could help them, then request access. Full spec: `docs/BUILD_BRIEF.md`. Decisions: `docs/DECISIONS.md`.

## Iron rules (never break)

1. **No organizational data, anywhere.** The repo and site are public. No org-internal info, employee names, internal systems or addresses, real documents, real bodies or laws in demos, secrets. By the owner's decision (2026-11-17) the site shows: the org name (`orgDisplayName`), public **unit names** and generic work topics (`content/units.json`, `content/work-topics.json`), and the CDO's name and role (`config/site.config.json` → `consult`). Never add unit figures, caseloads, plans, staffing, reorganizations or any other detail about a unit.
2. **The org-data notice is everywhere.** Use only `<OrgDataNotice variant="banner|inline|full|footer" />`. Every route renders inside `Layout` (banner + footer). Journey and results also show `notice.inline`. e2e fails if a route lacks them. Texts live in `content/copy.he.json`.
3. **No free-text input** except the catalog search, which never leaves component state (no URL, storage or request).
4. **Zero cost, zero third parties at runtime.** No fonts/CDN/analytics/cookies. `localStorage` only on explicit "save". CSP `connect-src 'self'` when the AI flag is off.
5. **Content integrity.** No savings promises, no match percentages, no claims on Google data protection/residency/privacy, no claims of availability in the org. Distinguish: exists at Google (source + date) / included in package (`unknown` until a human sets it) / verified in org (`false` until a human sets it). New scenarios are `status: "draft"`.
6. **Core works without any model.** The AI module (`src/features/ai-assist`) is off (`VITE_ENABLE_AI_ASSIST=false`) and, when off, is not even built (checked by `npm run check:bundle`).
7. **House style, light only** (ROI Simulator / My PR Studio tokens in `src/styles/global.css`). **Hebrew RTL + WCAG 2.2 AA.** Logical CSS properties only; wrap Latin product names in `<bdi>`; keyboard access, visible focus, `aria-live` for results, 360px width.
8. **Verify facts** about Google/Firebase/GitHub in official docs before putting them in code or content; otherwise leave `TODO(verify)`.

User-facing text is Hebrew; code, file names and technical comments are English.

## Commands

```bash
npm ci
npm run dev               # local dev server
npm run check             # lint + typecheck + content validate/lint + unit + build + bundle check
npm test                  # unit (Vitest)
npm run test:e2e          # Playwright + axe (builds and serves on :4173 and :4174)
npm run content:validate  # Zod schemas + cross references
npm run content:lint      # emails/phones/9-digit/URL allow-list (+ CONTENT_FORBIDDEN_TERMS env)
```

## Layout

- `config/site.config.json` — site settings, access-request form, CDO consult, recommender weights
- `content/units.json` + `content/work-topics.json` — quick path: unit → topic → curated scenarios (+ prefill for the detailed questionnaire)
- `public/media/` — hero image, AI avatar (stacked alpha), film, walkthrough recording
- `video/` — Remotion film, narration and avatar sources (see `video/README.md`); not part of the site build
- `content/` — `taxonomy.json`, `copy.he.json`, `synonyms.json`, `allowed-domains.json`, `scenarios/*.json`, `demos/*.json`
- `src/lib/content/schema.ts` — Zod schemas (source of truth for content shape)
- `src/lib/{hebrew,search,recommend,storage}` — normalization, MiniSearch, rule engine, opt-in storage
- `src/features/{discover,catalog,demos,card,ai-assist,static}` — pages
- `scripts/` — `validate-content.ts`, `content-lint.ts`, `check-bundle.ts`
- `tests/unit`, `tests/e2e` — Vitest, Playwright
