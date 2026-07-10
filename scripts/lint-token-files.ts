/**
 * Lint script: asserts that every size variant of a Button-Family
 * component's design tokens defines the same set of appearance-prefixed
 * token keys.
 *
 * Usage: tsx scripts/lint-token-files.ts
 *
 * Why this exists (see issue #139):
 * Each Button-Family component's `tokens/_*.scss` file hand-transcribes M3
 * Expressive spec values per appearance (filled/outlined/tonal/elevated/
 * text/protected) and size (xs/s/m/l/xl). Nothing checked that every size
 * defines the same set of token keys per appearance prefix — a missed row
 * during transcription (e.g. forgetting `outlined-icon-spacing` for one
 * size) failed silently rather than at build time.
 *
 * What this script does:
 *  1. Discovers every Button-Family component under
 *     `projects/ngm-dev/mat-expressive/src/lib/styles/components/all-buttons/*\/tokens/`
 *     that splits its tokens across per-size partials (`_xs.scss`, `_s.scss`,
 *     `_m.scss`, `_l.scss`, `_xl.scss`).
 *  2. For each size partial, parses every top-level SCSS variable whose name
 *     is (or ends with) `tokens` — e.g. `$tokens`, `$toggle-selected-tokens`,
 *     `$appearance-filled-tokens` — and extracts the map keys nested inside
 *     it whose first hyphen-delimited segment is one of the M3 Expressive
 *     appearance prefixes: `filled-`, `outlined-`, `tonal-`, `elevated-`,
 *     `text-`, `protected-`.
 *
 *     `$properties` maps are intentionally excluded: they are keyed by raw
 *     CSS property/selector names (e.g. `text-align`), which collide with
 *     the appearance-prefix vocabulary and are not the hand-transcribed
 *     design-token values this check is about.
 *  3. For each component + appearance prefix, compares the extracted key
 *     set across all of that component's size files and reports any key
 *     that is present in some sizes but missing from others, with the
 *     offending file path(s) and key name.
 *
 * This is a plain regex/line-based scan (no SCSS AST dependency exists in
 * this repo — see `scripts/generate-style-constants.ts` for the same
 * approach applied to a different consistency check), scoped to this
 * repo's consistent one-key-per-line map formatting.
 *
 * Exits non-zero if any inconsistency is found (so it can be wired into CI
 * / lint-staged later); exits 0 if every component's size files agree.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ALL_BUTTONS_ROOT = path.resolve(
  process.cwd(),
  'projects/ngm-dev/mat-expressive/src/lib/styles/components/all-buttons',
);

/** M3 Expressive appearance prefixes checked per the issue's scope. */
const APPEARANCES = ['filled', 'outlined', 'tonal', 'elevated', 'text', 'protected'] as const;
type Appearance = (typeof APPEARANCES)[number];

/** Button-Family size partials, in the order sizes are conventionally listed. */
const SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;
type Size = (typeof SIZES)[number];

interface KeyOccurrence {
  appearance: Appearance;
  key: string;
}

interface Inconsistency {
  component: string;
  appearance: Appearance;
  key: string;
  presentIn: Size[];
  missingFrom: Size[];
}

/** Strips `//` and `/* *\/` comments so they can't be mistaken for map entries. */
function stripComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/**
 * Splits `content` into the RHS source text of each top-level (column 0)
 * `$variable: ...;` declaration, keyed by variable name. Later
 * declarations of the same name (there are none in practice, but be safe)
 * are kept as separate slices and merged by the caller.
 */
function splitTopLevelDeclarations(content: string): { name: string; body: string }[] {
  const declRegex = /^\$([a-zA-Z][\w-]*)\s*:/gm;
  const matches = Array.from(content.matchAll(declRegex));

  return matches.map((match, index) => {
    const name = match[1];
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd =
      index + 1 < matches.length ? (matches[index + 1].index ?? content.length) : content.length;
    return { name, body: content.slice(bodyStart, bodyEnd) };
  });
}

/**
 * Extracts `(appearance, key)` pairs from the body of a `*-tokens` map
 * declaration. Only matches identifiers that begin a "word" (preceded by
 * start-of-slice, whitespace, `,`, or `(`) so that e.g. the `text` inside
 * `label-text-color:` is never mistaken for the `text-` appearance prefix.
 */
function extractAppearanceKeys(body: string): KeyOccurrence[] {
  const keyRegex = /(?:^|[\s,(])([a-zA-Z][\w-]*)\s*:/gm;
  const occurrences: KeyOccurrence[] = [];

  for (const match of body.matchAll(keyRegex)) {
    const identifier = match[1];
    const segments = identifier.split('-');
    const [first, ...rest] = segments;
    if (rest.length === 0) continue;
    if (!(APPEARANCES as readonly string[]).includes(first)) continue;

    occurrences.push({ appearance: first as Appearance, key: rest.join('-') });
  }

  return occurrences;
}

/** Returns true for variable names that hold a design-token map (`$tokens`, `$appearance-filled-tokens`, ...). */
function isTokensVariable(name: string): boolean {
  return name === 'tokens' || name.endsWith('-tokens');
}

/** Parses one size partial into a map of appearance -> set of token keys found in it. */
function parseSizeFile(filePath: string): Map<Appearance, Set<string>> {
  const content = stripComments(fs.readFileSync(filePath, 'utf-8'));
  const declarations = splitTopLevelDeclarations(content);

  const result = new Map<Appearance, Set<string>>();
  for (const { name, body } of declarations) {
    if (!isTokensVariable(name)) continue;

    for (const { appearance, key } of extractAppearanceKeys(body)) {
      if (!result.has(appearance)) result.set(appearance, new Set());
      result.get(appearance)!.add(key);
    }
  }

  return result;
}

interface ComponentResult {
  component: string;
  sizesFound: Size[];
  inconsistencies: Inconsistency[];
}

/** Discovers Button-Family component directories with a `tokens/` subdirectory. */
function discoverComponents(root: string): string[] {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(root, name, 'tokens')))
    .sort();
}

