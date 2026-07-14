import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';
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
import { DocPageMetaComponent } from '../doc-page-meta/doc-page-meta.component';
import {
  breadcrumbListJsonLd,
  techArticleJsonLd,
  withBaseJsonLd,
} from '../../shared/utils/json-ld';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpIconButton, MatExpButtonGroup } from '@ngm-dev/mat-exp';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { RouteHandlerComponent } from '../../shared/components/route-handler.component';

/**
 * Collects every URL path the nav manifest actually renders — section landing
 * pages and plain content pages. Mirrors `collectRoutes` in
 * scripts/build-docs.ts so hidden pages (dropped from the manifest via
 * `isHidden`) resolve to a 404 here too, not just from the sidebar.
 */
function collectValidPagePaths(nodes: NavPage[], paths = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (node.isSection) {
      paths.add(node.path);
      if (node.children) collectValidPagePaths(node.children, paths);
    } else if (!node.isExternal) {
      paths.add(node.path);
    }
  }
  return paths;
}

/** Finds the nav node that owns `currentPath`. Source of `primarySymbol` for the Import and GitHub rows. */
function findPageNode(currentPath: string, nodes: NavPage[]): NavPage | null {
  for (const node of nodes) {
    if (node.path === currentPath) return node;
    if (node.children) {
      const found = findPageNode(currentPath, node.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Walks the nav tree to find the ordered chain of ancestor nodes (section by
 * section) leading to the node that owns `currentPath`. Returns null when the
 * path isn't found.
 */
function findAncestorChain(
  currentPath: string,
  nodes: NavPage[],
  trail: NavPage[] = [],
): NavPage[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.path === currentPath) return nextTrail;
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
    TocComponent,
    DocPageMetaComponent,
    MatCard,
    MatCardContent,
    MarkdownPipe,
    AsyncPipe,
    MatButtonModule,
    MatExpIconButton,
    MatTooltip,
    RouterLink,
    MatIcon,
    RouteHandlerComponent,
    MatExpButtonGroup,
  ],
  templateUrl: './doc-page.component.html',
  styleUrl: './doc-page.component.scss',
})
export class DocPageComponent {
  private readonly router = inject(Router);
  private readonly markdownService = inject(MarkdownService);
  private readonly tocService = inject(TocService);
  private readonly ngxMetaService = inject(NgxMetaService);
  private readonly navManifestService = inject(NavManifestService);

  /** Current clean route path. */
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

  /** Design link shown in the Docs Row only when the page's frontmatter sets it. */
  protected readonly designUrl = computed<string | undefined>(() => {
    const p = this.page();
    if (!p || p.notFound) return undefined;
    return p.frontmatter['designUrl'] as string | undefined;
  });

  /**
   * GitHub Row source-folder link — mirrors editPageUrl()'s URL-building
   * pattern. The docs route and library source folder structure are 1:1
   * (e.g. /docs/components/all-buttons/button ->
   * projects/ngm-dev/mat-exp/src/lib/components/all-buttons/button), so no
   * frontmatter is needed; gated on `primarySymbol` (via `currentPageNode`),
   * since every component is now a single page with no tabs (#177, #178).
   */
  protected readonly sourceFolderUrl = computed<string | undefined>(() => {
    const node = this.currentPageNode();
    if (!node?.primarySymbol?.length) return undefined;
    const suffix = node.path.replace(/^\/docs\/components\//, '');
    return `${environment.githubRepoUrl}/tree/${environment.githubBranch}/projects/ngm-dev/mat-exp/src/lib/components/${suffix}`;
  });

  /** GitHub Row "Report an issue" link, pre-filled with a component-specific title. */
  protected readonly reportIssueUrl = computed<string | undefined>(() => {
    const node = this.currentPageNode();
    if (!node?.primarySymbol?.length) return undefined;
    return `${environment.githubRepoUrl}/issues/new?title=${encodeURIComponent(`[${node.label}] `)}`;
  });

  protected readonly tocItems = this.tocService.items;

  /** Display title shown above the page content, from the page's frontmatter. */
  protected readonly pageTitle = computed<string | undefined>(() => {
    const p = this.page();
    if (!p || p.notFound) return undefined;
    return p.frontmatter['title'] as string | undefined;
  });

  /** Display description shown above the page content, from the page's frontmatter. */
  protected readonly pageDescription = computed<string | undefined>(() => {
    const p = this.page();
    if (!p || p.notFound) return undefined;
    return p.frontmatter['description'] as string | undefined;
  });

  /** The Docs Row applies only to markdown-backed pages, not 404s. */
  protected readonly showDocsRow = computed(() => {
    const p = this.page();
    return !!p && !p.notFound;
  });

  /** The nav node for the current path — see `findPageNode`. Source of `primarySymbol` for the Import and GitHub rows. */
  protected readonly currentPageNode = computed(() => {
    const manifest = this.navManifestService.manifest();
    const path = this.routePath();
    if (!manifest) return null;
    return findPageNode(path, manifest.nav);
  });

  /**
   * Exported library symbol(s) for the Import Row, sourced from the current
   * page's own `primarySymbol` frontmatter (carried on the nav manifest
   * node).
   */
  protected readonly primarySymbol = computed(() => this.currentPageNode()?.primarySymbol);

  /**
   * The metadata table renders when the Docs Row applies, or when the
   * current page documents a library symbol (which adds the Import and/or
   * GitHub Row, independent of whether there's backing markdown for the
   * Docs Row).
   */
  protected readonly showMetaTable = computed(
    () => this.showDocsRow() || !!this.currentPageNode()?.primarySymbol,
  );

  /**
   * Ordered ancestor chain (sections down to the current page) used to
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
        return this.markdownService.getPage(path);
      }),
    ),
    { initialValue: null },
  );

  private readonly jumpToIcons: Record<string, string> = {
    usage: 'keyboard',
    playground: 'joystick',
    api: 'api',
    styling: 'css',
  };

  private readonly jumpToOrder = ['usage', 'playground', 'api', 'styling'];

  protected readonly jumpToLinks = computed(() => {
    const headings = this.page()?.headings ?? [];

    return headings
      .filter((h) => h.level === 2)
      .filter((h) => ['usage', 'playground', 'api', 'styling'].includes(h.label.toLowerCase()))
      .sort((a, b) => this.jumpToOrder.indexOf(a.id) - this.jumpToOrder.indexOf(b.id))
      .map((h) => ({
        id: h.id,
        tooltip: h.label,
        icon: this.jumpToIcons[h.label.toLowerCase()],
      }));
  });

  constructor() {
    effect(() => {
      const p = this.page();
      if (p && !p.notFound) {
        this.tocService.setItems(p.headings);
        this.setPageMetadata(p);
      } else {
        this.tocService.clear();
        this.ngxMetaService.set({});
      }
    });
  }

  private setPageMetadata(page: DocPage): void {
    const description =
      (page.frontmatter['metaDescription'] as string | undefined) ??
      (page.frontmatter['description'] as string | undefined) ??
      null;
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
