---
title: Installation
order: 2
description: Step-by-step guide to installing and configuring Mat Expressive in your Angular project, including style setup and HTML element style options.
---

## Supported Angular versions

Mat Expressive supports the following Angular versions:

| #   | Angular version |
| --- | --------------- |
| 1   | 21              |

## Pre-requisites

Make sure you have installed Angular Material first using the following command:

```bash
ng add @angular/material
```

## Install the Mat Expressive via npm

```bash
npm install @ngm-dev/mat-expressive
```

> [!NOTE]
> While it's free for non-commercial usage, you need a license for other usages. [Learn more](/license).

## Setup the Mat Expressive styles

You can either include the entire Mat Expressive styles, a group of components, or only the styles for a specific component.

### Include the entire Mat Expressive styles

Include the entire Mat Expressive styles in your global SCSS styles.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles();
}
```

### Include the styles for a group of components

Include the styles for a group of components in your global SCSS styles. This will include the styles for all buttons (icon buttons, button groups, split buttons, etc.).

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-buttons-styles();
}
```

### Include the styles for a specific component

Include the styles for a specific component in your global SCSS styles.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-styles();
  @include mat-expressive.mat-expressive-icon-button-styles();
  @include mat-expressive.mat-expressive-button-group-styles();
  @include mat-expressive.mat-expressive-split-button-styles();
}
```

### Not using Sass?

If your project doesn't compile Sass, you can import the prebuilt CSS instead. It bundles the full `mat-expressive-all-styles()` output (HTML element styles included, `skip-html-element-styles` is not configurable this way).

```css
@import '@ngm-dev/mat-expressive/styles.css';
```

Or add it directly to the `styles` array in `angular.json`:

```json
"styles": ["@ngm-dev/mat-expressive/styles.css"]
```

### Skip HTML element styles

If you do not want to apply styles to the underlying HTML elements, you can set the `skip-html-element-styles` option to `true`.

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

To understand the effects of skipping HTML element styles, please refer to the **Styling** tab for each component.
