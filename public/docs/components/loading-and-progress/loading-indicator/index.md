---
title: Loading Indicator
order: 1
description: Material Expressive Loading Indicator — a GSAP-animated SVG that morphs through seven M3 canonical shapes with spring-bounce rotation, fully accessible as a progressbar role.
---

## What it is

`MatExpressiveLoadingIndicator` is a [Material 3 Expressive](https://m3.material.io/) loading indicator: a single SVG path that morphs through seven canonical shapes while a slow background rotation and per-step spring rotation run on nested `<g>` elements. Motion is implemented with **GSAP** (including `MorphSVGPlugin` and `CustomEase`); there are no CSS keyframes for the loop.

The host is exposed as a **`progressbar`** with `aria-busy="true"`, `aria-valuemin` / `aria-valuemax` (static 0–100 for role compatibility), and an **`aria-label`** you should set for context (defaults to `"Loading"` from options).

## Import

```angular-ts name="app.ts"
import { MatExpressiveLoadingIndicator } from '@ngm-dev/mat-expressive';

@Component({
  selector: 'app-root',
  imports: [MatExpressiveLoadingIndicator],
  template: `
    <mat-expressive-loading-indicator
      [ariaLabel]="'Saving your changes'"
      [config]="'contained'"
      [speed]="'default'"
    />
  `,
})
export class App {}
```

Styles ship with the component (`styleUrls`); you do not need a separate global SCSS mixin for the indicator. Use **Material theme CSS variables** (for example `--mat-sys-on-primary-container`) so color tokens resolve, or override the public CSS variables described on the [Styling](./styling) page.

## Entry and exit animation

When the host is **inserted** or **removed** from the DOM, Angular's **`(animate.enter)`** and **`(animate.leave)`** bindings run GSAP on the inner container: fade and scale in (~200 ms, `power2.out`) and out (~150 ms, `power2.in`). A common pattern is toggling the indicator with `@if`:

```angular-html
@if (loading()) {
  <mat-expressive-loading-indicator [ariaLabel]="'Loading data'" />
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

Global defaults (including `ariaLabel`, `config`, and `speed`) can be set with **`provideMatExpressiveLoadingIndicatorOptions`**; see the [API](./api) page.
