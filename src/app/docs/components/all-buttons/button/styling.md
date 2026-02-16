---
title: Styling
route: styling
keyword: ButtonStylingPage
---

This document outlines API for `mat-expressive-button-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-styles($options);
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
  @include mat-expressive.mat-expressive-button-styles(
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

### mat-expressive-button-class

Type: `string`

Default: `mat-expressive-button`

The class to be applied to the button.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-styles(
    (
      mat-expressive-button-class: 'my-custom-button',
    )
  );
}
```

#### Effects

If you set `mat-expressive-button-class` to `my-custom-button`, the mixin will apply styles to the button with the class `my-custom-button`.

Make sure to also override the `matExpressiveButtonClass` in the `provideExpressiveButtonOptions`.

```angular-ts
import { provideExpressiveButtonOptions } from '@ngm-dev/mat-expressive';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExpressiveButtonOptions({
      matExpressiveButtonClass: 'my-custom-button',
    }),
  ],
};
```
