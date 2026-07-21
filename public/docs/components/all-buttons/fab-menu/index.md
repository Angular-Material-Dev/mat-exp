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

## Accessibility

The trigger's shape-morph transition (`border-radius`, `padding-left`/`padding-right`, `box-shadow`) automatically stops under `prefers-reduced-motion: reduce` — Angular Material's own `matFab` host, which `matExpFabMenuTrigger` is always applied alongside, detects the setting and neutralizes the transition. See [Reduced Motion](/docs/getting-started/reduced-motion) for how this works across the library.

## Playground

<playground-preview preview="fab-menu"></playground-preview>

## API

### `MatExpFabMenu`

Standalone directive, selector **`[matExpFabMenu]`**.

You can view the generated API for `MatExpFabMenu` [here](/docs/api/mat-exp/directives/MatExpFabMenu).

#### Host

No static host bindings. `MatExpFabMenu` instead sets `MatMenu.panelClass` programmatically via an effect, combining the consumer's original panel class (captured once, before Angular Material's own `panelClass` setter clears it), `mat-exp-fab-menu`, and `mat-exp-fab-menu-<color>`.

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| **`color`** | `MatExpFabMenuColor` | `'primary'` | Color applied to the menu panel. Pass the same value to the trigger's `color` so the two stay in sync. |

`color` uses `input()`.

Types:

- **`MatExpFabMenuColor`** (alias of `MatExpFabMenuTriggerColor`) – `'primary' | 'secondary' | 'tertiary'`

---

### `MatExpFabMenuTrigger`

Standalone directive, selector **`[matExpFabMenuTrigger]`**.

You can view the generated API for `MatExpFabMenuTrigger` [here](/docs/api/mat-exp/directives/MatExpFabMenuTrigger).

#### Host

| Attribute / binding | Value |
| --- | --- |
| `data-menu-open` | `true` while the associated `MatMenuTrigger`'s menu is open |
| `data-color` | From **`color()`** input |
| `class` | `mat-exp-fab-menu-trigger` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| **`color`** | `MatExpFabMenuTriggerColor` | `'primary'` | Color of the trigger FAB. Pass the same value to the menu's `color` so the two stay in sync. |

`color` uses `input()`.

Types:

- **`MatExpFabMenuTriggerColor`** – `'primary' | 'secondary' | 'tertiary'`

Neither directive has an options/provider pattern — set `color` directly on each element.

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. |
| `colors` | list of `'primary' \| 'secondary' \| 'tertiary'` | `null` (all colors emitted) | Restricts the emitted CSS to only the given colors, dropping the rest of the color combination matrix at compile time. |

##### `skip-html-element-styles`

Setting this to `true` means the following styles won't be applied:

- Menu content flex layout (column direction, row gap)
- Menu item alignment based on position (`before` / `after`)
- Menu item pill shape (border-radius) and minimum height
- Per-color item background colors

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

##### `colors`

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. |
| `colors` | list of `'primary' \| 'secondary' \| 'tertiary'` | `null` (all colors emitted) | Restricts the emitted CSS to only the given colors, dropping the rest of the color combination matrix at compile time. |

##### `skip-html-element-styles`

Setting this to `true` means the following styles won't be applied:

- Shape-morph and color transition animation on the trigger FAB

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

##### `colors`

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
