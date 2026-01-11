import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ABTestCTA from '@/components/ABTestCTA';
import { trackPageView } from '@/lib/tracking';

// デモ用のトレンドデータ（リアルな商品データを模倣）
const DEMO_TRENDS = [
  {
    asin: 'B0DEMO001',
    name: 'ワイヤレスイヤホン Pro Max 2026',
    category: '家電・カメラ',
    current_rank: 3,
    previous_rank: 28,
    rank_change: 25,
    rank_change_percent: 89.3,
    price: 12800,
    review_count: 1247,
    rating: 4.5,
    trend_score: 95,
  },
  {
    asin: 'B0DEMO002',
    name: 'スマートウォッチ フィットネス対応',
    category: '家電・カメラ',
    current_rank: 7,
    previous_rank: 45,
    rank_change: 38,
    rank_change_percent: 84.4,
    price: 8900,
    review_count: 892,
    rating: 4.3,
    trend_score: 92,
  },
  {
    asin: 'B0DEMO003',
    name: '美顔器 RF温冷美容 多機能',
    category: 'ビューティー',
    current_rank: 12,
    previous_rank: 67,
    rank_change: 55,
    rank_change_percent: 82.1,
    price: 15800,
    review_count: 634,
    rating: 4.4,
    trend_score: 88,
  },
  {
    asin: 'B0DEMO004',
    name: 'プロテイン ホエイ チョコレート味 1kg',
    category: '食品・飲料',
    current_rank: 5,
    previous_rank: 23,
    rank_change: 18,
    rank_change_percent: 78.3,
    price: 3980,
    review_count: 2341,
    rating: 4.6,
    trend_score: 85,
  },
  {
    asin: 'B0DEMO005',
    name: 'ゲーミングマウス 軽量 無線',
    category: 'パソコン・周辺機器',
    current_rank: 15,
    previous_rank: 52,
    rank_change: 37,
    rank_change_percent: 71.2,
    price: 6800,
    review_count: 458,
    rating: 4.2,
    trend_score: 82,
  },
  {
    asin: 'B0DEMO006',
    name: 'ヨガマット 厚さ10mm 滑り止め付き',
    category: 'スポーツ&アウトドア',
    current_rank: 8,
    previous_rank: 31,
    rank_change: 23,
    rank_change_percent: 74.2,
    price: 2480,
    review_count: 1567,
    rating: 4.7,
    trend_score: 80,
  },
  {
    asin: 'B0DEMO007',
    name: '電動歯ブラシ 音波振動 充電式',
    category: 'ホーム&キッチン',
    current_rank: 22,
    previous_rank: 78,
    rank_change: 56,
    rank_change_percent: 71.8,
    price: 4980,
    review_count: 723,
    rating: 4.4,
    trend_score: 78,
  },
  {
    asin: 'B0DEMO008',
    name: 'モバイルバッテリー 20000mAh PD対応',
    category: '家電・カメラ',
    current_rank: 11,
    previous_rank: 38,
    rank_change: 27,
    rank_change_percent: 71.1,
    price: 3280,
    review_count: 1892,
    rating: 4.5,
    trend_score: 76,
  },
];

// カテゴリ別集計
const CATEGORY_STATS = [
  { category: '家電・カメラ', count: 156, avgChange: 45.2 },
  { category: 'ビューティー', count: 89, avgChange: 38.7 },
  { category: '食品・飲料', count: 134, avgChange: 32.5 },
  { category: 'パソコン・周辺機器', count: 78, avgChange: 41.3 },
  { category: 'スポーツ&アウトドア', count: 67, avgChange: 35.8 },
];

