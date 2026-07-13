import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Type,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, of } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { environment } from '../../../environments/environment';
import { MarkdownComponent } from '../markdown/markdown.component';
import {
  MarkdownService,
  NOT_FOUND_PAGE,
  type DocPage,
} from '../../shared/services/markdown.service';
import { TocService } from '../../shared/services/toc.service';
import { NavManifestService, NavPage } from '../../shell/nav-manifest.service';
import { TocComponent } from '../../shell/toc/toc.component';
import { TabsComponent } from '../tabs/tabs.component';
import { PLAYGROUND_PAGE_REGISTRY } from '../playground-page-registry';
import {
  breadcrumbListJsonLd,
  techArticleJsonLd,
  withBaseJsonLd,
} from '../../shared/utils/json-ld';

/**
 * Collects every URL path the nav manifest actually renders — section landing
 * pages, component-page tabs (including Playground), and plain content pages.
 * Mirrors `collectRoutes` in scripts/build-docs.ts so hidden pages (dropped
 * from the manifest via `isHidden`) resolve to a 404 here too, not just from
 * the sidebar.
 */
function collectValidPagePaths(nodes: NavPage[], paths = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (node.isSection) {
      paths.add(node.path);
      if (node.children) collectValidPagePaths(node.children, paths);
    } else if (node.isComponentPage && node.children) {
      for (const child of node.children) paths.add(child.path);
    } else if (!node.isExternal) {
      paths.add(node.path);
    }
  }
  return paths;
}

