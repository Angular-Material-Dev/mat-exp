import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';

const collectionPath = path.join(__dirname, '../collection.json');

/** Mirrors what `ng add @angular/material` writes into a fresh `styles.scss`. */
const STYLES_AFTER_MATERIAL_NG_ADD = `@use '@angular/material' as mat;

html {
  height: 100%;
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

body {
  color-scheme: light;
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  margin: 0;
  height: 100%;
}
`;

/** A minimal global stylesheet for a CSS (non-Sass) project. */
const DEFAULT_CSS_STYLES = `:root {\n  color-scheme: light;\n}\n`;

/**
 * Every `runSchematic` call below passes `configureStyles` (and `components`, where the SCSS
 * branch is reached) explicitly, mirroring how non-interactive/CI usage drives the schematic.
 * This is no longer required to avoid hanging: interactive prompting is handled entirely by the
 * Angular CLI via `schema.json`'s `x-prompt` (a layer `SchematicTestRunner` never invokes), so
 * `resolveConfigureStyles`/`resolveComponents` (`prompts.ts`) never touch a prompt library
 * themselves — omitting an option here just resolves its documented default (see the "resolves
 * omitted options to their documented defaults" test below).
 */
function createWorkspaceTree(
  options: {
    hasMaterial?: boolean;
    stylesheet?: string;
    flavor?: 'scss' | 'css';
    stylesArray?: (string | { input?: string })[];
  } = {},
): Tree {
  const { hasMaterial = true, flavor = 'scss' } = options;
  const tree = Tree.empty();

  tree.create(
    '/package.json',
    JSON.stringify({
      name: 'demo',
      dependencies: hasMaterial ? { '@angular/material': '^21.0.0' } : {},
    }),
  );

  const defaultStylesPath = flavor === 'css' ? 'src/styles.css' : 'src/styles.scss';
  const stylesArray = options.stylesArray ?? [defaultStylesPath];

  tree.create(
    '/angular.json',
    JSON.stringify({
      version: 1,
      defaultProject: 'demo',
      projects: {
        demo: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                styles: stylesArray,
              },
            },
          },
        },
      },
    }),
  );

  const defaultContent = flavor === 'css' ? DEFAULT_CSS_STYLES : STYLES_AFTER_MATERIAL_NG_ADD;
  tree.create(`/${defaultStylesPath}`, options.stylesheet ?? defaultContent);

  return tree;
}

