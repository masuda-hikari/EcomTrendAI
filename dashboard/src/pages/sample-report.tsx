import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import EmailCapture from '@/components/EmailCapture';
import ABTestCTA from '@/components/ABTestCTA';
import { useEffect } from 'react';
import { trackPageView, trackAffiliateClick } from '@/lib/tracking';


// サンプルトレンドデータ
const sampleTrends = [
  { rank: 1, name: 'ワイヤレスイヤホン Pro Max', category: '家電', rankChange: '+847', score: 98, price: '¥12,800' },
  { rank: 2, name: 'スマートウォッチ 2026', category: 'ウェアラブル', rankChange: '+623', score: 95, price: '¥24,800' },
  { rank: 3, name: '電動歯ブラシ セット', category: '生活用品', rankChange: '+512', score: 92, price: '¥8,900' },
  { rank: 4, name: 'LEDデスクライト', category: '家電', rankChange: '+489', score: 89, price: '¥4,980' },
  { rank: 5, name: 'ノートPCスタンド', category: 'PC周辺機器', rankChange: '+445', score: 87, price: '¥3,480' },
  { rank: 6, name: 'エコバッグ 大容量', category: '生活用品', rankChange: '+398', score: 85, price: '¥1,280' },
  { rank: 7, name: 'USBハブ 7ポート', category: 'PC周辺機器', rankChange: '+356', score: 82, price: '¥2,980' },
  { rank: 8, name: 'プロテイン チョコ味', category: '食品', rankChange: '+312', score: 80, price: '¥3,980' },
  { rank: 9, name: 'Bluetoothキーボード', category: 'PC周辺機器', rankChange: '+289', score: 78, price: '¥5,980' },
  { rank: 10, name: 'モバイルバッテリー 大容量', category: '家電', rankChange: '+267', score: 76, price: '¥4,280' },
];

// チャートコンポーネントを動的インポート（バンドルサイズ削減）
const RankChart = dynamic(() => import('@/components/SampleCharts').then(mod => mod.RankChart), {
  ssr: false,
  loading: () => <div className="bg-white rounded-xl shadow-sm p-6"><div className="h-48 bg-gray-100 animate-pulse rounded-lg" /></div>,
});
const CategoryChart = dynamic(() => import('@/components/SampleCharts').then(mod => mod.CategoryChart), {
  ssr: false,
  loading: () => <div className="bg-white rounded-xl shadow-sm p-6"><div className="h-48 bg-gray-100 animate-pulse rounded-lg" /></div>,
});

