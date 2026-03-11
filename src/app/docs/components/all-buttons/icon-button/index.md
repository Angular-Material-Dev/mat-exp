---
title: Overview
keyword: ButtonOverviewPage
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

> **Note**
> You can change the class by overriding options in [SCSS](/components/all-buttons/icon-button/styling#mat-expressive-icon-button-class) & [provider](/api/functions/mat-expressive/provideMatExpressiveIconButtonOptions).

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

## Suported Variations

Mat Expressive Button supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Toggle: `selected`, `unselected`
- State: `pressed` (`:active` pseudo-selector)
- Appearance: `text`, `outlined`, `filled`, `elevated`, `tonal`
- Width: `default`, `narrow`, `wide`

<!-- ## Shape Morph

Mat Expressive Button supports this shape morphing by default.

### Pressed State

[According to Material 3 Design System Expressive guidelines](https://m3.material.io/components/buttons/specs#cb36ae03-5539-497d-9777-06547a7d3f17), when pressed, buttons can morph to become more square. Both round and square buttons should have the same pressed shape.

### When selected

In addition to changing shape when pressed, toggle buttons also change the resting shape from round (unselected) to square (selected).

If the resting unselected shape is square, the selected shape should be round. -->
