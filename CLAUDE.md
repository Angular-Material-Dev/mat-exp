# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
ng serve                         # Start docs app on localhost:4200
npm run watch:lib                # Watch-build the library

# Build
ng build                         # Build docs app
ng build @ngm-dev/mat-expressive # Build library via ng-packagr

# Test
npm test                         # Run all tests (Vitest)
ng test --project mat-expressive-docs               # Docs app tests only
ng test --project @ngm-dev/mat-expressive           # Library tests only

# Lint
ng lint
```

## Architecture

Two Angular projects in one workspace:

**Docs app** (`src/`) — an [ng-doc](https://ng-doc.com/) documentation site that showcases the library. `app.config.ts` wires up ng-doc providers; routing is managed entirely by ng-doc. Pages live under `src/app/docs/`.

**Library** (`projects/ngm-dev/mat-expressive/`) — the published npm package `@ngm-dev/mat-expressive`. Entry point is `src/public-api.ts`. Components are grouped under `src/lib/components/`, with shared SCSS tokens in `src/lib/styles/`. Packed by ng-packagr; assets (SVG paths, etc.) declared in `ng-package.json`.

Current components:
- `all-buttons/` — Button, IconButton, ButtonGroup, SplitButton, FabMenu, SelectableButton
- `loading-and-progress/` — LoadingIndicator (GSAP-animated, spring-bounce morphing)

## Angular 21 Conventions (enforced)

- **Standalone components only** — no `@NgModule`
- **`host` object** in `@Component`/`@Directive` decorators — never `@HostBinding`/`@HostListener`
- **Signals** for component state — avoid RxJS inside components
- **`input()` / `output()` functions** — not `@Input`/`@Output` decorators
- **`OnPush` change detection** on every component
- **Native control flow** — `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`
- **No arrow functions in templates**
- **Strict TypeScript** — avoid `any`; prefer `unknown`

## Animations

GSAP 3 is the animation engine for the loading indicator. Motion tokens are defined as TypeScript constants (not in SCSS) and passed to GSAP timelines. SCSS handles only visual/structural styles.

## Accessibility

All components must pass AXE checks and meet WCAG AA. Use Angular CDK a11y utilities where applicable.