export default function SampleReport() {
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  // ページビュー追跡
  useEffect(() => {
    trackPageView('sample-report', { section: 'conversion' });
  }, []);

  // アフィリエイトクリック追跡ハンドラー
  const handleProductClick = (item: typeof sampleTrends[0]) => {
    trackAffiliateClick({
      asin: `SAMPLE${item.rank}`,
      productName: item.name,
      category: item.category,
      price: parseInt(item.price.replace(/[¥,]/g, '')),
      rank: item.rank,
      source: 'sample',
    });
  };

  return (
    <>
      <Head>
        <title>サンプルレポート - EcomTrendAI | トレンド分析例</title>
        <meta name="description" content="EcomTrendAIのサンプルトレンド分析レポート。実際のレポートでどのような情報が得られるかをご確認ください。" />
        <meta property="og:title" content="サンプルレポート - EcomTrendAI" />
        <meta property="og:description" content="AIによるEコマーストレンド分析のサンプルレポート" />
        <meta property="og:image" content="/api/og?title=トレンド分析レポート&subtitle=急上昇商品TOP10を確認&type=report" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="サンプルレポート - EcomTrendAI" />
        <meta name="twitter:description" content="AIによるEコマーストレンド分析のサンプルレポート" />
        <meta name="twitter:image" content="/api/og?title=トレンド分析レポート&subtitle=急上昇商品TOP10を確認&type=report" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* ヘッダーバナー */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>これはサンプルレポートです。</span>
            <Link href="/register" className="underline font-semibold hover:text-primary-200">
              無料登録して最新データを取得
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* レポートヘッダー */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Amazonトレンド分析レポート
                </h1>
                <p className="text-gray-600">
                  レポート生成日: {today}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-4">
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">10,234</div>
                    <div className="text-xs text-green-700">分析商品数</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-xs text-blue-700">急上昇検出</div>
                  </div>
                </div>
                {/* ソーシャルシェアボタン */}
                <SocialShare
                  title="Amazonトレンド分析レポート - EcomTrendAI"
                  description="AIがAmazonの急上昇商品を検出！せどり・EC事業者必見のトレンド分析。"
                />
              </div>
            </div>
          </div>

          {/* サマリー */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">最大上昇率</div>
                  <div className="text-2xl font-bold text-gray-900">+847位</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">注目カテゴリ</div>
                  <div className="text-2xl font-bold text-gray-900">家電</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">平均スコア</div>
                  <div className="text-2xl font-bold text-gray-900">86.2</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">平均価格帯</div>
                  <div className="text-2xl font-bold text-gray-900">¥7,346</div>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* トレンドリスト */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    急上昇商品 TOP 10
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ランク変動</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">スコア</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">価格</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sampleTrends.map((item) => (
                        <tr
                          key={item.rank}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleProductClick(item)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                              item.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.rank}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <span className="text-green-600 font-semibold">{item.rankChange}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${item.score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{item.score}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {item.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* ブラーオーバーレイ */}
                <div className="relative">
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"></div>
                  <div className="p-6 pt-16 text-center relative z-10">
                    <p className="text-gray-600 mb-4">続きを見るには無料登録が必要です</p>
                    {/* A/Bテスト対応CTA */}
                    <ABTestCTA href="/register" className="px-6 py-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* ランク推移グラフ（動的読み込み） */}
              <RankChart />

              {/* カテゴリ別（動的読み込み） */}
              <CategoryChart />

              {/* CTA */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-2">最新データを取得</h3>
                <p className="text-primary-100 text-sm mb-4">
                  毎日更新される最新トレンドデータにアクセス。リアルタイムアラートでチャンスを逃しません。
                </p>
                {/* A/Bテスト対応CTA */}
                <ABTestCTA href="/register" className="block w-full py-3" />
              </div>
            </div>
          </div>

          {/* メールキャプチャセクション */}
          <div className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                毎日のトレンドレポートを<br className="hidden sm:block" />無料で受け取りませんか？
              </h2>
              <p className="text-gray-600 mb-6">
                登録するだけで、毎朝8時に最新のトレンドレポートをお届け。
                急上昇商品の情報をいち早くキャッチして、ビジネスチャンスを逃しません。
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  毎朝8時に自動配信
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  急上昇TOP10を厳選してお届け
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  完全無料・いつでも解除可能
                </li>
              </ul>
            </div>
            <EmailCapture
              title="無料トレンドレポートに登録"
              description="メールアドレスを入力するだけで、毎日のトレンドレポートを受け取れます。"
              buttonText="無料で登録する"
            />
          </div>

          {/* 機能比較 */}
          <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">サンプルレポート vs 有料プラン</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">機能</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">サンプル</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Free</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-primary-600">Pro (¥980/月)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">商品データ</td>
                    <td className="px-4 py-3 text-center text-gray-500">サンプルのみ</td>
                    <td className="px-4 py-3 text-center text-gray-900">日次10件</td>
                    <td className="px-4 py-3 text-center text-primary-600 font-medium">日次100件</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">リアルタイム更新</td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-green-500">&#x2713;</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">カテゴリフィルタ</td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center text-gray-900">2カテゴリ</td>
                    <td className="px-4 py-3 text-center text-primary-600 font-medium">全カテゴリ</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">アラート通知</td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-green-500">&#x2713;</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">CSV/JSONエクスポート</td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-green-500">&#x2713;</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">API利用</td>
                    <td className="px-4 py-3 text-center"><span className="text-red-500">&#x2715;</span></td>
                    <td className="px-4 py-3 text-center text-gray-900">100回/日</td>
                    <td className="px-4 py-3 text-center text-primary-600 font-medium">1,000回/日</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center text-primary-600 font-medium hover:underline"
              >
                料金プラン詳細を見る
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
