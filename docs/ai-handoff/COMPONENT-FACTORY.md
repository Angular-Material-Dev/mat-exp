# COMPONENT-FACTORY.md — Ship a new component from zero, correctly

> This is a mechanical playbook. Follow it top to bottom. Where a step says VERIFY, do not
> proceed until the check passes. Written so that a smaller model can ship a component without
> reading anything else first — but ARCHITECTURE.md §4–§5 explains *why* these steps exist.

## 0. Decide the component's styling class (2 minutes, determines everything)

Ask: **does the new component share the discrete size/shape/appearance/state token system with
the Button Family?**

- **YES** (e.g. a new FAB variant, toolbar buttons) → **Family path**: `@Directive` on the
  Material component if Material already renders it, `@Component` if composing several;
  global SCSS mixin; every step below applies.
- **NO** (e.g. progress bar, navigation rail) → **Standalone path**: `@Component` with
  `styleUrls` + `ViewEncapsulation.None` + CSS custom properties
  (`--mat-expressive-<component>-<prop>` with inline fallbacks). Model it on
  `loading-and-progress/loading-indicator/` — copy its file set. Skip §3 (SCSS mixin steps);
  everything else still applies.

Time to ship a component today, all-manual: **1–3 days** for a family member (the SCSS token
transcription from the M3 spec dominates), ~1 day for a standalone component. The checklist
below is ~20 files touched for a family member; §9 proposes generators that cut it to ~5.

## 1. Types (`projects/ngm-dev/mat-expressive/src/lib/types/`)

1. If the component introduces a new attribute (like `width` for icon-button): create
   `lib/types/<attr>.ts` exporting one string-literal union
   (`export type MatExpressive<X> = 'a' | 'b';`), following the existing one-alias-per-value
   style in `size.ts`.
2. Re-export from `lib/types/index.ts`.
3. If the attribute must be a `data-*` selector in SCSS: add an entry to `ATTRIBUTE_SOURCES` in
   `scripts/generate-style-constants.ts` (~line 61) pointing at the file + union name(s), then
   run `npm run generate:style-constants`.
   VERIFY: `git diff projects/ngm-dev/mat-expressive/src/lib/styles/utils/_generated-attributes.scss`
   shows your values. Never edit that file by hand.
4. If the attribute has no TS union (rare), add it to the hand-maintained half of
   `$known-attributes` in `lib/styles/utils/_constants.scss` instead.

## 2. Component code (`lib/components/<group>/<name>/`)

Files: `<name>.ts`, `<name>.options.ts`, `index.ts` (+ `<name>.html` / `<name>.scss` for
components). Wire into `lib/components/<group>/index.ts` and, if the group is new,
`lib/components/index.ts`. VERIFY: the symbol is reachable from `public-api.ts` (the docs API
manifest is generated from its exports).

`<name>.options.ts` — copy `button/button.options.ts` exactly:
```ts
export interface MatExpressive<Name>Options { /* JSDoc every field, note defaults */ }
export const MAT_EXPRESSIVE_<NAME>_DEFAULT_OPTIONS: MatExpressive<Name>Options = { … };
const _options = matExpressiveCreateOptions(MAT_EXPRESSIVE_<NAME>_DEFAULT_OPTIONS);
export const MAT_EXPRESSIVE_<NAME>_OPTIONS = _options.token;
export const provideMatExpressive<Name>Options = _options.provide;
export const injectMatExpressive<Name>Options = _options.inject;
```

`<name>.ts` — rules (all enforced by ESLint or convention, see CONVENTIONS.md):
- Directive selector `[matExpressive<Name>]` (camelCase); component selector
  `mat-expressive-<name>` (kebab).
- `host` object stamps `class` (a readonly `matExpressive<Name>Class = 'mat-expressive-<name>'`
  field tagged `@internal`) and one `[attr.data-<attr>]` binding per attribute.
- State via `input()` / `model()` initialized from `this._options.<x>` (use `model()` when a
  container may write it — group broadcast writes size/shape/appearance).
- `inject(MatX)` for the Material host; `inject(Y, { optional: true })` for contextual parents
  (see `button.ts:59-65`).
- Add `exportAs: 'matExpressive<Name>'` (button has it; split-button/fab-menu forgot — don't
  repeat that).
- `ChangeDetectionStrategy.OnPush` on every `@Component`.
- Anything not for consumers: `_` prefix + `@internal` JSDoc (this removes it from docs/playground).
- SSR: no `window`/`document`/measurement outside `afterRenderEffect`/`afterNextRender` or an
  `isPlatformBrowser` guard (pattern: `loading-indicator.ts:129-153`).
- Animations (if any): GSAP only, motion tokens as TS constants in a `<name>.animation.ts`
  (pattern: `loading-indicator.animation.ts`); register plugins/eases via `registerOnce`
  functions; honor `prefers-reduced-motion` on every timeline AND every enter/leave.

## 3. SCSS (family path only) — `lib/styles/components/all-buttons/<name>/`

Copy the `button/` directory shape:
```
<name>/
├── _index.scss     # mat-expressive-<name>-styles($options) mixin — copy button/_index.scss,
│                   # swap class name, config var, and mat.<x>-overrides() call
├── _config.scss    # joins configs/* lists into $<name>-config
├── configs/_default.scss, _xs.scss … _xl.scss   # combination entries
└── tokens/_common.scss, _xs.scss … _xl.scss     # M3 Expressive spec values
```
1. Transcribe spec values into `tokens/*.scss` using Angular Material token names accepted by
   the relevant `mat.<component>-overrides()` mixin (grep
   `node_modules/@angular/material/core/tokens/` or the Material docs "Styling" tab for valid
   names). Use `functions.rem()` for px, `var(--mat-sys-*)` for system tokens. Raw CSS that
   tokens can't express goes into `properties:` maps keyed by child selector — reuse
   `_common-selectors.scss` lists.
