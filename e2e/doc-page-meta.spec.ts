import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForMarkdownContent(page: Page) {
  await page.locator('.markdown-body').first().waitFor({ state: 'visible', timeout: 10_000 });
}

async function waitForPageContent(page: Page) {
  await page
    .locator('.markdown-body, .not-found, app-playground')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
}

const editBtn = (page: Page) => page.locator('app-doc-page-meta a.edit-page-link');
const llmsBtn = (page: Page) => page.locator('app-doc-page-meta a.llms-md-link');
const designBtn = (page: Page) => page.locator('app-doc-page-meta a.design-link');
const sourceFolderBtn = (page: Page) =>
  page.locator('app-doc-page-meta a', { hasText: 'View source folder' });
const reportIssueBtn = (page: Page) =>
  page.locator('app-doc-page-meta a', { hasText: 'Report an issue' });
const importCard = (page: Page) =>
  page.locator('app-doc-page-meta mat-card-subtitle', { hasText: 'Import Statement' });
// "Docs Row" visibility is represented by the Edit-this-page link — the two
// always render together (both gated on showDocsRow()).
const docsRow = editBtn;

// ---------------------------------------------------------------------------
// 1. Docs Row visibility — shown on markdown pages, hidden elsewhere
// ---------------------------------------------------------------------------

