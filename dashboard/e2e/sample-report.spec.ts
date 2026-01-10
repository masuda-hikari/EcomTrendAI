// EcomTrendAI サンプルレポートページ E2Eテスト

import { test, expect } from '@playwright/test';

test.describe('サンプルレポートページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sample-report');
  });

  test('ページタイトルが正しく表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/サンプルレポート.*EcomTrendAI/);
  });

  test('レポートヘッダーが表示される', async ({ page }) => {
    const header = page.locator('text=/Amazonトレンド分析レポート/');
    await expect(header).toBeVisible();
  });

  test('サンプルバナーが表示される', async ({ page }) => {
    const banner = page.locator('text=/これはサンプルレポートです/');
    await expect(banner).toBeVisible();
  });

  test('トレンドリストが表示される', async ({ page }) => {
    // TOP 10の見出し
    const heading = page.locator('text=/急上昇商品.*TOP 10/');
    await expect(heading).toBeVisible();

    // 商品リストのテーブル
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('サマリーカードが表示される', async ({ page }) => {
    // 4つのサマリーカード
    const maxRise = page.locator('text=/最大上昇率/');
    const category = page.locator('text=/注目カテゴリ/');
    const avgScore = page.locator('text=/平均スコア/');
    const avgPrice = page.locator('text=/平均価格帯/');

    await expect(maxRise).toBeVisible();
    await expect(category).toBeVisible();
    await expect(avgScore).toBeVisible();
    await expect(avgPrice).toBeVisible();
  });

  test('グラフが表示される', async ({ page }) => {
    // ランク推移グラフ
    const rankChart = page.locator('text=/1位商品のランク推移/');
    await expect(rankChart).toBeVisible();

    // カテゴリ別グラフ
    const categoryChart = page.locator('text=/カテゴリ別検出数/');
    await expect(categoryChart).toBeVisible();
  });

  test('機能比較テーブルが表示される', async ({ page }) => {
    const comparison = page.locator('text=/サンプルレポート vs 有料プラン/');
    await expect(comparison).toBeVisible();
  });

  test('CTAボタンが表示される', async ({ page }) => {
    // 複数のCTAボタン
    const ctaButtons = page.getByRole('link', { name: /無料で.*|無料登録/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('登録ページへのリンクが機能する', async ({ page }) => {
    // サイドバーのCTAボタン
    const ctaButton = page.locator('.bg-gradient-to-br a:has-text("無料で始める")').first();

    if (await ctaButton.isVisible()) {
      await ctaButton.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});

test.describe('サンプルレポート ナビゲーション', () => {
  test('ヘッダーからサンプルレポートへ遷移できる', async ({ page }) => {
    await page.goto('/');

    const sampleReportLink = page.getByRole('link', { name: /サンプルレポート/ }).first();
    await sampleReportLink.click();

    await expect(page).toHaveURL(/sample-report/);
  });

  test('サンプルレポートから料金ページへ遷移できる', async ({ page }) => {
    await page.goto('/sample-report');

    const pricingLink = page.getByRole('link', { name: /料金プラン詳細を見る/ });
    await pricingLink.click();

    await expect(page).toHaveURL(/pricing/);
  });
});

test.describe('サンプルレポート レスポンシブ', () => {
  test('モバイルでもテーブルが表示される', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'モバイルのみのテスト');

    await page.goto('/sample-report');

    // テーブルが水平スクロール可能な状態で表示されることを確認
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});
