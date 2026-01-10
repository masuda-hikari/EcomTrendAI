// EcomTrendAI ランディングページ E2Eテスト

import { test, expect } from '@playwright/test';

test.describe('ランディングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページタイトルが正しく表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/EcomTrendAI/);
  });

  test('ヘッダーが表示される', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('CTAボタンが表示される', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /無料で始める|今すぐ始める/i });
    await expect(ctaButton).toBeVisible();
  });

  test('機能紹介セクションが表示される', async ({ page }) => {
    const features = page.locator('text=/トレンド分析|リアルタイム|アラート/i').first();
    await expect(features).toBeVisible();
  });

  test('料金プランセクションへのリンクが機能する', async ({ page }) => {
    const pricingLink = page.getByRole('link', { name: /料金/i }).first();
    await pricingLink.click();
    await expect(page).toHaveURL(/pricing/);
  });

  test('フッターが表示される', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('ナビゲーション', () => {
  test('登録ページへ遷移できる', async ({ page }) => {
    await page.goto('/');
    const registerLink = page.getByRole('link', { name: /登録|サインアップ|無料で始める/i }).first();
    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test('ログインページへ遷移できる', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /ログイン/i }).first();
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });

  test('料金ページへ遷移できる', async ({ page }) => {
    await page.goto('/');
    const pricingLink = page.getByRole('link', { name: /料金/i }).first();
    await pricingLink.click();
    await expect(page).toHaveURL(/pricing/);
  });
});

test.describe('レスポンシブデザイン', () => {
  test('モバイルでメニューが表示される', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'モバイルのみのテスト');
    await page.goto('/');
    // ハンバーガーメニューまたはモバイルナビの確認
    const mobileNav = page.locator('[data-testid="mobile-menu"], .mobile-nav, nav');
    await expect(mobileNav).toBeVisible();
  });
});
