import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { MatIcon } from '@angular/material/icon';
import { from, map, of, switchMap } from 'rxjs';
import { MarkdownComponent } from '../../docs/markdown/markdown.component';
import { RouteHandlerComponent } from '../../shared/components/route-handler.component';
import { BlogPost, BlogsService } from '../../shared/services/blogs.service';
import { MarkdownService } from '../../shared/services/markdown.service';
import {
  absoluteUrl,
  blogPostingJsonLd,
  breadcrumbListJsonLd,
  withBaseJsonLd,
} from '../../shared/utils/json-ld';
import { MatAnchor } from '@angular/material/button';
import { MatExpButton } from '@ngm-dev/mat-exp';

interface DetailState {
  post: BlogPost | null;
  html: string;
}

@Component({
  selector: 'app-blog-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, MarkdownComponent, RouteHandlerComponent, MatAnchor, MatExpButton],
  templateUrl: './blog-detail-page.component.html',
})
export class BlogDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly blogsService = inject(BlogsService);
  private readonly markdownService = inject(MarkdownService);
  private readonly ngxMetaService = inject(NgxMetaService);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { requireSync: true },
  );

  private readonly slugAndPosts = computed(() => ({
    slug: this.slug(),
    posts: this.blogsService.posts(),
  }));

  protected readonly state = toSignal(
    toObservable(this.slugAndPosts).pipe(
      switchMap(({ slug, posts }) => {
        // Manifest hasn't loaded yet — stay in the loading state.
        if (posts === null) return of(null);
        const post = posts.find((p) => p.slug === slug) ?? null;
        if (!post) return of<DetailState>({ post: null, html: '' });
        return this.http.get(`/blogs/${slug}.md`, { responseType: 'text' }).pipe(
          switchMap((raw) => from(this.markdownService.renderMarkdown(raw))),
          map((html) => ({ post, html }) satisfies DetailState),
        );
      }),
    ),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      const post = this.state()?.post;
      if (post) {
        this.setPageMetadata(post);
      } else {
        this.ngxMetaService.set({});
      }
    });
  }

  private setPageMetadata(post: BlogPost): void {
    const description = post.description ?? null;
    const path = `/blogs/${post.slug}`;

    this.ngxMetaService.set({
      title: post.title,
      description,
      image: post.coverImage ? { url: absoluteUrl(post.coverImage), alt: post.title } : undefined,
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd([
          { name: 'Mat Expressive', path: '/' },
          { name: 'Blogs', path: '/blogs' },
          { name: post.title, path },
        ]),
        blogPostingJsonLd({
          headline: post.title,
          description,
          path,
          image: post.coverImage,
          authorName: post.author.name,
          authorUrl: post.author.xHandle ? `https://x.com/${post.author.xHandle}` : undefined,
        }),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
  }
}
