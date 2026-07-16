import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { TocService } from '../../shared/services/toc.service';
import { breadcrumbListJsonLd, withBaseJsonLd } from '../../shared/utils/json-ld';

interface ApiInput {
  name: string;
  type: string;
  default?: string;
  description?: string;
  deprecated?: boolean | string;
  isModel?: boolean;
}

interface ApiOutput {
  name: string;
  type?: string;
  eventType?: string;
  description?: string;
  deprecated?: boolean | string;
}

interface ApiTypeParam {
  name: string;
  constraint?: string;
  default?: string;
}

interface ApiParam {
  name: string;
  type: string;
  description?: string;
}

interface ApiProperty {
  name: string;
  type: string;
  description?: string;
  isReadonly?: boolean;
  isOptional?: boolean;
  deprecated?: boolean | string;
}

interface ApiMethod {
  name: string;
  signature: string;
  description?: string;
  params?: ApiParam[];
  returnType?: string;
  returnDescription?: string;
  deprecated?: boolean | string;
  typeParams?: ApiTypeParam[];
}

interface ApiEntry {
  kind: 'directive' | 'component' | 'type' | 'interface' | 'class' | 'const' | 'function';
  selector?: string;
  inputs?: ApiInput[];
  outputs?: ApiOutput[];
  description?: string;
  /** `@metaDescription` JSDoc tag — short override for the meta/OG description tag. */
  metaDescription?: string;
  deprecated?: boolean | string;
  remarks?: string;
  example?: string;
  see?: string[];
  shape?: string;
  value?: string;
  signature?: string;
  typeParams?: ApiTypeParam[];
  params?: ApiParam[];
  returnType?: string;
  returnDescription?: string;
  properties?: ApiProperty[];
  methods?: ApiMethod[];
}

export interface TypeToken {
  text: string;
  link?: string;
}

const KIND_LABEL: Record<string, string> = {
  directive: 'Directive',
  component: 'Component',
  class: 'Class',
  interface: 'Interface',
  type: 'Type',
  function: 'Function',
  const: 'Constant',
};

