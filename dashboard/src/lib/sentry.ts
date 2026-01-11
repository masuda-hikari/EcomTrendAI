/**
 * Sentry連携モジュール
 *
 * 本番環境でのエラーモニタリング・パフォーマンス追跡を提供
 * SENTRY_DSNが設定されている場合のみ有効
 */

// Sentryの型定義（実際のSDK導入前の準備）
interface SentryBreadcrumb {
  category?: string;
  message?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, unknown>;
}

interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

interface SentryScope {
  setUser: (user: SentryUser | null) => void;
  setTag: (key: string, value: string) => void;
  setExtra: (key: string, value: unknown) => void;
  addBreadcrumb: (breadcrumb: SentryBreadcrumb) => void;
}

// Sentry初期化状態
let isInitialized = false;

/**
 * Sentryを初期化
 * 環境変数NEXT_PUBLIC_SENTRY_DSNが設定されている場合のみ有効
 */
export function initSentry(): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.info('[Sentry] DSN未設定のためスキップ');
    return;
  }

  // 本番環境でのみSentry有効化（開発時はconsole.errorで十分）
  if (process.env.NODE_ENV !== 'production') {
    console.info('[Sentry] 開発環境のためスキップ');
    return;
  }

  // Sentry SDKがロードされている場合のみ初期化
  // 実際のSDK導入時は @sentry/nextjs を使用
  console.info('[Sentry] 初期化準備完了。SDKインストール後に有効化');
  isInitialized = true;
}

/**
 * エラーをSentryに送信
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', error, context);
    return;
  }

  // Sentry DSN未設定の場合
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.error('[Error]', error, context);
    return;
  }

  // Sentry SDK導入後はここで Sentry.captureException を呼び出す
  console.error('[Sentry] captureException:', error.message, context);
}

/**
 * メッセージをSentryに送信
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  console.log('[Sentry] captureMessage:', message, level, context);
}

/**
 * ユーザー情報をSentryに設定
 */
export function setUser(user: SentryUser | null): void {
  if (process.env.NODE_ENV !== 'production') return;

  // Sentry SDK導入後はここで Sentry.setUser を呼び出す
  if (user) {
    console.log('[Sentry] setUser:', user.id);
  } else {
    console.log('[Sentry] clearUser');
  }
}

/**
 * タグを設定
 */
export function setTag(key: string, value: string): void {
  if (process.env.NODE_ENV !== 'production') return;
  console.log('[Sentry] setTag:', key, value);
}

/**
 * ブレッドクラムを追加（ユーザーアクションの追跡）
 */
export function addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
  if (process.env.NODE_ENV !== 'production') return;
  console.log('[Sentry] addBreadcrumb:', breadcrumb);
}

/**
 * トランザクション開始（パフォーマンスモニタリング）
 */
export function startTransaction(name: string, op: string): { finish: () => void } {
  const startTime = performance.now();

  return {
    finish: () => {
      const duration = performance.now() - startTime;
      if (process.env.NODE_ENV !== 'production') return;
      console.log('[Sentry] Transaction:', name, op, `${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Sentry初期化チェック
 */
export function isSentryEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production';
}