test.describe('Docs Row — visibility', () => {
  test('appears on a Getting Started page (no tabs)', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(docsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(llmsBtn(page)).toBeVisible();
  });

  test('appears on a component page (single-page since #177/#178)', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForMarkdownContent(page);

    await expect(docsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(llmsBtn(page)).toBeVisible();
  });

  test('is NOT shown on a not-found page', async ({ page }) => {
    await page.goto('/docs/this/route/does/not/exist');
    await waitForPageContent(page);

    await expect(docsRow(page)).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. "Edit this page" link — correct href, target and rel
// ---------------------------------------------------------------------------

test.describe('"Edit this page" link', () => {
  test('has correct href pointing to GitHub edit mode for a Getting Started page', async ({
    page,
  }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const href = await editBtn(page).getAttribute('href');
    expect(href).toBe(
      'https://github.com/Angular-Material-Dev/mat-expr/edit/main/public/docs/getting-started/installation/index.md',
    );
  });

  test('has correct href pointing to GitHub edit mode for a component page', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForMarkdownContent(page);

    const href = await editBtn(page).getAttribute('href');
    expect(href).toBe(
      'https://github.com/Angular-Material-Dev/mat-expr/edit/main/public/docs/components/all-buttons/icon-button/index.md',
    );
  });

  test('has target="_blank"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(editBtn(page)).toHaveAttribute('target', '_blank');
  });

  test('has rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(editBtn(page)).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// ---------------------------------------------------------------------------
// 3. "LLMs.md" link — correct href, target and rel
// ---------------------------------------------------------------------------

test.describe('"LLMs.md" link', () => {
  test('has correct href pointing to the raw index.md for a Getting Started page', async ({
    page,
  }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const href = await llmsBtn(page).getAttribute('href');
    expect(href).toBe('/docs/getting-started/installation/index.md');
  });

  test('has correct href pointing to the raw index.md for a component page', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForMarkdownContent(page);

    const href = await llmsBtn(page).getAttribute('href');
    expect(href).toBe('/docs/components/all-buttons/icon-button/index.md');
  });

  test('has target="_blank"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(llmsBtn(page)).toHaveAttribute('target', '_blank');
  });

  test('has rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(llmsBtn(page)).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('href updates when navigating between different pages', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForMarkdownContent(page);

    const iconButtonHref = await llmsBtn(page).getAttribute('href');
    expect(iconButtonHref).toBe('/docs/components/all-buttons/icon-button/index.md');

    await page.goto('/docs/components/all-buttons/button-group');
    await waitForMarkdownContent(page);

    const buttonGroupHref = await llmsBtn(page).getAttribute('href');
    expect(buttonGroupHref).toBe('/docs/components/all-buttons/button-group/index.md');
  });
});

// ---------------------------------------------------------------------------
// 4. "Design" link — only rendered when frontmatter sets `designUrl`
// ---------------------------------------------------------------------------

test.describe('"Design" link', () => {
  test('is absent by default (no designUrl in frontmatter)', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(designBtn(page)).toHaveCount(0);
  });

  test('renders and links out when the page frontmatter sets designUrl', async ({ page }) => {
    await page.route('**/docs/getting-started/installation/index.md', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: [
          '---',
          'title: Installation',
          'description: Test fixture with a designUrl.',
          'designUrl: https://example.com/design-file',
          '---',
          '',
          '# Installation',
        ].join('\n'),
      });
    });

    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(designBtn(page)).toBeVisible();
    await expect(designBtn(page)).toHaveAttribute('href', 'https://example.com/design-file');
    await expect(designBtn(page)).toHaveAttribute('target', '_blank');
    await expect(designBtn(page)).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// ---------------------------------------------------------------------------
// 5. Import Row — Component Pages only, sourced from primarySymbol frontmatter
// ---------------------------------------------------------------------------

test.describe('Import Row', () => {
  test('appears on a Component Page with the import statement', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdownContent(page);

    await expect(importCard(page)).toBeVisible();
    await expect(page.locator('app-doc-page-meta app-code')).toContainText(
      "import { MatExpButton } from '@ngm-dev/mat-exp';",
    );
  });

  test('is absent on a non-component page (no primarySymbol)', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(importCard(page)).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// 6. GitHub Row — Component Pages only, source folder + report issue links
// ---------------------------------------------------------------------------

test.describe('GitHub Row', () => {
  test('appears on a Component Page with correct source-folder and issue links', async ({
    page,
  }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdownContent(page);

    await expect(sourceFolderBtn(page)).toBeVisible();
    await expect(sourceFolderBtn(page)).toHaveAttribute(
      'href',
      'https://github.com/Angular-Material-Dev/mat-expr/tree/main/projects/ngm-dev/mat-exp/src/lib/components/all-buttons/button',
    );

    await expect(reportIssueBtn(page)).toBeVisible();
    const issueHref = await reportIssueBtn(page).getAttribute('href');
    expect(issueHref).toBe(
      'https://github.com/Angular-Material-Dev/mat-expr/issues/new?title=%5BButton%5D%20',
    );
  });

  test('is absent on a non-component page (no primarySymbol)', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(sourceFolderBtn(page)).toHaveCount(0);
    await expect(reportIssueBtn(page)).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Structure and accessibility
// ---------------------------------------------------------------------------

test.describe('Docs Row structure', () => {
  test('"Edit this page" is an anchor element', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const tagName = await editBtn(page).evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

  test('"LLMs.md" is an anchor element', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const tagName = await llmsBtn(page).evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

  test('row appears before the markdown body', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const rowY = await docsRow(page).evaluate((el) => el.getBoundingClientRect().top);
    const markdownY = await page
      .locator('.markdown-body')
      .evaluate((el) => el.getBoundingClientRect().top);

    expect(rowY).toBeLessThan(markdownY);
  });

  test('"View markdown" and "Copy markdown" no longer exist anywhere in the UI', async ({
    page,
  }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(page.getByRole('link', { name: 'View markdown' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /copy markdown/i })).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// 8. Docs Row on non-component Doc Pages rendered via StaticPageComponent
// ---------------------------------------------------------------------------

test.describe('Docs Row on the Changelog page', () => {
  test('appears with Edit this page and LLMs.md', async ({ page }) => {
    await page.goto('/changelog');
    await waitForMarkdownContent(page);

    await expect(docsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(llmsBtn(page)).toBeVisible();

    const editHref = await editBtn(page).getAttribute('href');
    expect(editHref).toBe(
      'https://github.com/Angular-Material-Dev/mat-expr/edit/main/public/changelog/index.md',
    );
    const llmsHref = await llmsBtn(page).getAttribute('href');
    expect(llmsHref).toBe('/changelog/index.md');
  });
});