export default function Demo() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank_change' | 'trend_score' | 'price'>('trend_score');

  // ページビュー追跡
  useEffect(() => {
    trackPageView('demo', { section: 'demo-dashboard' });
  }, []);

  // フィルタリング・ソート
  const filteredTrends = DEMO_TRENDS
    .filter((t) => selectedCategory === 'all' || t.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'rank_change') return b.rank_change - a.rank_change;
      if (sortBy === 'trend_score') return b.trend_score - a.trend_score;
      if (sortBy === 'price') return b.price - a.price;
      return 0;
    });

  // 現在時刻（デモ用）
  const now = new Date();
  const timeString = now.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <Head>
        <title>デモダッシュボード - EcomTrendAI | 無料でトレンド分析を体験</title>
        <meta
          name="description"
          content="EcomTrendAIのデモダッシュボードで、AIによるEコマーストレンド分析を無料体験。登録不要で今すぐお試しいただけます。"
        />
      </Head>

      <Header />

      {/* デモバナー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base">
          🎯 <strong>デモモード</strong>で体験中｜
          <Link href="/register" className="underline font-semibold hover:text-blue-100">
            無料アカウント登録
          </Link>
          でリアルタイムデータにアクセス
        </p>
      </div>

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  トレンドダッシュボード
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    デモ
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">最終更新: {timeString}</p>
              </div>

              {/* フィルター */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  aria-label="カテゴリフィルター"
                >
                  <option value="all">全カテゴリ</option>
                  {CATEGORY_STATS.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  aria-label="ソート順"
                >
                  <option value="trend_score">トレンドスコア順</option>
                  <option value="rank_change">ランク上昇順</option>
                  <option value="price">価格順</option>
                </select>
              </div>
            </div>
          </div>

          {/* サマリーカード */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">トレンド商品数</p>
              <p className="text-2xl font-bold text-gray-900">{DEMO_TRENDS.length}</p>
              <p className="text-xs text-green-600">+12% vs 昨日</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">平均ランク上昇</p>
              <p className="text-2xl font-bold text-gray-900">+34.6</p>
              <p className="text-xs text-green-600">好調</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">最高トレンドスコア</p>
              <p className="text-2xl font-bold text-primary-600">95</p>
              <p className="text-xs text-gray-500">家電・カメラ</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">分析カテゴリ</p>
              <p className="text-2xl font-bold text-gray-900">{CATEGORY_STATS.length}</p>
              <p className="text-xs text-gray-500">Free: 2カテゴリ制限</p>
            </div>
          </div>

          {/* トレンドテーブル */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🔥 急上昇トレンド商品</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">商品名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">カテゴリ</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">ランク</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">変動</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">スコア</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">価格</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">評価</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTrends.map((trend, index) => (
                    <tr key={trend.asin} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{trend.name}</p>
                            <p className="text-xs text-gray-500">{trend.asin}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {trend.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-medium text-gray-900">
                          #{trend.current_rank}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">← #{trend.previous_rank}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-semibold bg-green-100 text-green-800">
                          ↑{trend.rank_change}
                        </span>
                        <br />
                        <span className="text-xs text-green-600">+{trend.rank_change_percent.toFixed(1)}%</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${trend.trend_score}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-primary-600">{trend.trend_score}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-900">
                        ¥{trend.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{trend.rating}</span>
                          <span className="text-xs text-gray-400">({trend.review_count.toLocaleString()})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 制限表示 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                📊 <strong>デモでは8件まで表示</strong>｜Proプランなら
                <strong className="text-primary-600">無制限</strong>でアクセス可能
              </p>
            </div>
          </div>

          {/* カテゴリ別トレンド */}
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📈 カテゴリ別トレンド</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORY_STATS.map((cat) => (
                  <div
                    key={cat.category}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    <h3 className="font-medium text-gray-900">{cat.category}</h3>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">{cat.count}商品</span>
                      <span className="text-green-600 font-medium">+{cat.avgChange.toFixed(1)}%平均</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              リアルタイムデータで<br className="md:hidden" />
              収益を最大化しませんか？
            </h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              デモで見たのは一部の機能だけ。無料アカウントを作成して、
              リアルタイムのトレンドデータ、アラート機能、API連携などをお試しください。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ABTestCTA
                experimentId="demo-page-cta"
                href="/register"
                className="!bg-white !text-primary-600 hover:!bg-primary-50"
              />
              <Link
                href="/pricing"
                className="text-white underline hover:text-primary-100 font-medium"
              >
                料金プランを見る
              </Link>
            </div>

            <p className="mt-6 text-sm text-primary-200">
              ✓ クレジットカード不要 ✓ 30秒で登録完了 ✓ いつでもキャンセル可能
            </p>
          </div>

          {/* 機能比較 */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
              デモ版と有料プランの違い
            </h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">機能</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">デモ</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Free</th>
                    <th className="text-center py-3 px-4 text-sm font-medium bg-primary-50 text-primary-700">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-6 text-gray-900">トレンドデータ更新</td>
                    <td className="py-3 px-4 text-center text-gray-400">静的データ</td>
                    <td className="py-3 px-4 text-center">日次</td>
                    <td className="py-3 px-4 text-center bg-primary-50 font-medium text-primary-700">リアルタイム</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 text-gray-900">カテゴリ数</td>
                    <td className="py-3 px-4 text-center text-gray-400">5</td>
                    <td className="py-3 px-4 text-center">2</td>
                    <td className="py-3 px-4 text-center bg-primary-50 font-medium text-primary-700">無制限</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 text-gray-900">商品数</td>
                    <td className="py-3 px-4 text-center text-gray-400">8</td>
                    <td className="py-3 px-4 text-center">10/日</td>
                    <td className="py-3 px-4 text-center bg-primary-50 font-medium text-primary-700">100/日</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 text-gray-900">アラート通知</td>
                    <td className="py-3 px-4 text-center text-gray-400">✕</td>
                    <td className="py-3 px-4 text-center text-gray-400">✕</td>
                    <td className="py-3 px-4 text-center bg-primary-50 font-medium text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 text-gray-900">API連携</td>
                    <td className="py-3 px-4 text-center text-gray-400">✕</td>
                    <td className="py-3 px-4 text-center">100回/日</td>
                    <td className="py-3 px-4 text-center bg-primary-50 font-medium text-primary-700">無制限</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 text-gray-900">データエクスポート</td>
                    <td className="py-3 px-4 text-center text-gray-400">✕</td>
                    <td className="py-3 px-4 text-center text-gray-400">✕</td>
                    <td className="py-3 px-4 text-center bg-primary-50 font-medium text-green-600">CSV/JSON</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
