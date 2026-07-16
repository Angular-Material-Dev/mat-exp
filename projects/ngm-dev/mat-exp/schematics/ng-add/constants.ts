/** The `@use` line that must precede any other Sass rule in the global stylesheet. */
export const USE_STATEMENT = `@use '@ngm-dev/mat-exp' as mat-exp;`;

/** The prebuilt CSS entry point added to `angular.json`'s `styles` array for CSS projects. */
export const CSS_STYLES_ENTRY = '@ngm-dev/mat-exp/styles.css';

export const GETTING_STARTED_URL =
  'https://expressive.angular-material.dev/docs/getting-started/installation';

/**
 * Maps the `components` option / picker keys to their Sass style mixin, in the order they're
 * offered in the component picker prompt (`schema.json`'s `components.x-prompt.items` — keep the
 * labels there in sync with these keys). Verified against
 * `projects/ngm-dev/mat-exp/src/lib/styles/components/all-buttons/**\/_index.scss`.
 */
export const COMPONENT_STYLE_MIXINS: Record<string, string> = {
  button: 'mat-exp-button-styles',
  'icon-button': 'mat-exp-icon-button-styles',
  'button-group': 'mat-exp-button-group-styles',
  'split-button': 'mat-exp-split-button-styles',
  'fab-menu': 'mat-exp-fab-menu-styles',
  'fab-menu-trigger': 'mat-exp-fab-menu-trigger-styles',
};

/**
 * Matches the leading run of `@use`/`@forward` statements (plus any interleaved blank lines or
 * comments) at the very start of a Sass file. Sass requires all `@use`/`@forward` rules to
 * precede every other rule in the stylesheet, so this is used to find the exact position where
 * it's safe to insert another `@use` statement (and the first rule that depends on it) without
 * pushing any pre-existing `@use` rule below a non-`@use` rule.
 */
export const LEADING_USE_FORWARD_BLOCK =
  /^(?:[ \t]*\r?\n|[ \t]*\/\/[^\n]*\r?\n|[ \t]*\/\*[\s\S]*?\*\/[ \t]*\r?\n|[ \t]*@(?:use|forward)\b[^;]*;[ \t]*\r?\n?)+/;
