# Decisions

Format: decision · reason · rejected alternative. Dated 2026-11-17 unless noted.

## Stack and versions

| Decision                                                                                                                      | Reason                                                                                        | Rejected                     |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| Vite 8, React 19, react-router-dom 7 (HashRouter), Zod 4, MiniSearch 7, Vitest 5, Playwright 1.65, ESLint 10                  | Latest versions on the npm registry on 2026-11-17 (`npm view`)                                | Versions from memory         |
| **TypeScript 6.0**, not 7.0                                                                                                   | typescript-eslint 8.73 peer range is `>=4.8.4 <6.1.0`; TS 7 would break linting               | TS 7 without type-aware lint |
| GitHub Actions: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5, upload-artifact v7 | Latest releases per GitHub API on 2026-11-17                                                  | Older majors                 |
| Node 24 in CI                                                                                                                 | Current LTS line; `w3c-xmlserializer` (via jsdom) requires `^22.22.2 \|\| ^24.15.0 \|\| >=26` | Node 25 (odd, non-LTS)       |
| Firebase SDK 13.4 (`firebase/ai`, `GoogleAIBackend`, `useLimitedUseAppCheckTokens`)                                           | Confirmed in the installed type definitions (`@firebase/ai` public d.ts)                      | —                            |

## Architecture

- **The AI module is not built at all when the flag is off.** `ResultsPage` gates `lazy(import(...))` on an inline `import.meta.env.VITE_ENABLE_AI_ASSIST === 'true'`, which the bundler folds to `false` and drops. A re-exported constant from another module was _not_ folded (the chunk was still emitted), so it was replaced. `scripts/check-bundle.ts` fails the build if any asset contains `firebase|googleapis|recaptcha` with the flag off. Rejected: "loaded only on demand" (chunk still published).
- **CSP is injected only into production builds** (`vite build`) via a small Vite plugin, because the dev server needs inline scripts for HMR. With the flag off: `connect-src 'self'`, `script-src 'self'`, `frame-src 'none'`, `form-action 'none'`.
- **CSP domains for the AI module are configuration, not code** (`VITE_CSP_EXTRA_CONNECT/SCRIPT/FRAME`). `TODO(verify)`: run once with the flag on (brief section 11) and record the exact Firebase / reCAPTCHA Enterprise origins here. Not verified because no Firebase project exists.
- **`VITE_GEMINI_MODEL` has no default.** `TODO(verify)`: choose a stable (non-preview) model available on the Gemini Developer API free tier from the official Firebase AI Logic docs when enabling. The client throws if it is unset, and the UI falls back to rules.
- **Zod runs in CI and in dev only**, not in the production bundle (keeps the initial load small). Production casts the build-time JSON; CI guarantees it is valid.
- **Demos are loaded lazily per id** (`import.meta.glob` non-eager); scenarios are eager because the recommender needs all of them.
- **Site config via the `@site-config` alias**, so the e2e suite can build once with `tests/e2e/site.config.e2e.json` (mailto mode) and test the access-request flow end to end. Rejected: an env override inside the app (adds runtime surface).
- **Search**: query words (minus a short stopword list) are combined with AND, each expanded with its Hebrew variants and synonyms (OR). If AND yields nothing, it falls back to OR. Search text lives only in component state.
- **Recommender threshold = 5** (one task match + one other match). Diversity swaps the third pick only for an alternative that also passes the threshold and is within `diversityGap` (2).
- **Share link** (optional in the brief) implemented: `#/results?tasks=...` with taxonomy ids only; unknown ids are dropped on decode.
- **Access request `url` mode accepts only `https://`** URLs (prevents `javascript:` from a misconfigured file).
- **Error boundary around routed pages.** Found during manual testing: after a rebuild, an open tab tried to load a deleted lazy chunk and went blank. Now it shows a Hebrew message with a reload button. The banner and footer stay visible.
- **Each page starts at the top** and moves focus to its `h1` without scrolling, so the org-data banner is always in view on arrival.
- **Two e2e viewports** (desktop and 360px) plus a no-horizontal-scroll check and an axe pass in dark mode.

## Content

