import type { SchematicContext } from '@angular-devkit/schematics';
import { COMPONENT_STYLE_MIXINS } from './constants';
import type { ComponentSelection, NgAddOptions } from './types';

/**
 * Resolves which components to include styles for (SCSS projects only). Same
 * explicit-option-wins, x-prompt-handles-interactive-elsewhere precedence as
 * {@link resolveConfigureStyles} — the CLI's `components` x-prompt (`schema.json`) already
 * resolves to a value before this runs when interactive, so this only needs to parse/validate
 * whatever ends up in `options.components` and fall back to `'all'` when it's still undefined.
 */
export function resolveComponents(
  options: NgAddOptions,
  context: SchematicContext,
): ComponentSelection {
  if (options.components === undefined) {
    return 'all';
  }
  return parseComponentsOption(options.components, context);
}

/**
 * Parses the `components` option (a string array, or a single string: the CLI collapses
 * `--components=a,b` into a single `['a,b']` entry rather than splitting per-flag, and passes
 * `--components=all` through as a bare string) into a validated component-key list, or
 * `'all'`.
 */
function parseComponentsOption(
  value: string[] | string,
  context: SchematicContext,
): ComponentSelection {
  const requested = (Array.isArray(value) ? value : [value])
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (requested.length === 0 || requested.some((entry) => entry.toLowerCase() === 'all')) {
    return 'all';
  }

  const valid = requested.filter((key) => key in COMPONENT_STYLE_MIXINS);
  const invalid = requested.filter((key) => !(key in COMPONENT_STYLE_MIXINS));

  if (invalid.length > 0) {
    context.logger.warn(
      `mat-exp: ignoring unknown component key(s) in "components" option: ` +
        `${invalid.join(', ')}. Valid keys: ${Object.keys(COMPONENT_STYLE_MIXINS).join(', ')}, or "all".`,
    );
  }

  return valid.length > 0 ? valid : 'all';
}
