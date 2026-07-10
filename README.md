# Mat Expressive

Mat Expressive is a library that provides a set of components and styles for Angular Material based on the latest Material Design 3 Expressive Design System.

Mat Expressive is neither a replacement for Angular Material nor a fork of Angular Material. It is mainly a collection of:

- Styles - These are applied to the existing Angular Material components to make them more expressive and consistent with the latest Material Design 3 Expressive Design System.
- Directives - Same as styles, but when we need to apply styles to the underlying HTML elements or handle some specific behavior.
- Components - These are created where we need to create a new component that is not available in Angular Material.

## How does it work?

Mat Expressive uses Angular Material's [`overrides` APIs](https://material.angular.dev/guide/theming#component-tokens) & [CSS variables](https://material.angular.dev/guide/theming-your-components) to achieve the desired styles. When a change is not possible with the overrides, Mat Expressive directly applies styles to the underlying HTML elements.

## Is applying styles to the underlying HTML elements a good idea?

Well, generally it is not a good idea to apply styles to the underlying HTML elements. However, in the case of Mat Expressive, it is necessary to apply styles to the underlying HTML elements to achieve the desired styles.

We use Angular Material's CSS classes like `.mdc-button` to apply styles to the underlying HTML elements. We also understand that this may break in the future when Angular Material updates their CSS classes.

But, to accommodate such changes, we will be updating the library to use the new CSS classes as soon as they are released.

## I do not want to apply styles to the underlying HTML elements.

That's totally fine! But please note that you will not be able to see the full results provided by Mat Expressive. To learn more about how to skip HTML element styles, please refer to the [skipping HTML element styles](/getting-started/installation#skip-html-element-styles) section.

## Licensing

`@ngm-dev/mat-expressive` is **free for non-commercial use** under the [PolyForm Noncommercial 1.0.0](./LICENSE) license. Commercial use (for-profit products, internal tools, client work, freelance) requires a paid license.

Purchase a lifetime commercial license at our Polar.sh store *(link available when product is live — see `environment.polarUrl` in `src/environments/environment.ts`)*.

See [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md) for full terms and what is covered.

Questions? Contact [support@angular-material.dev](mailto:support@angular-material.dev).
