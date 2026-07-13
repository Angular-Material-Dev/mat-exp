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
