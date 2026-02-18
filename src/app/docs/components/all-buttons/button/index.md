---
title: Overview
keyword: ButtonOverviewPage
---

## Pre-requisites

Make sure either you have included `mat-expressive-all-styles`, `mat-expressive-all-buttons-styles` or `mat-expressive-button-styles` in your global SCSS styles.

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
  @include mat-expressive.mat-expressive-button-styles();
}
```

## Usages

The styles for Material Expressive Button can be applied in two ways:

1. Using the `.mat-expressive-button` class with the `data-*` attributes
2. Using the `matExpressiveButton` directive

### Using the .mat-expressive-button class with the data-\* attributes

```angular-ts name="app.ts"
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-root',
  imports: [MatButton],
  template: `
    <button matButton="elevated" class="mat-expressive-button" data-size="xs" data-shape="square">
      Elevated
    </button>
    <button matButton="tonal" class="mat-expressive-button" data-size="sm">Tonal</button>
  `,
})
export class App {}
```

> **Note**
> You can change the class by overriding options in [SCSS](/components/all-buttons/button/styling#mat-expressive-button-class) & [provider](/api/functions/mat-expressive/provideMatExpressiveButtonOptions).

### Using the matExpressiveButton directive

If you do not want to use `data-*` attributes and the `.mat-expressive-button` class and want full type safety, you can use `matExpressiveButton` directive.

```angular-ts name="app.ts"
import { MatExpressiveButton } from '@ngm-dev/mat-expressive';
@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpressiveButton],
  template: `
    <button matButton="elevated" size="xs" shape="square" matExpressiveButton>Elevated</button>
    <button matButton="tonal" size="sm" matExpressiveButton>Tonal</button>
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

## Shape Morph

Mat Expressive Button supports this shape morphing by default.

### Pressed State

[According to Material 3 Design System Expressive guidelines](https://m3.material.io/components/buttons/specs#cb36ae03-5539-497d-9777-06547a7d3f17), when pressed, buttons can morph to become more square. Both round and square buttons should have the same pressed shape.

### When selected

In addition to changing shape when pressed, toggle buttons also change the resting shape from round (unselected) to square (selected).

If the resting unselected shape is square, the selected shape should be round.
