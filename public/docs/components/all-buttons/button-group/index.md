---
title: Button Group
order: 3
description: Material Expressive Button Group for grouping buttons with single/multi-select behavior, compatible with Angular reactive and template-driven forms.
primarySymbol: MatExpButtonGroup
---

## Overview

`MatExpButtonGroup` is a component that groups buttons and provides single/multi-select behavior compatible with Angular reactive and template-driven forms in [Material 3 Design System Expressive styles](https://m3.material.io/components/button-groups/overview).

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-button-group-styles` in your global SCSS styles.

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
  @include mat-exp.mat-exp-button-group-styles();
}
```

## Usage

```angular-ts name="app.ts"
import {
  MatExpButtonGroup,
  MatExpIconButton,
  MatExpButton,
} from '@ngm-dev/mat-exp';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [
    MatExpButtonGroup,
    MatExpIconButton,
    MatExpButton,
    MatIconButton,
    MatButton,
    MatIcon,
  ],
  template: `
    <mat-exp-button-group>
      <button matIconButton matExpIconButton>
        <mat-icon>delete</mat-icon>
      </button>
      <button matButton matExpButton>Label</button>
      <button matButton matExpButton>
        <mat-icon>edit</mat-icon>
        Label
      </button>
      <button matIconButton matExpIconButton>
        <mat-icon>favorite</mat-icon>
      </button>
    </mat-exp-button-group>
  `,
})
export class App {}
```

## Supported Variations

Mat Expressive Button Group supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Selection: `single-select`, `multi-select`
- Appearance: `text`, `outlined`, `filled`, `tonal`
- Variant: `standard`, `connected`

## Use with @angular/forms

`<mat-exp-button-group>` is compatible with `@angular/forms` and supports both `FormsModule` and `ReactiveFormsModule`.
