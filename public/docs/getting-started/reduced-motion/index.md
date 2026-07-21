---
title: Reduced Motion
order: 3
description: How Mat Expressive respects prefers-reduced-motion — which animations are explicitly gated, and which are neutralized automatically by Angular Material.
---

Every animation in Mat Expressive respects the user's OS-level `prefers-reduced-motion: reduce` setting. This happens in one of two ways, depending on what's driving the animation.

## GSAP-driven animations — explicitly gated

Components with hand-built GSAP motion (spatial springs, morph loops, entry/exit tweens) check `prefers-reduced-motion` themselves and skip the animation outright rather than playing a shortened version of it:

- **`MatExpLoadingIndicator`** — the continuous shape-morph/rotation loop never starts, and enter/exit resolve immediately. See [Loading Indicator → Behavior summary](/docs/components/loading-and-progress/loading-indicator#behavior-summary).
- **`MatExpButtonGroup`** — the `standard`-variant press-bounce (the interacted button springing wider while its neighbors compress) never plays; buttons keep their resting widths. See [Button Group → Motion](/docs/components/all-buttons/button-group#motion).

These checks live in each component's own animation module (e.g. `button-group.animation.ts`, `loading-indicator.animation.ts`) using `window.matchMedia('(prefers-reduced-motion: reduce)')`, and are covered by unit tests.

## CSS transitions — neutralized by Angular Material

Some Mat Expressive motion is plain CSS, not GSAP: the shape-morph transition (`border-radius`, `padding-left`/`padding-right`, `box-shadow`) that plays when a button is pressed or toggled between round and square. This transition is **not** wrapped in a `prefers-reduced-motion` media query anywhere in Mat Expressive's own stylesheet — and it doesn't need to be.

Every Mat Expressive button directive (`matExpButton`, `matExpIconButton`, `matExpFabMenuTrigger`) is applied *on top of* a real Angular Material MDC component (`matButton`, `matIconButton`, `matFab`) — they share the same host element, and using a Mat Expressive button directive without its Material counterpart isn't a supported configuration. Angular Material's own MDC components already detect `prefers-reduced-motion` and add a `_mat-animation-noopable` class to that shared host element, paired with Material's own compiled CSS:

```css
.mat-mdc-icon-button._mat-animation-noopable,
.mat-mdc-button._mat-animation-noopable /* + unelevated/raised/outlined/tonal */ {
  transition: none !important;
  animation: none !important;
}
```

Because that rule is `!important`, it overrides Mat Expressive's own transition declaration regardless of how many size/shape/appearance selectors stack on top of it. In practice this means: as long as you use a Mat Expressive button directive the documented way — paired with its Material host directive — its CSS transitions are neutralized under reduced motion automatically, with no separate flag to set.

`MatExpSplitButton` and `MatExpButtonGroup` don't declare this transition themselves; they inherit it transitively from the `matExpButton`/`matExpIconButton` children projected into them.

## Opting out manually

`prefers-reduced-motion` is an OS-level, all-animations setting. If you want to disable a specific animation regardless of that setting — for example, to match a design that never wants the press-bounce — some components expose their own input for it:

- **`MatExpButtonGroup`** — set `[disableBounce]="true"` (or `provideMatExpButtonGroupOptions({ disableBounce: true })` globally) to turn off the press-bounce independently of the user's motion preference.
