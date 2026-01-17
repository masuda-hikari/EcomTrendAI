import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCard from '@/components/PricingCard';
import { api, auth, Plan } from '@/lib/api';

// デフォルトプランデータ（API取得失敗時のフォールバック）
const defaultPlans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price_jpy: 0,
    features: {
      daily_reports: 10,
      categories: 2,
      api_calls_per_day: 100,
      realtime_alerts: false,
      custom_dashboard: false,
      export_formats: [],
      support_level: 'community',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price_jpy: 980,
    features: {
      daily_reports: 100,
      categories: -1, // 全カテゴリ
      api_calls_per_day: 1000,
      realtime_alerts: true,
      custom_dashboard: false,
      export_formats: ['csv', 'json'],
      support_level: 'email',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_jpy: 4980,
    features: {
      daily_reports: -1, // 無制限
      categories: -1,
      api_calls_per_day: -1,
      realtime_alerts: true,
      custom_dashboard: true,
      export_formats: ['csv', 'json', 'xlsx'],
      support_level: 'priority',
    },
  },
];

export default function Pricing() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // プラン情報を取得
    const fetchPlans = async () => {
      const result = await api.getPlans();
      if (result.success && result.data) {
        setPlans(result.data.plans);
      }
    };

    // ログイン済みの場合は現在のプランを取得
    const fetchCurrentPlan = async () => {
      if (auth.isAuthenticated()) {
        const result = await api.getCurrentUser();
        if (result.success && result.data) {
          setCurrentPlan(result.data.plan);
        }
      }
    };

    fetchPlans();
    fetchCurrentPlan();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      // Freeプランは登録ページへ
      router.push('/register');
      return;
    }

    if (!auth.isAuthenticated()) {
      // 未ログインの場合は登録ページへ
      router.push('/register');
      return;
    }

    // アップグレード処理
    setLoading(true);
    const result = await api.upgradePlan(planId);

    if (result.success && result.data?.checkout_url) {
      // Stripeチェックアウトページへリダイレクト
      window.location.href = result.data.checkout_url;
    } else {
      alert(result.error || 'アップグレードに失敗しました');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>料金プラン - EcomTrendAI</title>
        <meta name="description" content="EcomTrendAIの料金プラン。無料プランから始めて、ビジネスの成長に合わせてアップグレード。" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">シンプルな料金プラン</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              無料プランから始めて、ビジネスの成長に合わせてアップグレードできます。
            </p>
          </div>

          {/* プランカード */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isPopular={plan.id === 'pro'}
                onSelect={handleSelectPlan}
                currentPlan={currentPlan || undefined}
              />
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">よくある質問</h2>

            <div className="space-y-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-2">無料プランの制限は？</h3>
                <p className="text-gray-600">
                  無料プランでは、日次レポート10件まで、2カテゴリまで、API呼び出し100回/日までの制限があります。
                  基本的な機能をお試しいただくには十分な内容です。
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-2">プランの変更はいつでもできますか？</h3>
                <p className="text-gray-600">
                  はい、いつでもアップグレードできます。アップグレード時は日割り計算されます。
                  ダウングレードは次回更新時から適用されます。
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-2">支払い方法は？</h3>
                <p className="text-gray-600">
                  クレジットカード（Visa, Mastercard, American Express, JCB）でのお支払いに対応しています。
                  Stripeによる安全な決済処理を行っています。
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-2">返金ポリシーは？</h3>
                <p className="text-gray-600">
                  お支払いから14日以内であれば、全額返金いたします。
                  サポートまでお問い合わせください。
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-2">Enterpriseプランのカスタム機能とは？</h3>
                <p className="text-gray-600">
                  専用のダッシュボードUI、カスタムレポート、優先サポート、SLA対応などが含まれます。
                  詳細はお問い合わせください。
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <p className="text-gray-600 mb-4">ご質問がありますか？</p>
            <Link href="/contact" className="text-primary-600 hover:underline font-medium">
              お問い合わせはこちら &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* ローディングオーバーレイ */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">決済ページに移動中...</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
