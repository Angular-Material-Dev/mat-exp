import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { pendingUntilEvent } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { TocService } from '../../shared/services/toc.service';
import { breadcrumbListJsonLd, withBaseJsonLd } from '../../shared/utils/json-ld';

type ApiKind = 'component' | 'directive' | 'class' | 'interface' | 'type' | 'function' | 'const';

interface ManifestEntry {
  kind: ApiKind;
  description?: string;
}

interface SymbolRow {
  name: string;
  description?: string;
  url: string;
}

interface SymbolGroup {
  kind: ApiKind;
  label: string;
  badge: string;
  badgeClass: string;
  symbols: SymbolRow[];
}

const KIND_ORDER: ApiKind[] = [
  'component',
  'directive',
  'class',
  'interface',
  'type',
  'function',
  'const',
];

const KIND_LABELS: Record<ApiKind, string> = {
  component: 'Components',
  directive: 'Directives',
  class: 'Classes',
  interface: 'Interfaces',
  type: 'Types',
  function: 'Functions',
  const: 'Constants',
};

const KIND_BADGES: Record<ApiKind, string> = {
  component: 'C',
  directive: 'D',
  class: 'Cl',
  interface: 'I',
  type: 'T',
  function: 'F',
  const: 'K',
};

const KIND_BADGE_CLASS: Record<ApiKind, string> = {
  component: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  directive: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  class: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  interface: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
  type: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  function: 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300',
  const: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const KIND_URL_SEGMENT: Record<ApiKind, string> = {
  component: 'components',
  directive: 'directives',
  class: 'classes',
  interface: 'interfaces',
  type: 'types',
  function: 'functions',
  const: 'constants',
};

@Component({
  selector: 'app-api-index-page',

  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">API Reference</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        All exported symbols from <code class="font-mono text-sm">&#64;ngm-dev/mat-exp</code>
      </p>

      <label class="block mb-8">
        <span class="sr-only">Filter symbols</span>
        <input
          type="search"
          placeholder="Filter symbols…"
          [value]="filter()"
          (input)="filter.set($any($event.target).value)"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter symbols by name"
        />
      </label>

      @if (loading()) {
        <div class="animate-pulse space-y-8" aria-busy="true" aria-label="Loading API symbols">
          @for (_ of skeletonRows; track $index) {
            <div class="space-y-3">
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <p class="text-red-600 dark:text-red-400">Failed to load API manifest.</p>
      } @else if (filteredGroups().length === 0) {
        <p class="text-gray-500 dark:text-gray-400">
          No symbols match &ldquo;<em>{{ filter() }}</em
          >&rdquo;.
        </p>
      } @else {
        @for (group of filteredGroups(); track group.kind) {
          <section class="mb-8" [attr.aria-label]="group.label + ' group'">
            <h2
              class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700"
            >
              {{ group.label }}
            </h2>
            <ul class="space-y-2">
              @for (sym of group.symbols; track sym.name) {
                <li class="flex items-baseline gap-3 min-w-0">
                  <span
                    [class]="
                      'shrink-0 inline-flex items-center justify-center w-7 h-5 text-xs font-bold rounded ' +
                      group.badgeClass
                    "
                    aria-hidden="true"
                    >{{ group.badge }}</span
                  >
                  <a
                    [routerLink]="sym.url"
                    class="shrink-0 font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
                  >
                    {{ sym.name }}
                  </a>
                  @if (sym.description) {
                    <span class="text-sm text-gray-500 dark:text-gray-400 truncate min-w-0">
                      {{ sym.description }}
                    </span>
                  }
                </li>
              }
            </ul>
          </section>
        }
      }
    </div>
  `,
})
export class ApiIndexPageComponent {
  private readonly http = inject(HttpClient);
  private readonly ngxMetaService = inject(NgxMetaService);
  private readonly injector = inject(Injector);
  private readonly tocService = inject(TocService);

  protected readonly filter = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly skeletonRows = [1, 2, 3];

  private readonly allGroups = signal<SymbolGroup[]>([]);

  protected readonly filteredGroups = computed<SymbolGroup[]>(() => {
    const q = this.filter().toLowerCase().trim();
    if (!q) return this.allGroups();
    return this.allGroups()
      .map((g) => ({ ...g, symbols: g.symbols.filter((s) => s.name.toLowerCase().includes(q)) }))
      .filter((g) => g.symbols.length > 0);
  });

  constructor() {
    this.tocService.clear();

    this.ngxMetaService.set({
      title: 'API Reference',
      description:
        'Browse the complete API reference for @ngm-dev/mat-exp — components, directives, types, and utilities.',
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd([
          { name: 'Mat Expressive', path: '/' },
          { name: 'API Reference', path: '/docs/api' },
        ]),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);

    this.http
      .get<Record<string, ManifestEntry>>('/api-manifest.json')
      .pipe(pendingUntilEvent(this.injector))
      .subscribe({
        next: (manifest) => {
          const byKind = new Map<ApiKind, SymbolRow[]>();
          for (const kind of KIND_ORDER) byKind.set(kind, []);

          for (const [name, entry] of Object.entries(manifest)) {
            const kind = entry.kind;
            const rows = byKind.get(kind);
            if (rows) {
              rows.push({
                name,
                description: entry.description,
                url: `/docs/api/mat-exp/${KIND_URL_SEGMENT[kind]}/${name}`,
              });
            }
          }

          for (const rows of byKind.values()) {
            rows.sort((a, b) => a.name.localeCompare(b.name));
          }

          const groups = KIND_ORDER.filter((k) => (byKind.get(k)?.length ?? 0) > 0).map((k) => ({
            kind: k,
            label: KIND_LABELS[k],
            badge: KIND_BADGES[k],
            badgeClass: KIND_BADGE_CLASS[k],
            symbols: byKind.get(k)!,
          }));

          this.allGroups.set(groups);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
