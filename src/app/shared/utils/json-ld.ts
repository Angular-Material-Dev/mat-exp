import { environment } from '../../../environments/environment';

const SITE_URL = environment.siteUrl;
export const SITE_NAME = 'Mat Expressive';
const LOGO_URL = `${SITE_URL}/angular-material-dev-logo.svg`;
const SAME_AS = [
  'https://github.com/Angular-Material-Dev/mat-exp',
  'https://x.com/ngMaterialDev',
  'https://www.linkedin.com/company/angular-material-dev/',
];

/** Resolves a path (relative to the site root) into an absolute URL. */
export function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

export function organizationJsonLd(): object {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Angular Material Dev',
    url: SITE_URL,
    logo: LOGO_URL,
    sameAs: SAME_AS,
  };
}

export function websiteJsonLd(): object {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function softwareSourceCodeJsonLd(): object {
  return {
    '@type': 'SoftwareSourceCode',
    name: SITE_NAME,
    description:
      'Material 3 Expressive components for Angular Material — GSAP-powered spring motion, zero-config directives, SSR-safe.',
    codeRepository: 'https://github.com/Angular-Material-Dev/mat-exp',
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Angular',
    author: { '@id': `${SITE_URL}/#organization` },
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

/** Builds a `BreadcrumbList` schema from an ordered list of ancestor pages, ending at the current page. */
export function breadcrumbListJsonLd(items: readonly BreadcrumbEntry[]): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface WebPageJsonLdOptions {
  name: string;
  description?: string | null;
  path: string;
}

export function webPageJsonLd(options: WebPageJsonLdOptions): object {
  return {
    '@type': 'WebPage',
    name: options.name,
    description: options.description ?? undefined,
    url: absoluteUrl(options.path),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

export interface TechArticleJsonLdOptions {
  headline: string;
  description?: string | null;
  path: string;
}

export function techArticleJsonLd(options: TechArticleJsonLdOptions): object {
  return {
    '@type': 'TechArticle',
    headline: options.headline,
    description: options.description ?? undefined,
    url: absoluteUrl(options.path),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    author: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Combines the sitewide Organization + WebSite graph with page-specific JSON-LD nodes. */
export function withBaseJsonLd(...extra: readonly object[]): object[] {
  return [organizationJsonLd(), websiteJsonLd(), ...extra];
}