describe('ng-add schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('inserts the @use/@include block before any existing rule', async () => {
    const tree = createWorkspaceTree();

    const result = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['all'] },
      tree,
    );
    const content = result.readContent('/src/styles.scss');

    const ourUseIndex = content.indexOf("@use '@ngm-dev/mat-exp'");
    const ourIncludeIndex = content.indexOf('mat-exp.mat-exp-all-styles()');
    const existingUseIndex = content.indexOf("@use '@angular/material'");
    const existingRuleIndex = content.indexOf('height: 100%');

    expect(ourUseIndex).toBeGreaterThanOrEqual(0);
    expect(ourIncludeIndex).toBeGreaterThan(ourUseIndex);

    // The new `@use` must land before every other rule in the file.
    expect(ourUseIndex).toBeLessThan(existingRuleIndex);
    expect(ourIncludeIndex).toBeLessThan(existingRuleIndex);

    // The pre-existing `@use '@angular/material'` must still precede every other rule too —
    // i.e. inserting our block must not have pushed it below a non-`@use` rule.
    expect(existingUseIndex).toBeGreaterThanOrEqual(0);
    expect(existingUseIndex).toBeLessThan(existingRuleIndex);
  });

  it('inserts at the very top when the stylesheet has no leading @use statements', async () => {
    const tree = createWorkspaceTree({ stylesheet: 'body {\n  margin: 0;\n}\n' });

    const result = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['all'] },
      tree,
    );
    const content = result.readContent('/src/styles.scss');

    expect(content.indexOf("@use '@ngm-dev/mat-exp'")).toBe(0);
  });

  it('is idempotent when the stylesheet already references the package', async () => {
    const tree = createWorkspaceTree();

    const first = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['all'] },
      tree,
    );
    const second = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['all'] },
      first,
    );
    const content = second.readContent('/src/styles.scss');
    const occurrences = content.split('@ngm-dev/mat-exp').length - 1;

    expect(occurrences).toBe(1);
  });

  it('throws with an actionable message when @angular/material is missing', async () => {
    const tree = createWorkspaceTree({ hasMaterial: false });

    await expect(runner.runSchematic('ng-add', {}, tree)).rejects.toThrow(/angular\/material/i);
  });

  it('throws for missing @angular/material regardless of configureStyles/components options', async () => {
    const tree = createWorkspaceTree({ hasMaterial: false });

    await expect(
      runner.runSchematic('ng-add', { configureStyles: false, components: ['button'] }, tree),
    ).rejects.toThrow(/angular\/material/i);
  });

  it('prints a pointer to the getting-started docs on completion', async () => {
    const tree = createWorkspaceTree();

    const infoMessages: string[] = [];
    runner.logger.subscribe((entry) => {
      if (entry.level === 'info') {
        infoMessages.push(entry.message);
      }
    });

    await runner.runSchematic('ng-add', { configureStyles: true, components: ['all'] }, tree);

    expect(infoMessages.some((message) => message.includes('getting-started'))).toBe(true);
  });

  it('leaves the stylesheet and angular.json untouched when configureStyles is declined, but still prints the docs link', async () => {
    const tree = createWorkspaceTree();
    const originalStyles = tree.read('/src/styles.scss')?.toString('utf-8');
    const originalAngularJson = tree.read('/angular.json')?.toString('utf-8');

    const infoMessages: string[] = [];
    runner.logger.subscribe((entry) => {
      if (entry.level === 'info') {
        infoMessages.push(entry.message);
      }
    });

    const result = await runner.runSchematic('ng-add', { configureStyles: false }, tree);

    expect(result.readContent('/src/styles.scss')).toBe(originalStyles);
    expect(result.readContent('/angular.json')).toBe(originalAngularJson);
    expect(infoMessages.some((message) => message.includes('getting-started'))).toBe(true);
  });

  it('adds the prebuilt CSS as the first "styles" entry in angular.json for a CSS project, leaving the CSS file untouched, and is idempotent', async () => {
    const tree = createWorkspaceTree({ flavor: 'css' });
    const originalCss = tree.read('/src/styles.css')?.toString('utf-8');

    const first = await runner.runSchematic('ng-add', { configureStyles: true }, tree);
    const angularJson = JSON.parse(first.readContent('/angular.json'));
    const styles: string[] = angularJson.projects.demo.architect.build.options.styles;

    expect(styles[0]).toBe('@ngm-dev/mat-exp/styles.css');
    expect(first.readContent('/src/styles.css')).toBe(originalCss);

    const second = await runner.runSchematic('ng-add', { configureStyles: true }, first);
    const angularJson2 = JSON.parse(second.readContent('/angular.json'));
    const styles2: string[] = angularJson2.projects.demo.architect.build.options.styles;
    const occurrences = styles2.filter((entry) => entry === '@ngm-dev/mat-exp/styles.css').length;

    expect(occurrences).toBe(1);
    expect(styles2[0]).toBe('@ngm-dev/mat-exp/styles.css');
  });

  it('logs a note and ignores the "components" option for CSS projects', async () => {
    const tree = createWorkspaceTree({ flavor: 'css' });

    const infoMessages: string[] = [];
    runner.logger.subscribe((entry) => {
      if (entry.level === 'info') {
        infoMessages.push(entry.message);
      }
    });

    await runner.runSchematic('ng-add', { configureStyles: true, components: ['button'] }, tree);

    expect(infoMessages.some((message) => message.includes('"components" option is ignored'))).toBe(
      true,
    );
  });

  it('emits only the selected component mixins (not all-styles) when components is a subset, and is idempotent', async () => {
    const tree = createWorkspaceTree();

    const first = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['button', 'icon-button'] },
      tree,
    );
    const content = first.readContent('/src/styles.scss');

    expect(content.split("@use '@ngm-dev/mat-exp'").length - 1).toBe(1);
    expect(content).toContain('@include mat-exp.mat-exp-button-styles();');
    expect(content).toContain('@include mat-exp.mat-exp-icon-button-styles();');
    expect(content).not.toContain('mat-exp-all-styles()');
    expect(content).not.toContain('mat-exp-button-group-styles()');

    const second = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['button', 'icon-button'] },
      first,
    );
    const secondContent = second.readContent('/src/styles.scss');

    expect(secondContent.split("@use '@ngm-dev/mat-exp'").length - 1).toBe(1);
  });

  it('splits a comma-joined single array entry (CLI --components=a,b collapse) the same as separate entries', async () => {
    const tree = createWorkspaceTree();

    const result = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['button,icon-button'] },
      tree,
    );
    const content = result.readContent('/src/styles.scss');

    expect(content).toContain('@include mat-exp.mat-exp-button-styles();');
    expect(content).toContain('@include mat-exp.mat-exp-icon-button-styles();');
    expect(content).not.toContain('mat-exp-all-styles()');
  });

  it('warns and falls back to "all" when components contains unknown keys, keeping any valid keys given', async () => {
    const tree = createWorkspaceTree();

    const warnMessages: string[] = [];
    runner.logger.subscribe((entry) => {
      if (entry.level === 'warn') {
        warnMessages.push(entry.message);
      }
    });

    const result = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['button', 'not-a-real-component'] },
      tree,
    );
    const content = result.readContent('/src/styles.scss');

    expect(warnMessages.some((message) => message.includes('not-a-real-component'))).toBe(true);
    expect(content).toContain('@include mat-exp.mat-exp-button-styles();');
    expect(content).not.toContain('mat-exp-all-styles()');
  });

  it('falls back to "all" when every given component key is unknown', async () => {
    const tree = createWorkspaceTree();

    const result = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['totally-bogus'] },
      tree,
    );
    const content = result.readContent('/src/styles.scss');

    expect(content).toContain('@include mat-exp.mat-exp-all-styles();');
  });

  it('emits mat-exp-all-styles() when components is "all" (unchanged existing behavior), and is idempotent', async () => {
    const tree = createWorkspaceTree();

    const first = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['all'] },
      tree,
    );
    const content = first.readContent('/src/styles.scss');

    expect(content).toContain('@include mat-exp.mat-exp-all-styles();');

    const second = await runner.runSchematic(
      'ng-add',
      { configureStyles: true, components: ['all'] },
      first,
    );
    const occurrences = second.readContent('/src/styles.scss').split('@ngm-dev/mat-exp').length - 1;

    expect(occurrences).toBe(1);
  });

  it('resolves omitted options to their documented defaults instead of prompting', async () => {
    const tree = createWorkspaceTree();

    // `SchematicTestRunner` applies `schema.json`'s property-level `default`s the same way the
    // real Angular CLI does, so an omitted `components` resolves to the explicit all-components
    // array (`schema.json`'s default — kept in sync with every key so the interactive picker
    // starts fully checked), not the `'all'` sentinel. Both produce identical styles, since
    // `mat-exp-all-styles()` is defined as exactly the union of every individual component mixin.
    const result = await runner.runSchematic('ng-add', {}, tree);
    const content = result.readContent('/src/styles.scss');

    expect(content).toContain('@include mat-exp.mat-exp-button-styles();');
    expect(content).toContain('@include mat-exp.mat-exp-fab-menu-trigger-styles();');
  });

  it('mentions both the SCSS snippet and the CSS styles.css alternative when no global stylesheet is found', async () => {
    const tree = createWorkspaceTree({ stylesArray: ['src/styles.other'] });

    const warnMessages: string[] = [];
    runner.logger.subscribe((entry) => {
      if (entry.level === 'warn') {
        warnMessages.push(entry.message);
      }
    });

    await runner.runSchematic('ng-add', { configureStyles: true }, tree);

    const warning = warnMessages.find((message) => message.includes('could not automatically'));
    expect(warning).toBeDefined();
    expect(warning).toContain("@use '@ngm-dev/mat-exp'");
    expect(warning).toContain('@ngm-dev/mat-exp/styles.css');
  });
});
