/**
 * Build script: scans public/docs/, generates nav-manifest.json and routes.txt.
 *
 * Usage: tsx scripts/build-docs.ts
 *
 * Folder classification:
 *   - Section     : contains subdirectories that themselves hold .md files
 *   - Component Page : contains index.md AND at least one of api.md / styling.md
 *   - Content Page   : contains only index.md (and no subdirectories with .md content)
 *
 * Section folders without an index.md of their own are labelled from their
 * directory name (kebab → Title Case) and ordered last (order = Infinity).
 *
 * For Component Pages the nav tree emits four child route entries:
 *   overview → /<slug>
 *   api      → /<slug>/api
 *   styling  → /<slug>/styling
 *   playground → /<slug>/playground
 *
 * Frontmatter `isHidden: true` on a directory's index.md excludes that page,
 * component, or entire section (including all descendants) from the nav tree
 * and routes.txt. `isHidden: true` on api.md / styling.md excludes just that
 * tab from a Component Page. A directory with no index.md has no frontmatter
 * source, so sections without an index.md cannot be hidden this way.
 *
 * Frontmatter is validated against KNOWN_FRONTMATTER_KEYS: title, order,
 * description, isHidden, designUrl, primarySymbol. An unrecognized key (e.g.
 * a typo) throws and fails the build instead of silently being ignored.
 *
 * Outputs:
 *   public/nav-manifest.json   – hierarchical + flat page list
 *   public/routes.txt          – one URL per line for prerender config
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { runMetadataExtraction } from './extract-metadata';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavPage {
  /** Display label in the sidebar. */
  label: string;
  /** URL path, e.g. "/components/all-buttons/button". */
  path: string;
  description?: string;
  order?: number;
  /**
   * Exported library symbol(s) this Component Page documents, e.g.
   * ["MatExpButton"] or ["MatExpFabMenu", "MatExpFabMenuTrigger"]. Drives the
   * Import Row's `import { ... } from '@ngm-dev/mat-exp';` statement. Only
   * set on Component Page nodes (isComponentPage: true); normalized from the
   * frontmatter's string-or-string[] `primarySymbol` field.
   */
  primarySymbol?: string[];
  /** True when this folder also contains api.md / styling.md. */
  isComponentPage?: boolean;
  /** True when this node is a pure navigation section (no content of its own). */
  isSection?: boolean;
  /** True when the section folder has its own index.md landing page. */
  hasIndexPage?: boolean;
  /** True when `path` is an external URL to open in a new tab, not an app route. */
  isExternal?: boolean;
  children?: NavPage[];
}

/**
 * Hand-authored external links injected into specific nav sections —
 * not derived from `public/docs/`, since they don't correspond to a
 * markdown page or app route.
 */
const EXTERNAL_NAV_LINKS: Record<string, NavPage[]> = {
  '/docs/getting-started': [{ label: 'llms.txt', path: '/llms.txt', isExternal: true }],
};

export interface NavManifest {
  /** Hierarchical nav tree for the sidebar. */
  nav: NavPage[];
  /**
   * Ordered flat list of all leaf pages (excluding section-only nodes).
   * Used for prev/next navigation.
   */
  pages: NavPage[];
  /**
   * Section paths without index.md mapped to the first navigable child by order.
   * Consumed by the docs app router guard.
   */
  sectionRedirects: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DOCS_ROOT = path.resolve(process.cwd(), 'public/docs');
const MANIFEST_OUT = path.resolve(process.cwd(), 'public/nav-manifest.json');
const ROUTES_OUT = path.resolve(process.cwd(), 'public/routes.txt');
const API_MANIFEST_OUT = path.resolve(process.cwd(), 'public/api-manifest.json');

const KIND_SEGMENT: Record<string, string> = {
  directive: 'directives',
  component: 'components',
  class: 'classes',
  interface: 'interfaces',
  type: 'types',
  function: 'functions',
  const: 'constants',
};

/** Convert a kebab-case directory name to Title Case. */
function kebabToTitle(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Frontmatter keys recognized anywhere in public/docs (index.md / api.md / styling.md). */
const KNOWN_FRONTMATTER_KEYS = new Set([
  'title',
  'order',
  'description',
  'isHidden',
  'designUrl',
  'primarySymbol',
]);

/** Throws if `fm` contains a key outside KNOWN_FRONTMATTER_KEYS (e.g. a typo). */
function validateFrontmatterKeys(filePath: string, fm: Record<string, unknown>): void {
  const unknown = Object.keys(fm).filter((key) => !KNOWN_FRONTMATTER_KEYS.has(key));
  if (unknown.length === 0) return;
  const rel = path.relative(process.cwd(), filePath);
  throw new Error(
    `Invalid frontmatter in ${rel}: unknown key(s) ${unknown.map((k) => `"${k}"`).join(', ')}.\n` +
      `Known keys: ${[...KNOWN_FRONTMATTER_KEYS].sort().join(', ')}.`,
  );
}

/** Read frontmatter from a .md file; returns empty object if file doesn't exist. */
function readFrontmatter(filePath: string): Record<string, unknown> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const fm = matter(content).data as Record<string, unknown>;
  validateFrontmatterKeys(filePath, fm);
  return fm;
}

/** Normalizes the `primarySymbol` frontmatter value (string or string[]) into a string[]. */
function parsePrimarySymbol(value: unknown): string[] | undefined {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value) && value.every((v): v is string => typeof v === 'string')) {
    return value.length > 0 ? value : undefined;
  }
  return undefined;
}

