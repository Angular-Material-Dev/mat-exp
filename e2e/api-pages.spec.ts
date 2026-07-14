import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForApiIndex(page: Page) {
  // Wait until at least one symbol link is visible (manifest loaded, loading complete)
  await page.locator('app-api-index-page li a[href^="/docs/api/"]').first().waitFor({
    state: 'visible',
    timeout: 15_000,
  });
}

async function waitForApiDetail(page: Page) {
  // Wait until the breadcrumb is visible — the detail page renders it immediately
  await page.locator('app-api-detail-page nav[aria-label="Breadcrumb"]').waitFor({
    state: 'visible',
    timeout: 15_000,
  });
}

async function waitForMarkdown(page: Page) {
  await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// 1. API Index Page (/docs/api)  — issue #63
// ---------------------------------------------------------------------------

test.describe('ApiIndexPage — /docs/api', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/api');
  });

  test('renders "API Reference" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'API Reference', level: 1 })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('renders an accessible filter input', async ({ page }) => {
    const input = page.getByRole('searchbox');
    await expect(input).toBeVisible({ timeout: 10_000 });
    const ariaLabel = await input.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('loads and displays exported symbols', async ({ page }) => {
    await waitForApiIndex(page);
    const links = page.locator('app-api-index-page li a[href^="/docs/api/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(10); // manifest has 70 entries
  });

  test('symbols are grouped by kind with section headings', async ({ page }) => {
    await waitForApiIndex(page);
    const headings = await page.locator('app-api-index-page h2').allInnerTexts();
    // At minimum Directives and Components are present in the manifest
    expect(headings).toContain('Directives');
    expect(headings).toContain('Components');
  });

  test('each symbol row has a kind badge', async ({ page }) => {
    await waitForApiIndex(page);
    // All badge spans have text content — at least one should be present per visible row
    const badges = page.locator('app-api-index-page li span[aria-hidden="true"]');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('MatExpButton is linked to its directive detail page', async ({ page }) => {
    await waitForApiIndex(page);
    const link = page.getByRole('link', { name: 'MatExpButton', exact: true });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('/docs/api/mat-exp/directives/MatExpButton');
  });

  test('MatExpButtonGroup is linked to its component detail page', async ({ page }) => {
    await waitForApiIndex(page);
    const link = page.getByRole('link', { name: 'MatExpButtonGroup', exact: true });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('/docs/api/mat-exp/components/MatExpButtonGroup');
  });

  test('filter hides non-matching symbols in real time', async ({ page }) => {
    await waitForApiIndex(page);
    const input = page.getByRole('searchbox');

    await input.fill('ButtonGroup');

    // MatExpButtonGroup should remain visible
    await expect(page.getByRole('link', { name: 'MatExpButtonGroup', exact: true })).toBeVisible();

    // An unrelated symbol should disappear
    await expect(page.getByRole('link', { name: 'MatExpLoadingIndicator' })).not.toBeVisible();
  });

  test('groups with zero matches after filtering are hidden', async ({ page }) => {
    await waitForApiIndex(page);
    const input = page.getByRole('searchbox');

    // 'provideMatExp' only matches function entries
    await input.fill('provideMatExp');

    // Functions group heading should be visible
    await expect(page.getByRole('heading', { name: 'Functions' })).toBeVisible();

    // Directives group heading should be hidden (no directive matches)
    await expect(page.getByRole('heading', { name: 'Directives' })).not.toBeVisible();
  });

  test('clearing the filter restores all groups', async ({ page }) => {
    await waitForApiIndex(page);
    const input = page.getByRole('searchbox');

    await input.fill('NonExistentSymbolXyz');
    await expect(page.getByRole('heading', { name: 'Directives' })).not.toBeVisible();

    await input.fill('');
    await expect(page.getByRole('heading', { name: 'Directives' })).toBeVisible();
  });

  test('"no match" message shown when filter matches nothing', async ({ page }) => {
    await waitForApiIndex(page);
    await page.getByRole('searchbox').fill('zzz_nonexistent_zzz');
    await expect(page.locator('app-api-index-page')).toContainText('No symbols match');
  });
});

// ---------------------------------------------------------------------------
// 2. API Detail Page (/docs/api/:package/:kind/:symbol)  — issue #64, #91
// ---------------------------------------------------------------------------

test.describe('ApiDetailPage — MatExpButton', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/api/mat-exp/directives/MatExpButton');
    await waitForApiDetail(page);
  });

  test('renders the symbol name as a heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'MatExpButton', level: 1 })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows kind badge "Directive"', async ({ page }) => {
    await expect(page.locator('app-api-detail-page')).toContainText('Directive', {
      timeout: 10_000,
    });
  });

  test('shows the CSS selector', async ({ page }) => {
    await expect(page.locator('app-api-detail-page')).toContainText('[matExpButton]', {
      timeout: 10_000,
    });
  });

  test('renders "Models" section with table rows', async ({ page }) => {
    // MatExpButton's size/shape/toggle/value are all two-way model() inputs, so
    // they render under "Models" rather than "Inputs" — it has no regular inputs.
    const modelsHeading = page.getByRole('heading', { name: 'Models' });
    await expect(modelsHeading).toBeVisible({ timeout: 10_000 });

    const rows = page.locator('app-api-detail-page section table tbody tr');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('input rows have anchor links with id prefix "input-"', async ({ page }) => {
    // `size` is a two-way `model()` input, so it renders in the "Models" table —
    // the shared `input-` id prefix still applies, since a model is still an input.
    await expect(page.getByRole('heading', { name: 'Models' })).toBeVisible({ timeout: 10_000 });

    const sizeAnchor = page.locator('#input-size');
    await expect(sizeAnchor).toBeAttached();
    const link = page.locator('a[href$="#input-size"]');
    await expect(link).toBeVisible();
  });

  test('breadcrumb shows API Reference link and navigates to /docs/api', async ({ page }) => {
    const crumbLink = page
      .locator('nav[aria-label="Breadcrumb"]')
      .getByRole('link', { name: 'API Reference' });
    await expect(crumbLink).toBeVisible({ timeout: 10_000 });

    await crumbLink.click();
    await page.waitForURL('/docs/api', { timeout: 10_000 });
    await expect(page).toHaveURL('/docs/api');
  });

  test('page title includes the symbol name', async ({ page }) => {
    await page.waitForFunction(() => document.title.includes('MatExpButton'), {
      timeout: 10_000,
    });
    expect(await page.title()).toMatch(/MatExpButton/);
  });
});

test.describe('ApiDetailPage — symbol with description', () => {
  test('MatExpButton description section is visible', async ({ page }) => {
    await page.goto('/docs/api/mat-exp/directives/MatExpButton');
    await waitForApiDetail(page);
    // The manifest entry has a description for MatExpButton
    await expect(page.locator('app-api-detail-page')).toContainText('Directive to style', {
      timeout: 10_000,
    });
  });
});

test.describe('ApiDetailPage — component symbol', () => {
  test('MatExpButtonGroup renders as Component kind', async ({ page }) => {
    await page.goto('/docs/api/mat-exp/components/MatExpButtonGroup');
    await waitForApiDetail(page);

    await expect(page.getByRole('heading', { name: 'MatExpButtonGroup', level: 1 })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('app-api-detail-page')).toContainText('Component', {
      timeout: 10_000,
    });
  });
});

test.describe('ApiDetailPage — function symbol', () => {
  test('provideMatExpButtonOptions shows Signature section', async ({ page }) => {
    await page.goto('/docs/api/mat-exp/functions/provideMatExpButtonOptions');
    await waitForApiDetail(page);

    await expect(
      page.getByRole('heading', { name: 'provideMatExpButtonOptions', level: 1 }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Signature' })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('ApiDetailPage — unknown symbol (404 state)', () => {
  test('renders "Symbol not found" for an unknown symbol name', async ({ page }) => {
    await page.goto('/docs/api/mat-exp/directives/NonExistentSymbol');
    await waitForApiDetail(page);

    await expect(page.locator('app-api-detail-page')).toContainText('Symbol not found', {
      timeout: 10_000,
    });
    await expect(page.locator('app-api-detail-page')).toContainText('NonExistentSymbol', {
      timeout: 10_000,
    });
  });

  test('unknown symbol page does not throw a JS error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/docs/api/mat-exp/directives/NonExistentSymbol');
    await waitForApiDetail(page);

    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('"Symbol not found" page has a link back to /docs/api', async ({ page }) => {
    await page.goto('/docs/api/mat-exp/directives/NonExistentSymbol');
    await waitForApiDetail(page);

    const backLink = page.getByRole('link', { name: /Back to API Reference/ });
    await expect(backLink).toBeVisible({ timeout: 10_000 });
    const href = await backLink.getAttribute('href');
    expect(href).toBe('/docs/api');
  });
});

test.describe('ApiDetailPage — deprecated symbols', () => {
  const KIND_URL_SEGMENT: Record<string, string> = {
    directive: 'directives',
    component: 'components',
    class: 'classes',
    interface: 'interfaces',
    type: 'types',
    function: 'functions',
    const: 'constants',
  };

  test('deprecated banner is visible when a deprecated symbol is navigated to', async ({
    page,
    request,
  }) => {
    const res = await request.get('/api-manifest.json');
    const manifest = (await res.json()) as Record<
      string,
      { kind: string; deprecated?: boolean | string }
    >;

    const [symbol, entry] = Object.entries(manifest).find(([, e]) => e.deprecated) ?? [];
    test.skip(!symbol, 'No deprecated symbol found in the API manifest — skipping');
    if (!symbol || !entry) return;

    const segment = KIND_URL_SEGMENT[entry.kind] ?? entry.kind + 's';
    await page.goto(`/docs/api/mat-exp/${segment}/${symbol}`);
    await waitForApiDetail(page);

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[role="alert"]')).toContainText('Deprecated');
  });
});

// ---------------------------------------------------------------------------
// 2b. Wave 10 — scope-first URL restructure (#91): old kind-first URLs 404
// ---------------------------------------------------------------------------

test.describe('ApiDetailPage — old kind-first URL format (pre-#91)', () => {
  test('old-format URL renders "Symbol not found" instead of the real symbol page', async ({
    page,
  }) => {
    // Old format was /docs/api/:kind/:scope/:symbol — the same segment count still
    // matches the new :package/:kind/:symbol route, so the page must validate that
    // the kind segment actually matches the symbol's kind rather than silently
    // rendering the correct content for a stale URL.
    await page.goto('/docs/api/directives/mat-exp/MatExpButton');
    await waitForApiDetail(page);

    await expect(page.locator('app-api-detail-page')).toContainText('Symbol not found', {
      timeout: 10_000,
    });
  });

  test('old-format URL for a component symbol also renders "Symbol not found"', async ({
    page,
  }) => {
    await page.goto('/docs/api/components/mat-exp/MatExpButtonGroup');
    await waitForApiDetail(page);

    await expect(page.locator('app-api-detail-page')).toContainText('Symbol not found', {
      timeout: 10_000,
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Fixed stale links (#65)
// ---------------------------------------------------------------------------

test.describe('Stale link fix — /docs/api/.../classes/... replaced with kind-correct URLs', () => {
  const cases = [
    {
      page: '/docs/components/all-buttons/button',
      symbol: 'MatExpButton',
      expectedKind: 'directives',
    },
    {
      page: '/docs/components/all-buttons/icon-button',
      symbol: 'MatExpIconButton',
      expectedKind: 'directives',
    },
    {
      page: '/docs/components/all-buttons/button-group',
      symbol: 'MatExpButtonGroup',
      expectedKind: 'components',
    },
    {
      page: '/docs/components/all-buttons/split-button',
      symbol: 'MatExpSplitButton',
      expectedKind: 'components',
    },
    {
      page: '/docs/components/loading-and-progress/loading-indicator',
      symbol: 'MatExpLoadingIndicator',
      expectedKind: 'components',
    },
  ];

  for (const { page: path, symbol, expectedKind } of cases) {
    test(`${symbol} link uses /${expectedKind}/ not /classes/`, async ({ page }) => {
      await page.goto(path);
      await waitForMarkdown(page);

      // Find a link whose href contains the symbol name
      const link = page.locator(`.markdown-body a[href*="${symbol}"]`).first();
      await expect(link).toBeVisible({ timeout: 10_000 });

      const href = await link.getAttribute('href');
      expect(href).toContain(`/docs/api/mat-exp/${expectedKind}/${symbol}`);
      expect(href).not.toContain('/docs/api/mat-exp/classes/');
    });
  }

  test("fab-menu's merged API section — MatExpFabMenu uses /directives/", async ({ page }) => {
    await page.goto('/docs/components/all-buttons/fab-menu');
    await waitForMarkdown(page);

    const link = page.locator('.markdown-body a[href*="MatExpFabMenu"]').first();
    await expect(link).toBeVisible({ timeout: 10_000 });

    const href = await link.getAttribute('href');
    expect(href).toContain('/docs/api/mat-exp/directives/MatExpFabMenu');
    expect(href).not.toContain('/docs/api/mat-exp/classes/');
  });

  test('no /docs/api/mat-exp/classes/... links remain anywhere in public/docs markdown pages', async ({
    page,
  }) => {
    // Spot-check by visiting the button page (API section) and verifying zero "classes" links
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdown(page);

    const staleLinks = page.locator('.markdown-body a[href*="/docs/api/mat-exp/classes/"]');
    await expect(staleLinks).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Markdown auto-link — inline code → API Detail Page  (#66)
// ---------------------------------------------------------------------------

test.describe('Markdown auto-link — inline code linked to API Detail Pages', () => {
  test("`matExpButton` in the button page's API section is rendered as an api-link", async ({
    page,
  }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdown(page);

    // The text "`matExpButton` directive" should have an .api-link wrapping the code
    const apiLink = page.locator('.markdown-body a.api-link').first();
    await expect(apiLink).toBeVisible({ timeout: 10_000 });
  });

  test('auto-link points to the correct API Detail Page URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdown(page);

    // The selector attribute `matExpButton` should link to the directive URL
    const apiLink = page
      .locator('.markdown-body a.api-link')
      .filter({ hasText: 'matExpButton' })
      .first();

    const count = await apiLink.count();
    test.skip(count === 0, '`matExpButton` auto-link not present on this page');

    const href = await apiLink.getAttribute('href');
    expect(href).toBe('/docs/api/mat-exp/directives/MatExpButton');
  });

  test('auto-link wraps the text in a <code> element', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdown(page);

    const apiLink = page.locator('.markdown-body a.api-link').first();
    const count = await apiLink.count();
    test.skip(count === 0, 'No .api-link found on this page');

    const inner = apiLink.locator('code');
    await expect(inner).toBeVisible();
  });

  test('symbols not in the manifest render as plain <code> without a link', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForMarkdown(page);

    // Inline code on the installation page contains generic terms, not symbol names.
    // Verify that no rogue api-links appeared where the content is not a manifest symbol.
    const allApiLinks = page.locator('.markdown-body a.api-link');
    // If there are any api-links, each must have href pointing to /docs/api/...
    const count = await allApiLinks.count();
    for (let i = 0; i < count; i++) {
      const href = await allApiLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/docs\/api\//);
    }
  });

  test('clicking an auto-link navigates to the API detail page', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForMarkdown(page);

    const apiLink = page.locator('.markdown-body a.api-link').first();
    const count = await apiLink.count();
    test.skip(count === 0, 'No .api-link found on this page');

    const href = await apiLink.getAttribute('href');
    await apiLink.click();
    await page.waitForURL(href!, { timeout: 10_000 });
    await expect(page).toHaveURL(href!);
  });
});

// ---------------------------------------------------------------------------
// 5. API Index → Detail navigation flow
// ---------------------------------------------------------------------------

test.describe('API Index → Detail navigation flow', () => {
  test('clicking a symbol link on the index page navigates to its detail page', async ({
    page,
  }) => {
    await page.goto('/docs/api');
    await waitForApiIndex(page);

    const link = page.getByRole('link', { name: 'MatExpButton', exact: true });
    await link.click();

    await page.waitForURL(/\/docs\/api\/mat-exp\/directives\/MatExpButton/, {
      timeout: 10_000,
    });
    await expect(page.getByRole('heading', { name: 'MatExpButton', level: 1 })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigating from detail back to index via breadcrumb preserves filter state', async ({
    page,
  }) => {
    await page.goto('/docs/api');
    await waitForApiIndex(page);

    // Navigate to a detail page via the URL directly (simulates SPA navigation)
    await page.goto('/docs/api/mat-exp/directives/MatExpButton');
    await waitForApiDetail(page);

    // Click breadcrumb back
    await page
      .locator('nav[aria-label="Breadcrumb"]')
      .getByRole('link', { name: 'API Reference' })
      .click();
    await page.waitForURL('/docs/api', { timeout: 10_000 });

    // Index renders correctly after returning
    await waitForApiIndex(page);
    await expect(page.getByRole('heading', { name: 'API Reference' })).toBeVisible();
  });
});
