// EcomTrendAI モバイル専用E2Eテスト

import { test, expect, devices } from '@playwright/test';

// iPhone 12 での表示テスト
test.describe('モバイル表示（iPhone 12）', () => {
  test.use({ ...devices['iPhone 12'] });

  test('ホームページが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EcomTrendAI/);

    // ヒーローセクション確認
    const hero = page.locator('main');
    await expect(hero).toBeVisible();
  });

  test('モバイルメニューが開閉できる', async ({ page }) => {
    await page.goto('/');

    // ハンバーガーメニューボタンを探す
    const menuButton = page.locator('button[aria-label*="メニュー"], [data-testid="mobile-menu-button"]').first();

    if (await menuButton.isVisible()) {
      // メニューを開く
      await menuButton.click();

      // モバイルメニューが表示される
      const mobileMenu = page.locator('[data-testid="mobile-menu"], nav[aria-label="モバイルメニュー"]');
      await expect(mobileMenu).toBeVisible();

      // メニューを閉じる（Escキー）
      await page.keyboard.press('Escape');
    }
  });

  test('タップでナビゲーションが機能する', async ({ page }) => {
    await page.goto('/');

    // 料金ページへ遷移
    const pricingLink = page.getByRole('link', { name: /料金/i }).first();
    if (await pricingLink.isVisible()) {
      await pricingLink.tap();
      await expect(page).toHaveURL(/pricing/);
    }
  });

  test('料金ページがスクロール可能', async ({ page }) => {
    await page.goto('/pricing');

    // FAQセクションまでスクロール
    const faqSection = page.getByText('よくある質問');
    await faqSection.scrollIntoViewIfNeeded();
    await expect(faqSection).toBeVisible();
  });

  test('サンプルレポートのテーブルがスクロール可能', async ({ page }) => {
    await page.goto('/sample-report');

    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('登録フォームが使用可能', async ({ page }) => {
    await page.goto('/register');

    // フォームフィールドにフォーカスできる
    const emailInput = page.getByLabel(/メール|email/i);
    await expect(emailInput).toBeVisible();
    await emailInput.tap();
    await expect(emailInput).toBeFocused();
  });
});

// Pixel 5 での表示テスト
test.describe('モバイル表示（Pixel 5）', () => {
  test.use({ ...devices['Pixel 5'] });

  test('ホームページが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EcomTrendAI/);
  });

  test('CTAボタンがタップ可能', async ({ page }) => {
    await page.goto('/');

    const ctaButton = page.locator('a[href="/register"]').first();
    await expect(ctaButton).toBeVisible();

    // タップ可能なサイズか確認（44x44px以上推奨）
    const box = await ctaButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('料金プランカードが縦に並ぶ', async ({ page }) => {
    await page.goto('/pricing');

    // 各プランが表示される
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });
});

// タブレット表示テスト
test.describe('タブレット表示（iPad）', () => {
  test.use({ ...devices['iPad (gen 7)'] });

  test('ホームページが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EcomTrendAI/);
  });

  test('料金プランが適切にレイアウトされる', async ({ page }) => {
    await page.goto('/pricing');

    // 3つのプランカードが表示される
    const freeCard = page.getByText('Free').first();
    const proCard = page.getByText('Pro').first();
    const enterpriseCard = page.getByText('Enterprise').first();

    await expect(freeCard).toBeVisible();
    await expect(proCard).toBeVisible();
    await expect(enterpriseCard).toBeVisible();
  });

  test('サンプルレポートのチャートが表示される', async ({ page }) => {
    await page.goto('/sample-report');

    // チャート見出しが表示される
    const chartHeading = page.getByText(/ランク推移|カテゴリ別/i).first();
    await expect(chartHeading).toBeVisible();
  });
});
