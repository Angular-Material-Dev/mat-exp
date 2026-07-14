# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (build lib first, then start docs)
npm run build:lib                # Build library + copy README to dist
npm run watch:lib                # Watch-build the library during development
npm start                        # Serve docs app on localhost:4200

# Build
npm run build:docs               # Full docs pipeline: build-docs.ts -> ng build -> Pagefind indexing -> (postbuild:docs) sitemap + llms.txt
ng build                         # Docs app build only — does NOT regenerate manifests/routes.txt; run build:docs for a from-scratch build
npm run build:lib                # Build library (use this, not ng build directly)

# Test
npm test                         # Run docs app tests (Vitest via the Angular CLI unit-test builder)
ng test --project @ngm-dev/mat-exp           # Library tests only
ng test --project mat-exp-docs --filter="foo"  # Run tests matching a name pattern (Vitest builder option, not Jest's testPathPattern)

# E2E
ng e2e                           # Run Playwright e2e tests (spins up dev server automatically)

# Lint
ng lint

# Commits (enforces Conventional Commits via commitizen)
npm run commit
```

## Architecture

Two Angular projects in one workspace:

**Library** (`projects/ngm-dev/mat-exp/`) — the published npm package `@ngm-dev/mat-exp`. Entry point is `src/public-api.ts`, which re-exports from `./lib/components` and `./lib/types`. Packed by ng-packagr; assets (SVG paths, etc.) declared in `ng-package.json`. The root `tsconfig.json` path alias for `@ngm-dev/mat-exp` points to `dist/ngm-dev/mat-exp`, so **build the library before running the docs app**.

**Docs app** (`src/`) — a custom Angular SSG documentation site (not ng-doc). Content is markdown under `public/docs/`; the Angular app reads and renders it at runtime. `app.config.ts` wires up providers; routing is file-system-driven and pre-rendered via routes from `public/routes.txt`.

## Docs Content Structure

Content lives in `public/docs/` (not in `src/`), mirroring the URL structure:

```
public/docs/
  getting-started/
  components/
    all-buttons/
      button/
        index.md      # Overview tab
        api.md        # API tab
        styling.md    # Styling tab
                      # Playground tab is a live Angular component, not markdown
  styles-api/