- Scenarios and demos were drafted by Claude Code. All are `draft` / `illustrative`.
- Gemini app sources used (opened 2026-11-17): support.google.com/gemini/answer/13275745 (use Gemini Apps), /14903178 (attach files), /15719111 (Deep Research), /14184041 (export to Sheets). Hebrew for the Gemini web app: listed on /13575153. Gemini Notebook: knowledge.workspace.google.com/admin/generative-ai/notebooklm ("over 80 languages", Hebrew not named → `unknown`).
- **Flag for the owner:** the Notebook admin page says Drive sources are _auto-synced and cached_; it does not say "copied". The brief's wording ("מועתקים") was kept in the limitations because the brief requires it, but should be re-checked against the source.
- Comparison (#4, #8–#10) and FAQ (#22) are not named Notebook features; they are described as chat over sources with citations, which is documented.
- Extra copy keys added: `notice.experimentOnly`, `notice.cautionInternal`, `notice.fullLink`, plus UI strings. The six required `notice.*` texts are verbatim from the brief.
- `allowed-domains.json` also lists `googleblog.com` and `google.dev` (official Google domains used in the brief's sources). In code files only, `www.w3.org` and `json-schema.org` are tolerated (SVG namespace etc.).

## Improvements over the brief (requested: "improve the spec where needed")

1. **Repository created private** until the owner gets the organizational approval for public publication (brief section 14, item 4). The deploy job is skipped while the repo is private, so no failing runs. Make it public to publish.
2. AI module is excluded from the build, not just lazy-loaded (stronger guarantee for "no Firebase code when off").
3. Test-only config build to e2e-test the access request (brief asked for it; config is build-time).
4. Mobile 360px e2e project, horizontal-overflow test, dark-mode axe, cookie/localStorage test, "no free-text field" test.
5. `docs/BUILD_BRIEF.md` is the full brief for sections 0–8; sections 9–15 and Appendix B are kept in a condensed form (all requirements retained).

## Not done / out of scope for this pass

- Lighthouse was not run in CI (would add a network-heavy dependency). Initial load is 101 KB gzip (budget 200 KB). Run Lighthouse manually once deployed.
- Time calculator implemented as a collapsed "conditional illustration" on the card page; it stores nothing.

## Round 2 (2026-11-17): units, quick path, design, consult

- **Owner decision:** show the Justice Ministry's real unit names and the org name on the public site; route consultations to the CDO (Ariel Nevo) by name, via the request form, with no email on the site. Recorded here because it reverses the brief's default (`orgDisplayName` empty).
- **Only names and generic topics are committed.** The owner supplied unit descriptions including caseload figures, plans, staffing and reorganizations. None of that is in the repo; it was used only to choose each unit's topics. Units the owner marked "no info" or "general knowledge" got topics by name only. Rejected: unit descriptions on the site.
- **Quick path = curated, not scored.** 19 work topics (`content/work-topics.json`), each with 3 hand-picked scenarios and a tag set. Unit → its topics → 3 suggestions with a verbal reason ("…כי ציינת שאתם עוסקים ב…"). "דייקו את ההתאמה" pre-fills the detailed questionnaire from the topic tags plus the cluster's role. Rejected: scoring the unit itself (unit names carry no tag semantics and would look arbitrary).
- **5 new scenarios** for recurring ministry-type work, generic and public/mock material only: summarize-public-ruling, reply-to-public-inquiry, summarize-public-comments, periodic-report-from-data, decision-template. All `draft`.
- **Request access = the Monday form** (`mode: url`). The form has no prefill parameter we could verify, so the card shows the summary with a copy button, then opens the form. The form also asks to choose a service (Google Workspace / Gemini Enterprise); the site does not advise which, and points to the CDO instead.
- **Design:** self-hosted Heebo variable font (`@fontsource-variable/heebo`, OFL, bundled, no third-party request), gradient palette, animated SVG hero and family icons (CSS animation, disabled under `prefers-reduced-motion`), sticky header on wide screens only.
- **Video:** a 14-second silent screen recording of the site itself (`public/media/quick-path.webm`, 447 KB, poster JPG), made with Playwright + the studio's ffmpeg (VP9, CRF 42). Accurate by construction, unlike generated clips. Autoplays muted only without reduced motion; has controls and a text description.
- **AI-Studio images/video not used this round:** Draw Things' API server was off (it must be enabled by hand after every launch), and LTX only does image-to-video. Generated hero images can be added later without code changes.
- Initial load after the redesign: 112.9 KB gzip (budget 200 KB).
