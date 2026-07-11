/**
 * Generator: `npm run new:component`
 *
 * Scaffolds a new library component following the manual checklist in
 * `docs/ai-handoff/COMPONENT-FACTORY.md` (§0-§6): options file, directive or
 * component skeleton, index barrels, SCSS mixin directory (Button-Family
 * path only), three docs markdown files, and a playground preview + page
 * wrapper — wired into both playground registries.
 *
 * Usage:
 *   npm run new:component -- --name=chip --group=all-buttons --class=family --selector=directive
 *   npm run new:component            # interactive prompts for any missing answer
 *
 * Flags:
 *   --name=<kebab>          Component name, kebab-case (e.g. "chip"). Required.
 *   --group=<kebab>         Library component group directory (e.g. "all-buttons"). Required.
 *   --class=family|standalone   Styling class — see COMPONENT-FACTORY.md §0. Required.
 *   --selector=directive|component  Family path only. Default: directive.
 *   --overridesFn=<kebab>   Family path only. Angular Material `mat.<x>-overrides()` mixin
 *                            name suffix to reference (commented out; verify it exists before
 *                            uncommenting). Default: same as --name.
 *   --title=<Title Case>    Docs frontmatter title. Default: derived from --name.
 *   --order=<number>        Docs frontmatter order. Default: 99 (sorts last).
 *   --force                 Overwrite existing files instead of failing.
 *   --dry-run               Print the file list without writing anything.
 *   --yes                   Skip the interactive confirmation prompt.
 *
 * This is deterministic text substitution over the template files under
 * `scripts/templates/{family,standalone}/`; it does NOT transcribe M3 spec
 * token values (Button-Family SCSS ships with empty placeholder token maps —
 * see COMPONENT-FACTORY.md §3) and does NOT write unit tests (§4) or wire
 * e2e specs (§7). Every generated file carries `TODO` markers for the
 * remaining manual work.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline/promises';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const TEMPLATES_ROOT = path.join(ROOT, 'scripts/templates');
const LIB_COMPONENTS_ROOT = path.join(ROOT, 'projects/ngm-dev/mat-expressive/src/lib/components');
const LIB_STYLES_ALL_BUTTONS_ROOT = path.join(
  ROOT,
  'projects/ngm-dev/mat-expressive/src/lib/styles/components/all-buttons',
);
const LIB_STYLES_ROOT_INDEX = path.join(
  ROOT,
  'projects/ngm-dev/mat-expressive/src/lib/styles/_index.scss',
);
const DOCS_COMPONENTS_ROOT = path.join(ROOT, 'public/docs/components');
const APP_DOCS_COMPONENTS_ROOT = path.join(ROOT, 'src/app/docs/components');
const APP_PREVIEWS_ROOT = path.join(ROOT, 'src/app/shared/components/playground/previews');
const PLAYGROUND_REGISTRY_FILE = path.join(
  ROOT,
  'src/app/shared/components/playground/playground-registry.ts',
);
const PLAYGROUND_PAGE_REGISTRY_FILE = path.join(ROOT, 'src/app/docs/playground-page-registry.ts');

const SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

const KEBAB_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function assertKebab(value: string, label: string): void {
  if (!KEBAB_RE.test(value)) {
    throw new Error(`${label} must be kebab-case (e.g. "loading-indicator"), got "${value}"`);
  }
}

function toPascal(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamel(kebab: string): string {
  const pascal = toPascal(kebab);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toTitle(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toConst(kebab: string): string {
  return kebab.toUpperCase().replace(/-/g, '_');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StylingClass = 'family' | 'standalone';
type SelectorType = 'directive' | 'component';

interface Answers {
  kebab: string;
  group: string;
  stylingClass: StylingClass;
  selectorType: SelectorType;
  overridesFn: string;
  title: string;
  order: number;
  force: boolean;
  dryRun: boolean;
  yes: boolean;
}

// ---------------------------------------------------------------------------
// CLI arg parsing + prompts
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Map<string, string | boolean> {
  const args = new Map<string, string | boolean>();
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const body = raw.slice(2);
    const eq = body.indexOf('=');
    if (eq === -1) {
      args.set(body, true);
    } else {
      args.set(body.slice(0, eq), body.slice(eq + 1));
    }
  }
  return args;
}

async function promptFor(
  rl: readline.Interface,
  question: string,
  options?: { choices?: readonly string[]; default?: string },
): Promise<string> {
  const suffix = options?.default ? ` (${options.default})` : '';
  for (;;) {
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    const value = answer || options?.default || '';
    if (!value) {
      console.log('  A value is required.');
      continue;
    }
    if (options?.choices && !options.choices.includes(value)) {
      console.log(`  Must be one of: ${options.choices.join(', ')}`);
      continue;
    }
    return value;
  }
}

async function collectAnswers(): Promise<Answers> {
  const args = parseArgs(process.argv.slice(2));
  const getStr = (key: string): string | undefined => {
    const v = args.get(key);
    return typeof v === 'string' ? v : undefined;
  };
  const getBool = (key: string): boolean => args.get(key) === true || args.get(key) === 'true';

  let kebab = getStr('name');
  let group = getStr('group');
  let stylingClass = getStr('class') as StylingClass | undefined;
  let selectorType = getStr('selector') as SelectorType | undefined;
  const overridesFn = getStr('overridesFn');
  const title = getStr('title');
  const orderStr = getStr('order');

  const needsPrompt = !kebab || !group || !stylingClass;
  if (needsPrompt) {
    if (!process.stdin.isTTY) {
      const missing = [
        !kebab && '--name',
        !group && '--group',
        !stylingClass && '--class=family|standalone',
      ]
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `Missing required flag(s) in a non-interactive shell: ${missing}. ` +
          `Run "npm run new:component -- --name=<kebab> --group=<kebab> --class=family|standalone" ` +
          `or run interactively from a TTY.`,
      );
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      kebab ??= await promptFor(rl, 'Component name (kebab-case, e.g. "chip")');
      group ??= await promptFor(rl, 'Component group directory (kebab-case, e.g. "all-buttons")');
      stylingClass ??= (await promptFor(
        rl,
        'Styling class — does this share the Button-Family size/shape/state/toggle token system? (family/standalone)',
        { choices: ['family', 'standalone'], default: 'family' },
      )) as StylingClass;
      if (stylingClass === 'family' && !selectorType) {
        selectorType = (await promptFor(
          rl,
          'Directive on an existing Material host, or Component composing several? (directive/component)',
          { choices: ['directive', 'component'], default: 'directive' },
        )) as SelectorType;
      }
    } finally {
      rl.close();
    }
  }

  assertKebab(kebab!, '--name');
  assertKebab(group!, '--group');
  if (stylingClass !== 'family' && stylingClass !== 'standalone') {
    throw new Error(`--class must be "family" or "standalone", got "${stylingClass}"`);
  }
  if (stylingClass === 'family') {
    selectorType ??= 'directive';
    if (selectorType !== 'directive' && selectorType !== 'component') {
      throw new Error(`--selector must be "directive" or "component", got "${selectorType}"`);
    }
  } else {
    selectorType = 'component';
  }

  return {
    kebab: kebab!,
    group: group!,
    stylingClass,
    selectorType,
    overridesFn: overridesFn ?? kebab!,
    title: title ?? toTitle(kebab!),
    order: orderStr ? Number(orderStr) : 99,
    force: getBool('force'),
    dryRun: getBool('dry-run'),
    yes: getBool('yes'),
  };
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

/**
 * Renders a template by replacing every `__KEY__` token with `vars[KEY]`,
 * longest keys first so e.g. `__CONST__` inside `__CONST___DEFAULT_OPTIONS`
 * (a placeholder immediately followed by a literal `_DEFAULT_OPTIONS`)
 * resolves correctly via plain substring replacement rather than a greedy
 * regex that would swallow the adjoining underscores.
 */
