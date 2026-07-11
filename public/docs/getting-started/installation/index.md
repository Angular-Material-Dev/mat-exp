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

You can either include only the styles for a specific component, a group of components, or the entire Mat Expressive styles. **We recommend including only the components you actually use** — the styles are generated as a flat combinatorial matrix (size × shape × state × appearance × …) per component, so pulling in the whole library costs more CSS than most apps need. See [Reducing the CSS payload](#reducing-the-css-payload) below.

### Include the styles for a specific component (recommended)

Include the styles for only the components you use in your global SCSS styles. This keeps your compiled CSS as small as possible.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-styles();
  @include mat-expressive.mat-expressive-icon-button-styles();
  @include mat-expressive.mat-expressive-button-group-styles();
  @include mat-expressive.mat-expressive-split-button-styles();
}
```

Each component's **Styling** tab documents the mixin's options, including the `sizes` / `appearances` / `colors` filters described below.

### Include the styles for a group of components

Include the styles for a group of components in your global SCSS styles. This will include the styles for all buttons (icon buttons, button groups, split buttons, etc.) — reach for this only if your app genuinely uses most of the button family.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-buttons-styles();
}
```

### Include the entire Mat Expressive styles ("kitchen sink")

Include the entire Mat Expressive styles in your global SCSS styles. This is the simplest option, but it also emits the most CSS — every component, every size, every shape, every state, every appearance, all at once. Use it for prototyping or when you genuinely need the whole library; prefer the per-component or per-group mixins above for production apps that care about bundle size.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles();
}
```

### Not using Sass?

If your project doesn't compile Sass, you can import the prebuilt CSS instead. It bundles the full `mat-expressive-all-styles()` output (HTML element styles included, `skip-html-element-styles` is not configurable this way). This is the escape hatch for teams without a Sass build step — if you *do* compile Sass, prefer the mixins above (or the filtering options below) since the prebuilt CSS can't be trimmed at compile time.

```css
@import '@ngm-dev/mat-expressive/styles.css';
```

Or add it directly to the `styles` array in `angular.json`:

```json
"styles": ["@ngm-dev/mat-expressive/styles.css"]
```

## Reducing the CSS payload

`mat-expressive-all-styles()` emits every component's full size × shape × state × toggle × appearance combination matrix flat, because each Directive-based button family member has no `styleUrls` and can only style itself through global mixins keyed off `data-*` attribute selectors. Measured against the real published package (`npm pack` tarball, `@use '@ngm-dev/mat-expressive' as me`, `sass` CLI, expanded output, uncompressed) this mixin produces **~177 KB of raw CSS** (gzip compresses this well thanks to repetitive selectors, but the raw number is still worth budgeting for — Angular's default initial-bundle budget is 500 KB).

Two ways to cut this down, from least to most work:

1. **Only include the mixins for components you use.** A single `mat-expressive-button-styles()` call, for example, compiles to roughly **62 KB** raw — about a third of the full `mat-expressive-all-styles()` payload — because it skips every other family member's combination matrix entirely.
2. **Filter out unused size / appearance / color combinations.** Every button-family mixin accepts a `sizes` option (`icon-button` also accepts `appearances`; `fab-menu` / `fab-menu-trigger` accept `colors`) that drops the rest of that axis's combinations at Sass compile time. For example, restricting `mat-expressive-all-styles()` to `sizes: ('s', 'm')` plus `colors: ('primary')` cuts the ~177 KB payload to roughly **75 KB** — a ~57% reduction — with no runtime cost, because the CSS for the excluded sizes/colors is simply never generated.

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

> [!NOTE]
> If a component renders with a `data-size` / `data-appearance` / `data-color` value you filtered out, no error is thrown — the element just won't match a `[data-size='...']`-qualified selector, so it falls back to whatever base (non-attribute-qualified) styles the component defines, which is visually wrong for that size/appearance/color. Double-check the filter list covers every value your app actually renders before shipping.

These two techniques compose: apply a `sizes`/`appearances`/`colors` filter to the per-component mixins from the previous section for the smallest possible payload.

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
