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

## Playground

<playground-preview preview="icon-button"></playground-preview>

## API

### Data Attributes with .mat-exp-icon-button class

You can use below `data-*` attributes with `.mat-exp-icon-button` class to style the Angular Material Icon Button component.

#### data-size

The size of the icon button.

##### Default Value

`s`

##### Possible Values

`xs`, `s`, `m`, `l`, `xl`

#### data-shape

The shape of the icon button.

##### Default Value

`round`

##### Possible Values

`round`, `square`

#### data-toggle

The toggle state of the icon button.

##### Default Value

`unselected`

##### Possible Values

`selected`, `unselected`

#### data-appearance

The appearance of the icon button.

##### Default Value

`text`

##### Possible Values

`text`, `outlined`, `filled`, `tonal`

#### data-width

The width of the icon button.

##### Default Value

`default`

##### Possible Values

`default`, `narrow`, `wide`

### matExpIconButton Directive

You can view the API for `matExpIconButton` directive [here](/docs/api/mat-exp/directives/MatExpIconButton).

## Styling

This document outlines API for `mat-exp-icon-button-styles` mixin.

### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles($options);
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
  @include mat-exp.mat-exp-icon-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

##### Effects

If you set `skip-html-element-styles` to `true`, the mixin will not apply styles to the underlying HTML elements. Styles that will not work as expected:

- Icon sizes
- Shape morphing
- Appearance and width variations

#### sizes

Type: `list` of `'xs' | 's' | 'm' | 'l' | 'xl'`

Default: `null` (all sizes emitted)

Restricts the emitted CSS to only the given sizes, dropping the rest of the size combination matrix at compile time. See [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload).

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```

#### appearances

Type: `list` of `'text' | 'filled' | 'outlined' | 'tonal'`

Default: `null` (all appearances emitted)

Restricts the emitted CSS to only the given appearances, dropping the rest of the appearance combination matrix at compile time.

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-icon-button-styles(
    (
      appearances: ('filled'),
    )
  );
}
```