function render(template: string, vars: Record<string, string>): string {
  let out = template;
  const keys = Object.keys(vars).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    out = out.split(`__${key}__`).join(vars[key]);
  }
  const leftover = out.match(/__[A-Z][A-Z0-9_]*__/g);
  if (leftover) {
    throw new Error(
      `Unresolved template placeholder(s): ${[...new Set(leftover)].join(', ')}. ` +
        `Add them to the vars map in scripts/new-component.ts.`,
    );
  }
  return out;
}

function readTemplate(...segments: string[]): string {
  return fs.readFileSync(path.join(TEMPLATES_ROOT, ...segments), 'utf-8');
}

// ---------------------------------------------------------------------------
// File-system helpers
// ---------------------------------------------------------------------------

const createdFiles: string[] = [];
const updatedFiles: string[] = [];

function writeFile(filePath: string, content: string, force: boolean, dryRun: boolean): void {
  const rel = path.relative(ROOT, filePath);
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`Refusing to overwrite existing file: ${rel} (pass --force to overwrite)`);
  }
  if (dryRun) {
    console.log(`  [dry-run] would create ${rel}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  createdFiles.push(rel);
  console.log(`  created ${rel}`);
}

/** Appends `line` to the file if not already present; creates the file (with `header` first) if missing. */
function ensureLine(filePath: string, line: string, header: string[], dryRun: boolean): void {
  const rel = path.relative(ROOT, filePath);
  const exists = fs.existsSync(filePath);
  const existing = exists ? fs.readFileSync(filePath, 'utf-8') : '';
  if (existing.includes(line)) {
    return;
  }
  if (dryRun) {
    console.log(`  [dry-run] would ${exists ? 'update' : 'create'} ${rel}`);
    return;
  }
  const body = exists ? existing : header.length ? header.join('\n') + '\n' : '';
  const needsNewline = body.length > 0 && !body.endsWith('\n');
  const updated = `${body}${needsNewline ? '\n' : ''}${line}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, updated, 'utf-8');
  if (exists) {
    updatedFiles.push(rel);
    console.log(`  updated ${rel}`);
  } else {
    createdFiles.push(rel);
    console.log(`  created ${rel}`);
  }
}

