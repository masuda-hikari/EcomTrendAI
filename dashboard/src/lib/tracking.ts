/**
 * アフィリエイトリンク・イベント追跡
 *
 * クリック追跡とコンバージョン計測を提供
 */

// 追跡イベントの型
export interface TrackingEvent {
  eventType: 'affiliate_click' | 'page_view' | 'signup' | 'upgrade' | 'feature_use';
  timestamp: number;
  data: Record<string, unknown>;
}

// ストレージキー
const TRACKING_KEY = 'ecomtrend_tracking_events';
const SESSION_KEY = 'ecomtrend_session_id';

/**
 * セッションIDを取得
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * イベントを保存
 */
function saveEvent(event: TrackingEvent): void {
  if (typeof window === 'undefined') return;

  try {
    const events = getStoredEvents();
    events.push(event);
    // 最新500件のみ保持
    const trimmedEvents = events.slice(-500);
    localStorage.setItem(TRACKING_KEY, JSON.stringify(trimmedEvents));
  } catch {
    // ストレージがフルの場合は無視
  }
}

/**
 * 保存されたイベントを取得
 */
function getStoredEvents(): TrackingEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(TRACKING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * アフィリエイトリンククリックを追跡
 */
export function trackAffiliateClick(data: {
  asin: string;
  productName: string;
  category?: string;
  price?: number;
  rank?: number;
  source: 'dashboard' | 'report' | 'sample' | 'api';
}): void {
  const event: TrackingEvent = {
    eventType: 'affiliate_click',
    timestamp: Date.now(),
    data: {
      ...data,
      sessionId: getSessionId(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    },
  };

  saveEvent(event);

  // 将来的にはサーバーに送信
  // sendToAnalyticsServer(event);
}

/**
 * ページビューを追跡
 */
export function trackPageView(pageName: string, metadata?: Record<string, unknown>): void {
  const event: TrackingEvent = {
    eventType: 'page_view',
    timestamp: Date.now(),
    data: {
      pageName,
      sessionId: getSessionId(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ...metadata,
    },
  };

  saveEvent(event);
}

/**
 * サインアップを追跡
 */
export function trackSignup(plan: string, source?: string): void {
  const event: TrackingEvent = {
    eventType: 'signup',
    timestamp: Date.now(),
    data: {
      plan,
      source: source || 'direct',
      sessionId: getSessionId(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    },
  };

  saveEvent(event);
}

/**
 * アップグレードを追跡
 */
export function trackUpgrade(fromPlan: string, toPlan: string, price: number): void {
  const event: TrackingEvent = {
    eventType: 'upgrade',
    timestamp: Date.now(),
    data: {
      fromPlan,
      toPlan,
      price,
      sessionId: getSessionId(),
    },
  };

  saveEvent(event);
}

/**
 * 機能使用を追跡
 */
export function trackFeatureUse(featureName: string, metadata?: Record<string, unknown>): void {
  const event: TrackingEvent = {
    eventType: 'feature_use',
    timestamp: Date.now(),
    data: {
      featureName,
      sessionId: getSessionId(),
      ...metadata,
    },
  };

  saveEvent(event);
}

/**
 * アフィリエイトクリック統計を取得
 */
export function getAffiliateStats(): {
  totalClicks: number;
  clicksBySource: Record<string, number>;
  clicksByCategory: Record<string, number>;
  topProducts: Array<{ asin: string; productName: string; clicks: number }>;
} {
  const events = getStoredEvents().filter(e => e.eventType === 'affiliate_click');

  const clicksBySource: Record<string, number> = {};
  const clicksByCategory: Record<string, number> = {};
  const productClicks: Record<string, { asin: string; productName: string; clicks: number }> = {};

  for (const event of events) {
    const { source, category, asin, productName } = event.data as {
      source: string;
      category?: string;
      asin: string;
      productName: string;
    };

    // ソース別
    clicksBySource[source] = (clicksBySource[source] || 0) + 1;

    // カテゴリ別
    if (category) {
      clicksByCategory[category] = (clicksByCategory[category] || 0) + 1;
    }

    // 商品別
    if (!productClicks[asin]) {
      productClicks[asin] = { asin, productName, clicks: 0 };
    }
    productClicks[asin].clicks++;
  }

  // トップ商品をソート
  const topProducts = Object.values(productClicks)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return {
    totalClicks: events.length,
    clicksBySource,
    clicksByCategory,
    topProducts,
  };
}

/**
 * トラッキング付きアフィリエイトリンクを生成
 */
export function createTrackedAffiliateLink(
  originalUrl: string,
  trackingData: {
    asin: string;
    productName: string;
    category?: string;
    price?: number;
    rank?: number;
    source: 'dashboard' | 'report' | 'sample' | 'api';
  }
): string {
  // URLにトラッキングパラメータを追加
  const url = new URL(originalUrl);
  url.searchParams.set('ref', 'ecomtrend');
  url.searchParams.set('src', trackingData.source);

  return url.toString();
}

/**
 * React Hook: アフィリエイトリンクのクリックハンドラー
 */
export function useAffiliateTracking(source: 'dashboard' | 'report' | 'sample' | 'api') {
  return {
    trackClick: (data: {
      asin: string;
      productName: string;
      category?: string;
      price?: number;
      rank?: number;
    }) => {
      trackAffiliateClick({
        ...data,
        source,
      });
    },
  };
}
