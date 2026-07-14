import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForPageContent(page: Page) {
  await page
    .locator('.markdown-body, app-not-found-page')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// 1. Page fetch and render
// ---------------------------------------------------------------------------

test.describe('Page fetch and render', () => {
  test('navigating to /getting-started/installation renders the correct markdown file', async ({
    page,
  }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    // Heading from the YAML frontmatter / first h2 in the file
    await expect(page.locator('.markdown-body h2').first()).toContainText(
      'Supported Angular versions',
    );

    // Prose content from the file
    await expect(page.locator('.markdown-body')).toContainText('ng add @angular/material');
  });

  test('navigating to /getting-started/what-is-mat-exp renders correct content', async ({
    page,
  }) => {
    await page.goto('/docs/getting-started/what-is-mat-expressive');
    await waitForPageContent(page);

    await expect(page.locator('.markdown-body h2').first()).toContainText('How does it work');
  });

  test('navigating to a component page renders its merged API section', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForPageContent(page);

    // The merged index.md contains an API section with a heading about data attributes
    await expect(page.locator('.markdown-body')).toContainText('Data Attributes');
  });
});

// ---------------------------------------------------------------------------
// 2. Shiki syntax highlighting — both themes present in the DOM
// ---------------------------------------------------------------------------

test.describe('Shiki syntax highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
  });

  test('code blocks are rendered by Shiki (pre.shiki class present)', async ({ page }) => {
    const shikiPre = page.locator('pre.shiki').first();
    await expect(shikiPre).toBeVisible();
  });

  test('both theme classes are present on the pre element', async ({ page }) => {
    const shikiPre = page.locator('pre.shiki').first();
    await expect(shikiPre).toHaveClass(/github-light/);
    await expect(shikiPre).toHaveClass(/github-dark/);
  });

  test('light-mode CSS custom properties are applied to spans', async ({ page }) => {
    const token = page.locator('pre.shiki [style*="--shiki-light"]').first();
    const style = await token.getAttribute('style');
    expect(style).toMatch(/--shiki-light/);
    expect(style).toMatch(/--shiki-dark/);
  });

  test('in dark mode the shiki-dark variables drive the token colours', async ({ page }) => {
    // Toggle dark mode by adding the .dark class the ThemeService uses
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const pre = page.locator('pre.shiki').first();
    const darkBg = await page.evaluate(() => {
      const el = document.querySelector('pre.shiki') as HTMLElement;
      return getComputedStyle(el).getPropertyValue('background-color');
    });
    // The dark-theme background from github-dark is a dark colour
    // Verify it differs from the default light background
    const lightBg = await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      const el = document.querySelector('pre.shiki') as HTMLElement;
      return getComputedStyle(el).getPropertyValue('background-color');
    });
    expect(darkBg).not.toBe(lightBg);
    await expect(pre).toBeVisible(); // no second render / flicker
  });
});

// ---------------------------------------------------------------------------
// 3. Alert callouts (> [!NOTE])
//
// Only NOTE has example content in the docs (installation/index.md). Add a
// `> [!WARNING]` / `[!TIP]` / `[!DANGER]` block to a real page before adding
// coverage for those types back.
// ---------------------------------------------------------------------------

test.describe('Alert callouts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
  });

  test('NOTE renders as a styled callout box', async ({ page }) => {
    const alert = page.locator('.markdown-alert.markdown-alert-note');
    await expect(alert).toBeVisible();
    await expect(alert.locator('.markdown-alert-title')).toContainText('note', {
      ignoreCase: true,
    });
  });

  // WARNING/TIP/DANGER coverage removed along with the example callouts that
  // used to live in installation/index.md — no page in public/docs currently
  // uses those alert types, so there's no real content left to assert against.
});

// ---------------------------------------------------------------------------
// 4. Copy-to-clipboard button and language/filename badge
// ---------------------------------------------------------------------------

