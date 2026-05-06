---
title: Overview
keyword: SplitButtonOverviewPage
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
  MatExpressiveButtonGroup,
  MatExpressiveIconButton,
  MatExpressiveButton,
} from '@ngm-dev/mat-expressive';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [
    MatExpressiveButtonGroup,
    MatExpressiveIconButton,
    MatExpressiveButton,
    MatIconButton,
    MatButton,
    MatIcon,
  ],
  template: `
    <mat-expressive-button-group>
      <button matIconButton matExpressiveIconButton>
        <mat-icon>delete</mat-icon>
      </button>
      <button matButton matExpressiveButton>Label</button>
      <button matButton matExpressiveButton>
        <mat-icon>edit</mat-icon>
        Label
      </button>
      <button matIconButton matExpressiveIconButton>
        <mat-icon>favorite</mat-icon>
      </button>
    </mat-expressive-button-group>
  `,
})
export class App {}
```

## Suported Variations

Mat Expressive Button Group supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Selection: `single-select`, `multi-select`
- Appearance: `text`, `outlined`, `filled`, `tonal`
- Variant: `standard`, `connected`

## Use with @angular/forms

`<mat-expressive-button-group>` is compatible with `@angular/forms` and supports both `FormsModule` and `ReactiveFormsModule`.
