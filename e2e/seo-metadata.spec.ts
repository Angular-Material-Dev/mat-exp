import { test, expect, type Page } from '@playwright/test';

async function waitForPageContent(page: Page) {
  const loading = page.locator('.loading-state');
  await loading.waitFor({ state: 'attached', timeout: 10_000 }).catch(() => undefined);
  await loading.waitFor({ state: 'detached', timeout: 10_000 }).catch(() => undefined);
  await page
    .locator('.markdown-body, .not-found, app-playground')
    .first()
    .waitFor({ state: 'visible', timeout: 20_000 });
}

/** Waits until `document.title` equals `expected`, tolerating the async fetch that sets it. */
async function waitForTitle(page: Page, expected: string) {
  await page.waitForFunction((title) => document.title === title, expected, { timeout: 20_000 });
}

/** Reads every `<script type="application/ld+json">` on the page as parsed JSON objects. */
async function getJsonLdNodes(page: Page): Promise<Record<string, unknown>[]> {
  await page
    .locator('script[type="application/ld+json"]')
    .first()
    .waitFor({ state: 'attached', timeout: 20_000 });
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  expect(raw, 'expected a JSON-LD <script> tag to be present').not.toBeNull();
  const parsed: unknown = JSON.parse(raw ?? '[]');
  return Array.isArray(parsed)
    ? (parsed as Record<string, unknown>[])
    : [parsed as Record<string, unknown>];
}

function typesOf(nodes: Record<string, unknown>[]): unknown[] {
  return nodes.map((n) => n['@type']);
}

// ---------------------------------------------------------------------------
// 1. Page titles — every route gets "<Page> | Mat Expressive", never bare
// ---------------------------------------------------------------------------

test.describe('SEO — page titles include the site name', () => {
  test('home page title is suffixed with the site name', async ({ page }) => {
    await page.goto('/');
    await waitForTitle(page, 'Expressive Motion for Angular Material | Mat Expressive');
  });

  test('a docs content page title is "<Title> | Mat Expressive"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    await waitForTitle(page, 'Installation | Mat Expressive');
  });

  test('a static page (changelog) title is suffixed', async ({ page }) => {
    await page.goto('/changelog');
    await waitForTitle(page, 'Changelog | Mat Expressive');
  });

  test('not-found page title is suffixed too', async ({ page }) => {
    await page.goto('/this/route/does/not/exist');
    await waitForTitle(page, 'Page not found | Mat Expressive');
  });

  test('API detail page title includes the symbol name and the site-name suffix', async ({
    page,
  }) => {
    await page.goto('/docs/api/mat-exp/directives/MatExpButton');
    await page.waitForFunction(
      () => document.title.includes('MatExpButton') && document.title.endsWith('| Mat Expressive'),
      { timeout: 20_000 },
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Component Pages — single page since #177/#178, title is just the
//    frontmatter title with no tab suffix (there are no tabs left to prefix).
// ---------------------------------------------------------------------------

test.describe('SEO — Component Page titles have no tab suffix', () => {
  test('Button page title has no tab suffix', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);
    await waitForTitle(page, 'Button | Mat Expressive');
  });

  test('Icon Button page title has no tab suffix', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForPageContent(page);
    await waitForTitle(page, 'Icon Button | Mat Expressive');
  });

  test('Button Group page title has no tab suffix', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button-group');
    await waitForPageContent(page);
    await waitForTitle(page, 'Button Group | Mat Expressive');
  });
});

// ---------------------------------------------------------------------------
// 3. Meta description + canonical URL
// ---------------------------------------------------------------------------

test.describe('SEO — description and canonical URL', () => {
  test('home page has a non-empty meta description', async ({ page }) => {
    await page.goto('/');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    expect(await description.getAttribute('content')).not.toBe('');
  });

  test('a docs page has a canonical URL pointing at its own path', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    const href = await canonical.getAttribute('href');
    // The origin reflects environment.siteUrl (prod domain in production builds,
    // localhost in dev) — only the path is meaningful to assert on here.
    expect(href).toMatch(/^https?:\/\/[^/]+\/docs\/getting-started\/installation$/);
  });

  test('a static page (changelog) has a non-empty meta description', async ({ page }) => {
    await page.goto('/changelog');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    expect(await description.getAttribute('content')).not.toBe('');
  });
});

// ---------------------------------------------------------------------------
// 4. Open Graph + Twitter Card metadata
// ---------------------------------------------------------------------------

test.describe('SEO — Open Graph and Twitter Card tags', () => {
  test('home page has og:title, og:type, and a twitter:card', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  });

  test('a docs page og:title matches the formatted page title', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    await waitForTitle(page, 'Installation | Mat Expressive');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Installation | Mat Expressive',
    );
  });
});

// ---------------------------------------------------------------------------
// 5. JSON-LD structured data
// ---------------------------------------------------------------------------

test.describe('SEO — JSON-LD structured data', () => {
  test('home page includes Organization, WebSite, and SoftwareSourceCode nodes', async ({
    page,
  }) => {
    await page.goto('/');
    const types = typesOf(await getJsonLdNodes(page));
    expect(types).toEqual(
      expect.arrayContaining(['Organization', 'WebSite', 'SoftwareSourceCode']),
    );
  });

  test('a docs page includes BreadcrumbList and TechArticle nodes', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);
    const nodes = await getJsonLdNodes(page);
    const types = typesOf(nodes);
    expect(types).toEqual(
      expect.arrayContaining(['Organization', 'WebSite', 'BreadcrumbList', 'TechArticle']),
    );

    const breadcrumb = nodes.find((n) => n['@type'] === 'BreadcrumbList') as {
      itemListElement: { name: string; item: string }[];
    };
    const names = breadcrumb.itemListElement.map((i) => i.name);
    expect(names[0]).toBe('Mat Expressive');
    expect(names[names.length - 1]).toBe('Button');
  });

  test('API detail page includes a BreadcrumbList ending with the symbol name', async ({
    page,
  }) => {
    await page.goto('/docs/api/mat-exp/directives/MatExpButton');
    const nodes = await getJsonLdNodes(page);
    const breadcrumb = nodes.find((n) => n['@type'] === 'BreadcrumbList') as {
      itemListElement: { name: string }[];
    };
    expect(breadcrumb.itemListElement.at(-1)?.name).toBe('MatExpButton');
  });
});

// ---------------------------------------------------------------------------
// 6. robots.txt
// ---------------------------------------------------------------------------

test.describe('robots.txt — static asset', () => {
  test('robots.txt is served with HTTP 200', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.ok()).toBe(true);
  });

  test('robots.txt allows crawling and references the sitemap', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    const text = await response.text();
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://expressive.angular-material.dev/sitemap.xml');
  });
});
