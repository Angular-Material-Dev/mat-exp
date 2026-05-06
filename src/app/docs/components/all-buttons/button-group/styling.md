---
title: Styling
route: styling
keyword: ButtonGroupStylingPage
---

This document outlines the API for the `mat-expressive-button-group-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-group-styles($options);
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
  @include mat-expressive.mat-expressive-button-group-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Button group container layout (`display: inline-flex`, `flex-direction`, `white-space`, `position`)
- Size-based container height and column gap
- Connected variant column gap and compact icon button sizing
- Connected variant inner-corner shape morphing for each size