const KIND_BADGE_CLASS: Record<string, string> = {
  component: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  directive: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  class: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  interface: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
  type: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  function: 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300',
  const: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const KIND_URL_SEGMENT: Record<string, string> = {
  component: 'components',
  directive: 'directives',
  class: 'classes',
  interface: 'interfaces',
  type: 'types',
  function: 'functions',
  const: 'constants',
};

const TH_CLASS =
  'text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700';
const TABLE_CLASS =
  'w-full text-sm border-collapse [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_td]:border-b [&_td]:border-gray-100 dark:[&_td]:border-gray-800 [&_tr:last-child_td]:border-b-0';
const SECTION_H2_CLASS =
  'text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700';
const TYPE_TD_CLASS = 'font-mono text-sm text-purple-700 dark:text-purple-400 break-all';
const TYPE_LINK_CLASS = 'text-blue-600 dark:text-blue-400 hover:underline';

@Component({
  selector: 'app-api-detail-page',

  imports: [RouterLink, AsyncPipe, MarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav
        aria-label="Breadcrumb"
        class="mb-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap"
      >
        <a
          routerLink="/docs/api"
          class="hover:text-gray-700 dark:hover:text-gray-200 hover:underline"
          >API Reference</a
        >
        <span aria-hidden="true">›</span>
        <span>{{ kindLabel() }}</span>
        <span aria-hidden="true">›</span>
        <span class="font-mono text-gray-700 dark:text-gray-200">{{ symbolName() }}</span>
      </nav>

      @if (loading()) {
        <div class="animate-pulse space-y-6" aria-busy="true">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
          <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
        </div>
      } @else if (error()) {
        <p class="text-red-600 dark:text-red-400">Failed to load API manifest.</p>
      } @else if (!entry()) {
        <div class="py-12 text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Symbol not found</h1>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            No symbol named
            <code class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{{
              symbolName()
            }}</code>
            exists in the API manifest.
          </p>
          <a
            routerLink="/docs/api"
            class="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to API Reference
          </a>
        </div>
      } @else {
        <!-- 1. Header -->
        <div class="mb-6 flex flex-wrap items-start gap-3">
          <div class="flex-1 min-w-0">
            <h1 class="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
              {{ symbolName() }}
            </h1>
            @if (entry()!.selector) {
              <code class="text-sm text-gray-500 dark:text-gray-400 mt-1 block">{{
                entry()!.selector
              }}</code>
            }
          </div>
          <span
            [class]="'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ' + kindBadgeClass()"
          >
            {{ kindLabel() }}
          </span>
        </div>

        <!-- 2. Deprecated banner -->
        @if (entry()!.deprecated) {
          <div
            class="mb-6 flex gap-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200"
            role="alert"
          >
            <span class="font-semibold shrink-0">Deprecated.</span>
            @if (entry()!.deprecated !== true) {
              <span>{{ entry()!.deprecated }}</span>
            }
          </div>
        }

        <!-- 3. Description -->
        @if (entry()!.description) {
          <section
            class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed [&_p]:m-0"
            [innerHTML]="entry()!.description! | markdown | async"
          ></section>
        }

        <!-- 4. Remarks -->
        @if (entry()!.remarks) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Remarks</h2>
            <div
              class="prose prose-sm dark:prose-invert max-w-none"
              [innerHTML]="entry()!.remarks! | markdown | async"
            ></div>
          </section>
        }

        <!-- 5. Models -->
        @if (hasModels()) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Models</h2>
            <div class="overflow-x-auto">
              <table [class]="tableClass">
                <thead>
                  <tr>
                    <th [class]="thClass">Name</th>
                    <th [class]="thClass">Type</th>
                    <th [class]="thClass">Default</th>
                    <th [class]="thClass">Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (inp of modelInputs(); track inp.name) {
                    <tr [id]="'input-' + inp.name">
                      <td>
                        <a
                          [routerLink]="[]"
                          [fragment]="'input-' + inp.name"
                          class="font-mono text-sm text-gray-900 dark:text-gray-100 hover:underline"
                          >{{ inp.name }}</a
                        >
                        @if (inp.deprecated) {
                          <span
                            class="ml-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                            >deprecated</span
                          >
                        }
                      </td>
                      <td [class]="typeTdClass" [innerHTML]="typeHtml(inp.type)"></td>
                      <td class="font-mono text-sm text-gray-500 dark:text-gray-400">
                        {{ inp.default ?? '—' }}
                      </td>
                      <td
                        class="text-gray-600 dark:text-gray-300 text-sm [&_p]:m-0"
                        [innerHTML]="inp.description | markdown | async"
                      ></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- 6. Inputs -->
        @if (hasInputs()) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Inputs</h2>
            <div class="overflow-x-auto">
              <table [class]="tableClass">
                <thead>
                  <tr>
                    <th [class]="thClass">Name</th>
                    <th [class]="thClass">Type</th>
                    <th [class]="thClass">Default</th>
                    <th [class]="thClass">Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (inp of regularInputs(); track inp.name) {
                    <tr [id]="'input-' + inp.name">
                      <td>
                        <a
                          [routerLink]="[]"
                          [fragment]="'input-' + inp.name"
                          class="font-mono text-sm text-gray-900 dark:text-gray-100 hover:underline"
                          >{{ inp.name }}</a
                        >
                        @if (inp.deprecated) {
                          <span
                            class="ml-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                            >deprecated</span
                          >
                        }
                      </td>
                      <td [class]="typeTdClass" [innerHTML]="typeHtml(inp.type)"></td>
                      <td class="font-mono text-sm text-gray-500 dark:text-gray-400">
                        {{ inp.default ?? '—' }}
                      </td>
                      <td
                        class="text-gray-600 dark:text-gray-300 text-sm [&_p]:m-0"
                        [innerHTML]="inp.description | markdown | async"
                      ></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- 6. Outputs -->
        @if (hasOutputs()) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Outputs</h2>
            <div class="overflow-x-auto">
              <table [class]="tableClass">
                <thead>
                  <tr>
                    <th [class]="thClass">Name</th>
                    <th [class]="thClass">Event type</th>
                    <th [class]="thClass">Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (out of entry()!.outputs!; track out.name) {
                    <tr [id]="'output-' + out.name">
                      <td>
                        <a
                          [routerLink]="[]"
                          [fragment]="'output-' + out.name"
                          class="font-mono text-sm text-gray-900 dark:text-gray-100 hover:underline"
                          >{{ out.name }}</a
                        >
                        @if (out.deprecated) {
                          <span
                            class="ml-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                            >deprecated</span
                          >
                        }
                      </td>
                      <td
                        [class]="typeTdClass"
                        [innerHTML]="typeHtml(out.eventType ?? out.type ?? 'EventEmitter')"
                      ></td>
                      <td
                        class="text-gray-600 dark:text-gray-300 text-sm [&_p]:m-0"
                        [innerHTML]="out.description | markdown | async"
                      ></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- 7. Properties -->
        @if (entry()!.properties?.length) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Properties</h2>
            <div class="overflow-x-auto">
              <table [class]="tableClass">
                <thead>
                  <tr>
                    <th [class]="thClass">Name</th>
                    <th [class]="thClass">Type</th>
                    <th [class]="thClass">Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prop of entry()!.properties!; track prop.name) {
                    <tr [id]="'property-' + prop.name">
                      <td>
                        <a
                          [routerLink]="[]"
                          [fragment]="'property-' + prop.name"
                          class="font-mono text-sm text-gray-900 dark:text-gray-100 hover:underline"
                          >{{ prop.name }}</a
                        >
                        @if (prop.isReadonly) {
                          <span class="ml-1.5 text-xs font-mono text-gray-400">readonly</span>
                        }
                        @if (prop.isOptional) {
                          <span class="ml-1.5 text-xs font-mono text-gray-400">optional</span>
                        }
                        @if (prop.deprecated) {
                          <span
                            class="ml-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                            >deprecated</span
                          >
                        }
                      </td>
                      <td [class]="typeTdClass" [innerHTML]="typeHtml(prop.type)"></td>
                      <td
                        class="text-gray-600 dark:text-gray-300 text-sm [&_p]:m-0"
                        [innerHTML]="prop.description | markdown | async"
                      ></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- 8. Methods -->
        @if (entry()!.methods?.length) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Methods</h2>
            <div class="space-y-6">
              @for (method of entry()!.methods!; track method.name) {
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div
                    class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap items-center gap-2"
                  >
                    <span
                      class="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100"
                      >{{ method.name }}</span
                    >
                    @if (method.deprecated) {
                      <span class="text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                        >deprecated</span
                      >
                    }
                  </div>
                  <div class="px-4 py-3 space-y-3">
                    <code
                      class="block text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap"
                      >{{ method.signature }}</code
                    >
                    @if (method.description) {
                      <p class="text-sm text-gray-600 dark:text-gray-300">
                        {{ method.description }}
                      </p>
                    }
                    @if (method.params?.length) {
                      <div>
                        <p
                          class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5"
                        >
                          Parameters
                        </p>
                        <table [class]="tableClass">
                          <thead>
                            <tr>
                              <th [class]="thClass">Name</th>
                              <th [class]="thClass">Type</th>
                              <th [class]="thClass">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (p of method.params!; track p.name) {
                              <tr>
                                <td class="font-mono text-sm text-gray-900 dark:text-gray-100">
                                  {{ p.name }}
                                </td>
                                <td [class]="typeTdClass" [innerHTML]="typeHtml(p.type)"></td>
                                <td
                                  class="text-gray-600 dark:text-gray-300 text-sm [&_p]:m-0"
                                  [innerHTML]="p.description | markdown | async"
                                ></td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    }
                    @if (method.returnType) {
                      <div>
                        <p
                          class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1"
                        >
                          Returns
                        </p>
                        <span
                          [class]="typeTdClass"
                          [innerHTML]="typeHtml(method.returnType)"
                        ></span>
                        @if (method.returnDescription) {
                          <span class="ml-2 text-sm text-gray-600 dark:text-gray-300">{{
                            method.returnDescription
                          }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- 9. Type Parameters -->
        @if (entry()!.typeParams?.length) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Type Parameters</h2>
            <div class="overflow-x-auto">
              <table [class]="tableClass">
                <thead>
                  <tr>
                    <th [class]="thClass">Name</th>
                    <th [class]="thClass">Constraint</th>
                    <th [class]="thClass">Default</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tp of entry()!.typeParams!; track tp.name) {
                    <tr>
                      <td class="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {{ tp.name }}
                      </td>
                      <td [class]="typeTdClass" [innerHTML]="typeHtml(tp.constraint ?? '—')"></td>
                      <td [class]="typeTdClass" [innerHTML]="typeHtml(tp.default ?? '—')"></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- 10. Parameters (functions) -->
        @if (entry()!.params?.length) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Parameters</h2>
            <div class="overflow-x-auto">
              <table [class]="tableClass">
                <thead>
                  <tr>
                    <th [class]="thClass">Name</th>
                    <th [class]="thClass">Type</th>
                    <th [class]="thClass">Description</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of entry()!.params!; track p.name) {
                    <tr>
                      <td class="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {{ p.name }}
                      </td>
                      <td [class]="typeTdClass" [innerHTML]="typeHtml(p.type)"></td>
                      <td
                        class="text-gray-600 dark:text-gray-300 text-sm [&_p]:m-0"
                        [innerHTML]="p.description | markdown | async"
                      ></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- 11. Returns (functions) -->
        @if (entry()!.returnType) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Returns</h2>
            <span [class]="typeTdClass" [innerHTML]="typeHtml(entry()!.returnType!)"></span>
            @if (entry()!.returnDescription) {
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {{ entry()!.returnDescription }}
              </p>
            }
          </section>
        }

        <!-- 12. See Also -->
        @if (entry()!.see?.length) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">See Also</h2>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              @for (ref of entry()!.see!; track ref) {
                <li>
                  @if (ref.startsWith('/') || ref.startsWith('http')) {
                    <a [href]="ref" class="text-blue-600 dark:text-blue-400 hover:underline">{{
                      ref
                    }}</a>
                  } @else {
                    <span class="font-mono">{{ ref }}</span>
                  }
                </li>
              }
            </ul>
          </section>
        }

        <!-- 13. Examples -->
        @if (fencedExample(); as fenced) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Examples</h2>
            <div [innerHTML]="fenced | markdown | async"></div>
          </section>
        }

        <!-- Type / shape -->
        @if (entry()!.shape) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Type Definition</h2>
            <code
              class="block font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-purple-700 dark:text-purple-400 break-words whitespace-pre-wrap [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:hover:underline"
              [innerHTML]="safeShapeHtml()"
            ></code>
          </section>
        }

        <!-- Const: value -->
        @if (entry()!.kind === 'const' && entry()!.value) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Value</h2>
            <code
              class="block font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap"
              [innerHTML]="typeHtml(entry()!.value!)"
            ></code>
          </section>
        }

        <!-- Function: signature -->
        @if (entry()!.kind === 'function' && entry()!.signature) {
          <section class="mb-6">
            <h2 [class]="sectionH2Class">Signature</h2>
            <code
              class="block font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap"
              >{{ entry()!.signature }}</code
            >
          </section>
        }
      }
    </div>
  `,
})
export class ApiDetailPageComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ngxMetaService = inject(NgxMetaService);
  private readonly injector = inject(Injector);
  private readonly tocService = inject(TocService);

  private readonly params = toSignal(this.route.params, { initialValue: {} as Params });

  protected readonly symbolName = computed(
    () => (this.params()['symbol'] as string | undefined) ?? '',
  );
  protected readonly kind = computed(() => (this.params()['kind'] as string | undefined) ?? '');
  protected readonly packageName = computed(
    () => (this.params()['package'] as string | undefined) ?? '',
  );

  protected readonly manifest = signal<Record<string, ApiEntry> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly entry = computed<ApiEntry | null>(() => {
    const m = this.manifest();
    if (!m) return null;
    const found = m[this.symbolName()] ?? null;
    if (found && KIND_URL_SEGMENT[found.kind] !== this.kind()) return null;
    return found;
  });

  protected readonly kindLabel = computed(
    () => KIND_LABEL[this.entry()?.kind ?? this.kind()] ?? this.kind(),
  );

  protected readonly modelInputs = computed(
    () => this.entry()?.inputs?.filter((i) => i.isModel) ?? [],
  );
  protected readonly regularInputs = computed(
    () => this.entry()?.inputs?.filter((i) => !i.isModel) ?? [],
  );
  protected readonly hasModels = computed(() => this.modelInputs().length > 0);
  protected readonly hasInputs = computed(() => this.regularInputs().length > 0);
  protected readonly hasOutputs = computed(() => (this.entry()?.outputs?.length ?? 0) > 0);

  /** Wraps the JSDoc `@example` body in a fenced code block so `markdown` pipe highlights it. */
  protected readonly fencedExample = computed<string | undefined>(() => {
    const example = this.entry()?.example;
    return example ? '```typescript\n' + example + '\n```' : undefined;
  });

  protected readonly safeShapeHtml = computed<SafeHtml>(() => {
    const shape = this.entry()?.shape;
    if (!shape) return this.sanitizer.bypassSecurityTrustHtml('');
    const m = this.manifest();
    const html = shape
      .split(/\b/)
      .map((part) => {
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(part)) {
          const entry = m?.[part];
          if (entry) {
            const segment = KIND_URL_SEGMENT[entry.kind];
            if (segment) {
              return `<a href="/docs/api/mat-exp/${segment}/${part}">${part}</a>`;
            }
          }
        }
        return this.escapeHtml(part);
      })
      .join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected readonly thClass = TH_CLASS;
  protected readonly tableClass = TABLE_CLASS;
  protected readonly sectionH2Class = SECTION_H2_CLASS;
  protected readonly typeTdClass = TYPE_TD_CLASS;
  protected readonly typeLinkClass = TYPE_LINK_CLASS;

  protected kindBadgeClass(): string {
    return KIND_BADGE_CLASS[this.entry()?.kind ?? ''] ?? KIND_BADGE_CLASS['const'];
  }

  /**
   * Split a TypeScript type string into tokens. Identifiers that exist in the
   * manifest become linked tokens; everything else is plain text.
   */
  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  protected parseType(typeStr: string): TypeToken[] {
    const m = this.manifest();
    return typeStr.split(/\b/).map((part) => {
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(part)) {
        const entry = m?.[part];
        if (entry) {
          const segment = KIND_URL_SEGMENT[entry.kind];
          if (segment) {
            return { text: part, link: `/docs/api/mat-exp/${segment}/${part}` };
          }
        }
      }
      return { text: part };
    });
  }

  protected typeHtml(typeStr: string): SafeHtml {
    const m = this.manifest();
    const html = typeStr
      .split(/\b/)
      .map((part) => {
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(part)) {
          const entry = m?.[part];
          if (entry) {
            const segment = KIND_URL_SEGMENT[entry.kind];
            if (segment) {
              return `<a href="/docs/api/mat-exp/${segment}/${part}" class="${TYPE_LINK_CLASS}">${part}</a>`;
            }
          }
        }
        return this.escapeHtml(part);
      })
      .join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  constructor() {
    this.tocService.clear();

    this.http
      .get<Record<string, ApiEntry>>('/api-manifest.json')
      .pipe(pendingUntilEvent(this.injector))
      .subscribe({
        next: (m) => {
          this.manifest.set(m);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });

    effect(() => {
      const sym = this.symbolName();
      if (!sym) return;
      const e = this.entry();
      const description = e?.metaDescription ?? e?.description ?? null;
      const path = `/docs/api/${this.packageName()}/${this.kind()}/${sym}`;
      this.ngxMetaService.set({
        title: `${sym} — API Reference`,
        description,
        jsonLd: withBaseJsonLd(
          breadcrumbListJsonLd([
            { name: 'Mat Expressive', path: '/' },
            { name: 'API Reference', path: '/docs/api' },
            { name: this.kindLabel(), path },
            { name: sym, path },
          ]),
        ),
      } satisfies GlobalMetadata & JsonLdMetadata);
    });
  }
}
