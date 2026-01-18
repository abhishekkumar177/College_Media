/**
 * E2E Tests - Posts Flow
 * Issue #245: Testing Infrastructure - Playwright E2E
 */

import { test, expect } from '@playwright/test';

test.describe('Posts E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173');
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Submit")');
    await expect(page).toHaveURL(/.*home/);
  });

  test('should create new post', async ({ page }) => {
    await page.click('text=Create Post');

    await page.fill('textarea[placeholder*="caption"]', 'Test post caption');
    await page.setInputFiles('input[type="file"]', './tests/fixtures/test-image.jpg');

    await page.click('button:has-text("Post")');

    await expect(page.locator('text=Test post caption')).toBeVisible();
  });

  test('should like a post', async ({ page }) => {
    const likeButton = page.locator('[aria-label="Like post"]').first();
    await likeButton.click();

    await expect(likeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should copy post link', async ({ page }) => {
    // Mock clipboard API
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text) => {
            // Store copied text for verification
            window.copiedText = text;
            return Promise.resolve();
          }
        },
        writable: true
      });
    });

    // Click the post menu (three dots)
    await page.locator('[aria-label="More options"]').first().click();

    // Click Copy Link option
    await page.click('text=Copy Link');

    // Verify toast notification appears
    await expect(page.locator('text=Link copied to clipboard')).toBeVisible();

    // Verify clipboard contains correct URL
    const copiedText = await page.evaluate(() => window.copiedText);
    expect(copiedText).toMatch(/^http:\/\/localhost:5173\/post\/\d+$/);
  });

  test('should scroll and load more posts', async ({ page }) => {
    const initialPosts = await page.locator('[data-testid="post"]').count();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.waitForTimeout(1000);

    const newPosts = await page.locator('[data-testid="post"]').count();
    expect(newPosts).toBeGreaterThan(initialPosts);
  });
});
