---
title: Button
order: 1
description: Material Expressive Button with size, shape, and toggle variations. Supports both the `.mat-exp-button` CSS class approach and the `[matExpButton]` directive.
primarySymbol: MatExpButton
---

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-button-styles` in your global SCSS styles.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-styles();
}
```

or

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-buttons-styles();
}
```

or

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles();
}
```

## Usage

The styles for Material Expressive Button can be applied in two ways:

1. Using the `.mat-exp-button` class with the `data-*` attributes
2. Using the `matExpButton` directive

### Using the .mat-exp-button class with the data-\* attributes

```angular-ts name="app.ts"
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-root',
  imports: [MatButton],
  template: `
    <button matButton="elevated" class="mat-exp-button" data-size="xs" data-shape="square">
      Elevated
    </button>
    <button matButton="tonal" class="mat-exp-button" data-size="s">Tonal</button>
  `,
})
export class App {}
```

### Using the matExpButton directive

If you do not want to use `data-*` attributes and the `.mat-exp-button` class and want full type safety, you can use `matExpButton` directive.

```angular-ts name="app.ts"
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

## Supported Variations

Mat Expressive Button supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Toggle: `selected`, `unselected`
- State: `pressed` (`:active` pseudo-selector)

## Toggle Behavior

Mat Expressive Button supports a `toggle` state (`selected` / `unselected`), but toggling on click
is only automatic **inside a `MatExpButtonGroup`** — the group owns selection state for every
button it manages.

**Standalone toggle buttons (outside a `MatExpButtonGroup`) do not flip `toggle` on click.** This
is intentional: a lone button's click handler only has one consumer to satisfy, so the library leaves the state
transition up to you rather than guessing what a click should mean. Two-way bind `toggle` and
flip it yourself in your own `(click)` handler:

```angular-ts name="app.ts"
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

Inside a `MatExpButtonGroup`, don't do this — the group already manages `toggle` for its
projected buttons based on the group's single-/multi-select state, and a manual click handler
would fight the group's own state management.

## Shape Morph

Mat Expressive Button supports this shape morphing by default.

### Pressed State

[According to Material 3 Design System Expressive guidelines](https://m3.material.io/components/buttons/specs#cb36ae03-5539-497d-9777-06547a7d3f17), when pressed, buttons can morph to become more square. Both round and square buttons should have the same pressed shape.

### When selected

In addition to changing shape when pressed, toggle buttons also change the resting shape from round (unselected) to square (selected).

If the resting unselected shape is square, the selected shape should be round.

## Accessibility

The shape-morph transition (`border-radius`, `padding-left`/`padding-right`, `box-shadow`) automatically stops under `prefers-reduced-motion: reduce` — Angular Material's own `matButton` host, which `matExpButton` is always applied alongside, detects the setting and neutralizes the transition. See [Reduced Motion](/docs/getting-started/reduced-motion) for how this works across the library.

## Playground

<playground-preview preview="button"></playground-preview>

## API

### Data Attributes with .mat-exp-button class

Use these `data-*` attributes with the `.mat-exp-button` class to style the Angular Material Button component:

| Attribute | Default | Possible values |
| --- | --- | --- |
| `data-size` | `s` | `xs`, `s`, `m`, `l`, `xl` |
| `data-shape` | `round` | `round`, `square` |
| `data-toggle` | `unselected` | `selected`, `unselected` |

### `MatExpButton`

Standalone directive, selector **`[matExpButton]`**, exported as **`matExpButton`**.

You can view the generated API for `MatExpButton` [here](/docs/api/mat-exp/directives/MatExpButton).

#### Host

| Attribute / binding | Value |
| --- | --- |
| `data-size` | From **`size()`** input |
| `data-shape` | From **`shape()`** input |
| `data-toggle` | From **`toggle()`** input |
| `data-menu-open` | `true` when a `[matMenuTriggerFor]` on the same host has its menu open |
| `aria-pressed` | `'true'` / `'false'` derived from `toggle()`; omitted entirely when `toggle()` is `undefined` |
| `class` | `mat-exp-button` |
| `(click)` | Delegates the click to the parent `MatExpButtonGroup`, if any |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| **`size`** | `MatExpButtonSize` | `'s'` | Size of the button. |
| **`shape`** | `MatExpButtonShape` | `'round'` | Shape of the button. |
| **`toggle`** | `MatExpButtonToggle \| undefined` | `undefined` | Toggle state. Only auto-managed inside a `MatExpButtonGroup` — see [Toggle Behavior](#toggle-behavior) above. |
| **`value`** | `unknown` | `undefined` | Value read by a parent `MatExpButtonGroup` when computing its own form value. |

`size`, `shape`, `toggle`, and `value` are all declared with `model()`, so they're two-way bindable (e.g. `[(size)]="mySize"`).

Types:

- **`MatExpButtonSize`** – `'xs' | 's' | 'm' | 'l' | 'xl'`
- **`MatExpButtonShape`** – `'round' | 'square'`
- **`MatExpButtonToggle`** – `'selected' | 'unselected'`

> [!NOTE]
> `MatExpButton` also exposes plain `appearance` / `disabled` accessors that read and write the underlying Angular Material `matButton` directive's own `appearance` / `disabled` inputs directly — bind those through `matButton` as usual (e.g. `matButton="tonal"`, `[disabled]`).

---

### Options and provider

#### `MatExpButtonOptions`

```ts
interface MatExpButtonOptions {
  readonly size?: MatExpButtonSize;
  readonly shape?: MatExpButtonShape;
  readonly toggle?: MatExpButtonToggle;
}
```

#### `MAT_EXP_BUTTON_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `size: 's'`
- `shape: 'round'`

#### `MAT_EXP_BUTTON_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the directive.

#### `provideMatExpButtonOptions`

```angular-ts
import { provideMatExpButtonOptions } from '@ngm-dev/mat-exp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpButtonOptions({
      size: 'm',
      shape: 'square',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpButtonOptions>`.

## Styling

This document outlines API for `mat-exp-button-styles` mixin.

### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles($options);
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. |
| `sizes` | list of `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `null` (all sizes emitted) | Restricts the emitted CSS to only the given sizes. Use this to cut the CSS payload when your app only uses a subset of sizes — see [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload). |

#### `skip-html-element-styles`

Setting this to `true` means the following won't work as expected:

- Icon sizes
- Shape morphing

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### `sizes`

Drops the rest of the size × shape × state × toggle combination matrix at compile time.

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