function compareNavOrder(a: NavPage, b: NavPage): number {
  const ao = a.order ?? Infinity;
  const bo = b.order ?? Infinity;
  if (ao !== bo) return ao - bo;
  return a.label.localeCompare(b.label);
}

/**
 * First URL a user should land on when a section has no index.md.
 * Walks nested sections without an index page until a leaf or indexed section is found.
 */
export function firstNavigableChildPath(node: NavPage): string | null {
  if (!node.children?.length) {
    return null;
  }

  const sorted = [...node.children].sort(compareNavOrder);

  for (const child of sorted) {
    if (child.isSection) {
      if (child.hasIndexPage) {
        return child.path;
      }
      const nested = firstNavigableChildPath(child);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (child.isComponentPage && child.children?.length) {
      return child.children[0].path;
    }

    return child.path;
  }

  return null;
}

/** Build redirect map for all section folders (including those with index.md). */
export function collectSectionRedirects(
  nodes: NavPage[],
  map: Record<string, string> = {},
): Record<string, string> {
  for (const node of nodes) {
    if (node.isSection) {
      const target = firstNavigableChildPath(node);
      if (target) {
        map[node.path] = target;
      }
      if (node.children) {
        collectSectionRedirects(node.children, map);
      }
    }
  }
  return map;
}

/** Check whether a directory (recursively) contains at least one .md file. */
function hasMdContent(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) return true;
    if (entry.isDirectory() && hasMdContent(path.join(dir, entry.name))) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Core walker
// ---------------------------------------------------------------------------

/**
 * Recursively walk a directory and build the nav tree.
 *
 * @param dir      Absolute path to the directory being walked.
 * @param urlSlug  URL slug accumulated so far (e.g. "components/all-buttons").
 */
export function walkDir(dir: string, urlSlug: string): NavPage | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const fileNames = entries.filter((e) => e.isFile()).map((e) => e.name);
  const subDirNames = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    // Ignore playgrounds and other non-doc sub-directories
    .filter((name) => hasMdContent(path.join(dir, name)));

  const hasIndexMd = fileNames.includes('index.md');
  const hasApiMd = fileNames.includes('api.md');
  const hasStylingMd = fileNames.includes('styling.md');

  const isComponentPage = hasIndexMd && (hasApiMd || hasStylingMd);
  const isSection = subDirNames.length > 0;

  // Read metadata from index.md frontmatter (if it exists)
  const fm = readFrontmatter(path.join(dir, 'index.md'));

  // isHidden on index.md hides this page, component, or entire section
  // (including all descendants) from the nav tree and routes.txt.
  if (fm['isHidden'] === true) {
    return null;
  }

  const label = typeof fm['title'] === 'string' ? fm['title'] : kebabToTitle(path.basename(dir));
  const order = typeof fm['order'] === 'number' ? fm['order'] : undefined;
  const description = typeof fm['description'] === 'string' ? fm['description'] : undefined;
  const primarySymbol = parsePrimarySymbol(fm['primarySymbol']);

  const pagePath = `/docs/${urlSlug}`;

  if (isSection) {
    // Build child nodes recursively
    const children: NavPage[] = subDirNames
      .map((name) => walkDir(path.join(dir, name), `${urlSlug}/${name}`))
      .filter((node): node is NavPage => node !== null);

    // Sort children by order (undefined order sorts after numbered items)
    children.sort((a, b) => {
      const ao = a.order ?? Infinity;
      const bo = b.order ?? Infinity;
      if (ao !== bo) return ao - bo;
      return a.label.localeCompare(b.label);
    });

    // Drop the section entirely if every child ended up hidden and the
    // section has no index.md of its own to land on.
    if (children.length === 0 && !hasIndexMd) {
      return null;
    }

    const sectionNode: NavPage = {
      label,
      path: pagePath,
      order,
      description,
      isSection: true,
      hasIndexPage: hasIndexMd,
      children,
    };
    return sectionNode;
  }

  if (isComponentPage) {
    // Emit four child pages
    const componentChildren: NavPage[] = [
      {
        label: 'Overview',
        path: pagePath,
        order: 1,
        description: description ? `Overview: ${description}` : undefined,
      },
    ];

    if (hasApiMd) {
      const apiFm = readFrontmatter(path.join(dir, 'api.md'));
      if (apiFm['isHidden'] !== true) {
        componentChildren.push({
          label: typeof apiFm['title'] === 'string' ? apiFm['title'] : 'API',
          path: `${pagePath}/api`,
          order: typeof apiFm['order'] === 'number' ? apiFm['order'] : 2,
          description: typeof apiFm['description'] === 'string' ? apiFm['description'] : undefined,
        });
      }
    }

    if (hasStylingMd) {
      const stylingFm = readFrontmatter(path.join(dir, 'styling.md'));
      if (stylingFm['isHidden'] !== true) {
        componentChildren.push({
          label: typeof stylingFm['title'] === 'string' ? stylingFm['title'] : 'Styling',
          path: `${pagePath}/styling`,
          order: typeof stylingFm['order'] === 'number' ? stylingFm['order'] : 3,
          description:
            typeof stylingFm['description'] === 'string' ? stylingFm['description'] : undefined,
        });
      }
    }

    componentChildren.push({
      label: 'Playground',
      path: `${pagePath}/playground`,
      order: 4,
      description: description ? `Interactive playground for ${label}.` : undefined,
    });

    componentChildren.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

    return {
      label,
      path: pagePath,
      order,
      description,
      primarySymbol,
      isComponentPage: true,
      children: componentChildren,
    };
  }

  if (hasIndexMd) {
    // Plain content page
    return {
      label,
      path: pagePath,
      order,
      description,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Flatten helpers
// ---------------------------------------------------------------------------

/**
 * Flatten the nav tree into an ordered list of all leaf pages.
 * Section nodes are excluded; for component pages the four child pages are included.
 */
function flattenPages(nodes: NavPage[]): NavPage[] {
  const result: NavPage[] = [];

  for (const node of nodes) {
    if (node.isSection && node.children) {
      result.push(...flattenPages(node.children));
    } else if (node.isComponentPage && node.children) {
      result.push(...node.children);
    } else if (!node.isSection && !node.isExternal) {
      result.push(node);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error(`Error: docs root not found at ${DOCS_ROOT}`);
    process.exit(1);
  }

  // Build top-level nav tree
  const topLevelDirs = fs
    .readdirSync(DOCS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && hasMdContent(path.join(DOCS_ROOT, e.name)))
    .map((e) => e.name);

  const nav: NavPage[] = topLevelDirs
    .map((name) => walkDir(path.join(DOCS_ROOT, name), name))
    .filter((node): node is NavPage => node !== null);

  // Sort top-level sections by order then by label
  nav.sort((a, b) => {
    const ao = a.order ?? Infinity;
    const bo = b.order ?? Infinity;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label);
  });

  // Append hand-authored external links (e.g. llms.txt) to their target sections.
  for (const [sectionPath, links] of Object.entries(EXTERNAL_NAV_LINKS)) {
    const section = nav.find((n) => n.path === sectionPath);
    section?.children?.push(...links);
  }

  const pages = flattenPages(nav);
  const sectionRedirects = collectSectionRedirects(nav);

  const manifest: NavManifest = { nav, pages, sectionRedirects };

  // Write nav-manifest.json
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`✓ Written ${MANIFEST_OUT}`);

  // ---------------------------------------------------------------------------
  // Collect routes for routes.txt
  // ---------------------------------------------------------------------------
  const routeLines: string[] = [];

  function collectRoutes(nodes: NavPage[]): void {
    for (const node of nodes) {
      if (node.isSection && node.children) {
        // Include section route for redirect handling
        routeLines.push(node.path);
        collectRoutes(node.children);
      } else if (node.isComponentPage && node.children) {
        for (const child of node.children) {
          routeLines.push(child.path);
        }
      } else if (!node.isSection && !node.isExternal) {
        routeLines.push(node.path);
      }
    }
  }

  collectRoutes(nav);

  // TypeScript compiler-API extraction pass — must run before the API routes
  // are appended below, since it's what (re)writes api-manifest.json. Running
  // it after (as this used to) meant routes.txt was built from the *previous*
  // build's manifest, one run stale — e.g. a symbol whose `kind` classification
  // just changed would still get its old kind's URL segment until a second run.
  await runMetadataExtraction();

  // Append API routes from the api-manifest.json just written above.
  routeLines.push('/docs/api');
  // Standalone root routes (no /docs prefix — served by StandaloneShellComponent)
  routeLines.push('/');
  routeLines.push('/changelog');
  if (fs.existsSync(API_MANIFEST_OUT)) {
    const apiManifest = JSON.parse(fs.readFileSync(API_MANIFEST_OUT, 'utf-8')) as Record<
      string,
      { kind: string }
    >;
    for (const [symbolName, entry] of Object.entries(apiManifest)) {
      const segment = KIND_SEGMENT[entry.kind];
      if (segment) {
        routeLines.push(`/docs/api/mat-exp/${segment}/${symbolName}`);
      }
    }
  }

  fs.writeFileSync(ROUTES_OUT, routeLines.join('\n') + '\n', 'utf-8');
  console.log(`✓ Written ${ROUTES_OUT}`);

  console.log(`\nNav tree: ${nav.length} top-level sections`);
  console.log(`Leaf pages: ${pages.length}`);
  console.log(`Routes: ${routeLines.length}`);
  console.log(`Section redirects: ${Object.keys(sectionRedirects).length}`);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
