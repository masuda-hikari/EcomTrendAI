/**
 * Google Analytics 4 連携モジュール
 * 環境変数 NEXT_PUBLIC_GA_MEASUREMENT_ID にGA4測定IDを設定
 */

// GA4測定ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// GA4が有効かどうか
export const isGAEnabled = (): boolean => {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID;
};

// ページビュー送信
export const pageview = (url: string): void => {
  if (!isGAEnabled()) return;

  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// イベント送信
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}): void => {
  if (!isGAEnabled()) return;

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// コンバージョンイベント
export const conversion = (conversionId: string, conversionLabel?: string): void => {
  if (!isGAEnabled()) return;

  window.gtag?.('event', 'conversion', {
    send_to: conversionLabel ? `${conversionId}/${conversionLabel}` : conversionId,
  });
};

// Eコマースイベント
export const ecommerce = {
  // 商品閲覧
  viewItem: (item: {
    item_id: string;
    item_name: string;
    price?: number;
    item_category?: string;
  }): void => {
    if (!isGAEnabled()) return;

    window.gtag?.('event', 'view_item', {
      items: [item],
    });
  },

  // 登録開始
  beginSignup: (method: string): void => {
    if (!isGAEnabled()) return;

    window.gtag?.('event', 'sign_up_begin', {
      method,
    });
  },

  // 登録完了
  signUp: (method: string): void => {
    if (!isGAEnabled()) return;

    window.gtag?.('event', 'sign_up', {
      method,
    });
  },

  // サブスクリプション開始
  subscribe: (plan: string, price: number): void => {
    if (!isGAEnabled()) return;

    window.gtag?.('event', 'purchase', {
      transaction_id: `sub_${Date.now()}`,
      value: price,
      currency: 'JPY',
      items: [
        {
          item_id: plan,
          item_name: `${plan}プラン`,
          price: price,
          quantity: 1,
        },
      ],
    });
  },

  // API利用
  apiCall: (endpoint: string): void => {
    if (!isGAEnabled()) return;

    window.gtag?.('event', 'api_call', {
      endpoint,
    });
  },
};

// ユーザープロパティ設定
export const setUserProperties = (properties: {
  plan?: string;
  signup_date?: string;
  api_usage?: number;
}): void => {
  if (!isGAEnabled()) return;

  window.gtag?.('set', 'user_properties', properties);
};

// 型定義
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}
