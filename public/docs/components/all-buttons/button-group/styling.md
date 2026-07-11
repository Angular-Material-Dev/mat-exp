---
title: Styling
order: 3
description: Styling API for the mat-expressive-button-group-styles SCSS mixin, including the skip-html-element-styles option and its effects on layout.
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

### sizes

Type: `list` of `'xs' | 's' | 'm' | 'l' | 'xl'`

Default: `null` (all sizes emitted)

Restricts the emitted CSS to only the given sizes, including the per-size connected-variant inner-corner overrides. See [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload).

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-group-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```
