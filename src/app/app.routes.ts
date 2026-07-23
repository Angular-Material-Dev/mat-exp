import { Routes } from '@angular/router';
import { sectionRedirectGuard } from './shell/section-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/standalone-shell/standalone-shell.component').then(
        (m) => m.StandaloneShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./landing-page/landing-page.component').then((m) => m.LandingPageComponent),
      },
      {
        path: 'sponsor',
        loadComponent: () =>
          import('./sponsor-page/sponsor-page.component').then((m) => m.SponsorPageComponent),
      },
      {
        path: 'blogs',
        pathMatch: 'full',
        loadComponent: () =>
          import('./blogs/blogs-index-page/blogs-index-page.component').then(
            (m) => m.BlogsIndexPageComponent,
          ),
      },
      {
        path: 'blogs/:slug',
        loadComponent: () =>
          import('./blogs/blog-detail-page/blog-detail-page.component').then(
            (m) => m.BlogDetailPageComponent,
          ),
      },
    ],
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./shell/docs-shell/docs-shell.component').then((m) => m.DocsShellComponent),
    children: [
      {
        path: 'api',
        loadComponent: () =>
          import('./docs/api-index-page/api-index-page.component').then(
            (m) => m.ApiIndexPageComponent,
          ),
      },
      {
        path: 'api/:package/:kind/:symbol',
        loadComponent: () =>
          import('./docs/api-detail-page/api-detail-page.component').then(
            (m) => m.ApiDetailPageComponent,
          ),
      },
      {
        path: '**',
        canActivate: [sectionRedirectGuard],
        loadComponent: () =>
          import('./docs/doc-page/doc-page.component').then((m) => m.DocPageComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shell/standalone-shell/standalone-shell.component').then(
        (m) => m.StandaloneShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./not-found-page/not-found-page.component').then((m) => m.NotFoundPageComponent),
      },
    ],
  },
];
