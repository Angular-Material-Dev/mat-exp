---
title: Styling
order: 3
description: Styling API for the mat-expressive-fab-menu-styles and mat-expressive-fab-menu-trigger-styles SCSS mixins.
---

FAB menu exposes two mixins — one for the menu panel and one for the FAB trigger — both of which are included automatically when you call `mat-expressive-all-styles` or `mat-expressive-all-buttons-styles`.

## `mat-expressive-fab-menu-styles`

Controls the appearance of the menu panel overlay (`.mat-expressive-fab-menu`).

### Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-fab-menu-styles($options);
}
```

### Options

#### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-fab-menu-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

##### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Menu content flex layout (column direction, row gap)
- Menu item alignment based on position (`before` / `after`)
- Menu item pill shape (border-radius) and minimum height
- Per-color item background colors

##### colors

Type: `list` of `'primary' | 'secondary' | 'tertiary'`

Default: `null` (all colors emitted)

Restricts the emitted CSS to only the given colors, dropping the rest of the color combination matrix at compile time.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-fab-menu-styles(
    (
      colors: ('primary'),
    )
  );
}
```

---

## `mat-expressive-fab-menu-trigger-styles`

Controls the appearance of the FAB button that opens the menu (`.mat-expressive-fab-menu-trigger`).

### Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-fab-menu-trigger-styles($options);
}
```

### Options

#### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-fab-menu-trigger-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

##### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Shape-morph and color transition animation on the trigger FAB

##### colors

Type: `list` of `'primary' | 'secondary' | 'tertiary'`

Default: `null` (all colors emitted)

Restricts the emitted CSS to only the given colors, dropping the rest of the color combination matrix at compile time.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-fab-menu-trigger-styles(
    (
      colors: ('primary'),
    )
  );
}
```
