# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (build lib first, then start docs)
npm run build:lib                # Build library + copy README to dist
npm run watch:lib                # Watch-build the library during development
npm start                        # Serve docs app on localhost:4200
npm run build:docs               # Run build script: regenerate nav-manifest.json, api-manifest.json, playground-schemas.json, routes.txt

# Build
ng build                         # Build docs app (runs build:docs automatically via prebuild hook)
npm run build:lib                # Build library (use this, not ng build directly)

# Test
npm test                         # Run docs app tests (Vitest via Angular CLI)
ng test --project @ngm-dev/mat-expressive           # Library tests only
ng test --project mat-expressive-docs --testPathPattern="foo"  # Run single test file

# E2E
ng e2e                           # Run Playwright e2e tests (spins up dev server automatically)

# Lint
ng lint

# Commits (enforces Conventional Commits via commitizen)
npm run commit
```

## Architecture

Two Angular projects in one workspace:

**Library** (`projects/ngm-dev/mat-expressive/`) — the published npm package `@ngm-dev/mat-expressive`. Entry point is `src/public-api.ts`, which re-exports from `./lib/components` and `./lib/types`. Packed by ng-packagr; assets (SVG paths, etc.) declared in `ng-package.json`. The root `tsconfig.json` path alias for `@ngm-dev/mat-expressive` points to `dist/ngm-dev/mat-expressive`, so **build the library before running the docs app**.

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

`npm run build:docs` (`scripts/build-docs.ts`) must run before `ng build` (it is wired as a prebuild step). It:

1. Scans `public/docs/` to build the navigation tree → `public/nav-manifest.json`
2. Calls `scripts/extract-metadata.ts` (re-export barrel → `scripts/extract-metadata/`) (TypeScript compiler API) to parse the library source and emit:
   - `public/api-manifest.json` — all exported selectors, inputs, outputs, JSDoc
   - `public/playground-schemas.json` — per-component input control descriptors
3. Writes `public/routes.txt` — consumed by Angular's `prerender` config for SSG

When editing library inputs/outputs or JSDoc, re-run `npm run build:docs` to refresh the manifests.

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

Button components are implemented as `@Directive` (not `@Component`) using the `inject()` pattern. They use `inject(X, { optional: true })` for optional dependencies like `ButtonGroup` context or `MatMenu`. The directive selector prefix is `matExpressive` (camelCase); component selector prefix is `mat-expressive` (kebab-case) — enforced by ESLint.

Supporting code in the library:
- `src/lib/types/` — shared type modules: size, shape, state, appearance, variant, width, selection, speed, config, toggle
- `src/lib/utils/di/` — DI helpers (`provideOptions`, `createOptions`) for option injection across button variants
- `src/lib/styles/` — SCSS architecture; `utils/_constants.scss` defines `$known-attributes` that drive style token generation

## Animations

GSAP 3 is the animation engine. Motion tokens are defined as TypeScript constants (e.g., `EXPRESSIVE_SPATIAL_SPRINGS` with `fast`/`default`/`slow` presets) — **never in SCSS**. Animation bootstrap requires calling `registerGsapPluginsOnce()` then `registerExpressiveEasesOnce()` before constructing timelines. All animations must respect `prefers-reduced-motion`.

## Accessibility

All components must pass AXE checks and meet WCAG AA. Use Angular CDK a11y utilities where applicable.

## Versioning

Each major library version is served from its own subdomain (`v1.expressive.angular-material.dev`, `v2.…`) backed by a long-lived `N.x.x` maintenance branch (e.g. `1.x.x`, `2.x.x`) following the semantic-release naming convention. All branches are deployed as separate Vercel branch deployments within a single Vercel project; custom domains are assigned manually once per version in Vercel project settings.

`main` is always "Latest" at `expressive.angular-material.dev`. The Angular app on `main` has no version-prefix routing — version identity is a build-time `environment.version` constant (empty string on `main`, `"v1"` on the `1.x.x` branch, etc.). Available versions are listed in `public/versions.json` on `main` and fetched at runtime by `VersionsService`.

On major release, a GitHub Actions workflow (`.github/workflows/version-snapshot.yml`) automatically cuts the `N.x.x` branch from the release tag and appends the new version to `public/versions.json`. See `docs/adr/0005-subdomain-versioning.md` and `CONTEXT.md` for full details.

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
issues that were already done together), Waves 14 and 15 are a forward-looking plan for the
*current* open backlog (#116–#139, filed from `docs/ai-handoff/ISSUES-TRIAGED.md` and
`COMPONENT-FACTORY.md` §9 during the 2026-07-10 audit). They group issues by
**parallelizability**: every issue within a wave has no file- or logic-level dependency on any
other issue in the *same* wave, so they can be assigned to different agents/contributors and
worked simultaneously. Wave 15 issues depend on specific (not all) Wave 14 issues landing first
— see the "Blocked by" column. CI/release issues (#117, #119, #127, #128, #138) are
**intentionally excluded** from this plan; they are tracked separately.

**Wave 14 — Independent fixes, tests, and cleanup (no cross-issue blockers)**

| Issue | Title | Area |
|---|---|---|
| #116 | Fix npm package packaging — ships no usable styles | Library packaging |
| #118 | Fix invalid `size="sm"` example in button docs | Docs content |
| #120 | Fix FabMenu `panelClass` accumulation bug | Library (fab-menu) |
| #121 | Migrate remaining decorator inputs/getters to signals in the Button Family | Library (button family) |
| #124 | Unit tests for `MatExpressiveSplitButton` | Library tests |
| #126 | Unit tests for `MatExpressiveLoadingIndicator` | Library tests |
| #129 | Write missing `COMMERCIAL_LICENSE.md` | Docs/legal |
| #130 | Delete dead `temp/navigation-rail` foreign code | Cleanup |
| #131 | Replace library project `README.md` scaffold | Docs |
| #132 | Typo sweep across `public/docs/**` and `README.md` | Docs content |
| #134 | Update `CLAUDE.md` — still describes removed ng-doc architecture | Docs |
| #135 | Batch of P3 nits (forward-path naming, `select-required` whitelist, pagefind `html lang`, `postpublish` cpx, duplicate deprecation-banner) | Cleanup |
| #139 | Token-file linter for per-size key-set consistency | Tooling |

Low-risk shared-file overlaps within this wave — different lines/keys, safe to work in
parallel, just worth a heads-up if two contributors land at once:
- #116 and #135 both touch `projects/ngm-dev/mat-expressive/package.json` (different script keys: `build:sass` vs `postpublish`).
- #118 and #132 both touch `public/docs/components/all-buttons/button/index.md` (different lines).
- #129 and #132 both touch root `README.md` (different sections).

**Wave 15 — Depends on specific Wave 14 issues landing first**

| Issue | Title | Blocked by | Why |
|---|---|---|---|
| #122 | Unit tests for `MatExpressiveButton` | #121 (soft) | Test the final signal-based API instead of the getter being replaced, to avoid rework |
| #123 | Unit tests for `MatExpressiveIconButton` | #121 (soft — stated explicitly in the issue body) | Same reason; the issue itself recommends sequencing after #121 |
| #125 | Unit tests for `MatExpressiveFabMenu` / `FabMenuTrigger` | #120 (hard) + #121 (soft) | The `panelClass` regression test needs the bug fix (#120) to exist to mean anything; the trigger's `isMenuOpen` coverage depends on #121's signal migration |
| #133 | Reduce CSS payload of `mat-expressive-all-styles()` | #116 (hard) | Issue explicitly says not to start before the packaging fix ships (also has a release-shipping dependency, tracked on the separate CI/release plan) |
| #136 | `ng add @ngm-dev/mat-expressive` schematic | #116 (hard) | Issue explicitly blocked on the packaging fix — otherwise the schematic wires up a broken install |
| #137 | `new:component` generator | #121 (soft) | Generator templates should scaffold the final signal-only convention rather than propagate the decorator-getter pattern being removed |

"Hard" = doing the work before the blocker lands produces a broken or meaningless result.
"Soft" = recommended sequencing to avoid rework; technically startable in parallel if needed.
Wave 15 issues have no dependencies on each other and can each start as soon as their own
listed blocker(s) land — none of them need to wait for the *entire* Wave 14 to finish.
