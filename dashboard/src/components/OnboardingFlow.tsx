/**
 * ユーザーオンボーディングフロー
 *
 * 新規登録後のガイダンス・セットアップウィザード
 */

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { trackFeatureUse } from '@/lib/tracking';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  isCompleted: boolean;
}

interface OnboardingFlowProps {
  /** ユーザーのプラン */
  plan?: string;
  /** APIキーが取得済みか */
  hasApiKey?: boolean;
  /** 最初のAPI呼び出しを行ったか */
  hasFirstApiCall?: boolean;
  /** 完了時のコールバック */
  onComplete?: () => void;
}

export default function OnboardingFlow({
  plan = 'free',
  hasApiKey = false,
  hasFirstApiCall = false,
  onComplete,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // オンボーディング完了状態を確認
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('onboarding_completed');
      if (completed === 'true') {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('onboarding_completed', 'true');
    trackFeatureUse('onboarding_dismissed', { step: currentStep });
    onComplete?.();
  };

  const handleStepComplete = (stepId: string) => {
    trackFeatureUse('onboarding_step_complete', { step: stepId });
    setCurrentStep(prev => prev + 1);
  };

  if (dismissed || !mounted) {
    return null;
  }

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'EcomTrendAIへようこそ',
      description: 'AIを活用したトレンド分析で、ビジネスを加速させましょう。まずは基本的な使い方を確認しましょう。',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      action: {
        label: '始めましょう',
        onClick: () => handleStepComplete('welcome'),
      },
      isCompleted: currentStep > 0,
    },
    {
      id: 'api-key',
      title: 'APIキーを確認',
      description: hasApiKey
        ? 'APIキーは既に取得されています。ダッシュボードでいつでも確認できます。'
        : 'APIキーを取得して、プログラムからトレンドデータにアクセスしましょう。',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      action: {
        label: hasApiKey ? '次へ' : 'APIキーを取得',
        onClick: () => handleStepComplete('api-key'),
      },
      isCompleted: currentStep > 1 || hasApiKey,
    },
    {
      id: 'first-call',
      title: 'トレンドを確認',
      description: 'サンプルレポートで、どのようなデータが取得できるか確認しましょう。急上昇商品がひと目でわかります。',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      action: {
        label: 'サンプルレポートを見る',
        href: '/sample-report',
      },
      isCompleted: currentStep > 2 || hasFirstApiCall,
    },
    {
      id: 'upgrade',
      title: 'Proプランで更に活用',
      description: 'リアルタイムアラート、全カテゴリ分析、データエクスポートなど、Proプランでビジネスを加速させましょう。',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      action: {
        label: plan === 'free' ? 'プランを見る' : '完了',
        href: plan === 'free' ? '/pricing' : undefined,
        onClick: plan !== 'free' ? handleDismiss : undefined,
      },
      isCompleted: plan !== 'free',
    },
  ];

  const activeStep = steps[currentStep] || steps[steps.length - 1];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* 進捗バー */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* コンテンツ */}
        <div className="p-8">
          {/* ステップインジケーター */}
          <div className="flex justify-center mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                  index === currentStep
                    ? 'bg-primary-600'
                    : index < currentStep
                    ? 'bg-primary-300'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* アイコン */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
            {activeStep.icon}
          </div>

          {/* タイトル・説明 */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {activeStep.title}
          </h2>
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            {activeStep.description}
          </p>

          {/* アクションボタン */}
          <div className="flex flex-col gap-3">
            {activeStep.action.href ? (
              <Link
                href={activeStep.action.href}
                onClick={() => handleStepComplete(activeStep.id)}
                className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition-colors"
              >
                {activeStep.action.label}
              </Link>
            ) : (
              <button
                onClick={activeStep.action.onClick}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {activeStep.action.label}
              </button>
            )}

            {/* スキップボタン */}
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                スキップして後で設定
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * オンボーディングチェックリスト（サイドバー用）
 */
export function OnboardingChecklist({
  hasApiKey = false,
  hasFirstApiCall = false,
  plan = 'free',
}: {
  hasApiKey?: boolean;
  hasFirstApiCall?: boolean;
  plan?: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('onboarding_checklist_dismissed');
      if (completed === 'true') {
        setDismissed(true);
      }
    }
  }, []);

  if (dismissed) return null;

  const tasks = [
    { id: 'register', label: 'アカウント登録', completed: true },
    { id: 'api-key', label: 'APIキー取得', completed: hasApiKey },
    { id: 'first-call', label: '初回データ取得', completed: hasFirstApiCall },
    { id: 'upgrade', label: 'プロプランへアップグレード', completed: plan !== 'free' },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  if (completedCount === tasks.length) {
    // 全て完了したら非表示
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm">セットアップを完了</h3>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem('onboarding_checklist_dismissed', 'true');
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 進捗バー */}
      <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mb-3">{completedCount}/{tasks.length} 完了</p>

      {/* タスクリスト */}
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            {task.completed ? (
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <div className="w-4 h-4 border-2 border-gray-300 rounded shrink-0" />
            )}
            <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
              {task.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 初回訪問時のウェルカムトースト
 */
export function WelcomeToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('welcome_toast_shown');
      if (!shown) {
        setVisible(true);
        sessionStorage.setItem('welcome_toast_shown', 'true');
        // 5秒後に自動で消える
        setTimeout(() => setVisible(false), 5000);
      }
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">ようこそ！</h4>
          <p className="text-sm text-gray-600">
            EcomTrendAIへのご登録ありがとうございます。早速トレンドを確認してみましょう。
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
