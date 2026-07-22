import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { pendingUntilEvent } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  catchError,
  firstValueFrom,
  from,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { Marked, Tokens } from 'marked';
import markedAlert from 'marked-alert';
import { getSingletonHighlighter, type Highlighter } from 'shiki';
import { transformerMetaHighlight, transformerNotationHighlight } from '@shikijs/transformers';
import { TocItem } from './toc.service';

export interface DocPage {
  frontmatter: Record<string, unknown>;
  html: string;
  headings: TocItem[];
  notFound: boolean;
}

const SUPPORTED_LANGS = [
  'angular-ts',
  'angular-html',
  'typescript',
  'javascript',
  'html',
  'css',
  'scss',
  'json',
  'bash',
  'shell',
  'sh',
  'markdown',
  'md',
  'yaml',
  'yml',
  'xml',
  'text',
];

/** Map fence info-string language ids to Shiki bundled language ids. */
const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  yml: 'yaml',
  sh: 'bash',
  md: 'markdown',
};

/** Infer Shiki language from a filename extension. */
const EXT_TO_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  xml: 'xml',
  sh: 'bash',
  bash: 'bash',
};

const LANG_LABELS: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript',
  'angular-ts': 'Angular TS',
  'angular-html': 'Angular HTML',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  md: 'Markdown',
  markdown: 'Markdown',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  text: 'Text',
};

/** Tab-style segments that map directly to a named .md file rather than index.md */
const TAB_SEGMENTS = new Set(['api', 'styling', 'playground']);

const API_KIND_URL_SEGMENT: Record<string, string> = {
  directive: 'directives',
  component: 'components',
  class: 'classes',
  interface: 'interfaces',
  type: 'types',
  function: 'functions',
  const: 'constants',
};

export const NOT_FOUND_PAGE: DocPage = { frontmatter: {}, html: '', headings: [], notFound: true };

/** Browser-safe frontmatter split (gray-matter requires Node `Buffer`). */
export function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const content = raw.startsWith('\ufeff') ? raw.slice(1) : raw;
  if (!content.startsWith('---')) {
    return { frontmatter: {}, body: content };
  }

  const lines = content.split(/\r?\n/);
  if (lines[0] !== '---') {
    return { frontmatter: {}, body: content };
  }

  let end = 1;
  while (end < lines.length && lines[end] !== '---') {
    end++;
  }
  if (end >= lines.length) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Record<string, unknown> = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    const colon = line.indexOf(':');
    if (colon === -1) {
      continue;
    }
    const key = line.slice(0, colon).trim();
    const rawValue = line.slice(colon + 1).trim();
    if (/^-?\d+$/.test(rawValue)) {
      frontmatter[key] = Number(rawValue);
    } else {
      const quoted = rawValue.match(/^"(.*)"$|^'(.*)'$/);
      frontmatter[key] = quoted ? (quoted[1] ?? quoted[2]) : rawValue;
    }
  }

  return { frontmatter, body: lines.slice(end + 1).join('\n') };
}

function langFromFilename(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? EXT_TO_LANG[ext] : undefined;
}

function resolveShikiLang(lang: string, filename?: string): string {
  const key = lang.toLowerCase();
  if (LANG_ALIASES[key]) {
    return LANG_ALIASES[key];
  }
  if (SUPPORTED_LANGS.includes(key)) {
    return key;
  }
  if (filename) {
    const inferred = langFromFilename(filename);
    if (inferred) {
      return inferred;
    }
  }
  return 'text';
}

function resolveFilePath(routePath: string): string {
  const docPath = routePath.startsWith('/docs') ? routePath.slice('/docs'.length) : routePath;
  const path = docPath.length > 1 && docPath.endsWith('/') ? docPath.slice(0, -1) : docPath;
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? '';
  if (TAB_SEGMENTS.has(lastSegment)) {
    return `/docs${path}.md`;
  }
  return `/docs${path}/index.md`;
}

/** Parse the info string from a fenced code block (e.g. `angular-ts name="app.ts" {3}`). */
function parseInfoString(infoStr: string): {
  lang: string;
  meta: string;
  showLineNumbers: boolean;
  filename?: string;
} {
  const trimmed = infoStr.trim();
  if (!trimmed) {
    return { lang: '', meta: '', showLineNumbers: false };
  }

  const metaMatch = trimmed.match(/(\{[^}]+\})/);
  const meta = metaMatch?.[1] ?? '';
  const showLineNumbers = /\bshowLineNumbers\b/.test(trimmed);

  const nameAttr = trimmed.match(/(?:^|\s)name=["']([^"']+)["']/);
  const pathMatch = trimmed.match(/\b([\w./-]+\.[\w.]+)\b/);

  // Language id may include hyphens (`angular-ts`); `\w+` alone only matched `angular`.
  const langMatch = trimmed.match(/^([\w-]+)(?:\s|$)/);
  let lang = langMatch?.[1] ?? '';
  let filename = nameAttr?.[1] ?? (pathMatch && pathMatch[1] !== lang ? pathMatch[1] : undefined);

  // Fence with only a path/filename and no language token.
  if (lang.includes('.') && !lang.includes('-')) {
    filename = filename ?? lang;
    lang = '';
  }

  if (!lang && filename) {
    const inferred = langFromFilename(filename);
    if (inferred) {
      lang = inferred;
    }
  }

  return { lang, meta, showLineNumbers, filename };
}

