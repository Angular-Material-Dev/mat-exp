---
title: Icon Button
order: 2
description: Material Expressive Icon Button with size, shape, toggle, appearance, and width variations. Supports both the CSS class approach and the matExpressiveIconButton directive.
---

## Pre-requisites

Make sure either you have included `mat-expressive-all-styles`, `mat-expressive-all-buttons-styles` or `mat-expressive-icon-button-styles` in your global SCSS styles.

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
  @include mat-expressive.mat-expressive-icon-button-styles();
}
```

## Usages

The styles for Material Expressive Button can be applied in two ways:

1. Using the `.mat-expressive-icon-button` class with the `data-*` attributes
2. Using the `matExpressiveIconButton` directive

### Using the .mat-expressive-icon-button class with the data-\* attributes

```angular-ts name="app.ts"
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [MatIconButton, MatIcon],
  template: `
    <button mat-icon-button class="mat-expressive-icon-button" data-size="xs" data-shape="square">
      <mat-icon>home</mat-icon>
    </button>
    <button mat-icon-button class="mat-expressive-icon-button" data-size="sm">
      <mat-icon>home</mat-icon>
    </button>
  `,
})
export class App {}
```

### Using the matExpressiveIconButton directive

If you do not want to use `data-*` attributes and the `.mat-expressive-icon-button` class and want full type safety, you can use `matExpressiveIconButton` directive.

```angular-ts name="app.ts"
import { MatExpressiveIconButton } from '@ngm-dev/mat-expressive';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [MatIconButton, MatExpressiveIconButton, MatIcon],
  template: `
    <button mat-icon-button size="xs" shape="square" matExpressiveIconButton>
      <mat-icon>home</mat-icon>
    </button>
    <button mat-icon-button size="sm" matExpressiveIconButton>
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
