/**
 * アップグレードプロンプトコンポーネント
 *
 * 無料ユーザーへのアップセル導線を表示
 */

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface UpgradePromptProps {
  /** 現在のプラン */
  currentPlan?: string;
  /** 表示バリアント */
  variant?: 'banner' | 'card' | 'modal' | 'inline';
  /** 強調する機能 */
  highlightFeature?: 'alerts' | 'export' | 'unlimited' | 'support';
  /** 閉じるボタンを表示するか */
  dismissible?: boolean;
  /** 閉じた時のコールバック */
  onDismiss?: () => void;
}

const FEATURE_HIGHLIGHTS: Record<string, {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
}> = {
  alerts: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'リアルタイムアラート',
    description: '急上昇商品を見逃しません。トレンドが動いたらすぐにお知らせ。',
    ctaText: 'アラートを有効にする',
  },
  export: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'データエクスポート',
    description: 'CSV/JSON形式でデータをダウンロード。自分のシステムで分析可能。',
    ctaText: 'エクスポート機能を解放',
  },
  unlimited: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: '無制限アクセス',
    description: '全カテゴリ・全商品データにアクセス。制限なしでビジネスを加速。',
    ctaText: '無制限プランにアップグレード',
  },
  support: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '優先サポート',
    description: '専任サポートが迅速に対応。ビジネスの課題を一緒に解決します。',
    ctaText: '優先サポートを利用する',
  },
};

export default function UpgradePrompt({
  currentPlan = 'free',
  variant = 'card',
  highlightFeature = 'alerts',
  dismissible = true,
  onDismiss,
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // ローカルストレージから非表示状態を確認
    const dismissedKey = `upgrade_prompt_dismissed_${highlightFeature}`;
    if (typeof window !== 'undefined') {
      const storedDismissed = localStorage.getItem(dismissedKey);
      if (storedDismissed === 'true') {
        setDismissed(true);
      }
    }
  }, [highlightFeature]);

  // 有料プランの場合は表示しない
  if (currentPlan !== 'free') {
    return null;
  }

  if (dismissed || !mounted) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    const dismissedKey = `upgrade_prompt_dismissed_${highlightFeature}`;
    localStorage.setItem(dismissedKey, 'true');
    onDismiss?.();
  };

  const feature = FEATURE_HIGHLIGHTS[highlightFeature];

  // バリアントに応じたスタイル
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-primary-200">{feature.icon}</span>
            <span className="font-medium">{feature.title}: {feature.description}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="bg-white text-primary-600 px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-primary-50 transition-colors"
            >
              Proにアップグレード
            </Link>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-primary-200 hover:text-white"
                aria-label="閉じる"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
        <span className="text-primary-600">{feature.icon}</span>
        <span>Proプランで{feature.title}を解放</span>
        <Link href="/pricing" className="font-medium hover:underline">
          詳細
        </Link>
      </div>
    );
  }

  // card variant (デフォルト)
  return (
    <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-xl p-6 relative">
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
          {feature.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
          >
            {feature.ctaText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 特典リスト */}
      <div className="mt-6 pt-4 border-t border-primary-100">
        <p className="text-xs text-gray-500 mb-2">Proプランに含まれる機能:</p>
        <ul className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <li className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            リアルタイムアラート
          </li>
          <li className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            全カテゴリ分析
          </li>
          <li className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            CSV/JSONエクスポート
          </li>
          <li className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            API 1000回/日
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * 使用量警告コンポーネント
 */
export function UsageWarning({
  used,
  limit,
  resourceName,
}: {
  used: number;
  limit: number;
  resourceName: string;
}) {
  const percentage = (used / limit) * 100;

  if (percentage < 80) return null;

  const isNearLimit = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`p-4 rounded-lg ${isAtLimit ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`${isAtLimit ? 'text-red-500' : 'text-yellow-500'}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${isAtLimit ? 'text-red-800' : 'text-yellow-800'}`}>
            {isAtLimit ? `${resourceName}の上限に達しました` : `${resourceName}の残りが少なくなっています`}
          </h4>
          <p className={`text-sm mt-1 ${isAtLimit ? 'text-red-600' : 'text-yellow-600'}`}>
            {used} / {limit} ({percentage.toFixed(0)}% 使用済み)
          </p>
          <Link
            href="/pricing"
            className={`inline-flex items-center gap-1 text-sm font-medium mt-2 ${isAtLimit ? 'text-red-700 hover:text-red-800' : 'text-yellow-700 hover:text-yellow-800'}`}
          >
            Proにアップグレードして上限を解除
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
