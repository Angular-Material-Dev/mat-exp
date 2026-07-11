---
title: All Styles API
order: 1
description: API reference for the mat-expressive-all-styles SCSS mixin that applies all Mat Expressive component styles at once.
---

This document outlines API for `mat-expressive-all-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles($options);
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
  @include mat-expressive.mat-expressive-all-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

Side effects of setting `skip-html-element-styles` to `true` are outlined in each components **Styling** tab

### sizes / appearances / colors

`mat-expressive-all-styles($options)` forwards `$options` unchanged to every underlying component mixin, so any of the size/appearance/color filter options documented on the individual component **Styling** tabs (e.g. `sizes` on `mat-expressive-button-styles`, `colors` on `mat-expressive-fab-menu-styles`) work here too — they just apply across every component at once.

`mat-expressive-all-styles()` emits ~177 KB of raw, uncompressed CSS (every component × every combination). See [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload) for measured numbers and the recommended per-component alternative.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles(
    (
      sizes: ('s', 'm'),
      colors: ('primary'),
    )
  );
}
```
