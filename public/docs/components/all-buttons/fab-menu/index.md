---
title: FAB Menu
order: 5
description: Material Expressive FAB Menu — directives that style a standard Angular Material FAB button and menu with M3 Expressive color and shape transitions.
primarySymbol: [MatExpFabMenu, MatExpFabMenuTrigger]
---

## Overview

`MatExpFabMenu` and `MatExpFabMenuTrigger` are directives that style a standard Angular Material FAB button and menu in [Material 3 Design System Expressive styles](https://m3.material.io/components/floating-action-button/overview). The FAB trigger opens an overlay menu that lists related actions, with color and shape transitions driven by the open/closed state.

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles`, or both individual mixins in your global SCSS styles.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;
html {
  @include mat-exp.mat-exp-all-styles();
}
```

or

```scss
@use '@ngm-dev/mat-exp' as mat-exp;
html {
  @include mat-exp.mat-exp-all-buttons-styles();
}
```

or individually:

```scss
@use '@ngm-dev/mat-exp' as mat-exp;
html {
  @include mat-exp.mat-exp-fab-menu-styles();
  @include mat-exp.mat-exp-fab-menu-trigger-styles();
}
```

## Usage

Apply `matExpFabMenuTrigger` to the FAB button and `matExpFabMenu` to the `<mat-menu>`. Pass the same `color` value to both so the trigger and panel stay in sync.

```angular-ts group="my-group1" name="app.ts"
import { MatExpFabMenu, MatExpFabMenuTrigger } from '@ngm-dev/mat-exp';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
@Component({
  selector: 'app-root',
  imports: [
    MatExpFabMenu,
    MatExpFabMenuTrigger,
    MatFabButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './app.component.html',
})
export class App {}
```

```angular-html group="my-group1" name="app.html"
<button
  matFab
  [matMenuTriggerFor]="menu"
  matExpFabMenuTrigger
  #menuTrigger="matMenuTrigger"
  color="primary"
>
  <mat-icon>\{\{ menuTrigger.menuOpen ? 'close' : 'more_vert' \}\}</mat-icon>
</button>
<mat-menu #menu="matMenu" matExpFabMenu color="primary">
  <button mat-menu-item>
    <mat-icon>description</mat-icon>
    Document
  </button>
  <button mat-menu-item>
    <mat-icon>message</mat-icon>
    Message
  </button>
  <button mat-menu-item>
    <mat-icon>folder</mat-icon>
    Folder
  </button>
</mat-menu>
```

## Playground

<playground-preview preview="fab-menu"></playground-preview>

## API

### MatExpFabMenu Directive

You can view the API for `MatExpFabMenu` directive [here](/docs/api/mat-exp/directives/MatExpFabMenu).

### MatExpFabMenuTrigger Directive

You can view the API for `MatExpFabMenuTrigger` directive [here](/docs/api/mat-exp/directives/MatExpFabMenuTrigger).

## Styling

FAB menu exposes two mixins — one for the menu panel and one for the FAB trigger — both of which are included automatically when you call `mat-exp-all-styles` or `mat-exp-all-buttons-styles`.

### `mat-exp-fab-menu-styles`

Controls the appearance of the menu panel overlay (`.mat-exp-fab-menu`).

#### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-fab-menu-styles($options);
}
```

#### Options

##### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-fab-menu-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

###### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Menu content flex layout (column direction, row gap)
- Menu item alignment based on position (`before` / `after`)
- Menu item pill shape (border-radius) and minimum height
- Per-color item background colors

###### colors

Type: `list` of `'primary' | 'secondary' | 'tertiary'`

Default: `null` (all colors emitted)

Restricts the emitted CSS to only the given colors, dropping the rest of the color combination matrix at compile time.

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-fab-menu-styles(
    (
      colors: ('primary'),
    )
  );
}
```

---

### `mat-exp-fab-menu-trigger-styles`

Controls the appearance of the FAB button that opens the menu (`.mat-exp-fab-menu-trigger`).

#### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-fab-menu-trigger-styles($options);
}
```

#### Options

##### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-fab-menu-trigger-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

###### Effects

If you set `skip-html-element-styles` to `true`, the following styles will not be applied:

- Shape-morph and color transition animation on the trigger FAB

###### colors

Type: `list` of `'primary' | 'secondary' | 'tertiary'`

Default: `null` (all colors emitted)

Restricts the emitted CSS to only the given colors, dropping the rest of the color combination matrix at compile time.

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-fab-menu-trigger-styles(
    (
      colors: ('primary'),
    )
  );
}
```
