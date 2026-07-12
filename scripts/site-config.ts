import * as path from 'node:path';

/** Production origin `main` is deployed to. */
export const SITE_URL = 'https://expressive.angular-material.dev';

export const SITE_NAME = 'Mat Expressive';

export const SITE_DESCRIPTION =
  'Material 3 Expressive components for Angular Material — GSAP-powered spring motion, zero-config directives, SSR-safe.';

/** `ng build` output directory for the docs app. */
export const DIST_BROWSER_DIR = path.resolve(process.cwd(), 'dist/mat-expressive-docs/browser');

export const ROUTES_OUT = path.resolve(process.cwd(), 'public/routes.txt');
export const NAV_MANIFEST_OUT = path.resolve(process.cwd(), 'public/nav-manifest.json');
