/**
 * エラー境界コンポーネント
 *
 * Reactコンポーネントツリー内で発生した予期しないエラーをキャッチし、
 * フォールバックUIを表示。エラー情報はSentryに送信。
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { captureException, addBreadcrumb } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

/**
 * エラー境界コンポーネント
 *
 * 使用例:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // エラーIDを生成（サポート問い合わせ用）
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // ブレッドクラムを追加
    addBreadcrumb({
      category: 'error-boundary',
      message: `Component error: ${error.message}`,
      level: 'error',
      data: {
        componentStack: errorInfo.componentStack
      }
    });

    // Sentryにエラーを送信
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // カスタムエラーハンドラー呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // コンソールにも出力（開発時のデバッグ用）
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              予期しないエラーが発生しました
            </h2>

            <p className="text-gray-600 mb-4">
              申し訳ございません。問題が発生しました。
              <br />
              ページを再読み込みするか、しばらくしてからお試しください。
            </p>

            {this.state.errorId && (
              <p className="text-sm text-gray-500 mb-6">
                エラーID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                再試行
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                ページを再読み込み
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              問題が解決しない場合は、
              <Link
                href="/contact"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                お問い合わせ
              </Link>
              ください。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * シンプルなエラーフォールバックコンポーネント
 */
export function ErrorFallback({ message }: { message?: string }): JSX.Element {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">
          {message || 'コンポーネントの読み込みに失敗しました'}
        </span>
      </div>
    </div>
  );
}

export default ErrorBoundary;
