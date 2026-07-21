---
title: Icon Button
order: 2
description: Material Expressive Icon Button with size, shape, toggle, appearance, and width variations. Supports both the CSS class approach and the matExpIconButton directive.
primarySymbol: MatExpIconButton
---

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-icon-button-styles` in your global SCSS styles.

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
  @include mat-exp.mat-exp-icon-button-styles();
}
```

## Usage

The styles for Material Expressive Button can be applied in two ways:

1. Using the `.mat-exp-icon-button` class with the `data-*` attributes
2. Using the `matExpIconButton` directive

### Using the .mat-exp-icon-button class with the data-\* attributes

```angular-ts name="app.ts"
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [MatIconButton, MatIcon],
  template: `
    <button mat-icon-button class="mat-exp-icon-button" data-size="xs" data-shape="square">
      <mat-icon>home</mat-icon>
    </button>
    <button mat-icon-button class="mat-exp-icon-button" data-size="sm">
      <mat-icon>home</mat-icon>
    </button>
  `,
})
export class App {}
```

### Using the matExpIconButton directive

If you do not want to use `data-*` attributes and the `.mat-exp-icon-button` class and want full type safety, you can use `matExpIconButton` directive.

```angular-ts name="app.ts"
import { MatExpIconButton } from '@ngm-dev/mat-exp';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [MatIconButton, MatExpIconButton, MatIcon],
  template: `
    <button mat-icon-button size="xs" shape="square" matExpIconButton>
      <mat-icon>home</mat-icon>
    </button>
    <button mat-icon-button size="sm" matExpIconButton>
      <mat-icon>home</mat-icon>
    </button>
  `,
})
export class App {}
```

## Supported Variations

Mat Expressive Icon Button supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Toggle: `selected`, `unselected`
- State: `pressed` (`:active` pseudo-selector)
- Appearance: `text`, `outlined`, `filled`, `tonal`
- Width: `default`, `narrow`, `wide`

## Toggle Behavior

Mat Expressive Icon Button supports a `toggle` state (`selected` / `unselected`), but toggling on
click is only automatic **inside a `MatExpButtonGroup`** — the group owns selection state for
every button it manages.

**Standalone toggle buttons (outside a `MatExpButtonGroup`) do not flip `toggle` on click.** This
is intentional: a lone button's click handler only has one consumer to satisfy, so the library leaves the state
transition up to you rather than guessing what a click should mean. Two-way bind `toggle` and
flip it yourself in your own `(click)` handler:

```angular-ts name="app.ts"
import { signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatExpIconButton } from '@ngm-dev/mat-exp';

@Component({
  selector: 'app-root',
  imports: [MatIconButton, MatExpIconButton, MatIcon],
  template: `
    <button
      mat-icon-button
      matExpIconButton
      [(toggle)]="favorited"
      (click)="favorited.set(favorited() === 'selected' ? 'unselected' : 'selected')"
    >
      <mat-icon>favorite</mat-icon>
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

## Accessibility

The shape-morph transition (`border-radius`, `padding-left`/`padding-right`, `box-shadow`) automatically stops under `prefers-reduced-motion: reduce` — Angular Material's own `matIconButton` host, which `matExpIconButton` is always applied alongside, detects the setting and neutralizes the transition. See [Reduced Motion](/docs/getting-started/reduced-motion) for how this works across the library.

## Playground

<playground-preview preview="icon-button"></playground-preview>

## API

### Data Attributes with .mat-exp-icon-button class

Use these `data-*` attributes with the `.mat-exp-icon-button` class to style the Angular Material Icon Button component:

| Attribute | Default | Possible values |
| --- | --- | --- |
| `data-size` | `s` | `xs`, `s`, `m`, `l`, `xl` |
| `data-shape` | `round` | `round`, `square` |
| `data-toggle` | `unselected` | `selected`, `unselected` |
| `data-appearance` | `text` | `text`, `outlined`, `filled`, `tonal` |
| `data-width` | `default` | `default`, `narrow`, `wide` |

### `MatExpIconButton`

Standalone directive, selector **`[matExpIconButton]`**, exported as **`matExpIconButton`**.

