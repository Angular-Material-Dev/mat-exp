---
title: Loading Indicator
order: 1
description: Material Expressive Loading Indicator — a GSAP-animated SVG that morphs through seven M3 canonical shapes with spring-bounce rotation, fully accessible as a progressbar role.
primarySymbol: MatExpLoadingIndicator
---

## What it is

`MatExpLoadingIndicator` is a [Material 3 Expressive](https://m3.material.io/) loading indicator: a single SVG path that morphs through seven canonical shapes while a slow background rotation and per-step spring rotation run on nested `<g>` elements. Motion is implemented with **GSAP** (including `MorphSVGPlugin` and `CustomEase`); there are no CSS keyframes for the loop.

The host is exposed as a **`progressbar`** with `aria-busy="true"`, `aria-valuemin` / `aria-valuemax` (static 0–100 for role compatibility), and an **`aria-label`** you should set for context (defaults to `"Loading"` from options).

## Import

```angular-ts name="app.ts"
import { MatExpLoadingIndicator } from '@ngm-dev/mat-exp';

@Component({
  selector: 'app-root',
  imports: [MatExpLoadingIndicator],
  template: `
    <mat-exp-loading-indicator
      [ariaLabel]="'Saving your changes'"
      [config]="'contained'"
      [speed]="'default'"
    />
  `,
})
export class App {}
```

Styles ship with the component (`styleUrls`); you do not need a separate global SCSS mixin for the indicator. Use **Material theme CSS variables** (for example `--mat-sys-on-primary-container`) so color tokens resolve, or override the public CSS variables described on the [Styling](#styling) section.

## Entry and exit animation

When the host is **inserted** or **removed** from the DOM, Angular's **`(animate.enter)`** and **`(animate.leave)`** bindings run GSAP on the inner container: fade and scale in (~200 ms, `power2.out`) and out (~150 ms, `power2.in`). A common pattern is toggling the indicator with `@if`:

```angular-html
@if (loading()) {
  <mat-exp-loading-indicator [ariaLabel]="'Loading data'" />
}
```

If the enter/leave hooks never run (the host is always present), you only see the continuous morph/rotation loop.

## Behavior summary

- **Shape loop** – The path cycles through the same seven shapes and order as the M3 reference, morphed with `MorphSVGPlugin`.
- **Rotation** – A linear infinite rotation on an outer `<g>` is combined with a **90° spring kick** on an inner `<g>` each step, using M3 Expressive spatial spring eases. Speed presets (`fast`, `default`, `slow`) change spring duration and step interval; changing the `speed` input tears down and rebuilds the GSAP `matchMedia` context so motion stays consistent.
- **`prefers-reduced-motion: reduce`** – Entry/exit tweens complete immediately; the rotation/morph timelines are not started. This is handled in the animation module with `gsap.matchMedia()`.
- **SSR** – On the server (`PLATFORM_ID` not browser), animation setup is skipped; `onEnter` / `onLeave` still call `animationComplete()` so Angular is not blocked.

## Configuration variants

- **`config="default"`** – Morphing shape only.
- **`config="contained"`** – Same shape on a circular **tonal** background (`primary-container` by default).

Global defaults (including `ariaLabel`, `config`, and `speed`) can be set with **`provideMatExpLoadingIndicatorOptions`**; see the [API](#api) section.

## Playground

<playground-preview preview="loading-indicator"></playground-preview>

## API

### `MatExpLoadingIndicator`

Standalone component, **`OnPush`**, selector **`mat-exp-loading-indicator`**.

You can view the generated API for `MatExpLoadingIndicator` [here](/docs/api/mat-exp/components/MatExpLoadingIndicator).

#### Host

| Attribute / binding | Value |
| --- | --- |
| `role` | `progressbar` |
| `aria-busy` | `true` |
| `aria-valuemin` / `aria-valuemax` | `0` / `100` |
| `aria-label` | From **`ariaLabel()`** input |
| `class` | `mat-exp-loading-indicator` |
| `data-speed` | Current **`speed`** preset |

#### Inputs

| Input | Type | Default (from options) | Description |
| --- | --- | --- | --- |
| **`config`** | `MatExpLoadingIndicatorConfig` | `'default'` | `'default'` – shape only. `'contained'` – shape on tonal circular background. |
| **`ariaLabel`** | `string` | `'Loading'` | Accessible name while the indicator is shown. Override per instance for context (e.g. "Uploading file"). |
| **`speed`** | `MatExpLoadingIndicatorSpeed` | `'default'` | `'fast'` \| `'default'` \| `'slow'` – maps to M3 Expressive spatial spring presets and step timing. Updates at runtime rebuild GSAP timelines. |

Types:

- **`MatExpLoadingIndicatorConfig`** – `'default' | 'contained'`
- **`MatExpLoadingIndicatorSpeed`** – `'fast' | 'default' | 'slow'`

#### Animation callbacks

The component listens to **`(animate.enter)`** and **`(animate.leave)`** on the host and drives GSAP on the inner container, then calls **`event.animationComplete()`** when each tween finishes (or immediately when not in the browser or when reduced motion applies).

---

### Options and provider

#### `MatExpLoadingIndicatorOptions`

```ts
interface MatExpLoadingIndicatorOptions {
  readonly config?: MatExpLoadingIndicatorConfig;
  readonly ariaLabel?: string;
  readonly speed?: MatExpLoadingIndicatorSpeed;
}
```

#### `MAT_EXP_LOADING_INDICATOR_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `config: 'default'`
- `ariaLabel: 'Loading'`
- `speed: 'default'`

#### `MAT_EXP_LOADING_INDICATOR_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the component.

#### `provideMatExpLoadingIndicatorOptions`

```angular-ts
import { provideMatExpLoadingIndicatorOptions } from '@ngm-dev/mat-exp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpLoadingIndicatorOptions({
      speed: 'slow',
      ariaLabel: 'Please wait',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpLoadingIndicatorOptions>` (see `matExpCreateOptions` in the library).

---

### Advanced exports

The package also exports **`MAT_EXP_LOADING_INDICATOR_SHAPES`** (readonly path `d` strings) and **`MAT_EXP_LOADING_INDICATOR_VIEW_BOX`** for tooling or documentation; the component already uses these for the morph loop.

## Styling

The component uses **`ViewEncapsulation.None`**. The host element carries the class **`mat-exp-loading-indicator`** and reflects the current speed preset on **`data-speed`** (`fast`, `default`, or `slow`) for styling or tests.

### Public CSS variables

These variables are defined on **`.mat-exp-loading-indicator`**. Override them in your app (or on an ancestor) to resize or retheme the indicator without forking component SCSS.

| Variable | Default | Role |
| --- | --- | --- |
| `--mat-exp-loading-indicator-size` | `48px` | Width and height of the host. |
| `--mat-exp-loading-indicator-min-size` | `24px` | Minimum width/height. |
| `--mat-exp-loading-indicator-max-size` | `240px` | Maximum width/height. |
| `--mat-exp-loading-indicator-active-indicator-size` | `79.16%` | Size of the SVG relative to the host; matches the M3 ratio between the active indicator and its optional container. |
| `--mat-exp-loading-indicator-color` | `var(--mat-sys-on-primary-container)` | `color` on the inner container (inherited by the SVG via `currentColor` for the path fill). |
| `--mat-exp-loading-indicator-container-color` | `var(--mat-sys-primary-container)` | Background of the circular container when **`config`** is **`contained`**. |

### Internal structure (reference)

The template wraps content in **`mat-exp-loading-indicator-container`**, which gains **`mat-exp-loading-indicator-container-contained`** when `config` is `contained`. The SVG uses **`mat-exp-loading-indicator-svg`**; nested groups use **`mat-exp-loading-indicator-rotator`** and **`mat-exp-loading-indicator-spring-rotator`**. Those group classes mainly support `transform-box: view-box` so GSAP rotation stays centered in the `0 0 380 380` viewBox as the path morphs.

### Motion tokens

Spring curves, step durations, background rotation period, and entry/exit timings are defined in **TypeScript** (`loading-indicator.animation.ts`), not in CSS variables. To change motion globally, use **`provideMatExpLoadingIndicatorOptions`** and/or the **`speed`** input (see [API](#api) section). Consumers typically should **not** try to override motion by fighting GSAP from CSS.

### Example: larger indicator on a dark surface

```scss
.my-surface .mat-exp-loading-indicator {
  --mat-exp-loading-indicator-size: 64px;
  --mat-exp-loading-indicator-color: var(--mat-sys-on-surface);
  --mat-exp-loading-indicator-container-color: var(--mat-sys-surface-container-highest);
}
```
