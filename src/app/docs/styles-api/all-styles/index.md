---
keyword: AllStylesAPIPage
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

### [mat-expressive-button-class](/components/all-buttons/button/styling#mat-expressive-button-class)

### [mat-expressive-icon-button-class](/components/all-buttons/icon-button/styling#mat-expressive-icon-button-class)
