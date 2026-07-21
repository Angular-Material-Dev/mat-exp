---
title: Split Button
order: 4
description: Material Expressive Split Button combining a primary action button with a secondary chevron that reveals additional menu options.
primarySymbol: MatExpSplitButton
---

## Overview

`MatExpSplitButton` is a component that combines a primary action button with a secondary chevron button to reveal additional menu options in [Material 3 Design System Expressive styles](https://m3.material.io/components/split-button/overview).

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-split-button-styles` in your global SCSS styles.

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
  @include mat-exp.mat-exp-split-button-styles();
}
```

## Usage

```angular-ts name="app.ts"
import {
  MatExpSplitButton,
} from '@ngm-dev/mat-exp';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
@Component({
  selector: 'app-root',
  imports: [MatExpSplitButton, MatButton, MatIcon, MatMenu, MatMenuItem],
  template: `
    <mat-exp-split-button [matMenuTriggerFor]="menu">
      <button matButton matExpButton>Primary Action</button>
    </mat-exp-split-button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Option 1</button>
      <button mat-menu-item>Option 2</button>
    </mat-menu>
  `,
})
export class App {}
```

## Supported Variations

Mat Expressive Split Button supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Appearance: `text`, `outlined`, `filled`, `tonal`

## Accessibility

`MatExpSplitButton` doesn't declare any transitions of its own — its projected `matExpButton`/`matExpIconButton` children do, and those already stop their shape-morph transition under `prefers-reduced-motion: reduce`. See [Reduced Motion](/docs/getting-started/reduced-motion) for how this works across the library.

## Playground

<playground-preview preview="split-button"></playground-preview>

## API

### `MatExpSplitButton`

Standalone component, **`OnPush`**, selector **`mat-exp-split-button`**.

You can view the generated API for `MatExpSplitButton` [here](/docs/api/mat-exp/components/MatExpSplitButton).

#### Host

| Attribute / binding | Value |
| --- | --- |
| `data-size` | From **`size()`** input |
| `data-appearance` | From **`appearance()`** input |
| `class` | `mat-exp-split-button` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| **`size`** | `MatExpButtonSize` | `'s'` | Size broadcast to the projected primary button and the chevron button. |
| **`appearance`** | `MatExpSplitButtonAppearance` | `'tonal'` | Appearance broadcast to the projected primary button and the chevron button. |

Both are declared with `model()`, so they're two-way bindable (e.g. `[(size)]="mySize"`).

Types:

- **`MatExpButtonSize`** – `'xs' | 's' | 'm' | 'l' | 'xl'`
- **`MatExpSplitButtonAppearance`** – `'filled' | 'elevated' | 'outlined' | 'tonal'`

---

### Options and provider

#### `MatExpSplitButtonOptions`

```ts
interface MatExpSplitButtonOptions {
  readonly size?: MatExpButtonSize;
  readonly appearance?: MatExpSplitButtonAppearance;
}
```

#### `MAT_EXP_SPLIT_BUTTON_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `size: 's'`
- `appearance: 'tonal'`

#### `MAT_EXP_SPLIT_BUTTON_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the component.

#### `provideMatExpSplitButtonOptions`

```angular-ts
import { provideMatExpSplitButtonOptions } from '@ngm-dev/mat-exp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpSplitButtonOptions({
      size: 'm',
      appearance: 'filled',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpSplitButtonOptions>`.

## Styling

This document outlines the API for the `mat-exp-split-button-styles` mixin.

### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-split-button-styles($options);
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. |
| `sizes` | list of `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `null` (all sizes emitted) | Restricts the emitted CSS to only the given sizes, including the per-size connected-variant inner-corner overrides. See [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload). |

#### `skip-html-element-styles`

Setting this to `true` means the following styles won't be applied:

- Split button container layout (`display: inline-flex`, `flex-direction`, `white-space`, `column-gap`)
- Size-based container height
- Chevron button fixed width, padding, and text alignment
- Icon size inside the chevron button
- Connected inner-corner shape morphing for each size

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-split-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### `sizes`

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-split-button-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```
