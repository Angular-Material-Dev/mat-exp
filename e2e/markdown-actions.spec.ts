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

const editBtn = (page: Page) => page.locator('.markdown-actions a.edit-page-link');
const viewBtn = (page: Page) => page.locator('.markdown-actions a.view-markdown-link');
const copyBtn = (page: Page) => page.locator('.markdown-actions button.copy-markdown-button');
const actionsRow = (page: Page) => page.locator('.markdown-actions');

// ---------------------------------------------------------------------------
// 1. Button visibility — shown on markdown tabs, hidden elsewhere
// ---------------------------------------------------------------------------

test.describe('Markdown action buttons — visibility', () => {
  test('all three buttons appear on a Getting Started page (no tabs)', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(actionsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(viewBtn(page)).toBeVisible();
    await expect(copyBtn(page)).toBeVisible();
  });

  test('all three buttons appear on a component Overview tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdownContent(page);

    await expect(actionsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(viewBtn(page)).toBeVisible();
    await expect(copyBtn(page)).toBeVisible();
  });

  test('all three buttons appear on the API tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForMarkdownContent(page);

    await expect(actionsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(viewBtn(page)).toBeVisible();
    await expect(copyBtn(page)).toBeVisible();
  });

  test('all three buttons appear on the Styling tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/styling');
    await waitForMarkdownContent(page);

    await expect(actionsRow(page)).toBeVisible();
    await expect(editBtn(page)).toBeVisible();
    await expect(viewBtn(page)).toBeVisible();
    await expect(copyBtn(page)).toBeVisible();
  });

  test('buttons are NOT shown on the Playground tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/playground');
    await waitForPageContent(page);

    await expect(actionsRow(page)).not.toBeVisible();
  });

  test('buttons are NOT shown on a not-found page', async ({ page }) => {
    await page.goto('/docs/this/route/does/not/exist');
    await waitForPageContent(page);

    await expect(actionsRow(page)).not.toBeVisible();
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
      'https://github.com/Angular-Material-Dev/mat-expressive/edit/main/public/docs/getting-started/installation/index.md',
    );
  });

  test('has correct href pointing to GitHub edit mode for the API tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForMarkdownContent(page);

    const href = await editBtn(page).getAttribute('href');
    expect(href).toBe(
      'https://github.com/Angular-Material-Dev/mat-expressive/edit/main/public/docs/components/all-buttons/button/api.md',
    );
  });

  test('has target="_blank"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(editBtn(page)).toHaveAttribute('target', '_blank');
  });

  test('has rel="noopener"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(editBtn(page)).toHaveAttribute('rel', 'noopener');
  });
});

// ---------------------------------------------------------------------------
// 3. "View markdown" link — correct href, target and rel
// ---------------------------------------------------------------------------

test.describe('"View markdown" link', () => {
  test('has correct href pointing to the raw index.md for a Getting Started page', async ({
    page,
  }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const href = await viewBtn(page).getAttribute('href');
    expect(href).toBe('/docs/getting-started/installation/index.md');
  });

  test('has correct href pointing to the raw api.md for the API tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForMarkdownContent(page);

    const href = await viewBtn(page).getAttribute('href');
    expect(href).toBe('/docs/components/all-buttons/button/api.md');
  });

  test('has correct href pointing to the raw styling.md for the Styling tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/styling');
    await waitForMarkdownContent(page);

    const href = await viewBtn(page).getAttribute('href');
    expect(href).toBe('/docs/components/all-buttons/button/styling.md');
  });

  test('has target="_blank"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(viewBtn(page)).toHaveAttribute('target', '_blank');
  });

  test('has rel="noopener"', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(viewBtn(page)).toHaveAttribute('rel', 'noopener');
  });

  test('href updates when navigating between tabs', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdownContent(page);

    const overviewHref = await viewBtn(page).getAttribute('href');
    expect(overviewHref).toBe('/docs/components/all-buttons/button/index.md');

    await page.goto('/docs/components/all-buttons/button/api');
    await waitForMarkdownContent(page);

    const apiHref = await viewBtn(page).getAttribute('href');
    expect(apiHref).toBe('/docs/components/all-buttons/button/api.md');
  });
});

// ---------------------------------------------------------------------------
// 4. "Copy markdown" button — clipboard and label feedback
// ---------------------------------------------------------------------------

test.describe('"Copy markdown" button', () => {
  test('has the label "Copy markdown" by default', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await expect(copyBtn(page)).toHaveText('Copy markdown');
  });

  // clipboard-write is only a recognised Playwright permission in Chromium;
  // Firefox and WebKit use OS-level clipboard access tied to user gesture.
  test('clicking it writes the raw markdown to the clipboard', async ({
    page,
    context,
    browserName,
  }) => {
    // clipboard-read/write are only recognised Playwright permissions in Chromium
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await copyBtn(page).click();

    // Wait for the async fetch + clipboard write
    await page.waitForTimeout(1000);

    // Only assert clipboard content in Chromium where write permission is granted reliably
    if (browserName === 'chromium') {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      // The raw markdown file must start with frontmatter or a heading
      expect(clipboardText.trim().length).toBeGreaterThan(0);
      // Sanity check: raw markdown should not contain rendered HTML tags
      expect(clipboardText).not.toMatch(/<html|<!DOCTYPE/i);
    }
  });

  test('label changes to "Copied!" after a successful click', async ({
    page,
    context,
    browserName,
  }) => {
    // clipboard-read/write are only recognised Playwright permissions in Chromium
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await copyBtn(page).click();

    await expect(copyBtn(page)).toHaveText('Copied!', { timeout: 5000 });
  });

  test('label reverts to "Copy markdown" after ~2 seconds', async ({
    page,
    context,
    browserName,
  }) => {
    // clipboard-read/write are only recognised Playwright permissions in Chromium
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    await copyBtn(page).click();

    // Confirm it went to "Copied!" first
    await expect(copyBtn(page)).toHaveText('Copied!', { timeout: 5000 });

    // Then confirm it reverts
    await expect(copyBtn(page)).toHaveText('Copy markdown', { timeout: 4000 });
  });

  test('label updates correctly after re-clicking on the same page', async ({
    page,
    context,
    browserName,
  }) => {
    // clipboard-read/write are only recognised Playwright permissions in Chromium
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    // First copy cycle
    await copyBtn(page).click();
    await expect(copyBtn(page)).toHaveText('Copied!', { timeout: 5000 });
    await expect(copyBtn(page)).toHaveText('Copy markdown', { timeout: 4000 });

    // Second copy cycle
    await copyBtn(page).click();
    await expect(copyBtn(page)).toHaveText('Copied!', { timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Button labels and roles
// ---------------------------------------------------------------------------

test.describe('Button attributes and accessibility', () => {
  test('"Edit this page" is an anchor element', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const tagName = await editBtn(page).evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

  test('"View markdown" is an anchor element', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const tagName = await viewBtn(page).evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

  test('"Copy markdown" is a button element', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const tagName = await copyBtn(page).evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');
  });

  test('buttons appear before the markdown body', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdownContent(page);

    const actionsY = await actionsRow(page).evaluate((el) => el.getBoundingClientRect().top);
    const markdownY = await page
      .locator('.markdown-body')
      .evaluate((el) => el.getBoundingClientRect().top);

    expect(actionsY).toBeLessThan(markdownY);
  });
});
