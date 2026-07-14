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

## Playground

<playground-preview preview="split-button"></playground-preview>

## API

### MatExpSplitButton Component

You can view the API for `MatExpSplitButton` component [here](/docs/api/mat-exp/components/MatExpSplitButton).

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

#### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

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

##### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Split button container layout (`display: inline-flex`, `flex-direction`, `white-space`, `column-gap`)
- Size-based container height
- Chevron button fixed width, padding, and text alignment
- Icon size inside the chevron button
- Connected inner-corner shape morphing for each size

#### sizes

Type: `list` of `'xs' | 's' | 'm' | 'l' | 'xl'`

Default: `null` (all sizes emitted)

Restricts the emitted CSS to only the given sizes, including the per-size connected-variant inner-corner overrides. See [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload).

**Usage example:**

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
