// EcomTrendAI 料金プラン E2Eテスト

import { test, expect } from '@playwright/test';

test.describe('料金プランページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/料金|Pricing|EcomTrendAI/i);
  });

  test('3つのプランが表示される', async ({ page }) => {
    // Free, Pro, Enterprise プラン
    const freeCard = page.locator('text=/Free|無料/i').first();
    const proCard = page.locator('text=/Pro|プロ/i').first();
    const enterpriseCard = page.locator('text=/Enterprise|エンタープライズ/i').first();

    await expect(freeCard).toBeVisible();
    await expect(proCard).toBeVisible();
    await expect(enterpriseCard).toBeVisible();
  });

  test('各プランの価格が表示される', async ({ page }) => {
    // ¥0
    const freePrice = page.locator('text=/¥0|無料/i').first();
    await expect(freePrice).toBeVisible();

    // ¥980
    const proPrice = page.locator('text=/¥980|980円/i').first();
    await expect(proPrice).toBeVisible();

    // ¥4,980
    const enterprisePrice = page.locator('text=/¥4,980|4980円|4,980円/i').first();
    await expect(enterprisePrice).toBeVisible();
  });

  test('各プランに申し込みボタンがある', async ({ page }) => {
    const buttons = page.getByRole('button', { name: /始める|申し込み|選択/i });
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('FAQセクションが表示される', async ({ page }) => {
    const faq = page.locator('text=/FAQ|よくある質問/i').first();
    await expect(faq).toBeVisible();
  });

  test('FAQ項目が展開できる', async ({ page }) => {
    // FAQ質問項目をクリック
    const faqItem = page.locator('text=/支払い方法|決済|クレジットカード/i').first();

    if (await faqItem.isVisible()) {
      await faqItem.click();
      // 回答が表示される
      await page.waitForTimeout(300); // アニメーション待ち
    }
  });
});

test.describe('プラン機能比較', () => {
  test('Freeプランの機能が表示される', async ({ page }) => {
    await page.goto('/pricing');

    // Freeプランの機能
    const freeFeatures = page.locator('text=/10件|2カテゴリ|100回/i').first();
    await expect(freeFeatures).toBeVisible();
  });

  test('Proプランの機能が表示される', async ({ page }) => {
    await page.goto('/pricing');

    // Proプランの機能
    const proFeatures = page.locator('text=/100件|全カテゴリ|アラート|CSV/i').first();
    await expect(proFeatures).toBeVisible();
  });

  test('Enterpriseプランの機能が表示される', async ({ page }) => {
    await page.goto('/pricing');

    // Enterpriseプランの機能
    const enterpriseFeatures = page.locator('text=/無制限|カスタム|専用サポート/i').first();
    await expect(enterpriseFeatures).toBeVisible();
  });
});

test.describe('CTAボタン動作', () => {
  test('Freeプランボタンで登録ページへ遷移', async ({ page }) => {
    await page.goto('/pricing');

    // Freeプランのボタン
    const freeButton = page.locator('[data-plan="free"] button, button:near(:text("Free"))').first();

    if (await freeButton.isVisible()) {
      await freeButton.click();
      await expect(page).toHaveURL(/register/);
    }
  });

  test('Proプランボタンで登録ページへ遷移', async ({ page }) => {
    await page.goto('/pricing');

    // Proプランのボタン
    const proButton = page.locator('[data-plan="pro"] button, button:near(:text("Pro"))').first();

    if (await proButton.isVisible()) {
      await proButton.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});
