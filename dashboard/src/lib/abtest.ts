/**
 * A/Bテスト基盤
 *
 * コンバージョン最適化のためのA/Bテスト機能を提供
 */

// 実験定義の型
export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[];  // 各バリアントの配分（未指定の場合は均等）
  isActive: boolean;
}

// 事前定義された実験
export const EXPERIMENTS: Record<string, Experiment> = {
  // CTAボタンのテスト
  'cta-button': {
    id: 'cta-button',
    name: 'CTAボタンテスト',
    variants: ['control', 'variant-a', 'variant-b'],
    isActive: true,
  },
  // 価格表示のテスト
  'pricing-display': {
    id: 'pricing-display',
    name: '価格表示テスト',
    variants: ['monthly', 'annual-discount'],
    isActive: true,
  },
  // ヒーローセクションのテスト
  'hero-headline': {
    id: 'hero-headline',
    name: 'ヒーロー見出しテスト',
    variants: ['default', 'benefit-focused', 'urgency'],
    isActive: true,
  },
  // 登録フォームのテスト
  'register-form': {
    id: 'register-form',
    name: '登録フォームテスト',
    variants: ['simple', 'with-benefits'],
    isActive: true,
  },
};

// イベントの型
export interface ABTestEvent {
  experimentId: string;
  variant: string;
  eventType: 'view' | 'click' | 'conversion';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ストレージキー
const STORAGE_KEY = 'ecomtrend_ab_assignments';
const EVENTS_KEY = 'ecomtrend_ab_events';

/**
 * ユーザーIDを取得（永続的）
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server';

  let userId = localStorage.getItem('ecomtrend_user_id');
  if (!userId) {
    userId = `u_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('ecomtrend_user_id', userId);
  }
  return userId;
}

/**
 * バリアント割り当てを取得または生成
 */
export function getAssignment(experimentId: string): string {
  if (typeof window === 'undefined') return 'control';

  const experiment = EXPERIMENTS[experimentId];
  if (!experiment || !experiment.isActive) {
    return 'control';
  }

  // 既存の割り当てを確認
  const assignments = getAssignments();
  if (assignments[experimentId]) {
    return assignments[experimentId];
  }

  // 新しい割り当てを生成
  const variant = assignVariant(experiment);
  assignments[experimentId] = variant;
  saveAssignments(assignments);

  // ビューイベントを記録
  trackEvent(experimentId, variant, 'view');

  return variant;
}

/**
 * 全ての割り当てを取得
 */
function getAssignments(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * 割り当てを保存
 */
function saveAssignments(assignments: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

/**
 * バリアントを割り当て（重み付きランダム）
 */
function assignVariant(experiment: Experiment): string {
  const { variants, weights } = experiment;

  if (!weights || weights.length !== variants.length) {
    // 均等配分
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
  }

  // 重み付き配分
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < variants.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return variants[i];
    }
  }

  return variants[0];
}

/**
 * イベントを記録
 */
export function trackEvent(
  experimentId: string,
  variant: string,
  eventType: ABTestEvent['eventType'],
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  const event: ABTestEvent = {
    experimentId,
    variant,
    eventType,
    timestamp: Date.now(),
    metadata,
  };

  // ローカルストレージに保存
  try {
    const events = getEvents();
    events.push(event);
    // 最新1000件のみ保持
    const trimmedEvents = events.slice(-1000);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmedEvents));
  } catch {
    // ストレージがフルの場合は無視
  }

  // 将来的にはサーバーに送信
  // sendToServer(event);
}

/**
 * 保存されたイベントを取得
 */
function getEvents(): ABTestEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * コンバージョンを記録
 */
export function trackConversion(
  experimentId: string,
  metadata?: Record<string, unknown>
): void {
  const variant = getAssignment(experimentId);
  trackEvent(experimentId, variant, 'conversion', metadata);
}

/**
 * クリックを記録
 */
export function trackClick(
  experimentId: string,
  elementId?: string
): void {
  const variant = getAssignment(experimentId);
  trackEvent(experimentId, variant, 'click', { elementId });
}

/**
 * 実験統計を取得
 */
export function getExperimentStats(experimentId: string): Record<string, {
  views: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
}> {
  const events = getEvents();
  const experimentEvents = events.filter(e => e.experimentId === experimentId);

  const stats: Record<string, { views: number; clicks: number; conversions: number; conversionRate: number }> = {};

  for (const event of experimentEvents) {
    if (!stats[event.variant]) {
      stats[event.variant] = { views: 0, clicks: 0, conversions: 0, conversionRate: 0 };
    }

    switch (event.eventType) {
      case 'view':
        stats[event.variant].views++;
        break;
      case 'click':
        stats[event.variant].clicks++;
        break;
      case 'conversion':
        stats[event.variant].conversions++;
        break;
    }
  }

  // コンバージョン率を計算
  for (const variant in stats) {
    const { views, conversions } = stats[variant];
    stats[variant].conversionRate = views > 0 ? conversions / views : 0;
  }

  return stats;
}

/**
 * React Hook: A/Bテストバリアントを取得
 */
export function useExperiment(experimentId: string): {
  variant: string;
  trackClick: () => void;
  trackConversion: (metadata?: Record<string, unknown>) => void;
} {
  // SSR対応: クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return {
      variant: 'control',
      trackClick: () => {},
      trackConversion: () => {},
    };
  }

  const variant = getAssignment(experimentId);

  return {
    variant,
    trackClick: () => trackClick(experimentId),
    trackConversion: (metadata) => trackConversion(experimentId, metadata),
  };
}
