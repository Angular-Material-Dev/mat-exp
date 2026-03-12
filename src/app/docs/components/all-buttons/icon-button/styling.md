---
title: Styling
route: styling
keyword: IconButtonStylingPage
---

This document outlines API for `mat-expressive-icon-button-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-icon-button-styles($options);
}
```

## Options

### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-icon-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### Effects

If you set `skip-html-element-styles` to `true`, the mixin will not apply styles to the underlying HTML elements. And below are some styles which will not work as expected:

- Icon sizes
- Shape morphing
- `outlined`, `filled` & `tonal` appearance variants
- `narrow` & `wide` width variants

### mat-expressive-icon-button-class

Type: `string`

Default: `mat-expressive-icon-button`

The class to be applied to the button.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-icon-button-styles(
    (
      mat-expressive-icon-button-class: 'my-custom-icon-button',
    )
  );
}
```

#### Effects

If you set `mat-expressive-icon-button-class` to `my-custom-icon-button`, the mixin will apply styles to the button with the class `my-custom-icon-button`.

Make sure to also override the `matExpressiveIconButtonClass` in the `provideMatExpressiveIconButtonOptions`.

```angular-ts
import { provideMatExpressiveIconButtonOptions } from '@ngm-dev/mat-expressive';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpressiveIconButtonOptions({
      matExpressiveIconButtonClass: 'my-custom-icon-button',
    }),
  ],
};
```
