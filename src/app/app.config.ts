import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import {
  ANGULAR_ROUTER_URL,
  provideNgxMetaCore,
  withNgxMetaBaseUrl,
  withNgxMetaDefaults,
  withNgxMetaTitleFormatter,
} from '@davidlj95/ngx-meta/core';
import { provideNgxMetaRouting } from '@davidlj95/ngx-meta/routing';
import { provideNgxMetaStandard } from '@davidlj95/ngx-meta/standard';
import { provideNgxMetaOpenGraph, OPEN_GRAPH_TYPE_WEBSITE } from '@davidlj95/ngx-meta/open-graph';
import {
  provideNgxMetaTwitterCard,
  TWITTER_CARD_TYPE_SUMMARY,
} from '@davidlj95/ngx-meta/twitter-card';
import { provideNgxMetaJsonLd } from '@davidlj95/ngx-meta/json-ld';

import { routes } from './app.routes';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { environment } from '../environments/environment';
import { SITE_NAME, absoluteUrl } from './shared/utils/json-ld';
import { CustomElementsService } from './shared/services/custom-elements.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideNgxMetaCore(
      withNgxMetaBaseUrl(environment.siteUrl),
      withNgxMetaDefaults({
        title: SITE_NAME,
        description:
          'Material 3 Expressive components for Angular Material — GSAP-powered spring motion, zero-config directives, SSR-safe.',
        applicationName: SITE_NAME,
        canonicalUrl: ANGULAR_ROUTER_URL,
        locale: 'en',
        image: { url: absoluteUrl('/mat-exp-cover.png'), alt: SITE_NAME },
        standard: {
          generator: true,
          author: 'Angular Material Dev',
          keywords: [
            'Angular',
            'Angular Material',
            'Material Design 3',
            'Material Expressive',
            'Angular components',
            'GSAP animations',
          ],
        },
        openGraph: { type: OPEN_GRAPH_TYPE_WEBSITE },
        twitterCard: {
          card: TWITTER_CARD_TYPE_SUMMARY,
          site: '@ngMaterialDev',
          creator: '@ngMaterialDev',
        },
      }),
      // Every page sets a short, topic-only title (e.g. "Button", "Changelog");
      // this appends the site name once, in the single place titles are formatted.
      withNgxMetaTitleFormatter((title) =>
        title === SITE_NAME ? title : `${title} | ${SITE_NAME}`,
      ),
    ),
    provideNgxMetaRouting(),
    provideNgxMetaStandard(),
    provideNgxMetaOpenGraph(),
    provideNgxMetaTwitterCard(),
    provideNgxMetaJsonLd(),
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined',
      },
    },
    // CDK's native-Popover-API overlay strategy (default since Angular 21) inserts the
    // overlay pane as a light-DOM descendant of its trigger instead of appending it to a
    // global `.cdk-overlay-container` on <body>. Descendants of a `createCustomElement`
    // host (see PlaygroundPreviewElementComponent) never get their popover shown in that
    // mode — MatSelect/MatMenu panels attach but stay `display: none` — so opt every
    // overlay in the app back into the classic container-based strategy.
    {
      provide: OVERLAY_DEFAULT_CONFIG,
      useValue: { usePopover: false },
    },
    // Registers every markdown-embeddable custom element (see CustomElementsService) once,
    // at bootstrap. Not awaited: each element's component still loads via its own dynamic
    // import(), so this doesn't block the app from becoming interactive.
    provideAppInitializer(() => {
      inject(CustomElementsService).registerAll();
    }),
  ],
};
