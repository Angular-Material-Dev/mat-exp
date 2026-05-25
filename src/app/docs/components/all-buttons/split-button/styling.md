---
title: Styling
route: styling
keyword: SplitButtonStylingPage
---

This document outlines the API for the `mat-expressive-split-button-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-split-button-styles($options);
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
  @include mat-expressive.mat-expressive-split-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Split button container layout (`display: inline-flex`, `flex-direction`, `white-space`, `column-gap`)
- Size-based container height
- Chevron button fixed width, padding, and text alignment
- Icon size inside the chevron button
- Connected inner-corner shape morphing for each size
