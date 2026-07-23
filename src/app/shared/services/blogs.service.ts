import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs/operators';

export interface BlogAuthor {
  name: string;
  xHandle?: string;
  avatar?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description?: string;
  publishedOn: string;
  order?: number;
  author: BlogAuthor;
  readTime?: number;
  coverImage?: string;
}

@Injectable({ providedIn: 'root' })
export class BlogsService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  readonly posts$ = this.http
    .get<BlogPost[]>('/blogs-manifest.json')
    .pipe(pendingUntilEvent(this.injector), shareReplay(1));

  readonly posts = toSignal(this.posts$, { initialValue: null });
}
