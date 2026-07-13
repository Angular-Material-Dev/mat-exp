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

## Usages

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
