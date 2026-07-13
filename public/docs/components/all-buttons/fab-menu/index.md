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