function findComponentPage(currentPath: string, nodes: NavPage[]): NavPage | null {
  for (const node of nodes) {
    if (node.isComponentPage) {
      if (node.path === currentPath || node.children?.some((child) => child.path === currentPath)) {
        return node;
      }
    } else if (node.children) {
      const found = findComponentPage(currentPath, node.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Walks the nav tree to find the ordered chain of ancestor nodes (section by
 * section) leading to the node that owns `currentPath`, including component
 * page tab children. Returns null when the path isn't found.
 */
function findAncestorChain(
  currentPath: string,
  nodes: NavPage[],
  trail: NavPage[] = [],
): NavPage[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.isComponentPage && node.children) {
      const tab = node.children.find((child) => child.path === currentPath);
      if (tab && tab.path !== node.path) return [...nextTrail, tab];
      if (node.path === currentPath) return nextTrail;
    } else if (node.path === currentPath) {
      return nextTrail;
    }
    if (node.children) {
      const found = findAncestorChain(currentPath, node.children, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

@Component({
  selector: 'app-doc-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MarkdownComponent,
    TabsComponent,
    TocComponent,
    NgTemplateOutlet,
    NgComponentOutlet,
    MatButton,
    MatExpButton,
  ],
  templateUrl: './doc-page.component.html',
  styleUrl: './doc-page.component.scss',
})
export class DocPageComponent {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly markdownService = inject(MarkdownService);
  private readonly tocService = inject(TocService);
  private readonly ngxMetaService = inject(NgxMetaService);
  private readonly navManifestService = inject(NavManifestService);

  /** Current clean route path — protected so the template can pass it to TabsComponent. */
  protected readonly routePath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split('?')[0].split('#')[0]),
      startWith(this.router.url.split('?')[0].split('#')[0]),
      distinctUntilChanged(),
    ),
    { requireSync: true },
  );

  protected readonly rawMarkdownUrl = computed(() =>
    this.markdownService.getMarkdownUrl(this.routePath()),
  );

  /** Opens the backing markdown file in GitHub's web editor for the current doc page. */
  protected readonly editPageUrl = computed(
    () =>
      `${environment.githubRepoUrl}/edit/${environment.githubBranch}/public${this.rawMarkdownUrl()}`,
  );

  protected readonly copied = signal(false);

  protected readonly tocItems = this.tocService.items;

  /**
   * Display title shown once above the tab bar (or above plain page content).
   * Component Page tabs (api.md / styling.md) share generic frontmatter titles
   * ("API", "Styling") across every component — prefix with the component name
   * so each tab gets a unique, descriptive title, e.g. "Button API". The
   * Overview tab's own route equals the component's base path, so it's excluded.
   * Playground tabs have no backing markdown, so their title is built from the
   * component page context instead of frontmatter.
   */
  protected readonly pageTitle = computed<string | undefined>(() => {
    const ctx = this.componentPageContext();
    if (this.playgroundPageComponent()) {
      return ctx ? `${ctx.label} Playground` : 'Playground';
    }
    const p = this.page();
    if (!p || p.notFound) return undefined;
    const rawTitle = p.frontmatter['title'] as string | undefined;
    const path = this.routePath();
    return ctx && ctx.path !== path && rawTitle ? `${ctx.label} ${rawTitle}` : rawTitle;
  });

  /** Edit/View/Copy actions apply only to markdown-backed pages, not Playground tabs or 404s. */
  protected readonly showActionsRow = computed(() => {
    const p = this.page();
    return !this.playgroundPageComponent() && !!p && !p.notFound;
  });

  /**
   * When the current path belongs to a Component Page (base or one of its tabs),
   * returns the component page nav node (which carries the tab children).
   * Returns null for non-component pages (e.g. Getting Started).
   */
  protected readonly componentPageContext = computed(() => {
    const manifest = this.navManifestService.manifest();
    const path = this.routePath();
    if (!manifest) return null;
    return findComponentPage(path, manifest.nav);
  });

  /**
   * Ordered ancestor chain (sections down to the current page/tab) used to
   * build the `BreadcrumbList` structured data. `null` until the nav
   * manifest has loaded or when the current path isn't found in it.
   */
  protected readonly breadcrumbChain = computed<NavPage[] | null>(() => {
    const manifest = this.navManifestService.manifest();
    const path = this.routePath();
    if (!manifest) return null;
    return findAncestorChain(path, manifest.nav);
  });

  /**
   * Every URL the nav manifest currently renders. `null` while the manifest
   * is still loading. Pages excluded via `isHidden` (and their descendants)
   * are absent here, so a direct hit on a hidden URL resolves to a 404
   * instead of silently rendering the markdown file, which is still present
   * on disk.
   */
  protected readonly validPagePaths = computed<Set<string> | null>(() => {
    const manifest = this.navManifestService.manifest();
    if (!manifest) return null;
    return collectValidPagePaths(manifest.nav);
  });

  /**
   * When the current URL is a `/playground` tab for a registered component page,
   * returns the Angular component type to render instead of the markdown content.
   * Returns null for all other paths (markdown is rendered normally) and while
   * the path hasn't been confirmed against the nav manifest yet.
   */
  protected readonly playgroundPageComponent = computed((): Type<unknown> | null => {
    const path = this.routePath();
    if (!path.endsWith('/playground')) return null;
    const known = this.validPagePaths();
    if (!known?.has(path)) return null;
    const basePath = path.replace(/\/playground$/, '');
    return PLAYGROUND_PAGE_REGISTRY[basePath] ?? null;
  });

  private readonly routeAndKnownPaths = computed(() => ({
    path: this.routePath(),
    known: this.validPagePaths(),
  }));

  protected readonly page = toSignal(
    toObservable(this.routeAndKnownPaths).pipe(
      switchMap(({ path, known }) => {
        // Nav manifest hasn't loaded yet — stay in the loading state rather
        // than fetching content that might turn out to be hidden.
        if (known === null) return of(null);
        if (!known.has(path)) return of(NOT_FOUND_PAGE);
        // Playground tabs render via playgroundPageComponent, not markdown.
        if (path.endsWith('/playground')) return of(null);
        return this.markdownService.getPage(path);
      }),
    ),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      const p = this.page();
      if (this.playgroundPageComponent()) {
        this.setPlaygroundMetadata();
        return;
      }
      if (p && !p.notFound) {
        this.tocService.setItems(p.headings);
        this.setPageMetadata(p);
      } else {
        this.tocService.clear();
        this.ngxMetaService.set({});
      }
    });
  }

  protected copyMarkdown(): void {
    void firstValueFrom(this.http.get(this.rawMarkdownUrl(), { responseType: 'text' })).then(
      async (text) => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // clipboard write unavailable in some browser/permission contexts
        }
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      },
    );
  }

  /**
   * Sets page metadata for playground tabs. Title and description are derived
   * from the parent component page's nav context, since playground tabs have no
   * backing markdown file with frontmatter.
   */
  private setPlaygroundMetadata(): void {
    const ctx = this.componentPageContext();
    const title = this.pageTitle() ?? 'Playground';
    const description = ctx?.description ?? null;
    const path = this.routePath();

    this.tocService.clear();
    this.ngxMetaService.set({
      title,
      description,
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd(this.breadcrumbEntries(path)),
        techArticleJsonLd({ headline: title, description, path }),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
  }

  private setPageMetadata(page: DocPage): void {
    const description = (page.frontmatter['description'] as string | undefined) ?? null;
    const path = this.routePath();
    const title = this.pageTitle();

    this.ngxMetaService.set({
      title,
      description,
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd(this.breadcrumbEntries(path)),
        techArticleJsonLd({ headline: title ?? path, description, path }),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
  }

  /** Builds `{name, path}` breadcrumb entries from Home through the current page. */
  private breadcrumbEntries(currentPath: string): { name: string; path: string }[] {
    const chain = this.breadcrumbChain();
    if (!chain)
      return [
        { name: 'Mat Expressive', path: '/' },
        { name: 'Docs', path: currentPath },
      ];
    return [
      { name: 'Mat Expressive', path: '/' },
      ...chain.map((node) => ({ name: node.label, path: node.path })),
    ];
  }
}
