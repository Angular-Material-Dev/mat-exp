import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Signal,
  effect,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { environment } from '../../environments/environment';
import { MarkdownComponent } from '../docs/markdown/markdown.component';
import { MarkdownService, parseFrontmatter } from '../shared/services/markdown.service';
import { breadcrumbListJsonLd, webPageJsonLd, withBaseJsonLd } from '../shared/utils/json-ld';
import { DocPageMetaComponent } from '../docs/doc-page-meta/doc-page-meta.component';

@Component({
  selector: 'app-static-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarkdownComponent, DocPageMetaComponent],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-12">
      @if (content(); as c) {
        @if (c.title) {
          <h1 class="doc-page-title">{{ c.title }}</h1>
        }
        <app-doc-page-meta [editPageUrl]="editPageUrl" [rawMarkdownUrl]="rawMarkdownUrl" />
        <app-markdown [html]="c.html" />
      }
    </div>
  `,
  styles: `
    .doc-page-title {
      font: var(--mat-sys-headline-large);
      margin-bottom: 1.5rem;
    }
  `,
})
export class StaticPageComponent {
  private readonly http = inject(HttpClient);
  private readonly markdownService = inject(MarkdownService);
  private readonly injector = inject(Injector);
  private readonly ngxMetaService = inject(NgxMetaService);

  protected readonly rawMarkdownUrl: string;
  protected readonly editPageUrl: string;
  protected readonly content: Signal<{
    title: string;
    description: string | null;
    html: string;
  } | null>;

  constructor() {
    const routePath = inject(Router).url.split('?')[0].split('#')[0];
    this.rawMarkdownUrl = `${routePath}/index.md`;
    this.editPageUrl = `${environment.githubRepoUrl}/edit/${environment.githubBranch}/public${this.rawMarkdownUrl}`;
    this.content = toSignal(
      this.http.get(this.rawMarkdownUrl, { responseType: 'text' }).pipe(
        switchMap((raw) => {
          const { frontmatter, body } = parseFrontmatter(raw);
          const title = (frontmatter['title'] as string | undefined) ?? '';
          const description = (frontmatter['description'] as string | undefined) ?? null;
          return from(this.markdownService.renderMarkdown(body)).pipe(
            map((html) => ({ title, description, html })),
          );
        }),
        catchError(() => of({ title: '', description: null, html: '' })),
        pendingUntilEvent(this.injector),
      ),
      { initialValue: null },
    );

    effect(() => {
      const c = this.content();
      if (!c || !c.title) return;
      this.ngxMetaService.set({
        title: c.title,
        description: c.description,
        jsonLd: withBaseJsonLd(
          breadcrumbListJsonLd([
            { name: 'Mat Expressive', path: '/' },
            { name: c.title, path: routePath },
          ]),
          webPageJsonLd({
            name: c.title,
            description: c.description,
            path: routePath,
          }),
        ),
      } satisfies GlobalMetadata & JsonLdMetadata);
    });
  }
}