You can view the generated API for `MatExpIconButton` [here](/docs/api/mat-exp/directives/MatExpIconButton).

#### Host

| Attribute / binding | Value |
| --- | --- |
| `data-size` | From **`size()`** input |
| `data-shape` | From **`shape()`** input |
| `data-appearance` | From **`appearance`** input |
| `data-toggle` | From **`toggle()`** input |
| `data-width` | From **`width()`** input |
| `data-menu-open` | `true` when a `[matMenuTriggerFor]` on the same host has its menu open |
| `aria-pressed` | `'true'` / `'false'` derived from `toggle()`; omitted entirely when `toggle()` is `undefined` |
| `class` | `mat-exp-icon-button` |
| `(click)` | Delegates the click to the parent `MatExpButtonGroup`, if any |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| **`size`** | `MatExpButtonSize` | `'s'` | Size of the icon button. |
| **`shape`** | `MatExpButtonShape` | `'round'` | Shape of the icon button. |
| **`width`** | `MatExpIconButtonWidth` | `'default'` | Width of the icon button. |
| **`toggle`** | `MatExpButtonToggle \| undefined` | `undefined` | Toggle state. Only auto-managed inside a `MatExpButtonGroup` — see [Toggle Behavior](#toggle-behavior) above. |
| **`value`** | `unknown` | `undefined` | Value read by a parent `MatExpButtonGroup` when computing its own form value. |
| **`appearance`** | `MatExpIconButtonAppearance \| undefined` | `'text'` | Appearance of the icon button. |

`size`, `shape`, `toggle`, and `value` are declared with `model()` (two-way bindable, e.g. `[(size)]="mySize"`); `width` uses `input()`; `appearance` is a classic `@Input()` accessor.

Types:

- **`MatExpButtonSize`** – `'xs' | 's' | 'm' | 'l' | 'xl'`
- **`MatExpButtonShape`** – `'round' | 'square'`
- **`MatExpButtonToggle`** – `'selected' | 'unselected'`
- **`MatExpIconButtonWidth`** – `'default' | 'narrow' | 'wide'`
- **`MatExpIconButtonAppearance`** – `'text' | 'filled' | 'outlined' | 'tonal'`

> [!NOTE]
> `MatExpIconButton` also exposes a plain `disabled` accessor that reads and writes the underlying Angular Material `matIconButton` directive's own `disabled` input directly — bind it through `matIconButton` as usual (e.g. `[disabled]`).

---

### Options and provider

#### `MatExpIconButtonOptions`

```ts
interface MatExpIconButtonOptions {
  readonly appearance?: MatExpIconButtonAppearance;
  readonly size?: MatExpButtonSize;
  readonly shape?: MatExpButtonShape;
  readonly toggle?: MatExpButtonToggle;
  readonly width?: MatExpIconButtonWidth;
}
```

#### `MAT_EXP_ICON_BUTTON_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `size: 's'`
- `shape: 'round'`
- `width: 'default'`
- `appearance: 'text'`

#### `MAT_EXP_ICON_BUTTON_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the directive.

#### `provideMatExpIconButtonOptions`

```angular-ts
import { provideMatExpIconButtonOptions } from '@ngm-dev/mat-exp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpIconButtonOptions({
      size: 'm',
      appearance: 'filled',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpIconButtonOptions>`.

## Styling

This document outlines API for `mat-exp-icon-button-styles` mixin.

### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles($options);
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. |
| `sizes` | list of `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `null` (all sizes emitted) | Restricts the emitted CSS to only the given sizes. See [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload). |
| `appearances` | list of `'text' \| 'filled' \| 'outlined' \| 'tonal'` | `null` (all appearances emitted) | Restricts the emitted CSS to only the given appearances. |

#### `skip-html-element-styles`

Setting this to `true` means the following won't work as expected:

- Icon sizes
- Shape morphing
- Appearance and width variations

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### `sizes`

Drops the rest of the size combination matrix at compile time.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```

#### `appearances`

Drops the rest of the appearance combination matrix at compile time.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles(
    (
      appearances: ('filled'),
    )
  );
}
```
