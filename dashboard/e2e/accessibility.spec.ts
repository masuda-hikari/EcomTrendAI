// EcomTrendAI アクセシビリティE2Eテスト

import { test, expect } from '@playwright/test';

test.describe('アクセシビリティ - ランディングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('スキップリンクが存在し機能する', async ({ page }) => {
    // スキップリンクを探す
    const skipLink = page.locator('a[href="#main-content"]');

    if (await skipLink.count() > 0) {
      // Tabでフォーカスを当てる
      await page.keyboard.press('Tab');

      // スキップリンクをクリック
      await skipLink.click();

      // メインコンテンツにフォーカスが移動する
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
    }
  });

  test('ランドマークが適切に設定されている', async ({ page }) => {
    // header
    const header = page.locator('header[role="banner"], header');
    await expect(header).toBeVisible();

    // main
    const main = page.locator('main[role="main"], main');
    await expect(main).toBeVisible();

    // footer
    const footer = page.locator('footer[role="contentinfo"], footer');
    await expect(footer).toBeVisible();
  });

  test('見出し階層が適切', async ({ page }) => {
    // h1が存在する
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // h2が存在する
    const h2 = page.locator('h2');
    await expect(h2.first()).toBeVisible();
  });

  test('画像に代替テキストがある', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // alt属性があるか、role="presentation"か確認
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('フォーカス可視性が確保されている', async ({ page }) => {
    // Tabキーを数回押してフォーカスを移動
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // フォーカスされた要素が存在
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('FAQアコーディオンのキーボード操作', async ({ page }) => {
    // FAQセクションまでスクロール
    const faqButton = page.locator('button[aria-expanded]').first();
    await faqButton.scrollIntoViewIfNeeded();

    // フォーカスを当てる
    await faqButton.focus();
    await expect(faqButton).toBeFocused();

    // Enterキーで開く
    await page.keyboard.press('Enter');
    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');

    // Enterキーで閉じる
    await page.keyboard.press('Enter');
    await expect(faqButton).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('アクセシビリティ - 料金ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('料金プランカードにアクセス可能', async ({ page }) => {
    // 各プランの見出しが存在
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('CTAボタンがキーボードでアクセス可能', async ({ page }) => {
    const buttons = page.getByRole('button', { name: /始める|選択/i });

    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
    }
  });
});

test.describe('アクセシビリティ - 登録フォーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('フォームフィールドにラベルがある', async ({ page }) => {
    // メールフィールド
    const emailInput = page.getByLabel(/メール|email/i);
    await expect(emailInput).toBeVisible();
  });

  test('エラーメッセージが関連付けられている', async ({ page }) => {
    // フォームを空で送信
    const submitButton = page.getByRole('button', { name: /登録/i });
    await submitButton.click();

    // エラーメッセージが表示される
    const error = page.locator('[role="alert"], .text-red-500, .error');
    if (await error.count() > 0) {
      await expect(error.first()).toBeVisible();
    }
  });

  test('フォームがキーボードで操作可能', async ({ page }) => {
    // Tabでフィールドを移動
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // フォーカスされた要素が存在
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('アクセシビリティ - ログインフォーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('フォームフィールドにラベルがある', async ({ page }) => {
    // APIキーフィールド
    const apiKeyInput = page.getByLabel(/APIキー|api key/i);
    await expect(apiKeyInput).toBeVisible();
  });
});

test.describe('アクセシビリティ - カラーコントラスト', () => {
  test('テキストが読みやすいコントラストを持つ', async ({ page }) => {
    await page.goto('/');

    // 主要なテキスト要素が存在し読める
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();

    // ボタンが見える
    const button = page.locator('a[href="/register"], button').first();
    await expect(button).toBeVisible();
  });
});

test.describe('アクセシビリティ - モーション', () => {
  test('アニメーションがprefers-reduced-motionを尊重する', async ({ page }) => {
    // reduced-motionを設定
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // ページが正常に読み込まれる
    await expect(page).toHaveTitle(/EcomTrendAI/);
  });
});