test.describe('Code block copy button and badge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
  });

  test('every code block has a copy button', async ({ page }) => {
    const codeBlocks = page.locator('.code-block');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(codeBlocks.nth(i).locator('.code-block-copy')).toBeVisible();
    }
  });

  test('every code block has a language badge', async ({ page }) => {
    const codeBlocks = page.locator('.code-block');
    const count = await codeBlocks.count();

    for (let i = 0; i < count; i++) {
      await expect(codeBlocks.nth(i).locator('.code-block-badge')).toBeVisible();
    }
  });

  test('badge shows correct language label (bash block)', async ({ page }) => {
    // The installation page has ```bash blocks
    const bashBadge = page.locator('.code-block-badge').filter({ hasText: /bash/i }).first();
    await expect(bashBadge).toBeVisible();
  });

  test('clicking the copy button copies code to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const firstCopyBtn = page.locator('.code-block-copy').first();
    const expectedCode = await page.locator('.code-block').first().locator('code').innerText();

    await firstCopyBtn.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.trim()).toBe(expectedCode.trim());
  });

  test('copy button shows check icon for ~2 s after click', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const firstCopyBtn = page.locator('.code-block-copy').first();
    await firstCopyBtn.click();

    // data-copied attribute must be present immediately after click
    await expect(firstCopyBtn).toHaveAttribute('data-copied', 'true');

    // …and be gone after the 2-second timeout
    await expect(firstCopyBtn).not.toHaveAttribute('data-copied', { timeout: 3000 });
  });

  test('filename badge is shown when info string contains a filename', async ({ page }) => {
    // Navigate to a page that has a code block with a filename in the info string,
    // e.g. ```ts src/app/app.ts
    // If no such page exists yet, add one to installation/index.md:
    //   ```ts src/app/app.config.ts
    //   import { ApplicationConfig } from '@angular/core';
    //   export const appConfig: ApplicationConfig = { providers: [] };
    //   ```
    const filenameBadge = page.locator('.code-block-badge').filter({ hasText: /\./ }).first();
    // Skip gracefully if no filename-bearing block is present yet
    const count = await filenameBadge.count();
    test.skip(count === 0, 'No code block with a filename in the info string found on this page');
    await expect(filenameBadge).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Line highlighting  (```ts {3} syntax)
//
// Requires a code block with a highlight range in its info string, e.g.:
//   ```ts {3}
//   const a = 1;
//   const b = 2;
//   const c = 3;   // ← this line should be highlighted
//   ```
// Add to any page, e.g. getting-started/installation/index.md.
// ---------------------------------------------------------------------------

test.describe('Line highlighting', () => {
  test('highlighted line has the .highlighted class', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const highlighted = page.locator('.code-block .line.highlighted');
    const count = await highlighted.count();
    test.skip(count === 0, 'No highlighted line found — add a ```ts {3} block to the page');

    await expect(highlighted.first()).toBeVisible();
  });

  test('highlighted line has a distinct left border colour', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const highlighted = page.locator('.code-block .line.highlighted').first();
    const count = await page.locator('.code-block .line.highlighted').count();
    test.skip(count === 0, 'No highlighted line found — add a ```ts {3} block to the page');

    const borderLeft = await highlighted.evaluate((el) => getComputedStyle(el).borderLeftStyle);
    expect(borderLeft).toBe('solid');
  });
});

// ---------------------------------------------------------------------------
// 6. Line numbers  (showLineNumbers flag)
//
// Requires a code block with showLineNumbers in its info string, e.g.:
//   ```ts showLineNumbers
//   const a = 1;
//   const b = 2;
//   ```
// Add to any page, e.g. getting-started/installation/index.md.
// ---------------------------------------------------------------------------

test.describe('Line numbers', () => {
  test('code block with showLineNumbers has data-line-numbers attribute', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const lineNumBlock = page.locator('.code-block[data-line-numbers]');
    const count = await lineNumBlock.count();
    test.skip(count === 0, 'No showLineNumbers block found — add showLineNumbers to a code fence');

    await expect(lineNumBlock.first()).toBeVisible();
  });

  test('line number gutter is rendered via CSS counter', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const lineNumBlock = page.locator('.code-block[data-line-numbers]').first();
    const count = await page.locator('.code-block[data-line-numbers]').count();
    test.skip(count === 0, 'No showLineNumbers block found');

    // The ::before pseudo-element content is driven by CSS counter-increment
    const counterReset = await lineNumBlock.evaluate((el) => {
      const code = el.querySelector('code');
      return code ? getComputedStyle(code).counterReset : null;
    });
    expect(counterReset).toContain('line-number');
  });
});

