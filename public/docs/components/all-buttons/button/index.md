---
title: Button
order: 1
description: Material Expressive Button with size, shape, and toggle variations. Supports both the .mat-exp-button CSS class approach and the matExpButton directive.
primarySymbol: MatExpButton
---

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-button-styles` in your global SCSS styles.

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
  @include mat-exp.mat-exp-button-styles();
}
```

## Usages

The styles for Material Expressive Button can be applied in two ways:

1. Using the `.mat-exp-button` class with the `data-*` attributes
2. Using the `matExpButton` directive

### Using the .mat-exp-button class with the data-\* attributes

```angular-ts name="app.ts"
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-root',
  imports: [MatButton],
  template: `
    <button matButton="elevated" class="mat-exp-button" data-size="xs" data-shape="square">
      Elevated
    </button>
    <button matButton="tonal" class="mat-exp-button" data-size="s">Tonal</button>
  `,
})
export class App {}
```

### Using the matExpButton directive

If you do not want to use `data-*` attributes and the `.mat-exp-button` class and want full type safety, you can use `matExpButton` directive.

```angular-ts name="app.ts"
import { MatExpButton } from '@ngm-dev/mat-exp';
@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpButton],
  template: `
    <button matButton="elevated" size="xs" shape="square" matExpButton>Elevated</button>
    <button matButton="tonal" size="s" matExpButton>Tonal</button>
  `,
})
export class App {}
```

## Supported Variations

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
