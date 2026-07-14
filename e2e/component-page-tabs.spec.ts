import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Tabs architecture is now fully dead (#178): all 6 components have been
// migrated off tabs onto a single markdown page (Button in #177, the
// remaining 5 — icon-button, button-group, split-button, fab-menu,
// loading-indicator — here). `app-doc-tabs` itself is left in place for
// #179 to remove; this file just asserts it's unreachable from every real
// component page and that the old per-tab URLs 404.
// ---------------------------------------------------------------------------

async function waitForPageContent(page: Page) {
  await page.locator('.markdown-body, .not-found, app-playground').first().waitFor({
    state: 'visible',
    timeout: 10_000,
  });
}

const COMPONENTS = [
  { slug: 'button', path: '/docs/components/all-buttons/button' },
  { slug: 'icon-button', path: '/docs/components/all-buttons/icon-button' },
  { slug: 'button-group', path: '/docs/components/all-buttons/button-group' },
  { slug: 'split-button', path: '/docs/components/all-buttons/split-button' },
  { slug: 'fab-menu', path: '/docs/components/all-buttons/fab-menu' },
  {
    slug: 'loading-indicator',
    path: '/docs/components/loading-and-progress/loading-indicator',
  },
] as const;

// ---------------------------------------------------------------------------
// 1. No tab bar anywhere
// ---------------------------------------------------------------------------

test.describe('Tab bar is unreachable — no component page renders it', () => {
  for (const { slug, path } of COMPONENTS) {
    test(`${slug} base path renders with no tab bar`, async ({ page }) => {
      await page.goto(path);
      await waitForPageContent(page);

      await expect(page.locator('app-doc-tabs')).not.toBeVisible();
      await expect(page.locator('.markdown-body')).toBeVisible();
    });
  }

  test('tab bar does NOT appear on a non-component Getting Started page', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    await expect(page.locator('app-doc-tabs')).not.toBeVisible();
  });

  test('tab bar does NOT appear on a Styles API page', async ({ page }) => {
    await page.goto('/docs/styles-api/all-styles');
    await waitForPageContent(page);

    await expect(page.locator('app-doc-tabs')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Old tab URLs 404 (no redirects) for every migrated component
// ---------------------------------------------------------------------------

test.describe('Old tab URLs 404 for every migrated component', () => {
  for (const { slug, path } of COMPONENTS) {
    for (const tab of ['api', 'styling', 'playground'] as const) {
      test(`${slug} old /${tab} URL 404s (no redirect)`, async ({ page }) => {
        await page.goto(`${path}/${tab}`);
        await waitForPageContent(page);

        expect(page.url()).toContain(`${path}/${tab}`);
        await expect(page.locator('.not-found')).toBeVisible();
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Each merged page contains Playground, API, and Styling sections in order
// ---------------------------------------------------------------------------

test.describe('Merged section order — Overview → Playground → API → Styling', () => {
  for (const { slug, path } of COMPONENTS) {
    test(`${slug} page contains the Playground, API, and Styling sections in order`, async ({
      page,
    }) => {
      await page.goto(path);
      await waitForPageContent(page);

      const headings = page.locator('.markdown-body h2');
      const texts = (await headings.allInnerTexts()).map((t) => t.trim());

      expect(texts).toContain('Playground');
      expect(texts).toContain('API');
      expect(texts).toContain('Styling');
      expect(texts.indexOf('Playground')).toBeLessThan(texts.indexOf('API'));
      expect(texts.indexOf('API')).toBeLessThan(texts.indexOf('Styling'));
    });
  }
});
