import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addCssStylesheetEntry, findGlobalStylesheet } from './angular-json';
import { GETTING_STARTED_URL } from './constants';
import { resolveComponents, resolveConfigureStyles } from './prompts';
import { buildManualInstructions, insertStylesBlock } from './stylesheet';
import type { NgAddOptions } from './types';

export type { NgAddOptions } from './types';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * `ng add @ngm-dev/mat-exp` schematic.
 *
 * 1. Verifies `@angular/material` is installed (Mat Expressive builds on top of it) — this check
 *    always runs, regardless of `configureStyles`.
 * 2. Asks (or reads `configureStyles`) whether to configure styles at all. If declined, only the
 *    getting-started docs link is printed.
 * 3. Locates the project's global stylesheet via `angular.json`.
 *    - CSS projects: adds `@ngm-dev/mat-exp/styles.css` as the first entry of the build
 *      target's `styles` array (idempotent).
 *    - SCSS/Sass projects: asks (or reads `components`) which Button Family components to
 *      include, then inserts the `@use` + `@include` block into the global stylesheet, positioned
 *      after any existing `@use`/`@forward` statements but before any other rule.
 * 4. Prints a pointer to the getting-started docs (always, even when declined).
 */
export default function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    verifyAngularMaterialInstalled(tree);

    const configureStyles = resolveConfigureStyles(options);
    if (!configureStyles) {
      context.logger.info(
        'mat-exp: skipping automatic style setup, as requested. You can configure ' +
          'styles manually at any time — see the getting-started guide below.',
      );
      printGettingStartedLink(context);
      return tree;
    }

    const stylesheet = findGlobalStylesheet(tree, options.project);
    if (!stylesheet) {
      context.logger.warn(buildManualInstructions());
      printGettingStartedLink(context);
      return tree;
    }

    if (stylesheet.type === 'css') {
      if (options.components !== undefined) {
        context.logger.info(
          'mat-exp: the "components" option is ignored for CSS projects — the prebuilt ' +
            '"@ngm-dev/mat-exp/styles.css" stylesheet always includes every component.',
        );
      }
      addCssStylesheetEntry(tree, options.project, context);
    } else {
      const components = resolveComponents(options, context);
      insertStylesBlock(tree, stylesheet.path, context, components);
    }

    printGettingStartedLink(context);
    return tree;
  };
}

function printGettingStartedLink(context: SchematicContext): void {
  context.logger.info('');
  context.logger.info(`mat-exp: for the full setup guide, see ${GETTING_STARTED_URL}`);
}

/**
 * Mat Expressive is built on top of Angular Material and its styles assume Angular Material's
 * theme (`mat.theme()`) is already configured. Abort with an actionable message rather than
 * silently wiring up a broken install. Runs unconditionally, before the `configureStyles`
 * question, since a working Angular Material install is a hard requirement either way.
 */
function verifyAngularMaterialInstalled(tree: Tree): void {
  const raw = tree.read('/package.json');
  if (!raw) {
    throw new Error(
      'mat-exp: could not find a "package.json" at the workspace root; are you running ' +
        'this from an Angular workspace?',
    );
  }

  const packageJson = JSON.parse(raw.toString('utf-8')) as PackageJson;
  const hasMaterial =
    !!packageJson.dependencies?.['@angular/material'] ||
    !!packageJson.devDependencies?.['@angular/material'];

  if (!hasMaterial) {
    throw new Error(
      'mat-exp: "@angular/material" was not found in this workspace. Mat Expressive is ' +
        'built on top of Angular Material and requires it to be installed and configured first. ' +
        'Run "ng add @angular/material", then re-run "ng add @ngm-dev/mat-exp".',
    );
  }
}