/** Locates which of the standard size partials exist for a component. */
function discoverSizeFiles(componentDir: string): Map<Size, string> {
  const tokensDir = path.join(componentDir, 'tokens');
  const found = new Map<Size, string>();
  for (const size of SIZES) {
    const filePath = path.join(tokensDir, `_${size}.scss`);
    if (fs.existsSync(filePath)) {
      found.set(size, filePath);
    }
  }
  return found;
}

function checkComponent(component: string, componentDir: string): ComponentResult {
  const sizeFiles = discoverSizeFiles(componentDir);
  const sizesFound = SIZES.filter((size) => sizeFiles.has(size));

  if (sizesFound.length < 2) {
    // Nothing to compare across sizes for this component.
    return { component, sizesFound, inconsistencies: [] };
  }

  const perSize = new Map<Size, Map<Appearance, Set<string>>>();
  for (const size of sizesFound) {
    perSize.set(size, parseSizeFile(sizeFiles.get(size)!));
  }

  // Every appearance prefix seen in at least one size for this component.
  const appearancesSeen = new Set<Appearance>();
  for (const sizeMap of perSize.values()) {
    for (const appearance of sizeMap.keys()) appearancesSeen.add(appearance);
  }

  const inconsistencies: Inconsistency[] = [];
  for (const appearance of appearancesSeen) {
    // key -> sizes that define it
    const keyToSizes = new Map<string, Set<Size>>();
    for (const size of sizesFound) {
      const keys = perSize.get(size)!.get(appearance) ?? new Set<string>();
      for (const key of keys) {
        if (!keyToSizes.has(key)) keyToSizes.set(key, new Set());
        keyToSizes.get(key)!.add(size);
      }
    }

    for (const [key, presentSizes] of Array.from(keyToSizes.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      if (presentSizes.size === sizesFound.length) continue; // defined in every size — consistent.

      inconsistencies.push({
        component,
        appearance,
        key,
        presentIn: sizesFound.filter((size) => presentSizes.has(size)),
        missingFrom: sizesFound.filter((size) => !presentSizes.has(size)),
      });
    }
  }

  return { component, sizesFound, inconsistencies };
}

function formatReport(results: ComponentResult[]): string {
  const lines: string[] = [];
  let totalIssues = 0;

  for (const result of results) {
    lines.push(`Component: ${result.component}`);

    if (result.sizesFound.length < 2) {
      lines.push(
        `  (skipped — ${result.sizesFound.length} size partial(s) found under tokens/, nothing to compare)`,
      );
      lines.push('');
      continue;
    }

    lines.push(`  Sizes checked: ${result.sizesFound.join(', ')}`);

    if (result.inconsistencies.length === 0) {
      lines.push(
        '  OK — every appearance-prefixed token key is defined consistently across all sizes.',
      );
      lines.push('');
      continue;
    }

    for (const issue of result.inconsistencies) {
      totalIssues++;
      lines.push(
        `  FAIL [${issue.appearance}-${issue.key}]: present in [${issue.presentIn.join(', ')}], ` +
          `missing from [${issue.missingFrom.join(', ')}]`,
      );
      for (const size of issue.missingFrom) {
        const componentDir = path.join(ALL_BUTTONS_ROOT, result.component);
        const filePath = path.relative(
          process.cwd(),
          path.join(componentDir, 'tokens', `_${size}.scss`),
        );
        lines.push(`    - ${filePath}: missing "${issue.appearance}-${issue.key}"`);
      }
    }
    lines.push('');
  }

  lines.push(
    totalIssues === 0
      ? 'PASS: all Button-Family components define consistent per-size token key sets.'
      : `FAIL: ${totalIssues} inconsistenc${totalIssues === 1 ? 'y' : 'ies'} found. See details above.`,
  );

  return lines.join('\n');
}

function main(): void {
  if (!fs.existsSync(ALL_BUTTONS_ROOT)) {
    console.error(`scripts/lint-token-files.ts: root directory not found: ${ALL_BUTTONS_ROOT}`);
    process.exit(1);
  }

  const components = discoverComponents(ALL_BUTTONS_ROOT);
  const results = components.map((component) =>
    checkComponent(component, path.join(ALL_BUTTONS_ROOT, component)),
  );

  console.log(formatReport(results));

  const hasIssues = results.some((result) => result.inconsistencies.length > 0);
  process.exit(hasIssues ? 1 : 0);
}

main();