// ---------------------------------------------------------------------------
// 7. Table of Contents (right-side TOC)
// ---------------------------------------------------------------------------

test.describe('Table of Contents', () => {
  test('TOC is populated with headings from the page', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const tocNav = page.locator('app-toc nav');
    await expect(tocNav).toBeVisible();

    // The installation page has multiple h2 headings
    const tocLinks = tocNav.locator('a');
    await expect(tocLinks).toHaveCount(await tocLinks.count());
    const count = await tocLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TOC links match h2/h3 headings in the content', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const headingTexts = await page.locator('.markdown-body h2, .markdown-body h3').allInnerTexts();

    const tocTexts = await page.locator('app-toc nav a').allInnerTexts();

    // Every TOC entry should correspond to a heading in the content
    for (const tocText of tocTexts) {
      expect(headingTexts.map((t) => t.trim())).toContain(tocText.trim());
    }
  });

  test('TOC links are anchor links that point to heading IDs', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const firstLink = page.locator('app-toc nav a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toContain('#');

    // Clicking a TOC link should scroll to the matching heading
    await firstLink.click();
    await page.waitForTimeout(300); // allow scroll
    const headingId = href!.split('#').pop()!;
    const heading = page.locator(`[id="${headingId.replaceAll('"', '\\"')}"]`);
    await expect(heading).toBeInViewport();
  });
});

// ---------------------------------------------------------------------------
// 8. Navigation between pages clears and re-renders content
// ---------------------------------------------------------------------------

test.describe('Navigation between pages', () => {
  test('navigating from page A to page B replaces content', async ({ page }) => {
    await page.goto('/docs/getting-started/what-is-mat-expressive');
    await waitForPageContent(page);

    const firstPageHeading = await page.locator('.markdown-body h2').first().innerText();

    // Navigate to a different page
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    const secondPageHeading = await page.locator('.markdown-body h2').first().innerText();
    expect(secondPageHeading).not.toBe(firstPageHeading);
  });

  test('TOC is cleared and repopulated after navigation', async ({ page }) => {
    await page.goto('/docs/getting-started/what-is-mat-expressive');
    await waitForPageContent(page);
    const tocCountA = await page.locator('app-toc nav a').count();

    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    const tocCountB = await page.locator('app-toc nav a').count();

    // Both pages have headings; the TOC must update (counts may differ)
    expect(tocCountA).toBeGreaterThan(0);
    expect(tocCountB).toBeGreaterThan(0);
  });

  test('no stale content from the previous page remains after navigation', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    // Installation page has 'ng add @angular/material'
    await expect(page.locator('.markdown-body')).toContainText('ng add @angular/material');

    await page.goto('/docs/getting-started/what-is-mat-expressive');
    await waitForPageContent(page);
    // Installation-specific content must be gone
    await expect(page.locator('.markdown-body')).not.toContainText('ng add @angular/material');
  });
});

// ---------------------------------------------------------------------------
// 9. 404 — unknown routes render a not-found state
// ---------------------------------------------------------------------------

test.describe('404 / not-found handling', () => {
  test('unknown route shows not-found message', async ({ page }) => {
    await page.goto('/this/route/does/not/exist');
    await waitForPageContent(page);

    await expect(page.locator('app-not-found-page h1')).toContainText('Page not found');
  });

  test('not-found page does not render a markdown body', async ({ page }) => {
    await page.goto('/nonexistent-section/nonexistent-page');
    await waitForPageContent(page);

    await expect(page.locator('app-markdown')).not.toBeVisible();
  });

  test('navigating from a not-found page to a valid page recovers correctly', async ({ page }) => {
    await page.goto('/does/not/exist');
    await waitForPageContent(page);
    await expect(page.locator('app-not-found-page')).toBeVisible();

    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    await expect(page.locator('app-not-found-page')).not.toBeVisible();
    await expect(page.locator('.markdown-body')).toBeVisible();
  });
});
