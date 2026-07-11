---
title: Styling
order: 3
description: Styling API for the mat-expressive-icon-button-styles SCSS mixin, including the skip-html-element-styles option.
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

If you set `skip-html-element-styles` to `true`, the mixin will not apply styles to the underlying HTML elements. Styles that will not work as expected:

- Icon sizes
- Shape morphing
- Appearance and width variations

### sizes

Type: `list` of `'xs' | 's' | 'm' | 'l' | 'xl'`

Default: `null` (all sizes emitted)

Restricts the emitted CSS to only the given sizes, dropping the rest of the size combination matrix at compile time. See [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload).

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-icon-button-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```

### appearances

Type: `list` of `'text' | 'filled' | 'outlined' | 'tonal'`

Default: `null` (all appearances emitted)

Restricts the emitted CSS to only the given appearances, dropping the rest of the appearance combination matrix at compile time.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-icon-button-styles(
    (
      appearances: ('filled'),
    )
  );
}
```
