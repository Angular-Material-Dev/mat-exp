---
title: API
route: api
keyword: LoadingIndicatorApiPage
---

## `MatExpressiveLoadingIndicator`

Standalone component, **`OnPush`**, selector **`mat-expressive-loading-indicator`**.

You can view the generated API for `MatExpressiveLoadingIndicator` [here](/api/classes/mat-expressive/MatExpressiveLoadingIndicator).

### Host

| Attribute / binding | Value |
| --- | --- |
| `role` | `progressbar` |
| `aria-busy` | `true` |
| `aria-valuemin` / `aria-valuemax` | `0` / `100` |
| `aria-label` | From **`ariaLabel()`** input |
| `class` | `mat-expressive-loading-indicator` |
| `data-speed` | Current **`speed`** preset |

### Inputs

| Input | Type | Default (from options) | Description |
| --- | --- | --- | --- |
| **`config`** | `MatExpressiveLoadingIndicatorConfig` | `'default'` | `'default'` – shape only. `'contained'` – shape on tonal circular background. |
| **`ariaLabel`** | `string` | `'Loading'` | Accessible name while the indicator is shown. Override per instance for context (e.g. “Uploading file”). |
| **`speed`** | `MatExpressiveLoadingIndicatorSpeed` | `'default'` | `'fast'` \| `'default'` \| `'slow'` – maps to M3 Expressive spatial spring presets and step timing. Updates at runtime rebuild GSAP timelines. |

Types:

- **`MatExpressiveLoadingIndicatorConfig`** – `'default' \| 'contained'`
- **`MatExpressiveLoadingIndicatorSpeed`** – `'fast' \| 'default' \| 'slow'`

### Animation callbacks

The component listens to **`(animate.enter)`** and **`(animate.leave)`** on the host and drives GSAP on the inner container, then calls **`event.animationComplete()`** when each tween finishes (or immediately when not in the browser or when reduced motion applies).

---

## Options and provider

### `MatExpressiveLoadingIndicatorOptions`

```ts
interface MatExpressiveLoadingIndicatorOptions {
  readonly config?: MatExpressiveLoadingIndicatorConfig;
  readonly ariaLabel?: string;
  readonly speed?: MatExpressiveLoadingIndicatorSpeed;
}
```

### `MAT_EXPRESSIVE_LOADING_INDICATOR_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `config: 'default'`
- `ariaLabel: 'Loading'`
- `speed: 'default'`

### `MAT_EXPRESSIVE_LOADING_INDICATOR_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the component.

### `provideMatExpressiveLoadingIndicatorOptions`

```angular-ts
import { provideMatExpressiveLoadingIndicatorOptions } from '@ngm-dev/mat-expressive';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpressiveLoadingIndicatorOptions({
      speed: 'slow',
      ariaLabel: 'Please wait',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpressiveLoadingIndicatorOptions>` (see `matExpressiveCreateOptions` in the library).

---

## Advanced exports

The package also exports **`MAT_EXPRESSIVE_LOADING_INDICATOR_SHAPES`** (readonly path `d` strings) and **`MAT_EXPRESSIVE_LOADING_INDICATOR_VIEW_BOX`** for tooling or documentation; the component already uses these for the morph loop.
