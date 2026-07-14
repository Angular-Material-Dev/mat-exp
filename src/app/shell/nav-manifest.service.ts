import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs/operators';

export interface NavPage {
  label: string;
  path: string;
  description?: string;
  /**
   * Optional short, SEO-safe override for the meta/OG description tag.
   * Falls back to `description` (which can run long) when absent.
   */
  metaDescription?: string;
  order?: number;
  /**
   * Exported library symbol(s) this Component Page documents, e.g.
   * ["MatExpButton"] or ["MatExpFabMenu", "MatExpFabMenuTrigger"]. Only set
   * on Component Page nodes (isComponentPage: true).
   */
  primarySymbol?: string[];
  isComponentPage?: boolean;
  isSection?: boolean;
  hasIndexPage?: boolean;
  /** True when `path` is an external URL to open in a new tab, not an app route. */
  isExternal?: boolean;
  children?: NavPage[];
}

export interface NavManifest {
  nav: NavPage[];
  pages: NavPage[];
  sectionRedirects: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class NavManifestService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  readonly manifest$ = this.http
    .get<NavManifest>('/nav-manifest.json')
    .pipe(pendingUntilEvent(this.injector), shareReplay(1));

  readonly manifest = toSignal(this.manifest$, { initialValue: null });
}
