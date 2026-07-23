import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { BlogsService } from '../../shared/services/blogs.service';
import { breadcrumbListJsonLd, webPageJsonLd, withBaseJsonLd } from '../../shared/utils/json-ld';

const PAGE_DESCRIPTION = 'Announcements, releases, and updates from the Mat Expressive team.';

@Component({
  selector: 'app-blogs-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './blogs-index-page.component.html',
})
export class BlogsIndexPageComponent {
  private readonly blogsService = inject(BlogsService);
  protected readonly posts = this.blogsService.posts;
  protected readonly description = PAGE_DESCRIPTION;

  constructor() {
    inject(NgxMetaService).set({
      title: 'Blogs',
      description: PAGE_DESCRIPTION,
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd([
          { name: 'Mat Expressive', path: '/' },
          { name: 'Blogs', path: '/blogs' },
        ]),
        webPageJsonLd({ name: 'Blogs', description: PAGE_DESCRIPTION, path: '/blogs' }),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
  }
}