```

A **Component Page** has three markdown files (`index.md`, `api.md`, `styling.md`) and a live Playground. The Playground tab is driven by `PLAYGROUND_PAGE_REGISTRY` in `src/app/docs/playground-page-registry.ts`, which maps each component's URL path to a hand-crafted Angular component under `src/app/docs/components/<component>/playground/`.

## Build Pipeline

`npm run build:docs` is one chained script (`tsx scripts/build-docs.ts && ng build && npx pagefind ...`), plus `postbuild:docs` (sitemap + `llms.txt` generation), which npm runs automatically afterward because its name matches the `build:docs` script:

1. `scripts/build-docs.ts` scans `public/docs/` to build the navigation tree → `public/nav-manifest.json`, and calls `scripts/extract-metadata.ts` (re-export barrel → `scripts/extract-metadata/`) (TypeScript compiler API) to parse the library source and emit:
   - `public/api-manifest.json` — all exported selectors, inputs, outputs, JSDoc
   - `public/playground-schemas.json` — per-component input control descriptors
   - `public/routes.txt` — consumed by Angular's `prerender` config for SSG
2. `ng build` builds and prerenders the docs app using the manifests/routes written in step 1
3. `npx pagefind` indexes the prerendered output for the search modal (see ADR 0003)
4. `postbuild:docs` (`scripts/generate-sitemap.ts`, `scripts/generate-llms-txt.ts`) runs automatically afterward via npm's script-hook naming convention

Running plain `ng build` skips all of the above except the Angular build itself — it will use whatever manifests/routes already exist on disk (or fail if they don't). When editing library inputs/outputs or JSDoc, re-run `npm run build:docs` to refresh the manifests.

## Angular 21 Conventions (enforced)

- **Standalone components only** — no `@NgModule`
- **`host` object** in `@Component`/`@Directive` decorators — never `@HostBinding`/`@HostListener`
- **Signals** for component state — avoid RxJS inside components
- **`input()` / `output()` functions** — not `@Input`/`@Output` decorators; use `model()` for two-way bound inputs (size, shape, toggle)
- **`OnPush` change detection** on every component
- **Native control flow** — `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`
- **No arrow functions in templates**
- **Strict TypeScript** — avoid `any`; prefer `unknown`

## Component Patterns

Button components are implemented as `@Directive` (not `@Component`) using the `inject()` pattern. They use `inject(X, { optional: true })` for optional dependencies like `ButtonGroup` context or `MatMenu`. The directive selector prefix is `matExp` (camelCase); component selector prefix is `mat-exp` (kebab-case) — enforced by ESLint.

**Standalone toggle buttons intentionally do not self-toggle on click** — outside a `MatExpButtonGroup`, toggling is consumer-driven via the `toggle` two-way binding; only the group manages toggle state for its children. Do not "fix" this (decision recorded on issue #188).

Supporting code in the library:
- `src/lib/types/` — shared type modules: size, shape, state, appearance, variant, width, selection, speed, config, toggle
- `src/lib/utils/di/` — DI helpers (`provideOptions`, `createOptions`) for option injection across button variants
- `src/lib/styles/` — SCSS architecture; `utils/_constants.scss` defines `$known-attributes` that drive style token generation

## Animations

GSAP 3 is the animation engine. Motion tokens are defined as TypeScript constants (e.g., `EXPRESSIVE_SPATIAL_SPRINGS` with `fast`/`default`/`slow` presets) — **never in SCSS**. Animation bootstrap requires calling `registerGsapPluginsOnce()` then `registerExpressiveEasesOnce()` before constructing timelines. All animations must respect `prefers-reduced-motion`.

## Accessibility

All components must pass AXE checks and meet WCAG AA. Use Angular CDK a11y utilities where applicable.

## Deployment

The docs site deploys to GitHub Pages (see `.github/workflows/deploy.yaml`). There is only ever one live deployment of "Latest," built from `main` — there is no versioned-subdomain or Vercel deployment. Historical major-version docs are not deployed anywhere; developers browse them on GitHub via tags/branches for that release instead. See the "Superseded" note after Wave 5c below and `docs/adr/0005-subdomain-versioning.md` (superseded) for the prior multi-version subdomain plan that this replaces.

## Editing Docs from the Site

Every Doc Page renders a metadata table (`DocPageMetaComponent`, embedded by `DocPageComponent` in `src/app/docs/doc-page/`) above the content: a **Docs Row** with "Edit this page" and (when frontmatter sets `designUrl`) a Design link, plus — on Component Pages (gated on `primarySymbol` frontmatter) — an **Import Row** and a **GitHub Row** (source folder + "Report an issue"). "Edit this page" opens the backing markdown file in GitHub's web editor at `{environment.githubRepoUrl}/edit/{environment.githubBranch}/public{rawMarkdownUrl}` — both fields live in `src/environments/environment.ts` / `environment.prod.ts` so the target repo/branch is configurable per build. The old "View markdown" / "Copy markdown" buttons were dropped (see ADR 0007).

## Open Issues — Development Order

Current open implementation issues and their recommended wave order. Update this table as issues close.

**Wave 1 — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #22 | SSG prerender + Pagefind indexing + Vercel deploy | merged PR #41 |
| #20 | API Reference Custom Element | merged PR #42 |
| #35 | Remove `/vN/` prefix routing (PR #32 cleanup) | merged PR #44 |
| #36 | `public/versions.json` + `VersionsService` | merged PR #43 |

**Wave 2 — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #23 | Search modal | merged PR #46 |
| #37 | `VERSION` env var + `DeprecationBannerComponent` | merged PR #45 |

**Wave 3 — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #38 | `VersionSwitcherComponent` subdomain navigation | merged PR #48 |
| #39 | GitHub Actions release workflow | merged PR #49 |

**Wave 4 — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #40 | ADR + documentation update | merged PR #50 |

**Wave 5a — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #51 | `act` foundation — ARM64 config, secrets template, `.gitignore` | merged PR #56 |
| #52 | Branch + path filters on `test-build-publish.yaml` | merged PR #57 |

**Wave 5b — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #53 | Local `test-build-publish` via `act` (dry-run semantic-release) | merged PR #58 |
| #54 | Local `version-snapshot` via `act` + wrapper script (dry-run default) | merged PR #59 |

**Wave 5c — complete** ✓

| Issue | Title | Status |
|---|---|---|
| #55 | `CONTRIBUTING.md` local CI/CD docs | merged PR #60 |

> **Superseded:** the MIT OSS migration dropped Vercel and the versioned-subdomain deployment
> strategy built above (#22's Vercel deploy, #35–#40's versioning system, #51–#54's
> `version-snapshot` local testing). The docs site now deploys only to GitHub Pages as a single
> "Latest" build; `VersionsService`, `VersionSwitcherComponent`, `DeprecationBannerComponent`,
> `public/versions.json`, `.github/workflows/version-snapshot.yml`, and
> `scripts/local-version-snapshot.sh` were all deleted. Old major-version docs are read directly
> on GitHub (tags/branches) instead of being redeployed. See `docs/adr/0005-subdomain-versioning.md`
> (marked superseded) and the "Deployment" section above.
>
> The entire local-CI-via-`act` feature built across Wave 5a–5c (#51–#55) was also removed:
> `.actrc`, `.secrets.example`, the `.gitignore` entry for `.secrets`, and CONTRIBUTING.md's
> "Local CI/CD" section are all deleted. Contributors no longer run `test-build-publish` or
> `version-snapshot` locally via `act` — CI workflows run only on GitHub.

**Wave 6a — API Reference: manifest extension** ✓

| Issue | Title | Status |
|---|---|---|
| #61 | Extend API Manifest — JSDoc tags, structured members, type params | merged PR #67 |
| #68 | Fix: capture constructor parameter properties in `extractClassMembers` | merged PR #69 |

**Wave 6b — API Reference: routing + pipeline** ✓

| Issue | Title | Status |
|---|---|---|
| #62 | API routing skeleton, build pipeline, sidebar entry | merged PR #70 |

**Wave 6c — API Reference: pages + links** ✓

| Issue | Title | Status |
|---|---|---|
| #63 | API Index Page — filterable symbol list grouped by kind | merged PR #71 |
| #64 | API Detail Page — full per-symbol documentation layout | merged PR #71 |
| #65 | Fix 7 stale `/api/classes/...` manual links | merged PR #71 |
| #66 | Auto-link inline code in markdown to API Detail Pages | merged PR #71 |

**Wave 7 — Commercial licensing** ✓

| Issue | Title | Status |
|---|---|---|
| #72 | Add Polar.sh URL and license price to environment config | merged PR #79 |
| #73 | Add PolyForm Noncommercial 1.0 license files | merged PR #80 |
| #74 | Add licensing documentation page and README section | merged PR #81 |
| #75 | Add `/pricing` page | merged PR #82 |

> **Superseded:** Wave 7's dual-license (PolyForm Noncommercial + paid) model was reversed by the
> MIT relicense — see `docs/ai-handoff/BUSINESS-STRATEGY.md` §4/§6. `LICENSE` is now MIT,
> `COMMERCIAL_LICENSE.md` and the `/pricing` and `/license` pages were deleted, and all
> pricing/commercial-license copy was removed from the docs site.

**Wave 8 — Routing restructure + landing page** ✓

| Issue | Title | Status |
|---|---|---|
| #76 | Routing: move all doc routes under `/docs` prefix; `/`, `/pricing`, `/license` stay at root | merged PR #86 |
| #77 | Shell: extract `DocsShellComponent` and `StandaloneShellComponent`; add `LicensePageComponent` at `/license` | merged PR #87 |
| #78 | Landing page at `/` | merged PR #88 |

**Wave 9a — Copy/View markdown: prefactor** ✓

| Issue | Title | Status |
|---|---|---|
| #84 | Expose `getMarkdownUrl()` as public method on `MarkdownService` | merged PR #89 |

**Wave 9b — Copy/View markdown: feature** ✓

| Issue | Title | Status |
|---|---|---|
| #85 | Add Copy markdown and View markdown buttons to `DocPageComponent` | merged PR #90 |

**Wave 10 — API URL restructure** ✓

| Issue | Title | Status |
|---|---|---|
| #91 | Restructure API reference URLs: scope-first path (`/docs/api/:package/:kind/:name`) | merged PR #92 |

**Wave 11 — Landing page redesign** ✓

| Issue | Title | Status |
|---|---|---|
| #93 | Redesign landing page: gallery strip, philosophy band, feature dialogs, updated CTA | merged PR #94 |

**Wave 12 — Playground source panel** ✓

| Issue | Title | Status |
|---|---|---|
| #96 | Add "View source" panel with tabbed, highlighted, copyable preview source to Playground | merged PR #97 |

**Wave 13 — Library architecture cleanup** ✓

| Issue | Title | Status |
|---|---|---|
| #100 | Collapse DI-options ceremony into one deep factory | closed 2026-07-10 (verified already implemented) |
| #101 | Give ButtonGroup/SplitButton a narrow `ButtonGroupChild` interface | closed 2026-07-10 (verified already implemented) |
| #102 | One source of truth for the TS ↔ SCSS attribute contract | closed 2026-07-10 (verified already implemented) |
| #103 | Parameterize the six duplicated `validate-*-config` Sass functions | closed 2026-07-10 (verified already implemented) |
| #104 | Delete abandoned styling scaffolding and dead DI wrapper | closed 2026-07-10 (verified already implemented) |
| #105 | Write ADR: button-family style mechanism split (Directive vs Component vs standalone) | closed 2026-07-10 (verified already implemented) |
| #106 | Wire loading-indicator into the docs playground registry | closed 2026-07-10 (verified already implemented) |

---

**Note on Waves 14–15 below:** unlike Waves 1–13 above (each shipped as a single PR bundling
issues that were already done together), Waves 14 and 15 were a forward-looking plan for the
then-open backlog (#116–#139, filed from `docs/ai-handoff/ISSUES-TRIAGED.md` and
`COMPONENT-FACTORY.md` §9 during the 2026-07-10 audit); all of their issues are now closed. They group issues by
**parallelizability**: every issue within a wave has no file- or logic-level dependency on any
other issue in the *same* wave, so they can be assigned to different agents/contributors and
worked simultaneously. Wave 15 issues depend on specific (not all) Wave 14 issues landing first
— see the "Blocked by" column. CI/release issues (#117, #119, #127, #128, #138) are
**intentionally excluded** from this plan; they are tracked separately.

**Wave 14 — Independent fixes, tests, and cleanup (no cross-issue blockers)** — complete ✓

| Issue | Title | Area |
|---|---|---|
| #116 | Fix npm package packaging — ships no usable styles | Library packaging |
| #118 | Fix invalid `size="sm"` example in button docs | Docs content |
| #120 | Fix FabMenu `panelClass` accumulation bug | Library (fab-menu) |
| #121 | Migrate remaining decorator inputs/getters to signals in the Button Family | Library (button family) |
| #124 | Unit tests for `MatExpSplitButton` | Library tests |
| #126 | Unit tests for `MatExpLoadingIndicator` | Library tests |
| #129 | Write missing `COMMERCIAL_LICENSE.md` | Docs/legal |
| #130 | Delete dead `temp/navigation-rail` foreign code | Cleanup |
| #131 | Replace library project `README.md` scaffold | Docs |
| #132 | Typo sweep across `public/docs/**` and `README.md` | Docs content |
| #134 | Update `CLAUDE.md` — still describes removed ng-doc architecture | Docs |
| #135 | Batch of P3 nits (forward-path naming, `select-required` whitelist, pagefind `html lang`, `postpublish` cpx, duplicate deprecation-banner) | Cleanup |
| #139 | Token-file linter for per-size key-set consistency | Tooling |

Low-risk shared-file overlaps within this wave — different lines/keys, safe to work in
parallel, just worth a heads-up if two contributors land at once:
- #116 and #135 both touch `projects/ngm-dev/mat-exp/package.json` (different script keys: `build:sass` vs `postpublish`).
- #118 and #132 both touch `public/docs/components/all-buttons/button/index.md` (different lines).
- #129 and #132 both touch root `README.md` (different sections).

**Wave 15 — Depends on specific Wave 14 issues landing first** — complete ✓

| Issue | Title | Blocked by | Why |
|---|---|---|---|
| #122 | Unit tests for `MatExpButton` | #121 (soft) | Test the final signal-based API instead of the getter being replaced, to avoid rework |
| #123 | Unit tests for `MatExpIconButton` | #121 (soft — stated explicitly in the issue body) | Same reason; the issue itself recommends sequencing after #121 |
| #125 | Unit tests for `MatExpFabMenu` / `FabMenuTrigger` | #120 (hard) + #121 (soft) | The `panelClass` regression test needs the bug fix (#120) to exist to mean anything; the trigger's `isMenuOpen` coverage depends on #121's signal migration |
| #133 | Reduce CSS payload of `mat-exp-all-styles()` | #116 (hard) | Issue explicitly says not to start before the packaging fix ships (also has a release-shipping dependency, tracked on the separate CI/release plan) |
| #136 | `ng add @ngm-dev/mat-exp` schematic | #116 (hard) | Issue explicitly blocked on the packaging fix — otherwise the schematic wires up a broken install |
| #137 | `new:component` generator | #121 (soft) | Generator templates should scaffold the final signal-only convention rather than propagate the decorator-getter pattern being removed |

"Hard" = doing the work before the blocker lands produces a broken or meaningless result.
"Soft" = recommended sequencing to avoid rework; technically startable in parallel if needed.
Wave 15 issues have no dependencies on each other and can each start as soon as their own
listed blocker(s) land — none of them need to wait for the *entire* Wave 14 to finish.

**Wave 16 — Doc Page metadata table (ant-design-style action rows)** — complete ✓

Replaces the flat "Edit this page / View markdown / Copy markdown" button row with a compact
metadata table modeled on ant-design's component-page action rows. See
`docs/adr/0007-doc-page-metadata-table.md` and the `CONTEXT.md` entries for **Docs Row**,
**Import Row**, and **GitHub Row**. Sub-waves are dependency tiers — issues within a sub-wave
have no blockers on each other and can be worked in parallel; each sub-wave is blocked by the
one before it.

"View markdown" and "Copy markdown" are dropped outright (not folded into the new table) — see
ADR 0007 for the rationale, including why a live GitHub open-issues count (considered, mirroring
ant-design) was rejected in favor of static links only.

**Wave 16a — prefactor** ✓

| Issue | Title | Blocked by |
|---|---|---|
| #167 | Centralize custom SVG icon registration | None |
| #172 | Move Doc Page title + actions row above tabs; dedupe per-tab title header | None |

Moves `CommunityDialogComponent`'s local icon registration to one shared app-wide spot and adds
the new icons the table needs (edit, design, doc, folder, flag). #172 relocates the existing flat
`.markdown-actions` row (and page title) out of `contentTpl` to render once above `<app-doc-tabs>`
instead of once per tab — independent of #167 (no new icons involved), safe to run in parallel.

**Wave 16b — Docs Row foundation** ✓

| Issue | Title | Blocked by |
|---|---|---|
| #168 | Docs Row on every Doc Page (new `DocPageMetaComponent`) | #167 (hard), #172 (hard) |

New component consumes the icons #167 registers, and is built in the above-tabs/shared location
#172 establishes rather than the old per-tab spot — building it before #172 lands would mean
moving it again afterward.

**Wave 16c — Component Page rows** ✓

| Issue | Title | Blocked by |
|---|---|---|
| #169 | Import Row on Component Pages | #168 (hard) |
| #170 | GitHub Row on Component Pages | #168 (hard) |

Both extend the `DocPageMetaComponent` table #168 creates; independent of each other, safe to
run in parallel once #168 lands.

**Wave 17 — Remove Component Page tabs; combine into a single `index.md`** — complete ✓

Collapses the four-tab Component Page (Overview/API/Styling/Playground, `app-doc-tabs`) into one
markdown page per component. `api.md`/`styling.md` fold into `index.md` as `## API`/`## Styling`
sections (order: Overview → Playground → API → Styling); old sub-tab URLs (`/slug/api`,
`/slug/styling`, `/slug/playground`) 404, no redirects. Playground moves from a route-driven
`NgComponentOutlet` (`PLAYGROUND_PAGE_REGISTRY`, keyed by full path) to a markdown-authored
`<playground-preview preview="{slug}">` Angular custom element (lazy-registered, slug-keyed
`PLAYGROUND_PREVIEW_REGISTRY`), reversing `docs/adr/0001-angular-elements-for-markdown-embeds.md`'s
prior removal of `@angular/elements` — that ADR gets superseded as part of #177. Sequenced as a
pilot (prove the mechanism on one component) before the mechanical rollout to the rest, so there's
no interim window where Playground stops working on components not yet migrated.

| Issue | Title | Blocked by |
|---|---|---|
| #177 | Playground custom element + Button migration (pilot) | None |
| #178 | Migrate remaining 5 components off tabs (icon-button, button-group, split-button, fab-menu, loading-indicator) | #177 (hard) |
| #179 | Remove dead tabs architecture (`app-doc-tabs`, `build-docs.ts` tab-emission, old `PLAYGROUND_PAGE_REGISTRY`) | #178 (hard) |

#178's 5 components are mechanically identical to each other (merge, delete, add tag) and
independent of one another — parallelizable once #177 lands. #179 must wait for all 6 components
off tabs before the shared `app-doc-tabs` infrastructure can be safely deleted.

**Wave 18 — Library code-review follow-ups (filed 2026-07-14)**

Issues #184–#190 came out of a full code review of `projects/ngm-dev/mat-exp/` (correctness /
architecture / a11y / performance). CI/release issues (#117, #119, #127, #128, #138) remain
tracked separately, as before.

**Wave 18a — independent, parallelizable now**

| Issue | Title | Area |
|---|---|---|
| #184 | Loading-indicator morph loop leaks GSAP tweens past component destroy (untracked recursive tweens escape `matchMedia` revert) | Library (loading-indicator) |
| #185 | FabMenu `originalPanelClass` reads setter-only `MatMenu.panelClass` — always `undefined`, consumer panel classes clobbered | Library (fab-menu) |
| #187 | Toggle/selection state has no ARIA semantics — `aria-pressed`, `role="group"`, `aria-disabled` (WCAG 4.1.2) | Library a11y |
| #188 | Document standalone-toggle consumer contract (decision: intentional, docs-only — see Component Patterns above) | Docs |

**Wave 18b — land after #186 to avoid rework (soft blockers)**

| Issue | Title | Blocked by | Why |
|---|---|---|---|
| #189 | Button-group `disabled` broadcast force-enables individually-disabled children; guard `undefined` + document uniform size/shape broadcast | #186 (soft) | Touches the same `ButtonGroupChild` adapter/broadcast code #186 migrates to signals |
| #190 | Review nits batch: named options tokens, dead `MAT_EXP_VERSION`, JSDoc residue, `_onButtonClick` in public barrel, stale selection model on empty group, `@inquirer/prompts` runtime dep | #186 (soft) | The public-surface item touches the selectable-button contract #186 reworks |