2. Register the mixin: `@forward` in `lib/styles/components/all-buttons/_index.scss` and add an
   `@include` to `mat-expressive-all-buttons-styles()`; `lib/styles/_index.scss` forwards the
   directory.
3. VERIFY: `npm run build:lib` (validate-config @errors on any typo'd key/value) and the docs
   app renders it (`npm start` after build:lib).

## 4. Unit tests (required — do not skip because neighbors did)

Minimum spec (see QUALITY-BAR.md §3): defaults render; each input maps to its `data-*`
attribute; options provider overrides defaults; container broadcast (if family);
reduced-motion + SSR construction (if animated). Pattern references:
`button-group.spec.ts` (TestBed + host template), `button-group-child.spec.ts` (plain class).
Run: `npx ng test --project @ngm-dev/mat-expressive --watch=false`.

## 5. Docs page (`public/docs/components/<group>/<name>/`)

Three markdown files — copy frontmatter shape from `button/`:
- `index.md` — title/order/description frontmatter; Pre-requisites (which mixin);
  both usage styles (CSS class + data attributes, and the directive); variations list.
  **Compile every code snippet in a scratch app before committing** — a broken first snippet is
  the most expensive bug this product has had (ISSUES-TRIAGED.md #3).
- `api.md` — data attributes with defaults/possible values; directive/component inputs;
  link to `/docs/api/mat-expressive/...` detail pages (scope-first URL scheme).
- `styling.md` — the mixin name, `$options` table, `skip-html-element-styles` effects.
If the group is new, add `<group>/index.md` with `title` + `order`.
`scripts/build-docs.ts` auto-discovers the folder (Component Page = index.md + api.md/styling.md);
no route registration needed. Frontmatter keys are validated — only `title, order, description,
isHidden` are legal.

## 6. Playground (docs app)

1. Preview wrapper: `src/app/shared/components/playground/previews/<name>-preview.component.*`
   — inputs mirroring the library component's public inputs (the schema generator reads THIS
   file's `input()`s; `@internal` ones are omitted).
2. Register in `PLAYGROUND_REGISTRY` (`playground-registry.ts`) under the library **class name**.
3. Page wrapper: `src/app/docs/components/<group>/<name>/playground/<name>-playground.component.*`
   and register its **URL** in `PLAYGROUND_PAGE_REGISTRY` (`src/app/docs/playground-page-registry.ts`).
4. VERIFY: `npm run build:docs` regenerates `public/playground-schemas.json` containing the
   component, and the Playground tab renders controls.

## 7. E2E + a11y

Add the component's page paths to whatever `e2e/component-page-tabs.spec.ts` and
`e2e/playground-component.spec.ts` iterate over (they read the nav manifest — usually
automatic; verify by running `npx playwright test component-page-tabs`).
A11y gate: AXE pass on the playground tab; keyboard interaction (focus visible, Enter/Space
activate, menus trap correctly); `aria-*` host attributes for stateful components
(`loading-indicator.ts:64-70` is the reference).

## 8. Release checklist (per component)

- [ ] `npm run build:lib` clean; `npm test` (both projects) green; `ng lint` green.
- [ ] **Package smoke test** (non-negotiable — ISSUES-TRIAGED.md #1): `npm pack` the dist,
      install in a fresh app, compile the docs' own snippets against it.
- [ ] Playground visual check at every size/appearance; compare against the M3 spec page for
      the component (m3.material.io → component → specs).
- [ ] Reduced-motion check (`prefers-reduced-motion: reduce` in devtools) if animated.
- [ ] Conventional commit `feat(<name>): …` — semantic-release turns it into the release notes;
      docs-only changes must stay out of `feat`/`fix` types or they trigger releases.
- [ ] Close the tracking issue; docs deploy verifies on the live GitHub Pages deployment (Vercel previews no longer exist).

## 9. Automation proposals (build these, they pay for themselves after ~2 components)

1. **`npm run new:component` generator** (tsx script or Angular schematic in `scripts/`):
   prompts for name/group/path (family vs standalone), then emits: options file from template,
   directive/component skeleton with host bindings for chosen attributes, index barrels, SCSS
   directory copied from a `__template__` with class names substituted, 3 markdown skeletons
   with valid frontmatter, preview + playground wrappers, and both registry insertions (simple
   AST-less string insertion at a `// <generator:insert>` marker comment you add to the two
   registry files). Everything above is deterministic text substitution — ideal generator
   material. Sketch: a single `scripts/new-component.ts` using the same `tsx` toolchain as
   `build-docs.ts`; templates in `scripts/templates/<family|standalone>/…` with `__NAME__`,
   `__KEBAB__`, `__GROUP__` placeholders.
2. **Docs-snippet compiler**: extract fenced `angular-ts` blocks from `public/docs/**/*.md`
   into a throwaway Vitest+TestBed compile (or a `tsc --noEmit` harness with the library path
   mapped) — fails CI when an example doesn't type-check. This single check would have caught
   ISSUES-TRIAGED.md #3.
3. **Package smoke test CI job**: script the §8 pack test (`scripts/pack-smoke-test.sh`:
   `ng new` into a temp dir is slow; faster: keep a minimal fixture app under `e2e-fixtures/`
   with the tarball installed via `file:` and just `ng build` it). Would have caught #1.
4. **Token-file linter**: assert every `tokens/_<size>.scss` defines the same key set per
   appearance prefix (catches missed transcription rows).
