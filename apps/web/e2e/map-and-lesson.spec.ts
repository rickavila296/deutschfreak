import { expect, test } from '@playwright/test';

// Plan Phase 4 tests: a first Playwright test that opens the map and a lesson. Runs on a laptop and a phone viewport
// (gate M3). The only published lesson is A1.1.U01.L01 (decision 0009).

test('opens the German Map and from it the published lesson, then continues a stage', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByRole('heading', { level: 1, name: 'German Map' })).toBeVisible();
  await expect(page.locator('details')).toHaveCount(4);
  await expect(page.locator('main li')).toHaveCount(92);
  // Planned lessons are not links: exactly one lesson link on the whole map.
  await expect(page.locator('main li a')).toHaveCount(1);

  await page.locator('main li a').click();
  await expect(page).toHaveURL(/\/learn\/lessons\/hallo-und-tschuess$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('heading', { level: 2, name: /Objective/ })).toBeVisible();

  await page.getByRole('button', { name: 'Continue to Discover' }).click();
  await expect(page.getByRole('heading', { level: 2, name: /Discover/ })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Objective/ })).toBeHidden();
});

test('a planned lesson address shows not-found with status 404 (decision 0028)', async ({ page }) => {
  const response = await page.goto('/learn/lessons/wie-heisst-du');
  expect(response?.status()).toBe(404);
});

test('the page has no horizontal scroll', async ({ page }) => {
  for (const path of ['/learn', '/learn/units/hallo', '/learn/lessons/hallo-und-tschuess']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, path).toBe(false);
  }
});