/** Root-relative hrefs stay in the SPA and can route via `<router-link>`; everything else (external URLs, mailto:, etc.) stays a plain anchor. */
function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

/** Extract headings (h1–h3) from rendered HTML. */
function extractHeadings(html: string): TocItem[] {
  const headingPattern = /<h([1-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-3]>/gi;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const label = match[3].replace(/<[^>]+>/g, '').trim();
    if (id && label) {
      items.push({ id, label, level });
    }
  }
  return items;
}

/** Build the wrapper HTML around a Shiki code block. */
function wrapCodeBlock(
  shikiHtml: string,
  lang: string,
  showLineNumbers: boolean,
  filename?: string,
): string {
  const langLabel = LANG_LABELS[lang] ?? lang;
  const badgeText = filename ?? (langLabel || null);
  const badge = badgeText ? `<span class="code-block-badge">${badgeText}</span>` : '';
  const lineNumbersAttr = showLineNumbers ? ' data-line-numbers' : '';

  return `<div class="code-block"${lineNumbersAttr}>
  <div class="code-block-header">
    ${badge}
    <button class="code-block-copy" aria-label="Copy code to clipboard" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg class="code-block-copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </button>
  </div>
  ${shikiHtml}
</div>`;
}

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  private highlighterPromise: Promise<Highlighter> | null = null;
  private apiLinkMapPromise: Promise<Map<string, string>> | null = null;

  private getHighlighter(): Promise<Highlighter> {
    if (!this.highlighterPromise) {
      this.highlighterPromise = getSingletonHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: SUPPORTED_LANGS,
      });
    }
    return this.highlighterPromise;
  }

  private loadApiLinkMap(): Promise<Map<string, string>> {
    if (!this.apiLinkMapPromise) {
      this.apiLinkMapPromise = firstValueFrom(
        this.http.get<Record<string, { kind: string; selector?: string }>>('/api-manifest.json'),
      )
        .then((manifest) => {
          const map = new Map<string, string>();
          for (const [name, entry] of Object.entries(manifest)) {
            const segment = API_KIND_URL_SEGMENT[entry.kind];
            if (!segment) continue;
            const url = `/docs/api/mat-exp/${segment}/${name}`;
            map.set(name, url);
            if (entry.selector) {
              const attr = entry.selector.match(/\[([^\]]+)\]/)?.[1];
              if (attr) map.set(attr, url);
            }
          }
          return map;
        })
        .catch(() => new Map<string, string>());
    }
    return this.apiLinkMapPromise;
  }

  private async renderCodeBlock(code: string, infoStr: string): Promise<string> {
    const { lang, meta, showLineNumbers, filename } = parseInfoString(infoStr);
    const highlighter = await this.getHighlighter();
    const effectiveLang = resolveShikiLang(lang, filename);

    const shikiHtml = highlighter.codeToHtml(code, {
      lang: effectiveLang,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      transformers: [transformerMetaHighlight(), transformerNotationHighlight()],
      meta: { __raw: meta },
    });

    return wrapCodeBlock(shikiHtml, lang, showLineNumbers, filename);
  }

  private async processMarkdown(content: string): Promise<DocPage> {
    const { frontmatter, body } = parseFrontmatter(content);
    const apiLinkMap = await this.loadApiLinkMap();
    // Same-page anchors (`[text](#foo)`) resolve against the document's
    // <base href="/"> per the HTML spec, not the current path — without this,
    // they render as "/#foo" instead of "/docs/.../current-page#foo".
    const currentPath = this.location.path();

    const markedInstance = new Marked({ async: true, gfm: true });
    const seenHeadingIds = new Map<string, number>();

    markedInstance.use(markedAlert());

    markedInstance.use({
      renderer: {
        link(token: Tokens.Link): string {
          const href = token.href.startsWith('#') ? `${currentPath}${token.href}` : token.href;
          const titleAttr = token.title ? ` title="${token.title}"` : '';
          const text = this.parser.parseInline(token.tokens);
          if (isInternalHref(href)) {
            const [url, fragment = ''] = href.split('#');
            return `<router-link url="${url}" fragment="${fragment}"${titleAttr}>${text}</router-link>`;
          }
          return `<a href="${href}"${titleAttr}>${text}</a>`;
        },
        codespan(token: Tokens.Codespan): string {
          const escaped = token.text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const url = apiLinkMap.get(token.text);
          if (url) {
            return `<router-link url="${url}" fragment="" class="api-link"><code>${escaped}</code></router-link>`;
          }
          return `<code>${escaped}</code>`;
        },
        heading(token: Tokens.Heading): string {
          const baseId = token.text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

          // Repeated heading text (e.g. an "Usage" subheading under both the
          // page's own content and a folded-in `## API`/`## Styling`
          // section) would otherwise collide on the same id, breaking
          // fragment navigation and the TOC scroll-spy for whichever
          // heading isn't first in the DOM. Matches GitHub's own
          // disambiguation scheme: first occurrence keeps the plain slug,
          // repeats get -1, -2, ...
          const seenCount = seenHeadingIds.get(baseId) ?? 0;
          seenHeadingIds.set(baseId, seenCount + 1);
          const id = seenCount === 0 ? baseId : `${baseId}-${seenCount}`;

          return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>\n`;
        },
        code(token: Tokens.Code): string {
          const codeToken = token as Tokens.Code & { _hlHtml?: string };
          return codeToken._hlHtml ?? `<pre><code>${token.text}</code></pre>\n`;
        },
      },
      walkTokens: async (token: Tokens.Generic) => {
        if (token.type === 'code') {
          const codeToken = token as Tokens.Code & { _hlHtml?: string };
          codeToken._hlHtml = await this.renderCodeBlock(codeToken.text, codeToken.lang ?? '');
        }
      },
    });

    const html = (await markedInstance.parse(body)) as string;
    const headings = extractHeadings(html);

    return { frontmatter, html, headings, notFound: false };
  }

  /** Render arbitrary markdown text to HTML with Shiki code highlighting. */
  async renderMarkdown(text: string): Promise<string> {
    const page = await this.processMarkdown(text);
    return page.html;
  }

  /**
   * Syntax-highlight a raw code string to HTML, reusing the singleton Shiki highlighter.
   *
   * @param highlightLines Shiki meta line range to highlight, e.g. `'2,4-6'`. Same format as
   * the `{2,4-6}` fence-info-string highlighting used by the markdown pipeline.
   */
  async highlightCode(code: string, lang: string, highlightLines?: string): Promise<string> {
    const highlighter = await this.getHighlighter();
    const effectiveLang = resolveShikiLang(lang);
    return highlighter.codeToHtml(code, {
      lang: effectiveLang,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      transformers: [transformerMetaHighlight(), transformerNotationHighlight()],
      meta: highlightLines ? { __raw: `{${highlightLines}}` } : undefined,
    });
  }

  /** Map a router URL path to the corresponding public `.md` file URL. */
  getMarkdownUrl(routePath: string): string {
    return resolveFilePath(routePath);
  }

  /**
   * Fetch and render a documentation page for the given router URL path.
   * Emits a DocPage on success, or a notFound DocPage for HTTP 404.
   */
  getPage(routePath: string): Observable<DocPage> {
    // A valid doc route never ends in `.md`. When the dev server / SPA fallback
    // serves the app shell for a missing `.md` asset, server-side rendering
    // re-enters DocPageComponent with a `…/index.md` route path. Fetching again
    // here would recurse (each nested SSR render appends another `/index.md`)
    // until the request times out. Bail synchronously — no fetch, no recursion.
    const cleanPath = routePath.split('?')[0].split('#')[0].replace(/\/$/, '');
    if (cleanPath.endsWith('.md')) {
      return of(NOT_FOUND_PAGE);
    }
    const filePath = this.getMarkdownUrl(routePath);
    return this.http.get(filePath, { responseType: 'text', observe: 'response' }).pipe(
      switchMap((response) => {
        // When a catch-all server rewrite returns index.html for a missing docs file,
        // Content-Type will be text/html rather than text/plain — treat as not-found.
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('text/html')) {
          return of(NOT_FOUND_PAGE);
        }
        const content = response.body ?? '';
        return from(this.processMarkdown(content)).pipe(catchError(() => of(NOT_FOUND_PAGE)));
      }),
      catchError((err: unknown) => {
        // switchMap cancels in-flight fetches when the route emits again; do not treat as 404.
        if (err instanceof HttpErrorResponse) {
          if (err.status === 0) {
            return EMPTY;
          }
          if (err.status === 404) {
            return of(NOT_FOUND_PAGE);
          }
        }
        return throwError(() => err);
      }),
      pendingUntilEvent(this.injector),
    );
  }
}
