---
title: "Introducing Mat Expressive: Material 3 Expressive for Angular Material"
description: Mat Expressive layers Material 3 Expressive — spring motion, shape morphing, and bold sizing — on top of Angular Material, without forking or replacing it.
publishedOn: 23rd July, 2026
order: 1
author:
    name: Dharmen
    xHandle: shhdharmen
    avatar: https://avatars.githubusercontent.com/u/6831283?v=4&size=64
readTime: 5
coverImage: /mat-exp-cover.png
---

<img
  src="/mat-exp-cover.png"
  alt="Introducing Mat Expressive: Material 3 Expressive for Angular Material"
  class="w-full md:max-w-6xl! mx-auto rounded-lg" />

## What is Mat Expressive?

Mat Expressive is a library of styles, directives, and a few new components that sit **on top of** Angular Material. It's not a fork and not a replacement — you keep using `MatButton`, `MatFab`, and the rest of Angular Material as-is. Mat Expressive layers M3 Expressive behavior onto them.

Concretely, it gives you three things:

- **Styles** — SCSS mixins that restyle existing Angular Material components using Material's own [component token overrides](https://material.angular.dev/guide/theming#component-tokens) and CSS variables, so they match M3 Expressive.
- **Directives** — for the cases styling alone can't reach (things like shape morphing on press, which need actual behavior, not just CSS).
- **New components** — for patterns M3 Expressive defines that Angular Material doesn't have a component for at all (loading indicators, FAB menus, split buttons).

Under the hood, motion is powered by GSAP spring physics, every animation respects `prefers-reduced-motion`, and the library is SSR-safe.

## Installation

```bash
ng add @ngm-dev/mat-exp
```

The schematic wires up the package for you. From there, add the styles you need globally:

```scss
// styles.scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles();
}
```

## A first component: the expressive button

The clearest way to see what Mat Expressive does is the button. Angular Material already has `matButton` — Mat Expressive adds size, shape, and toggle variations on top of it, plus the shape-morph-on-press behavior from the M3 Expressive spec.

You can opt in two ways.

**Option 1 — CSS class + data attributes**, no extra imports beyond styles:

```html
<button matButton="elevated" class="mat-exp-button" data-size="xs" data-shape="square">
  Elevated
</button>
<button matButton="tonal" class="mat-exp-button" data-size="s">Tonal</button>
```

**Option 2 — the `matExpButton` directive**, if you want type safety and two-way bindable inputs:

```ts
import { MatButton } from '@angular/material/button';
import { MatExpButton } from '@ngm-dev/mat-exp';

@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpButton],
  template: `
    <button matButton="elevated" size="xs" shape="square" matExpButton>Elevated</button>
    <button matButton="tonal" size="s" matExpButton>Tonal</button>
  `,
})
export class App {}
```

Both approaches give you the same variations:

- **Size**: `xs`, `s`, `m`, `l`, `xl`
- **Shape**: `round`, `square`
- **Toggle**: `selected`, `unselected`
- **State**: `pressed` (driven by the `:active` pseudo-selector)

## Shape morphing, and why it's a directive and not just CSS

One of the defining traits of M3 Expressive buttons is that they morph shape when pressed — round buttons square off slightly, and both round and square buttons converge on the same pressed shape. Toggle buttons go further: the *resting* shape itself changes between selected and unselected states.

This is exactly the kind of thing that can't be pure CSS — it needs to read component state and react to it — which is why `matExpButton` exists as a directive rather than just a stylesheet.

Accessibility is handled automatically here too: the shape-morph transition stops entirely under `prefers-reduced-motion: reduce`, because `matExpButton` piggybacks on Angular Material's own `matButton` host, which already detects the setting.

## Toggle state: a deliberate design choice

If you've used a toggle button before, you might expect `toggle` to flip on click automatically. In Mat Expressive, it doesn't — unless the button lives inside a `<mat-exp-button-group>`.

For a standalone toggle button, the library leaves the click-to-state transition up to you:

```ts
import { signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatExpButton } from '@ngm-dev/mat-exp';

@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpButton],
  template: `
    <button
      matButton="tonal"
      matExpButton
      [(toggle)]="favorited"
      (click)="favorited.set(favorited() === 'selected' ? 'unselected' : 'selected')"
    >
      Favorite
    </button>
  `,
})
export class App {
  protected readonly favorited = model<'selected' | 'unselected'>('unselected');
}
```

This is intentional rather than an oversight: a lone button only has one consumer for its click event, so guessing what that click should mean would be presumptuous. Inside a `MatExpButtonGroup`, the group already owns selection state for its buttons — adding your own click handler there would fight it.

## Cutting the CSS payload

By default, the style mixins emit CSS for every size × shape × state × toggle combination. If your app only ever uses two or three sizes, you don't need to ship the rest:

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```

There's also a `skip-html-element-styles` option if you don't want Mat Expressive touching the underlying Angular Material DOM elements at all — useful if you're worried about coupling to Angular Material's internal classes, at the cost of losing icon-size adjustments and shape morphing.

## What's included so far

At launch, Mat Expressive covers:

- **Buttons** — [Button](docs/components/all-buttons/button), [Icon Button](docs/components/all-buttons/icon-button), [Button Group](docs/components/all-buttons/button-group), [Split Button](docs/components/all-buttons/split-button), [FAB Menu](docs/components/all-buttons/fab-menu)
- **Loading & Progress** — an M3 Expressive [loading indicator](/docs/components/loading-and-progress/loading-indicator) with GSAP spring motion

More components are planned, following the same pattern: style what Angular Material already has, build what it doesn't.

## Try it

```bash
ng add @ngm-dev/mat-exp
```

- 📖 Docs: [expressive.angular-material.dev](https://expressive.angular-material.dev/)
- 💻 GitHub: [github.com/Angular-Material-Dev/mat-exp](https://github.com/Angular-Material-Dev/mat-exp)
- 🐦 Follow along: [@ngMaterialDev](https://x.com/ngMaterialDev)

It's MIT licensed and free. If you're building on Angular Material and want the M3 Expressive look — motion, shape morphing, and all — without hand-rolling it yourself, give it a try. Issues and feature requests are welcome on GitHub.