/**
 * Inserts `content` as a new line immediately before the (first) line
 * containing `marker`, reusing that line's leading indentation. Line-based
 * (not a raw string `replace`) so it can't swallow the newline that
 * separates the previous line from the marker, and can't accumulate
 * indentation across repeated runs. Idempotent — no-op if the resulting
 * line is already present.
 */
function insertAtMarker(filePath: string, marker: string, content: string, dryRun: boolean): void {
  const rel = path.relative(ROOT, filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');
  const idx = lines.findIndex((l) => l.includes(marker));
  if (idx === -1) {
    throw new Error(`Marker "${marker}" not found in ${rel} — was it removed?`);
  }
  const indent = lines[idx].match(/^\s*/)?.[0] ?? '';
  const newLine = `${indent}${content}`;
  if (raw.includes(newLine)) {
    return;
  }
  if (dryRun) {
    console.log(`  [dry-run] would update ${rel} (insert at marker)`);
    return;
  }
  lines.splice(idx, 0, newLine);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  updatedFiles.push(rel);
  console.log(`  updated ${rel} (inserted at marker)`);
}

/**
 * Inserts `line` immediately after the last line matching `pattern`.
 * Line-based for the same reason as {@link insertAtMarker}. Used for the
 * two SCSS wiring points, which have no permanent marker comment (the anchor
 * is structural: the last `@use` / `@include` / `@forward` line).
 */
function insertAfterLastMatch(
  filePath: string,
  pattern: RegExp,
  line: string,
  dryRun: boolean,
): void {
  const rel = path.relative(ROOT, filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  if (raw.includes(line)) {
    return;
  }
  const lines = raw.split('\n');
  let lastIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) lastIdx = i;
  }
  if (lastIdx === -1) {
    throw new Error(`No line matching ${pattern} found in ${rel}`);
  }
  if (dryRun) {
    console.log(`  [dry-run] would update ${rel}`);
    return;
  }
  lines.splice(lastIdx + 1, 0, line);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  updatedFiles.push(rel);
  console.log(`  updated ${rel}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const answers = await collectAnswers();
  const { kebab, group, stylingClass, selectorType, overridesFn, title, order, force, dryRun } =
    answers;

  const vars: Record<string, string> = {
    KEBAB: kebab,
    GROUP: group,
    PASCAL: toPascal(kebab),
    CAMEL: toCamel(kebab),
    TITLE: title,
    TITLE_LOWER: title.toLowerCase(),
    CLASS: `MatExpressive${toPascal(kebab)}`,
    CONST: `MAT_EXPRESSIVE_${toConst(kebab)}`,
    SELECTOR_ATTR: `matExpressive${toPascal(kebab)}`,
    SELECTOR_EL: `mat-expressive-${kebab}`,
    HOST_CLASS: `mat-expressive-${kebab}`,
    OVERRIDES_FN: overridesFn,
    ORDER: String(order),
    GROUP_TITLE: toTitle(group),
  };

  if (!answers.yes && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(
      `\nAbout to generate "${vars.CLASS}" (${stylingClass}${
        stylingClass === 'family' ? `, ${selectorType}` : ''
      }) in group "${group}".`,
    );
    const confirm = await rl.question('Continue? (Y/n): ');
    rl.close();
    if (confirm.trim().toLowerCase().startsWith('n')) {
      console.log('Aborted.');
      return;
    }
  }

  console.log(`\nGenerating ${vars.CLASS}...\n`);

  // -- Library component ------------------------------------------------
  const componentDir = path.join(LIB_COMPONENTS_ROOT, group, kebab);
  const templateFamily = stylingClass === 'family' ? 'family' : 'standalone';

  const optionsTemplate = readTemplate(templateFamily, 'component', 'component.options.ts.tmpl');
  writeFile(
    path.join(componentDir, `${kebab}.options.ts`),
    render(optionsTemplate, vars),
    force,
    dryRun,
  );

  if (stylingClass === 'family') {
    const tsTemplateName = selectorType === 'directive' ? 'directive.ts.tmpl' : 'component.ts.tmpl';
    const tsTemplate = readTemplate('family', 'component', tsTemplateName);
    writeFile(path.join(componentDir, `${kebab}.ts`), render(tsTemplate, vars), force, dryRun);
    if (selectorType === 'component') {
      writeFile(
        path.join(componentDir, `${kebab}.html`),
        render(readTemplate('family', 'component', 'component.html.tmpl'), vars),
        force,
        dryRun,
      );
      writeFile(
        path.join(componentDir, `${kebab}.scss`),
        render(readTemplate('family', 'component', 'component.scss.tmpl'), vars),
        force,
        dryRun,
      );
    }
  } else {
    writeFile(
      path.join(componentDir, `${kebab}.ts`),
      render(readTemplate('standalone', 'component', 'component.ts.tmpl'), vars),
      force,
      dryRun,
    );
    writeFile(
      path.join(componentDir, `${kebab}.html`),
      render(readTemplate('standalone', 'component', 'component.html.tmpl'), vars),
      force,
      dryRun,
    );
    writeFile(
      path.join(componentDir, `${kebab}.scss`),
      render(readTemplate('standalone', 'component', 'component.scss.tmpl'), vars),
      force,
      dryRun,
    );
  }

  writeFile(
    path.join(componentDir, 'index.ts'),
    render(readTemplate(templateFamily, 'component', 'index.ts.tmpl'), vars),
    force,
    dryRun,
  );

  // -- Barrels ------------------------------------------------------------
  const groupIndexPath = path.join(LIB_COMPONENTS_ROOT, group, 'index.ts');
  const isNewGroup = !fs.existsSync(groupIndexPath);
  ensureLine(groupIndexPath, `export * from './${kebab}';`, [], dryRun);
  if (isNewGroup) {
    const rootComponentsIndex = path.join(LIB_COMPONENTS_ROOT, 'index.ts');
    ensureLine(rootComponentsIndex, `export * from './${group}';`, [], dryRun);
  }

  // -- SCSS (family path only) --------------------------------------------
  if (stylingClass === 'family') {
    const scssDir = path.join(LIB_STYLES_ALL_BUTTONS_ROOT, kebab);
    writeFile(
      path.join(scssDir, '_index.scss'),
      render(readTemplate('family', 'styles', '_index.scss.tmpl'), vars),
      force,
      dryRun,
    );
    writeFile(
      path.join(scssDir, '_config.scss'),
      render(readTemplate('family', 'styles', '_config.scss.tmpl'), vars),
      force,
      dryRun,
    );
    writeFile(
      path.join(scssDir, 'configs', '_index.scss'),
      render(readTemplate('family', 'styles', 'configs', '_index.scss.tmpl'), vars),
      force,
      dryRun,
    );
    writeFile(
      path.join(scssDir, 'configs', '_default.scss'),
      render(readTemplate('family', 'styles', 'configs', '_default.scss.tmpl'), vars),
      force,
      dryRun,
    );
    const sizeConfigTemplate = readTemplate('family', 'styles', 'configs', '_size.scss.tmpl');
    for (const size of SIZES) {
      writeFile(
        path.join(scssDir, 'configs', `_${size}.scss`),
        render(sizeConfigTemplate, { ...vars, SIZE: size }),
        force,
        dryRun,
      );
    }
    writeFile(
      path.join(scssDir, 'tokens', '_index.scss'),
      render(readTemplate('family', 'styles', 'tokens', '_index.scss.tmpl'), vars),
      force,
      dryRun,
    );
    writeFile(
      path.join(scssDir, 'tokens', '_common.scss'),
      render(readTemplate('family', 'styles', 'tokens', '_common.scss.tmpl'), vars),
      force,
      dryRun,
    );
    const sizeTokensTemplate = readTemplate('family', 'styles', 'tokens', '_size.scss.tmpl');
    for (const size of SIZES) {
      writeFile(
        path.join(scssDir, 'tokens', `_${size}.scss`),
        render(sizeTokensTemplate, { ...vars, SIZE: size }),
        force,
        dryRun,
      );
    }

    // Wire into components/all-buttons/_index.scss and the top-level styles/_index.scss.
    if (!dryRun) {
      const allButtonsIndexScss = path.join(LIB_STYLES_ALL_BUTTONS_ROOT, '_index.scss');
      insertAfterLastMatch(allButtonsIndexScss, /^@use '\.\//, `@use './${kebab}';`, dryRun);
      insertAfterLastMatch(
        allButtonsIndexScss,
        /^\s*@include .+-styles\(\$options\);$/,
        `  @include ${kebab}.mat-expressive-${kebab}-styles($options);`,
        dryRun,
      );
      insertAfterLastMatch(
        LIB_STYLES_ROOT_INDEX,
        /^@forward '\.\/components\/all-buttons\//,
        `@forward './components/all-buttons/${kebab}/';`,
        dryRun,
      );
    } else {
      console.log(
        `  [dry-run] would wire ${kebab} into components/all-buttons/_index.scss and styles/_index.scss`,
      );
    }
  }

  // -- Docs markdown --------------------------------------------------------
  const docsDir = path.join(DOCS_COMPONENTS_ROOT, group, kebab);
  writeFile(
    path.join(docsDir, 'index.md'),
    render(readTemplate(templateFamily, 'docs', 'index.md.tmpl'), vars),
    force,
    dryRun,
  );
  writeFile(
    path.join(docsDir, 'api.md'),
    render(readTemplate(templateFamily, 'docs', 'api.md.tmpl'), vars),
    force,
    dryRun,
  );
  writeFile(
    path.join(docsDir, 'styling.md'),
    render(readTemplate(templateFamily, 'docs', 'styling.md.tmpl'), vars),
    force,
    dryRun,
  );

  const groupDocsIndexPath = path.join(DOCS_COMPONENTS_ROOT, group, 'index.md');
  if (!fs.existsSync(groupDocsIndexPath)) {
    writeFile(
      groupDocsIndexPath,
      render(readTemplate('shared', 'group-index.md.tmpl'), vars),
      force,
      dryRun,
    );
  }

  // -- Playground: preview + page wrapper, both registries -----------------
  writeFile(
    path.join(APP_PREVIEWS_ROOT, `${kebab}-preview.component.ts`),
    render(readTemplate(templateFamily, 'playground', 'preview.component.ts.tmpl'), vars),
    force,
    dryRun,
  );
  writeFile(
    path.join(APP_PREVIEWS_ROOT, `${kebab}-preview.component.html`),
    render(readTemplate(templateFamily, 'playground', 'preview.component.html.tmpl'), vars),
    force,
    dryRun,
  );
  writeFile(
    path.join(APP_PREVIEWS_ROOT, `${kebab}-preview.component.scss`),
    render(readTemplate(templateFamily, 'playground', 'preview.component.scss.tmpl'), vars),
    force,
    dryRun,
  );

  const pageDir = path.join(APP_DOCS_COMPONENTS_ROOT, group, kebab, 'playground');
  writeFile(
    path.join(pageDir, `${kebab}-playground.component.ts`),
    render(readTemplate(templateFamily, 'playground', 'page.component.ts.tmpl'), vars),
    force,
    dryRun,
  );
  writeFile(
    path.join(pageDir, `${kebab}-playground.component.html`),
    render(readTemplate(templateFamily, 'playground', 'page.component.html.tmpl'), vars),
    force,
    dryRun,
  );

  if (!dryRun) {
    insertAtMarker(
      PLAYGROUND_REGISTRY_FILE,
      '// <generator:insert-import>',
      `import { ${vars.PASCAL}PreviewComponent } from './previews/${kebab}-preview.component';`,
      dryRun,
    );
    insertAtMarker(
      PLAYGROUND_REGISTRY_FILE,
      '// <generator:insert-entry>',
      `${vars.CLASS}: { previewComponent: ${vars.PASCAL}PreviewComponent },`,
      dryRun,
    );
    insertAtMarker(
      PLAYGROUND_PAGE_REGISTRY_FILE,
      '// <generator:insert-import>',
      `import { ${vars.PASCAL}PlaygroundComponent } from './components/${group}/${kebab}/playground/${kebab}-playground.component';`,
      dryRun,
    );
    insertAtMarker(
      PLAYGROUND_PAGE_REGISTRY_FILE,
      '// <generator:insert-entry>',
      `'/docs/components/${group}/${kebab}': ${vars.PASCAL}PlaygroundComponent,`,
      dryRun,
    );
  } else {
    console.log('  [dry-run] would wire PLAYGROUND_REGISTRY and PLAYGROUND_PAGE_REGISTRY');
  }

  // -- Summary --------------------------------------------------------------
  if (dryRun) {
    console.log('\nDry run — no files were written.');
    return;
  }

  console.log(
    `\n${vars.CLASS} scaffolded (${createdFiles.length} files created, ${updatedFiles.length} updated).`,
  );
  console.log(`\nRemaining manual steps (see docs/ai-handoff/COMPONENT-FACTORY.md):`);
  console.log(
    `  1. Wire the real Angular Material host in ${kebab}.ts (inject(), disabled/appearance accessors).`,
  );
  if (stylingClass === 'family') {
    console.log(
      `  2. Transcribe M3 spec token values into styles/components/all-buttons/${kebab}/tokens/*.scss`,
    );
    console.log(
      `     and uncomment the mat.${overridesFn}-overrides() calls in _index.scss once confirmed.`,
    );
  } else {
    console.log(`  2. Fill in ${kebab}.html / ${kebab}.scss and the real inputs on ${kebab}.ts.`);
  }
  console.log(
    `  3. Replace every TODO in the three docs markdown files under public/docs/components/${group}/${kebab}/`,
  );
  console.log(`     and compile every code snippet in a scratch app before committing.`);
  console.log(`  4. Write unit tests (COMPONENT-FACTORY.md §4) — none are generated.`);
  console.log(
    `  5. Run "npm run build:docs" to regenerate manifests, then "npm start" to check the Playground tab.`,
  );
  console.log(`  6. Add e2e coverage (COMPONENT-FACTORY.md §7) and an a11y pass.`);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

export { toPascal, toCamel, toTitle, toConst, render, KEBAB_RE };
