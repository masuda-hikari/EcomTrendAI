import { Plan } from '@/lib/api';

interface PricingCardProps {
  plan: Plan;
  isPopular?: boolean;
  onSelect: (planId: string) => void;
  currentPlan?: string;
}

export default function PricingCard({ plan, isPopular, onSelect, currentPlan }: PricingCardProps) {
  const isCurrent = currentPlan === plan.id;
  const isDowngrade = currentPlan === 'enterprise' && plan.id === 'pro';
  const isFree = plan.id === 'free';

  return (
    <div
      className={`card relative flex flex-col h-full ${
        isPopular ? 'border-2 border-primary-500 scale-105' : 'border border-gray-200'
      }`}
    >
      {/* 人気バッジ */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            人気
          </span>
        </div>
      )}

      {/* プラン名・価格 */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">
            {plan.price_jpy === 0 ? '無料' : `¥${plan.price_jpy.toLocaleString()}`}
          </span>
          {plan.price_jpy > 0 && <span className="text-gray-500 ml-1">/月</span>}
        </div>
      </div>

      {/* 機能リスト */}
      <ul className="space-y-3 mb-8 flex-grow">
        <li className="flex items-center text-gray-600">
          <CheckIcon />
          <span>
            日次レポート{' '}
            <strong>{plan.features.daily_reports === -1 ? '無制限' : `${plan.features.daily_reports}件`}</strong>
          </span>
        </li>
        <li className="flex items-center text-gray-600">
          <CheckIcon />
          <span>
            カテゴリ{' '}
            <strong>{plan.features.categories === -1 ? '全カテゴリ' : `${plan.features.categories}件`}</strong>
          </span>
        </li>
        <li className="flex items-center text-gray-600">
          <CheckIcon />
          <span>
            API呼び出し{' '}
            <strong>{plan.features.api_calls_per_day === -1 ? '無制限' : `${plan.features.api_calls_per_day}/日`}</strong>
          </span>
        </li>
        {plan.features.realtime_alerts && (
          <li className="flex items-center text-gray-600">
            <CheckIcon />
            <span>リアルタイムアラート</span>
          </li>
        )}
        {plan.features.custom_dashboard && (
          <li className="flex items-center text-gray-600">
            <CheckIcon />
            <span>カスタムダッシュボード</span>
          </li>
        )}
        {plan.features.export_formats.length > 0 && (
          <li className="flex items-center text-gray-600">
            <CheckIcon />
            <span>エクスポート: {plan.features.export_formats.join(', ')}</span>
          </li>
        )}
        <li className="flex items-center text-gray-600">
          <CheckIcon />
          <span>サポート: {plan.features.support_level}</span>
        </li>
      </ul>

      {/* ボタン */}
      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent || isDowngrade}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          isCurrent
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isDowngrade
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isPopular
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : isFree
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
        }`}
      >
        {isCurrent ? '現在のプラン' : isDowngrade ? 'ダウングレード不可' : isFree ? '無料で始める' : '選択する'}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
