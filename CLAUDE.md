# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm start                        # Start docs app on localhost:4200 (via ng-doc builder)
npm run watch:lib                # Watch-build the library

# Build
ng build                         # Build docs app
npm run build:lib                # Build library + copy README to dist (use this, not ng build directly)

# Test
npm test                         # Run all tests (Vitest via Angular CLI)
ng test --project mat-expressive-docs               # Docs app tests only
ng test --project @ngm-dev/mat-expressive           # Library tests only

# Lint
ng lint
```

## Architecture

Two Angular projects in one workspace:

**Docs app** (`src/`) — an [ng-doc](https://ng-doc.com/) documentation site built with the custom `@ng-doc/builder` (not the standard Angular builder). `app.config.ts` wires up ng-doc providers; routing is managed entirely by ng-doc via `NG_DOC_ROUTING`. Pages live under `src/app/docs/` in three sections: `getting-started/`, `components/`, and `styles-api/`.

**Library** (`projects/ngm-dev/mat-expressive/`) — the published npm package `@ngm-dev/mat-expressive`. Entry point is `src/public-api.ts`, which re-exports from `./lib/components` and `./lib/types`. Packed by ng-packagr; assets (SVG paths, etc.) declared in `ng-package.json`. The root `tsconfig.json` path alias for `@ngm-dev/mat-expressive` points to `dist/ngm-dev/mat-expressive`, so **build the library before running the docs app**.

Current components (`src/lib/components/`):
- `all-buttons/` — Button, IconButton, ButtonGroup, SplitButton, FabMenu, SelectableButton
- `loading-and-progress/` — LoadingIndicator (GSAP-animated, spring-bounce morphing)

Supporting code:
- `src/lib/types/` — shared type modules: size, shape, state, appearance, variant, width, selection, speed, config, toggle
- `src/lib/utils/di/` — DI helpers (`provideOptions`, `createOptions`) for option injection across button variants
- `src/lib/styles/` — SCSS architecture; `utils/_constants.scss` defines `$known-attributes` (size, shape, state, toggle, appearance, width, variant, selection, color) that drive style token generation

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

## Animations

GSAP 3 is the animation engine. Motion tokens are defined as TypeScript constants (e.g., `EXPRESSIVE_SPATIAL_SPRINGS` with `fast`/`default`/`slow` presets) — **never in SCSS**. Animation bootstrap requires calling `registerGsapPluginsOnce()` then `registerExpressiveEasesOnce()` before constructing timelines. All animations must respect `prefers-reduced-motion`.

## Accessibility

All components must pass AXE checks and meet WCAG AA. Use Angular CDK a11y utilities where applicable.
