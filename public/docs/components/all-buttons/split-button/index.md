---
title: Split Button
order: 4
description: Material Expressive Split Button combining a primary action button with a secondary chevron that reveals additional menu options.
---

## Overview

`MatExpressiveSplitButton` is a component that combines a primary action button with a secondary chevron button to reveal additional menu options in [Material 3 Design System Expressive styles](https://m3.material.io/components/split-button/overview).

## Pre-requisites

Make sure either you have included `mat-expressive-all-styles`, `mat-expressive-all-buttons-styles` or `mat-expressive-split-button-styles` in your global SCSS styles.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles();
}
```

or

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-buttons-styles();
}
```

or

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-split-button-styles();
}
```

## Usage

```angular-ts name="app.ts"
import {
  MatExpressiveSplitButton,
} from '@ngm-dev/mat-expressive';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
@Component({
  selector: 'app-root',
  imports: [MatExpressiveSplitButton, MatButton, MatIcon, MatMenu, MatMenuItem],
  template: `
    <mat-expressive-split-button [matMenuTriggerFor]="menu">
      <button matButton matExpressiveButton>Primary Action</button>
    </mat-expressive-split-button>
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
